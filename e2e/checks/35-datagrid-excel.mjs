/** Real-browser checks of the datagrid's Excel export: the toolbar's export menu offers the formats, and the downloaded file is an xlsx ExcelJS reads back with its header, typed numbers, group rows and totals. */
import { readFileSync } from 'node:fs';
import ExcelJS from 'exceljs';

export default async function ({ page, base, check }) {
  await page.goto(base + 'datagrid/selection', { waitUntil: 'load' });
  const grid = '.dg-excel';
  await page.locator(grid).scrollIntoViewIfNeeded();
  await page.waitForSelector(`${grid} .mx-data-grid__group-row:not([hidden])`);

  // The export button opens a menu of the formats.
  const button = page.locator(`${grid} .mx-data-grid__export .mx-button__face`);
  await button.click();
  await page.waitForSelector('[role="menu"] [role="menuitem"]');
  const items = await page.locator('[role="menu"] [role="menuitem"]').allTextContents();
  check(
    'datagrid excel: the export button is a menu of the formats, with the selected rows',
    (await button.getAttribute('aria-haspopup')) === 'menu' && JSON.stringify(items.map((t) => t.trim())) === JSON.stringify(['Export all data to Excel', 'Export selected rows to Excel', 'Export all data to CSV', 'Export selected rows to CSV']),
    items.join(' | '),
  );

  // "Export all data to Excel": onExporting writes the workbook with exportDataGrid and saves it.
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 30_000 }), page.getByRole('menuitem', { name: 'Export all data to Excel' }).click()]);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(readFileSync(await download.path()));
  const ws = workbook.getWorksheet('Orders');
  const header = ws ? ws.getRow(1).values.slice(1) : [];
  check('datagrid excel: the download is an xlsx with the header row', download.suggestedFilename() === 'Orders.xlsx' && JSON.stringify(header) === JSON.stringify(['No', 'Customer', 'Date', 'Status', 'Paid', 'Note', 'Amount']), `${download.suggestedFilename()} · ${JSON.stringify(header)}`);
  const group = ws?.getCell('A2').value;
  const id = ws?.getCell('A3');
  const amount = ws?.getCell('G3');
  check(
    'datagrid excel: a group row holds its text, data cells keep their numbers with the column’s format',
    typeof group === 'string' && group.startsWith('City: Ankara') && id?.type === ExcelJS.ValueType.Number && amount?.type === ExcelJS.ValueType.Number && amount.numFmt === '#,##0.00' && ws.getRow(3).outlineLevel === 1,
    `${group} · ${id?.value} (${id?.type}) · ${amount?.value} ${amount?.numFmt} · level ${ws?.getRow(3).outlineLevel}`,
  );
  const last = ws?.getRow(ws.rowCount);
  const total = [last?.getCell(2).value, last?.getCell(7).value];
  check('datagrid excel: the row of totals comes last', total[0] === 'Count: 200' && typeof total[1] === 'string' && total[1].startsWith('Sum: '), JSON.stringify(total));
  await page.waitForFunction(() => document.querySelector('.dg-excel-saved')?.textContent.startsWith('Orders.xlsx'));
  check('datagrid excel: exportDataGrid resolves with the cells written', (await page.textContent('.dg-excel-saved')) === `Orders.xlsx: rows 1–${ws?.rowCount}, columns 1–7`, await page.textContent('.dg-excel-saved'));
}
