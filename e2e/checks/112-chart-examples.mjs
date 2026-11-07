/** Real-browser checks of the examples on the chart pages: what each one claims to show, and labels that stay inside the chart. */
export default async function ({ page, base, check }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    const open = async (path, cls) => {
        await page.goto(base + path, { waitUntil: 'load' });
        const chart = page.locator('.' + cls);
        await chart.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        return chart;
    };
    const center = el => el.evaluate(node => {
        const b = node.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    });
    // Every label of the axes and the values lies inside the chart's own box.
    const inside = chart => chart.evaluate(el => {
        const box = el.getBoundingClientRect();
        const out = [...el.querySelectorAll('.mx-chart__ticks text, .mx-chart__labels text')].filter(t => {
            const b = t.getBoundingClientRect();
            return b.width > 0 && (b.left < box.left - 0.5 || b.right > box.right + 0.5);
        });
        return out.map(t => t.textContent);
    });

    // Pie: a chosen part is told with its share.
    let chart = await open('chart/pie', 'ch-pie-choose');
    const slice = await center(chart.locator('.mx-chart__slice').first());
    await page.mouse.click(slice.x, slice.y);
    await page.waitForTimeout(200);
    const pie = await page.locator('.ch-pie-told').textContent();
    check('a chosen part of the pie is told with its share', /^Rent: .+, 50% of the month$/.test(pie), pie);
    chart = page.locator('.ch-pie-labels');
    const shares = await chart.locator('.mx-chart__labels text').count();
    check('the ring writes a share on the parts that have room', shares >= 4, `${shares} labels`);

    // Funnel: a click tells the conversion from the first stage; another period moves the stages.
    chart = await open('chart/funnel', 'ch-funnel-labels');
    const stage = chart.locator('.mx-chart__slice').last();
    const hired = await center(stage);
    await page.mouse.click(hired.x, hired.y);
    await page.waitForTimeout(200);
    const funnel = await page.locator('.ch-funnel-told').textContent();
    check('a click on a stage tells how many of the first got that far', funnel.startsWith('Hired: 21 people, 2.5%'), funnel);
    chart = page.locator('.ch-funnel-periods');
    await chart.scrollIntoViewIfNeeded();
    const before = await chart.locator('.mx-chart__labels text').first().textContent();
    await page.locator('.docs-wide').filter({ has: chart }).getByRole('button', { name: 'April' }).click();
    await page.waitForTimeout(700);
    const after = await chart.locator('.mx-chart__labels text').first().textContent();
    check('another period redraws the funnel with its own values', before.startsWith('5,200') && after.startsWith('6,100'), `${before} → ${after}`);

    // Candles: buttons zoom to a stretch; a long time axis keeps its labels inside.
    chart = await open('chart/candles', 'ch-candles-periods');
    check('the labels of a year of days stay inside the chart', (await inside(chart)).length === 0, (await inside(chart)).join(', '));
    const group = page.locator('.docs-wide').filter({ has: chart });
    await group.getByRole('button', { name: '1 month' }).click();
    await page.waitForTimeout(400);
    const month = await chart.locator('.mx-chart__ticks text').allTextContents();
    check('1 month zooms to the latest days', month.some(t => t.includes('Sep')) && !month.some(t => t.includes('Jan')), month.join(' | '));
    await group.getByRole('button', { name: 'All' }).click();
    await page.waitForTimeout(400);
    const all = await chart.locator('.mx-chart__ticks text').allTextContents();
    check('All shows the whole year again', all.some(t => t.includes('Jan')), all.join(' | '));
    const volume = await page.locator('.ch-candles-volume .mx-chart__grid').evaluate(el => el.getBoundingClientRect().height);
    check('the volume under the prices has room to read', volume >= 90, `${Math.round(volume)} px of plot`);

    // Ranges: series with rows of their own fall into the order of the chart's months.
    chart = await open('chart/ranges', 'ch-range-forecast');
    const months = await chart.locator('.mx-chart__ticks text').allTextContents();
    const order = months.filter(t => /^[A-Z][a-z]{2}$/.test(t));
    check('the forecast keeps the months in order', order.join() === 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', order.join());
    chart = page.locator('.ch-range-timeline');
    await chart.scrollIntoViewIfNeeded();
    check('the plan draws a bar for each task', (await chart.locator('.mx-chart__bars').evaluate(el => (el.getAttribute('d') ?? '').split('M').length - 1)) === 5);

    // Radar: the ring values carry a halo over the shapes.
    chart = await open('chart/radar', 'ch-radar-target');
    const halo = await chart.locator('.mx-chart__ring-values text').first().evaluate(t => getComputedStyle(t).paintOrder);
    check('the ring values of a radar are drawn with a halo', halo.startsWith('stroke'), halo);

    // Scatter: chosen cities are compared.
    chart = await open('chart/scatter', 'ch-scatter-choose');
    await chart.locator('.mx-chart__plot').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const cities = await page.locator('.ch-scatter-told').textContent();
    check('cities chosen with the keyboard are compared', cities.split(' · ').length === 2 && cities.includes('% of the salary'), cities);

    // Waterfall on its side: names in full, labels inside.
    chart = await open('chart/waterfall', 'ch-waterfall-bridge');
    const names = await chart.locator('.mx-chart__ticks text').allTextContents();
    check('a waterfall on its side writes the step names in full', names.includes('Profit last year') && names.includes('Profit this year'), names.join(' | '));
    check('and its labels stay inside the chart', (await inside(chart)).length === 0, (await inside(chart)).join(', '));

    // Zoom on categories with zoomTo.
    chart = await open('chart/zoom', 'ch-zoom-weeks');
    await page.locator('.docs-wide').filter({ has: chart }).getByRole('button', { name: 'Last 12 weeks' }).click();
    await page.waitForTimeout(400);
    const weeks = await chart.locator('.mx-chart__ticks text').allTextContents();
    check('zoomTo shows the last twelve weeks', weeks.includes('W41') && !weeks.some(t => t === 'W1' || t === 'W39'), weeks.join(' | '));
}
