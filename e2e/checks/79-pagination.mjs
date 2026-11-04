/** Real-browser checks of the pagination page. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'pagination', { waitUntil: 'load' });
  const ways = page.locator('section[aria-labelledby="ways"]');
  const orders = ways.getByRole('navigation', { name: 'Orders' });
  await orders.waitFor();
  const shows = async (text) => {
    await page.waitForFunction((t) => document.querySelector('section[aria-labelledby="ways"]').textContent.includes(t), text, { timeout: 2000 }).catch(() => {});
    return (await ways.textContent()).includes(text);
  };
  check('x-model gives the page', (await orders.locator('.mx-pagination__number input, [aria-current="page"]').first().evaluate((el) => (el instanceof HTMLInputElement ? el.value : el.textContent))) === '3');
  await orders.getByRole('button', { name: 'Next page' }).click();
  check('a step moves, back through x-model', await shows('Page 4, 25 per page'));

  // A narrow box turns it compact; wide, it is full again.
  const looks = page.locator('section[aria-labelledby="looks"]');
  const adaptive = looks.getByRole('navigation', { name: 'Adaptive' });
  const box = looks.locator('div[style*="resize"]');
  await box.evaluate((el) => (el.style.inlineSize = '22rem'));
  await page.waitForTimeout(250);
  const narrow = await adaptive.getAttribute('data-look');
  const fits = await adaptive.evaluate((el) => el.scrollWidth <= el.parentElement.clientWidth + 0.5);
  await box.evaluate((el) => (el.style.inlineSize = '60rem'));
  await page.waitForTimeout(250);
  check('adaptive: compact when narrow, full when it fits', narrow === 'compact' && fits && (await adaptive.getAttribute('data-look')) === 'full', `${narrow} ${fits} ${await adaptive.getAttribute('data-look')}`);

  // The compact look: a page typed and Enter go there, and focus stays in the box.
  const compact = looks.getByRole('navigation', { name: 'Compact' });
  const number = compact.getByRole('spinbutton', { name: 'Page number' });
  await number.fill('7');
  await number.press('Enter');
  await page.waitForTimeout(150);
  check('a page typed goes there, focus staying in the box', (await number.inputValue()) === '7' && (await number.evaluate((el) => el === document.activeElement)), String(await number.inputValue()));

  // Page buttons: the current one is said, a press goes there and focus stays on it.
  const two = looks.getByRole('navigation', { name: 'Two each side' });
  const eleven = two.getByRole('button', { name: 'Page 11' });
  await eleven.click();
  check('a page button goes there and keeps focus', (await two.locator('[aria-current="page"]').textContent()) === '11' && (await page.evaluate(() => document.activeElement?.closest('.mx-button')?.textContent)) === '11');

  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => v.id));
  check('axe clean', violations.length === 0, violations.join(', '));
}
