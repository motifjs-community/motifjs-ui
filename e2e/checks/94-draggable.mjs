/** Real-browser checks of the draggable page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'draggable', { waitUntil: 'load' });
    const free = page.locator('.dg-free');
    await free.waitFor();
    // Where it lies in its room, so a scrolled page does not change the numbers.
    const at = loc => loc.evaluate(el => { const b = el.getBoundingClientRect(); const p = el.parentElement.getBoundingClientRect(); return [Math.round(b.x - p.x), Math.round(b.y - p.y)]; });
    const told = page.locator('.dg-free-told');
    // The mouse only reaches what is on screen.
    const boxOf = async loc => {
        await loc.scrollIntoViewIfNeeded();
        return loc.boundingBox();
    };
    check('a group named Move that is a Tab stop', (await free.getAttribute('role')) === 'group' && (await free.getAttribute('aria-roledescription')) === 'draggable' && (await free.getAttribute('aria-label')) === 'Move' && (await free.getAttribute('tabindex')) === '0');

    // A drag moves it; past the room's edge it stops at the edge.
    const start = await at(free);
    let box = await boxOf(free);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2, { steps: 2 });
    check('after a few pixels the drag starts and the draggable says so', (await free.getAttribute('data-dragging')) === '');
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 6 });
    await page.mouse.up();
    let now = await at(free);
    check('dragged 80 across and 40 down, it is there and tells', now[0] - start[0] === 80 && now[1] - start[1] === 40 && (await told.textContent()) === 'free: 80, 40', `${now} vs ${start}: ${await told.textContent()}`);
    const room = await page.locator('.dg-room').boundingBox();
    box = await boxOf(free);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 500, box.y + box.height / 2 - 500, { steps: 8 });
    await page.mouse.up();
    now = await at(free);
    check('it never leaves the room: dragged far up and left, it sits in the corner', Math.abs(now[0]) <= 1 && Math.abs(now[1]) <= 1, `${now}`);

    // Sideways only; by the grip only; the keys.
    const axis = page.locator('.dg-axis');
    const axisStart = await at(axis);
    box = await boxOf(axis);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 60, { steps: 6 });
    await page.mouse.up();
    now = await at(axis);
    check('along x only: 60 across, nothing down', now[0] - axisStart[0] === 60 && now[1] === axisStart[1], `${now} vs ${axisStart}`);
    const handled = page.locator('.dg-handle');
    const handledStart = await at(handled);
    box = await boxOf(handled);
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2 + 60, { steps: 6 });
    await page.mouse.up();
    check('a press beside the grip does not drag it', (await at(handled)).join() === handledStart.join());
    const grip = await boxOf(handled.locator('.dg-grip'));
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2 + 60, { steps: 6 });
    await page.mouse.up();
    now = await at(handled);
    check('a press on the grip drags it; the grip is the button named Move', now[1] - handledStart[1] === 60 && (await handled.locator('.dg-grip').getAttribute('role')) === 'button' && (await handled.locator('.dg-grip').getAttribute('aria-label')) === 'Move');
    await handled.locator('.dg-grip').focus();
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);
    now = await at(handled);
    check('Up on the grip moves it 10 px up and reads it out', now[1] - handledStart[1] === 50 && (await handled.locator('[aria-live]').textContent()) === 'Moved 0 across and 50 down', `${now} vs ${handledStart}`);

    // Copies into the bowls; the small one refuses a third.
    const chips = page.locator('.dg-chip');
    const big = page.locator('.dg-bowl-big');
    const small = page.locator('.dg-bowl-small');
    await big.scrollIntoViewIfNeeded();
    const drop = async (chip, bowl) => {
        const c = await chip.boundingBox();
        const b = await bowl.boundingBox();
        await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
        await page.mouse.down();
        await page.mouse.move(c.x + c.width / 2 + 10, c.y + c.height / 2 + 10, { steps: 2 });
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
    };
    await drop(chips.nth(0), big);
    check('a copy follows the pointer, the chip stays, the bowls are active and the one under is marked', (await page.locator('.mx-draggable__ghost').isVisible()) && (await chips.nth(0).getAttribute('data-dragging')) === '' && (await small.getAttribute('data-drop-active')) === '' && (await big.getAttribute('data-drop-over')) === '');
    await page.mouse.up();
    check('dropped: the bowl was told and has the fruit', (await page.locator('.dg-bowls-told').textContent()) === 'Apple went to the big bowl' && (await big.locator('.dg-bowl-list').textContent()) === 'Apple' && (await page.locator('.mx-draggable__ghost').isHidden()));
    await drop(chips.nth(1), small);
    await page.mouse.up();
    await drop(chips.nth(2), small);
    await page.mouse.up();
    await drop(chips.nth(0), small);
    check('a third one: the small bowl refuses and says so', (await small.getAttribute('data-drop-refused')) === '');
    await page.mouse.up();
    check('refused, nothing went in', (await small.locator('.dg-bowl-list').textContent()) === 'Pear, Plum');

    // Programmatic: the model places it and takes the place back.
    const coded = page.locator('.dg-coded');
    await coded.scrollIntoViewIfNeeded();
    const codedStart = await at(coded);
    await page.getByRole('button', { name: 'Right by 40' }).click();
    await page.waitForTimeout(250);
    check('a place set from a button is applied', (await at(coded))[0] - codedStart[0] === 40 && (await page.locator('.dg-coded-told').textContent()) === 'at: {"x":40,"y":0}');
    await coded.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(250);
    check('a key writes the place to the model', (await page.locator('.dg-coded-told').textContent()) === 'at: {"x":40,"y":20}');
    await page.getByRole('button', { name: 'Back to the start' }).click();
    await page.waitForTimeout(250);
    check('back to the start', (await at(coded)).join() === codedStart.join(), `${await at(coded)} vs ${codedStart}: ${await page.locator('.dg-coded-told').textContent()}`);

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
