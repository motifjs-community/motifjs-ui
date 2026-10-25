import { data } from '@motifx-community/data';
import ExcelJS from 'exceljs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../tests/helpers';
import { DataGrid } from '../components/datagrid/DataGrid';
import type { DataGridProps } from '../components/datagrid/data-grid-props';
import type { GridColumn } from '../components/datagrid/grid-column';
import type { GridExportCell } from '../components/datagrid/grid-export-cell';
import type { GridExportingEventArgs } from '../components/datagrid/grid-exporting-event-args';
import { exportDataGrid } from './export-data-grid';

type Row = { id: number; city: string; amount: number; day: string; paid: boolean; size: string; customerId: number };

const CITIES = ['Ankara', 'Bursa', 'İzmir'];
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    city: CITIES[i % 3],
    amount: (i + 1) * 1000.5,
    day: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
    paid: i % 2 === 0,
    size: i % 2 ? 's' : 'l',
    customerId: (i % 2) + 1,
  }));

const customers = [
  { id: 1, name: 'Zeynep' },
  { id: 2, name: 'Ali' },
];

const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'city', title: 'City' },
  { field: 'amount', title: 'Amount', type: 'number', width: 154 },
  { field: 'day', title: 'Day', type: 'date' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'size', title: 'Size', type: 'list', options: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large' }] },
  { field: 'customerId', title: 'Customer', lookup: { dataSource: customers, valueField: 'id', textField: 'name' } },
];

/** A server: answers from memory and counts the requests. */
class Server extends data.ArrayAdapter<Row, number> {
  readonly asked: data.LoadOptions[] = [];
  hold: Promise<void> | null = null;

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.asked.push(options);
    if (this.hold) await this.hold;
    return super.loadRows(options);
  }
}

async function settle() {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
}

async function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns: columns(), rows: makeRows(4), rowHeight: 36, locale: 'en-US', label: 'Orders', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settle();
  return grid;
}

