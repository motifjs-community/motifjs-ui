/** Real-browser checks of the skeleton page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'skeleton', { waitUntil: 'load' });
  const shapes = page.locator('section[aria-labelledby="shapes"]');
  const lines = shapes.locator('.mx-skeleton[data-shape="text"]').first();
  await lines.waitFor();
  const widths = await lines.locator('.mx-skeleton__bone').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  check('lines fill the width, the last is shorter', widths.length === 3 && widths[0] === widths[1] && widths[2] < widths[0], widths.join(' '));
  const circle = await shapes.locator('.mx-skeleton[data-shape="circle"] .mx-skeleton__bone').first().boundingBox();
  check('a circle is round', Math.abs(circle.width - circle.height) < 0.5);
  check('while loading it says so', (await lines.getAttribute('role')) === 'progressbar' && (await lines.getAttribute('aria-busy')) === 'true');

  // Until it loads: then the content shows in its place.
  const loading = page.locator('section[aria-labelledby="loading"]');
  await loading.getByRole('button', { name: 'Finish loading' }).click();
  await page.waitForFunction(() => !document.querySelector('section[aria-labelledby="loading"] .mx-skeleton[data-loading]'), null, { timeout: 2000 }).catch(() => {});
  check('once loaded, the content shows and the bones go', (await loading.getByText('Grace Hopper').first().isVisible()) && (await loading.locator('.mx-skeleton__bone:visible').count()) === 0);

  // It moves, and reduced motion keeps it still.
  const moving = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName?.startsWith('mx-skeleton')).length);
  check('the wave or the pulse runs', moving > 0, String(moving));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = await page.evaluate(() => getComputedStyle(document.querySelector('.mx-skeleton')).getPropertyValue('--_skeleton-duration').trim());
  check('reduced motion keeps it still', /^calc\(0m?s \* \d+\)$|^0m?s$/.test(still), still);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
