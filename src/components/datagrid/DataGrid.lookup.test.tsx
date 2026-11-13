import { Component } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { ComboBox } from '../combobox/ComboBox';
import { DropDown } from '../dropdown/DropDown';
import { Lookup } from '../lookup/Lookup';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Customer = { id: number; name: string };
type Order = { id: number; customerId: number | null; amount: number };

const NAMES = ['Zeynep', 'Ali', 'Mehmet', 'Ayşe', 'Can', 'Deniz'];
const makeCustomers = (): Customer[] => NAMES.map((name, i) => ({ id: i + 1, name }));
const makeOrders = (n: number): Order[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, customerId: (i % 6) + 1, amount: (i + 1) * 10 }));

/** The customers' own service: every load is recorded. */
class Customers extends data.ArrayAdapter<Customer, number> {
  readonly loads: data.LoadOptions[] = [];
  /** While set, answers wait for it. */
  hold: Promise<void> | null = null;

  constructor(rows = makeCustomers()) {
    super({ data: rows, key: 'id' });
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Customer>> {
    this.loads.push(options);
    if (this.hold) await this.hold;
    return super.loadRows(options);
  }
}

async function settle() {
  await settled(6);
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

function customerColumn(source: data.DataSource<Customer, number> | readonly Customer[], more: Partial<GridColumn<Order>> = {}): GridColumn<Order> {
  return { field: 'customerId', title: 'Customer', lookup: { dataSource: source, valueField: 'id', textField: 'name' }, ...more };
}

function make(props: Partial<DataGridProps<Order>> & { columns: GridColumn<Order>[] }, rows: Order[] = makeOrders(8)) {
  const grid = mount(new DataGrid<Order>({ rowKey: 'id', rows, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Order>));
  layout(grid);
  return grid;
}

const source = (adapter: Customers) => new data.DataSource<Customer, number>({ adapter, loadMode: 'page' });
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const text = (grid: DataGrid<any>, i: number, field: string) => cellOf(grid, i, field).firstChild?.textContent ?? '';
const texts = (grid: DataGrid<any>, n: number, field: string) => Array.from({ length: n }, (_, i) => text(grid, i, field));
const inFilter = (load: data.LoadOptions) => (load.filter as data.FilterCondition | undefined)?.op === 'in';

afterEach(() => {
  document.body.innerHTML = '';
  uiLocale.strings = { ...uiLocale.strings };
});

describe('lookup columns: display', () => {
  it('shows the texts of the keys on the screen, asked for in one request, and draws only those cells again', async () => {
    const service = new Customers();
    let release = () => {};
    service.hold = new Promise((done) => (release = done));
    const grid = make({ columns: [{ field: 'id', title: 'No', type: 'number' }, customerColumn(source(service))] });
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    const row = rowEl(grid, 0);
    expect(cell.getAttribute('aria-busy')).toBe('true');
    expect(cell.dataset.lookup).toBe('loading');
    release();
    await settle();
    expect(texts(grid, 8, 'customerId')).toEqual(['Zeynep', 'Ali', 'Mehmet', 'Ayşe', 'Can', 'Deniz', 'Zeynep', 'Ali']);
    expect(service.loads.filter(inFilter)).toHaveLength(1);
    expect((service.loads[0].filter as data.FilterCondition).value).toEqual([1, 2, 3, 4, 5, 6]);
    // The same row and cell elements: nothing was built again.
    expect(rowEl(grid, 0)).toBe(row);
    expect(cellOf(grid, 0, 'customerId')).toBe(cell);
    expect(cell.hasAttribute('aria-busy')).toBe(false);
    await grid.dispose();
  });

  it('shows a key the source does not have as it is, muted, with a hint', async () => {
    const service = new Customers();
    const rows = makeOrders(3);
    rows[1].customerId = 99;
    rows[2].customerId = null;
    const grid = make({ columns: [customerColumn(source(service))] }, rows);
    await settle();
    const missing = cellOf(grid, 1, 'customerId');
    expect(text(grid, 1, 'customerId')).toBe('99');
    expect(missing.dataset.lookup).toBe('missing');
    expect(missing.dataset.hint).toBe(uiLocale.strings.gridLookupMissing);
    expect(text(grid, 2, 'customerId')).toBe('');
    expect(cellOf(grid, 2, 'customerId').dataset.lookup).toBeUndefined();
    await grid.dispose();
  });

  it('shares the texts with another grid over the same source, and reads them again on refreshLookups()', async () => {
    const service = new Customers();
    const customers = source(service);
    const a = make({ columns: [customerColumn(customers)] });
    await settle();
    const b = make({ columns: [customerColumn(customers)] });
    await settle();
    expect(texts(b, 2, 'customerId')).toEqual(['Zeynep', 'Ali']);
    expect(service.loads.filter(inFilter)).toHaveLength(1);
    service.rows[0].name = 'Zehra';
    a.refreshLookups();
    await settle();
    expect(text(a, 0, 'customerId')).toBe('Zehra');
    expect(text(b, 0, 'customerId')).toBe('Zehra');
    expect(service.loads.filter(inFilter)).toHaveLength(2);
    await a.dispose();
    await b.dispose();
  });

  it('reads the text from the row with textFrom, without asking the source', async () => {
    type Expanded = Order & { customer: { name: string } };
    const service = new Customers();
    const rows: Expanded[] = makeOrders(3).map((o) => ({ ...o, customer: { name: `Row ${o.customerId}` } }));
    const grid = mount(
      new DataGrid<Expanded>({ rowKey: 'id', rows, rowHeight: 36, columns: [{ ...(customerColumn(source(service)) as unknown as GridColumn<Expanded>), textFrom: 'customer.name' }] }),
    );
    layout(grid);
    await settle();
    expect(texts(grid, 3, 'customerId')).toEqual(['Row 1', 'Row 2', 'Row 3']);
    expect(service.loads).toHaveLength(0);
    await grid.dispose();
  });

  it('takes an array of items and one of plain values', async () => {
    type Row = { id: number; customerId: number; color: string };
    const rows: Row[] = [{ id: 1, customerId: 2, color: 'red' }];
    const grid = mount(
      new DataGrid<Row>({
        rowKey: 'id',
        rows,
        rowHeight: 36,
        columns: [
          { field: 'customerId', title: 'Customer', lookup: { dataSource: makeCustomers(), valueField: 'id', textField: (c: Customer) => c.name.toUpperCase() } },
          { field: 'color', title: 'Color', lookup: { dataSource: ['red', 'green'] } },
        ],
      }),
    );
    layout(grid);
    await settle();
    expect(text(grid, 0, 'customerId')).toBe('ALI');
    expect(text(grid, 0, 'color')).toBe('red');
    await grid.dispose();
  });
});

describe('lookup columns: editing', () => {
  it('edits with a drop-down over a data source of its own; the chosen text shows at once', async () => {
    const service = new Customers();
    const customers = source(service);
    const rows = makeOrders(2);
    const grid = make({ columns: [customerColumn(customers)], settings: { editable: true } }, rows);
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    key(cell, 'Enter');
    const editor = cell.querySelector('.mx-drop-down') as HTMLElement;
    expect(editor).not.toBeNull();
    const dropDown = (grid as any).editor.field as DropDown<Customer, number>;
    expect(dropDown.dataSource).not.toBe(customers);
    expect(dropDown.dataSource!.adapter).toBe(service);
    expect(dropDown.searchEnabled).toBe(true);
    await settle();
    // The field shows the current customer without another request.
    expect(editor.querySelector('.mx-drop-down__text')!.textContent).toBe('Zeynep');
    dropDown.open();
    await settle();
    const list = dropDown as any;
    const options = list.dropParts.list.element.querySelectorAll('[role="option"]');
    (options[3] as HTMLElement).click();
    await settle();
    expect(cell.querySelector('.mx-data-grid__editor')).toBeNull();
    expect(text(grid, 0, 'customerId')).toBe('Ayşe');
    expect(grid.changes.updated[0].changed).toEqual({ customerId: 4 });
    // The page's own source never moved.
    expect(customers.status).toBe('idle');
    await grid.dispose();
  });

  it('opens the list and searches what was typed to start editing', async () => {
    const service = new Customers();
    const grid = make({ columns: [customerColumn(source(service))], settings: { editable: true } });
    await settle();
    const cell = cellOf(grid, 1, 'customerId');
    cell.focus();
    key(cell, 'D');
    const dropDown = (grid as any).editor.field as DropDown<Customer, number>;
    expect(dropDown.opened).toBe(true);
    const search = (dropDown as any).dropParts.search;
    expect(search.value).toBe('D');
    // Escape closes the list; Escape again ends the edit without a change.
    key(search.inputPart.element, 'Escape');
    key(document.activeElement!, 'Escape');
    expect(cell.querySelector('.mx-data-grid__editor')).toBeNull();
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
  });

  it('edits with a combo box or the kit\'s Lookup when the column asks for one', async () => {
    const service = new Customers();
    const customers = source(service);
    const grid = make({ columns: [customerColumn(customers, { lookup: { dataSource: customers, valueField: 'id', textField: 'name', editor: 'combobox' } })], settings: { editable: true } });
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    key(cell, 'M');
    const combo = (grid as any).editor.field as ComboBox<Customer, number>;
    expect(combo).toBeInstanceOf(ComboBox);
    expect(combo.inputPart.element.value).toBe('M');
    key(combo.inputPart.element, 'Escape');
    key(document.activeElement!, 'Escape');
    await grid.dispose();
    const table = make({
      columns: [customerColumn(customers, { lookup: { dataSource: customers, valueField: 'id', textField: 'name', editor: 'lookup', editorOptions: { columns: [{ field: 'name' }] } } })],
      settings: { editable: true },
    });
    await settle();
    const other = cellOf(table, 0, 'customerId');
    other.focus();
    key(other, 'Enter');
    const lookup = (table as any).editor.field as Lookup<Customer, number>;
    expect(lookup).toBeInstanceOf(Lookup);
    expect(lookup.columns).toEqual([{ field: 'name' }]);
    await table.dispose();
  });

  it('gives a column\'s own editor the lookup and takes the text it gives', async () => {
    const service = new Customers();
    let seen: unknown;
    const grid = make({
      columns: [
        customerColumn(source(service), {
          editor: (ctx) => {
            seen = ctx.lookup;
            ctx.setValue(5, 'Can (picked)');
            return new Component<HTMLInputElement>('input');
          },
        }),
      ],
      settings: { editable: true },
    });
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    key(cell, 'Enter');
    expect(seen).toMatchObject({ textField: 'name' });
    key(document.activeElement!, 'Enter');
    await settle();
    expect(text(grid, 0, 'customerId')).toBe('Can (picked)');
    await grid.dispose();
  });
});

describe('lookup columns: setCellValue and onEditorPreparing', () => {
  type Address = { id: number; stateId: string | null; cityId: number | null };
  const STATES = [
    { id: 'AN', name: 'Ankara' },
    { id: 'IZ', name: 'İzmir' },
  ];
  const CITIES = [
    { id: 1, name: 'Çankaya', stateId: 'AN' },
    { id: 2, name: 'Keçiören', stateId: 'AN' },
    { id: 3, name: 'Bornova', stateId: 'IZ' },
  ];
  const addressColumns: GridColumn<Address>[] = [
    {
      field: 'stateId',
      title: 'State',
      lookup: { dataSource: STATES, valueField: 'id', textField: 'name' },
      setCellValue: (values) => {
        values.cityId = null;
      },
    },
    { field: 'cityId', title: 'City', lookup: { dataSource: CITIES, valueField: 'id', textField: 'name', filter: (row, { getValue }) => (row ? data.where('stateId', '=', getValue('stateId')) : null) } },
  ];
  const makeAddresses = (rows: Address[], more: Partial<DataGridProps<Address>> = {}) => {
    const grid = mount(
      new DataGrid<Address>({
        rowKey: 'id',
        rows,
        rowHeight: 36,
        columns: addressColumns,
        settings: { editable: true },
        onEditorPreparing: (e) => {
          if (e.field === 'cityId') e.options.enabled = e.getValue('stateId') !== null;
        },
        ...more,
      }),
    );
    layout(grid);
    return grid;
  };
  const choose = async (dropDown: DropDown<any, any>, label: string) => {
    dropDown.open();
    await settle();
    const option = [...(dropDown as any).dropParts.list.element.querySelectorAll('[role="option"]')].find((o: HTMLElement) => o.textContent === label) as HTMLElement;
    option.click();
    await settle();
  };

  it('writes the fields setCellValue fills: a new state clears the city, whose list follows the state', async () => {
    const rows: Address[] = [{ id: 1, stateId: 'AN', cityId: 1 }];
    const grid = makeAddresses(rows);
    await settle();
    expect(texts(grid, 1, 'cityId')).toEqual(['Çankaya']);
    const state = cellOf(grid, 0, 'stateId');
    state.focus();
    key(state, 'Enter');
    await choose((grid as any).editor.field, 'İzmir');
    expect(text(grid, 0, 'stateId')).toBe('İzmir');
    expect(text(grid, 0, 'cityId')).toBe('');
    const city = cellOf(grid, 0, 'cityId');
    city.focus();
    key(city, 'Enter');
    const cities = (grid as any).editor.field as DropDown<any, any>;
    expect(cities.enabled).toBe(true);
    expect(cities.items.map((c: { name: string }) => c.name)).toEqual(['Bornova']);
    await choose(cities, 'Bornova');
    expect(text(grid, 0, 'cityId')).toBe('Bornova');
    expect((grid as any).model.data.tracker.editOf(rows[0])?.draft).toEqual({ stateId: 'IZ', cityId: 3 });
    await grid.dispose();
  });

  it('waits for an async setCellValue: the cell is busy meanwhile', async () => {
    let done = () => {};
    const rows: Address[] = [{ id: 1, stateId: 'AN', cityId: 1 }];
    const grid = makeAddresses(rows, {
      columns: [
        {
          ...addressColumns[0],
          setCellValue: (values) =>
            new Promise<void>((resolve) => {
              done = () => {
                values.cityId = 3;
                resolve();
              };
            }),
        },
        addressColumns[1],
      ],
    });
    await settle();
    const state = cellOf(grid, 0, 'stateId');
    state.focus();
    key(state, 'Enter');
    await choose((grid as any).editor.field, 'İzmir');
    expect(state.getAttribute('aria-busy')).toBe('true');
    expect(text(grid, 0, 'stateId')).toBe('Ankara');
    done();
    await settle();
    expect(state.hasAttribute('aria-busy')).toBe(false);
    expect([text(grid, 0, 'stateId'), text(grid, 0, 'cityId')]).toEqual(['İzmir', 'Bornova']);
    await grid.dispose();
  });

  it('lets onEditorPreparing disable the editor or call the edit off', async () => {
    const rows: Address[] = [{ id: 1, stateId: null, cityId: null }];
    const grid = makeAddresses(rows);
    await settle();
    const city = cellOf(grid, 0, 'cityId');
    city.focus();
    key(city, 'Enter');
    expect(((grid as any).editor.field as DropDown<any, any>).enabled).toBe(false);
    key(document.activeElement!, 'Escape');
    grid.onEditorPreparing((e) => (e.cancel = e.field === 'stateId'));
    const state = cellOf(grid, 0, 'stateId');
    state.focus();
    key(state, 'Enter');
    expect((grid as any).editor).toBeNull();
    await grid.dispose();
  });
});

describe('lookup columns: filters', () => {
  async function openValues(grid: DataGrid<any>, field: string) {
    (grid as any).openHeaderFilter(field, (grid as any).headerAnchor(field));
    await settle();
    const list = (grid as any).headerFilter.listBox;
    return { list, values: () => list.listItems.loaded.map((v: { text: string; count?: number }) => `${v.text}:${v.count ?? ''}`) as string[] };
  }
  const options = (dropDown: DropDown<any, any>) => [...(dropDown as any).dropParts.list.element.querySelectorAll('[role="option"]')] as HTMLElement[];
  const filterList = async (grid: DataGrid<any>, field: string) => {
    const cell = (grid as any).filterRow.filterCells.get(field);
    const dropDown = cell.editors[0] as DropDown<any, any>;
    dropDown.open();
    await settle();
    return { dropDown, texts: () => options(dropDown).map((o) => o.textContent) };
  };
  const orderColumns = (customers: data.DataSource<Customer, number> | readonly Customer[]): GridColumn<Order>[] => [
    { field: 'id', title: 'No', type: 'number' },
    customerColumn(customers),
    { field: 'amount', title: 'Amount', type: 'number' },
  ];

  it('filters by one key from a list with "(All)" first, with no condition to choose', async () => {
    const service = new Customers();
    const grid = make({ columns: orderColumns(source(service)), settings: { filterRow: true, filterDelay: 0 } });
    await settle();
    const cell = grid.element.querySelector('.mx-data-grid__filter-cell[data-field="customerId"]')!;
    expect(cell.querySelector('.mx-data-grid__condition')).toBeNull();
    const list = await filterList(grid, 'customerId');
    expect(list.texts()).toEqual(['(All)', 'Ali', 'Ayşe', 'Can', 'Deniz', 'Mehmet', 'Zeynep']);
    options(list.dropDown)[3].click();
    await settle();
    expect(grid.filter).toEqual({ field: 'customerId', op: '=', value: 5 });
    expect(grid.total).toBe(1);
    expect(cell.querySelector('.mx-drop-down__text')!.textContent).toBe('Can');
    // "(All)" takes the filter away.
    const again = await filterList(grid, 'customerId');
    options(again.dropDown)[0].click();
    await settle();
    expect(grid.filter).toBeNull();
    await grid.dispose();
  });

  it('lists only the keys the other filters leave (syncLookupFilterValues), else the whole source', async () => {
    const service = new Customers();
    const grid = make({ columns: orderColumns(source(service)), settings: { filterRow: true, headerFilter: true, filterDelay: 0 } });
    await settle();
    grid.filters = { amount: { op: '<', value: 30 } };
    await settle();
    expect((await filterList(grid, 'customerId')).texts()).toEqual(['(All)', 'Ali', 'Zeynep']);
    const { values } = await openValues(grid, 'customerId');
    expect(values()).toEqual(['Ali:1', 'Zeynep:1']);
    (grid as any).headerFilter.close();
    grid.settings.syncLookupFilterValues = false;
    const all = await openValues(grid, 'customerId');
    expect(all.values()).toEqual(['(empty):', 'Zeynep:', 'Ali:', 'Mehmet:', 'Ayşe:', 'Can:', 'Deniz:']);
    await grid.dispose();
  });

  it('lists names with counts in the header filter, empty keys first, searched by text', async () => {
    const rows = makeOrders(8);
    rows[7].customerId = null;
    const grid = make({ columns: orderColumns(makeCustomers()), settings: { headerFilter: true } }, rows);
    await settle();
    const { list, values } = await openValues(grid, 'customerId');
    expect(values()).toEqual(['(empty):1', 'Ali:1', 'Ayşe:1', 'Can:1', 'Deniz:1', 'Mehmet:1', 'Zeynep:2']);
    await list.listItems.search('ay');
    await settle();
    expect(values()).toEqual(['Ayşe:1']);
    list.value = [4];
    (grid as any).headerFilter.apply();
    await settle();
    expect(grid.filter).toEqual({ field: 'customerId', op: 'in', value: [4] });
    await grid.dispose();
  });

  it('asks a server that groups for the keys under the other filters, then their texts', async () => {
    class Orders extends data.ArrayAdapter<Order, number> {
      readonly loads: data.LoadOptions[] = [];
      protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Order>> {
        this.loads.push(options);
        return super.loadRows(options);
      }
    }
    const orders = new Orders({ data: makeOrders(30), key: 'id' });
    const service = new Customers();
    const grid = make({ columns: orderColumns(source(service)), dataSource: new data.DataSource<Order, number>({ adapter: orders, loadMode: 'blocks', pageSize: 20 }), settings: { headerFilter: true, filterRow: true } });
    await settle();
    grid.filters = { amount: { op: '<=', value: 20 } };
    await settle();
    const { values } = await openValues(grid, 'customerId');
    const grouped = orders.loads.find((l) => l.group);
    expect(grouped).toMatchObject({ group: [{ field: 'customerId' }], filter: { field: 'amount', op: '<=', value: 20 } });
    expect(values()).toEqual(['Zeynep:1', 'Ali:1']);
    // A search looks for the text in the customers' service, then for those keys among the rows.
    const { list } = await openValues(grid, 'customerId');
    await list.listItems.search('ze');
    await settle();
    expect(list.listItems.loaded.map((v: { text: string }) => v.text)).toEqual(['Zeynep']);
    expect(orders.loads.at(-1)!.filter).toEqual({ and: [{ field: 'amount', op: '<=', value: 20 }, { field: 'customerId', op: 'in', value: [1] }] });
    await grid.dispose();
  });
});

describe('lookup columns: sorting', () => {
  it('sorts rows in memory by the key, or by the text with sortBy', async () => {
    const customers = makeCustomers();
    const grid = make({ columns: [customerColumn(customers)] });
    await settle();
    grid.sort = [{ field: 'customerId', dir: 'asc' }];
    await settle();
    expect(texts(grid, 8, 'customerId')).toEqual(['Zeynep', 'Zeynep', 'Ali', 'Ali', 'Mehmet', 'Ayşe', 'Can', 'Deniz']);
    await grid.dispose();
    const byText = make({ columns: [{ ...customerColumn(customers), lookup: { dataSource: customers, valueField: 'id', textField: 'name', sortBy: 'text' } }] });
    await settle();
    byText.sort = [{ field: 'customerId', dir: 'desc' }];
    await settle();
    expect(texts(byText, 8, 'customerId')).toEqual(['Zeynep', 'Zeynep', 'Mehmet', 'Deniz', 'Can', 'Ayşe', 'Ali', 'Ali']);
    await byText.dispose();
  });

  it('sorts a server by sortField, keeping the column in the grid sort', async () => {
    type Named = Order & { customerName: string };
    class Orders extends data.ArrayAdapter<Named, number> {
      readonly loads: data.LoadOptions[] = [];
      protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Named>> {
        this.loads.push(options);
        return super.loadRows(options);
      }
    }
    const orders = new Orders({ data: makeOrders(10).map((o) => ({ ...o, customerName: NAMES[(o.customerId ?? 1) - 1] })), key: 'id' });
    const service = new Customers();
    const grid = mount(
      new DataGrid<Named>({
        rowHeight: 36,
        columns: [{ ...(customerColumn(source(service)) as unknown as GridColumn<Named>), sortField: 'customerName' }],
        dataSource: new data.DataSource<Named, number>({ adapter: orders, loadMode: 'page', pageSize: 20 }),
      }),
    );
    layout(grid);
    await settle();
    grid.sort = [{ field: 'customerId', dir: 'asc' }];
    await settle();
    expect(orders.loads.at(-1)!.sort).toEqual([{ field: 'customerName', dir: 'asc' }]);
    expect(grid.sort).toEqual([{ field: 'customerId', dir: 'asc' }]);
    expect(texts(grid, 3, 'customerId')).toEqual(['Ali', 'Ali', 'Ayşe']);
    await grid.dispose();
  });
});

describe('lookup columns: copy, paste, export, checks', () => {
  it('copies the text, or the key with copyValues raw, and exports the same way', async () => {
    const service = new Customers();
    const grid = make({ columns: [{ field: 'id', title: 'No', type: 'number' }, customerColumn(source(service))] }, makeOrders(40));
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    expect(grid.copy()).toBe('Zeynep');
    grid.settings.copyValues = 'raw';
    expect(grid.copy()).toBe('1');
    const shown = await grid.exportRows();
    expect(shown.slice(0, 3)).toEqual([
      { id: '1', customerId: 'Zeynep' },
      { id: '2', customerId: 'Ali' },
      { id: '3', customerId: 'Mehmet' },
    ]);
    expect((await grid.exportRows({ values: 'raw' }))[1]).toEqual({ id: 2, customerId: 2 });
    await grid.dispose();
  });

  it('pastes texts as keys: known ones at once, others asked from the source; none or several is a message', async () => {
    const service = new Customers([...makeCustomers(), { id: 7, name: 'Can' }]);
    const rows = makeOrders(4);
    const grid = make({ columns: [customerColumn(source(service))], settings: { editable: true }, saveMode: 'batch' }, rows);
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    expect(grid.paste('ali\nMehmet\nNobody\ncan')).toBe(4);
    await settle();
    expect(texts(grid, 2, 'customerId')).toEqual(['Ali', 'Mehmet']);
    expect(cellOf(grid, 2, 'customerId').dataset.error).toBe('Nothing in the list is called “Nobody”.');
    expect(cellOf(grid, 3, 'customerId').dataset.error).toBe('More than one item in the list is called “can”.');
    expect(grid.changes.updated.map((u) => u.changed)).toEqual([{ customerId: 2 }, { customerId: 3 }]);
    await grid.dispose();
  });

  it('does not save a row whose key the source does not have', async () => {
    const service = new Customers();
    const grid = make({
      columns: [
        customerColumn(source(service), {
          editor: (ctx) => {
            ctx.setValue(99);
            return new Component<HTMLInputElement>('input');
          },
        }),
      ],
      settings: { editable: true },
    });
    await settle();
    const cell = cellOf(grid, 0, 'customerId');
    cell.focus();
    key(cell, 'Enter');
    key(document.activeElement!, 'Enter');
    await settle();
    expect(cell.dataset.error).toBe(uiLocale.strings.gridLookupMissing);
    expect(cell.getAttribute('aria-invalid')).toBe('true');
    expect(await grid.saveChanges()).toEqual({ saved: 0, failed: 1 });
    await grid.dispose();
  });
});
