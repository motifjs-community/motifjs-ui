/** Real-browser checks of Sparkline and Gauge. */
export default async function ({ page, base, check }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'sparkline', { waitUntil: 'load' });
    const spark = page.locator('.sp-table .mx-sparkline').first();
    await spark.waitFor();
    await page.waitForTimeout(300);
    const line = await spark.evaluate(el => {
        const row = el.closest('tr').getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return { offset: Math.abs(box.top + box.height / 2 - (row.top + row.height / 2)), name: el.getAttribute('aria-label'), path: el.querySelector('.mx-sparkline__line').getAttribute('d')?.length ?? 0 };
    });
    check('a sparkline sits in the middle of its row, drawn and named by its values', line.offset <= 1.5 && line.path > 20 && /9[.,]1/.test(line.name), JSON.stringify(line));
    const kinds = await page.locator('.sp-winloss .mx-sparkline').evaluate(el => ({ rise: !!el.querySelector('.mx-sparkline__rise').getAttribute('d'), fall: !!el.querySelector('.mx-sparkline__fall').getAttribute('d') }));
    check('wins and losses draw both ways', kinds.rise && kinds.fall);
    const marks = page.locator('.sp-marks .mx-sparkline');
    // The mouse only reaches what is on screen.
    await marks.scrollIntoViewIfNeeded();
    const box = await marks.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(80);
    check('the value under the pointer shows above it', await marks.locator('.mx-sparkline__tip').isVisible());
    await page.mouse.move(0, 0);

    await page.goto(base + 'gauge/ranges', { waitUntil: 'load' });
    const gauge = page.locator('.ga-ranges');
    await gauge.waitFor();
    await page.waitForTimeout(300);
    check('a gauge is a meter with the range of its value', (await gauge.getAttribute('role')) === 'meter' && (await gauge.getAttribute('aria-valuetext')).includes('normal'), await gauge.getAttribute('aria-valuetext'));
    const before = await gauge.locator('.mx-gauge__fill').getAttribute('d');
    const slider = page.getByRole('slider', { name: 'CPU' });
    await slider.focus();
    for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowRight');
    const frames = await gauge.evaluate(el => new Promise(done => {
        const fill = el.querySelector('.mx-gauge__fill');
        const seen = new Set();
        const start = performance.now();
        const look = () => {
            seen.add(fill.getAttribute('d'));
            if (performance.now() - start < 400) requestAnimationFrame(look);
            else done(seen.size);
        };
        look();
    }));
    await page.waitForTimeout(300);
    check('a new value moves the fill and changes its tone and what is read', (await gauge.locator('.mx-gauge__fill').getAttribute('d')) !== before && (await gauge.getAttribute('aria-valuetext')).includes('critical'), `${await gauge.getAttribute('aria-valuetext')}, ${frames} frames`);

    // A drag drives the value: the fill keeps up with the slider in the same frame, it does not trail behind.
    const thumb = await slider.boundingBox();
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
    await page.mouse.down();
    let worst = 0;
    for (let i = 1; i <= 20; i++) {
        await page.mouse.move(thumb.x + thumb.width / 2 - i * 8, thumb.y + thumb.height / 2);
        await page.waitForTimeout(16);
        // The first step comes alone and still moves; the ones after it come quicker than the motion.
        if (i < 3) continue;
        worst = Math.max(worst, await gauge.evaluate(el => {
            // The moving end of the fill, as a share of the 240 degree arc.
            const [x, y] = el.querySelector('.mx-gauge__fill').getAttribute('d').split('L')[0].split(' ').slice(-2).map(Number);
            const box = el.querySelector('.mx-gauge__svg').viewBox.baseVal;
            const angle = (Math.atan2(x - box.width / 2, box.width / 2 - y) * 180) / Math.PI;
            return Math.abs(((angle + 120) / 240) * 100 - Number(el.getAttribute('aria-valuenow')));
        }));
    }
    await page.mouse.up();
    check('while a slider drags it, the fill keeps up with the value', worst <= 1, `${worst.toFixed(1)} apart at worst`);

    await page.goto(base + 'gauge/circular', { waitUntil: 'load' });
    await page.locator('.ga-needle-value').waitFor();
    await page.waitForTimeout(300);
    const needle = await page.locator('.ga-needle-value').evaluate(el => {
        const hub = el.querySelector('.mx-gauge__needle').getBoundingClientRect();
        const value = el.querySelector('.mx-gauge__value').getBoundingClientRect();
        return { apart: value.top >= hub.bottom - 1 };
    });
    check('with a needle the value stays clear of its hub', needle.apart, JSON.stringify(needle));
    await page.goto(base + 'gauge/linear', { waitUntil: 'load' });
    await page.locator('.ga-linear').waitFor();
    await page.waitForTimeout(300);
    const bar = await page.locator('.ga-linear').evaluate(el => {
        const track = el.querySelector('.mx-gauge__track').getBoundingClientRect();
        const fill = el.querySelector('.mx-gauge__fill').getBoundingClientRect();
        return Math.round((fill.width / track.width) * 100);
    });
    check('a bar fills as far as its value: 72 of 128', Math.abs(bar - 56) <= 1, String(bar));
}
