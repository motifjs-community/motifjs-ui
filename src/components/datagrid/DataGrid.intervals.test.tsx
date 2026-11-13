import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { ListBox } from '../listbox/ListBox';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridHeaderFilterItemsRequest } from './grid-header-filter-items-request';

type Row = { id: number; city: string | null; amount: number | null; day: string | null };

const DAYS = ['2025-11-03', '2025-12-24', '2026-01-05', '2026-01-20', '2026-02-14', '2026-03-01', '2026-03-15', '2026-03-31'];
const makeRows = (): Row[] =>
  [...DAYS.map((day, i): Row => ({ id: i + 1, city: ['Ankara', 'Bursa', 'İzmir'][i % 3], amount: [5, 40, 120, 180, 250, 260, 310, 999][i], day })), { id: 9, city: null, amount: null, day: null }];

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'city', title: 'City' },
  { field: 'amount', title: 'Amount', type: 'number', headerFilterInterval: 100 },
  { field: 'day', title: 'Day', type: 'date' },
];

/** A pretend server that groups; every load is recorded. */
class ServerAdapter extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];

  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0));
}

async function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(), locale: 'en', settings: { headerFilter: true }, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 600 });
  (grid as any).measure();
  await settle();
  return grid;
}

const shownIds = (grid: DataGrid<Row>) => grid.getVisibleRows().filter((r) => r.rowType === 'data').map((r) => r.row!.id);
const header = (grid: DataGrid<any>, field: string) => grid.element.querySelector(`[role="columnheader"][data-field="${field}"]`) as HTMLElement;
const hf = (grid: DataGrid<any>) => (grid as any).headerFilter;

