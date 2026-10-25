/** Real-browser checks of the datagrid pages: the virtual body and its requests, keyboard, focus, column layout by mouse and keyboard, sticky columns, the tooltip, pages, editing (the new-row chain, a server error, batch saving), settings, density, row actions, selection, filters, batch saving over pages, copy and paste through the clipboard, export, the kept layout and axe. */
import { readFileSync } from 'node:fs';

export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'datagrid', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const virtual = '.dg-virtual';
  const vp = `${virtual} .mx-data-grid__viewport`;
  const shownRows = (grid) => `${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  await page.locator(virtual).scrollIntoViewIfNeeded();
  await page.waitForFunction((sel) => document.querySelectorAll(sel).length > 5, `${shownRows(virtual)}:not([data-loading])`);
  const loads = async () => Number((await page.locator('.dg-loads').textContent()).match(/^(\d+)/)[1]);

  const rows = await page.locator(shownRows(virtual)).count();
  check('datagrid: the first answer fills the view, the DOM stays small', rows > 5 && rows < 40, `${rows} rows for 100,000`);
  check('datagrid: aria-rowcount is the real total', (await page.getAttribute(vp, 'aria-rowcount')) === '100001');
  check('datagrid: only the first block was asked for', (await loads()) === 1, String(await loads()));

  // Scrolling: two seconds, a step per frame.
  const stats = await page.evaluate(
    (sel) =>
      new Promise((done) => {
        const el = document.querySelector(sel);
        const times = [];
        let last = performance.now();
        const start = last;
        const step = () => {
          const now = performance.now();
          times.push(now - last);
          last = now;
          el.scrollTop += 180;
          if (now - start < 2000) requestAnimationFrame(step);
          else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length });
        };
        requestAnimationFrame(step);
      }),
    vp,
  );
  check('datagrid: scrolling keeps the frame rate', stats.long <= stats.frames * 0.1, `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms`);

  // Jump to the end: only near the end is asked for.
  await page.waitForTimeout(600);
  const before = await loads();
  await page.locator('section[aria-labelledby="virtual"]').getByRole('button', { name: 'Go to the end' }).click();
  await page.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((r) => r.getAttribute('aria-rowindex') === '100001' && !r.hasAttribute('data-loading')), shownRows(virtual));
  const jumped = (await loads()) - before;
  check('datagrid: going to the end asks one or two blocks, nothing in between', jumped >= 1 && jumped <= 2, `${jumped} loads`);

  // Keyboard.
  await page.locator('section[aria-labelledby="virtual"]').getByRole('button', { name: 'Back to the top' }).click();
  await page.waitForTimeout(600);
  await page.click(`${shownRows(virtual)}[aria-rowindex="2"] [data-field="customer"]`);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  const at = () => page.evaluate(() => ({ field: document.activeElement.dataset.field, row: document.activeElement.closest('[role=row]')?.getAttribute('aria-rowindex'), role: document.activeElement.getAttribute('role') }));
  let focus = await at();
  check('datagrid: arrow keys move the active cell', focus.field === 'city' && focus.row === '4', JSON.stringify(focus));
  await page.keyboard.press('Control+End');
  await page.waitForTimeout(700);
  focus = await at();
  check('datagrid: Ctrl+End reaches the last row', focus.field === 'amount' && focus.row === '100001', JSON.stringify(focus));
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('ArrowUp');
  focus = await at();
  check('datagrid: ArrowUp from the first row reaches the header', focus.role === 'columnheader' && focus.field === 'id', JSON.stringify(focus));
  check('datagrid: one tab stop in the grid', (await page.locator(`${virtual} [tabindex="0"]`).count()) === 1);

  // Focus survives scrolling away.
  await page.click(`${shownRows(virtual)}[aria-rowindex="3"] [data-field="customer"]`);
  await page.evaluate((sel) => (document.querySelector(sel).scrollTop = 400_000), vp);
  await page.waitForTimeout(400);
  focus = await at();
  check('datagrid: focus stays on its cell after scrolling away', focus.row === '3', JSON.stringify(focus));
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  const inView = await page.evaluate((sel) => {
    const r = document.activeElement.getBoundingClientRect();
    const v = document.querySelector(sel).getBoundingClientRect();
    return r.top >= v.top && r.bottom <= v.bottom;
  }, vp);
  check('datagrid: the next key brings the active cell back into view', inView);

  // Resizing by mouse rebuilds no row.
  await page.evaluate((sel) => document.querySelectorAll(sel).forEach((r) => (r.dataset.mark = '1')), `${virtual} .mx-data-grid__body > .mx-data-grid__row`);
  const cityHeader = page.locator(`${virtual} [role=columnheader][data-field="city"]`);
  const handle = await box(cityHeader.locator('.mx-data-grid__resize'));
  const widthBefore = (await box(cityHeader)).width;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + 80, handle.y + handle.height / 2, { steps: 6 });
  await page.mouse.up();
  const widthAfter = (await box(cityHeader)).width;
  const cellWidth = (await box(page.locator(`${shownRows(virtual)} [data-field="city"]`).first())).width;
  const marked = await page.evaluate((sel) => [...document.querySelectorAll(sel)].every((r) => r.dataset.mark === '1'), `${virtual} .mx-data-grid__body > .mx-data-grid__row`);
  check('datagrid: dragging the edge resizes header and cells together', Math.abs(widthAfter - widthBefore - 77) < 6 && Math.abs(cellWidth - widthAfter) < 1, `${widthBefore} → ${widthAfter}, cell ${cellWidth}`);
  check('datagrid: resizing rebuilds no row', marked);

  // Moving by mouse.
  const order = () => page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((h) => h.offsetParent).map((h) => h.dataset.field), `${virtual} [role=columnheader]`);
  const from = await box(page.locator(`${virtual} [role=columnheader][data-field="city"] .mx-data-grid__title`));
  const to = await box(page.locator(`${virtual} [role=columnheader][data-field="customer"]`));
  await page.mouse.move(from.x + 5, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 10, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  let fields = await order();
  check('datagrid: dragging a header moves the column', fields.indexOf('city') === fields.indexOf('customer') - 1, fields.join(','));
  check('datagrid: a drag does not sort', (await page.getAttribute(`${virtual} [role=columnheader][data-field="city"]`, 'aria-sort')) === null);

  // The column menu from the keyboard.
  await page.focus(`${virtual} [role=columnheader][data-field="city"]`);
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector(`${virtual} .mx-data-grid__menu:popover-open`);
  const firstItem = await page.evaluate(() => document.activeElement.textContent);
  check('datagrid: Alt+ArrowDown opens the column menu with focus inside', firstItem === 'Sort ascending', firstItem);
  await page.keyboard.press('Escape');
  check('datagrid: Escape closes the menu and gives focus back', (await at()).field === 'city' && !(await page.$(`${virtual} .mx-data-grid__menu:popover-open`)));
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Hide column' }).click();
  check('datagrid: hiding a column from the menu', (await page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).display, `${virtual} [role=columnheader][data-field="city"]`)) === 'none');
  await page.focus(`${virtual} [role=columnheader][data-field="customer"]`);
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Move' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  fields = await order();
  check('datagrid: moving a column with the keyboard', fields.indexOf('customer') > fields.indexOf('status'), fields.join(','));
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Reset layout' }).click();

  // Sticky columns keep their edges.
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 300), vp);
  const edges = await page.evaluate(
    ([sel, rows]) => {
      const el = document.querySelector(sel);
      const v = el.getBoundingClientRect();
      const first = document.querySelector(`${rows} [data-field="id"]`).getBoundingClientRect();
      const amount = document.querySelector(`${rows} [data-field="amount"]`).getBoundingClientRect();
      return { start: first.left - v.left, end: v.left + el.clientWidth - amount.right };
    },
    [vp, shownRows(virtual)],
  );
  check('datagrid: sticky columns keep their edges', Math.abs(edges.start) < 1.5 && Math.abs(edges.end) < 1.5, JSON.stringify(edges));
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 0), vp);

  // A cut-off note shows in the kit's tooltip.
  const local = '.dg-local';
  await page.locator(local).scrollIntoViewIfNeeded();
  const long = await page.evaluateHandle((sel) => [...document.querySelectorAll(`${sel} .mx-data-grid__body [data-field="note"]`)].find((c) => c.scrollWidth > c.clientWidth + 1), local);
  if (long.asElement()) {
    await long.asElement().scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const b = await long.asElement().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.move(b.x + b.width / 2 + 2, b.y + b.height / 2);
    await page.waitForTimeout(800);
    const tip = await page.evaluate(() => document.querySelector('.mx-data-grid__tip:popover-open')?.textContent ?? '');
    check('datagrid: hovering a cut-off cell shows its full text', tip.length > 20, tip.slice(0, 40));
  } else check('datagrid: hovering a cut-off cell shows its full text', false, 'no cut-off note');

  // Pages: the last page asks exactly one page.
  const paged = '.dg-paged';
  await page.locator(paged).scrollIntoViewIfNeeded();
  const pagedLoads = async () => Number((await page.locator('.dg-paged-loads').textContent()).match(/^(\d+)/)[1]);
  const pagedBefore = await pagedLoads();
  await page.locator(`${paged} .mx-data-grid__page-step[data-step="last"]`).click();
  await page.waitForFunction((sel) => document.querySelector(sel).textContent.includes('5,000 of 5,000'), `${paged} .mx-data-grid__page-info`);
  await page.waitForFunction((sel) => document.querySelectorAll(sel).length === 20, `${shownRows(paged)}:not([data-loading])`);
  check('datagrid: the last page asks for one page', (await pagedLoads()) - pagedBefore === 1, `${(await pagedLoads()) - pagedBefore} loads`);

  // Editing: a new row at the end, the Tab chain, Escape.
  await page.goto(base + 'datagrid/editing', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const editing = '.dg-editing';
  await page.locator(editing).scrollIntoViewIfNeeded();
  await page.waitForFunction((sel) => document.querySelectorAll(sel).length > 3, `${shownRows(editing)}:not([data-loading])`);
  const where = () =>
    page.evaluate(() => {
      const el = document.activeElement;
      const cell = el.closest('.mx-data-grid__cell');
      return { row: cell ? Number(cell.closest('[role=row]').getAttribute('aria-rowindex')) - 2 : -1, field: cell?.dataset.field ?? '', editing: !!el.closest('.mx-data-grid__editor') };
    });
  await page.locator(`${editing} .mx-data-grid__add`).click();
  await page.waitForFunction(() => document.activeElement?.closest('.mx-data-grid__editor'));
  let w = await where();
  check('datagrid: "New row" opens a row at the end, its first cell in edit mode', w.row === 30 && w.field === 'customer' && w.editing, JSON.stringify(w));
  await page.keyboard.type('Test Customer');
  await page.keyboard.press('Tab'); // city
  await page.keyboard.type('A');
  await page.keyboard.press('Tab'); // date
  await page.keyboard.press('Tab'); // status
  await page.keyboard.press('Tab'); // paid
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab'); // note
  await page.keyboard.type('a note');
  await page.keyboard.press('Tab'); // amount
  await page.keyboard.type('125.5');
  const t0 = Date.now();
  await page.keyboard.press('Tab');
  await page.waitForFunction(() => {
    const cell = document.activeElement?.closest('.mx-data-grid__cell');
    return cell && cell.closest('[role=row]').getAttribute('aria-rowindex') === '33' && document.activeElement.closest('.mx-data-grid__editor');
  });
  const waited = Date.now() - t0;
  const cellText = (r, f) => page.evaluate(([sel, r, f]) => document.querySelector(`${sel} .mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${r + 2}"]:not([hidden]) [data-field="${f}"]`)?.textContent ?? null, [editing, r, f]);
  const saved = { id: await cellText(30, 'id'), customer: await cellText(30, 'customer'), city: await cellText(30, 'city'), paid: await cellText(30, 'paid'), amount: await cellText(30, 'amount') };
  check(
    'datagrid: Tab on the last cell saves the new row (wait) and opens the next one',
    saved.id === '31' && saved.customer === 'Test Customer' && saved.city === 'Ankara' && saved.paid === 'Yes' && saved.amount === '125.50' && waited >= 250,
    `${JSON.stringify(saved)}, waited ${waited} ms`,
  );
  await page.keyboard.press('Escape');
  w = await where();
  check('datagrid: Escape drops the new row and goes to the row above', w.row === 30 && w.field === 'customer' && !w.editing, JSON.stringify(w));

  // A server error stays on the row with its message; Escape takes the edit back.
  await page.keyboard.press('Control+Home');
  await page.waitForTimeout(300);
  await page.click(`${shownRows(editing)}[aria-rowindex="3"] [data-field="note"]`);
  await page.keyboard.type('an error here');
  await page.keyboard.press('ArrowDown');
  await page.waitForFunction((sel) => document.querySelector(sel)?.getAttribute('data-error'), `${shownRows(editing)}[aria-rowindex="3"] [data-field="note"]`);
  const failed = await page.evaluate((sel) => {
    const cell = document.querySelector(sel);
    return { error: cell.getAttribute('data-error'), invalid: cell.getAttribute('aria-invalid'), focused: document.activeElement === cell, status: cell.closest('[role=row]').dataset.status };
  }, `${shownRows(editing)}[aria-rowindex="3"] [data-field="note"]`);
  check('datagrid: a failed save keeps focus on the cell with the server message', failed.focused && failed.invalid === 'true' && failed.status === 'failed' && /does not take/.test(failed.error), JSON.stringify(failed));
  // The first Escape closes the message's tooltip, the next one takes the edit back.
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  check('datagrid: Escape takes the failed edit back', (await page.getAttribute(`${shownRows(editing)}[aria-rowindex="3"] [data-field="note"]`, 'data-error')) === null);

  // Batch: nothing goes before "Save changes".
  const section = page.locator('section[aria-labelledby="editing"]');
  await section.getByRole('button', { name: 'batch', exact: true }).click();
  await page.waitForTimeout(500);
  await page.click(`${shownRows(editing)}[aria-rowindex="2"] [data-field="customer"]`);
  await page.keyboard.type('Batch One');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.type('Batch Two');
  await page.keyboard.press('Enter');
  const pending = await page.locator(`${shownRows(editing)}[data-status="changed"]`).count();
  // "Save changes" sits in the toolbar now, an icon named by its text.
  const saveButton = page.locator(`${editing} .mx-data-grid__toolbar .mx-data-grid__save`);
  const named = await saveButton.getAttribute('title');
  await saveButton.click();
  await page.waitForFunction((sel) => document.querySelectorAll(`${sel} .mx-data-grid__body > .mx-data-grid__row[data-status]`).length === 0, editing, { timeout: 5000 });
  check('datagrid: batch keeps edits until "Save changes" in the toolbar, then saves them', pending === 2 && named === 'Save changes' && (await cellText(0, 'customer')) === 'Batch One', `${pending} changed rows, ${named}`);
  await section.getByRole('button', { name: 'wait', exact: true }).click();

  // New rows at the top: the row opens at the very top, in view.
  const fresh = '.dg-new';
  await page.locator(fresh).scrollIntoViewIfNeeded();
  await page.locator('section[aria-labelledby="new-rows"]').getByRole('button', { name: 'top', exact: true }).click();
  await page.evaluate((sel) => (document.querySelector(sel).scrollTop = 200), `${fresh} .mx-data-grid__viewport`);
  await page.locator(`${fresh} .mx-data-grid__add`).click();
  await page.waitForFunction(() => document.activeElement?.closest('.mx-data-grid__editor'));
  const top = await page.evaluate((sel) => {
    const vp = document.querySelector(`${sel} .mx-data-grid__viewport`);
    const head = document.querySelector(`${sel} .mx-data-grid__head`).getBoundingClientRect();
    const row = document.activeElement.closest('[role=row]').getBoundingClientRect();
    return { scrollTop: vp.scrollTop, inView: row.top >= head.bottom - 1, index: document.activeElement.closest('[role=row]').getAttribute('aria-rowindex') };
  }, fresh);
  check('datagrid: "New row" at the top goes all the way up, the row in view', top.scrollTop === 0 && top.inView && top.index === '2', JSON.stringify(top));
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid: axe clean with an editor open', violations.length === 0, violations.join('; '));
  await page.keyboard.press('Escape');

  // Settings, live.
  await page.goto(base + 'datagrid/layout', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const settings = page.locator('section[aria-labelledby="settings"]');
  const switches = '.dg-settings';
  await page.locator(switches).scrollIntoViewIfNeeded();
  // A column that flexes to fill the grid starts resizing from the width it shows.
  {
    // Wide enough for the columns to leave room, so the customer column flexes.
    const size = page.viewportSize();
    await page.setViewportSize({ width: 1920, height: size.height });
    await page.locator(switches).scrollIntoViewIfNeeded();
    const header = page.locator(`${switches} [role=columnheader][data-field="customer"]`);
    const before = Math.round((await box(header)).width);
    const edge = await box(header.locator('.mx-data-grid__resize'));
    await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
    await page.mouse.down();
    await page.mouse.move(edge.x + edge.width / 2 - 40, edge.y + edge.height / 2, { steps: 5 });
    await page.mouse.up();
    const after = Math.round((await box(header)).width);
    await page.setViewportSize(size);
    check('datagrid: a flexing column follows the mouse from its shown width', before > 200 && Math.abs(before - 40 - after) <= 2, `${before} → ${after}`);
  }
  // Resizing against the next column moves one edge only.
  {
    await settings.getByText('Resize against the next column', { exact: true }).click();
    const edges = () =>
      page.evaluate((sel) => Object.fromEntries(['customer', 'city', 'date'].map((f) => [f, document.querySelector(`${sel} [role=columnheader][data-field="${f}"]`).getBoundingClientRect()]).map(([f, r]) => [f, { left: Math.round(r.left), width: Math.round(r.width) }])), switches);
    const before = await edges();
    const edge = await box(page.locator(`${switches} [role=columnheader][data-field="customer"] .mx-data-grid__resize`));
    await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
    await page.mouse.down();
    await page.mouse.move(edge.x + edge.width / 2 + 50, edge.y + edge.height / 2, { steps: 5 });
    await page.mouse.up();
    const after = await edges();
    check(
      "datagrid: 'nextColumn' resizing gives the width to the next column and leaves the rest in place",
      Math.abs(after.customer.width - before.customer.width - 50) <= 2 && Math.abs(after.city.width - before.city.width + 50) <= 2 && after.date.left === before.date.left,
      `${JSON.stringify(before)} → ${JSON.stringify(after)}`,
    );
    await settings.getByText('Resize against the next column', { exact: true }).click();
  }
  const handles = () => page.evaluate((sel) => [...document.querySelectorAll(`${sel} .mx-data-grid__resize`)].filter((el) => el.offsetParent).length, switches);
  const withHandles = await handles();
  await settings.getByText('Resizing', { exact: true }).click();
  await page.waitForTimeout(100);
  check('datagrid: turning resizing off takes the handles away', withHandles > 0 && (await handles()) === 0, `${withHandles} → ${await handles()}`);
  await settings.getByText('Menu button always', { exact: true }).click();
  await page.mouse.move(5, 5);
  const shown = await page.evaluate((sel) => [...document.querySelectorAll(`${sel} .mx-data-grid__menu-button`)].filter((el) => getComputedStyle(el).opacity === '1').length, switches);
  check('datagrid: header buttons always show when asked', shown >= 7, String(shown));

  // Density: the rows follow it.
  const height = () => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().height, `${shownRows(switches)}`);
  const comfortable = await height();
  await page.evaluate(() => (document.documentElement.dataset.density = 'compact'));
  await page.waitForTimeout(400);
  const compact = await height();
  check('datagrid: compact density gives shorter rows', compact < comfortable, `${comfortable} → ${compact}`);
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));

  await actionsSelectionFilters({ page, base, check, axeSource });
  await copyExportLayout({ page, base, check, axeSource });
}