const sheet = () => new ExcelJS.Workbook().addWorksheet('Orders');
/** The values of a row of the worksheet, from its first column. */
const values = (ws: ExcelJS.Worksheet, row: number) => (ws.getRow(row).values as unknown[]).slice(1);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('exportDataGrid', () => {
  it('writes the header and typed data cells: numbers, dates, yes/no, list and lookup texts', async () => {
    const grid = await make();
    const ws = sheet();
    const range = await exportDataGrid({ component: grid, worksheet: ws });
    expect(range).toEqual({ from: { row: 1, column: 1 }, to: { row: 5, column: 7 } });
    expect(values(ws, 1)).toEqual(['Id', 'City', 'Amount', 'Day', 'Paid', 'Size', 'Customer']);
    expect(ws.getCell('A1').font.bold).toBe(true);
    expect(ws.getCell('A1').alignment.horizontal).toBe('center');
    expect(values(ws, 2)).toEqual([1, 'Ankara', 1000.5, new Date(Date.UTC(2026, 1, 1)), true, 'Large', 'Zeynep']);
    expect(values(ws, 3)[6]).toBe('Ali');
    expect([ws.getCell('C2').numFmt, ws.getCell('C3').numFmt, ws.getCell('D2').numFmt]).toEqual(['#,##0.0', '#,##0', 'm\\/d\\/yy']);
    expect([ws.getCell('C2').alignment.horizontal, ws.getCell('B2').alignment.horizontal, ws.getCell('E2').alignment.horizontal]).toEqual(['right', 'left', 'center']);
    // Widths from the grid, in Excel's characters (7 px each).
    expect([ws.getColumn(1).width, ws.getColumn(3).width]).toEqual([20, 22]);
    // The header stays in view.
    expect(ws.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 });
    await grid.dispose();
  });

  it('turns a column’s Intl format into the number format, and writes a format function’s text', async () => {
    const cols = columns().map((c) =>
      c.field === 'amount' ? { ...c, format: { style: 'currency', currency: 'EUR' } as Intl.NumberFormatOptions } : c.field === 'id' ? { ...c, format: (v: unknown) => `#${v}` } : c,
    );
    const grid = await make({ columns: cols, locale: 'de-DE' });
    const ws = sheet();
    await exportDataGrid({ component: grid, worksheet: ws, booleanText: true });
    expect([ws.getCell('A2').value, ws.getCell('C2').value, ws.getCell('C2').numFmt, ws.getCell('D2').numFmt]).toEqual(['#1', 1000.5, '#,##0.00" €"', 'dd\\.mm\\.yy']);
    expect(ws.getCell('E2').value).toBe('Yes');
    const plain = sheet();
    await exportDataGrid({ component: grid, worksheet: plain, numberFormats: false, keepColumnWidths: false, frozenHeader: false });
    expect([plain.getCell('C2').numFmt, plain.getColumn(3).width, plain.views]).toEqual([undefined, undefined, []]);
    await grid.dispose();
  });

  it('writes group rows with their summaries, outline levels, group footers and the totals', async () => {
    const grid = await make({
      rows: makeRows(6),
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
      summary: {
        groupItems: [
          { column: 'amount', summaryType: 'sum' },
          { column: 'amount', summaryType: 'max', alignByColumn: true },
          { column: 'id', summaryType: 'count', showInGroupFooter: true },
        ],
        totalItems: [
          { column: 'amount', summaryType: 'sum', name: 'total' },
          { column: 'amount', summaryType: 'avg' },
        ],
      },
    });
    const ws = sheet();
    const range = await exportDataGrid({ component: grid, worksheet: ws, topLeftCell: 'B3' });
    const at = (r: number) => values(ws, r).slice(1);
    // The grouped column leaves the columns; the first one holds the group's text.
    expect(at(3)).toEqual(['Id', 'Amount', 'Day', 'Paid', 'Size', 'Customer']);
    expect(at(4)).toEqual(['City: Ankara · Sum of Amount: 5,002.5', 'Max: 4,002']);
    expect(ws.getCell('B4').font.bold).toBe(true);
    expect(at(5)[0]).toBe(1);
    expect(at(7)).toEqual(['Count: 2']);
    expect(ws.getRow(4).outlineLevel).toBe(0);
    expect(ws.getRow(5).outlineLevel).toBe(1);
    expect(ws.getRow(7).outlineLevel).toBe(1);
    expect(ws.properties.outlineProperties).toEqual({ summaryBelow: false, summaryRight: false });
    // Two items under one column: a row each.
    const last = range.to.row;
    expect([at(last - 1)[1], at(last)[1]]).toEqual(['Sum: 21,010.5', 'Avg: 3,501.75']);
    expect(ws.getRow(last).outlineLevel).toBe(0);
    expect(range).toEqual({ from: { row: 3, column: 2 }, to: { row: 3 + 1 + 3 * 4 + 1, column: 7 } });
    expect(ws.views[0]).toMatchObject({ state: 'frozen', ySplit: 3 });
    await grid.dispose();
  });

  it('hands every cell to customizeCell with the grid’s cell', async () => {
    const grid = await make({
      rows: makeRows(3),
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
      summary: { groupItems: [{ column: 'id', summaryType: 'count' }], totalItems: [{ column: 'amount', summaryType: 'sum' }] },
    });
    const seen: GridExportCell<Row>[] = [];
    await exportDataGrid({
      component: grid,
      worksheet: sheet(),
      customizeCell: ({ gridCell, excelCell }) => {
        seen.push(gridCell);
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'amount') excelCell.font = { color: { argb: 'FF0000FF' } };
      },
    });
    const kinds = seen.map((c) => c.rowType);
    expect(kinds.filter((k) => k === 'header')).toHaveLength(6);
    const group = seen.find((c) => c.rowType === 'group')!;
    expect([group.column?.field, group.value, group.groupIndex, group.groupSummaryItems]).toEqual(['city', 'Ankara', 0, [{ name: undefined, value: 1 }]]);
    const cell = seen.find((c) => c.rowType === 'data' && c.column?.field === 'amount')!;
    expect([cell.value, (cell.data as Row).id]).toEqual([1000.5, 1]);
    const total = seen.find((c) => c.rowType === 'totalFooter' && c.value !== undefined)!;
    expect([total.column?.field, total.value, total.totalSummaryItemName]).toEqual(['amount', 6003, 'sum_amount']);
    await grid.dispose();
  });

  it('sets the auto filter on the header row, and guards text a spreadsheet would run', async () => {
    const rows = makeRows(3);
    rows[1].city = '=HYPERLINK("x")';
    const grid = await make({ rows });
    const ws = sheet();
    await exportDataGrid({ component: grid, worksheet: ws, autoFilterEnabled: true, encodeExecutableContent: true });
    expect(ws.autoFilter).toEqual({ from: { row: 1, column: 1 }, to: { row: 4, column: 7 } });
    expect([ws.getCell('B3').value, ws.getCell('B3').numFmt]).toEqual(['\'=HYPERLINK("x")', '@']);
    const open = sheet();
    await exportDataGrid({ component: grid, worksheet: open });
    expect([open.getCell('B3').value, open.autoFilter ?? null]).toEqual(['=HYPERLINK("x")', null]);
    await grid.dispose();
  });

  it('exports only the selected rows, also when the toolbar’s command asked for them', async () => {
    const grid = await make({ rows: makeRows(5), settings: { selection: 'multiple' }, summary: { totalItems: [{ column: 'amount', summaryType: 'sum' }] } });
    grid.selectedKeys = [4, 2];
    const ws = sheet();
    await exportDataGrid({ component: grid, worksheet: ws, selectedRowsOnly: true });
    expect([ws.getCell('A2').value, ws.getCell('A3').value, ws.getCell('A4').value]).toEqual([2, 4, null]);
    let format = '';
    const done: string[] = [];
    grid.onExporting((e: GridExportingEventArgs) => {
      format = e.format;
      if (e.format === 'xlsx') void exportDataGrid({ component: e.component, worksheet: sheet() }).then((r) => done.push(`${r.to.row}`));
    });
    await grid.exportTo('xlsx', { selected: true });
    await settle();
    expect([format, done]).toEqual(['xlsx', ['3']]);
    await grid.dispose();
  });

  it('loads every row of a server in parts, with the load panel and its progress', async () => {
    const server = new Server({ data: makeRows(250), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ dataSource: source, rows: undefined });
    const before = server.asked.length;
    const panel = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__export-panel');
    const shown = () => !!panel() && panel()!.style.display !== 'none';
    const progress: number[] = [];
    const seen: boolean[] = [];
    const ws = sheet();
    const exported = vi.fn();
    grid.onExported(exported);
    const range = await exportDataGrid({
      component: grid,
      worksheet: ws,
      pageSize: 100,
      onProgress: (n) => {
        progress.push(n);
        seen.push(shown());
      },
    });
    expect(range.to.row).toBe(251);
    expect(server.asked.slice(before).map((o) => [o.skip, o.take])).toEqual([
      [0, 100],
      [100, 100],
      [200, 100],
    ]);
    expect(progress).toEqual([100, 200, 250]);
    expect(seen).toEqual([true, true, true]);
    expect(shown()).toBe(false);
    expect(exported).toHaveBeenCalledWith({ format: 'xlsx', rows: 250 });
    await grid.dispose();
  });

  it('stops when its signal aborts or the load panel’s button is pressed', async () => {
    const server = new Server({ data: makeRows(300), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ dataSource: source, rows: undefined });
    let release!: () => void;
    server.hold = new Promise<void>((r) => (release = r));
    const controller = new AbortController();
    const first = exportDataGrid({ component: grid, worksheet: sheet(), signal: controller.signal });
    await settle();
    expect(grid.exporting).toBe(true);
    controller.abort();
    release();
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(grid.exporting).toBe(false);
    server.hold = new Promise<void>((r) => (release = r));
    const second = exportDataGrid({ component: grid, worksheet: sheet() });
    await settle();
    const stop = grid.element.querySelector<HTMLElement>('.mx-data-grid__export-cancel')!;
    expect(stop.textContent).toBe('Stop');
    stop.click();
    release();
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    const panel = grid.element.querySelector<HTMLElement>('.mx-data-grid__export-panel');
    expect(!panel || panel.style.display === 'none').toBe(true);
    await grid.dispose();
  });

  it('writes a file Excel opens', async () => {
    const grid = await make({ columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)), summary: { totalItems: [{ column: 'amount', summaryType: 'sum' }] } });
    const workbook = new ExcelJS.Workbook();
    await exportDataGrid({ component: grid, worksheet: workbook.addWorksheet('Orders') });
    const buffer = await workbook.xlsx.writeBuffer();
    const back = new ExcelJS.Workbook();
    await back.xlsx.load(buffer);
    const ws = back.getWorksheet('Orders')!;
    expect(ws.getCell('A1').value).toBe('Id');
    expect(ws.getCell('A2').value).toBe('City: Ankara');
    expect([ws.getCell('B3').value, ws.getCell('B3').type]).toEqual([1000.5, ExcelJS.ValueType.Number]);
    expect(ws.getCell('D3').type).toBe(ExcelJS.ValueType.Boolean);
    expect(ws.getCell(`B${ws.rowCount}`).value).toBe('Sum: 10,005');
    await grid.dispose();
  });

  it('rejects without a grid or a worksheet', async () => {
    await expect(exportDataGrid({ component: null as never, worksheet: sheet() })).rejects.toThrow(/component/);
    const grid = await make();
    await expect(exportDataGrid({ component: grid, worksheet: null as never })).rejects.toThrow(/worksheet/);
    await grid.dispose();
  });
});

