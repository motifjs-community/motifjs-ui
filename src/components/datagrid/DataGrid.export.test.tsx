import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number; day: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
  { field: 'day', title: 'Day', type: 'date' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: (i + 1) * 1000.5, day: `2026-02-${String((i % 28) + 1).padStart(2, '0')}` }));

/** A server: answers from memory and counts the requests. */
class Server extends data.ArrayAdapter<Row, number> {
  readonly asked: data.LoadOptions[] = [];

  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.asked.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  await settled(4);
}

function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', label: 'Orders', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return grid;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('export', () => {
  it('gives the rows of the filter in the sort order, with the visible exportable columns in their order', async () => {
    const grid = make({ rows: makeRows(10), filters: { amount: { op: '>', value: 5000 } }, sort: [{ field: 'amount', dir: 'desc' }], settings: { filterRow: true } });
    await settle();
    grid.columnSettings('day').exportable = false;
    grid.layout = { ...grid.layout, columns: grid.layout.columns.map((c) => (c.field === 'name' ? { ...c, hidden: true } : c)).reverse() };
    await settle();
    expect(await grid.exportRows()).toEqual([
      { amount: '10,005', id: '10' },
      { amount: '9,004.5', id: '9' },
      { amount: '8,004', id: '8' },
      { amount: '7,003.5', id: '7' },
      { amount: '6,003', id: '6' },
      { amount: '5,002.5', id: '5' },
    ]);
    expect((await grid.exportRows({ values: 'raw' }))[1]).toEqual({ amount: 9004.5, id: 9 });
  });

  it('writes CSV a spreadsheet opens: byte order mark, the locale separator, quotes, no formulas', async () => {
    const rows = makeRows(3);
    rows[1].name = '=1+2';
    rows[2].name = 'a; "b"';
    const grid = make({ rows, locale: 'tr' });
    await settle();
    const csv = await grid.exportCsv({ download: false });
    expect(csv).toBe('﻿Id;Name;Amount;Day\r\n1;Name 1;1.000,5;1.02.2026\r\n2;\'=1+2;2.001;2.02.2026\r\n3;"a; ""b""";3.001,5;3.02.2026\r\n');
    const raw = await grid.exportCsv({ download: false, values: 'raw', bom: false, separator: ',', headers: false });
    expect(raw).toBe('1,Name 1,1000.5,2026-02-01\r\n2,\'=1+2,2001,2026-02-02\r\n3,"a; ""b""",3001.5,2026-02-03\r\n');
  });

  it('saves a file named after the grid', async () => {
    const grid = make({ rows: makeRows(2) });
    await settle();
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const clicked: string[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });
    await grid.exportCsv();
    expect(create).toHaveBeenCalledOnce();
    expect(clicked).toEqual(['Orders.csv']);
    click.mockRestore();
  });

  it('asks a server for every row in parts through the data source, with its filter and sort', async () => {
    const server = new Server({ data: makeRows(250), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50, filter: data.where('id', '>', 20), sort: [{ field: 'id', dir: 'desc' }] });
    const grid = make({ dataSource: source });
    await settle();
    const before = server.asked.length;
    const progress: number[] = [];
    const rows = await grid.exportRows({ pageSize: 100, values: 'raw', onProgress: (n) => progress.push(n) });
    expect(rows.length).toBe(230);
    expect([rows[0].id, rows[229].id]).toEqual([250, 21]);
    expect(server.asked.slice(before).map((o) => [o.skip, o.take])).toEqual([
      [0, 100],
      [100, 100],
      [200, 100],
    ]);
    expect(progress).toEqual([100, 200, 230]);
    expect(source.rows.length).toBe(0);
  });

  it('exports only the selected rows when asked, "all" over a server too', async () => {
    const server = new Server({ data: makeRows(120), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
    const grid = make({ dataSource: source, settings: { selection: 'multiple' } });
    await settle();
    grid.selectedKeys = [7, 3];
    expect((await grid.exportRows({ selected: true, values: 'raw' })).map((r) => r.id)).toEqual([3, 7]);
    grid.selectAll();
    grid.deselectRow(source.rowAt(0)!);
    expect((await grid.exportRows({ selected: true })).length).toBe(119);
    grid.clearSelection();
    expect(await grid.exportRows({ selected: true })).toEqual([]);
  });

  it('shows an "Export" button in the toolbar by a setting, and reads unsaved edits like the cells', async () => {
    const rows = makeRows(2);
    const grid = make({ rows, settings: { editable: true }, saveMode: 'batch' });
    await settle();
    const button = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__toolbar .mx-data-grid__export');
    expect(button()).toBeNull();
    grid.settings.exportButton = true;
    await settle();
    // An icon in the bar, named by its tooltip; its text shows in the "more" menu.
    expect(button()?.getAttribute('title')).toBe('Export');
    (grid.element.querySelector('.mx-data-grid__body [data-field="name"]') as HTMLElement).focus();
    grid.paste('Edited');
    expect((await grid.exportRows())[0].name).toBe('Edited');
    grid.settings.exportable = false;
    await settle();
    expect(button()).toBeNull();
  });
});
