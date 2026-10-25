/** Real-browser checks of the datagrid's grouping: a header dragged to the group panel, group rows with their counts, opening and closing by mouse and keyboard, the chips' order and removal, the column menu, grouping on a server, axe and the frame rate of a grouped virtual list. */

export default async function ({ page, base, check, axeSource }) {
  await page.goto(base + 'datagrid/grouping', { waitUntil: 'load' });
  const local = '.dg-grouping';
  const groups = (g) => page.evaluate((s) => [...document.querySelectorAll(`${s} .mx-data-grid__group-row:not([hidden])`)].sort((a, b) => a.getAttribute('aria-rowindex') - b.getAttribute('aria-rowindex')).map((r) => `${r.getAttribute('aria-level')}${r.getAttribute('aria-expanded') === 'true' ? '>' : '+'} ${r.textContent.trim()}`), g);
  const chips = () => page.evaluate((s) => [...document.querySelectorAll(`${s} .mx-data-grid__chip`)].map((c) => `${c.textContent}:${c.dataset.dir}`), local);
  await page.locator(local).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${local} .mx-data-grid__group-row:not([hidden])`);

  const first = await groups(local);
  check('datagrid grouping: group rows read “Column: value (count)”, levels below them', first[0] === '1> City: Ankara (72)' && first[1] === '2> Status: Approved (14)', first.slice(0, 3).join(' · '));
  const row = await page.evaluate((s) => {
    const r = document.querySelector(`${s} .mx-data-grid__group-row:not([hidden])`);
    const c = r.querySelector('.mx-data-grid__group-cell');
    return { role: r.getAttribute('role'), cell: c.getAttribute('role'), span: c.getAttribute('aria-colspan'), headers: [...document.querySelectorAll(`${s} .mx-data-grid__header-cell[aria-colindex]`)].map((h) => h.dataset.field) };
  }, local);
  check('datagrid grouping: a group row is a row with one cell over the columns; the grouped columns leave the headers', row.role === 'row' && row.cell === 'gridcell' && Number(row.span) === row.headers.length && !row.headers.includes('city') && !row.headers.includes('status'), JSON.stringify(row));

  // Drag the Customer header onto the toolbar, far from the chips: the whole bar takes it for the group panel.
  const header = page.locator(`${local} .mx-data-grid__header-cell[data-field="customer"]`);
  const bar = page.locator(`${local} .mx-data-grid__toolbar`);
  const hb = await header.boundingBox();
  const tb = await bar.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 30, hb.y + hb.height / 2, { steps: 3 });
  const ready = await page.evaluate((s) => {
    const ghost = document.querySelector(`${s} .mx-data-grid__ghost`);
    return { ready: document.querySelector(`${s} .mx-data-grid__toolbar`).hasAttribute('data-drop-ready'), ghost: ghost?.textContent ?? null };
  }, local);
  check('datagrid grouping: dragging a header shows its title next to the pointer and marks the toolbar as a drop place', ready.ready && ready.ghost === 'Customer', JSON.stringify(ready));
  await page.mouse.move(tb.x + tb.width * 0.6, tb.y + tb.height / 2, { steps: 4 });
  const over = await page.evaluate((s) => ({
    drop: document.querySelector(`${s} .mx-data-grid__toolbar`).hasAttribute('data-drop'),
    target: document.querySelector(`${s} .mx-data-grid__ghost`)?.dataset.target ?? null,
    under: (() => {
      const g = document.querySelector(`${s} .mx-data-grid__ghost`).getBoundingClientRect();
      return { x: Math.round(g.left), y: Math.round(g.top) };
    })(),
  }), local);
  const marked = over.drop && over.target === 'group' && Math.abs(over.under.x - (tb.x + tb.width * 0.6) - 14) <= 2;
  check('datagrid grouping: over the toolbar the ghost says it will group, next to the pointer', marked, JSON.stringify(over));
  await page.mouse.up();
  check('datagrid grouping: the ghost and the marks go when the header is dropped', await page.evaluate((s) => !document.querySelector(`${s} .mx-data-grid__ghost`) && !document.querySelector(`${s} .mx-data-grid__toolbar`).hasAttribute('data-drop-ready'), local));
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__chip`).length === 3, local);
  const third = await groups(local);
  check('datagrid grouping: a header dragged to the panel groups by its column, the panel shows where it lands', marked && (await chips()).join() === 'City:asc,Status:asc,Customer:asc' && third[2].startsWith('3> Customer: '), `${(await chips()).join()} · ${third[2]}`);

  // Mouse: the arrow closes; keyboard: Enter opens, Left closes, Right opens and goes in.
  const arrow = page.locator(`${local} .mx-data-grid__group-row:not([hidden]) .mx-data-grid__group-toggle`).first();
  await arrow.click();
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="2"]`)?.getAttribute('aria-expanded') === 'false', local);
  const closed = await groups(local);
  check('datagrid grouping: the arrow closes a group, which then stands for its rows', closed[0] === '1+ City: Ankara (72)' && closed[1].startsWith('1> City: Antalya'), closed.slice(0, 2).join(' · '));
  const cell = page.locator(`${local} .mx-data-grid__group-row[aria-rowindex="2"] .mx-data-grid__group-cell`);
  await cell.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="2"]`)?.getAttribute('aria-expanded') === 'true', local);
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="2"]`)?.getAttribute('aria-expanded') === 'false', local);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const inside = await page.evaluate(() => document.activeElement.closest('.mx-data-grid__group-row')?.getAttribute('aria-level'));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const onData = await page.evaluate(() => document.activeElement.closest('.mx-data-grid__row:not(.mx-data-grid__group-row)') !== null);
  check('datagrid grouping: Enter, Left and Right open and close a group row, the arrows go on into its rows', inside === '2' && onData, JSON.stringify({ inside, onData }));

  // Chips: a click turns the order of the groups, Delete takes one away.
  await page.locator(`${local} .mx-data-grid__chip[data-group="city"]`).click();
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="2"]`)?.textContent.includes('Trabzon'), local);
  await page.locator(`${local} .mx-data-grid__chip[data-group="customer"]`).focus();
  await page.keyboard.press('Delete');
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__chip`).length === 2, local);
  const afterDelete = await page.evaluate(() => document.activeElement.textContent);
  check('datagrid grouping: a chip click turns its groups, Delete ungroups and focus stays on the chips', (await chips()).join() === 'City:desc,Status:asc' && afterDelete === 'Status', `${(await chips()).join()} · ${afterDelete}`);

  // The column menu: group by Date from the keyboard, then ungroup all.
  const dateHeader = page.locator(`${local} .mx-data-grid__header-cell[data-field="date"]`);
  await dateHeader.focus();
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Group by this column' }).click();
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__chip`).length === 3, local);
  const announced = await page.locator(`${local} .mx-data-grid__live[aria-live]`).textContent();
  await page.locator(`${local} .mx-data-grid__header-cell[data-field="customer"]`).focus();
  await page.keyboard.press('Alt+ArrowDown');
  await page.getByRole('menuitem', { name: 'Ungroup all' }).click();
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__chip`).length === 0, local);
  const empty = await page.locator(`${local} .mx-data-grid__group-empty`).textContent();
  check('datagrid grouping: the column menu groups and ungroups; the empty panel says what to do', announced === 'Grouped by Date' && empty.startsWith('Drag a column header here') && (await groups(local)).length === 0, `${announced} · ${empty}`);

  // A server that groups: the groups with their counts, the rows of the one opened.
  const server = '.dg-grouping-server';
  await page.locator(server).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__group-row:not([hidden])`).length === 5, server);
  const counts = await groups(server);
  const loads = async () => Number((await page.locator('.dg-grouping-loads').textContent()).match(/^(\d+)/)[1]);
  const before = await loads();
  await page.locator('section[aria-labelledby="grouping"]').getByRole('button', { name: 'Open “Shipped”' }).click();
  await page.waitForFunction((s) => [...document.querySelectorAll(`${s} .mx-data-grid__body > .mx-data-grid__row:not(.mx-data-grid__group-row):not([hidden]):not([data-loading])`)].length > 0, server);
  const shipped = await page.evaluate((s) => [...document.querySelectorAll(`${s} .mx-data-grid__body > .mx-data-grid__row:not(.mx-data-grid__group-row):not([hidden])`)].length, server);
  check(
    'datagrid grouping: a server gives the groups with their counts and only the rows of the open group where the list looks',
    counts.every((c) => c.endsWith('(20,000)')) && (await loads()) - before === 1 && shipped > 0 && shipped < 20,
    `${counts.join(' · ')} · ${(await loads()) - before} load(s), ${shipped} rows drawn`,
  );

  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="grouping"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid grouping: axe clean with group rows, chips and the panel', axe.length === 0, axe.join('; '));

  // Every group open: scrolling the grouped virtual list keeps the frame rate.
  await page.locator('section[aria-labelledby="grouping"]').getByRole('button', { name: 'Open all' }).last().click();
  await page.waitForFunction((s) => [...document.querySelectorAll(`${s} .mx-data-grid__group-row:not([hidden])`)].every((r) => r.getAttribute('aria-expanded') === 'true'), server);
  await page.waitForTimeout(600);
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
          else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length, rows: el.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden])').length });
        };
        requestAnimationFrame(step);
      }),
    `${server} .mx-data-grid__viewport`,
  );
  check('datagrid grouping: scrolling a grouped virtual list keeps the frame rate, the DOM stays small', stats.long <= stats.frames * 0.1 && stats.rows < 40, `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms, ${stats.rows} rows`);
}
