/** Real-browser checks of the splitter page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'splitter', { waitUntil: 'load' });
    const basic = page.locator('.sp-basic');
    await basic.waitFor();
    const widths = s => s.evaluate(el => Array.from(el.querySelectorAll(':scope > .mx-splitter__pane')).map(p => Math.round(p.getBoundingClientRect().width)));
    const handles = basic.locator(':scope > .mx-splitter__handle > .mx-splitter__bar');
    let w = await widths(basic);
    check('three panes and two handles; the first pane 220 px, the share three tenths of what the shares get', (await handles.count()) === 2 && w[0] === 220 && Math.abs(w[2] - (w[1] + w[2]) * 0.3) <= 1, w.join('/'));
    check('a handle is a separator with its pane and its share', (await handles.nth(0).getAttribute('role')) === 'separator' && (await handles.nth(0).getAttribute('aria-orientation')) === 'vertical' && (await handles.nth(0).getAttribute('aria-controls')) === (await basic.locator(':scope > .mx-splitter__pane').nth(0).getAttribute('id')) && (await handles.nth(0).getAttribute('aria-label')) === 'Resize');
    check('the Tab order runs pane, handle, pane, handle, pane', (await basic.evaluate(el => Array.from(el.children).map(c => (c.classList.contains('mx-splitter__handle') ? 'h' : 'p')).join(''))) === 'phphp');

    // A drag moves the handle: the first pane grows, the second shrinks, the third keeps its room.
    const bar = await handles.nth(0).boundingBox();
    await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2);
    await page.mouse.down();
    await page.mouse.move(bar.x + bar.width / 2 + 60, bar.y + bar.height / 2, { steps: 6 });
    check('while dragging the splitter says so', (await basic.getAttribute('data-dragging')) === '');
    await page.mouse.up();
    const after = await widths(basic);
    check('a drag of 60 px: the first pane 280, the second 60 less, the third the same', after[0] === 280 && after[1] === w[1] - 60 && after[2] === w[2], `${w.join('/')} -> ${after.join('/')}`);
    const bar2 = await handles.nth(0).boundingBox();
    await page.mouse.move(bar2.x + bar2.width / 2, bar2.y + bar2.height / 2);
    await page.mouse.down();
    await page.mouse.move(bar2.x - 400, bar2.y + bar2.height / 2, { steps: 8 });
    await page.mouse.up();
    w = await widths(basic);
    check('dragged far back, the first pane stops at its least, 140', w[0] === 140, w.join('/'));

    // The keys: an arrow moves by the step, End gives the pane its most.
    await handles.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    w = await widths(basic);
    check('Right moves the handle 10 px', w[0] === 150, w.join('/'));
    const now = await handles.nth(0).getAttribute('aria-valuenow');
    check('aria-valuenow is the first pane’s share of the two beside the handle', Math.abs(Number(now) - Math.round((w[0] / (w[0] + w[1])) * 100)) <= 1, now);
    await page.keyboard.press('End');
    w = await widths(basic);
    check('End gives the second pane its least, 120', w[1] === 120, w.join('/'));

    // Hiding a pane from the handle's button, Enter brings it back; the middle one has no button.
    const fold = page.locator('.sp-fold');
    await fold.scrollIntoViewIfNeeded();
    const foldHandles = fold.locator(':scope > .mx-splitter__handle');
    const foldBars = fold.locator(':scope > .mx-splitter__handle > .mx-splitter__bar');
    const before = foldHandles.nth(0).locator('.mx-splitter__fold[data-side="before"]');
    check('the side panes have a fold button, the middle pane none', (await before.isVisible()) && (await foldHandles.nth(0).locator('.mx-splitter__fold[data-side="after"]').isHidden()) && (await foldHandles.nth(1).locator('.mx-splitter__fold[data-side="after"]').isVisible()));
    await before.click();
    w = await widths(fold);
    check('the button hides the pane: no room, hidden from readers, told', w[0] === 0 && (await fold.locator(':scope > .mx-splitter__pane').nth(0).getAttribute('data-collapsed')) === '' && (await page.locator('.sp-fold-told').textContent()) === 'Tree hidden' && (await before.getAttribute('aria-label')) === 'Show the pane', `${w.join('/')} collapsed=${await fold.locator(':scope > .mx-splitter__pane').nth(0).getAttribute('data-collapsed')} told=${await page.locator('.sp-fold-told').textContent()} label=${await before.getAttribute('aria-label')}`);
    await foldBars.nth(0).focus();
    await page.keyboard.press('Enter');
    w = await widths(fold);
    check('Enter on the handle shows it again, where it was', w[0] === 180 && (await page.locator('.sp-fold-told').textContent()) === 'Tree shown');

    // Nested: the inner splitter lies the other way and has its own handle.
    const inner = page.locator('.sp-inner');
    await inner.scrollIntoViewIfNeeded();
    check('the inner splitter is vertical with a horizontal separator', (await inner.getAttribute('data-orientation')) === 'vertical' && (await inner.locator(':scope > .mx-splitter__handle > .mx-splitter__bar').getAttribute('aria-orientation')) === 'horizontal');
    const heights = await inner.evaluate(el => Array.from(el.querySelectorAll(':scope > .mx-splitter__pane')).map(p => Math.round(p.getBoundingClientRect().height)));
    check('its second pane is 90 px tall', heights[1] === 90, heights.join('/'));

    // The sizes go out to x-model after a move and come back.
    const sizes = page.locator('.sp-sizes');
    await sizes.scrollIntoViewIfNeeded();
    const told = page.locator('.sp-sizes-told');
    check('before any move x-model is null', (await told.textContent()) === 'sizes: null, moved 0 times');
    await sizes.locator(':scope > .mx-splitter__handle > .mx-splitter__bar').nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    w = await widths(sizes);
    check('two key moves: the first pane 180, x-model has the pixels', w[0] === 180 && (await told.textContent()) === `sizes: [180,${w[1]},160], moved 2 times`, await told.textContent());
    await page.getByRole('button', { name: 'Keep this layout' }).click();
    await page.getByRole('button', { name: 'Start again' }).click();
    await page.waitForTimeout(100);
    w = await widths(sizes);
    check('null starts from the panes’ own sizes again', w[0] === 160 && w[2] === 160, w.join('/'));
    await page.getByRole('button', { name: 'Restore it' }).click();
    await page.waitForTimeout(100);
    w = await widths(sizes);
    check('the kept layout comes back', w[0] === 180, w.join('/'));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
