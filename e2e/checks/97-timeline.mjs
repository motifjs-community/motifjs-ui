/** Real-browser checks of the timeline page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'timeline', { waitUntil: 'load' });
    const project = page.locator('.tl-project');
    await project.waitFor({ state: 'attached' });
    const rows = project.locator('.mx-timeline__item');
    const rect = async loc => loc.evaluate(el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    });

    // Down the page: a row per event, the dots on one line, the cards beside them.
    check('five events down the page', (await rows.count()) === 5 && (await project.getAttribute('data-orientation')) === 'vertical');
    const dots = [];
    for (let i = 0; i < 5; i++) dots.push(await rect(rows.nth(i).locator('.mx-timeline__dot')));
    check('the dots sit on one vertical line', dots.every(d => Math.abs(d.left - dots[0].left) <= 0.5), dots.map(d => d.left).join(' '));
    const dot0 = dots[0];
    const line = await project.locator('.mx-timeline__list').evaluate(el => {
        const cs = getComputedStyle(el, '::before');
        const r = el.getBoundingClientRect();
        return { left: r.left + parseFloat(cs.left), width: parseFloat(cs.width) };
    });
    check('the line runs through the middle of the dots', Math.abs(line.left + line.width / 2 - (dot0.left + dot0.width / 2)) <= 0.5, `${line.left + line.width / 2} vs ${dot0.left + dot0.width / 2}`);
    const card0 = await rect(rows.nth(0).locator('.mx-timeline__card'));
    check('the card is to the right of the dot', card0.left > dot0.right);
    const tones = await rows.evaluateAll(els => els.map(el => el.dataset.tone));
    check('the tones', tones.join(',') === 'default,info,accent,caution,success', tones.join(','));
    const dates = await project.locator('.mx-timeline__date').allTextContents();
    check('the dates are written in English, medium', dates[0] === 'Jan 12, 2026' && dates[4] === 'Jun 30, 2026', dates.join(' | '));
    check('a card is not a button while nothing folds', (await rows.nth(0).locator('.mx-timeline__card').evaluate(el => el.tagName)) === 'DIV');
    await rows.nth(1).locator('.mx-timeline__card').click();
    check('a press on a card is told', (await page.locator('.tl-told').textContent()) === 'pressed: Design signed off');

    // Taking turns: the dots move to the middle, the cards on either side.
    await page.getByRole('button', { name: 'Take turns' }).click();
    await page.waitForTimeout(200);
    const sides = await rows.evaluateAll(els => els.map(el => el.dataset.side));
    check('the sides take turns', sides.join(',') === 'end,start,end,start,end', sides.join(','));
    const dotA = await rect(rows.nth(0).locator('.mx-timeline__dot'));
    const dotB = await rect(rows.nth(1).locator('.mx-timeline__dot'));
    const list = await rect(project.locator('.mx-timeline__list'));
    check('the dots are in the middle of the list', Math.abs(dotA.left + dotA.width / 2 - (list.left + list.width / 2)) <= 0.5 && Math.abs(dotB.left - dotA.left) <= 0.5, `${dotA.left + dotA.width / 2} vs ${list.left + list.width / 2}`);
    const cardA = await rect(rows.nth(0).locator('.mx-timeline__card'));
    const cardB = await rect(rows.nth(1).locator('.mx-timeline__card'));
    check('the first card at the end side, the second at the start side', cardA.left > dotA.right && cardB.right < dotB.left);
    check('the two cards keep the same distance from the line', Math.abs((cardA.left - dotA.right) - (dotB.left - cardB.right)) <= 0.5, `${cardA.left - dotA.right} vs ${dotB.left - cardB.right}`);

    // Folding: the cards become buttons, closed, and open on a press or Enter.
    await page.getByRole('button', { name: 'Fold the cards' }).click();
    await page.waitForTimeout(200);
    const cards = rows.locator('.mx-timeline__card');
    check('the cards are buttons with aria-expanded false', (await cards.evaluateAll(els => els.every(el => el.tagName === 'BUTTON' && el.getAttribute('aria-expanded') === 'false'))));
    check('the descriptions are out of sight', await cards.nth(0).locator('.mx-timeline__description').isHidden());
    await cards.nth(0).click();
    await page.waitForTimeout(100);
    check('a press unfolds the card', (await cards.nth(0).getAttribute('aria-expanded')) === 'true' && (await cards.nth(0).locator('.mx-timeline__description').isVisible()) && (await rows.nth(0).getAttribute('data-expanded')) === '');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    check('Enter on the next card unfolds it too', (await cards.nth(1).getAttribute('aria-expanded')) === 'true');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    check('Space folds it again', (await cards.nth(1).getAttribute('aria-expanded')) === 'false' && (await cards.nth(1).locator('.mx-timeline__description').isHidden()));

    // Along a line: the flags are tabs, the shown one's card is under the line.
    const releases = page.locator('.tl-releases');
    await releases.scrollIntoViewIfNeeded();
    const flags = releases.locator('.mx-timeline__flag');
    const detail = releases.locator('.mx-timeline__detail');
    check('twelve releases, tabs, the third shown', (await flags.count()) === 12 && (await releases.locator('.mx-timeline__list').getAttribute('role')) === 'tablist' && (await flags.nth(2).getAttribute('aria-selected')) === 'true');
    check('the detail is the tab panel of the shown flag', (await detail.getAttribute('role')) === 'tabpanel' && (await detail.getAttribute('aria-labelledby')) === (await flags.nth(2).getAttribute('id')) && (await detail.locator('.mx-timeline__title').textContent()) === 'Release 3');
    const flagDates = await flags.locator('.mx-timeline__date').allTextContents();
    check('the dates along the line are month and year', flagDates[0] === 'Jan 2026' && flagDates[11] === 'Dec 2026', flagDates.join(' | '));
    const f0 = await rect(flags.nth(0).locator('.mx-timeline__dot'));
    const f1 = await rect(flags.nth(1).locator('.mx-timeline__dot'));
    check('the flags\' dots sit on one horizontal line', Math.abs(f0.top - f1.top) <= 0.5, `${f0.top} ${f1.top}`);
    // The line is a piece on either side of each flag: none before the first or after the last, the rest joined.
    const hline = await releases.locator('.mx-timeline__item').evaluateAll(els => {
        const piece = (el, which) => {
            const cs = getComputedStyle(el, which);
            const r = el.getBoundingClientRect();
            return cs.display === 'none' ? null : { left: r.left + parseFloat(cs.left), right: r.left + parseFloat(cs.left) + parseFloat(cs.width), mid: r.top + parseFloat(cs.top) + parseFloat(cs.height) / 2 };
        };
        const after0 = piece(els[0], '::after');
        const before1 = piece(els[1], '::before');
        return { noneBeforeFirst: piece(els[0], '::before') === null, noneAfterLast: piece(els[els.length - 1], '::after') === null, mid: after0.mid, joined: Math.abs(after0.right - before1.left) <= 0.5, startsAt: after0.left };
    });
    check('the line runs through the middle of the flags\' dots', Math.abs(hline.mid - (f0.top + f0.height / 2)) <= 0.5, `${hline.mid} vs ${f0.top + f0.height / 2}`);
    check('the line starts at the first dot\'s middle, ends at the last, and its pieces join', hline.noneBeforeFirst && hline.noneAfterLast && hline.joined && Math.abs(hline.startsAt - (f0.left + f0.width / 2)) <= 0.5, `${hline.startsAt} vs ${f0.left + f0.width / 2}`);
    await flags.nth(5).click();
    await page.waitForTimeout(200);
    check('a press on a date shows that release', (await detail.locator('.mx-timeline__title').textContent()) === 'Release 6' && (await page.locator('.tl-releases-told').textContent()) === 'shown: r6');
    check('only the shown flag is a tab stop', (await flags.evaluateAll(els => els.map(el => el.tabIndex).join(','))) === '-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    check('Right shows the next', (await page.locator('.tl-releases-told').textContent()) === 'shown: r7' && (await page.evaluate(() => document.activeElement?.closest('.mx-timeline__flag')?.querySelector('.mx-timeline__date')?.textContent)) === 'Jul 2026');
    await page.keyboard.press('End');
    await page.waitForTimeout(400);
    check('End shows the last and scrolls it into view', (await page.locator('.tl-releases-told').textContent()) === 'shown: r12' && (await flags.nth(11).evaluate(el => {
        const r = el.getBoundingClientRect();
        const t = el.closest('.mx-timeline__track').getBoundingClientRect();
        return r.left >= t.left - 0.5 && r.right <= t.right + 0.5;
    })));
    await page.keyboard.press('Home');
    await page.waitForTimeout(400);
    check('Home shows the first', (await page.locator('.tl-releases-told').textContent()) === 'shown: r1');
    // The track buttons scroll the dates; Earlier is off at the start.
    const earlier = releases.locator('.mx-timeline__nav[data-direction="previous"]');
    const later = releases.locator('.mx-timeline__nav[data-direction="next"]');
    const scrolled = async () => releases.locator('.mx-timeline__track').evaluate(el => el.scrollLeft);
    check('at the start Earlier is off and Later on', (await earlier.getAttribute('aria-disabled')) === 'true' && (await later.getAttribute('aria-disabled')) === null && (await earlier.getAttribute('aria-label')) === 'Earlier' && (await later.getAttribute('aria-label')) === 'Later');
    const navRect = await rect(later);
    const trackRect = await rect(releases.locator('.mx-timeline__track'));
    check('the track buttons are centred on the track', Math.abs(navRect.top + navRect.height / 2 - (trackRect.top + trackRect.height / 2)) <= 0.5, `${navRect.top + navRect.height / 2} vs ${trackRect.top + trackRect.height / 2}`);
    await later.click();
    await page.waitForTimeout(600);
    check('Later scrolls the track and turns Earlier on', (await scrolled()) > 50 && (await earlier.getAttribute('aria-disabled')) === null, String(await scrolled()));

    // Any content: a button in a card, an icon in a dot, a date with its time.
    const orders = page.locator('.tl-orders');
    await orders.scrollIntoViewIfNeeded();
    const orderDates = await orders.locator('.mx-timeline__date').allTextContents();
    check('a date with its time', orderDates[0] === 'Nov 2, 2026, 9:15 AM', orderDates.join(' | '));
    await orders.locator('.mx-timeline__content .mx-button').nth(1).click();
    check('a button in a card works', (await page.locator('.tl-orders-told').textContent()) === 'Track it pressed');
    check('a card without a description has none shown', await orders.locator('.mx-timeline__item').nth(1).locator('.mx-timeline__description').isHidden());

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
