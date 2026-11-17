/** Real-browser checks of a grid in the details of a grid: it keeps its own columns when the grid around it hides a column of the same field, and its look does not follow the states of the grid around it. */

export default async function ({ page, base, check }) {
  await page.goto(base + 'datagrid/master-detail', { waitUntil: 'load' });
  const master = '.dg-master';
  // A grid's own parts, not those of a grid in its details.
  const own = (g) => `${g} > .mx-data-grid__main > .mx-data-grid__viewport`;
  const rows = (g) => `${own(g)} > .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const header = (g, field) => `${own(g)} > .mx-data-grid__head > .mx-data-grid__row--header > [data-field="${field}"]`;
  await page.locator(master).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(master));
  await page.locator(rows(master)).first().locator('.mx-data-grid__expand-button').click();
  const orders = `${own(master)} > .mx-data-grid__body > .mx-data-grid__detail-row:not([hidden]) .dg-orders`;
  await page.waitForSelector(rows(orders));
  await page.waitForFunction((g) => document.querySelector(`${g} .mx-data-grid__count`)?.textContent, orders, { timeout: 3000 }).catch(() => {});
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);

  // Every computed value of every element of the grid inside (its own values: what it inherits by name from outside is not its look).
  const look = () =>
    page.evaluate((g) => {
      const root = document.querySelector(g);
      return [root, ...root.querySelectorAll('*')].map((el) => {
        const cs = getComputedStyle(el);
        const values = [];
        for (const name of cs) if (!name.startsWith('--')) values.push(`${name}: ${cs.getPropertyValue(name)}`);
        return { part: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}${el.dataset.field ? `[${el.dataset.field}]` : ''}`, values };
      });
    }, orders);
  const changed = (a, b) => {
    if (a.length !== b.length) return [`${a.length} elements, then ${b.length}`];
    const out = [];
    a.forEach((el, i) => el.values.forEach((value, n) => value !== b[i].values[n] && out.push(`${el.part} ${value} → ${b[i].values[n].split(': ')[1]}`)));
    return out;
  };
  const columns = () =>
    page.evaluate(
      ([g, row]) => ({
        tracks: getComputedStyle(document.querySelector(row)).gridTemplateColumns,
        cells: [...document.querySelector(row).children].filter((c) => c.dataset.field && getComputedStyle(c).display !== 'none').map((c) => `${c.dataset.field}:${Math.round(c.getBoundingClientRect().width)}`),
        g,
      }),
      [orders, `${own(orders)} > .mx-data-grid__head > .mx-data-grid__row--header`],
    );
  const before = await look();
  const columnsBefore = await columns();

  // The grid around it hides its own "No" column: the orders keep theirs, of the same field, and every cell its width.
  await page.focus(header(master, 'id'));
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Hide column' }).click();
  await page.waitForFunction((sel) => getComputedStyle(document.querySelector(sel)).display === 'none', header(master, 'id'));
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  const columnsAfter = await columns();
  check(
    'datagrid nested: a column hidden in the grid stays in the grid in its details',
    columnsAfter.cells.join() === columnsBefore.cells.join() && columnsAfter.cells.some((c) => c.startsWith('id:')) && columnsAfter.tracks === columnsBefore.tracks,
    `${columnsBefore.cells.join(' ')} → ${columnsAfter.cells.join(' ')} (${columnsAfter.tracks})`,
  );
  const afterHide = changed(before, await look());
  check('datagrid nested: nothing of the grid inside changes when the grid around it hides a column', afterHide.length === 0, `${afterHide.length}: ${afterHide.slice(0, 3).join(' | ')}`);

  // The states the grid around it writes on itself, as it writes them: the grid inside looks the same.
  const states = { 'data-striped': '', 'data-selection': 'single', 'data-header-buttons': 'always', 'data-state': 'loading', 'data-measuring-actions': '' };
  const was = await page.evaluate(
    ([g, attrs]) => {
      const root = document.querySelector(g);
      const kept = Object.fromEntries(Object.keys(attrs).map((name) => [name, root.getAttribute(name)]));
      for (const [name, value] of Object.entries(attrs)) root.setAttribute(name, value);
      return kept;
    },
    [master, states],
  );
  const underStates = changed(before, await look());
  const outerStriped = await page.evaluate((sel) => [...document.querySelectorAll(sel)].some((row) => row.hasAttribute('data-odd') && getComputedStyle(row).getPropertyValue('--_tint').trim() !== 'transparent'), rows(master));
  await page.evaluate(
    ([g, kept]) => {
      const root = document.querySelector(g);
      for (const [name, value] of Object.entries(kept)) value === null ? root.removeAttribute(name) : root.setAttribute(name, value);
    },
    [master, was],
  );
  check('datagrid nested: the states of the grid around it reach its own rows', outerStriped);
  check('datagrid nested: the grid inside does not take the stripes, the selection, the header buttons or the loading state of the grid around it', underStates.length === 0, `${underStates.length}: ${underStates.slice(0, 3).join(' | ')}`);
}
