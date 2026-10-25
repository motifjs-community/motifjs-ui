/** Real-browser checks of the datagrid's search panel and toolbar: typing searches after the pause (rows in memory and a server), lookup names found on their own service, the marks, Escape, the toolbar's items, places, overflow and keys, and axe. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/filtering', { waitUntil: 'load' });
  const rows = (g) => `${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden]):not([data-loading])`;
  const texts = (g, field) => page.evaluate(([s, f]) => [...document.querySelectorAll(s)].map((r) => r.querySelector(`[data-field="${f}"]`)?.textContent ?? ''), [rows(g), field]);
  const marks = (g) => page.evaluate((s) => [...document.querySelectorAll(`${s} mark`)].map((m) => m.textContent), rows(g));

  // Rows in memory: the page starts the search with "ankara", the box shows it.
  const local = '.dg-search';
  const box = page.locator(`${local} .mx-data-grid__search input`);
  await page.locator(local).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, rows(local));
  const cities = await texts(local, 'city');
  const firstMarks = await marks(local);
  check(
    'datagrid search: the text given by the page searches and is marked',
    (await box.inputValue()) === 'ankara' && cities.length > 3 && cities.every((c) => c === 'Ankara') && firstMarks.length >= cities.length && firstMarks.every((m) => m === 'Ankara'),
    `${cities.length} rows · ${firstMarks.slice(0, 3).join(', ')}`,
  );
  check('datagrid search: the box is named and has its placeholder', (await box.getAttribute('placeholder')) === 'Search…' && (await page.locator(local).getByRole('searchbox', { name: 'Search in the grid' }).count()) === 1);

  // Typing waits for the pause (700 ms), then searches.
  await box.click();
  await box.press('Control+A');
  const t0 = Date.now();
  await box.pressSequentially('turing');
  await page.waitForTimeout(250);
  const early = await texts(local, 'customer');
  await page.waitForFunction((s) => {
    const cells = [...document.querySelectorAll(s)].map((r) => r.querySelector('[data-field="customer"]').textContent);
    return cells.length > 0 && cells.every((c) => c === 'Alan Turing');
  }, rows(local));
  const waited = Date.now() - t0;
  const found = await marks(local);
  check('datagrid search: typing searches after the pause, not before', early.some((c) => c !== 'Alan Turing') && waited >= 700, `${waited} ms`);
  check('datagrid search: the text found is marked in the cells', found.length > 0 && found.every((m) => m === 'Turing'), found.slice(0, 3).join(', '));
  check('datagrid search: the page follows the text typed (two-way)', /Searching for “turing”/.test(await page.locator('.dg-search-text').textContent()));
  const announced = await page.locator(`${local} .mx-data-grid__live[aria-live]`).textContent();
  check('datagrid search: the number of records found is announced', /^\d+ records found$/.test(announced), announced);

  // Escape empties the box: every row at once.
  await box.press('Escape');
  await page.waitForFunction((s) => new Set([...document.querySelectorAll(s)].map((r) => r.querySelector('[data-field="customer"]').textContent)).size > 3, rows(local));
  check('datagrid search: Escape empties the box and every row comes back', (await box.inputValue()) === '' && (await marks(local)).length === 0);
  await page.locator('section[aria-labelledby="search"]').getByRole('button', { name: 'Search for “approved”' }).click();
  await page.waitForFunction((s) => {
    const cells = [...document.querySelectorAll(s)].map((r) => r.querySelector('[data-field="status"]').textContent);
    return cells.length > 0 && cells.every((c) => c === 'Approved');
  }, rows(local));
  check('datagrid search: a text set by the page shows in the box and searches', (await box.inputValue()) === 'approved');

  // A server whose customers live on another service: the names are searched there, the server gets keys.
  const server = '.dg-server-search';
  const serverBox = page.locator(`${server} .mx-data-grid__search input`);
  await page.locator(server).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, rows(server));
  await serverBox.click();
  await serverBox.pressSequentially('hopper');
  await page.waitForFunction(() => /"op":"in"/.test(document.querySelector('.dg-server-search-filter').textContent), null, { timeout: 10_000 });
  await page.waitForFunction((s) => {
    const cells = [...document.querySelectorAll(s)].map((r) => r.querySelector('[data-field="customerId"]'));
    return cells.length > 0 && cells.every((c) => !c.hasAttribute('aria-busy') && /Hopper/.test(c.textContent));
  }, rows(server), { timeout: 10_000 });
  const filter = await page.locator('.dg-server-search-filter').textContent();
  const serverMarks = await marks(server);
  check('datagrid search: a server grid gets the customers found on their own service as keys', /customerId","op":"in"/.test(filter) && /^[\d,]+ sales/.test(filter), filter.slice(0, 120));
  check('datagrid search: the lookup names found are marked', serverMarks.length > 0 && serverMarks.every((m) => m === 'Hopper'), serverMarks.slice(0, 3).join(', '));

  await page.addScriptTag({ content: axeSource });
  const searched = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="search"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid search: axe clean with marks in the cells', searched.length === 0, searched.join('; '));

  // The toolbar: the page's items at the start, the grid's own at the end.
  await page.goto(base + 'datagrid/layout', { waitUntil: 'load' });
  const tools = '.dg-toolbar';
  const bar = `${tools} .mx-data-grid__toolbar`;
  await page.locator(tools).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${bar} .mx-data-grid__search`);
  const placed = await page.evaluate((s) => {
    const el = document.querySelector(s);
    const left = (q) => el.querySelector(q)?.getBoundingClientRect().left ?? -1;
    const refresh = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Refresh');
    return { refresh: refresh?.getBoundingClientRect().left ?? -1, add: left('.mx-data-grid__add'), search: left('.mx-data-grid__search'), end: el.getBoundingClientRect().right, searchEnd: el.querySelector('.mx-data-grid__search').getBoundingClientRect().right, role: el.getAttribute('role'), label: el.getAttribute('aria-label') };
  }, bar);
  check(
    'datagrid toolbar: the page’s items at the start, the grid’s own at the end, the search box last',
    placed.role === 'toolbar' && placed.refresh >= 0 && placed.refresh < placed.add && placed.add < placed.search && placed.end - placed.searchEnd < 40,
    JSON.stringify(placed),
  );
  const exportName = await page.locator(`${bar} .mx-data-grid__export`).getAttribute('title');
  await page.locator(tools).getByLabel('“Export” with its text').check();
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__export`)?.textContent.includes('Export'), bar);
  check('datagrid toolbar: a grid button shows its icon only, its text by the item’s showText', exportName === 'Export');

  // Keys: one Tab stop, arrows between the items.
  await page.locator(`${bar} button`, { hasText: 'Refresh' }).focus();
  await page.keyboard.press('ArrowRight');
  const next = await page.evaluate(() => document.activeElement.closest('.mx-check-box') !== null);
  await page.keyboard.press('End');
  const last = await page.evaluate(() => document.activeElement.closest('.mx-data-grid__search, .mx-toolbar__more') !== null);
  await page.keyboard.press('Tab');
  const intoGrid = await page.evaluate((s) => document.querySelector(s).contains(document.activeElement), `${tools} .mx-data-grid__viewport`);
  check('datagrid toolbar: arrows move between the items, Tab goes on to the rows', next && last && intoGrid, JSON.stringify({ next, last, intoGrid }));

  // The column button opens the list of columns; Escape gives focus back.
  await page.click(`${bar} .mx-data-grid__columns`);
  await page.waitForFunction(() => [...document.querySelectorAll('.mx-data-grid__menu [role="menuitemcheckbox"]')].some((i) => i.offsetParent));
  const listed = await page.evaluate(() => [...document.querySelectorAll('.mx-data-grid__menu [role="menuitemcheckbox"]')].filter((i) => i.offsetParent).map((i) => i.textContent.trim()));
  await page.keyboard.press('Escape');
  const back = await page.evaluate((s) => document.activeElement === document.querySelector(s), `${bar} .mx-data-grid__columns`);
  check('datagrid toolbar: the column button opens the list of columns, Escape goes back to it', listed.includes('Customer') && listed.includes('Amount') && back, listed.join(', '));

  // A narrow grid: the grid's buttons go into the "more" menu, the search box stays.
  await page.evaluate((s) => (document.querySelector(s).style.inlineSize = '520px'), tools);
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-toolbar__more`)?.hasAttribute('data-idle') && document.querySelector(`${s} [data-overflowed]`), bar);
  const overflow = await page.evaluate((s) => {
    const el = document.querySelector(s);
    return { moved: [...el.querySelectorAll('[data-overflowed]')].map((b) => b.getAttribute('title') || b.textContent.trim()), search: !el.querySelector('.mx-data-grid__search').hasAttribute('data-overflowed') };
  }, bar);
  await page.click(`${bar} .mx-toolbar__more`);
  await page.waitForFunction(() => [...document.querySelectorAll('[role="menuitem"]')].some((i) => i.offsetParent && /New row|Column chooser/.test(i.textContent)));
  const menu = await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"]')].filter((i) => i.offsetParent).map((i) => i.textContent.trim()));
  check('datagrid toolbar: what does not fit goes into the "more" menu with its text; the search box stays', overflow.moved.length > 0 && overflow.search && overflow.moved.every((m) => menu.some((t) => t.includes(m))), `${overflow.moved.join(', ')} · menu: ${menu.join(', ')}`);
  await page.addScriptTag({ content: axeSource });
  const narrow = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid toolbar: axe clean with the "more" menu open', narrow.length === 0, narrow.join('; '));
  await page.keyboard.press('Escape');
  await page.evaluate((s) => (document.querySelector(s).style.inlineSize = ''), tools);
}
