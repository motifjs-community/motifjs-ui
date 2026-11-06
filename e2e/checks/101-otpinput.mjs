import { designLanguages, designLanguageThemes } from '../languages.mjs';

/** Real-browser checks of the one-time code page: real keys, a real paste, and every language. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'otpinput', { waitUntil: 'load' });
    const field = page.locator('.otp-basic');
    await field.waitFor();
    const input = field.locator('input');
    const value = page.locator('.otp-value');
    const told = page.locator('.otp-told');
    const active = () => field.locator('.mx-otp-input__cell').evaluateAll(cells => cells.findIndex(c => c.hasAttribute('data-active')));
    const chars = () => field.locator('.mx-otp-input__char').allTextContents();

    check('the label names the input', (await page.getByLabel('Verification code', { exact: true }).count()) === 1);
    check('the input asks for a one-time code', (await input.getAttribute('autocomplete')) === 'one-time-code' && (await input.getAttribute('inputmode')) === 'numeric');

    // Typing moves through the boxes.
    await input.click();
    check('a press on the row puts the caret in the first empty box', (await active()) === 0);
    await page.keyboard.type('12');
    check('typed characters fill the boxes', (await chars()).join('') === '12' && (await active()) === 2);
    await page.keyboard.type('x-');
    check('other characters are left out', (await chars()).join('') === '12');

    // Backspace, the arrows and overwriting.
    await page.keyboard.press('Backspace');
    check('Backspace goes back', (await chars()).join('') === '1' && (await active()) === 1);
    await page.keyboard.type('234');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    check('the arrow keys move the caret', (await active()) === 2);
    await page.keyboard.type('9');
    check('a character in a filled box takes its place', (await chars()).join('') === '1294' && (await active()) === 3);
    await page.keyboard.press('Home');
    await page.waitForTimeout(40);
    check('Home goes to the first box', (await active()) === 0);
    await page.keyboard.press('End');
    await page.waitForTimeout(40);
    check('End goes to the last character', (await active()) === 4);

    // Completing tells the code once.
    await page.keyboard.type('56');
    check('completing reports the code', (await told.textContent()).includes('129456'));
    check('x-model follows', (await value.textContent()).includes('129456'));
    await page.keyboard.press('Backspace');
    check('a removed character empties the last box', (await chars()).join('') === '12945');

    // A real paste, with a separator in it.
    await input.evaluate(el => {
        el.focus();
        el.select();
        document.execCommand('insertText', false, '987-654');
    });
    check('a pasted code loses its separator', (await chars()).join('') === '987654');
    check('a pasted code completes', (await told.textContent()).includes('987654'));

    // Pressing a box.
    const pressCell = async (index) => {
        const spot = await field.locator('.mx-otp-input__cell').nth(index).boundingBox();
        await page.mouse.click(spot.x + spot.width / 2, spot.y + spot.height / 2);
        await page.waitForTimeout(40);
    };
    await pressCell(3);
    check('a press puts the caret in that box', (await active()) === 3);
    await input.fill('12');
    await pressCell(5);
    check('but not beyond the characters', (await active()) === 2);

    // One Tab stop.
    await input.focus();
    await page.keyboard.press('Tab');
    check('one Tab stop', await page.evaluate(() => !document.activeElement.closest('.otp-basic')));

    // Formats.
    const key = page.locator('.otp-key');
    await key.locator('input').click();
    await page.keyboard.type('ab12cd34');
    check('capitals and letters', (await key.locator('input').inputValue()) === 'AB12CD34');
    check('one separator between two groups', (await key.locator('.mx-otp-input__separator').count()) === 1);
    const pin = page.locator('.otp-pin');
    await pin.locator('input').click();
    await page.keyboard.type('1234');
    check('a masked PIN draws marks', (await pin.locator('.mx-otp-input__char').allTextContents()).join('') === '••••');
    const hex = page.locator('.otp-hex');
    await hex.locator('input').click();
    await page.keyboard.type('fz0a');
    check('a pattern of its own', (await hex.locator('input').inputValue()) === 'F0A');

    // Validation.
    const valid = page.locator('.otp-valid');
    await valid.locator('input').click();
    await page.keyboard.type('12');
    await page.getByRole('button', { name: 'Verify', exact: true }).click();
    await page.waitForTimeout(80);
    check('an incomplete code fails', (await valid.locator('.mx-field__message').textContent()).includes('4'), await valid.textContent());
    check('the input says it is invalid', (await valid.locator('input').getAttribute('aria-invalid')) === 'true');

    // The pointer over a field does not hide an error, or the box of the caret.
    const borderOf = (locator) => locator.evaluate(el => getComputedStyle(el).borderTopColor);
    const validCell = valid.locator('.mx-otp-input__cell').first();
    await page.waitForTimeout(250);
    const red = await borderOf(validCell);
    const over = async (locator) => {
        const place = await locator.boundingBox();
        await page.mouse.move(place.x + place.width / 2, place.y + place.height / 2);
        await page.waitForTimeout(250);
    };
    await validCell.scrollIntoViewIfNeeded();
    await over(validCell);
    check('the pointer keeps the error color', (await borderOf(validCell)) === red, red);
    await input.click();
    const spot = field.locator('.mx-otp-input__cell[data-active]');
    await page.waitForTimeout(250);
    const lit = await borderOf(spot);
    await over(spot);
    check('the pointer keeps the box of the caret', (await borderOf(spot)) === lit, lit);
    const ring = await input.evaluate(el => getComputedStyle(el).boxShadow);
    check('no ring around the whole row', ring === 'none', ring);

    // Read-only and disabled: the keys do nothing.
    const readonly = page.locator('.otp-readonly');
    await readonly.locator('input').click();
    await page.keyboard.type('9');
    check('a read-only field keeps its value', (await readonly.locator('input').inputValue()) === '1234');
    check('a disabled field cannot be reached', await page.locator('.otp-disabled input').isDisabled());

    // Right to left: a code still reads from the left.
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
    await page.waitForTimeout(100);
    const order = await field.locator('.mx-otp-input__cell').evaluateAll(cells => cells[0].getBoundingClientRect().left < cells[1].getBoundingClientRect().left);
    check('right to left, the code still runs from the left', order);
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));

    // Narrow: the boxes shrink, and the field does not widen the page.
    const wide = await page.evaluate(async () => {
        const row = document.querySelector('.otp-basic');
        row.style.inlineSize = '220px';
        await new Promise(resolve => setTimeout(resolve, 80));
        const cells = row.querySelector('.mx-otp-input__cells').getBoundingClientRect();
        const out = { row: row.getBoundingClientRect().width, cells: cells.width };
        row.style.inlineSize = '';
        return out;
    });
    check('the boxes fit a narrow field', wide.cells <= wide.row + 0.5, JSON.stringify(wide));

    for (const language of designLanguages) {
        const result = await page.evaluate(async (language) => {
            document.documentElement.setAttribute('data-design-language', language);
            await new Promise(resolve => setTimeout(resolve, 200));
            const row = document.querySelector('.otp-basic .mx-otp-input__cells');
            const cells = [...row.querySelectorAll('.mx-otp-input__cell')].map(c => c.getBoundingClientRect());
            const input = document.querySelector('.otp-basic input').getBoundingClientRect();
            const box = row.getBoundingClientRect();
            const char = document.querySelector('.otp-basic .mx-otp-input__char');
            const cell = char.parentElement.getBoundingClientRect();
            const c = char.getBoundingClientRect();
            const gaps = cells.slice(1).map((b, i) => Math.round((b.left - cells[i].right) * 2) / 2);
            return {
                equal: new Set(cells.map(b => `${b.width}x${b.height}`)).size === 1,
                width: cells[0].width,
                gaps: new Set(gaps).size,
                cover: Math.abs(input.width - box.width) <= 1 && Math.abs(input.height - box.height) <= 1,
                offX: Math.abs(c.left + c.width / 2 - (cell.left + cell.width / 2)),
                offY: Math.abs(c.top + c.height / 2 - (cell.top + cell.height / 2)),
            };
        }, language);
        check(`${language}: the boxes are the same size and evenly spaced`, result.equal && result.gaps === 1, JSON.stringify(result));
        check(`${language}: a box has room for a character`, result.width >= 32, JSON.stringify(result));
        check(`${language}: the input covers the boxes`, result.cover, JSON.stringify(result));
        check(`${language}: a character is centered in its box`, result.offX <= 0.75 && result.offY <= 1, JSON.stringify(result));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-design-language'));

    await page.addScriptTag({ content: axeSource });
    for (const language of designLanguages) {
        for (const theme of designLanguageThemes[language].themes) {
            await page.evaluate(async ([language, theme]) => {
                document.documentElement.setAttribute('data-design-language', language);
                document.documentElement.setAttribute('data-theme', theme);
                await new Promise(resolve => setTimeout(resolve, 220));
            }, [language, theme]);
            const low = await page.evaluate(async () => {
                const results = await window.axe.run({ include: [['.docs-article .otp-small'], ['.docs-article .otp-large'], ['.docs-article .otp-readonly']] }, { runOnly: ['color-contrast'] });
                return results.violations.flatMap(v => v.nodes.map(n => `${n.target[0]} ${n.any[0]?.data?.contrastRatio ?? ''}`));
            });
            check(`${language} ${theme}: the text can be read`, low.length === 0, low.slice(0, 3).join(' | '));
        }
    }
    await page.evaluate(() => {
        document.documentElement.removeAttribute('data-design-language');
        document.documentElement.removeAttribute('data-theme');
    });
    await page.waitForTimeout(350);
    const violations = await page.evaluate(async () => (await window.axe.run('.docs-article')).violations.map(v => `${v.id}: ${v.nodes.length}`));
    check('axe clean', violations.length === 0, violations.join(', '));
}
