import { Component } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { NumberBox } from '../numberbox/NumberBox';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridValuesRequest } from './grid-values-request';

type Row = { id: number; name: string; city: string | null; qty: number; paid: boolean; day: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  { field: 'city', title: 'City', type: 'list', options: ['Ankara', 'Bursa', 'İzmir'] },
  { field: 'qty', title: 'Qty', type: 'number' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'day', title: 'Day', type: 'date' },
];

const CITIES = ['Ankara', 'Bursa', 'İzmir', null];
const makeRows = (n: number, from = 1): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, city: CITIES[(from + i) % 4], qty: (from + i) * 10, paid: (from + i) % 2 === 0, day: `2026-01-${String(((from + i) % 28) + 1).padStart(2, '0')}` }));

/** A pretend server that can group or not; every load is recorded. */
class ServerAdapter extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  group = true;

  protected override backendCapabilities(): data.Capabilities {
    return { ...super.backendCapabilities(), group: this.group };
  }

  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  await settled(6);
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = makeRows(12)) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, settings: { filterRow: true, headerFilter: true, filterDelay: 0 }, ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

/** The shown body rows in reading order (the order the rowgroup gives with `aria-owns`). */
const readingRows = (grid: DataGrid<any>) => {
  const body = grid.element.querySelector('.mx-data-grid__body')!;
  return (body.getAttribute('aria-owns') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => body.querySelector<HTMLElement>(`#${id}`)!)
    .filter((row) => !row.hidden);
};
const shownIds = (grid: DataGrid<Row>) => readingRows(grid).map((row) => Number(row.querySelector('[data-field="id"]')!.textContent));
const filterCell = (grid: DataGrid<any>, f: string) => grid.element.querySelector(`.mx-data-grid__filter-cell[data-field="${f}"]`) as HTMLElement;
const input = (grid: DataGrid<any>, f: string) => filterCell(grid, f).querySelector('input') as HTMLInputElement;
const type = (el: HTMLInputElement, text: string) => {
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

/** Opens a column's header filter and waits for its values. */
async function openValues(grid: DataGrid<any>, field: string) {
  (grid as any).openHeaderFilter(field, (grid as any).headerAnchor(field));
  await settle();
  const list = (grid as any).headerFilter.listBox;
  return { list, values: () => list.listItems.loaded.map((v: { text: string; count?: number }) => `${v.text}:${v.count ?? ''}`) as string[] };
}

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
  vi.useRealTimers();
});

