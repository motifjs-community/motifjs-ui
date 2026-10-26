/** Real-browser checks of the datagrid's pager (page sizes, "all", info text, compact and full looks), of columns added and taken out at run time, of the header filter's date tree and number ranges, and axe. */

export default async function ({ page, base, check, axeSource }) {
  const rows = (g) => `${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const shownIds = (g) => page.evaluate((sel) => [...document.querySelectorAll(sel)].map((r) => r.querySelector('[data-field="id"]')?.textContent), rows(g));

  // The pager: page sizes as buttons, the text, then "All".
  await page.goto(base + 'datagrid#pager', { waitUntil: 'load' });
  const pager = '.dg-pager';
  await page.locator(pager).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(pager));
  await page.locator('section[aria-labelledby="pager"] button', { hasText: /^Full$/ }).click();
  const nav = page.locator(`${pager} .mx-data-grid__pager`);
  await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.look === 'full', `${pager} .mx-data-grid__pager`);
  const sizes = await page.locator(`${pager} .mx-data-grid__page-size`).allTextContents();
  const info = () => page.locator(`${pager} .mx-data-grid__page-info`).textContent();
  check('datagrid pager: the page sizes show as buttons with the info text', sizes.join(',') === '10,20,50,All' && (await info()) === 'Page 1 of 50 (1,000 items)', `${sizes.join(',')} · ${await info()}`);
  await page.locator(`${pager} .mx-data-grid__page`, { hasText: /^3$/ }).click();
  await page.locator(`${pager} .mx-data-grid__page-size`, { hasText: /^50$/ }).click();
  await page.waitForFunction((sel) => document.querySelector(sel).textContent === 'Page 1 of 20 (1,000 items)', `${pager} .mx-data-grid__page-info`);
  const fifty = await page.evaluate((sel) => document.querySelectorAll(sel).length, rows(pager));
  const pressed = await page.locator(`${pager} .mx-data-grid__page-size[aria-pressed="true"]`).allTextContents();
  check('datagrid pager: a page size shows that many rows, back on the first page, and is pressed', fifty === 50 && pressed.join() === '50' && (await page.locator('.dg-pager-state').textContent()).startsWith('50 rows a page'), `${fifty} rows, pressed ${pressed}`);
  await page.locator(`${pager} .mx-data-grid__page-size`, { hasText: /^All$/ }).click();
  await page.waitForFunction((sel) => document.querySelector(sel).textContent === 'Page 1 of 1 (1,000 items)', `${pager} .mx-data-grid__page-info`);
  const all = await page.evaluate((sel) => document.querySelectorAll(sel).length, rows(pager));
  check('datagrid pager: "All" puts every row on one page', all === 1000, `${all} rows`);
  await page.locator(`${pager} .mx-data-grid__page-size`, { hasText: /^20$/ }).click();
  await page.waitForFunction((sel) => document.querySelector(sel).textContent === 'Page 1 of 50 (1,000 items)', `${pager} .mx-data-grid__page-info`);

  // Compact: a page number box and a drop-down of the sizes.
  await page.locator('section[aria-labelledby="pager"] button', { hasText: /^Compact$/ }).click();
  await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.look === 'compact', `${pager} .mx-data-grid__pager`);
  const number = page.locator(`${pager} .mx-data-grid__page-number input`);
  await number.click();
  await number.fill('7');
  await page.keyboard.press('Enter');
  const firstId = (sel, id) => page.waitForFunction(([q, n]) => Math.min(...[...document.querySelectorAll(q)].map((c) => Number(c.textContent))) === n, [sel, id]);
  await firstId(`${rows(pager)} [data-field="id"]`, 121);
  const compact = await page.evaluate((sel) => {
    const nav = document.querySelector(sel);
    const shown = (q) => {
      const el = nav.querySelector(q);
      return !!el && el.offsetParent !== null;
    };
    return { pages: shown('.mx-data-grid__pages'), info: shown('.mx-data-grid__page-info'), list: shown('.mx-data-grid__page-size-list'), jump: nav.querySelector('.mx-data-grid__page-jump').textContent };
  }, `${pager} .mx-data-grid__pager`);
  check('datagrid pager: compact shows a page number box (Enter goes there) and a size list, no page buttons', !compact.pages && !compact.info && compact.list && compact.jump.includes('of 50'), JSON.stringify(compact));
  const fullWidth = await nav.evaluate((el) => el.scrollWidth);
  check('datagrid pager: the nav is named and the current page is marked', (await nav.getAttribute('aria-label')).startsWith('Pages:'), await nav.getAttribute('aria-label'));
  // Adaptive: full in a grid wide enough for the full pager, compact in a narrower one.
  const look = (want) => page.waitForFunction(([sel, w]) => document.querySelector(sel)?.dataset.look === w, [`${pager} .mx-data-grid__pager`, want], { timeout: 3000 }).catch(() => {});
  await page.locator('section[aria-labelledby="pager"] button', { hasText: /^Adaptive$/ }).click();
  await page.locator(pager).evaluate((el) => (el.style.inlineSize = '1100px'));
  await look('full');
  const wide = await nav.getAttribute('data-look');
  await page.locator(pager).evaluate((el) => (el.style.inlineSize = '22rem'));
  await look('compact');
  const narrow = await nav.getAttribute('data-look');
  await page.locator(pager).evaluate((el) => (el.style.inlineSize = ''));
  check('datagrid pager: adaptive is full in a wide grid and compact in a narrow one', narrow === 'compact' && wide === 'full', `${wide} → ${narrow} (compact pager ${fullWidth}px)`);
  await page.locator('section[aria-labelledby="pager"] button', { hasText: /^Full$/ }).click();
  await look('full');
  const current = await page.locator(`${pager} .mx-data-grid__page[aria-current="page"]`).textContent();
  check('datagrid pager: the current page button has aria-current', current === '7', current);
  // PageDown on a cell turns the page.
  await page.locator(`${rows(pager)} [data-field="customer"]`).first().click();
  await page.keyboard.press('PageDown');
  await firstId(`${rows(pager)} [data-field="id"]`, 141);
  check('datagrid pager: PageDown goes to the next page', (await page.locator(`${pager} .mx-data-grid__page[aria-current="page"]`).textContent()) === '8');
  await page.addScriptTag({ content: axeSource });
  const axePager = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="pager"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid pager: axe clean', axePager.length === 0, axePager.join('; '));

  // Columns at run time: added after Customer, taken out with their filter.
  await page.goto(base + 'datagrid/layout#columns', { waitUntil: 'load' });
  const cols = '.dg-runtime-columns';
  await page.locator(cols).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(cols));
  const headers = () =>
    page.evaluate(
      (g) =>
        [...document.querySelectorAll(`${g} [role="columnheader"][aria-colindex]`)]
          .filter((h) => h.offsetParent !== null)
          .sort((a, b) => a.getAttribute('aria-colindex') - b.getAttribute('aria-colindex'))
          .map((h) => h.dataset.field)
          .filter((f) => !f.startsWith('mx:')),
      cols,
    );
  await page.getByRole('button', { name: 'Add “Paid” after Customer' }).click();
  await page.waitForFunction((g) => !!document.querySelector(`${g} [role="columnheader"][data-field="paid"]`), cols);
  const added = await headers();
  const paidCells = await page.locator(`${rows(cols)} [data-field="paid"]`).count();
  check('datagrid columns: addColumn shows the column at its place, with a cell in every row', added.indexOf('paid') === 2 && paidCells > 5 && (await page.locator('.dg-runtime-fields').textContent()).includes('paid'), `${added.join(',')} · ${paidCells} cells`);
  // A filter on the city, then the city taken out: its filter goes with it.
  const city = page.locator(`${cols} [role="columnheader"][data-field="city"]`);
  await city.hover();
  await city.locator('.mx-data-grid__filter-button').click();
  await page.waitForSelector('.mx-data-grid__values:popover-open [role=option]:not([data-loading])');
  await page.locator('.mx-data-grid__values:popover-open [role=option]', { hasText: 'Ankara' }).click();
  await page.locator('.mx-data-grid__values:popover-open').getByRole('button', { name: 'Apply' }).click();
  await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].every((c) => c.textContent === 'Ankara'), `${rows(cols)} [data-field="city"]`);
  const filtered = (await shownIds(cols)).length;
  await page.getByRole('button', { name: 'Take “City” out' }).click();
  await page.waitForFunction((g) => !document.querySelector(`${g} [role="columnheader"][data-field="city"]`), cols);
  await page.waitForFunction(([sel, n]) => document.querySelectorAll(sel).length > n, [rows(cols), filtered]);
  const after = await headers();
  const unfiltered = (await shownIds(cols)).length;
  check('datagrid columns: deleteColumn takes the column out with its filter', !after.includes('city') && unfiltered > filtered && (await page.locator(`${rows(cols)} [data-field="city"]`).count()) === 0, `${after.join(',')} · ${filtered} → ${unfiltered} rows`);
  await page.getByRole('button', { name: 'Amount in euros' }).click();
  await page.waitForFunction((g) => document.querySelector(`${g} [role="columnheader"][data-field="amount"] .mx-data-grid__title`)?.textContent === 'Amount (€)', cols);
  const euro = await page.locator(`${rows(cols)} [data-field="amount"]`).first().textContent();
  check('datagrid columns: columnOption changes the title and the format live', euro.startsWith('€'), euro);

  // The header filter: a date tree, a month picked filters; a number range filters.
  await page.goto(base + 'datagrid/filtering#intervals', { waitUntil: 'load' });
  const grid = '.dg-intervals';
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForSelector(rows(grid));
  const total = (await page.locator('.dg-intervals-filter').textContent()).split(' ')[0];
  const date = page.locator(`${grid} [role="columnheader"][data-field="date"]`);
  await date.hover();
  await date.locator('.mx-data-grid__filter-button').click();
  await page.waitForSelector('.mx-data-grid__values:popover-open .mx-data-grid__values-tree [role="treeitem"]');
  const years = await page.locator('.mx-data-grid__values:popover-open [role="treeitem"][aria-level="1"]').allTextContents();
  await page.locator('.mx-data-grid__values:popover-open [role="treeitem"][aria-level="1"]', { hasText: '2026' }).locator('.mx-tree-view__toggle, [data-part="toggle"], .mx-tree-view__expander').first().click();
  const march = page.locator('.mx-data-grid__values:popover-open [role="treeitem"][aria-level="2"]', { hasText: 'March' });
  await march.waitFor();
  await march.locator('input[type="checkbox"], [role="checkbox"], .mx-tree-view__check').first().click();
  await page.locator('.mx-data-grid__values:popover-open').getByRole('button', { name: 'Apply' }).click();
  await page.waitForFunction((sel) => /"date":\{"values":\["2026\/3"\]/.test(document.querySelector(sel).textContent), '.dg-intervals-filter');
  const dates = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map((c) => c.textContent), `${rows(grid)} [data-field="date"]`);
  check('datagrid header filter: the date tree lists the years, and a month picked filters the rows', years.length >= 1 && dates.length > 0 && dates.every((d) => /^3\/\d+\/26$/.test(d)), `${years.join('|')} · ${dates.slice(0, 3).join(', ')}`);
  await page.locator('section[aria-labelledby="intervals"]').getByRole('button', { name: 'Clear the filters' }).click();
  const amount = page.locator(`${grid} [role="columnheader"][data-field="amount"]`);
  await amount.hover();
  await amount.locator('.mx-data-grid__filter-button').click();
  await page.waitForSelector('.mx-data-grid__values:popover-open [role=option]:not([data-loading])');
  const ranges = await page.locator('.mx-data-grid__values:popover-open [role=option]').allTextContents();
  await page.locator('.mx-data-grid__values:popover-open [role=option]', { hasText: /^250\.00 – 500\.00/ }).click();
  await page.locator('.mx-data-grid__values:popover-open').getByRole('button', { name: 'Apply' }).click();
  await page.waitForFunction((sel) => /"amount":\{"values":\[250\]/.test(document.querySelector(sel).textContent), '.dg-intervals-filter');
  const amounts = await page.evaluate((sel) => [...document.querySelectorAll(sel)].map((c) => Number(c.textContent.replace(/,/g, ''))), `${rows(grid)} [data-field="amount"]`);
  check('datagrid header filter: a number range filters the rows', ranges.some((r) => r.startsWith('0.00 – 250.00')) && amounts.length > 0 && amounts.every((a) => a >= 250 && a < 500), `${ranges.slice(0, 3).join(' | ')} · ${amounts.slice(0, 4).join(', ')} of ${total}`);
  await page.addScriptTag({ content: axeSource });
  await amount.locator('.mx-data-grid__filter-button').click();
  await page.waitForSelector('.mx-data-grid__values:popover-open [role=option]:not([data-loading])');
  const axeFilter = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="intervals"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid header filter: axe clean with the ranges open', axeFilter.length === 0, axeFilter.join('; '));
  await page.keyboard.press('Escape');
}