/** Row actions, selection and filters, on fresh pages. */
async function actionsSelectionFilters({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/editing', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const shownRows = (grid) => `${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const row = (grid, n) => `${shownRows(grid)}[aria-rowindex="${n}"]`;
  const at = () =>
    page.evaluate(() => {
      const el = document.activeElement;
      const cell = el.closest('[role=gridcell], [role=columnheader]');
      return { field: cell?.dataset.field ?? '', row: el.closest('[role=row]')?.getAttribute('aria-rowindex') ?? '', action: el.dataset.action ?? (el.classList.contains('mx-data-grid__more') ? 'more' : ''), tag: el.tagName };
    });

  // Row actions.
  const actions = '.dg-actions';
  const actionSection = page.locator('section[aria-labelledby="actions"]');
  await page.locator(actions).scrollIntoViewIfNeeded();
  await page.waitForFunction((sel) => document.querySelectorAll(sel).length > 3, `${shownRows(actions)}:not([data-loading])`);
  const buttonsOf = (n) => page.evaluate((sel) => [...document.querySelectorAll(`${sel} .mx-data-grid__actions > button:not([hidden])`)].map((b) => b.dataset.action ?? 'more'), row(actions, n));
  let shown = await buttonsOf(3);
  check('datagrid actions: the first actions show, the rest go into "more"', shown.join(',') === 'edit,remove,more', shown.join(','));
  shown = await buttonsOf(2);
  check('datagrid actions: a row gets its own set from the function', shown[0] === 'approve' && shown.at(-1) === 'more', shown.join(','));
  const vp = `${actions} .mx-data-grid__viewport`;
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 400), vp);
  const edge = await page.evaluate(
    ([sel, r]) => {
      const el = document.querySelector(sel);
      const cell = document.querySelector(`${r} [data-field="mx:actions"]`).getBoundingClientRect();
      return el.getBoundingClientRect().left + el.clientWidth - cell.right;
    },
    [vp, row(actions, 3)],
  );
  check('datagrid actions: the pinned actions column keeps the end edge', Math.abs(edge) < 1.5, String(edge));
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 0), vp);

  await page.click(`${row(actions, 3)} .mx-data-grid__more`);
  await page.waitForSelector('.mx-data-grid__menu:popover-open');
  const items = await page.evaluate(() => [...document.querySelectorAll('.mx-data-grid__menu:popover-open [role^=menuitem]')].map((i) => `${i.textContent}${i.getAttribute('aria-disabled') === 'true' ? '(off)' : ''}`));
  check('datagrid actions: the "more" menu holds the rest, disabled ones dimmed', items.join(',') === 'Print,Mail the customer(off)' || items.join(',') === 'Print,Mail the customer', items.join(','));
  await page.keyboard.press('Enter');
  check('datagrid actions: an action from the "more" menu runs', /Order 2 sent to the printer/.test(await page.locator('.dg-action-note').textContent()));
  let f = await at();
  check('datagrid actions: closing the menu gives focus back to its button', f.action === 'more' && f.row === '3', JSON.stringify(f));
  await page.keyboard.press('ArrowLeft');
  f = await at();
  check('datagrid actions: Left moves between the buttons of the cell', f.action === 'remove', JSON.stringify(f));
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  f = await at();
  check('datagrid actions: Left past the first button goes to the cell before', f.field === 'amount' && f.tag === 'DIV', JSON.stringify(f));
  await page.keyboard.press('ArrowRight');
  f = await at();
  check('datagrid actions: Right into the cell lands on its first button', f.action === 'edit', JSON.stringify(f));

  await page.click(`${row(actions, 2)} [data-action="approve"]`);
  await page.waitForTimeout(100);
  shown = await buttonsOf(2);
  const status = await page.textContent(`${row(actions, 2)} [data-field="status"]`);
  check('datagrid actions: an action changes the row, the row gets its new set', status === 'Approved' && shown[0] === 'edit', `${status} ${shown.join(',')}`);
  await page.click(`${row(actions, 4)} [data-action="remove"]`);
  await page.waitForTimeout(100);
  shown = await buttonsOf(4);
  check('datagrid actions: delete marks the row (batch) and "restore" takes its place', (await page.getAttribute(row(actions, 4), 'data-status')) === 'removed' && shown.join(',') === 'restore', shown.join(','));
  await page.click(`${row(actions, 4)} [data-action="restore"]`);
  await page.click(`${row(actions, 5)} [data-action="edit"]`);
  f = await page.evaluate(() => !!document.activeElement.closest('.mx-data-grid__editor'));
  check('datagrid actions: "edit" opens the editor of the row', f);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await actionSection.getByRole('button', { name: '260px' }).click();
  await page.waitForTimeout(100);
  shown = await buttonsOf(3);
  check('datagrid actions: a wider column shows every button, no "more"', !shown.includes('more') && shown.length === 4, shown.join(','));
  await actionSection.getByRole('button', { name: 'start', exact: true }).click();
  await page.waitForTimeout(100);
  const order = await page.evaluate((sel) => [...document.querySelectorAll(`${sel} [role=columnheader]`)].filter((h) => h.offsetParent).map((h) => h.dataset.field), actions);
  check('datagrid actions: the column moves to the start, after the row status', order[0] === 'mx:status' && order[1] === 'mx:actions', order.slice(0, 3).join(','));
  await actionSection.getByText('Pinned', { exact: true }).click();
  await page.waitForTimeout(100);
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 300), vp);
  const moved = await page.evaluate(
    ([sel, r]) => document.querySelector(`${r} [data-field="mx:actions"]`).getBoundingClientRect().left - document.querySelector(sel).getBoundingClientRect().left,
    [vp, row(actions, 3)],
  );
  check('datagrid actions: not pinned, it scrolls with the rows', moved < -100, String(moved));
  await page.evaluate((sel) => (document.querySelector(sel).scrollLeft = 0), vp);
  await actionSection.getByRole('button', { name: 'end', exact: true }).click();
  await actionSection.getByText('Pinned', { exact: true }).click();
  await actionSection.getByRole('button', { name: '140px' }).click();

  // Selection.
  await page.goto(base + 'datagrid/selection', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const sel = '.dg-selection';
  const state = () => page.locator('.dg-selection-state').textContent();
  await page.locator(sel).scrollIntoViewIfNeeded();
  await page.click(`${row(sel, 2)} [data-field="customer"]`);
  await page.click(`${row(sel, 4)} [data-field="customer"]`, { modifiers: ['Control'] });
  check('datagrid selection: click selects, Ctrl+click adds', /^2 selected: 2 picked \(1, 3\)/.test(await state()), await state());
  await page.click(`${row(sel, 6)} [data-field="customer"]`, { modifiers: ['Shift'] });
  check('datagrid selection: Shift+click selects the range from the anchor', /^4 selected/.test(await state()), await state());
  check('datagrid selection: rows carry aria-selected', (await page.getAttribute(row(sel, 5), 'aria-selected')) === 'true' && (await page.getAttribute(row(sel, 7), 'aria-selected')) === 'false');
  await page.click(`${row(sel, 2)} [data-field="customer"]`);
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Shift+ArrowDown');
  check('datagrid selection: Shift+Down extends the selection', /^3 selected/.test(await state()), await state());
  await page.keyboard.press('Shift+Space');
  check('datagrid selection: Shift+Space takes the active row out', /^2 selected/.test(await state()), await state());
  await page.keyboard.press('Control+a');
  check('datagrid selection: Ctrl+A selects every row', /^40 selected: all but 0/.test(await state()), await state());
  await page.click(`${row(sel, 3)} .mx-data-grid__select`);
  const header = await page.getAttribute(`${sel} [role=columnheader][data-field="mx:select"] [role=checkbox]`, 'aria-checked');
  check('datagrid selection: a row taken out of "all", the header box is mixed', /^39 selected: all but 1 \(2\)/.test(await state()) && header === 'mixed', `${await state()} ${header}`);
  await page.click(`${sel} [role=columnheader][data-field="mx:select"]`);
  check('datagrid selection: the header box from mixed selects all again', /^40 selected/.test(await state()), await state());
  await page.click(`${sel} [role=columnheader][data-field="mx:select"]`);
  check('datagrid selection: and from all, none', /^0 selected/.test(await state()), await state());
  await page.locator('section[aria-labelledby="selection"]').getByRole('button', { name: 'single', exact: true }).click();
  await page.click(`${row(sel, 2)} [data-field="customer"]`);
  await page.keyboard.press('ArrowDown');
  check('datagrid selection: single, the selection follows the active row', /^1 selected: 1 picked \(2\)/.test(await state()), await state());
  await page.locator('section[aria-labelledby="selection"]').getByRole('button', { name: 'multiple', exact: true }).click();

  const server = '.dg-server-selection';
  const serverState = () => page.locator('.dg-server-selection-state').textContent();
  await page.locator(server).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, `${shownRows(server)}:not([data-loading])`);
  await page.click(`${server} [role=columnheader][data-field="mx:select"]`);
  await page.click(`${row(server, 3)} .mx-data-grid__select`);
  check('datagrid selection: "all" over 100,000 rows on a server is a state, not keys', /^99,999 selected: all but 1 \(2\)/.test(await serverState()), await serverState());
  await page.evaluate((s) => (document.querySelector(s).scrollTop = 1_000_000), `${server} .mx-data-grid__viewport`);
  await page.waitForFunction((s) => [...document.querySelectorAll(s)].some((r) => !r.hasAttribute('data-loading') && Number(r.getAttribute('aria-rowindex')) > 20000), shownRows(server));
  const far = await page.evaluate((s) => [...document.querySelectorAll(s)].filter((r) => !r.hasAttribute('data-loading') && Number(r.getAttribute('aria-rowindex')) > 20000), shownRows(server));
  const farSelected = await page.evaluate((s) => [...document.querySelectorAll(s)].filter((r) => !r.hasAttribute('data-loading') && Number(r.getAttribute('aria-rowindex')) > 20000).every((r) => r.getAttribute('aria-selected') === 'true'), shownRows(server));
  check('datagrid selection: rows loaded later are selected too', farSelected && far !== null);
  // Scrolling with check boxes and action buttons in every row.
  const stats = await page.evaluate(
    (s) =>
      new Promise((done) => {
        const el = document.querySelector(s);
        const times = [];
        let last = performance.now();
        const start = last;
        const step = () => {
          const now = performance.now();
          times.push(now - last);
          last = now;
          el.scrollTop += 180;
          if (now - start < 2000) requestAnimationFrame(step);
          else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length });
        };
        requestAnimationFrame(step);
      }),
    `${server} .mx-data-grid__viewport`,
  );
  check('datagrid selection: scrolling with check boxes and actions keeps the frame rate', stats.long <= stats.frames * 0.1, `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms`);
  await page.click(`${server} [role=columnheader][data-field="mx:select"]`);
  await page.click(`${server} [role=columnheader][data-field="mx:select"]`);

  // Filters.
  await page.goto(base + 'datagrid/filtering', { waitUntil: 'load' });
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  const filters = '.dg-filters';
  const count = async () => Number((await page.locator('.dg-filter-count').textContent()).match(/^([\d,]+)/)[1].replace(/,/g, ''));
  await page.locator(filters).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, `${shownRows(filters)}:not([data-loading])`);
  await page.click(`${filters} .mx-data-grid__filter-cell[data-field="customer"] input`);
  await page.keyboard.type('ada');
  const typedAt = Date.now();
  await page.waitForFunction(() => /^\d+ of 200/.test(document.querySelector('.dg-filter-count').textContent) && !document.querySelector('.dg-filter-count').textContent.startsWith('200 '));
  const names = await page.evaluate((s) => [...document.querySelectorAll(`${s} [data-field="customer"]`)].map((c) => c.textContent), shownRows(filters));
  check('datagrid filters: typing in the filter row filters after a short pause', names.length > 0 && names.every((n) => /ada/i.test(n)) && Date.now() - typedAt >= 250, `${await count()} rows, ${names[0]}`);
  await page.keyboard.press('Escape');
  f = await at();
  check('datagrid filters: Escape goes back to the filter cell', f.field === 'customer' && f.row === '2', JSON.stringify(f));
  await page.keyboard.press('Delete');
  await page.waitForFunction(() => document.querySelector('.dg-filter-count').textContent.startsWith('200 '));
  check('datagrid filters: Delete on the filter cell clears it', (await count()) === 200);
  // The condition, from the keyboard.
  await page.keyboard.press('End');
  await page.keyboard.press('Alt+ArrowDown');
  await page.waitForSelector('.mx-data-grid__menu:popover-open');
  const focused = await page.evaluate(() => document.activeElement.textContent);
  check('datagrid filters: Alt+Down opens the condition menu on the chosen one', focused === 'Equals', focused);
  await page.getByRole('menuitemradio', { name: 'Greater than', exact: true }).click();
  await page.keyboard.type('900');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('.dg-filter-count').textContent.startsWith('200 '));
  const amounts = await page.evaluate((s) => [...document.querySelectorAll(`${s} [data-field="amount"]`)].map((c) => Number(c.textContent.replace(/,/g, ''))), shownRows(filters));
  check('datagrid filters: the condition "greater than" filters by number', amounts.length > 0 && amounts.every((a) => a > 900), `${await count()} rows, ${amounts.slice(0, 3)}`);
  // The header filter.
  const city = page.locator(`${filters} [role=columnheader][data-field="city"]`);
  await city.hover();
  await city.locator('.mx-data-grid__filter-button').click();
  await page.waitForSelector('.mx-data-grid__values:popover-open [role=option]');
  const values = await page.evaluate(() => [...document.querySelectorAll('.mx-data-grid__values:popover-open [role=option]')].map((o) => o.textContent));
  check('datagrid filters: the header filter lists the values with counts, honoring the other filters', values.length >= 2 && values.some((v) => /^Ankara\d+$/.test(v)), values.join(' | '));
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid filters: axe clean with the header filter open', violations.length === 0, violations.join('; '));
  await page.locator('.mx-data-grid__values:popover-open [role=option]', { hasText: 'Ankara' }).click();
  await page.locator('.mx-data-grid__values:popover-open').getByRole('button', { name: 'Apply' }).click();
  await page.waitForTimeout(100);
  const cities = await page.evaluate((s) => [...new Set([...document.querySelectorAll(`${s} [data-field="city"]`)].map((c) => c.textContent))], shownRows(filters));
  check('datagrid filters: the chosen values filter the column, together with the filter row', cities.join(',') === 'Ankara' && (await city.locator('.mx-data-grid__filter-button').getAttribute('data-active')) === '', cities.join(','));
  await page.click(`${filters} .mx-data-grid__filter-cell[data-field="customer"] input`);
  await page.keyboard.type('zzz');
  await page.waitForSelector(`${filters} .mx-data-grid__clear-filters:visible`);
  const empty = await page.textContent(`${filters} .mx-data-grid__overlay`);
  check('datagrid filters: no match says so and offers to clear', /No records match the filter/.test(empty), empty);
  await page.click(`${filters} .mx-data-grid__clear-filters`);
  await page.waitForFunction(() => document.querySelector('.dg-filter-count').textContent.startsWith('200 '));
  check('datagrid filters: "Clear filters" brings every row back', (await count()) === 200);

  // Server data: the header filter's values come from grouped loads.
  const srv = '.dg-server-filters';
  await page.locator(srv).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, `${shownRows(srv)}:not([data-loading])`);
  const statusHead = page.locator(`${srv} [role=columnheader][data-field="status"]`);
  await statusHead.focus();
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Filter by values…' }).click();
  await page.waitForSelector('.mx-data-grid__values:popover-open [role=option]:not([data-loading])');
  const serverValues = await page.evaluate(() => [...document.querySelectorAll('.mx-data-grid__values:popover-open [role=option]')].map((o) => o.textContent));
  check('datagrid filters: on a server the values come grouped, with counts', serverValues.includes('Draft20,000'), serverValues.join(' | '));
  await page.locator('.mx-data-grid__values:popover-open [role=option]', { hasText: 'Draft' }).click();
  await page.locator('.mx-data-grid__values:popover-open').getByRole('button', { name: 'Apply' }).click();
  await page.waitForFunction(() => /^20,000 orders/.test(document.querySelector('.dg-server-filter').textContent));
  const sent = await page.textContent('.dg-server-filter');
  check('datagrid filters: the filter goes to the data source as a data-layer filter', /"op":"in"/.test(sent) && /Draft/.test(sent), sent);
}

