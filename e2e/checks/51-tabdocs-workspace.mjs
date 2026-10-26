/** Real-browser checks of the TabDocumentManager workspace page: the menu bar, a row's menu opening a customer, the unsaved mark, a slid-out area above the grid, axe. */
export default async function ({ page, base, check, axeSource }) {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.goto(base + 'tabdocs/workspace', { waitUntil: 'load' });
  const ex = page.locator('section[aria-labelledby="desk"] .docs-example');
  await ex.locator('.mx-data-grid__row').first().waitFor();
  await ex.scrollIntoViewIfNeeded();
  const grid = ex.locator('.mx-data-grid').first();
  const rows = grid.locator('.mx-data-grid__body > .mx-data-grid__row:not([hidden])');

  await ex.getByRole('menuitem', { name: 'Orders' }).click();
  await page.getByRole('menuitem', { name: 'Group by city' }).click();
  await page.waitForTimeout(300);
  check('workspace: the menu bar groups the grid', (await grid.locator('.mx-data-grid__group-row, [data-row-type="group"]').count()) > 0);
  await ex.getByRole('menuitem', { name: 'Orders' }).click();
  await page.getByRole('menuitem', { name: 'Clear grouping' }).click();
  await page.waitForTimeout(300);

  // A slid-out area covers the grid: nothing of the grid, its sticky summary row included, shows above it.
  await ex.locator('.mx-tabdocs__autohide-tab', { hasText: 'Activity' }).click();
  await page.waitForTimeout(500);
  const above = await page.evaluate(() => {
    const panel = document.querySelector('section[aria-labelledby="desk"] .mx-tabdocs__area[data-auto-hide]');
    const r = panel.getBoundingClientRect();
    const out = [];
    for (let y = r.top + 8; y < r.bottom - 2; y += 20) {
      for (const x of [r.left + 40, r.left + r.width / 2, r.right - 40]) {
        const el = document.elementFromPoint(x, y);
        if (el && !panel.contains(el)) out.push(el.className);
      }
    }
    return out;
  });
  check('workspace: the slid-out area stays above the grid', above.length === 0, above.slice(0, 3).join(' | '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const row = rows.nth(1);
  const customer = (await row.locator('[data-field="customer"]').textContent()).trim();
  await row.locator('[data-field="customer"]').click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Open the customer' }).click();
  await page.waitForTimeout(400);
  check('workspace: a row\'s menu opens the customer in a tab beside the orders', (await ex.getByRole('tab', { name: new RegExp(customer) }).count()) === 1 && (await ex.locator('.mx-tabdocs__group').count()) >= 2, customer);

  await ex.getByRole('tab', { name: /^Orders/ }).click();
  const cell = rows.first().locator('[data-field="customer"]');
  await cell.dblclick();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Ada King');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const label = (await ex.getByRole('tab', { name: /^Orders/ }).getAttribute('aria-label')) ?? '';
  check('workspace: an unsaved edit marks the Orders tab', /unsaved/i.test(label) || /unsaved/i.test(await ex.getByRole('tab', { name: /^Orders/ }).textContent()), label);

  await page.addScriptTag({ content: axeSource });
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(300);
    const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="desk"]'))).violations.map((v) => v.id));
    check(`workspace: axe clean (${theme})`, violations.length === 0, violations.join(', '));
  }
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
}
