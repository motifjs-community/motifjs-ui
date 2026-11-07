/** Real-browser checks of the validation summary page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'validationsummary', { waitUntil: 'load' });
    const summary = page.locator('.vs-form');
    await summary.waitFor({ state: 'attached' });
    check('out of sight while nothing has failed', (await summary.isHidden()) && (await summary.getAttribute('data-empty')) === '');

    // Save with everything empty: three lines, the header, the live region; a press on a line focuses its field.
    await page.locator('.vs-save').click();
    await page.waitForTimeout(300);
    const lines = summary.locator('.mx-validation-summary__item');
    const texts = await lines.allTextContents();
    check('after Save the three failed fields are listed with their labels and messages', (await summary.isVisible()) && texts.length === 3 && texts.every(t => /^(Name|E-mail|Guests): .+/.test(t)), texts.join(' | '));
    check('the header and the live region', (await summary.locator('.mx-validation-summary__header-text').textContent()) === 'Please correct the following' && (await summary.getAttribute('aria-live')) === 'polite');
    await lines.nth(1).click();
    check('a press on the E-mail line puts the focus in the E-mail box', await page.evaluate(() => (document.activeElement?.closest('.mx-field')?.querySelector('.mx-field__label')?.textContent ?? '').startsWith('E-mail')), await page.evaluate(() => document.activeElement?.closest('.mx-field')?.querySelector('.mx-field__label')?.textContent));
    await page.keyboard.type('not an address');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const texts2 = await lines.allTextContents();
    check('a wrong e-mail keeps its line, with the e-mail message now', texts2.length === 3 && texts2[1].startsWith('E-mail:') && texts2[1] !== texts[1], texts2[1]);
    await lines.nth(1).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('a@b.co');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    check('a field that passes leaves the list', (await lines.allTextContents()).length === 2);
    // Fields that change while a line has focus: the line keeps it; a line that goes hands it to the next one.
    const write = (name, value) => page.getByRole('textbox', { name }).evaluate((input, v) => {
        input.value = v;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await lines.nth(1).focus();
    const before = await page.evaluate(() => (window.__line = document.activeElement).textContent ?? '');
    await write('E-mail', 'not an address');
    await page.waitForTimeout(300);
    const kept = await page.evaluate(() => ({ same: document.activeElement === window.__line, lines: [...document.querySelectorAll('.vs-form .mx-validation-summary__item')].map(b => b.textContent.split(':')[0]) }));
    check('a line keeps its focus while another field fails', before.startsWith('Guests:') && kept.same && kept.lines.join() === 'Name,E-mail,Guests', JSON.stringify({ before, ...kept }));
    await lines.nth(0).focus();
    await write('Name', 'Ada');
    await page.waitForTimeout(300);
    const next = await page.evaluate(() => document.activeElement?.textContent ?? '');
    check('the focused line that goes hands focus to the next line', next.startsWith('E-mail:'), next);
    // Leaving a field checks it on its own: the focus goes out first, then the form starts again.
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);
    await page.locator('.vs-reset').click();
    await page.waitForTimeout(300);
    check('Start again empties the list and hides the summary', (await summary.isHidden()), await lines.allTextContents().then(t => t.join(' | ')));

    // Programmatic: a header of its own, switched off; the lines tell which was pressed.
    const coded = page.locator('.vs-coded .mx-validation-summary');
    await page.locator('.vs-coded-check').scrollIntoViewIfNeeded();
    await page.locator('.vs-coded-check').click();
    await page.waitForTimeout(300);
    check('its own header, and the count', (await coded.locator('.mx-validation-summary__header-text').textContent()) === 'Before you send it' && (await page.locator('.vs-coded-told').textContent()) === '2 failed');
    await coded.locator('.mx-validation-summary__item').nth(1).click();
    check('the line pressed is told', (await page.locator('.vs-coded-told').textContent()).startsWith('2 failed, pressed: Town:'));
    await page.getByRole('button', { name: 'Header on and off' }).click();
    await page.waitForTimeout(200);
    check('the header can be switched off', await coded.locator('.mx-validation-summary__header').isHidden());

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
