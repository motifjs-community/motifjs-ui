/** Real-browser checks of the sortable page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'sortable', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const steps = ways.locator('.so-steps');
    await steps.waitFor();
    const items = steps.locator('.mx-sortable__item');
    const order = async () => (await items.allTextContents()).map(t => t.trim()).join('|');
    check('a group named by its label, the four rows its items', (await steps.getAttribute('role')) === 'group' && (await steps.getAttribute('aria-label')) === 'Steps' && (await items.count()) === 4);
    check('one Tab stop: the first item', (await items.evaluateAll(els => els.map(el => el.tabIndex))).join() === '0,-1,-1,-1');

    // The keys: Ctrl + Down moves the focused row a place, Ctrl + End to the end; the app is told, the move read out.
    await items.nth(0).focus();
    await page.keyboard.press('Control+ArrowDown');
    check('Ctrl + Down moves the row down a place', (await order()) === 'Pack it|Collect the order|Print the label|Hand it over', await order());
    check('the app was told the indexes', (await ways.locator('.so-told').textContent()) === '"Collect the order" is step 2 now');
    check('the move is read out', (await steps.locator('[aria-live]').textContent()) === 'Moved to 2 of 4');
    check('focus stays on the moved row, the Tab stop now', await items.nth(1).evaluate(el => document.activeElement === el && el.tabIndex === 0));
    await page.keyboard.press('Control+End');
    check('Ctrl + End takes it to the end', (await order()) === 'Pack it|Print the label|Hand it over|Collect the order', await order());

    // A drag with the mouse: a copy follows, a line shows the place, the drop moves the row and tells.
    const first = await items.nth(0).boundingBox();
    const second = await items.nth(1).boundingBox();
    const third = await items.nth(2).boundingBox();
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
    await page.mouse.down();
    await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2 + 10, { steps: 2 });
    const ghost = page.locator('.mx-sortable__ghost');
    check('after a few pixels the drag starts: the row is marked, a copy follows the pointer', (await items.nth(0).getAttribute('data-dragging')) === '' && (await ghost.isVisible()));
    await page.mouse.move(second.x + second.width / 2, second.y + second.height - 4, { steps: 4 });
    const line = steps.locator('.mx-sortable__line');
    const lineBox = await line.boundingBox();
    check('the line shows where it would land: between the second and the third row', (await line.isVisible()) && lineBox && Math.abs(lineBox.y + lineBox.height / 2 - third.y) <= 2, lineBox && `${lineBox.y + lineBox.height / 2} vs ${third.y}`);
    check('the list is the drop target', (await steps.getAttribute('data-drop-target')) === '');
    await page.mouse.up();
    await page.waitForTimeout(50);
    check('the drop moves the row and tells the indexes', (await order()) === 'Print the label|Pack it|Hand it over|Collect the order' && (await ways.locator('.so-told').textContent()) === '"Pack it" is step 2 now', await order());
    check('the copy and the line are gone', (await ghost.isHidden()) && (await line.isHidden()) && (await steps.getAttribute('data-drop-target')) === null);

    // Escape cancels: nothing moves.
    const before = await order();
    const row = await items.nth(0).boundingBox();
    await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2);
    await page.mouse.down();
    await page.mouse.move(row.x + row.width / 2, row.y + row.height + 20, { steps: 4 });
    check('a second drag is under way', (await ghost.isVisible()));
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await page.waitForTimeout(50);
    check('Escape cancels it: the order stays, the copy goes', (await order()) === before && (await ghost.isHidden()) && (await items.nth(0).getAttribute('data-dragging')) === null);

    // Two lists of one group: a row dragged over goes into the other list and both sides are told.
    const groups = page.locator('section[aria-labelledby="groups"]');
    const todo = groups.locator('.so-todo');
    const done = groups.locator('.so-done');
    await groups.scrollIntoViewIfNeeded();
    const brief = await todo.locator('.mx-sortable__item').nth(0).boundingBox();
    const doneBox = await done.boundingBox();
    await page.mouse.move(brief.x + brief.width / 2, brief.y + brief.height / 2);
    await page.mouse.down();
    await page.mouse.move(brief.x + brief.width / 2, brief.y + brief.height / 2 + 10, { steps: 2 });
    await page.mouse.move(doneBox.x + doneBox.width / 2, doneBox.y + doneBox.height - 10, { steps: 6 });
    check('over the other list it is the target, the first list is not', (await done.getAttribute('data-drop-target')) === '' && (await todo.getAttribute('data-drop-target')) === null);
    await page.mouse.up();
    await page.waitForTimeout(50);
    const doneTexts = (await done.locator('.mx-sortable__item').allTextContents()).map(t => t.trim());
    check('the row went over, after the one there; the lists drew their data again', (await todo.locator('.mx-sortable__item').count()) === 2 && doneTexts.join('|') === 'Pick the date|Write the brief', doneTexts.join('|'));

    // A handle, side by side: only the grip takes the drag and the keys; a drag may be refused.
    const handle = page.locator('section[aria-labelledby="handle"]');
    const tags = handle.locator('.so-tags');
    await handle.scrollIntoViewIfNeeded();
    const grips = tags.locator('.so-grip');
    check('side by side, the grips are the buttons', (await tags.getAttribute('data-orientation')) === 'horizontal' && (await grips.evaluateAll(els => els.map(el => `${el.getAttribute('role')}:${el.getAttribute('aria-label')}:${el.tabIndex}`))).join() === 'button:Move Design:0,button:Move Build:-1,button:Move Test:-1,button:Move Ship:-1,button:Move Locked:-1');
    const chip = await tags.locator('.mx-sortable__item').nth(0).boundingBox();
    await page.mouse.move(chip.x + chip.width - 8, chip.y + chip.height / 2);
    await page.mouse.down();
    await page.mouse.move(chip.x + chip.width + 40, chip.y + chip.height / 2, { steps: 4 });
    check('a press beside the grip does not drag', (await ghost.isHidden()) && (await tags.locator('[data-dragging]').count()) === 0);
    await page.mouse.up();
    const locked = await grips.nth(4).boundingBox();
    await page.mouse.move(locked.x + locked.width / 2, locked.y + locked.height / 2);
    await page.mouse.down();
    await page.mouse.move(locked.x + locked.width / 2 - 30, locked.y + locked.height / 2, { steps: 4 });
    check('a refused drag never starts and the app says why', (await ghost.isHidden()) && (await handle.locator('.so-tags-told').textContent()) === 'Locked stays where it is.');
    await page.mouse.up();
    await grips.nth(0).focus();
    await page.keyboard.press('Control+ArrowRight');
    const tagTexts = (await tags.locator('.mx-sortable__item').allTextContents()).map(t => t.trim());
    check('Ctrl + Right on the grip moves the chip a place to the right', tagTexts.join('|') === 'Build|Design|Test|Ship|Locked' && (await handle.locator('.so-tags-told').textContent()) === 'Build, Design, Test, Ship, Locked', tagTexts.join('|'));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
