/** Real-browser checks of the datagrid's summaries: totals under their columns following a filter, the row of totals pinned under the rows and moving sideways, group summaries in group rows and footers, recalculating while editing, a server's summaries, axe and the frame rate of a grouped virtual list with footers. */

export default async function ({ page, base, check, axeSource, box }) {
  await page.goto(base + 'datagrid', { waitUntil: 'load' });
  const local = '.dg-summaries';
  const section = page.locator('section[aria-labelledby="summaries"]');
  // What an item shows: its first part; the naming text after it is for assistive technology only.
  const totals = (g, field) => page.evaluate(([s, f]) => [...document.querySelectorAll(`${s} .mx-data-grid__total-row [data-field="${f}"] .mx-data-grid__summary-item`)].map((e) => e.firstChild.textContent), [g, field]);
  await page.locator(local).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${local} .mx-data-grid__group-row:not([hidden])`);

  // Totals under their columns, named for assistive technology, counted among the rows.
  const first = { count: await totals(local, 'customer'), amount: await totals(local, 'amount') };
  const aria = await page.evaluate((s) => {
    const row = document.querySelector(`${s} .mx-data-grid__total-row`);
    return {
      role: row.getAttribute('role'),
      index: Number(row.getAttribute('aria-rowindex')),
      count: Number(document.querySelector(`${s} .mx-data-grid__viewport`).getAttribute('aria-rowcount')),
      label: row.querySelector('[data-field="amount"] .mx-sr-only')?.textContent ?? '',
      group: row.parentElement.getAttribute('aria-label'),
    };
  }, local);
  check(
    'datagrid summaries: the row of totals shows each item under its column and names it',
    first.count[0] === 'Count: 300' && first.amount[0].startsWith('Sum: ') && first.amount[1].startsWith('Avg: ') && aria.role === 'row' && aria.index === aria.count && aria.label.startsWith('Sum of Amount: ') && aria.group === 'Totals',
    `${first.count} · ${first.amount.join(' | ')} · ${JSON.stringify(aria)}`,
  );

  // The row stays under the rows while they scroll, and moves sideways with the columns.
  const vp = page.locator(`${local} .mx-data-grid__viewport`);
  await vp.evaluate((el) => (el.scrollTop = 2000));
  await page.waitForTimeout(150);
  const pinned = await page.evaluate((s) => {
    const v = document.querySelector(`${s} .mx-data-grid__viewport`).getBoundingClientRect();
    const f = document.querySelector(`${s} .mx-data-grid__foot`).getBoundingClientRect();
    return Math.abs(f.bottom - v.bottom) <= 1 + (v.height - document.querySelector(`${s} .mx-data-grid__viewport`).clientHeight);
  }, local);
  await vp.evaluate((el) => (el.scrollLeft = 200));
  await page.waitForTimeout(150);
  const head = await box(page.locator(`${local} .mx-data-grid__header-cell[data-field="customer"]`));
  const foot = await box(page.locator(`${local} .mx-data-grid__total-row [data-field="customer"]`));
  const headAmount = await box(page.locator(`${local} .mx-data-grid__header-cell[data-field="amount"]`));
  const footAmount = await box(page.locator(`${local} .mx-data-grid__total-row [data-field="amount"]`));
  check('datagrid summaries: the row of totals stays at the bottom and its cells keep under their headers, sticky ones too', pinned && Math.abs(head.x - foot.x) < 1 && Math.abs(headAmount.x - footAmount.x) < 1, JSON.stringify({ pinned, head: head.x, foot: foot.x, headAmount: headAmount.x, footAmount: footAmount.x }));
  await vp.evaluate((el) => {
    el.scrollLeft = 0;
    el.scrollTop = 0;
  });

  // A filter: the totals follow it.
  await page.locator(`${local} .mx-data-grid__filter-cell[data-field="customer"] input`).fill('Ada');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__total-row [data-field="customer"] .mx-data-grid__summary-item`)?.firstChild.textContent === 'Count: 30', local, { timeout: 5000 }).catch(() => {});
  const filtered = await totals(local, 'customer');
  check('datagrid summaries: the totals follow the filter', filtered[0] === 'Count: 30', filtered.join());
  await page.locator(`${local} .mx-data-grid__filter-cell[data-field="customer"] input`).fill('');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__total-row [data-field="customer"] .mx-data-grid__summary-item`)?.firstChild.textContent === 'Count: 300', local);

  // Group rows: the sum under its column, or after the text; footers after each group's rows.
  const aligned = await page.evaluate((s) => {
    const row = document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="3"]`);
    const cell = row.querySelector('.mx-data-grid__summary-cell[data-field="amount"]:not([hidden])');
    return { text: row.querySelector('.mx-data-grid__group-text').textContent, cell: cell?.querySelector('[aria-hidden]')?.textContent ?? null, label: cell?.querySelector('.mx-sr-only')?.textContent ?? null };
  }, local);
  await section.getByText('Sum under its column in the group row', { exact: true }).click();
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__group-row[aria-rowindex="3"] .mx-data-grid__group-text`).textContent.includes('Sum of Amount'), local);
  const inText = await page.locator(`${local} .mx-data-grid__group-row[aria-rowindex="3"] .mx-data-grid__group-text`).textContent();
  check(
    'datagrid summaries: a group item shows under its column in the group row, or after the group text',
    aligned.text === 'City: Ankara (43)' && aligned.cell?.startsWith('Sum: ') && aligned.label?.startsWith('Sum of Amount: ') && /^City: Ankara \(43\) · Sum of Amount: [\d,.]+$/.test(inText),
    `${JSON.stringify(aligned)} · ${inText}`,
  );
  await vp.evaluate((el) => (el.scrollTop = 36 * 40));
  await page.waitForSelector(`${local} .mx-data-grid__group-footer:not([hidden])`);
  const footer = await page.evaluate((s) => {
    const row = [...document.querySelectorAll(`${s} .mx-data-grid__group-footer:not([hidden])`)].sort((a, b) => a.getAttribute('aria-rowindex') - b.getAttribute('aria-rowindex'))[0];
    const shown = (f) => row.querySelector(`[data-field="${f}"] .mx-data-grid__summary-item`).firstChild.textContent;
    return { level: row.getAttribute('aria-level'), index: Number(row.getAttribute('aria-rowindex')), amount: shown('amount'), paid: shown('paid') };
  }, local);
  check('datagrid summaries: a footer row after the group’s rows holds its footer items', footer.level === '2' && footer.index === 3 + 43 + 1 && footer.amount.startsWith('Max: ') && /^\d+ paid$/.test(footer.paid), JSON.stringify(footer));
  await section.getByText('Group footers', { exact: true }).click();
  await page.waitForFunction((s) => !document.querySelector(`${s} .mx-data-grid__group-footer:not([hidden])`), local);
  check('datagrid summaries: the footers go with their items', true);
  await section.getByText('Group footers', { exact: true }).click();
  await section.getByText('Sum under its column in the group row', { exact: true }).click();
  await vp.evaluate((el) => (el.scrollTop = 0));

  // Editing: totals follow an unsaved edit only with recalculateWhileEditing; saved changes always.
  const total = async () => (await page.locator('.dg-summaries-total').textContent()).replace(/[^\d.]/g, '');
  const before = await total();
  const edit = async (text) => {
    const cell = page.locator(`${local} .mx-data-grid__body > .mx-data-grid__row[aria-rowindex="4"] [data-field="amount"]`);
    await cell.focus();
    await page.keyboard.type(text);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  };
  await edit('1000');
  const unsaved = await total();
  await section.getByText('Follow unsaved edits', { exact: true }).click();
  await page.waitForTimeout(150);
  const live = await total();
  await page.locator(`${local} .mx-data-grid__revert`).click();
  await page.waitForTimeout(150);
  const discarded = await total();
  check('datagrid summaries: totals follow an unsaved edit only while recalculateWhileEditing is on', unsaved === before && Number(live) === Number(before) + 1000 && discarded === before, `${before} → ${unsaved} → ${live} → ${discarded}`);
  await section.getByText('Follow unsaved edits', { exact: true }).click();

  // A server that computes the totals and the group summaries itself.
  const server = '.dg-summaries-server';
  await page.locator(server).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(`${s} .mx-data-grid__group-row:not([hidden])`).length === 5 && document.querySelector('.dg-summaries-server-state').textContent.endsWith('ready'), server);
  const state = await page.locator('.dg-summaries-server-state').textContent();
  const serverTotals = await totals(server, 'customer');
  const groupText = await page.locator(`${server} .mx-data-grid__group-row:not([hidden]) .mx-data-grid__group-text`).first().textContent();
  check('datagrid summaries: a server gives the totals and the group summaries, one request each', state === '2 summary requests · totals ready' && serverTotals[0] === 'Count: 100,000' && /· Sum of Amount: [\d,.]+$/.test(groupText), `${state} · ${serverTotals} · ${groupText}`);
  await page.locator(`${server} .mx-data-grid__filter-cell[data-field="amount"] input`).fill('999.99');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__total-row [data-field="customer"] .mx-data-grid__summary-item`)?.firstChild.textContent !== 'Count: 100,000' && document.querySelector('.dg-summaries-server-state').textContent.endsWith('ready'), server);
  const narrowed = await totals(server, 'customer');
  const asked = await page.locator('.dg-summaries-server-state').textContent();
  check('datagrid summaries: a new filter asks the server again', /^Count: \d+$/.test(narrowed[0]) && Number(narrowed[0].slice(7)) < 100 && asked.startsWith('4 summary requests'), `${narrowed} · ${asked}`);
  await page.locator(`${server} .mx-data-grid__filter-cell[data-field="amount"] input`).fill('');
  await page.waitForFunction((s) => document.querySelector(`${s} .mx-data-grid__total-row [data-field="customer"] .mx-data-grid__summary-item`)?.firstChild.textContent === 'Count: 100,000', server);

  // Axe with the row of totals, group footers and aligned items, light and dark.
  await section.getByRole('button', { name: 'Open all' }).click();
  await page.waitForFunction((s) => [...document.querySelectorAll(`${s} .mx-data-grid__group-row:not([hidden])`)].every((r) => r.getAttribute('aria-expanded') === 'true'), server);
  await page.addScriptTag({ content: axeSource });
  const found = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForTimeout(300);
    const v = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="summaries"]'))).violations.map((x) => `${x.id}: ${x.nodes.length}`));
    found.push(...v.map((x) => `${theme} ${x}`));
  }
  await page.evaluate(() => (document.documentElement.dataset.theme = 'light'));
  check('datagrid summaries: axe clean with totals, group footers and aligned items, light and dark', found.length === 0, found.join('; '));

  // Every group open, around the end of the first one: group rows, footers and rows scroll at frame rate.
  const svp = `${server} .mx-data-grid__viewport`;
  await page.locator(svp).evaluate((el) => (el.scrollTop = 36 * 19_990));
  await page.waitForTimeout(600);
  const stats = await page.evaluate(
    ([sel, grid]) =>
      new Promise((done) => {
        const el = document.querySelector(sel);
        const times = [];
        let footers = 0;
        let last = performance.now();
        const start = last;
        const step = () => {
          const now = performance.now();
          times.push(now - last);
          last = now;
          el.scrollTop += 120;
          footers = Math.max(footers, document.querySelectorAll(`${grid} .mx-data-grid__group-footer:not([hidden])`).length);
          if (now - start < 2000) requestAnimationFrame(step);
          else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length, rows: el.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden])').length, footers });
        };
        requestAnimationFrame(step);
      }),
    [svp, server],
  );
  check(
    'datagrid summaries: a grouped virtual list with group footers scrolls at frame rate, the DOM stays small',
    stats.long <= stats.frames * 0.1 && stats.rows < 40 && stats.footers > 0,
    `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms, ${stats.rows} rows, footers seen: ${stats.footers}`,
  );
}
