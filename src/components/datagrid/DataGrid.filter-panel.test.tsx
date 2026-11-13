import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; city: string | null; qty: number; paid: boolean; day: string; stateId: number };

const states = [
  { id: 1, title: 'Open' },
  { id: 2, title: 'Closed' },
];

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', filterBuilder: false },
  { field: 'name', title: 'Name' },
  { field: 'city', title: 'City', type: 'list', options: [{ value: 'Ankara', label: 'ANK' }, 'Bursa', 'İzmir'] },
  { field: 'qty', title: 'Qty', type: 'number' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'day', title: 'Day', type: 'date' },
  { field: 'stateId', title: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'title' } },
];

const CITIES = ['Ankara', 'Bursa', 'İzmir', null];
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Name ${i + 1}`,
    city: CITIES[(i + 1) % 4],
    qty: (i + 1) * 10,
    paid: (i + 1) % 2 === 0,
    day: `2026-01-${String(((i + 1) % 28) + 1).padStart(2, '0')}`,
    stateId: 1 + (i % 2),
  }));

class ServerAdapter extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const grids: DataGrid<any>[] = [];

afterEach(async () => {
  for (const g of grids.splice(0)) if (!g.isDisposed) await g.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
  localStorage.clear();
  uiLocale.strings = enStrings;
});

async function settle() {
  await settled(6);
}

async function make(props: Partial<DataGridProps<Row>> = {}, settings: Record<string, unknown> = {}) {
  const grid = mount(
    new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(12), locale: 'en-US', ...props, settings: { filterRow: true, headerFilter: true, filterDelay: 0, filterPanel: true, ...settings } } as DataGridProps<Row>),
  );
  grids.push(grid);
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 600 });
  (grid as any).measure();
  await settle();
  return grid;
}

const panel = (g: DataGrid<any>) => g.element.querySelector('.mx-data-grid__filter-panel') as HTMLElement;
const panelText = (g: DataGrid<any>) => panel(g).querySelector('.mx-data-grid__filter-text') as HTMLButtonElement;
const check = (g: DataGrid<any>) => panel(g).querySelector('.mx-data-grid__filter-enabled input') as HTMLInputElement;
const clear = (g: DataGrid<any>) => panel(g).querySelector('.mx-data-grid__filter-clear') as HTMLButtonElement;
const filterInput = (g: DataGrid<any>, f: string) => g.element.querySelector(`.mx-data-grid__filter-cell[data-field="${f}"] input`) as HTMLInputElement;
const window_ = () => document.querySelector('dialog.mx-data-grid__filter-window[open]') as HTMLDialogElement | null;
const dialogButton = (text: string) => [...window_()!.querySelectorAll('button')].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;
const type = (el: HTMLInputElement, text: string) => {
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('DataGrid filter panel', () => {
  it('shows only with settings.filterPanel, with "Create Filter" while there is no filter', async () => {
    const off = await make({}, { filterPanel: false });
    expect(panel(off).hidden).toBe(true);
    const g = await make();
    expect(panel(g).hidden).toBe(false);
    expect(panel(g).getAttribute('role')).toBe('group');
    expect(panelText(g).textContent).toBe('Create Filter');
    // Hidden parts leave the page.
    expect(clear(g)).toBeNull();
    expect(panel(g).querySelector('.mx-data-grid__filter-enabled')).toBeNull();
  });

  it('reads the filter value with the columns\' titles, formats, list and lookup texts', async () => {
    const g = await make({
      filterValue: data.and(
        data.where('city', '=', 'Ankara'),
        data.where('qty', '>', 1000),
        data.where('stateId', 'in', [2]),
        data.or(data.where('paid', '=', true), data.where('name', 'startswith', 'N')),
      ),
    });
    expect(g.filterText).toBe("[City] Equals 'ANK' And [Qty] Is greater than '1,000' And [State] Is any of('Closed') And ([Paid] Equals 'Yes' Or [Name] Starts with 'N')");
    expect(panelText(g).textContent).toBe(g.filterText);
    expect(panelText(g).getAttribute('aria-label')).toBe(`Edit the filter: ${g.filterText}`);
    expect(clear(g)).not.toBeNull();
    const custom = await make({ filterValue: data.where('qty', '<', 5), filterPanelText: (e) => `Filter: ${e.text}` });
    expect(panelText(custom).textContent).toBe("Filter: [Qty] Is less than '5'");
  });

  it('keeps the filter row and the header filters in step with the filter value, both ways', async () => {
    const g = await make({ filterValue: data.and(data.where('name', 'contains', '1'), data.where('city', 'in', ['Bursa', 'İzmir']), data.where('name', 'endswith', '0')) });
    // The first condition on a column goes to its cell, the header filter takes `in`; a second one stays in the value.
    expect(filterInput(g, 'name').value).toBe('1');
    expect(g.filters.city).toEqual({ values: ['Bursa', 'İzmir'] });
    expect(g.filterValue).toEqual(data.and(data.where('name', 'contains', '1'), data.where('city', 'in', ['Bursa', 'İzmir']), data.where('name', 'endswith', '0')));
    expect(g.total).toBe(1);
    // The filter row's change reads in the panel.
    type(filterInput(g, 'qty'), '100');
    await settle();
    expect(g.filterValue).toEqual(data.and(data.where('name', 'contains', '1'), data.where('city', 'in', ['Bursa', 'İzmir']), data.where('qty', '=', 100), data.where('name', 'endswith', '0')));
    expect(panelText(g).textContent).toContain("[Qty] Equals '100'");
    // An OR group no column can show stays in the value only.
    g.filterValue = data.or(data.where('city', '=', 'Ankara'), data.where('paid', '=', true));
    await settle();
    expect(filterInput(g, 'name').value).toBe('');
    expect(g.filters).toEqual({});
    expect(g.total).toBe(6);
    // A date chosen as a day filters by the day, and stays a day in the value.
    g.filterValue = data.where('day', '=', new Date(2026, 0, 5));
    await settle();
    expect(g.filters.day).toEqual({ op: '=', value: new Date(2026, 0, 5) });
    expect(g.filterValue).toEqual(data.where('day', '=', new Date(2026, 0, 5)));
    expect(g.total).toBe(1);
  });

  it('reads the header filters into the filter value and back, values left out too', async () => {
    const g = await make();
    g.columnOption('city', { filterValues: ['Ankara', null], filterType: 'exclude' });
    await settle();
    const value = g.filterValue;
    expect(value).toEqual(data.not(data.or(data.where('city', 'in', ['Ankara']), data.where('city', 'isblank'))!));
    expect(g.filterText).toBe("Not ([City] Is any of('ANK') Or [City] Is blank)");
    // The same part given back goes to the header filter again, not to the value's own conditions.
    g.filterValue = null;
    await settle();
    expect(g.filters).toEqual({});
    g.filterValue = value;
    await settle();
    expect(g.filters.city).toEqual({ values: ['Ankara', null], filterType: 'exclude' });
    g.filterValue = data.where('city', 'notin', ['Bursa']);
    await settle();
    expect(g.filters.city).toEqual({ values: ['Bursa'], filterType: 'exclude' });
    expect(g.total).toBe(9);
  });

  it('keeps the filter value apart from the columns without filterSyncEnabled', async () => {
    const g = await make({ filterValue: data.where('qty', '<=', 60) }, { filterSyncEnabled: false });
    expect(g.filters).toEqual({});
    type(filterInput(g, 'name'), 'Name 1');
    await settle();
    expect(g.filterValue).toEqual(data.where('qty', '<=', 60));
    expect(g.total).toBe(1);
    g.settings.filterSyncEnabled = true;
    await settle();
    expect(g.filterValue).toEqual(data.and(data.where('name', 'contains', 'Name 1'), data.where('qty', '<=', 60)));
  });

  it('turns the filter value off and on with its check box; a new filter turns it on', async () => {
    const changes: boolean[] = [];
    const g = await make({ filterValue: data.where('paid', '=', true), onFilterChanged: (e) => void changes.push(e.filterEnabled) });
    expect(g.total).toBe(6);
    expect(check(g).checked).toBe(true);
    check(g).click();
    await settle();
    expect(g.filterEnabled).toBe(false);
    expect(g.total).toBe(12);
    expect(panel(g).hasAttribute('data-off')).toBe(true);
    // With sync the filter row's part goes off with it.
    expect(g.filter).toBeNull();
    check(g).click();
    await settle();
    expect(g.total).toBe(6);
    g.filterEnabled = false;
    await settle();
    type(filterInput(g, 'name'), 'Name 2');
    await settle();
    expect(g.filterEnabled).toBe(true);
    expect(changes).toEqual([false, true, false, true]);
  });

  it('opens the builder in a modal window from the panel: OK filters, Cancel leaves it', async () => {
    const log: string[] = [];
    const g = await make({
      onFilterBuilderOpening: () => void log.push('opening'),
      onFilterBuilderOpened: (e) => void log.push(`opened ${e.builder.fields.map((f) => f.dataField).join(',')}`),
      onFilterBuilderClosing: (e) => void log.push(`closing ${e.apply}`),
      onFilterBuilderClosed: (e) => void log.push(`closed ${e.applied}`),
      filterBuilderPopup: { title: 'Orders filter' },
    });
    panelText(g).click();
    await settle();
    expect(window_()).not.toBeNull();
    expect(window_()!.textContent).toContain('Orders filter');
    const builder = g.filterBuilderInstance!;
    // Hidden or not, every column but the one turned off is a field; "is any of" for each.
    expect(log).toEqual(['opening', 'opened name,city,qty,paid,day,stateId']);
    expect(builder.model.operations(builder.model.field('qty')!)).toContain('in');
    const c = builder.addCondition(builder.root, 'qty')!;
    builder.setOperation(c, '>');
    builder.setConditionValue(c, 90);
    dialogButton('OK').click();
    await settle();
    expect(window_()).toBeNull();
    expect(g.filterValue).toEqual(data.where('qty', '>', 90));
    expect(g.total).toBe(3);
    expect(panelText(g).textContent).toBe("[Qty] Is greater than '90'");
    // Synced: the condition shows in the filter row.
    expect(filterInput(g, 'qty').value).toBe('90');
    // Cancel leaves the filter as it was.
    g.openFilterBuilder();
    await settle();
    g.filterBuilderInstance!.clear();
    dialogButton('Cancel').click();
    await settle();
    expect(g.filterValue).toEqual(data.where('qty', '>', 90));
    expect(log.slice(2)).toEqual(['closing true', 'closed true', 'opening', 'opened name,city,qty,paid,day,stateId', 'closing false', 'closed false']);
  });

  it('lets the events keep the builder closed or open, and the filter as it was', async () => {
    const s = reactive({ open: false, close: false, apply: true });
    const g = await make({
      onFilterBuilderOpening: (e) => (e.cancel = !s.open),
      onFilterBuilderClosing: (e) => (e.cancel = !s.close),
      onFilterChanging: (e) => (e.cancel = !s.apply),
      filterValue: data.where('paid', '=', false),
    });
    expect(g.openFilterBuilder()).toBe(false);
    expect(window_()).toBeNull();
    s.open = true;
    expect(g.openFilterBuilder()).toBe(true);
    await settle();
    g.filterBuilderInstance!.clear();
    expect(g.closeFilterBuilder(true)).toBe(false);
    expect(window_()).not.toBeNull();
    s.close = true;
    s.apply = false;
    expect(g.closeFilterBuilder(true)).toBe(true);
    await settle();
    // onFilterChanging put the filter back.
    expect(g.filterValue).toEqual(data.where('paid', '=', false));
    expect(panelText(g).textContent).toBe("[Paid] Equals 'No'");
    expect(g.total).toBe(6);
  });

  it('clears the filter value and, with sync, the columns\' filters; the search stays', async () => {
    const g = await make({ filterValue: data.and(data.where('name', 'contains', 'Name'), data.or(data.where('qty', '<', 30), data.where('qty', '>', 100))), searchText: '1' }, { searchPanel: true });
    expect(filterInput(g, 'name').value).toBe('Name');
    clear(g).click();
    await settle();
    expect(g.filterValue).toBeNull();
    expect(filterInput(g, 'name').value).toBe('');
    expect(g.searchText).toBe('1');
    expect(panelText(g).textContent).toBe('Create Filter');
  });

  it('follows a filterValue function and reports the user\'s changes', async () => {
    const s = reactive({ filter: data.where('qty', '<', 40) as data.FilterExpression | null });
    const g = await make({ filterValue: () => s.filter, onFilterChanged: (e) => (s.filter = e.filterValue) });
    expect(g.total).toBe(3);
    s.filter = data.where('qty', '>=', 100);
    await settle();
    expect(g.total).toBe(3);
    expect(filterInput(g, 'qty').value).toBe('100');
    type(filterInput(g, 'name'), 'Name 11');
    await settle();
    expect(s.filter).toEqual(data.and(data.where('qty', '>=', 100), data.where('name', 'contains', 'Name 11')));
  });

  it('sends the filter value to a server as a data-layer filter, dates by the day', async () => {
    const adapter = new ServerAdapter({ data: makeRows(40), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 20 });
    const g = await make({ dataSource: source, rows: undefined, filterValue: data.or(data.where('day', '=', new Date(2026, 0, 3)), data.where('city', 'isblank')) });
    const last = adapter.requests[adapter.requests.length - 1];
    const sent = last.filter as { or: data.FilterCondition[] };
    expect(sent.or[0].op).toBe('between');
    expect((sent.or[0].value as Date[])[0]).toEqual(new Date(2026, 0, 3));
    expect(sent.or[1]).toEqual(data.where('city', 'isblank'));
    expect(g.total).toBe(12);
  });

  it('keeps the filter value and its check box with the layout and in state()', async () => {
    const g = await make({ layoutKey: 'panel', filterValue: data.or(data.where('day', '>', new Date(2026, 0, 20)), data.where('paid', '=', true)) });
    g.filterEnabled = false;
    await settle();
    const kept = JSON.parse(localStorage.getItem([...Object.keys(localStorage)].find((k) => k.includes('panel'))!)!);
    expect(kept.filterEnabled).toBe(false);
    expect(kept.filterValue.or).toHaveLength(2);
    await g.dispose();
    const again = await make({ layoutKey: 'panel' });
    expect(again.filterEnabled).toBe(false);
    expect(again.filterValue).toEqual(data.or(data.where('day', '>', new Date(2026, 0, 20)), data.where('paid', '=', true)));
    const state = again.state();
    expect(state.filterValue).toEqual(again.filterValue);
    const other = await make();
    other.state(state);
    await settle();
    expect(other.filterValue).toEqual(again.filterValue);
    expect(other.filterEnabled).toBe(false);
  });

  it('takes the builder\'s props and texts from the grid, live', async () => {
    const g = await make({ filterBuilder: { maxGroupLevel: 0, groupOperations: ['and', 'or'] }, texts: { filterBuilderAnd: 'AND' } });
    g.openFilterBuilder();
    await settle();
    const b = g.filterBuilderInstance!;
    expect(b.addGroup()).toBeNull();
    expect(b.groupOperations).toEqual(['and', 'or']);
    expect(b.treePart!.element.querySelector('[data-part="group"] .mx-button__face')!.textContent).toContain('AND');
    g.filterBuilder.maxGroupLevel = 1;
    await settle();
    expect(b.addGroup()).not.toBeNull();
    g.closeFilterBuilder();
  });
});
