/** Real-browser checks of zoom on 100,000 values, live data, references and choosing values. */
export default async function ({ page, base, check }) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + 'chart', { waitUntil: 'load' });
    const zoom = page.locator('.ch-zoom');
    await zoom.waitFor();
    await zoom.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const told = page.locator('.ch-zoom-told');
    const path = () => zoom.locator('.mx-chart__line').getAttribute('d');

    // A drag across the plot zooms in, quickly, and shows the reset button.
    const box = await zoom.locator('.mx-chart__plot').boundingBox();
    const before = await path();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.3, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, y, { steps: 5 });
    check('a band follows the drag', !!(await zoom.locator('.mx-chart__brush').getAttribute('d')));
    const started = Date.now();
    await page.mouse.up();
    await page.waitForFunction(old => document.querySelector('.ch-zoom .mx-chart__line')?.getAttribute('d') !== old, before);
    const took = Date.now() - started;
    check('a zoom into 100,000 values is drawn in under half a second', took < 500, `${took} ms`);
    check('the zoom is told, and the band is gone', (await told.textContent()) !== 'All of it' && !(await zoom.locator('.mx-chart__brush').getAttribute('d')), await told.textContent());
    const reset = zoom.getByRole('button', { name: 'Reset zoom' });
    check('a button shows all of it again', await reset.isVisible());
    check('the click that ended the drag chose nothing', !(await zoom.locator('.mx-chart__selected').getAttribute('d')));

    // Ctrl and the wheel zoom further around the pointer; Shift and the wheel move along.
    const narrow = await told.textContent();
    await page.mouse.move(box.x + box.width / 2, y);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -120);
    await page.keyboard.up('Control');
    await page.waitForTimeout(150);
    check('Ctrl and the wheel zoom in further', (await told.textContent()) !== narrow);
    const here = await told.textContent();
    await page.keyboard.down('Shift');
    await page.mouse.wheel(0, 120);
    await page.keyboard.up('Shift');
    await page.waitForTimeout(150);
    check('Shift and the wheel move along', (await told.textContent()) !== here);
    const page0 = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(150);
    check('the wheel alone still scrolls the page', (await page.evaluate(() => window.scrollY)) > page0);
    await zoom.scrollIntoViewIfNeeded();
    await reset.click();
    await page.waitForTimeout(150);
    check('reset shows all of it, and the button goes', (await told.textContent()) === 'All of it' && !(await reset.isVisible()));

    // The keyboard zooms around the value it is on.
    await zoom.locator('.mx-chart__plot').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('+');
    await page.waitForTimeout(150);
    check('+ zooms in with the keyboard', (await told.textContent()) !== 'All of it');
    await page.keyboard.press('0');
    await page.waitForTimeout(150);
    check('0 shows all of it again', (await told.textContent()) === 'All of it');

    // Live data: new values arrive, and the axis moves on.
    const stream = page.locator('.ch-stream');
    await stream.scrollIntoViewIfNeeded();
    // The labels sit on round moments, so in two seconds they move along rather than change.
    const placeOf = () => stream.evaluate(el => ({ x: el.querySelector('.mx-chart__ticks text')?.getAttribute('x'), line: el.querySelector('.mx-chart__line').getAttribute('d') }));
    const first = await placeOf();
    await page.waitForTimeout(2300);
    const later = await placeOf();
    check('live data moves the axis on and draws the new values', first.x !== later.x && first.line !== later.line, `${first.x} → ${later.x}`);
    await stream.locator('xpath=..').getByRole('button', { name: 'Pause' }).click();

    // References: a dashed line with its label, and a band under the bars.
    const refs = await page.locator('.ch-refs').evaluate(el => ({
        dash: getComputedStyle(el.querySelector('.mx-chart__reference')).strokeDasharray,
        band: !!el.querySelector('.mx-chart__reference-band').getAttribute('d'),
        under: el.querySelector('.mx-chart__reference-band').compareDocumentPosition(el.querySelector('.mx-chart__marks')) & Node.DOCUMENT_POSITION_FOLLOWING,
        labels: [...el.querySelectorAll('.mx-chart__reference-label text')].map(t => t.textContent)
    }));
    check('a reference line is dashed and named, a band lies under the marks', refs.dash !== 'none' && refs.band && !!refs.under && refs.labels.join() === 'Target,Summer sale', JSON.stringify(refs));

    // Choosing: a click puts a ring around a bar and tells.
    const pick = page.locator('.ch-select');
    await pick.scrollIntoViewIfNeeded();
    const bar = await pick.evaluate(el => {
        const b = el.querySelector('.mx-chart__bars').getBoundingClientRect();
        return { x: b.left + 6, y: b.bottom - 6 };
    });
    await page.mouse.click(bar.x, bar.y);
    await page.waitForTimeout(80);
    check('a click chooses a value, with a ring around it', (await page.locator('.ch-select-told').textContent()) === 'Jan' && !!(await pick.locator('.mx-chart__selected').getAttribute('d')), await page.locator('.ch-select-told').textContent());
    await page.mouse.click(bar.x, bar.y);
    await page.waitForTimeout(80);
    check('a second click lets it go', (await page.locator('.ch-select-told').textContent()) === 'Nothing chosen');
}