describe('DataGrid filters', () => {
  it('shows the filter row while a column has a cell in it, as the second header row', async () => {
    const grid = await make({ settings: {} });
    const row = () => grid.element.querySelector<HTMLElement>('.mx-data-grid__row--filter');
    expect(row()).toBeNull();
    grid.columnSettings('name').filterRow = true;
    await settle();
    expect(row()!.getAttribute('aria-rowindex')).toBe('2');
    expect(readingRows(grid)[0].getAttribute('aria-rowindex')).toBe('3');
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-rowcount')).toBe('14');
    expect(filterCell(grid, 'name').querySelector('.mx-field')).not.toBeNull();
    expect(filterCell(grid, 'qty').querySelector('.mx-field')).toBeNull();
    // Out of the Tab order: the grid is one tab stop.
    expect(input(grid, 'name').tabIndex).toBe(-1);
    await grid.dispose();
  });

  it('filters by the condition chosen for each column type', async () => {
    const grid = await make();
    type(input(grid, 'name'), 'name 1');
    await settle();
    expect(shownIds(grid)).toEqual([1, 10, 11, 12]);
    grid.filters = { qty: { op: 'between', value: 30, value2: 50 } };
    await settle();
    expect(shownIds(grid)).toEqual([3, 4, 5]);
    expect(filterCell(grid, 'qty').querySelectorAll('.mx-field')).toHaveLength(2);
    grid.filters = { city: { op: 'isblank' } };
    await settle();
    expect(shownIds(grid)).toEqual([3, 7, 11]);
    expect(filterCell(grid, 'city').querySelector('.mx-field')).toBeNull();
    grid.filters = { paid: { value: true }, day: { op: '>=', value: new Date(2026, 0, 10) } };
    await settle();
    expect(shownIds(grid)).toEqual([10, 12]);
    expect(grid.filter).toEqual(data.and(data.where('paid', '=', true), data.where('day', '>=', new Date(2026, 0, 10))));
    expect(grid.filters).toEqual({ paid: { value: true }, day: { op: '>=', value: new Date(2026, 0, 10) } });
    await grid.dispose();
  });

  it('waits for a pause in typing before it filters', async () => {
    const grid = await make({ settings: { filterRow: true, filterDelay: 300 } });
    vi.useFakeTimers();
    type(input(grid, 'name'), 'name 1');
    await vi.advanceTimersByTimeAsync(100);
    expect(grid.dataSource.filter).toBeNull();
    type(input(grid, 'name'), 'name 12');
    await vi.advanceTimersByTimeAsync(299);
    expect(grid.dataSource.filter).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(grid.dataSource.filter).toEqual(data.where('name', 'contains', 'name 12'));
    vi.useRealTimers();
    await grid.dispose();
  });

  it('lists the values of rows in memory with counts, honoring the other filters', async () => {
    const grid = await make();
    grid.filters = { qty: { op: '<=', value: 60 } };
    await settle();
    const { list, values } = await openValues(grid, 'city');
    expect(values()).toEqual(['(empty):1', 'Ankara:1', 'Bursa:2', 'İzmir:2']);
    const popup = grid.element.querySelector('.mx-data-grid__values') as HTMLElement;
    expect(popup.getAttribute('role')).toBe('dialog');
    expect(popup.getAttribute('aria-label')).toBe('City filter');
    list.value = ['Ankara', null];
    (grid as any).headerFilter.apply();
    await settle();
    expect(shownIds(grid)).toEqual([3, 4]);
    expect(grid.filters.city).toEqual({ values: ['Ankara', null] });
    const button = grid.element.querySelector('[role="columnheader"][data-field="city"] .mx-data-grid__filter-button')!;
    expect(button.hasAttribute('data-active')).toBe(true);
    // Choosing every value is no value filter.
    const again = await openValues(grid, 'city');
    again.list.value = [null, 'Ankara', 'Bursa', 'İzmir'];
    (grid as any).headerFilter.apply();
    await settle();
    expect(grid.filters.city).toBeUndefined();
    await grid.dispose();
  });

  it('asks a server that groups for the values, and the app when it cannot', async () => {
    const adapter = new ServerAdapter({ data: makeRows(300), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ dataSource: source });
    grid.filters = { paid: { value: true } };
    await settle();
    const { values } = await openValues(grid, 'city');
    const grouped = adapter.requests.find((r) => r.group);
    expect(grouped).toMatchObject({ group: [{ field: 'city' }], filter: data.where('paid', '=', true), count: true });
    expect(values()).toEqual(['Ankara:75', 'İzmir:75']);
    (grid as any).headerFilter.close();
    await grid.dispose();

    adapter.group = false;
    const asked: GridValuesRequest<Row>[] = [];
    const source2 = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 50 });
    const grid2 = await make({
      dataSource: source2,
      loadValues: (req) => {
        asked.push(req);
        return { values: [{ value: 'Ankara', count: 9 }, { value: 'Bursa' }], total: 2 };
      },
    });
    const second = await openValues(grid2, 'city');
    expect(asked[0]).toMatchObject({ column: expect.objectContaining({ field: 'city' }), search: '', filter: null, skip: 0 });
    expect(second.values()).toEqual(['Ankara:9', 'Bursa:']);
    await grid2.dispose();
  });

  it('has no header filter where its values cannot be had, nor while the feature is off', async () => {
    const adapter = new ServerAdapter({ data: makeRows(50), key: 'id' });
    adapter.group = false;
    const grid = await make({ dataSource: new data.DataSource<Row, number>({ adapter, loadMode: 'page', pageSize: 10 }) });
    expect((grid as any).model.hasHeaderFilter('city')).toBe(false);
    await grid.dispose();
    const local = await make({ columns: columns.map((c) => (c.field === 'name' ? { ...c, headerFilter: false } : c)) });
    expect((local as any).model.hasHeaderFilter('city')).toBe(true);
    expect((local as any).model.hasHeaderFilter('name')).toBe(false);
    await local.dispose();
  });

  it('says when nothing matches and clears the filters', async () => {
    const grid = await make();
    grid.filters = { name: { value: 'nobody' } };
    await settle();
    const overlay = grid.element.querySelector('.mx-data-grid__overlay') as HTMLElement;
    expect(overlay.textContent).toContain('No records match the filter');
    (grid.element.querySelector('.mx-data-grid__clear-filters') as HTMLElement).click();
    await settle();
    expect(shownIds(grid)).toHaveLength(12);
    await grid.dispose();
  });

  it('takes a column out of the filter when its feature goes off, live', async () => {
    const grid = await make();
    grid.filters = { name: { value: 'name 1' }, city: { values: ['Bursa'] } };
    await settle();
    expect(shownIds(grid)).toEqual([1]);
    grid.columnSettings('name').filterRow = false;
    await settle();
    expect(shownIds(grid)).toEqual([1, 5, 9]);
    grid.settings.headerFilter = false;
    await settle();
    expect(shownIds(grid)).toHaveLength(12);
    await grid.dispose();
  });

  it('is reached with the arrow keys; typing goes into the value box, Escape back to the cell', async () => {
    const grid = await make();
    const header = grid.element.querySelector('[role="columnheader"][data-field="name"]') as HTMLElement;
    header.focus();
    key(header, 'ArrowDown');
    await settle();
    expect(document.activeElement).toBe(filterCell(grid, 'name'));
    key(filterCell(grid, 'name'), 'n');
    await settle();
    expect(document.activeElement).toBe(input(grid, 'name'));
    expect(input(grid, 'name').value).toBe('n');
    key(input(grid, 'name'), 'Escape');
    expect(document.activeElement).toBe(filterCell(grid, 'name'));
    key(filterCell(grid, 'name'), 'Delete');
    await settle();
    expect(grid.filters.name).toBeUndefined();
    key(filterCell(grid, 'name'), 'ArrowDown');
    await settle();
    expect(grid.activeRow?.id).toBe(1);
    key(document.activeElement!, 'ArrowUp');
    await settle();
    expect(document.activeElement).toBe(filterCell(grid, 'name'));
    // Alt+Down opens the conditions; choosing one keeps it.
    key(filterCell(grid, 'name'), 'ArrowDown', { altKey: true });
    await settle();
    // The open menu: closed ones are out of the page.
    const menu = [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__menu')].find((m) => m.querySelector('[role="menuitemradio"]'))!;
    const items = [...menu.querySelectorAll('[role="menuitemradio"]')] as HTMLElement[];
    expect(items.map((i) => i.textContent)).toEqual(['Contains', 'Starts with', 'Ends with', 'Equals', 'Does not equal', 'Is empty', 'Is not empty']);
    items[1].click();
    await settle();
    expect(grid.filters).toEqual({});
    type(input(grid, 'name'), 'name 2');
    await settle();
    expect(shownIds(grid)).toEqual([2]);
    expect(filterCell(grid, 'name').querySelector('.mx-data-grid__condition')!.getAttribute('aria-label')).toBe('Name condition: Starts with');
    await grid.dispose();
  });

  it('filters columns that read their value themselves, rows in memory', async () => {
    const cols: GridColumn<Row>[] = [...columns, { field: 'double', title: 'Double', type: 'number', value: (r) => r.qty * 2 }];
    const grid = await make({ columns: cols });
    grid.filters = { double: { op: '>', value: 200 } };
    await settle();
    expect(shownIds(grid)).toEqual([11, 12]);
    const { values } = await openValues(grid, 'double');
    // The column's own condition counts; only its own value list does not.
    expect(values()).toEqual(['220:1', '240:1']);
    await grid.dispose();
  });

  it('writes its texts from uiLocale', async () => {
    await uiLocale.use('tr');
    const grid = await make();
    expect(filterCell(grid, 'name').querySelector('.mx-data-grid__condition')!.getAttribute('aria-label')).toBe('Name koşulu: İçerir');
    expect(filterCell(grid, 'paid').textContent).toContain('(Tümü)');
    grid.filters = { name: { value: 'yok' } };
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__overlay')!.textContent).toContain('Filtreye uyan kayıt yok');
    await grid.dispose();
  });

  it('takes a column’s own filter editor: a field bound both ways, or any component through its context', async () => {
    let told: unknown[] = [];
    let custom!: { set: (v: unknown) => void };
    const own: GridColumn<Row>[] = columns.map((c) =>
      c.field === 'qty'
        ? { ...c, filterEditor: () => new NumberBox({ labelMode: 'hidden', size: 'sm', min: 0 }) }
        : c.field === 'name'
          ? {
              ...c,
              filterEditor: (ctx) => {
                const box = new Component<HTMLDivElement>('div');
                box.element.className = 'own-filter';
                custom = { set: (v) => ctx.setValue(v) };
                ctx.onChanged((v) => told.push(v));
                return box;
              },
            }
          : c,
    );
    const grid = await make({ columns: own, settings: { filterRow: true, filterDelay: 0 } });
    expect(filterCell(grid, 'name').querySelector('.own-filter')).not.toBeNull();
    expect(filterCell(grid, 'qty').querySelector('.mx-number-box')).not.toBeNull();
    custom.set('Name 1');
    await settle();
    expect(grid.filters).toEqual({ name: { value: 'Name 1' } });
    expect(told).toEqual(['Name 1']);
    type(input(grid, 'qty'), '30');
    input(grid, 'qty').dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(grid.filters.qty?.value).toBe(30);
    told = [];
    grid.filters = {};
    await settle();
    expect(told).toEqual([undefined]);
    expect(input(grid, 'qty').value).toBe('');
    await grid.dispose();
  });

  it('draws its columns from the first frame, out of sight until its own sheet is in the page', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(3) } as DataGridProps<Row>));
    await settle();
    const vp = grid.element.querySelector<HTMLElement>('.mx-data-grid__viewport')!;
    expect(vp.style.getPropertyValue('--_columns')).not.toBe('');
    expect(grid.element.hasAttribute('data-settling')).toBe(false);
    await grid.dispose();
  });
});
