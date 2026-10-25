/** Real-browser checks of the slider page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'slider', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const now = (loc) => loc.evaluate((el) => Number(el.getAttribute('aria-valuenow')));
  // Measured in view: the mouse works in viewport coordinates.
  const at = async (loc) => {
    await loc.scrollIntoViewIfNeeded();
    return box(loc);
  };
  const center = async (loc) => {
    const b = await at(loc);
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  };

  const ways = page.locator('section[aria-labelledby="ways"]');
  const volume = ways.getByRole('slider', { name: 'Volume' });
  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('PageUp');
  check('the keys move the thumb and x-model follows', (await ways.locator('.mx-field__message').textContent()) === 'Volume: 51');
  const track = ways.locator('.mx-slider__track').first();
  const t = await at(track);
  await page.mouse.click(t.left + t.width * 0.75, t.top + t.height / 2);
  check('a press on the track moves the thumb there', Math.abs((await now(volume)) - 75) <= 1, String(await now(volume)));
  const thumbAt = await center(volume);
  check('…and the thumb is drawn under the pointer', Math.abs(thumbAt.x - (t.left + t.width * 0.75)) < 2, `${thumbAt.x}`);
  await page.mouse.move(thumbAt.x + 3, thumbAt.y);
  await page.mouse.down();
  await page.mouse.move(t.left + t.width * 0.25 + 3, thumbAt.y, { steps: 4 });
  check('a drag moves the thumb without a jump where it was grabbed', Math.abs((await now(volume)) - 25) <= 1, String(await now(volume)));
  await page.mouse.move(t.left - 200, thumbAt.y + 120, { steps: 3 });
  check('the pointer is captured: far outside, the thumb stops at the end', (await now(volume)) === 0);
  await page.mouse.up();
  await volume.evaluate((el) => el.blur());
  await page.mouse.click(t.left + t.width * 0.5, t.top + t.height / 2);
  check('a press focuses the thumb, without the keyboard ring', await volume.evaluate((el) => document.activeElement === el && !el.matches(':focus-visible')));

  const range = page.locator('section[aria-labelledby="range"]');
  const [start, end] = [range.getByRole('slider', { name: 'Price Minimum' }), range.getByRole('slider', { name: 'Price Maximum' })];
  check('two thumbs named by the label and their end', (await start.count()) === 1 && (await end.count()) === 1);
  await start.focus();
  await page.keyboard.press('End');
  check('the start thumb stops minDistance before the end one', (await range.locator('.sl-price').textContent()) === 'value: [330, 380]');
  check('…and says so in aria-valuemax', (await start.getAttribute('aria-valuemax')) === '330');
  const e = await center(end);
  await page.mouse.move(e.x, e.y);
  await page.mouse.down();
  await page.mouse.move(e.x - 300, e.y, { steps: 5 });
  await page.mouse.up();
  check('the end thumb cannot be dragged past the start one', (await range.locator('.sl-price').textContent()) === 'value: [330, 380]');
  const rt = await at(range.locator('.mx-slider__track'));
  await page.mouse.click(rt.left + 4, rt.top + rt.height / 2);
  check('a press near the start moves the start thumb', (await range.locator('.sl-price').textContent()) === 'value: [10, 380]' && (await start.evaluate((el) => document.activeElement === el)));
  await page.keyboard.press('Tab');
  check('Tab goes from the start thumb to the end thumb', await end.evaluate((el) => document.activeElement === el));
  const bubble = end.locator('.mx-slider__bubble');
  await page.waitForTimeout(200);
  check('the value bubble shows while a key moves the thumb', (await bubble.evaluate((el) => getComputedStyle(el).visibility)) === 'visible' && (await bubble.textContent()) === '€380');
  const [bb, eb] = [await box(bubble), await box(end)];
  check('…centered over the thumb', Math.abs(bb.left + bb.width / 2 - (eb.left + eb.width / 2)) < 1.5 && bb.bottom <= eb.top);

  const ticks = page.locator('section[aria-labelledby="ticks"]');
  const zoom = ticks.locator('.mx-slider').first();
  const labels = await zoom.locator('.mx-slider__tick-label').allTextContents();
  check('every step has a mark and a formatted label', labels.join(' ') === '25% 50% 75% 100% 125% 150% 175% 200%', labels.join(' '));
  const zoomThumb = zoom.getByRole('slider');
  const [zt, last] = [await center(zoomThumb), await box(zoom.locator('.mx-slider__tick').nth(3))];
  check('the marks line up with the thumb positions', Math.abs(zt.x - last.left) < 1.5, `${zt.x} vs ${last.left}`);
  check('the zoom slider writes its value for screen readers', (await zoomThumb.getAttribute('aria-valuetext')) === '100%');

  const bubbles = page.locator('section[aria-labelledby="bubble"]');
  await bubbles.getByRole('button', { name: 'always', exact: true }).click();
  await page.waitForTimeout(200);
  const temp = bubbles.getByRole('slider', { name: 'Temperature' });
  check('showValue="always" shows the bubble without focus', (await temp.locator('.mx-slider__bubble').evaluate((el) => getComputedStyle(el).visibility)) === 'visible');
  check('valueText gives screen readers their own words', (await temp.getAttribute('aria-valuetext')) === '21 degrees');
  const labelBox = await box(bubbles.locator('.mx-field__label'));
  const tempBubble = await box(temp.locator('.mx-slider__bubble'));
  check('…and room is kept for it under the label', tempBubble.top >= labelBox.bottom, `${tempBubble.top} vs ${labelBox.bottom}`);

  const vertical = page.locator('section[aria-labelledby="vertical"]');
  const bass = vertical.getByRole('slider', { name: 'Bass' });
  const before = await center(bass);
  await bass.focus();
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(200);
  const after = await center(bass);
  check('vertical: the Up arrow moves the thumb up', (await now(bass)) === 5 && after.y < before.y && (await bass.getAttribute('aria-orientation')) === 'vertical');
  const vt = await at(vertical.locator('.mx-slider__track').first());
  await page.mouse.click(vt.left + vt.width / 2, vt.top + 1);
  check('vertical: a press near the top is near the most', (await now(bass)) >= 11, String(await now(bass)));

  const update = page.locator('section[aria-labelledby="update-on"]');
  const onRelease = update.getByRole('slider', { name: 'On release' });
  const ut = await at(update.locator('.mx-slider__track').nth(1));
  await page.mouse.move(ut.left + ut.width * 0.5, ut.top + ut.height / 2);
  await page.mouse.down();
  await page.mouse.move(ut.left + ut.width * 0.9, ut.top + ut.height / 2, { steps: 4 });
  const moving = [await update.locator('.sl-committed').textContent(), await now(onRelease)];
  await page.mouse.up();
  check('updateOn="change": the thumb moves, the value waits for the release', moving[0] === 'on release: 50' && moving[1] === 90, moving.join(' / '));
  check('…and changes on release', (await update.locator('.sl-committed').textContent()) === 'on release: 90');

  const states = page.locator('section[aria-labelledby="states"]');
  await states.getByRole('button', { name: 'Toggle' }).click();
  const readOnly = states.getByRole('slider', { name: 'Read-only' });
  await readOnly.focus();
  await page.keyboard.press('ArrowRight');
  check('a read-only slider takes focus, not changes', (await now(readOnly)) === 30 && (await readOnly.getAttribute('aria-readonly')) === 'true');
  const disabled = states.locator('.mx-slider[data-disabled] [role="slider"]');
  check('a disabled slider leaves the Tab order', (await disabled.count()) === 2 && (await disabled.first().getAttribute('tabindex')) === '-1');
  const age = states.getByRole('slider', { name: 'Age' });
  await age.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(50);
  check('validation shows its message and marks the thumb', (await states.locator('.mx-field__message').last().textContent()) === 'You must be 18 or older.' && (await age.getAttribute('aria-invalid')) === 'true');

  await page.addScriptTag({ content: axeSource });
  await page.waitForTimeout(300);
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`));
  check('axe clean with ranges, bubbles, read-only, disabled and an error shown', violations.length === 0, violations.join(', '));

  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await volume.focus();
  const v0 = await now(volume);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(200);
  const rtlThumb = await center(volume);
  const rtlTrack = await at(track);
  check('right to left: Left is more and the track grows to the left', (await now(volume)) === v0 + 1 && Math.abs(rtlThumb.x - (rtlTrack.right - (rtlTrack.width * (v0 + 1)) / 100)) < 2, `${v0} → ${await now(volume)}, ${rtlThumb.x} in ${rtlTrack.left}–${rtlTrack.right}`);
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  await page.keyboard.down('Alt');
  await page.keyboard.press('v');
  await page.keyboard.up('Alt');
  check('the &Volume access key focuses its thumb', await volume.evaluate((el) => document.activeElement === el));
}
