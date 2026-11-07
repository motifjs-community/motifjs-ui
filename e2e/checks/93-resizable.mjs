/** Real-browser checks of the resizable page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'resizable', { waitUntil: 'load' });
    const box = page.locator('.rs-box');
    await box.waitFor();
    const size = loc => loc.evaluate(el => [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)]);
    const told = page.locator('.rs-box-told');
    // The mouse only reaches what is on screen, and the box grows as it is dragged.
    const handleBox = async edge => {
        await box.scrollIntoViewIfNeeded();
        return box.locator(`.mx-resizable__handle[data-edge="${edge}"]`).boundingBox();
    };
    let s = await size(box);
    check('a box of 280 × 140 with eight handles and a grip named Resize', s.join('x') === '280x140' && (await box.locator('.mx-resizable__handle:not([hidden])').count()) === 8 && (await box.locator('.mx-resizable__grip').getAttribute('aria-label')) === 'Resize' && (await box.locator('.mx-resizable__grip').getAttribute('role')) === 'button');

    // The end side dragged 60 px: wider by 60, as tall; the corner: both; the limits hold.
    const end = await handleBox('end');
    await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + end.width / 2 + 60, end.y + end.height / 2, { steps: 6 });
    check('while dragging the box says so, and which side', (await box.getAttribute('data-resizing')) === '' && (await box.getAttribute('data-edge')) === 'end');
    await page.mouse.up();
    s = await size(box);
    check('the end side dragged 60 px makes it 340 wide, as tall as before', s.join('x') === '340x140' && (await told.textContent()) === '340 × 140, from the end', `${s.join('x')} ${await told.textContent()}`);
    const corner = await handleBox('bottom-end');
    await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2);
    await page.mouse.down();
    await page.mouse.move(corner.x + corner.width / 2 + 300, corner.y + corner.height / 2 + 300, { steps: 6 });
    await page.mouse.up();
    s = await size(box);
    check('dragged past the most, the corner stops at 480 × 240', s.join('x') === '480x240', s.join('x'));
    const top = await handleBox('top');
    await page.mouse.move(top.x + top.width / 2, top.y + top.height / 2);
    await page.mouse.down();
    await page.mouse.move(top.x + top.width / 2, top.y + top.height / 2 + 400, { steps: 6 });
    await page.mouse.up();
    s = await size(box);
    check('dragged past the least, the top stops at 80 tall; a box in the flow keeps its place', s.join('x') === '480x80', s.join('x'));

    // The keys on the grip.
    await box.locator('.mx-resizable__grip').focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    s = await size(box);
    check('Left and Down on the grip change the sides by 10', s.join('x') === '470x90' && (await told.textContent()) === '470 × 90, from the bottom-end', s.join('x'));
    check('the new size is read out', (await box.locator('[aria-live]').textContent()) === 'Width 470, height 90');

    // Inside an area, keeping the shape: the corner dragged far stops at the area's edge, the height following the width.
    const area = page.locator('.rs-area');
    await area.scrollIntoViewIfNeeded();
    const picture = page.locator('.rs-picture');
    const room = await area.boundingBox();
    const pc = await picture.locator('.mx-resizable__handle[data-edge="bottom-end"]').boundingBox();
    await page.mouse.move(pc.x + pc.width / 2, pc.y + pc.height / 2);
    await page.mouse.down();
    await page.mouse.move(pc.x + pc.width / 2 + 600, pc.y + pc.height / 2 + 100, { steps: 8 });
    await page.mouse.up();
    const pb = await picture.boundingBox();
    const ratio = pb.width / pb.height;
    check('inside the area and in shape: the right edge at the area’s, 16:9 kept', pb.x + pb.width <= room.x + room.width + 1 && Math.abs(ratio - 16 / 9) < 0.03, `${Math.round(pb.width)}x${Math.round(pb.height)} in ${Math.round(room.width)}`);
    check('only the sides asked for have handles', (await picture.locator('.mx-resizable__handle:not([hidden])').evaluateAll(els => els.map(el => el.dataset.edge).join())) === 'bottom,end,bottom-end');

    // Programmatic: the model sizes it, and takes the size back.
    const coded = page.locator('.rs-coded');
    await coded.scrollIntoViewIfNeeded();
    check('sized by the model from the start', (await size(coded)).join('x') === '240x120');
    await page.getByRole('button', { name: 'Wider' }).click();
    await page.waitForTimeout(100);
    check('a size set from a button is applied', (await size(coded)).join('x') === '280x120' && (await page.locator('.rs-coded-told').textContent()) === 'size: {"width":280,"height":120}');
    await coded.locator('.mx-resizable__grip').focus();
    await page.keyboard.press('ArrowRight');
    check('a key writes the size to the model', (await page.locator('.rs-coded-told').textContent()) === 'size: {"width":290,"height":120}');

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