describe('the toolbar’s export menu', () => {
  it('offers the formats of `export` as a menu, and raises onExporting for xlsx', async () => {
    const asked: [string, boolean][] = [];
    const grid = await make({
      settings: { exportButton: true, selection: 'multiple' },
      export: { formats: ['xlsx', 'csv'], allowExportSelectedData: true },
      onExporting: (e) => {
        asked.push([e.format, e.selectedRowsOnly]);
        if (e.format === 'csv') e.cancel = true;
      },
    });
    const button = grid.element.querySelector<HTMLElement>('.mx-data-grid__toolbar .mx-data-grid__export .mx-button__face')!;
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    button.click();
    await settle();
    const items = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    expect(items.map((i) => i.textContent?.trim())).toEqual(['Export all data to Excel', 'Export selected rows to Excel', 'Export all data to CSV', 'Export selected rows to CSV']);
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
    items[0].click();
    await settle();
    expect(asked).toEqual([['xlsx', false]]);
    grid.selectedKeys = [1];
    await grid.exportTo('csv', { selected: true });
    expect(asked[1]).toEqual(['csv', true]);
    // One format, no selected rows: a plain button that runs it.
    grid.export.formats = ['xlsx'];
    grid.export.allowExportSelectedData = false;
    await settle();
    const plain = grid.element.querySelector<HTMLElement>('.mx-data-grid__toolbar .mx-data-grid__export')!;
    expect([plain.getAttribute('aria-haspopup'), plain.getAttribute('title')]).toEqual([null, 'Export']);
    plain.click();
    await settle();
    expect(asked[2]).toEqual(['xlsx', false]);
    await grid.dispose();
  });

  it('takes its texts from `export.texts` and uiLocale', async () => {
    const grid = await make({
      settings: { exportButton: true },
      locale: 'tr',
      texts: { gridExportAll: 'Hepsi ({format})' },
      export: { formats: ['csv', 'pdf'], texts: { exportTo: 'Kaydet', formats: { pdf: 'Belge' } } },
    });
    const button = grid.element.querySelector<HTMLElement>('.mx-data-grid__toolbar .mx-data-grid__export .mx-button__face')!;
    expect(button.getAttribute('title')).toBe('Kaydet');
    button.click();
    await settle();
    expect([...document.querySelectorAll('[role="menuitem"]')].map((i) => i.textContent?.trim())).toEqual(['Hepsi (CSV)', 'Hepsi (Belge)']);
    await grid.dispose();
  });
});
