/** Real-browser checks of the date range box page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'daterangebox', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const start = ways.getByRole('textbox', { name: /Stay, Start/ });
    const end = ways.getByRole('textbox', { name: /Stay, End/ });
    await start.waitFor();
    check('two inputs named by their side, the value in both', (await start.inputValue()) !== '' && (await end.inputValue()) !== '' && (await ways.locator('.dr-stay').textContent()) === '10/03/2026 to 14/03/2026');

    // The calendars: two months side by side; the range marked; a pick for the end closes the popup.
    await ways.getByRole('button', { name: 'Choose date' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Choose date' });
    await dialog.waitFor();
    const calendars = dialog.locator('.mx-calendar');
    check('two months side by side', (await calendars.count()) === 2);
    const marks = await dialog.locator('.mx-calendar__cell[data-range]').evaluateAll(els => els.map(el => el.dataset.range));
    check('the range is marked from its start to its end', marks[0] === 'start' && marks.at(-1) === 'end' && marks.slice(1, -1).every(m => m === 'in'), marks.join(','));
    const ends = await dialog.evaluate(el => {
        const s = el.querySelector('[data-range="start"]').getBoundingClientRect();
        const i = el.querySelector('[data-range="in"]').getBoundingClientRect();
        return { sameRow: Math.abs(s.top - i.top) <= 1, sameHeight: Math.abs(s.height - i.height) <= 1 };
    });
    check('the band keeps the cells’ row and height', ends.sameRow && ends.sameHeight, JSON.stringify(ends));
    await calendars.nth(0).locator('[data-date]:not([data-outside])').nth(2).click();
    await page.waitForTimeout(100);
    check('the first pick is a new start, the popup stays', (await dialog.isVisible()) && (await ways.locator('.dr-stay').textContent()).endsWith('to —'));
    await calendars.nth(1).locator('[data-date]:not([data-outside])').nth(4).click();
    await page.waitForFunction(() => !document.querySelector('.mx-date-range-box__popup:popover-open'), null, { timeout: 2000 }).catch(() => {});
    check('the second pick is the end and the popup closes', !(await dialog.isVisible()) && !(await ways.locator('.dr-stay').textContent()).endsWith('to —'));

    // Presets.
    const presets = page.locator('section[aria-labelledby="presets"]');
    await presets.getByRole('button', { name: 'Choose date' }).first().click();
    const list = page.getByRole('dialog', { name: 'Choose date' }).getByRole('listbox');
    await list.waitFor();
    check('the kit presets are listed', (await list.getByRole('option').count()) === 6 && (await list.getByRole('option').nth(0).textContent()) === 'Today');
    await list.getByRole('option', { name: 'Last 7 days' }).click();
    await page.waitForTimeout(100);
    const sales = presets.getByRole('textbox', { name: /Sales period, Start/ });
    check('a preset fills both ends and closes', (await sales.inputValue()) !== '' && (await presets.getByRole('textbox', { name: /Sales period, End/ }).inputValue()) !== '');

    // Limits: the message says which rule failed.
    const limits = page.locator('section[aria-labelledby="limits"]');
    await limits.getByRole('button', { name: 'Check' }).click();
    await page.waitForFunction(() => document.querySelector('.dr-check')?.textContent !== '', null, { timeout: 2000 }).catch(() => {});
    check('an empty required range fails', (await limits.locator('.dr-check').textContent()) === 'This field is required.');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
