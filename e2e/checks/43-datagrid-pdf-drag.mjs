/** Real-browser checks of the datagrid's PDF export and row drag and drop: the toolbar offers PDF and the download is a PDF; dragging a row by its icon reorders (push), the keys move a row, a row dropped on the other grid of its group moves there; axe on both. */
import { readFileSync } from 'node:fs';

export default async function ({ page, base, check, axeSource }) {
  // PDF: the export menu offers it, onExporting draws the grid with exportDataGrid and saves it.
  await page.goto(base + 'datagrid/selection', { waitUntil: 'load' });
  const pdf = '.dg-pdf';
  await page.locator(pdf).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${pdf} .mx-data-grid__group-row:not([hidden])`);
  const button = page.locator(`${pdf} .mx-data-grid__export .mx-button__face`);
  await button.click();
  await page.waitForSelector('[role="menu"] [role="menuitem"]');
  const items = (await page.locator('[role="menu"] [role="menuitem"]').allTextContents()).map((t) => t.trim());
  check('datagrid pdf: the export menu offers PDF, with the selected rows', JSON.stringify(items) === JSON.stringify(['Export all data to PDF', 'Export selected rows to PDF', 'Export all data to CSV', 'Export selected rows to CSV']), items.join(' | '));
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), page.getByRole('menuitem', { name: 'Export all data to PDF' }).click()]);
  const bytes = readFileSync(await download.path());
  const text = bytes.toString('latin1');
  const pages = (text.match(/\/Type\s*\/Page\b/g) ?? []).length;
  check('datagrid pdf: the download is a PDF of several pages', download.suggestedFilename() === 'Orders.pdf' && text.startsWith('%PDF') && pages > 1, `${download.suggestedFilename()} · ${text.slice(0, 8)} · ${pages} pages · ${bytes.length} bytes`);
  await page.waitForFunction(() => document.querySelector('.dg-pdf-saved')?.textContent.startsWith('Orders.pdf'));
  check('datagrid pdf: exportDataGrid resolves with where the table ends', /^Orders\.pdf: \d+ pages, the table ends on page \d+$/.test((await page.textContent('.dg-pdf-saved')) ?? ''), await page.textContent('.dg-pdf-saved'));
  await page.addScriptTag({ content: axeSource });
  const axePdf = await page.evaluate(async () => (await window.axe.run(document.querySelector('section[aria-labelledby="pdf"]'))).violations.map((v) => `${v.id}: ${v.nodes.length}`));
  check('datagrid pdf: axe clean', axePdf.length === 0, axePdf.join('; '));

  // Reorder: drag row 2 by its icon below row 4; the rows make room while it moves.
  await page.goto(base + 'datagrid/drag', { waitUntil: 'load' });
  const grid = '.dg-reorder';
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const rowAt = (g, i) => page.locator(`${g} .mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`);
  const ids = (g) =>
    page.evaluate(
      (sel) =>
        [...document.querySelectorAll(`${sel} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`)]
          .sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')))
          .slice(0, 6)
          .map((r) => r.querySelector('[data-field="id"]')?.textContent),
      g,
    );
  const box = (loc) => loc.evaluate((el) => el.getBoundingClientRect().toJSON());
  const before = await ids(grid);
  const handle = await box(rowAt(grid, 1).locator('[data-field="mx:drag"]'));
  const target = await box(rowAt(grid, 4));
  await page.mouse.move(handle.left + handle.width / 2, handle.top + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.left + handle.width / 2, handle.top + handle.height / 2 + 12, { steps: 3 });
  await page.mouse.move(handle.left + handle.width / 2, target.top + target.height * 0.75, { steps: 10 });
  await page.waitForTimeout(200);
  const during = await page.evaluate((g) => {
    const rows = [...document.querySelectorAll(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`)];
    return { ghost: !!document.querySelector(`${g} .mx-data-grid__ghost[data-kind="row"]`), source: rows.filter((r) => r.dataset.dragSource === 'push').length, shifted: rows.filter((r) => r.style.translate).length };
  }, grid);
  await page.mouse.up();
  await page.waitForTimeout(300);
  const after = await ids(grid);
  check('datagrid drag: while dragging, a copy follows and the rows make room (push)', during.ghost && during.source === 1 && during.shifted === 4, JSON.stringify(during));
  check('datagrid drag: dropping the row reorders it', after.join() === [before[0], before[2], before[3], before[4], before[1], before[5]].join(), `${before.join()} → ${after.join()}`);

  // The keys: Ctrl+Shift+Up moves the active row up a place, announced.
  await rowAt(grid, 3).locator('[data-field="title"]').click();
  const beforeKeys = await ids(grid);
  await page.keyboard.press('Control+Shift+ArrowUp');
  await page.waitForTimeout(300);
  const afterKeys = await ids(grid);
  const live = await page.evaluate((g) => document.querySelector(`${g} .mx-data-grid__live[aria-live]`)?.textContent, grid);
  const active = await page.evaluate((g) => document.activeElement?.closest(`${g} .mx-data-grid__row`)?.getAttribute('aria-rowindex'), grid);
  check(
    'datagrid drag: Ctrl+Shift+Up moves the active row up, keeps it active, announces it',
    afterKeys[2] === beforeKeys[3] && afterKeys[3] === beforeKeys[2] && active === '4' && live === 'Row moved to position 3 of 500',
    `${beforeKeys.join()} → ${afterKeys.join()} · active ${active} · ${live}`,
  );

  // Between grids: a row of "To do" dropped on "Done" moves there.
  const todo = '.dg-board-todo';
  const done = '.dg-board-done';
  await page.locator(todo).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${done} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`);
  const todoBefore = await ids(todo);
  const doneBefore = await ids(done);
  const from = await box(rowAt(todo, 0).locator('[data-field="mx:drag"]'));
  const onto = await box(rowAt(done, 1));
  await page.mouse.move(from.left + from.width / 2, from.top + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.left + from.width / 2 + 12, from.top + from.height / 2 + 12, { steps: 3 });
  await page.mouse.move(onto.left + 60, onto.top + onto.height * 0.25, { steps: 12 });
  await page.waitForTimeout(200);
  const room = await page.evaluate((g) => [...document.querySelectorAll(`${g} .mx-data-grid__body > .mx-data-grid__row:not([hidden])`)].filter((r) => r.style.translate).length, done);
  await page.mouse.up();
  await page.waitForTimeout(300);
  const todoAfter = await ids(todo);
  const doneAfter = await ids(done);
  check(
    'datagrid drag: a row dropped on the other grid of its group leaves one and lands in the other',
    room === doneBefore.length - 1 && todoAfter[0] === todoBefore[1] && doneAfter[1] === todoBefore[0] && doneAfter[0] === doneBefore[0],
    `room ${room} · to do ${todoBefore.join()} → ${todoAfter.join()} · done ${doneBefore.join()} → ${doneAfter.join()}`,
  );

  await page.addScriptTag({ content: axeSource });
  const axeDrag = await page.evaluate(async () => {
    const out = [];
    for (const id of ['reorder', 'between']) out.push(...(await window.axe.run(document.querySelector(`section[aria-labelledby="${id}"]`))).violations.map((v) => `${id} ${v.id}: ${v.nodes.length}`));
    return out;
  });
  check('datagrid drag: axe clean with the drag icon column', axeDrag.length === 0, axeDrag.join('; '));
}
