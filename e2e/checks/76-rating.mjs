/** Real-browser checks of the rating page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'rating', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const slider = ways.getByRole('slider', { name: 'Your rating' });
  await slider.waitFor();
  check('a slider named by its label, saying its value', (await slider.getAttribute('aria-valuetext')) === '3 of 5');

  // Under the pointer the stars show what a press would give; a press gives it.
  const stars = slider.locator('.mx-rating__item');
  await stars.nth(4).hover();
  const preview = await slider.locator('.mx-rating__fill').evaluateAll((els) => els.map((el) => el.style.getPropertyValue('--_fill')));
  check('the pointer previews', preview.every((f) => f === '100%'), preview.join(' '));
  await stars.nth(4).click();
  await page.waitForFunction(() => document.querySelector('section[aria-labelledby="ways"]').textContent.includes('You gave 5'), null, { timeout: 2000 }).catch(() => {});
  check('a press gives it, back through x-model', (await ways.textContent()).includes('You gave 5'));
  await page.mouse.move(0, 0);
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  check('the arrow keys change it', (await slider.getAttribute('aria-valuenow')) === '4');

  // Halves: a press on a star's first half gives half of it; in RTL the first half is on the right.
  const halves = page.locator('section[aria-labelledby="looks"]').getByRole('slider', { name: 'By halves' });
  await halves.scrollIntoViewIfNeeded();
  const box = await halves.locator('.mx-rating__item').nth(1).boundingBox();
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
  check('a press on the first half gives half', (await halves.getAttribute('aria-valuenow')) === '1.5');
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await halves.scrollIntoViewIfNeeded();
  const rtl = await halves.locator('.mx-rating__item').nth(2).boundingBox();
  await page.mouse.click(rtl.x + rtl.width * 0.75, rtl.y + rtl.height / 2);
  check('in RTL the first half is on the right', (await halves.getAttribute('aria-valuenow')) === '2.5', String(await halves.getAttribute('aria-valuenow')));
  await page.evaluate(() => (document.documentElement.dir = 'ltr'));

  const shown = page.locator('section[aria-labelledby="looks"]').getByRole('slider', { name: 'Shown only' });
  await shown.locator('.mx-rating__item').first().click();
  check('read-only only shows', (await shown.getAttribute('aria-valuenow')) === '4.5' && (await shown.getAttribute('aria-readonly')) === 'true');

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
