/** Real-browser checks of the datagrid's lookup columns: texts from another service in one batched request, editing with the lookup editor, the cascading province and district, the filter row's "(All)" list, the header filter's names, textFrom without requests, and axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/lookups', { waitUntil: 'load' });
  const grid = '.dg-lookups';
  const rows = (g) => `${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const cellAt = (g, i, field) => `${rows(g)}[aria-rowindex="${i + 1}"] [data-field="${field}"]`;
  const requests = async () => (await page.locator('.dg-lookup-requests').textContent()).match(/^(\d+) requests.* (\d+) customers/).slice(1).map(Number);
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => {
    const cells = [...document.querySelectorAll(s)];
    return cells.length > 5 && cells.every((c) => !c.hasAttribute('aria-busy'));
  }, `${rows(grid)} [data-field="customerId"]`);

  // The texts, after one request for the keys on the screen.
  const shown = await page.evaluate((s) => [...document.querySelectorAll(s)].map((c) => ({ text: c.textContent, state: c.dataset.lookup ?? '' })), `${rows(grid)} [data-field="customerId"]`);
  const named = shown.filter((c) => !c.state);
  const [asked, keys] = await requests();
  check('datagrid lookup: the cells show the names from the other service', named.length > 5 && named.every((c) => /^\D+ \d+$/.test(c.text)), named.slice(0, 3).map((c) => c.text).join(', '));
  check('datagrid lookup: one request for the keys on the screen', asked === 1 && keys >= named.length / 2 && keys <= shown.length, `${asked} requests, ${keys} keys for ${shown.length} cells`);
  const missing = shown.find((c) => c.state === 'missing');
  check('datagrid lookup: a key the service does not have shows as it is, marked', missing?.text === '9999', JSON.stringify(missing));

  // Editing: typing opens the lookup's list with that search; a click picks the customer.
  await page.click(cellAt(grid, 2, 'customerId'));
  await page.keyboard.type('Grace');
  await page.waitForFunction(() => [...document.querySelectorAll('.mx-lookup__popup [role="option"]')].some((o) => o.offsetParent && o.textContent.startsWith('Grace')));
  const option = page.locator('.mx-lookup__popup [role="option"]', { hasText: 'Grace' }).first();
  const picked = await option.locator('.mx-lookup__cell').first().textContent();
  await option.click();
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-data-grid__editor`), grid);
  const now = await page.locator(cellAt(grid, 2, 'customerId')).textContent();
  check('datagrid lookup: picking a customer in the editor shows its name in the cell at once', now === picked && /^Grace/.test(now), `${now} / ${picked}`);

  // The filter row: "(All)" first, then the names; a name filters, "(All)" takes the filter away.
  await page.click(`${grid} .mx-data-grid__filter-cell[data-field="customerId"] .mx-drop-down__display`);
  await page.waitForFunction(() => [...document.querySelectorAll('.mx-drop-down__popup [role="option"]')].filter((o) => o.offsetParent).length > 3);
  const listed = await page.evaluate(() => [...document.querySelectorAll('.mx-drop-down__popup [role="option"]')].filter((o) => o.offsetParent).map((o) => o.textContent));
  check('datagrid lookup: the filter row lists "(All)" and then the names', listed[0] === '(All)' && /^\D+ \d+$/.test(listed[1]), listed.slice(0, 3).join(' | '));
  const choice = listed[2];
  await page.locator('.mx-drop-down__popup [role="option"]', { hasText: choice }).first().click();
  await page.waitForFunction(([s, name]) => {
    const cells = [...document.querySelectorAll(s)];
    return cells.length > 0 && cells.every((c) => c.textContent === name);
  }, [`${rows(grid)} [data-field="customerId"]`, choice]);
  check('datagrid lookup: a name in the filter row filters the rows by its key', true, choice);
  await page.click(`${grid} .mx-data-grid__filter-cell[data-field="customerId"] .mx-drop-down__display`);
  await page.locator('.mx-drop-down__popup [role="option"]', { hasText: '(All)' }).first().click();
  await page.waitForFunction((s) => new Set([...document.querySelectorAll(s)].map((c) => c.textContent)).size > 3, `${rows(grid)} [data-field="customerId"]`);
  check('datagrid lookup: "(All)" takes the filter away', true);

  // The header filter: names with counts.
  const header = page.locator(`${grid} [role=columnheader][data-field="customerId"]`);
  await header.hover();
  await header.locator('.mx-data-grid__filter-button').click();
  await page.waitForFunction(() => document.querySelectorAll('.mx-data-grid__values [role="option"]').length > 3);
  const values = await page.evaluate(() => [...document.querySelectorAll('.mx-data-grid__values [role="option"]')].map((o) => o.textContent).filter((t) => t !== 'Select all'));
  check('datagrid lookup: the header filter lists the names with their counts', values.length > 3 && values.every((v) => /^\D+ \d+\d+$/.test(v)), values.slice(0, 3).join(' | '));
  await page.addScriptTag({ content: axeSource });
  const open = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid lookup: axe clean with the header filter open', open.length === 0, open.join('; '));
  await page.keyboard.press('Escape');

  // Cascading: another province empties the district; the district's list follows the province.
  const cascade = '.dg-cascade';
  await page.locator(cascade).scrollIntoViewIfNeeded();
  await page.waitForSelector(cellAt(cascade, 2, 'district'));
  await page.click(cellAt(cascade, 2, 'province'));
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.locator('.mx-drop-down__popup [role="option"]', { hasText: 'İzmir' }).first().click();
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-data-grid__editor`), cascade);
  const after = { province: await page.locator(cellAt(cascade, 2, 'province')).textContent(), district: await page.locator(cellAt(cascade, 2, 'district')).textContent() };
  check('datagrid lookup: a new province clears the district (setCellValue)', after.province === 'İzmir' && after.district === '', JSON.stringify(after));
  await page.click(cellAt(cascade, 2, 'district'));
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction(() => [...document.querySelectorAll('.mx-drop-down__popup [role="option"]')].some((o) => o.offsetParent));
  const districts = await page.evaluate(() => [...document.querySelectorAll('.mx-drop-down__popup [role="option"]')].filter((o) => o.offsetParent).map((o) => o.textContent));
  check('datagrid lookup: the district list holds the districts of the province', districts.join() === 'Bornova,Karşıyaka,Konak', districts.join());
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.click(cellAt(cascade, 5, 'district'));
  await page.keyboard.press('Enter');
  const disabled = await page.evaluate((s) => document.querySelector(`${s} .mx-data-grid__editor .mx-drop-down`)?.hasAttribute('data-disabled'), cascade);
  check('datagrid lookup: the district waits for a province (onEditorPreparing)', disabled === true);
  await page.keyboard.press('Escape');

  // textFrom: the names come with the rows, the customers' service is not asked.
  const textFrom = '.dg-text-from';
  await page.locator(textFrom).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => [...document.querySelectorAll(s)].filter((c) => c.textContent).length > 5, `${rows(textFrom)} [data-field="customerId"]`);
  const fromRows = await page.locator('.dg-text-from-requests').textContent();
  check('datagrid lookup: textFrom reads the names from the rows, without a request', fromRows.startsWith('0 requests'), fromRows);

  await page.addScriptTag({ content: axeSource });
  const found = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid lookup: axe clean with the lookup examples', found.length === 0, found.join('; '));
}
