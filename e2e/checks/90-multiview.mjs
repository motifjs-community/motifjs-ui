/** Real-browser checks of the multi-view page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'multiview', { waitUntil: 'load' });
    const order = page.locator('.mv-order');
    await order.waitFor();
    const views = order.locator('.mx-multi-view__view');
    const hidden = () => views.evaluateAll(els => els.map(el => el.getAttribute('aria-hidden')));
    // Where the first view stands against the viewport: 0 at rest, minus a width per page.
    const offset = () => order.evaluate(el => el.querySelector('.mx-multi-view__view').getBoundingClientRect().left - el.querySelector('.mx-multi-view__viewport').getBoundingClientRect().left);
    const width = await order.locator('.mx-multi-view__viewport').evaluate(el => el.clientWidth);
    check('a group named by its label with three pages, the first in sight', (await order.getAttribute('role')) === 'group' && (await order.getAttribute('aria-label')) === 'Order' && (await views.count()) === 3 && (await hidden()).join() === ',true,true');
    check('the pages are named by their titles', (await views.evaluateAll(els => els.map(el => el.getAttribute('aria-label')))).join() === 'Address,Delivery,Payment');
    check('a page out of sight is inert, so its fields are out of the Tab order', await views.nth(1).evaluate(el => el.inert === true));

    // A press on a step moves the page; the track slides one width.
    await page.locator('.mv-steps').getByRole('button', { name: /Delivery/ }).click();
    await page.waitForTimeout(450);
    check('the second page is in sight after the step was pressed', (await hidden()).join() === 'true,,true' && Math.abs((await offset()) + width) <= 1 && (await page.locator('.mv-order-page').textContent()) === 'page: 1', `${await offset()} vs -${width}`);

    // A drag with the mouse on the page brings the next one; the stepper follows.
    const box = await order.boundingBox();
    const y = box.y + box.height - 12;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, y, { steps: 3 });
    check('while dragging the multi-view says so', (await order.getAttribute('data-dragging')) === '');
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    check('let go far enough: the third page is in sight and the stepper says so', (await hidden()).join() === 'true,true,' && (await page.locator('.mv-steps .mx-stepper__step[aria-current]').textContent()).includes('Payment') && (await page.locator('.mv-order-page').textContent()) === 'page: 2');
    await page.mouse.move(box.x + box.width * 0.3, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    check('a drag the other way brings the page before', (await hidden()).join() === 'true,,true');
    await page.mouse.move(box.x + box.width * 0.5, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.47, y, { steps: 3 });
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(450);
    check('a short drag snaps back', (await hidden()).join() === 'true,,true' && Math.abs((await offset()) + width) <= 1, String(await offset()));

    // Built when first in sight; kept, or made again with keepAlive off.
    const made = page.locator('.mv-lazy-made');
    await page.locator('.mv-lazy').scrollIntoViewIfNeeded();
    const lazy = page.locator('.mv-lazy').locator('..');
    check('only the page in sight was made', (await made.textContent()) === 'made 1 times' && (await page.locator('.mv-lazy-page').count()) === 1);
    await lazy.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(450);
    check('the next page is made when it comes into sight', (await made.textContent()) === 'made 2 times');
    await lazy.getByRole('button', { name: 'Previous' }).click();
    await page.waitForTimeout(450);
    check('kept alive, the first page is not made again', (await made.textContent()) === 'made 2 times' && (await page.locator('.mv-lazy-page').count()) === 2);
    await lazy.getByRole('button', { name: 'Keep alive' }).click();
    await lazy.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(450);
    await lazy.getByRole('button', { name: 'Previous' }).click();
    await page.waitForTimeout(450);
    // Off, the page out of sight is dropped at once; each of the two is made again when it comes back.
    check('with keep alive off, a page out of sight is dropped and made again', (await made.textContent()) === 'made 4 times' && (await page.locator('.mv-lazy-page').count()) === 1, `${await made.textContent()}, ${await page.locator('.mv-lazy-page').count()} pages`);

    // From code: added, removed, around the ends.
    const coded = page.locator('.mv-coded');
    await coded.scrollIntoViewIfNeeded();
    const section = coded.locator('..');
    const toldOf = () => page.locator('.mv-coded-told').textContent();
    await section.getByRole('button', { name: 'Add a note' }).click();
    await page.waitForTimeout(450);
    check('a note added from code comes into sight', (await toldOf()) === '3 notes, in sight: Note 3', await toldOf());
    await section.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(450);
    check('next on the last goes around to the first', (await toldOf()) === '3 notes, in sight: Note 1', await toldOf());
    await section.getByRole('button', { name: 'Remove this note' }).click();
    await page.waitForTimeout(450);
    check('removing the note in sight moves to the next one', (await toldOf()).startsWith('2 notes') && (await coded.locator('.mx-multi-view__view').count()) === 2, await toldOf());

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
