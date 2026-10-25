/** Real-browser checks of the ProgressBar and Spinner page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'progress', { waitUntil: 'load' });

  const ways = page.locator('section[aria-labelledby="ways"]');
  const upload = ways.getByRole('progressbar', { name: 'Uploading' });
  check('a bar is named by its label and has a value', (await upload.getAttribute('aria-valuenow')) === '0' && (await upload.getAttribute('aria-valuetext')) === '0%');
  await ways.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(700);
  const midway = Number(await upload.getAttribute('aria-valuenow'));
  check('the value grows while the work runs', midway > 0 && midway < 100, String(midway));
  await page.waitForFunction(() => document.querySelector('.mx-progress')?.getAttribute('aria-valuenow') === '100', null, { timeout: 4000 });
  await page.waitForTimeout(300);
  const [bar, track] = [await box(upload.locator('.mx-progress__bar')), await box(upload.locator('.mx-progress__track'))];
  check('…up to the end, the bar filling the track', (await upload.locator('.mx-progress__value').textContent()) === '100%' && Math.abs(bar.width - track.width) < 0.5);
  await ways.getByRole('button', { name: 'Add a bar from code' }).click();
  check('a bar created with new is added', (await page.getByRole('progressbar', { name: 'Task 1' }).getAttribute('aria-valuenow')) === '25');

  const unknown = page.locator('section[aria-labelledby="indeterminate"]').getByRole('progressbar', { name: 'Preparing' });
  check('without a value there is no aria-valuenow', (await unknown.getAttribute('aria-valuenow')) === null && (await unknown.getAttribute('data-state')) === 'indeterminate');
  const run = await unknown.locator('.mx-progress__bar').evaluate((el) => getComputedStyle(el, '::after').animationName);
  check('…and a part runs along the track', run === 'mx-progress-run', run);

  const side = page.locator('section[aria-labelledby="sizes"]').getByRole('progressbar', { name: 'Files' });
  const [label, sideTrack, value] = await Promise.all(['.mx-progress__label', '.mx-progress__track', '.mx-progress__value'].map((s) => box(side.locator(s))));
  check('labelPosition="side": the label, the bar, the value in one row', label.right <= sideTrack.left && sideTrack.right <= value.left && Math.abs(label.top + label.height / 2 - (sideTrack.top + sideTrack.height / 2)) < 6);
  check('valueText writes the value its own way', (await side.getAttribute('aria-valuetext')) === '3 of 12');
  const thickness = await page.locator('section[aria-labelledby="sizes"] .mx-progress__track').evaluateAll((els) => els.slice(0, 3).map((el) => el.getBoundingClientRect().height));
  check('the sizes are thicker and thicker', thickness[0] < thickness[1] && thickness[1] < thickness[2], thickness.join(' < '));

  const spinners = page.locator('section[aria-labelledby="spinner"]');
  check('a spinner is a progress indicator named by its label', (await spinners.getByRole('progressbar', { name: 'Loading orders' }).count()) === 1);
  check('…or by uiLocale without one', (await spinners.getByRole('progressbar', { name: 'Loading…' }).count()) === 3);
  const turning = await spinners.locator('.mx-spinner__ring').first().evaluate((el) => getComputedStyle(el).animationName);
  check('the ring turns', turning === 'mx-spinner-turn');

  const delay = page.locator('section[aria-labelledby="delay"]');
  // Hidden with `visible`, it may not be in the page at all.
  const shown = () => delay.evaluate((section) => !!section.querySelector('.mx-spinner')?.checkVisibility({ visibilityProperty: true }));
  await delay.getByRole('button', { name: 'Quick work (200 ms)' }).click();
  let seen = false;
  for (let i = 0; i < 6; i++) {
    seen ||= await shown();
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(100);
  check('quick work never shows the delayed spinner', !seen && (await delay.locator('.pr-result').textContent()) === 'Done after 200 ms.');
  await delay.getByRole('button', { name: 'Slow work (2 s)' }).click();
  await page.waitForTimeout(150);
  const early = await shown();
  await page.waitForTimeout(500);
  const late = await shown();
  check('slow work shows it after the delay', !early && late, `${early} / ${late}`);

  const cover = page.locator('section[aria-labelledby="cover"]');
  const load = cover.getByRole('button', { name: 'Load orders' });
  await load.focus();
  await page.keyboard.press('Enter');
  const layer = cover.getByRole('progressbar', { name: 'Loading orders' });
  const [panelBox, layerBox] = [await box(cover.locator('.docs-panel')), await box(layer)];
  check('the spinner covers the panel inside its border', Math.abs(panelBox.width - layerBox.width) <= 2 && Math.abs(panelBox.height - layerBox.height) <= 2, `${panelBox.width}x${panelBox.height} vs ${layerBox.width}x${layerBox.height}`);
  check('focus waits on the spinner', await layer.evaluate((el) => document.activeElement === el));
  check('the panel is busy and what is under the spinner is inert', (await cover.locator('.docs-panel').getAttribute('aria-busy')) === 'true' && (await cover.locator('input').evaluate((el) => !!el.closest('[inert]'))));
  await page.keyboard.press('Tab');
  check('Tab does not reach into the covered panel', await cover.locator('input').evaluate((el) => document.activeElement !== el && !document.activeElement?.closest('[inert]')));
  await layer.focus();
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`));
  check('axe clean with bars, spinners and a covered panel', violations.length === 0, violations.join(', '));
  await page.waitForFunction(() => !document.querySelector('[data-mx-covered]'), null, { timeout: 4000 });
  check('focus comes back when the cover goes', await load.evaluate((el) => document.activeElement === el) && (await cover.locator('.mx-spinner').count()) === 0);

  const i18n = page.locator('section[aria-labelledby="i18n"]');
  await i18n.getByRole('button', { name: 'Language: English' }).click();
  check('uiLocale names the unlabelled ones, the locale writes the percent', (await i18n.getByRole('progressbar', { name: 'Yükleniyor…' }).getAttribute('aria-valuetext')) === '%40');
  await i18n.getByRole('button', { name: 'Dil: Türkçe' }).click();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const calm = await unknown.locator('.mx-progress__bar').evaluate((el) => {
    const after = getComputedStyle(el, '::after');
    return { bar: el.getBoundingClientRect().width, track: el.parentElement.getBoundingClientRect().width, part: after.width };
  });
  check('reduced motion: the unknown bar rests as a tinted track', calm.bar === calm.track && calm.part === '0px', JSON.stringify(calm));
  await page.emulateMedia({ reducedMotion: null });
}
