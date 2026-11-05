import { data } from '@motifx-community/data';
import { reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; city: string; qty: number; paid: boolean; day: string; customerId: number; customer: { name: string } };

const NAMES = ['Zeynep Işık', 'Ali Kaya', 'Mehmet Ali', 'Ayşe Demir', 'Can Ak', 'İsmail Şen'];
const CUSTOMERS = [
  { id: 1, name: 'Ankara Foods' },
  { id: 2, name: 'Bursa Textiles' },
  { id: 3, name: 'İzmir Ports' },
];
const makeRows = (): Row[] =>
  NAMES.map((name, i) => ({
    id: i + 1,
    name,
    city: ['ank', 'brs', 'izm'][i % 3],
    qty: (i + 1) * 10,
    paid: i % 2 === 0,
    day: `2026-01-0${i + 1}`,
    customerId: (i % 3) + 1,
    customer: { name: CUSTOMERS[i % 3].name },
  }));

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  {
    field: 'city',
    title: 'City',
    type: 'list',
    options: [
      { value: 'ank', label: 'Ankara' },
      { value: 'brs', label: 'Bursa' },
      { value: 'izm', label: 'İzmir' },
    ],
  },
  { field: 'qty', title: 'Qty', type: 'number' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'day', title: 'Day', type: 'date' },
];

/** The customers' own service, another one than the rows': every load is recorded. */
class Customers extends data.ArrayAdapter<{ id: number; name: string }, number> {
  readonly loads: data.LoadOptions[] = [];
  constructor() {
    super({ data: CUSTOMERS.map((c) => ({ ...c })), key: 'id' });
  }
  protected override loadRows(options: data.LoadOptions) {
    this.loads.push(options);
    return super.loadRows(options);
  }
}

/** A pretend server for the rows: every load is recorded. */
class Server extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  protected override loadRows(options: data.LoadOptions) {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function settle() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = makeRows()) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

