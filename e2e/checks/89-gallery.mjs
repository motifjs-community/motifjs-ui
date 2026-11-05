/** Real-browser checks of the gallery page. */
export default async function ({ page, base, check, axeSource }) {
    await page.goto(base + 'gallery', { waitUntil: 'load' });
    const trip = page.locator('.ga-trip');
    await trip.waitFor();
    const viewport = trip.locator('.mx-gallery__viewport');
    // Where the first pane stands against the viewport: 0 at rest, minus a pane and a gap per step.
    const offset = g => g.evaluate(el => el.querySelector('.mx-gallery__item').getBoundingClientRect().left - el.querySelector('.mx-gallery__viewport').getBoundingClientRect().left);
    const current = g => g.locator('.mx-gallery__dot[aria-current]').evaluate(el => Array.from(el.parentElement.children).indexOf(el));
    const width = await viewport.evaluate(el => el.clientWidth);
    const gap = await trip.locator('.mx-gallery__track').evaluate(el => parseFloat(getComputedStyle(el).gap) || 0);
    const step = width + gap;
    check('a carousel region named by its label, one slide in view, the others hidden', (await trip.getAttribute('role')) === 'region' && (await trip.getAttribute('aria-roledescription')) === 'carousel' && (await trip.getAttribute('aria-label')) === 'A trip' && (await trip.locator('.mx-gallery__item[aria-hidden="true"]').count()) === 4);
    check('the slides are named with their place, the dots too', (await trip.locator('.mx-gallery__item').nth(1).getAttribute('aria-label')) === 'Slide 2 of 5' && (await trip.locator('.mx-gallery__dot').nth(1).getAttribute('aria-label')) === 'Slide 2 of 5');
    check('at the start the previous button is disabled, not the next', (await trip.locator('.mx-gallery__nav[data-direction="previous"]').getAttribute('aria-disabled')) === 'true' && (await trip.locator('.mx-gallery__nav[data-direction="next"]').getAttribute('aria-disabled')) === null);

    // The next button slides the track one pane over; the dot and the readers follow.
    await trip.locator('.mx-gallery__nav[data-direction="next"]').click();
    await page.waitForTimeout(450);
    let at = await offset(trip);
    check('next slides the track one pane over', Math.abs(at + step) <= 1, `${at} vs -${step}`);
    check('the second slide is in view and its dot is current', (await current(trip)) === 1 && (await trip.locator('.mx-gallery__item').nth(1).getAttribute('aria-hidden')) === null && (await trip.locator('.mx-gallery__item').nth(0).getAttribute('aria-hidden')) === 'true');

    // The keys on the panes: Right, End; at the end the next button is disabled.
    await viewport.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('End');
    await page.waitForTimeout(450);
    check('Right and End move to the third and the last slide', (await current(trip)) === 4 && (await trip.locator('.mx-gallery__nav[data-direction="next"]').getAttribute('aria-disabled')) === 'true' && Math.abs((await offset(trip)) + 4 * step) <= 1);
    await page.keyboard.press('Home');
    await page.waitForTimeout(450);
    check('Home goes back to the first', (await current(trip)) === 0 && Math.abs(await offset(trip)) <= 1);

    // A drag with the mouse, far enough, lands on the next slide; a short one snaps back.
    const box = await viewport.boundingBox();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, y, { steps: 3 });
    const during = await offset(trip);
    check('while dragging the track follows the pointer', during < -20 && (await trip.locator('.mx-gallery__track').getAttribute('data-dragging')) === '', String(during));
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    check('let go far enough: the next slide is in view', (await current(trip)) === 1 && Math.abs((await offset(trip)) + step) <= 1);
    await page.mouse.move(box.x + box.width * 0.5, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.47, y, { steps: 3 });
    // Held still before letting go: a slow, short drag, not a flick.
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(450);
    at = await offset(trip);
    check('a short drag snaps back', (await current(trip)) === 1 && Math.abs(at + step) <= 1, String(at));

    // A loop goes around the ends; the slideshow moves on by itself, waits under the pointer, and its button pauses it.
    const show = page.locator('.ga-show');
    const told = page.locator('.ga-show-told');
    await show.scrollIntoViewIfNeeded();
    await show.locator('.mx-gallery__viewport').focus();
    await page.keyboard.press('Home');
    await page.waitForTimeout(450);
    await show.locator('.mx-gallery__nav[data-direction="previous"]').click();
    await page.waitForTimeout(900);
    check('previous on the first slide of a loop goes to the last', (await current(show)) === 2 && (await told.textContent()).startsWith('in view: 2'), await told.textContent());
    check('the slideshow is on, with its button saying pause', (await show.getAttribute('data-playing')) === '' && (await show.locator('.mx-gallery__play').getAttribute('aria-label')) === 'Pause the slideshow');
    check('with focus inside it waits', (await show.locator('.mx-gallery__viewport').getAttribute('aria-live')) === 'polite');
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForFunction(() => document.querySelector('.ga-show-told').textContent.includes('moved by the slideshow'), null, { timeout: 6000 }).catch(() => {});
    check('left alone, the slideshow moves on', (await told.textContent()).includes('moved by the slideshow'), await told.textContent());
    await show.hover();
    const paused = await current(show);
    await page.waitForTimeout(3000);
    check('under the pointer it waits', (await current(show)) === paused && (await show.locator('.mx-gallery__viewport').getAttribute('aria-live')) === 'polite');
    await show.locator('.mx-gallery__play').click();
    check('the button pauses it', (await show.getAttribute('data-playing')) === null && (await show.locator('.mx-gallery__play').getAttribute('aria-label')) === 'Start the slideshow');

    // Several per page: three panes share the width, with the gap between them.
    const wide = page.locator('.ga-wide');
    await wide.scrollIntoViewIfNeeded();
    const measure = await wide.evaluate(el => {
        const items = Array.from(el.querySelectorAll('.mx-gallery__item'));
        const g = parseFloat(getComputedStyle(el.querySelector('.mx-gallery__track')).gap) || 0;
        const vw = el.querySelector('.mx-gallery__viewport').clientWidth;
        return { widths: items.map(i => i.getBoundingClientRect().width), gap: g, vw, hidden: items.map(i => i.getAttribute('aria-hidden')) };
    });
    const want = (measure.vw - 2 * measure.gap) / 3;
    check('three panes share the width, the gap between them', measure.widths.every(w => Math.abs(w - want) <= 1) && measure.hidden.join() === ',,,true,true,true,true', `${measure.widths.map(w => w.toFixed(1))} vs ${want.toFixed(1)}`);
    await wide.locator('.mx-gallery__viewport').focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(450);
    check('the keys stop when the last pane is in view', (await current(wide)) === 4 && (await wide.locator('.mx-gallery__nav[data-direction="next"]').getAttribute('aria-disabled')) === 'true');

    // Any content: a press on the pane is told, the button in it is its own.
    const plans = page.locator('.ga-plans');
    await plans.scrollIntoViewIfNeeded();
    await plans.locator('.ga-plan-price').first().click();
    check('a press on a pane is told', (await page.locator('.ga-plans-told').textContent()) === 'pane 1 pressed');
    await plans.getByRole('button', { name: 'Choose' }).first().click();
    check('the button in the pane works on its own', (await page.locator('.ga-plans-told').textContent()) === 'Starter chosen');

    // Programmatically: the app's own buttons move it.
    const rooms = page.locator('.ga-rooms');
    await rooms.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Garden' }).click();
    await page.waitForTimeout(450);
    check('goTo by key from the app', (await page.locator('.ga-rooms-told').textContent()) === 'slide 3 of 3' && (await rooms.locator('.mx-gallery__item').nth(2).getAttribute('aria-hidden')) === null);

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map(v => v.id));
    check('axe clean', violations.length === 0, violations.join(', '));
}
