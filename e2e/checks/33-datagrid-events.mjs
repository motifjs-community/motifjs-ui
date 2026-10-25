/** Real-browser checks of the datagrid's events: cells styled by onCellPrepared while scrolling, a row menu from onContextMenuPreparing, a save stopped by onRowUpdating, the log, and the frame rate with a listener. */

export default async function ({ page, base, check }) {
  await page.goto(base + 'datagrid', { waitUntil: 'load' });
  const grid = '.dg-events';
  const rows = `${grid} .mx-data-grid__body > .mx-data-grid__row:not([hidden]):not([data-loading])`;
  const log = () => page.evaluate(() => [...document.querySelectorAll('.dg-events-log li')].map((li) => li.textContent));
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForFunction((s) => document.querySelectorAll(s).length > 3, rows);

  // Bold amounts follow the rows while they are reused.
  const boldRight = () =>
    page.evaluate((s) => {
      const cells = [...document.querySelectorAll(`${s} [data-field="amount"]`)];
      const read = (c) => Number(c.textContent.replace(/,/g, ''));
      return cells.length > 0 && cells.every((c) => (c.style.fontWeight === 'bold') === read(c) > 900);
    }, rows);
  check('datagrid events: onCellPrepared styles the cells it is told about', await boldRight());
  await page.locator(`${grid} .mx-data-grid__viewport`).evaluate((vp) => (vp.scrollTop = 600));
  await page.waitForTimeout(200);
  check('datagrid events: reused cells are styled for their new rows', await boldRight());

  // The row menu: a right click opens the items the page adds.
  const cell = page.locator(`${rows} [data-field="customer"]`).first();
  const id = await page.locator(`${rows} [data-field="id"]`).first().textContent();
  await cell.click({ button: 'right' });
  const item = page.getByRole('menuitem', { name: `Log order ${id}` });
  await item.waitFor({ timeout: 5000 });
  await item.click();
  await page.waitForFunction(() => document.querySelector('.dg-events-log li')?.textContent?.includes('row menu'));
  check('datagrid events: the row menu runs the page’s item', (await log())[0] === `Order ${id} from the row menu`, (await log())[0]);

  // A change to "Cancelled" is not saved; another value is.
  const status = page.locator(`${rows} [data-field="status"]`).first();
  await status.click();
  await page.keyboard.press('F2');
  await page.keyboard.press('Alt+ArrowDown');
  const option = page.getByRole('option', { name: 'Cancelled', exact: true });
  await option.waitFor({ timeout: 5000 });
  await option.click();
  // Leaving the row sends it.
  await page.locator(`${rows} [data-field="customer"]`).nth(3).click();
  await page.waitForTimeout(200);
  check('datagrid events: onRowUpdating stops the save it cancels', (await log()).some((t) => t.includes('cancelling is not saved')), (await log()).join(' | '));
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  // Scrolling with a listener on every drawn cell keeps the frame rate.
  const stats = await page.locator(`${grid} .mx-data-grid__viewport`).evaluate(
    (vp) =>
      new Promise((done) => {
        const times = [];
        let last = performance.now();
        const start = last;
        const step = (now) => {
          times.push(now - last);
          last = now;
          vp.scrollTop += 24;
          if (now - start < 1500 && vp.scrollTop + vp.clientHeight < vp.scrollHeight) requestAnimationFrame(step);
          else done({ frames: times.length, long: times.filter((t) => t > 34).length, avg: times.reduce((a, b) => a + b, 0) / times.length });
        };
        requestAnimationFrame(step);
      }),
  );
  check('datagrid events: scrolling with onCellPrepared keeps the frame rate', stats.long <= stats.frames * 0.1, `${Math.round(1000 / stats.avg)} fps, ${stats.long}/${stats.frames} frames over 34 ms`);
}