const shownRows = (grid: DataGrid<any>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')));
const ids = (grid: DataGrid<Row>) => shownRows(grid).map((row) => Number(row.querySelector('[data-field="id"]')!.textContent));
const cell = (grid: DataGrid<any>, id: number, field: string) => shownRows(grid).find((r) => r.querySelector('[data-field="id"]')!.textContent === String(id))!.querySelector<HTMLElement>(`[data-field="${field}"]`)!;
const marks = (el: Element) => Array.from(el.querySelectorAll('mark')).map((m) => m.textContent);
const toolbar = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__toolbar')!;
/** A hidden toolbar is out of the page (core `hide`). */
const barShown = (grid: DataGrid<any>) => !!grid.element.querySelector('.mx-data-grid__toolbar');
const barItems = (grid: DataGrid<any>) =>
  Array.from(toolbar(grid).children)
    .filter((el) => !el.classList.contains('mx-toolbar__more') && !(el as HTMLElement).hidden)
    .map((el) => (el.classList.contains('mx-data-grid__toolbar-gap') ? '|' : el.getAttribute('title') || el.textContent?.trim() || el.className.split(' ').find((c) => c.startsWith('mx-data-grid__')) || ''));
const searchInput = (grid: DataGrid<any>) => toolbar(grid).querySelector<HTMLInputElement>('.mx-data-grid__search input')!;
const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

afterEach(async () => {
  document.body.innerHTML = '';
  localStorage.clear();
  await uiLocale.use('en');
});

describe('search: the filter of each column type', () => {
  it('looks for text inside text columns without case, in the locale', async () => {
    const grid = await make({ locale: 'tr' });
    grid.searchByText('ali');
    await settle();
    expect(ids(grid)).toEqual([2, 3]);
    grid.searchByText('işik');
    await settle();
    // Turkish İ/ı: "IŞIK" lowers to "ışık"; "işik" is not it.
    expect(ids(grid)).toEqual([]);
    grid.searchByText('IŞIK');
    await settle();
    expect(ids(grid)).toEqual([1]);
    await grid.dispose();
  });

  it('matches numbers, dates and yes/no only when the text reads as one, and lists by their labels', async () => {
    const grid = await make();
    const search = (grid as any).model.search;
    const filter = (text: string) => search.filterFor(text) as data.FilterExpression;
    // "30": the number columns are equal to it, the text column holds it.
    expect(filter('30')).toEqual({ or: [{ field: 'id', op: '=', value: 30 }, { field: 'name', op: 'contains', value: '30' }, { field: 'qty', op: '=', value: 30 }] });
    grid.searchByText('30');
    await settle();
    expect(ids(grid)).toEqual([3]);
    grid.searchByText('1/4/2026');
    await settle();
    expect(ids(grid)).toEqual([4]);
    grid.searchByText('yes');
    await settle();
    expect(ids(grid)).toEqual([1, 3, 5]);
    // "bur" is part of the label "Bursa": the list column matches its value.
    expect(filter('bur')).toEqual({ or: [{ field: 'name', op: 'contains', value: 'bur' }, { field: 'city', op: 'in', value: ['brs'] }] });
    grid.searchByText('bur');
    await settle();
    expect(ids(grid)).toEqual([2, 5]);
    await grid.dispose();
  });

  it('keeps no row when no column can read the text, and every row again for an empty text', async () => {
    const grid = await make({ columns: columns.filter((c) => c.type === 'number' || c.type === 'date') });
    const search = (grid as any).model.search;
    expect(search.filterFor('abc')).toEqual(data.none());
    grid.searchByText('abc');
    await settle();
    expect(ids(grid)).toEqual([]);
    expect(grid.element.querySelector('.mx-data-grid__state:not([style*="none"]) span')?.textContent).toBe('No records match the filter');
    grid.searchByText('');
    await settle();
    expect(ids(grid)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(search.filterFor('  ')).toBeNull();
    await grid.dispose();
  });

  it('joins the columns with OR and the search with the filter row and header filter with AND', async () => {
    const grid = await make({ settings: { filterRow: true, filterDelay: 0 } });
    grid.filters = { qty: { op: '>', value: 20 } };
    grid.searchByText('ali');
    await settle();
    expect(ids(grid)).toEqual([3]);
    expect(grid.filter).toEqual({ and: [{ field: 'qty', op: '>', value: 20 }, { field: 'name', op: 'contains', value: 'ali' }] });
    // Clearing the filters takes the search away too.
    grid.clearFilters();
    await settle();
    expect(grid.searchText).toBe('');
    expect(ids(grid)).toEqual([1, 2, 3, 4, 5, 6]);
    await grid.dispose();
  });

  it('searches only the searchable columns: own switch, filters turned off, hidden ones by a setting', async () => {
    const grid = await make({
      columns: [
        { field: 'id', title: 'Id', type: 'number', searchable: false },
        { field: 'name', title: 'Name', filterRow: false },
        { field: 'qty', title: 'Qty', type: 'number', hidden: true },
        { field: 'day', title: 'Day', type: 'date', filterRow: false, searchable: true },
      ],
    });
    const search = (grid as any).model.search;
    expect(search.fields()).toEqual(['qty', 'day']);
    grid.settings.searchVisibleColumnsOnly = true;
    expect(search.fields()).toEqual(['day']);
    grid.columnSettings('name').searchable = true;
    expect(search.fields()).toEqual(['name', 'day']);
    // The searched columns changed: the same text is searched again.
    grid.searchByText('ali');
    await settle();
    expect(ids(grid)).toEqual([2, 3]);
    grid.columnSettings('name').searchable = false;
    await settle();
    expect(ids(grid)).toEqual([]);
    await grid.dispose();
  });

  it('sends the search to a server as an ordinary filter', async () => {
    const server = new Server({ data: makeRows(), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'page', pageSize: 10 });
    const grid = await make({ dataSource: source, mode: 'paged', columns: columns.slice(0, 2) });
    grid.searchByText('kaya');
    await settle();
    expect(server.requests.at(-1)!.filter).toEqual({ field: 'name', op: 'contains', value: 'kaya' });
    expect(ids(grid)).toEqual([2]);
    await grid.dispose();
    source.dispose();
  });
});

describe('search: lookup columns', () => {
  it('finds the keys whose text holds the search in the lookup source, a service of its own, and filters the rows by them', async () => {
    const customers = new Customers();
    const source = new data.DataSource({ adapter: customers, loadMode: 'page' });
    const server = new Server({ data: makeRows(), key: 'id' });
    const rowsSource = new data.DataSource<Row, number>({ adapter: server, loadMode: 'page', pageSize: 10 });
    const grid = await make({
      dataSource: rowsSource,
      mode: 'paged',
      columns: [{ field: 'id', title: 'Id', type: 'number' }, { field: 'customerId', title: 'Customer', lookup: { dataSource: source, valueField: 'id', textField: 'name', searchLimit: 10 } }],
    });
    customers.loads.length = 0;
    grid.searchByText('port');
    await settle();
    // The customers' service is searched by text, at most `searchLimit` items; the rows' server only sees keys.
    expect(customers.loads[0]).toMatchObject({ filter: { field: 'name', op: 'contains', value: 'port' }, take: 10 });
    expect(server.requests.at(-1)!.filter).toEqual({ field: 'customerId', op: 'in', value: [3] });
    expect(ids(grid)).toEqual([3, 6]);
    await settle();
    expect(marks(cell(grid, 3, 'customerId'))).toEqual(['Port']);
    await grid.dispose();
    rowsSource.dispose();
    source.dispose();
  });

  it('searches an array of items at once, and the row text with a textFrom field', async () => {
    const grid = await make({
      columns: [
        { field: 'id', title: 'Id', type: 'number' },
        { field: 'customerId', title: 'Customer', lookup: { dataSource: CUSTOMERS, valueField: 'id', textField: 'name' } },
      ],
    });
    expect((grid as any).model.search.filterFor('bursa')).toEqual({ field: 'customerId', op: 'in', value: [2] });
    grid.searchByText('bursa');
    await settle();
    expect(ids(grid)).toEqual([2, 5]);
    await grid.dispose();

    const other = await make({
      columns: [
        { field: 'id', title: 'Id', type: 'number' },
        { field: 'customerId', title: 'Customer', textFrom: 'customer.name', lookup: { dataSource: CUSTOMERS, valueField: 'id', textField: 'name' } },
      ],
    });
    expect((other as any).model.search.filterFor('food')).toEqual({ field: 'customer.name', op: 'contains', value: 'food' });
    other.searchByText('food');
    await settle();
    expect(ids(other)).toEqual([1, 4]);
    expect(marks(cell(other, 1, 'customerId'))).toEqual(['Food']);
    await other.dispose();
  });
});

describe('search: marking what was found', () => {
  it('marks the text found in text cells, every place, the whole cell of a number, and leaves custom cells alone', async () => {
    const grid = await make({
      columns: [...columns.slice(0, 2), { field: 'qty', title: 'Qty', type: 'number' }, { field: 'note', title: 'Note', value: (r) => r.name, cell: (ctx) => document.createTextNode(String(ctx.value)) }],
      rows: [...makeRows(), { ...makeRows()[0], id: 7, name: 'Ala Ali ala', qty: 77 }],
    });
    grid.searchByText('ali');
    await settle();
    const name = cell(grid, 7, 'name');
    expect(marks(name)).toEqual(['Ali']);
    expect(name.textContent).toBe('Ala Ali ala');
    expect(marks(cell(grid, 3, 'name'))).toEqual(['Ali']);
    expect(cell(grid, 3, 'note').querySelector('mark')).toBeNull();
    grid.searchByText('77');
    await settle();
    expect(marks(cell(grid, 7, 'qty'))).toEqual(['77']);
    expect(cell(grid, 7, 'name').querySelector('mark')).toBeNull();
    await grid.dispose();
  });

  it('marks only the same case with highlightCaseSensitive, and nothing with highlightSearchText off', async () => {
    const grid = await make();
    grid.searchByText('ALI');
    await settle();
    expect(marks(cell(grid, 3, 'name'))).toEqual(['Ali']);
    grid.settings.highlightCaseSensitive = true;
    await settle();
    expect(marks(cell(grid, 3, 'name'))).toEqual([]);
    grid.settings.highlightCaseSensitive = false;
    grid.settings.highlightSearchText = false;
    await settle();
    expect(cell(grid, 3, 'name').querySelector('mark')).toBeNull();
    expect(cell(grid, 3, 'name').textContent).toBe('Mehmet Ali');
    await grid.dispose();
  });
});

describe('search: the box, the text, the saved layout', () => {
  it('searches what is typed in the box after the typing pause; Escape empties it at once', async () => {
    const changed: string[] = [];
    const grid = await make({ settings: { searchPanel: true, searchDelay: 120 }, onSearchTextChanged: (e) => changed.push(e.text) });
    const input = searchInput(grid);
    expect(input.getAttribute('aria-label') ?? input.labels?.[0]?.textContent).toBe('Search in the grid');
    expect(input.placeholder).toBe('Search…');
    type(input, 'ka');
    await wait(40);
    expect(ids(grid)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(grid.searchText).toBe('ka');
    await wait(150);
    await settle();
    // "Kaya", and "Ankara" of the city list.
    expect(ids(grid)).toEqual([1, 2, 4]);
    expect(changed).toEqual(['ka']);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle();
    expect(input.value).toBe('');
    expect(ids(grid)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(changed).toEqual(['ka', '']);
    await grid.dispose();
  });

  it('follows a searchText function, and shows a text set from code in the box', async () => {
    const state = reactive({ q: 'can' });
    const grid = await make({ settings: { searchPanel: true }, searchText: () => state.q });
    expect(ids(grid)).toEqual([5]);
    expect(searchInput(grid).value).toBe('can');
    state.q = 'ayşe';
    await settle();
    expect(ids(grid)).toEqual([4]);
    grid.searchText = 'deniz';
    await settle();
    expect(searchInput(grid).value).toBe('deniz');
    expect(ids(grid)).toEqual([]);
    await grid.dispose();
  });

  it('announces how many records the search found', async () => {
    const grid = await make();
    grid.searchByText('ali');
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__live[aria-live]')!.textContent).toBe('2 records found');
    await grid.dispose();
  });

  it('keeps the search text with the layout and the filters, and brings it back', async () => {
    const first = await make({ layoutKey: 'search-test' });
    first.searchByText('kaya');
    await settle();
    await first.dispose();
    document.body.innerHTML = '';
    const again = await make({ layoutKey: 'search-test', settings: { searchPanel: true } });
    expect(again.searchText).toBe('kaya');
    expect(ids(again)).toEqual([2]);
    expect(searchInput(again).value).toBe('kaya');
    await again.dispose();
  });

  it('takes the texts from uiLocale, live', async () => {
    const grid = await make({ settings: { searchPanel: true } });
    await uiLocale.use('tr');
    await settle();
    expect(searchInput(grid).placeholder).toBe('Ara…');
    grid.settings.searchPlaceholder = 'Sipariş ara';
    await settle();
    expect(searchInput(grid).placeholder).toBe('Sipariş ara');
    await grid.dispose();
  });
});

describe('toolbar', () => {
  it('has nothing by default and does not show; each switch adds its item, in a fixed order at the end', async () => {
    const grid = await make();
    expect(barShown(grid)).toBe(false);
    grid.settings.searchPanel = true;
    grid.settings.exportButton = true;
    grid.settings.addRows = true;
    grid.settings.columnChooserButton = true;
    await settle();
    expect(barShown(grid)).toBe(true);
    expect(barItems(grid)).toEqual(['|', 'New row', 'Export', 'Column chooser', 'Search in the grid']);
    // Each switch still decides its button.
    grid.settings.newRowButton = false;
    grid.settings.columnChooser = false;
    await settle();
    expect(barItems(grid)).toEqual(['|', 'Export', 'Search in the grid']);
    await grid.dispose();

    // Saving all at once brings "Save changes" and "Discard", after "New row".
    const batch = await make({ saveMode: 'batch', settings: { addRows: true } });
    expect(barItems(batch)).toEqual(['|', 'New row', 'Save changes', 'Discard']);
    batch.settings.saveButtons = false;
    await settle();
    expect(barItems(batch)).toEqual(['|', 'New row']);
    await batch.dispose();
  });

  it('shows the listed items in their order and place, leaves out a named item whose feature is off, and follows a new list', async () => {
    const clicked: string[] = [];
    const grid = await make({
      settings: { exportButton: true },
      toolbar: {
        items: [
          { text: 'Refresh', location: 'before', click: (e) => clicked.push(`${(e.item as { text: string }).text}:${e.grid === grid}`) },
          'searchPanel',
          { name: 'exportButton', showText: 'always', location: 'before' },
          'addRowButton',
        ],
      },
    });
    expect(barItems(grid)).toEqual(['Refresh', 'Export', '|']);
    (toolbar(grid).querySelector('button') as HTMLButtonElement).click();
    expect(clicked).toEqual(['Refresh:true']);
    grid.settings.searchPanel = true;
    await settle();
    expect(barItems(grid)).toEqual(['Refresh', 'Export', '|', 'Search in the grid']);
    grid.toolbar.items = [{ text: 'Only', icon: () => document.createElement('i'), showText: 'inMenu' }];
    await settle();
    expect(barItems(grid)).toEqual(['|', 'Only']);
    grid.toolbar.visible = false;
    await settle();
    expect(barShown(grid)).toBe(false);
    await grid.dispose();
  });

  it('puts the app’s own component in the bar, and moves an item into the "more" menu when it asks to', async () => {
    const grid = await make({
      toolbar: {
        items: [
          { name: 'pick', content: () => Object.assign(document.createElement('select'), { className: 'my-pick' }) },
          { text: 'Print', overflow: 'always', click: () => undefined },
        ],
      },
    });
    await settle();
    expect(toolbar(grid).querySelector('.my-pick')).not.toBeNull();
    const print = Array.from(toolbar(grid).querySelectorAll('button')).find((b) => b.textContent === 'Print')!;
    expect(print.hasAttribute('data-overflowed')).toBe(true);
    expect(toolbar(grid).querySelector('.mx-toolbar__more')!.hasAttribute('data-idle')).toBe(false);
    await grid.dispose();
  });

  it('runs the grid’s own items: a new row, save and discard, the list of columns', async () => {
    const grid = await make({ saveMode: 'batch', settings: { editable: true, addRows: true, columnChooserButton: true } });
    const button = (cls: string) => toolbar(grid).querySelector<HTMLButtonElement>(`.${cls}`)!;
    const dimmed = (b: HTMLButtonElement) => b.disabled || b.getAttribute('aria-disabled') === 'true';
    expect(dimmed(button('mx-data-grid__save'))).toBe(true);
    button('mx-data-grid__add').click();
    await settle();
    expect(grid.total).toBe(6);
    expect(grid.element.querySelectorAll('.mx-data-grid__row[data-status="new"]').length).toBe(1);
    const open = vi.spyOn((grid as any).menu, 'openColumns');
    button('mx-data-grid__columns').click();
    expect(open).toHaveBeenCalledWith(button('mx-data-grid__columns'));
    await grid.dispose();
  });
});