/** Batch saving over pages, copy and paste, export and the kept layout, on fresh pages. */
async function copyExportLayout({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/editing', { waitUntil: 'load' });
  const shownRows = (grid) => `${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`;
  const cellAt = (grid, row, field) => `${shownRows(grid)}[aria-rowindex="${row}"] [data-field="${field}"]`;

  // Saving all at once, over a server that loads by page: the edits stay while the pages turn.
  const batch = '.dg-batch';
  await page.locator(batch).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${shownRows(batch)}[aria-rowindex="2"]:not([data-loading]) [data-field="note"]`);
  await page.click(cellAt(batch, 2, 'note'));
  await page.keyboard.type('first');
  await page.keyboard.press('Enter');
  await page.locator(`${batch} .mx-data-grid__page-step[data-step="next"]`).click();
  await page.waitForSelector(`${shownRows(batch)}[aria-rowindex="17"]:not([data-loading]) [data-field="note"]`);
  await page.click(cellAt(batch, 17, 'note'));
  await page.keyboard.type('second');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => /^2 unsaved/.test(document.querySelector('.dg-batch-note').textContent));
  await page.locator('section[aria-labelledby="batch"]').getByRole('button', { name: 'Save changes' }).click();
  await page.waitForFunction(() => /2 saved, 0 failed/.test(document.querySelector('.dg-batch-note').textContent));
  check('datagrid batch: edits on two pages are kept and saved together', (await page.textContent('.dg-batch-note')).startsWith('0 unsaved'), await page.textContent('.dg-batch-note'));

  // Copy and paste through the real clipboard: the copy event carries the text and a table.
  await page.goto(base + 'datagrid/selection', { waitUntil: 'load' });
  const clip = '.dg-clipboard';
  await page.locator(clip).scrollIntoViewIfNeeded();
  await page.waitForSelector(cellAt(clip, 2, 'customer'));
  await page.evaluate(() => {
    window.__copied = [];
    window.addEventListener('copy', (e) => window.__copied.push({ text: e.clipboardData.getData('text/plain'), html: e.clipboardData.getData('text/html') }));
  });
  const lastCopy = () => page.evaluate(() => window.__copied.at(-1) ?? null);
  await page.click(cellAt(clip, 3, 'customer'));
  await page.click(cellAt(clip, 4, 'customer'), { modifiers: ['Control'] });
  await page.keyboard.press('Control+C');
  let copied = await lastCopy();
  const lines = copied?.text.split('\r\n') ?? [];
  check('datagrid clipboard: Ctrl+C copies the selected rows as tab-separated text and an HTML table', lines.length === 2 && lines[0].startsWith('2\t') && lines[1].startsWith('3\t') && lines[0].split('\t').length === 8 && /^<table><tbody><tr><td>2<\/td>/.test(copied.html), JSON.stringify(copied).slice(0, 160));
  await page.click(cellAt(clip, 4, 'customer'), { modifiers: ['Control'] });
  await page.click(cellAt(clip, 3, 'customer'), { modifiers: ['Control'] });
  await page.keyboard.press('Control+C');
  copied = await lastCopy();
  const source = await page.textContent(cellAt(clip, 3, 'customer'));
  check('datagrid clipboard: without a selection Ctrl+C copies the active cell', copied?.text === source, `${copied?.text} / ${source}`);
  await page.click(cellAt(clip, 6, 'customer'));
  await page.keyboard.press('Control+V');
  await page.waitForTimeout(100);
  const target = page.locator(cellAt(clip, 6, 'customer'));
  check('datagrid clipboard: Ctrl+V pastes the clipboard into the cell as an edit', (await target.textContent()) === source && (await target.getAttribute('data-changed')) !== null, await target.textContent());
  // Lines from a spreadsheet: each value read by its column, cells that cannot be edited skipped.
  await page.click(cellAt(clip, 8, 'id'));
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.setData('text/plain', '999\tPasted One\tİzmir\n998\tPasted Two\tKonya\n');
    document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(100);
  const pasted = await page.evaluate(
    ([a, b]) => [...document.querySelectorAll(a), ...document.querySelectorAll(b)].map((c) => c.textContent),
    [`${cellAt(clip, 8, 'id')}, ${cellAt(clip, 8, 'customer')}, ${cellAt(clip, 8, 'city')}`, `${cellAt(clip, 9, 'id')}, ${cellAt(clip, 9, 'customer')}, ${cellAt(clip, 9, 'city')}`],
  );
  check('datagrid clipboard: pasted lines fill the rows below, column by column; the number column keeps its values', pasted.join('|') === '7|Pasted One|İzmir|8|Pasted Two|Konya', pasted.join('|'));
  // Past the last row, new rows open when the setting allows.
  await page.locator('section[aria-labelledby="clipboard"]').getByLabel('New rows from extra lines').check();
  await page.click(cellAt(clip, 2, 'customer'));
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.setData('text/plain', 'Last\nNew A\nNew B');
    document.activeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(200);
  const added = await page.locator(`${shownRows(clip)}[data-status="new"]`).count();
  check('datagrid clipboard: lines past the last row open new rows when allowed', added === 2, `${added} new rows`);

  // Export: the toolbar's button saves a CSV file a spreadsheet opens.
  const exp = '.dg-export';
  await page.locator(exp).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${exp} .mx-data-grid__export`);
  const [download] = await Promise.all([page.waitForEvent('download'), page.click(`${exp} .mx-data-grid__export`)]);
  const csv = readFileSync(await download.path(), 'utf8');
  const rowsOut = csv.split('\r\n');
  check(
    'datagrid export: the "Export" button saves a CSV with a byte order mark, the titles and every row',
    download.suggestedFilename() === 'Orders to export.csv' && csv.startsWith('﻿No,Customer,City,Date,Status,Paid,Note,Amount\r\n') && rowsOut.length === 62 && rowsOut[1].startsWith('1,'),
    `${download.suggestedFilename()} · ${rowsOut.length} lines · ${JSON.stringify(rowsOut[1])}`,
  );
  await page.click(`${exp} .mx-data-grid__header-cell[data-field="amount"] .mx-data-grid__title`);
  await page.locator('section[aria-labelledby="export"]').getByRole('button', { name: 'The first two rows as objects' }).click();
  await page.waitForFunction(() => document.querySelector('.dg-exported').textContent.startsWith('[{'));
  const objects = JSON.parse(await page.textContent('.dg-exported'));
  check('datagrid export: exportRows gives the rows in the sort order, by field, with raw values', objects.length === 2 && objects[0].amount <= objects[1].amount && Object.keys(objects[0])[0] === 'id', JSON.stringify(objects).slice(0, 160));
  // The server's loads are counted under the paged grid of the overview: read them there, in the same document.
  const openInPage = async (path) => {
    await page.locator(`.docs-sidebar a[href="${path}"]`).click();
    await page.waitForURL((url) => url.pathname === path);
  };
  const pagedLoadCount = async () => {
    await openInPage('/datagrid');
    await page.waitForSelector(`${shownRows('.dg-paged')}:not([data-loading])`);
    const count = Number((await page.locator('.dg-paged-loads').textContent()).match(/^(\d+)/)[1]);
    await openInPage('/datagrid/selection');
    await page.locator('section[aria-labelledby="export"]').waitFor();
    return count;
  };
  const loadsBefore = await pagedLoadCount();
  const [serverFile] = await Promise.all([page.waitForEvent('download', { timeout: 60_000 }), page.locator('section[aria-labelledby="export"]').getByRole('button', { name: 'Export the 100,000 orders by page' }).click()]);
  const serverCsv = readFileSync(await serverFile.path(), 'utf8');
  const serverLines = serverCsv.split('\r\n').length;
  await page.waitForFunction(() => /100,000 of 100,000 — saved/.test(document.querySelector('.dg-export-progress').textContent));
  const exportLoads = (await pagedLoadCount()) - loadsBefore;
  check('datagrid export: a server grid exports every row in parts through its data source', serverLines === 100_002 && exportLoads === 10 && serverFile.suggestedFilename() === 'orders.csv', `${serverLines} lines, ${exportLoads} loads`);

  await page.addScriptTag({ content: axeSource });
  const axeSelection = await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `selection page ${v.id}: ${v.nodes.length}`));

  // The layout comes back after a reload.
  await page.goto(base + 'datagrid/layout', { waitUntil: 'load' });
  const lay = '.dg-layout';
  await page.evaluate(() => localStorage.removeItem('motifx-ui:data-grid:docs-orders'));
  await page.locator(lay).scrollIntoViewIfNeeded();
  await page.waitForSelector(cellAt(lay, 3, 'customer'));
  await page.click(`${lay} .mx-data-grid__header-cell[data-field="customer"] .mx-data-grid__title`);
  const layCity = page.locator(`${lay} [role=columnheader][data-field="city"]`);
  const cityHandle = await (layCity.locator('.mx-data-grid__resize')).boundingBox();
  await page.mouse.move(cityHandle.x + cityHandle.width / 2, cityHandle.y + cityHandle.height / 2);
  await page.mouse.down();
  await page.mouse.move(cityHandle.x + 60, cityHandle.y + cityHandle.height / 2, { steps: 5 });
  await page.mouse.up();
  const cityWidth = Math.round((await layCity.boundingBox()).width);
  await page.click(`${lay} .mx-data-grid__filter-cell[data-field="customer"] input`);
  await page.keyboard.type('ada');
  await page.waitForFunction((s) => [...document.querySelectorAll(s)].every((c) => c.textContent === 'Ada Lovelace'), `${shownRows(lay)} [data-field="customer"]`);
  await page.waitForTimeout(400);
  await page.reload({ waitUntil: 'load' });
  await page.locator(lay).scrollIntoViewIfNeeded();
  await page.waitForSelector(cellAt(lay, 3, 'customer'));
  // The column widths are applied once the grid is in the page, which may come after its first rows.
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__viewport`)?.style.getPropertyValue('--_columns'), lay);
  const back = await page.evaluate((s) => ({
    sort: document.querySelector(`${s} [role=columnheader][data-field="customer"]`).getAttribute('aria-sort'),
    city: Math.round(document.querySelector(`${s} [role=columnheader][data-field="city"]`).getBoundingClientRect().width),
    filter: document.querySelector(`${s} .mx-data-grid__filter-cell[data-field="customer"] input`).value,
    names: [...new Set([...document.querySelectorAll(`${s} .mx-data-grid__body > .mx-data-grid__row:not([hidden]) [data-field="customer"]`)].map((c) => c.textContent))],
  }), lay);
  check('datagrid layout: sort, widths and filters come back after a reload', back.sort === 'ascending' && Math.abs(back.city - cityWidth) <= 1 && back.filter === 'ada' && back.names.join() === 'Ada Lovelace', JSON.stringify(back) + ` (${cityWidth})`);
  await page.locator('section[aria-labelledby="layout"]').getByRole('button', { name: 'Reset the layout' }).click();
  const reset = await page.evaluate((s) => ({
    sort: document.querySelector(`${s} [role=columnheader][data-field="customer"]`).getAttribute('aria-sort'),
    city: Math.round(document.querySelector(`${s} [role=columnheader][data-field="city"]`).getBoundingClientRect().width),
  }), lay);
  check('datagrid layout: "Reset the layout" goes back to the column definitions', reset.sort === null && reset.city === 120, JSON.stringify(reset));
  await page.evaluate(() => localStorage.removeItem('motifx-ui:data-grid:docs-orders'));
  await page.addScriptTag({ content: axeSource });
  const axeFound = [...axeSelection, ...(await page.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id}: ${v.nodes.length}`)))];
  check('datagrid: axe clean with the export, clipboard and layout examples', axeFound.length === 0, axeFound.join('; '));
}