async function open(grid: DataGrid<any>, field: string) {
  (grid as any).openHeaderFilter(field, (grid as any).headerAnchor(field));
  await settle();
  return hf(grid);
}
const listed = (grid: DataGrid<any>) => hf(grid).listBox.listItems.loaded.map((v: { text: string; count?: number }) => `${v.text}:${v.count ?? ''}`);
type Node = { id: string; text: string; count?: number; children?: Node[] };
const nodes = (list: readonly Node[], depth = 1): string[] => list.flatMap((n) => [`${n.text}:${n.count ?? ''}`, ...(depth > 1 && n.children ? nodes(n.children, depth - 1).map((t) => `  ${t}`) : [])]);

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid header filter intervals and sources', () => {
  it('groups a number column into ranges of its interval and filters by a range', async () => {
    const grid = await make();
    await open(grid, 'amount');
    expect(listed(grid)).toEqual(['(empty):1', '0 – 100:2', '100 – 200:2', '200 – 300:2', '300 – 400:1', '900 – 1,000:1']);
    hf(grid).listBox.value = [100, 900];
    await hf(grid).apply();
    await settle();
    expect(shownIds(grid)).toEqual([3, 4, 8]);
    expect(grid.filters.amount).toEqual({ values: [100, 900] });
    expect(grid.filter).toEqual(
      data.or(data.and(data.where('amount', '>=', 100), data.where('amount', '<', 200)), data.and(data.where('amount', '>=', 900), data.where('amount', '<', 1000))),
    );
    // Opened again, the ranges chosen are chosen; another size takes the same values as other ranges.
    await open(grid, 'amount');
    expect(hf(grid).listBox.value).toEqual([100, 900]);
    hf(grid).close();
    grid.columnOption('amount', 'headerFilterInterval', 1000);
    await settle();
    expect(shownIds(grid)).toEqual([3, 4, 5, 6, 7, 8]);
    await grid.dispose();
  });

  it('lists a date column as a tree of years, months and days and filters by the month picked', async () => {
    const grid = await make();
    const filter = await open(grid, 'day');
    expect(filter.listBox).toBeNull();
    const tree = filter.tree;
    expect(nodes(tree.items, 3)).toEqual([
      '(empty):1',
      '2025:2',
      '  November:1',
      '    3:1',
      '  December:1',
      '    24:1',
      '2026:6',
      '  January:2',
      '    5:1',
      '    20:1',
      '  February:1',
      '    14:1',
      '  March:3',
      '    1:1',
      '    15:1',
      '    31:1',
    ]);
    expect(grid.element.querySelector('.mx-data-grid__values-all')).not.toBeNull();
    tree.check('2026/3');
    tree.check('2026/1/20');
    // The only day of its month checks the month too: the highest node is kept.
    tree.check('2025/12/24');
    await settle();
    await filter.apply();
    await settle();
    expect(grid.filters.day).toEqual({ values: ['2025/12', '2026/1/20', '2026/3'] });
    expect(shownIds(grid)).toEqual([2, 4, 6, 7, 8]);
    expect(grid.filter).toEqual(
      data.or(
        data.and(data.where('day', '>=', new Date(2025, 11, 1)), data.where('day', '<', new Date(2026, 0, 1))),
        data.and(data.where('day', '>=', new Date(2026, 0, 20)), data.where('day', '<', new Date(2026, 0, 21))),
        data.and(data.where('day', '>=', new Date(2026, 2, 1)), data.where('day', '<', new Date(2026, 3, 1))),
      ),
    );
    // Opened again, the month and its days are checked; checking the whole year keeps the year only.
    const again = await open(grid, 'day');
    expect(again.tree.checkedKeys).toEqual(expect.arrayContaining(['2026/3', '2026/3/1', '2026/3/15', '2026/3/31', '2025/12', '2025/12/24', '2026/1/20']));
    expect(again.tree.checkedKeys).not.toContain('2026/1/5');
    again.tree.check('2026');
    await again.apply();
    await settle();
    expect(grid.filters.day).toEqual({ values: ['2025/12', 2026] });
    expect(shownIds(grid)).toEqual([2, 3, 4, 5, 6, 7, 8]);
    // Every node, or none: no filter.
    const third = await open(grid, 'day');
    third.tree.checkAll();
    await third.apply();
    await settle();
    expect(grid.filters.day).toBeUndefined();
    await grid.dispose();
  });

  it('goes down to the interval of the column or of the grid; a year alone is a list, null lists the dates', async () => {
    const grid = await make({ columns: columns.map((c) => (c.field === 'day' ? { ...c, headerFilterInterval: 'quarter' } : c)) });
    const quarter = await open(grid, 'day');
    expect(nodes(quarter.tree.items, 2)).toEqual(['(empty):1', '2025:2', '  Q4:2', '2026:6', '  Q1:6']);
    quarter.close();
    grid.columnOption('day', 'headerFilterInterval', undefined);
    grid.settings.headerFilterDateInterval = 'year';
    await open(grid, 'day');
    expect(listed(grid)).toEqual(['(empty):1', '2025:2', '2026:6']);
    hf(grid).listBox.value = [2025];
    await hf(grid).apply();
    await settle();
    expect(shownIds(grid)).toEqual([1, 2]);
    grid.settings.headerFilterDateInterval = null;
    grid.filters = {};
    await open(grid, 'day');
    expect(listed(grid)).toHaveLength(9);
    hf(grid).close();
    await uiLocale.use('tr');
    grid.settings.headerFilterDateInterval = 'quarter';
    const tr = await open(grid, 'day');
    expect(nodes(tr.tree.items, 2)[2]).toBe('  4. çeyrek:2');
    await grid.dispose();
  });

  it('lists entries of its own, whose values may be filter expressions', async () => {
    const grid = await make({
      columns: columns.map((c) =>
        c.field === 'amount'
          ? { ...c, headerFilterInterval: undefined, headerFilterItems: [
              { text: 'Small', value: data.where('amount', '<', 100) },
              { text: 'Large', value: data.where('amount', '>=', 300) },
              { text: 'Exactly 250', value: 250 },
            ] }
          : c,
      ),
    });
    await open(grid, 'amount');
    expect(listed(grid)).toEqual(['Small:', 'Large:', 'Exactly 250:']);
    hf(grid).listBox.value = ['item:0', 'item:2'];
    await hf(grid).apply();
    await settle();
    expect(grid.filters.amount).toEqual({ values: [data.where('amount', '<', 100), 250] });
    expect(grid.filter).toEqual(data.or(data.where('amount', 'in', [250]), data.where('amount', '<', 100)));
    expect(shownIds(grid)).toEqual([1, 2, 5]);
    // Opened again (also after the filters were stored as text), the same entries are chosen.
    grid.filters = JSON.parse(JSON.stringify(grid.filters));
    await open(grid, 'amount');
    expect(hf(grid).listBox.value).toEqual(['item:0', 'item:2']);
    await grid.dispose();
  });

  it('asks a function for the entries, with the values it would list', async () => {
    const asked: GridHeaderFilterItemsRequest<Row>[] = [];
    const grid = await make({
      filters: { amount: { op: '>', value: 100 } },
      settings: { headerFilter: true, filterRow: true },
      columns: columns.map((c) =>
        c.field === 'city'
          ? {
              ...c,
              headerFilterItems: async (request) => {
                asked.push(request);
                const values = await request.values();
                return [...values.filter((v) => v.value !== null), { text: 'Ankara or İzmir', value: data.where('city', 'in', ['Ankara', 'İzmir']) }];
              },
            }
          : c,
      ),
    });
    await open(grid, 'city');
    expect(asked[0].filter).toEqual(data.where('amount', '>', 100));
    expect(listed(grid)).toEqual(['Ankara:2', 'Bursa:2', 'İzmir:2', 'Ankara or İzmir:']);
    hf(grid).listBox.value = ['item:3'];
    await hf(grid).apply();
    await settle();
    expect(shownIds(grid)).toEqual([3, 4, 6, 7]);
    await grid.dispose();
  });

  it('leaves the values out with filterType exclude, from the column, the API and the list', async () => {
    const state = reactive({ values: ['Bursa'] as string[] | undefined, type: 'exclude' as 'include' | 'exclude' });
    const grid = await make({ columns: columns.map((c) => (c.field === 'city' ? { ...c, filterValues: () => state.values, filterType: () => state.type } : c)) });
    expect(grid.filters.city).toEqual({ values: ['Bursa'], filterType: 'exclude' });
    expect(shownIds(grid)).toEqual([1, 3, 4, 6, 7, 9]);
    expect(grid.filter).toEqual(data.not(data.where('city', 'in', ['Bursa'])));
    state.type = 'include';
    await settle();
    expect(shownIds(grid)).toEqual([2, 5, 8]);
    state.values = undefined;
    await settle();
    expect(shownIds(grid)).toHaveLength(9);
    grid.columnOption('city', { filterValues: ['Ankara', null], filterType: 'exclude' });
    await settle();
    expect(shownIds(grid)).toEqual([2, 3, 5, 6, 8]);
    expect([grid.columnOption('city', 'filterValues'), grid.columnOption('city', 'filterType')]).toEqual([['Ankara', null], 'exclude']);
    // The list starts with every value but those; taking one more away leaves it out too.
    const filter = await open(grid, 'city');
    expect([...filter.listBox.value].sort()).toEqual(['Bursa', 'İzmir']);
    filter.close();
    grid.columnOption('city', { filterValues: undefined, filterType: 'include' });
    await settle();
    expect(grid.filters.city).toBeUndefined();
    // Every value chosen, then one taken away: the list leaves that one out, values that come later stay.
    const list = (await open(grid, 'city')).listBox as ListBox<unknown, unknown>;
    const option = (text: string) => [...list.element.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.startsWith(text))!;
    option('Select all').click();
    await settle();
    option('İzmir').click();
    await settle();
    await hf(grid).apply();
    await settle();
    expect(grid.filters.city).toEqual({ values: ['İzmir'], filterType: 'exclude' });
    expect(shownIds(grid)).toEqual([1, 2, 4, 5, 7, 8, 9]);
    await grid.dispose();
  });

  it('builds the tree from the grouped values of a server', async () => {
    const adapter = new ServerAdapter({ data: makeRows(), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ rows: undefined, dataSource: source });
    const filter = await open(grid, 'day');
    expect(adapter.requests.find((r) => r.group)).toMatchObject({ group: [{ field: 'day' }], count: true });
    expect(nodes(filter.tree.items)).toEqual(['(empty):1', '2025:2', '2026:6']);
    filter.tree.check('2026/1');
    await filter.apply();
    await settle();
    expect(source.filter).toEqual(data.and(data.where('day', '>=', new Date(2026, 0, 1)), data.where('day', '<', new Date(2026, 1, 1))));
    expect(shownIds(grid)).toEqual([3, 4]);
    await grid.dispose();
    source.dispose();
  });
});
