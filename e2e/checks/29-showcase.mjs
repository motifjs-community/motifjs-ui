/** Real-browser checks of the showcase: an order screen made of the kit. */
export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'showcase', { waitUntil: 'load' });
  const screen = page.locator('.showcase');
  const customer = screen.getByRole('combobox', { name: /^Customer/ });
  await page.waitForFunction(() => document.querySelector('.showcase .mx-lookup .mx-drop-down__text')?.textContent?.includes('120'));
  check('the order shows its customer, found on the server by key', (await customer.textContent()).includes('120'));
  await screen.getByRole('tab', { name: /Lines/ }).click();
  const lines = screen.locator('.showcase__line');
  check('the lines tab lists the order lines', (await lines.count()) === 2);
  const before = await screen.locator('.showcase__total').textContent();
  await screen.getByRole('button', { name: 'Add a line' }).click();
  const product = lines.nth(2).getByRole('combobox', { name: 'Product' });
  await product.click();
  await page.keyboard.type('saff');
  await page.keyboard.press('Enter');
  const after = await screen.locator('.showcase__total').textContent();
  check('a new line with a product changes the total', (await lines.count()) === 3 && before !== after, `${before} → ${after}`);
  await page.addScriptTag({ content: axeSource });
  const v = await page.evaluate(async () => (await window.axe.run(document)).violations.map((x) => x.id));
  check('axe clean on the order screen', v.length === 0, v.join(', '));
  await screen.getByRole('button', { name: 'Save' }).click();
  check('saving shows that it is busy', (await screen.getByRole('button', { name: 'Save' }).getAttribute('aria-busy')) === 'true');
  await page.getByRole('status').filter({ hasText: 'Order saved' }).or(page.locator('.mx-toast', { hasText: 'Order saved' })).first().waitFor({ timeout: 3000 });
  check('…then tells it is saved', (await page.locator('.mx-toast', { hasText: 'Order saved' }).count()) > 0);
}
