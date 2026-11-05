/** Real-browser checks of the scroll view page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'scrollview', { waitUntil: 'load' });
    const ways = page.locator('section[aria-labelledby="ways"]');
    const text = ways.locator('.sv-text');
    await text.waitFor();
    const metrics = () => text.evaluate(el => ({ top: el.scrollTop, height: el.clientHeight, full: el.scrollHeight, overflow: getComputedStyle(el).overflowY, bars: el.dataset.bars }));
    let m = await metrics();
    check('the box scrolls its content, the bars shown on scroll', m.full > m.height && m.overflow === 'auto' && m.bars === 'onScroll', JSON.stringify(m));
    check('a focusable region named by its label', (await text.getAttribute('tabindex')) === '0' && (await text.getAttribute('aria-label')) === 'Long text');

    // From code: to a line and back to the top; onScroll tells the position.
    await ways.getByRole('button', { name: 'Line 20' }).click();
    await page.waitForFunction(() => document.querySelector('.sv-text').scrollTop > 0);
    await page.waitForTimeout(700);
    const inView = await text.locator('p').nth(19).evaluate(el => {
        const b = el.getBoundingClientRect();
        const h = el.closest('.mx-scroll-view').getBoundingClientRect();
        return b.top >= h.top - 1 && b.bottom <= h.bottom + 1;
    });
    m = await metrics();
    check('scrollToElement brings line 20 into view', inView && m.top > 0, JSON.stringify(m));
    check('onScrolled tells the position', (await ways.locator('.sv-top').textContent()) === `scrollTop: ${Math.round(m.top)}`);
    await ways.getByRole('button', { name: 'Top' }).click();
    await page.waitForFunction(() => document.querySelector('.sv-top').textContent === 'scrollTop: 0', null, { timeout: 2000 }).catch(() => {});
    check('scrollTo(0) goes back to the top', (await text.evaluate(el => el.scrollTop)) === 0 && (await ways.locator('.sv-top').textContent()) === 'scrollTop: 0');

    // While scrolling the box is marked, so the thumb shows; a moment later the mark goes.
    await text.evaluate(el => (el.scrollTop = 40));
    await page.waitForFunction(() => document.querySelector('.sv-text').hasAttribute('data-scrolling'), null, { timeout: 1000 }).catch(() => {});
    check('scrolling marks the box', (await text.getAttribute('data-scrolling')) === '');
    await page.waitForTimeout(1000);
    check('the mark goes when the scrolling stops', (await text.getAttribute('data-scrolling')) === null);
    await ways.getByRole('button', { name: 'never' }).click();
    check('never: no scrollbar at all', (await text.getAttribute('data-bars')) === 'never' && (await text.evaluate(el => getComputedStyle(el).scrollbarWidth)) === 'none');
    await ways.getByRole('button', { name: 'always' }).click();
    check('always: the bars as the design draws them', (await text.getAttribute('data-bars')) === 'always');

    // Pull to refresh with the mouse: a little shows the panel, far enough says to release, letting go refreshes.
    const pull = page.locator('section[aria-labelledby="pull"]');
    const notes = pull.locator('.sv-notes');
    await notes.scrollIntoViewIfNeeded();
    const panel = notes.locator('.mx-scroll-view__pull');
    const panelText = notes.locator('.mx-scroll-view__pull-text');
    const host = await notes.boundingBox();
    let panelBox = await panel.boundingBox();
    check('the pull panel waits above the content, out of sight', (await notes.getAttribute('data-pull')) === '' && panelBox && panelBox.y + panelBox.height <= host.y + 1, panelBox && `${panelBox.y + panelBox.height} vs ${host.y}`);
    const x = host.x + host.width / 2;
    const y = host.y + 16;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 40, { steps: 4 });
    check('pulled a little: the content comes down with the panel, which says to pull', (await notes.getAttribute('data-pull-state')) === 'pull' && (await panelText.textContent()) === 'Pull down to refresh' && (await notes.getAttribute('data-pulling')) === '');
    await page.mouse.move(x, y + 140, { steps: 6 });
    panelBox = await panel.boundingBox();
    check('far enough: the panel is in view and says to release', (await notes.getAttribute('data-pull-state')) === 'release' && (await panelText.textContent()) === 'Release to refresh' && panelBox.y >= host.y - 1, `${panelBox.y} vs ${host.y}`);
    await page.mouse.up();
    await page.waitForTimeout(50);
    check('let go: refreshing, with the spinner', (await notes.getAttribute('data-pull-state')) === 'refreshing' && (await panelText.textContent()) === 'Refreshing…' && (await notes.locator('.mx-scroll-view__pull-spinner').isVisible()));
    await page.waitForFunction(() => !document.querySelector('.sv-notes').hasAttribute('data-pull-state'), null, { timeout: 4000 }).catch(() => {});
    check('when the promise settles the panel goes back and the new note is on top', (await notes.getAttribute('data-pull-state')) === null && (await notes.locator('.mx-scroll-view__content > *:not(.mx-scroll-view__pull):not(.mx-scroll-view__bottom)').first().textContent()).trim() === 'Fresh note 1');

    // Load more near the end: the first page comes by itself, each reach asks for the next, the last one ends it.
    const more = page.locator('section[aria-labelledby="more"]');
    const orders = more.locator('.sv-orders');
    const told = more.locator('.sv-more-told');
    await more.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.sv-more-told')?.textContent === '15 of 60 orders', null, { timeout: 4000 }).catch(() => {});
    check('the first page is asked for as soon as the box is there', (await told.textContent()) === '15 of 60 orders', await told.textContent());
    await orders.evaluate(el => (el.scrollTop = el.scrollHeight));
    await page.waitForFunction(() => document.querySelector('.sv-orders').hasAttribute('data-loading'), null, { timeout: 1000 }).catch(() => {});
    check('near the end it loads, with the panel under the content', (await orders.getAttribute('data-loading')) === '' && (await orders.locator('.mx-scroll-view__bottom').isVisible()) && (await orders.locator('.mx-scroll-view__bottom-text').textContent()) === 'Loading…');
    await page.waitForFunction(() => document.querySelector('.sv-more-told')?.textContent === '30 of 60 orders', null, { timeout: 4000 }).catch(() => {});
    check('the next page is in and the panel is gone', (await told.textContent()) === '30 of 60 orders' && (await orders.locator('.mx-scroll-view__bottom').isHidden()), await told.textContent());
    for (let i = 0; i < 3 && (await told.textContent()) !== 'All 60 orders are in.'; i++) {
        await orders.evaluate(el => (el.scrollTop = el.scrollHeight));
        await page.waitForTimeout(1200);
    }
    check('the last page says there is no more', (await told.textContent()) === 'All 60 orders are in.', await told.textContent());
    await orders.evaluate(el => (el.scrollTop = el.scrollHeight));
    await page.waitForTimeout(300);
    check('after that a reach asks for nothing', (await orders.getAttribute('data-loading')) === null && (await orders.locator('.mx-scroll-view__bottom').isHidden()));

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
