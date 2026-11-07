/** Real-browser checks of the chart types beyond lines and bars: parts of a whole, radar, heat map, candles, waterfall. */
export default async function ({ page, base, check }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'chart', { waitUntil: 'load' });
    await page.locator('.ch-parts').waitFor();
    await page.waitForTimeout(400);

    // A donut: the pointer on a slice brings it forward and names it, next to the pointer.
    const parts = page.locator('.ch-parts');
    await parts.scrollIntoViewIfNeeded();
    const slice = await parts.locator('.mx-chart__slice').first().evaluate(el => {
        const b = el.getBoundingClientRect();
        return { x: b.left + b.width * 0.8, y: b.top + b.height * 0.5 };
    });
    await page.mouse.move(slice.x, slice.y);
    await page.waitForTimeout(100);
    const told = await parts.evaluate((el, at) => {
        const tip = el.querySelector('.mx-chart__tooltip').getBoundingClientRect();
        return { rows: el.querySelectorAll('.mx-chart__tooltip-row').length, near: Math.abs(tip.top + tip.height / 2 - at.y) < tip.height, value: el.querySelector('.mx-chart__tooltip-value')?.textContent, active: !!el.querySelector('.mx-chart__active-slice').getAttribute('d') };
    }, slice);
    check('a slice under the pointer is named alone, with its share, next to the pointer', told.rows === 1 && told.near && told.value.includes('%') && told.active, JSON.stringify(told));
    await page.mouse.move(0, 0);
    const before = await parts.locator('.mx-chart__slice').count();
    await parts.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForTimeout(100);
    const shares = await parts.locator('.mx-chart__labels text').allTextContents();
    check('hiding a part shares the whole among the others', (await parts.locator('.mx-chart__slice').count()) === before - 1 && !shares.includes('46%'), shares.join(' '));
    await parts.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('radio', { name: 'Pie', exact: true }).or(page.getByRole('button', { name: 'Pie', exact: true })).first().click();
    await page.waitForTimeout(120);
    check('the same parts as a pie, with no total in a hole', (await parts.locator('.mx-chart__slice').count()) === before && (await parts.locator('.mx-chart__center-value').count()) === 0);

    // A funnel: stages top to bottom, each narrower, centered on one line.
    const stages = await page.locator('.ch-funnel .mx-chart__slice').evaluateAll(els => els.map(el => { const b = el.getBoundingClientRect(); return { top: b.top, width: b.width, middle: b.left + b.width / 2 }; }));
    const centered = stages.every(s => Math.abs(s.middle - stages[0].middle) <= 0.75);
    check('a funnel narrows down the page, its stages on one center line', stages.length === 5 && stages.every((s, i) => !i || (s.top > stages[i - 1].top && s.width < stages[i - 1].width)) && centered, JSON.stringify(stages.map(s => Math.round(s.width))));

    // A radar: no label covers another.
    const crowded = await page.locator('.ch-radar').evaluate(el => {
        const boxes = [...el.querySelectorAll('.mx-chart__ticks text')].map(t => t.getBoundingClientRect());
        return boxes.some((a, i) => boxes.slice(i + 1).some(b => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom));
    });
    check('the names and the rings of a radar do not cover each other', !crowded);

    // A heat map: one cell under the pointer, its own value.
    const heat = page.locator('.ch-heat');
    await heat.scrollIntoViewIfNeeded();
    const cell = await heat.evaluate(el => {
        const plot = el.querySelector('.mx-chart__plot').getBoundingClientRect();
        return { x: plot.left + plot.width * 0.6, y: plot.top + plot.height * 0.4 };
    });
    await page.mouse.move(cell.x, cell.y);
    await page.waitForTimeout(100);
    check('a heat map names the one cell under the pointer', (await heat.locator('.mx-chart__tooltip-row').count()) === 1);
    await page.mouse.move(0, 0);
    const cellBoxes = await heat.locator('.mx-chart__cell').evaluateAll(els => els.length);
    check('seven colors at most, one path each', cellBoxes > 1 && cellBoxes <= 7, String(cellBoxes));

    // Candles: a rising one is hollow, a falling one filled.
    const candles = await page.locator('.ch-candles').evaluate(el => {
        const rise = getComputedStyle(el.querySelector('.mx-chart__rise'));
        const fall = getComputedStyle(el.querySelector('.mx-chart__fall'));
        return { riseFill: rise.fill, riseStroke: rise.stroke, fallFill: fall.fill, fallStroke: fall.stroke };
    });
    check('a rising candle is hollow and a falling one filled, in two colors', candles.riseFill !== candles.riseStroke && candles.fallFill === candles.fallStroke && candles.riseStroke !== candles.fallStroke, JSON.stringify(candles));

    // A waterfall: the line between the steps, and totals that start at zero.
    const fall = await page.locator('.ch-waterfall').evaluate(el => ({ connectors: (el.querySelector('.mx-chart__line').getAttribute('d') ?? '').split('M').length - 1, signs: [...el.querySelectorAll('.mx-chart__labels text')].map(t => t.textContent) }));
    check('a waterfall joins its steps and signs its changes', fall.connectors === 7 && fall.signs.some(t => t.startsWith('+')) && fall.signs.some(t => /^[-−]/.test(t)), JSON.stringify(fall));

    // The keyboard reaches a part as it reaches a position.
    await parts.locator('.mx-chart__plot').focus();
    await page.keyboard.press('ArrowRight');
    const said = await parts.locator('[role="status"]').textContent();
    check('the arrows walk the parts and say each one', said.includes('Direct'), said);
}
