import { Component } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridOptionChangedEventArgs } from './grid-option-changed-event-args';

type Row = { id: number; name: string; city: string; amount: number; day: string };

const CITIES = ['Ankara', 'Bursa', 'İzmir'];
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, city: CITIES[i % 3], amount: (i + 1) * 10, day: `2026-0${(i % 3) + 1}-1${i % 10}` }));

const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
];

async function settle() {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 800) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns: columns(), rows: makeRows(9), ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

const headers = (grid: DataGrid<any>) =>
  [...grid.element.querySelectorAll<HTMLElement>('[role="columnheader"][aria-colindex]')].sort((a, b) => Number(a.getAttribute('aria-colindex')) - Number(b.getAttribute('aria-colindex'))).map((h) => h.dataset.field);
const cell = (grid: DataGrid<any>, row: number, field: string) => grid.getCellElement(row, field);
const shownIds = (grid: DataGrid<Row>) => grid.getVisibleRows().filter((r) => r.rowType === 'data').map((r) => r.row!.id);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DataGrid columns at run time', () => {
  it('adds a column with its header and cells, at a place among the columns, and tells it', async () => {
    const told: GridOptionChangedEventArgs[] = [];
    const grid = await make({ onOptionChanged: (e) => told.push(e) });
    expect([grid.columnCount(), headers(grid)]).toEqual([2, ['id', 'name']]);
    grid.addColumn({ field: 'amount', title: 'Amount', type: 'number', format: { minimumFractionDigits: 2 } });
    grid.addColumn({ field: 'city', title: 'City' }, 1);
    await settle();
    expect(headers(grid)).toEqual(['id', 'city', 'name', 'amount']);
    expect(grid.columnCount()).toBe(4);
    expect(grid.getVisibleColumns().map((c) => c.field)).toEqual(['id', 'city', 'name', 'amount']);
    expect(cell(grid, 0, 'amount')!.textContent).toBe('10.00');
    expect(cell(grid, 1, 'city')!.textContent).toBe('Bursa');
    expect(cell(grid, 1, 'city')!.getAttribute('aria-colindex')).toBe('2');
    expect(told.map((e) => [e.name, e.value])).toEqual([
      ['columns', ['id', 'name', 'amount']],
      ['columns', ['id', 'city', 'name', 'amount']],
    ]);
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['id', 'city', 'name', 'amount']);
    expect(() => grid.addColumn({ field: 'city', title: 'Again' })).toThrow(/duplicate/);
    // Sorting, filtering and the filter row work on it; a date column compares as dates.
    grid.addColumn({ field: 'day', title: 'Day', type: 'date' });
    grid.settings.filterRow = true;
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__filter-cell[data-field="day"]')).not.toBeNull();
    grid.filters = { day: { op: '>=', value: new Date(2026, 2, 1) } };
    await settle();
    expect(shownIds(grid)).toEqual([3, 6, 9]);
    grid.sort = [{ field: 'amount', dir: 'desc' }];
    await settle();
    expect(shownIds(grid)).toEqual([9, 6, 3]);
    await grid.dispose();
  });

  it('takes a column out with its filter, sort and grouping; the layout and the kept layout follow', async () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    const filterChanges: unknown[] = [];
    const grid = await make({
      columns: [...columns(), { field: 'city', title: 'City' }, { field: 'amount', title: 'Amount', type: 'number' }],
      layoutKey: 'cols',
      layoutStorage: storage,
      settings: { filterRow: true, headerFilter: true },
      onFilterChanged: (e) => filterChanges.push(e.filters),
    });
    grid.filters = { amount: { op: '>', value: 30 } };
    grid.sort = [{ field: 'amount', dir: 'desc' }];
    grid.group = [{ field: 'city', dir: 'asc' }];
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'asc' }]);
    grid.deleteColumn('amount');
    await settle();
    expect(headers(grid)).toEqual(['id', 'name']);
    expect([grid.filters, grid.sort, grid.filter]).toEqual([{}, [], null]);
    expect(filterChanges.at(-1)).toEqual({});
    expect(grid.columnCount()).toBe(3);
    expect(cell(grid, 1, 'amount')).toBeUndefined();
    grid.deleteColumn('city');
    await settle();
    expect(grid.group).toEqual([]);
    expect(shownIds(grid)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const kept = JSON.parse(store.get('motifx-ui:data-grid:cols')!);
    expect(kept.columns.map((c: { field: string }) => c.field)).toEqual(['id', 'name']);
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['id', 'name']);
    // Unknown and the grid's own columns are left alone.
    grid.deleteColumn('nope');
    grid.deleteColumn('mx:status');
    expect(grid.columnCount()).toBe(2);
    await grid.dispose();
  });

  it('gives a column added later what the layout said of it', async () => {
    const grid = await make({
      layout: { columns: [{ field: 'amount', width: 222, flex: 0, hidden: false, sticky: 'end' }, { field: 'id', width: 90, flex: 0, hidden: false, sticky: null }], sort: [] },
    });
    grid.addColumn({ field: 'amount', title: 'Amount', type: 'number' });
    await settle();
    expect([grid.columnOption('amount', 'width'), grid.columnOption('amount', 'sticky')]).toEqual([222, 'end']);
    await grid.dispose();
  });

  it('changes any field of a column live with columnOption, one or several at once', async () => {
    const told: GridOptionChangedEventArgs[] = [];
    const grid = await make({ columns: [...columns(), { field: 'amount', title: 'Amount', type: 'number' }], onOptionChanged: (e) => told.push(e) });
    const header = () => grid.element.querySelector<HTMLElement>('[role="columnheader"][data-field="amount"] .mx-data-grid__title')!;
    grid.columnOption('amount', 'title', 'Total');
    await settle();
    expect(header().textContent).toBe('Total');
    expect(told.at(-1)).toMatchObject({ name: 'title', field: 'amount', value: 'Total', previous: 'Amount' });
    grid.columnOption('amount', 'format', (v: unknown) => `${v} TL`);
    await settle();
    expect(cell(grid, 0, 'amount')!.textContent).toBe('10 TL');
    grid.columnOption('amount', { title: () => 'Sum', width: 180, sortOrder: 'desc', align: 'center' });
    await settle();
    expect([header().textContent, grid.columnOption('amount', 'width'), grid.sort]).toEqual(['Sum', 180, [{ field: 'amount', dir: 'desc' }]]);
    expect(shownIds(grid)[0]).toBe(9);
    // A column of its own content gets it at once.
    grid.columnOption('name', 'cell', (ctx: { row: Row | undefined }) => {
      const c = new Component<HTMLSpanElement>('span');
      c.element.className = 'own-cell';
      c.element.textContent = `<${ctx.row?.name}>`;
      return c;
    });
    await settle();
    expect(cell(grid, 0, 'name')!.querySelector('.own-cell')).not.toBeNull();
    grid.columnOption('name', { visible: false });
    await settle();
    expect(headers(grid)).toEqual(['id', 'amount']);
    const all = grid.columnOption('amount') as Record<string, unknown>;
    expect(all).toMatchObject({ field: 'amount', title: 'Sum', type: 'number', width: 180, visible: true, sortOrder: 'desc', sortIndex: 0, groupIndex: -1, filterType: 'include', sortable: true });
    expect(() => grid.columnOption('amount', 'field', 'other')).toThrow(/cannot change/);
    // A new type sorts and filters the rows the new way.
    grid.columnOption('amount', 'value', (row: Row) => -row.amount);
    await settle();
    expect(shownIds(grid)[0]).toBe(1);
    await grid.dispose();
  });

  it('follows a groupIndex function of a column added later, until the column goes', async () => {
    const at = { value: undefined as number | undefined };
    const state = (await import('@motifx/core')).reactive(at);
    const grid = await make();
    grid.addColumn({ field: 'city', title: 'City', groupIndex: () => state.value });
    await settle();
    expect(grid.group).toEqual([]);
    state.value = 0;
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'asc' }]);
    grid.deleteColumn('city');
    state.value = undefined;
    state.value = 0;
    await settle();
    expect(grid.group).toEqual([]);
    await grid.dispose();
  });

  it('works on a server source: the filter of a deleted column leaves the query', async () => {
    const adapter = new data.ArrayAdapter<Row, number>({ data: makeRows(30), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 10 });
    const grid = await make({ rows: undefined, dataSource: source, settings: { headerFilter: true } });
    grid.addColumn({ field: 'city', title: 'City' });
    grid.filters = { city: { values: ['Ankara'] } };
    await settle();
    expect(source.filter).toEqual(data.where('city', 'in', ['Ankara']));
    grid.deleteColumn('city');
    await settle();
    expect(source.filter).toBeNull();
    await grid.dispose();
    source.dispose();
  });
});
