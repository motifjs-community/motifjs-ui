/** Real-browser checks of the speed dial page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'speeddial', { waitUntil: 'load' });
    const up = page.locator('.sd-up');
    await up.waitFor();
    const main = up.locator('.mx-speed-dial__main');
    const fan = up.locator('.mx-speed-dial__fan');
    const told = page.locator('.sd-told');
    check('a main button that opens a menu, named New', (await main.getAttribute('aria-haspopup')) === 'menu' && (await main.getAttribute('aria-expanded')) === 'false' && (await main.getAttribute('aria-label')) === 'New' && (await fan.getAttribute('role')) === 'menu');
    check('closed, the actions are out of sight and inert', (await fan.isHidden()) && (await fan.evaluate(el => el.inert === true)));

    // A press opens the fan above the button, with the labels; a press on an action runs it and closes the fan.
    await main.click();
    await page.waitForTimeout(250);
    const actions = up.locator('.mx-speed-dial__action');
    check('open: the actions are in sight with their labels, the glyph says close', (await up.getAttribute('data-open')) === '' && (await main.getAttribute('aria-expanded')) === 'true' && (await fan.isVisible()) && (await actions.nth(0).locator('.mx-speed-dial__label').isVisible()) && (await main.locator('.mx-speed-dial__main-glyph').getAttribute('data-icon')) === 'dismiss' && (await told.textContent()) === 'nothing yet (open)');
    const mainBox = await main.boundingBox();
    const firstBox = await actions.nth(0).boundingBox();
    const lastBox = await actions.nth(3).boundingBox();
    check('the fan stands above the button, the first action nearest, centred on it', firstBox.y + firstBox.height <= mainBox.y && lastBox.y < firstBox.y && Math.abs(firstBox.x + firstBox.width / 2 - (mainBox.x + mainBox.width / 2)) <= 0.5, `${firstBox.y} ${mainBox.y}`);
    const labelBox = await actions.nth(0).locator('.mx-speed-dial__label').boundingBox();
    check('the label lies to the start side of its action, centred on it', labelBox.x + labelBox.width <= firstBox.x && Math.abs(labelBox.y + labelBox.height / 2 - (firstBox.y + firstBox.height / 2)) <= 0.5);
    check('a disabled action says so', (await actions.nth(3).getAttribute('aria-disabled')) === 'true');
    await actions.nth(0).click();
    await page.waitForTimeout(250);
    check('the action ran and the fan closed', (await told.textContent()) === 'a new note' && (await up.getAttribute('data-open')) === null && (await fan.isHidden()));

    // The keys: Up opens on the first action, Up again moves on, Escape closes and the focus is back.
    await main.focus();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    check('Up on the button opens the fan on the first action', (await up.getAttribute('data-open')) === '' && (await actions.nth(0).evaluate(el => document.activeElement === el)));
    await page.keyboard.press('ArrowUp');
    check('Up again moves to the next action', await actions.nth(1).evaluate(el => document.activeElement === el));
    await page.keyboard.press('End');
    check('End skips the disabled last one and stops on the last enabled', await actions.nth(2).evaluate(el => document.activeElement === el));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    check('Enter runs it and closes', (await told.textContent()) === 'a file to upload' && (await up.getAttribute('data-open')) === null);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    check('Escape closes and puts the focus back on the button', (await up.getAttribute('data-open')) === null && (await main.evaluate(el => document.activeElement === el)));
    await main.click();
    await page.waitForTimeout(250);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(250);
    check('a press outside closes the fan', (await up.getAttribute('data-open')) === null);

    // One that fans to the end: the actions lie in a row after the button, the labels under them.
    const end = page.locator('.sd-end');
    await end.locator('.mx-speed-dial__main').click();
    await page.waitForTimeout(250);
    const endMain = await end.locator('.mx-speed-dial__main').boundingBox();
    const endFirst = await end.locator('.mx-speed-dial__action').nth(0).boundingBox();
    const endLabel = await end.locator('.mx-speed-dial__action').nth(0).locator('.mx-speed-dial__label').boundingBox();
    check('fanned to the end: the first action after the button, its label over it', endFirst.x >= endMain.x + endMain.width && Math.abs(endFirst.y + endFirst.height / 2 - (endMain.y + endMain.height / 2)) <= 0.5 && endLabel.y + endLabel.height <= endFirst.y + 0.5, `action ${endFirst.x},${endFirst.y} main ${endMain.x + endMain.width},${endMain.y} label ${endLabel.y + endLabel.height}`);
    await page.keyboard.press('Escape');

    // In the corner: switched on, it is fixed to the viewport's bottom end corner; another corner moves it.
    await page.locator('.sd-corner-toggle').click();
    await page.waitForTimeout(250);
    const corner = page.locator('.sd-corner');
    let box = await corner.boundingBox();
    const view = page.viewportSize();
    const inset = await corner.evaluate(el => parseFloat(getComputedStyle(el).insetInlineEnd));
    check('switched on, it sits in the bottom end corner of the viewport', (await corner.evaluate(el => getComputedStyle(el).position)) === 'fixed' && Math.abs(view.width - (box.x + box.width) - inset) <= 1 && Math.abs(view.height - (box.y + box.height) - inset) <= 1, `${box.x + box.width} of ${view.width}, ${box.y + box.height} of ${view.height}, inset ${inset}`);
    await page.getByRole('button', { name: 'Top end' }).click();
    await page.waitForTimeout(250);
    box = await corner.boundingBox();
    check('moved to the top end corner, fanning down', Math.abs(box.y - inset) <= 1 && (await corner.getAttribute('data-direction')) === 'down');
    await page.locator('.sd-corner-toggle').click();
    await page.waitForTimeout(250);
    check('switched off, it is gone', await corner.isHidden());

    // One action: the main button does it and takes its name.
    const single = page.locator('.sd-single .mx-speed-dial__main');
    await single.scrollIntoViewIfNeeded();
    check('with one action the main button is that action', (await single.getAttribute('aria-haspopup')) === null && (await single.getAttribute('aria-label')) === 'Save' && (await single.locator('.mx-speed-dial__main-glyph').getAttribute('data-icon')) === 'save');
    await single.click();
    check('a press does the action', (await page.locator('.sd-single-told').textContent()) === 'saved 1 times');
    check('extended, the name shows beside the glyph', (await page.locator('.sd-extended .mx-speed-dial__main-text').textContent()) === 'Save a copy' && (await page.locator('.sd-extended .mx-speed-dial__main-text').isVisible()));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
