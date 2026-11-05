/** Real-browser checks of the tile view page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'tileview', { waitUntil: 'load' });
    const board = page.locator('.tv-board');
    await board.waitFor();
    const tiles = board.locator('.mx-tile-view__tile');
    const gap = await board.evaluate(el => parseFloat(getComputedStyle(el.querySelector('.mx-tile-view__grid')).gap) || 0);
    const sizes = await tiles.evaluateAll(els => els.map(el => [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)]));
    const boardGrid = board.locator('.mx-tile-view__grid');
    check('a list of ten tiles on 120 × 100 cells, the wide and tall ones spanning cells and a gap', (await boardGrid.getAttribute('role')) === 'list' && sizes.length === 10 && sizes[0].join('x') === `${240 + gap}x100` && sizes[1].join('x') === '120x100' && sizes[3].join('x') === `${240 + gap}x${200 + gap}` && sizes[5].join('x') === `120x${200 + gap}`, JSON.stringify(sizes));
    check('down the columns: the second tile lies under the first, not beside it', await tiles.evaluateAll(els => els[1].getBoundingClientRect().top > els[0].getBoundingClientRect().bottom - 1 && Math.abs(els[1].getBoundingClientRect().left - els[0].getBoundingClientRect().left) < 1));
    check('the view scrolls sideways for the tiles that do not fit', await boardGrid.evaluate(el => el.scrollWidth > el.clientWidth));

    // Choosing: a press, Ctrl and a press, Space; the keys walk the grid by where the tiles lie.
    const pick = page.locator('.tv-pick');
    await pick.scrollIntoViewIfNeeded();
    const options = pick.locator('.mx-tile-view__tile');
    const told = page.locator('.tv-pick-told');
    const pickGrid = pick.locator('.mx-tile-view__grid');
    check('a listbox with the first option chosen from the start', (await pickGrid.getAttribute('role')) === 'listbox' && (await pickGrid.getAttribute('aria-multiselectable')) === 'true' && (await options.nth(0).getAttribute('aria-selected')) === 'true' && (await told.textContent()) === 'chosen: ["tea"]');
    await options.nth(1).click();
    check('a press chooses that tile alone', (await told.textContent()) === 'chosen: ["coffee"]' && (await options.nth(0).getAttribute('aria-selected')) === 'false');
    await options.nth(4).click({ modifiers: ['Control'] });
    check('Ctrl and a press adds one', (await told.textContent()) === 'chosen: ["coffee","fruit"]');
    await options.nth(2).click({ force: true });
    check('a disabled tile is not chosen', (await options.nth(2).getAttribute('aria-disabled')) === 'true' && (await told.textContent()) === 'chosen: ["coffee","fruit"]');
    await options.nth(1).focus();
    await page.keyboard.press('ArrowRight');
    check('Right moves focus along the row, over the disabled tile', await options.nth(4).evaluate(el => document.activeElement === el));
    const fromBottom = await page.evaluate(() => document.activeElement.getBoundingClientRect().bottom);
    await page.keyboard.press('ArrowDown');
    const below = await page.evaluate(bottom => document.activeElement.getBoundingClientRect().top > bottom - 1, fromBottom);
    check('Down moves focus to a tile under it', below);
    await page.keyboard.press(' ');
    const chosenNow = await told.textContent();
    check('Space chooses the focused tile too', chosenNow.includes('coffee') && chosenNow.includes('fruit') && (await pick.locator('[aria-selected="true"]').count()) === 3, chosenNow);
    await page.keyboard.press(' ');
    check('Space again lets it go', (await pick.locator('[aria-selected="true"]').count()) === 2);

    // Another order: a drag and Ctrl + arrows; the data follows.
    const order = page.locator('.tv-order');
    await order.scrollIntoViewIfNeeded();
    const steps = order.locator('.mx-tile-view__tile');
    const orderTold = page.locator('.tv-order-told');
    check('the steps in their first order', (await orderTold.textContent()) === 'Plan, Design, Build, Test, Ship, Rest');
    const first = await steps.nth(0).boundingBox();
    const third = await steps.nth(2).boundingBox();
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
    await page.mouse.down();
    await page.mouse.move(first.x + first.width / 2 + 10, first.y + first.height / 2, { steps: 2 });
    const ghost = page.locator('.mx-tile-view__ghost');
    check('after a few pixels the drag starts: the tile is marked and a copy follows the pointer', (await steps.nth(0).getAttribute('data-dragging')) === '' && (await ghost.isVisible()));
    await page.mouse.move(third.x + third.width * 0.8, third.y + third.height / 2, { steps: 6 });
    check('the tile where the drop would land is marked, after it', (await steps.nth(2).getAttribute('data-drop')) === 'after');
    await page.mouse.up();
    await page.waitForTimeout(100);
    check('the drop moves the tile and the data follows', (await orderTold.textContent()) === 'Design, Build, Plan, Test, Ship, Rest' && (await ghost.isHidden()), await orderTold.textContent());
    await steps.nth(2).focus();
    await page.keyboard.press('Control+ArrowLeft');
    check('Ctrl + Left moves it a place back; the move is read out', (await orderTold.textContent()) === 'Design, Plan, Build, Test, Ship, Rest' && (await order.locator('[aria-live]').textContent()) === 'Moved to 2 of 6', await orderTold.textContent());
    await page.keyboard.press('Control+Home');
    check('Ctrl + Home takes it to the start', (await orderTold.textContent()) === 'Plan, Design, Build, Test, Ship, Rest');

    // Any content: the button on a tile is its own; a press on the tile itself is told.
    const rooms = page.locator('.tv-rooms');
    await rooms.scrollIntoViewIfNeeded();
    await rooms.getByRole('button', { name: 'Warmer' }).nth(1).click();
    check('the button on a tile works on its own', (await page.locator('.tv-rooms-told').textContent()) === 'Lounge: warmer');
    await rooms.locator('.tv-room-temp').nth(2).click();
    check('a press on the tile is told', (await page.locator('.tv-rooms-told').textContent()) === 'Study pressed');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
