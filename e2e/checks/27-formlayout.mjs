/** Real-browser checks of the FormLayout page. */
export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'formlayout', { waitUntil: 'load' });
  const card = page.locator('section[aria-labelledby="form"]');
  const name = card.getByLabel(/^Name/);
  const email = card.getByLabel(/^Email/);
  const [a, b] = [await box(name), await box(email)];
  check('two columns: name and email side by side', Math.abs(a.top - b.top) < 2 && b.left > a.right);
  await name.fill('Grace Hopper');
  check('an editor writes to the object', (await page.locator('.fl-data').textContent()).startsWith('Grace Hopper'));
  await card.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(150);
  check('sending checks every field and focuses the first that failed', (await page.locator('.fl-result').textContent()) === '1 field(s) to fix.' && (await email.evaluate((el) => document.activeElement === el)));
  await page.addScriptTag({ content: axeSource });
  const v = await page.evaluate(async () => (await window.axe.run(document)).violations.map((x) => x.id));
  check('axe clean with errors shown', v.length === 0, v.join(', '));
  await email.fill('grace@navy.mil');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  check('Enter sends the form once it passes', (await page.locator('.fl-result').textContent()) === 'Saved Grace Hopper.');
  const credit = card.getByLabel('Credit limit');
  check('a hidden place stays out until its condition holds', !(await credit.isVisible()));
  await card.getByRole('switch', { name: 'VIP customer' }).click();
  check('…and shows when it does', await credit.isVisible());
  check('a group has its caption', (await card.locator('legend').textContent()) === 'Address');
}
