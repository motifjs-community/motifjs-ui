import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { LayoutStorage } from './layout-storage';
import { KeyedItems } from '../../parts/data/KeyedItems';

type Row = { id: number; name: string; amount: number | null; paid?: boolean };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80, editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number', width: 100 },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, amount: i * 10 }));

/** Rows of a pretend server; every load is recorded. */
class RangeAdapter extends data.DataAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];

  constructor(private readonly size: number) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: false, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    const skip = options.skip ?? 0;
    const take = Math.max(0, Math.min(options.take ?? this.size, this.size - skip));
    return { rows: makeRows(take, skip + 1), total: options.count ? this.size : undefined };
  }
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  layout(grid);
  return grid;
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const text = (grid: DataGrid<any>, i: number, field: string) => cellOf(grid, i, field).firstChild?.textContent ?? '';
const editing = () => !!(document.activeElement as HTMLElement | null)?.closest('.mx-data-grid__editor');
const drawnRows = (grid: DataGrid<any>) => grid.element.querySelectorAll('.mx-data-grid__body > .mx-data-grid__row:not([hidden])').length;
const template = (grid: DataGrid<any>) => (grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement).style.getPropertyValue('--_columns');
const header = (grid: DataGrid<any>, f: string) => grid.element.querySelector(`[role="columnheader"][data-field="${f}"]`) as HTMLElement;

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('settings', () => {
  it('sizes columns without a width by columnWidth and columnMinWidth, live; a column of its own wins', async () => {
    const grid = make({ rows: makeRows(2) });
    await settle();
    expect(grid.columnOption('name', 'width')).toBe(140);
    grid.settings.columnWidth = 200;
    await tick();
    expect(grid.columnOption('name', 'width')).toBe(200);
    expect(grid.columnOption('amount', 'width')).toBe(100);
    grid.columnOption('name', 'width', 10);
    expect(grid.columnOption('name', 'width')).toBe(48);
    grid.settings.columnMinWidth = 20;
    grid.columnOption('name', 'width', 10);
    expect(grid.columnOption('name', 'width')).toBe(20);
    await grid.dispose();
  });

  it('marks a grid with no rows to show and gives it emptyRows of room, live', async () => {
    const s = reactive({ rows: [] as Row[] });
    const grid = make({ rows: () => s.rows });
    await settle();
    expect(grid.element.dataset.state).toBe('empty');
    expect(grid.element.style.getPropertyValue('--_empty-rows')).toBe('3');
    grid.settings.emptyRows = 5;
    await tick();
    expect(grid.element.style.getPropertyValue('--_empty-rows')).toBe('5');
    s.rows = makeRows(2);
    await settle();
    expect([grid.total, grid.element.dataset.state]).toEqual([2, undefined]);
    await grid.dispose();
  });

  it('gives the row status and selection columns rowStatusWidth and selectionColumnWidth', async () => {
    const grid = make({ rows: makeRows(2), settings: { selection: 'multiple' } });
    await settle();
    expect(template(grid).startsWith('36px ')).toBe(true);
    grid.settings.selectionColumnWidth = 50;
    await tick();
    expect(template(grid).startsWith('50px ')).toBe(true);
    grid.cellValue(0, 'name', 'Changed');
    grid.settings.rowStatusWidth = 30;
    await tick();
    expect(template(grid).startsWith('30px 50px ')).toBe(true);
    await grid.dispose();
  });

  it('draws extraRows rows around the visible ones', async () => {
    const grid = make({ rows: makeRows(200) });
    await settle();
    const plain = drawnRows(grid);
    grid.settings.extraRows = 0;
    grid.repaint();
    await tick();
    expect(drawnRows(grid)).toBe(plain - 4);
    await grid.dispose();
  });

  it('waits tooltipDelay before a hovered cell shows its tooltip', async () => {
    const delays: number[] = [];
    const real = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      delays.push(ms ?? 0);
      return real(fn, ms);
    }) as typeof setTimeout);
    const grid = make({ rows: makeRows(2), settings: { tooltipDelay: 120 } });
    await settle();
    const tip = (grid as any).tip;
    const cell = cellOf(grid, 0, 'name');
    cell.dataset.error = 'Too long';
    tip.hover({ target: cell } as unknown as PointerEvent);
    expect(delays).toContain(120);
    tip.hide();
    await grid.dispose();
  });

  it('resizes with the keys by resizeStep, and by resizeFineStep with Shift', async () => {
    const grid = make({ rows: makeRows(2) });
    await settle();
    const before = grid.columnOption('amount', 'width') as number;
    vi.spyOn((grid as any).header, 'shownWidth').mockReturnValue(before);
    (grid as any).startAdjust('resize', 'amount');
    key(header(grid, 'amount'), 'ArrowRight');
    expect(grid.columnOption('amount', 'width')).toBe(before + 10);
    grid.settings.resizeStep = 25;
    grid.settings.resizeFineStep = 3;
    key(header(grid, 'amount'), 'ArrowRight');
    key(header(grid, 'amount'), 'ArrowRight', { shiftKey: true });
    expect(grid.columnOption('amount', 'width')).toBe(before + 38);
    key(header(grid, 'amount'), 'Enter');
    await grid.dispose();
  });

  it('shows pagerNeighbors pages around the current one, and the pager parts by pagerNavigation and pagerInfo', async () => {
    const grid = make({ rows: makeRows(200), mode: 'paged', pageSize: 10 });
    await settle();
    const pages = () => [...grid.element.querySelectorAll('.mx-data-grid__page')].map((b) => b.textContent);
    expect(pages()).toEqual(['1', '2', '3', '4', '20']);
    grid.page = 10;
    await tick();
    expect(pages()).toEqual(['1', '10', '11', '12', '20']);
    grid.settings.pagerNeighbors = 2;
    await tick();
    expect(pages()).toEqual(['1', '9', '10', '11', '12', '13', '20']);
    const steps = () => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__page-step')].filter((b) => !b.hidden).length;
    const info = () => !!grid.element.querySelector('.mx-data-grid__page-info');
    expect([steps(), info()]).toEqual([4, true]);
    grid.settings.pagerNavigation = false;
    grid.settings.pagerInfo = false;
    await tick();
    expect([steps(), info()]).toEqual([0, false]);
    await grid.dispose();
  });

  it('loads headerFilterPageSize values per request and makes the list headerFilterRows tall', async () => {
    const grid = make({ rows: makeRows(5), settings: { headerFilter: true } });
    await settle();
    const values = (grid as any).model.values;
    expect(values.source('name').pageSize).toBe(100);
    grid.settings.headerFilterPageSize = 25;
    expect(values.source('name').pageSize).toBe(25);
    grid.settings.headerFilterRows = 5;
    (grid as any).openHeaderFilter('name', header(grid, 'name'));
    expect((grid as any).headerFilter.list.props.height).toBe(5);
    await grid.dispose();
  });

  it('exports from a server in exportPageSize parts; the option of the call wins', async () => {
    const adapter = new RangeAdapter(2500);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 50 });
    const grid = make({ dataSource: source });
    await settle();
    const takes = () => adapter.requests.filter((r) => (r.take ?? 0) > 50).map((r) => r.take);
    await grid.exportRows();
    expect(takes()).toEqual([1000, 1000, 1000]);
    adapter.requests.length = 0;
    grid.settings.exportPageSize = 2000;
    await grid.exportRows();
    expect(takes()).toEqual([2000, 2000]);
    adapter.requests.length = 0;
    await grid.exportRows({ pageSize: 1250 });
    expect(takes()).toEqual([1250, 1250]);
    await grid.dispose();
    source.dispose();
  });

  it('reads pasted yes / no texts by trueTexts and falseTexts; a column of its own wins', async () => {
    const cols: GridColumn<Row>[] = [...columns, { field: 'paid', title: 'Paid', type: 'boolean' }];
    const rows = makeRows(3);
    const grid = make({ rows, columns: cols, settings: { editable: true } });
    await settle();
    cellOf(grid, 0, 'paid').focus();
    grid.paste('Y\nx');
    expect([grid.cellValue(0, 'paid'), grid.cellValue(1, 'paid')]).toEqual([undefined, true]);
    grid.settings.trueTexts = ['y'];
    cellOf(grid, 0, 'paid').focus();
    grid.paste('Y\nx');
    expect([grid.cellValue(0, 'paid'), grid.cellValue(1, 'paid')]).toEqual([true, true]);
    await grid.dispose();
  });

  it('opens the editor with editKeys, empties a cell with clearKeys, and starts typing by editOnKeyPress', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true }, columns: [...columns.slice(0, 2), { ...columns[2], editOnKeyPress: true }] });
    await settle();
    const cell = cellOf(grid, 0, 'name');
    cell.focus();
    key(cell, 'F2');
    expect(editing()).toBe(true);
    key(document.activeElement!, 'Escape');
    grid.settings.editKeys = ['F4'];
    key(cellOf(grid, 0, 'name'), 'F2');
    expect(editing()).toBe(false);
    key(cellOf(grid, 0, 'name'), 'F4');
    expect(editing()).toBe(true);
    key(document.activeElement!, 'Escape');

    key(cellOf(grid, 0, 'name'), 'Delete');
    await tick();
    expect(text(grid, 0, 'name')).toBe('');
    key(cellOf(grid, 0, 'name'), 'Escape');
    await tick();
    grid.settings.clearKeys = [];
    key(cellOf(grid, 0, 'name'), 'Delete');
    await tick();
    expect(text(grid, 0, 'name')).toBe('Name 1');

    grid.settings.editOnKeyPress = false;
    key(cellOf(grid, 0, 'name'), 'a');
    expect(editing()).toBe(false);
    cellOf(grid, 0, 'amount').focus();
    key(cellOf(grid, 0, 'amount'), '7');
    expect(editing()).toBe(true);
    await grid.dispose();
  });

  it('opens the editor on a double-click, or with startEditAction "click" on one click', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    const cell = () => cellOf(grid, 0, 'name');
    cell().focus();
    cell().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editing()).toBe(false);
    cell().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(editing()).toBe(true);
    key(document.activeElement!, 'Escape');
    grid.settings.startEditAction = 'click';
    cell().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(editing()).toBe(false);
    cell().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editing()).toBe(true);
    await grid.dispose();
  });

  it('keeps the layout in the layoutStorage given', async () => {
    const kept = new Map<string, string>();
    const storage: LayoutStorage = { getItem: (k) => kept.get(k) ?? null, setItem: (k, v) => void kept.set(k, v), removeItem: (k) => void kept.delete(k) };
    const grid = make({ rows: makeRows(3), layoutKey: 'orders', layoutStorage: storage });
    await settle();
    grid.sort = [{ field: 'name', dir: 'desc' }];
    expect(JSON.parse(kept.get('motifx-ui:data-grid:orders')!).sort).toEqual([{ field: 'name', dir: 'desc' }]);
    await grid.dispose();
    const again = make({ rows: makeRows(3), layoutKey: 'orders', layoutStorage: storage });
    expect(again.sort).toEqual([{ field: 'name', dir: 'desc' }]);
    await again.dispose();
  });

  it('gives a lookup its pageSize, parallelRequests and pasteSearchLimit', async () => {
    const customers = new data.DataSource<{ id: number; name: string }, number>({
      adapter: new data.ArrayAdapter({ data: [{ id: 1, name: 'Ada' }], key: 'id' }),
      loadMode: 'page',
    });
    const cols: GridColumn<Row>[] = [columns[0], columns[1], { field: 'amount', title: 'Customer', lookup: { dataSource: customers, textField: 'name', pageSize: 7, parallelRequests: 2, pasteSearchLimit: 9 } }];
    const grid = make({ rows: makeRows(2), columns: cols, settings: { editable: true } });
    await settle();
    const col = (grid as any).model.columns.get('amount');
    const items = (grid as any).model.lookups.items(col);
    expect([items.parallelRequests, items.pasteSearchLimit]).toEqual([2, 9]);
    grid.editCell(0, 'amount');
    await settle();
    expect((grid as any).editor.ownSource.pageSize).toBe(7);
    await grid.dispose();
    customers.dispose();
  });

  it("turns at most a lookup's filterSearchLimit items into keys when its header filter is searched", async () => {
    const customers = new data.DataSource<{ id: number; name: string }, number>({
      adapter: new data.ArrayAdapter({ data: [{ id: 1, name: 'Ada' }], key: 'id' }),
      loadMode: 'page',
    });
    const rows = new data.DataSource<Row, number>({ adapter: new data.ArrayAdapter({ data: makeRows(3), key: 'id' }), loadMode: 'page' });
    const lookup = { dataSource: customers, textField: 'name', searchFields: ['name'] } as NonNullable<GridColumn<Row>['lookup']>;
    const grid = make({ dataSource: rows, columns: [columns[0], { field: 'amount', title: 'Customer', lookup }] });
    await settle();
    const search = vi.spyOn(KeyedItems.prototype, 'search');
    const values = (grid as any).model.values.lookups;
    await values.inRows('amount', 'blank', 'Ada', 0, 10, new AbortController().signal);
    expect(search.mock.lastCall![3]).toBe(1000);
    lookup.filterSearchLimit = 20;
    await values.inRows('amount', 'blank', 'Ada', 0, 10, new AbortController().signal);
    expect(search.mock.lastCall![3]).toBe(20);
    await grid.dispose();
    rows.dispose();
    customers.dispose();
  });
});

describe('state and rows from code', () => {
  it('reads the status, the load error, the editing cell and the export', async () => {
    const adapter = new RangeAdapter(10);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'page', pageSize: 10 });
    const grid = make({ dataSource: source, settings: { editable: true } });
    expect(grid.status).toBe('loading');
    await settle();
    expect([grid.status, grid.loadError, grid.failedBlocks, grid.editingCell, grid.saving, grid.exporting]).toEqual(['ready', null, 0, null, false, false]);
    expect(grid.editCell(1, 'name')).toBe(true);
    expect(grid.editingCell).toMatchObject({ rowIndex: 1, field: 'name', row: { id: 2 } });
    expect(grid.closeEditCell()).toBe(true);
    expect(grid.editingCell).toBeNull();
    const running = grid.exportRows();
    expect(grid.exporting).toBe(true);
    await running;
    expect(grid.exporting).toBe(false);
    vi.spyOn(adapter as any, 'loadRows').mockRejectedValue(new Error('down'));
    grid.refresh();
    await settle();
    expect(grid.status).toBe('error');
    expect(grid.loadError?.message).toContain('down');
    await grid.dispose();
    source.dispose();
  });

  it('finds rows by key and index, reads the drawn ones, and goes to a row', async () => {
    const grid = make({ rows: makeRows(100) });
    await settle();
    expect(grid.getKeyByRowIndex(3)).toBe(4);
    expect(grid.getRowIndexByKey(50)).toBe(49);
    expect(grid.getRowIndexByKey(500)).toBe(-1);
    expect(await grid.byKey(7)).toMatchObject({ name: 'Name 7' });
    const visible = grid.getVisibleRows();
    expect(visible[0]).toMatchObject({ rowIndex: 0, rowType: 'data', key: 1, row: { id: 1 } });
    expect(grid.getRowElement(0)).toBe(rowEl(grid, 0));
    expect(grid.getCellElement(0, 'name')).toBe(cellOf(grid, 0, 'name'));
    expect(await grid.navigateToRow(60)).toBe(true);
    expect([grid.focusedRowIndex, grid.focusedRowKey]).toEqual([59, 60]);
    grid.focusedRowKey = 10;
    await tick();
    expect(grid.focusedRowIndex).toBe(9);
    grid.focusedRowIndex = 2;
    expect(grid.focusedRowKey).toBe(3);
    expect(await grid.navigateToRow(9999)).toBe(false);
    await grid.dispose();
  });

  it('reads and writes cell values as the user would', async () => {
    const rows = makeRows(3);
    const grid = make({ rows, settings: { editable: true } });
    await settle();
    expect(grid.cellValue(1, 'name')).toBe('Name 2');
    grid.cellValue(1, 'name', 'Grace');
    await settle();
    expect(rows[1].name).toBe('Grace');
    expect(text(grid, 1, 'name')).toBe('Grace');
    await grid.dispose();
  });

  it('moves the focus and opens editors from code', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    expect(grid.focusCell(2, 'amount')).toBe(true);
    expect([grid.focusedRowIndex, grid.activeField]).toEqual([2, 'amount']);
    expect(grid.editRow(1)).toBe(true);
    expect(grid.editingCell).toMatchObject({ rowIndex: 1, field: 'name' });
    expect(grid.closeEditCell()).toBe(true);
    await grid.dispose();
  });

  it('lays the rows out once for changes between beginUpdate and endUpdate', async () => {
    const rows = makeRows(3);
    const grid = make({ rows });
    await settle();
    const ready = vi.fn();
    grid.onContentReady(ready);
    grid.beginUpdate();
    rows.push(...makeRows(2, 4));
    await settle();
    grid.sort = [{ field: 'id', dir: 'desc' }];
    await settle();
    expect(ready).not.toHaveBeenCalled();
    grid.endUpdate();
    expect(ready).toHaveBeenCalledTimes(1);
    await tick();
    expect(text(grid, 0, 'id')).toBe('5');
    await grid.dispose();
  });

  it('draws the rows again with repaint', async () => {
    const grid = make({ rows: makeRows(3) });
    await settle();
    const prepared = vi.fn();
    grid.onRowPrepared(prepared);
    grid.repaint();
    await tick();
    expect(prepared.mock.calls.map(([e]) => e.rowIndex).sort()).toEqual([0, 1, 2]);
    await grid.dispose();
  });

  it('reads and writes column options', async () => {
    const grid = make({ rows: makeRows(3), settings: { groupPanel: true } });
    await settle();
    expect(grid.columnOption('name')).toMatchObject({ width: 140, visible: true, sticky: null, visibleIndex: 1, sortOrder: null, sortIndex: -1, groupIndex: -1, sortable: true });
    grid.columnOption('name', 'visible', false);
    expect(grid.columnOption('name', 'visible')).toBe(false);
    grid.columnOption('name', 'visible', true);
    grid.columnOption('amount', 'sortOrder', 'desc');
    grid.columnOption('name', 'sortIndex', 0);
    expect(grid.sort).toEqual([
      { field: 'name', dir: 'asc' },
      { field: 'amount', dir: 'desc' },
    ]);
    grid.columnOption('amount', 'visibleIndex', 0);
    expect(grid.columnOption('amount', 'visibleIndex')).toBe(0);
    grid.columnOption('name', 'sortable', false);
    expect([grid.columnOption('name', 'sortable'), grid.columnSettings('name').sortable]).toEqual([false, false]);
    grid.columnOption('id', 'groupIndex', 0);
    expect(grid.group).toEqual([{ field: 'id', dir: 'asc' }]);
    grid.columnOption('id', 'sticky', 'end');
    expect(grid.columnOption('id', 'sticky')).toBe('end');
    await grid.dispose();
  });

  it('reads the combined filter and the whole state, and puts a state back', async () => {
    const grid = make({ rows: makeRows(30), mode: 'paged', pageSize: 10, settings: { selection: 'multiple', filterRow: true } });
    await settle();
    grid.filters = { amount: { op: '>=', value: 50 } };
    await settle();
    expect(grid.getCombinedFilter()).toEqual(grid.filter);
    grid.sort = [{ field: 'name', dir: 'asc' }];
    grid.selectedKeys = [8, 9];
    grid.page = 1;
    const saved = grid.state();
    expect(saved).toMatchObject({ sort: [{ field: 'name', dir: 'asc' }], filters: { amount: { op: '>=', value: 50 } }, page: 1, selectedKeys: [8, 9], searchText: '' });
    const other = make({ rows: makeRows(30), mode: 'paged', pageSize: 10, settings: { selection: 'multiple', filterRow: true } });
    await settle();
    other.state(saved);
    await settle();
    expect([other.sort, other.filters, other.page, other.selectedKeys]).toEqual([saved.sort, saved.filters, 1, [8, 9]]);
    await grid.dispose();
    await other.dispose();
  });

  it("puts a column's own header content in place of the title", async () => {
    const cols: GridColumn<Row>[] = [columns[0], { ...columns[1], headerCell: (ctx) => {
      const el = document.createElement('b');
      el.textContent = `${ctx.title}!`;
      return el;
    } }];
    const grid = make({ rows: makeRows(2), columns: cols });
    await settle();
    expect(header(grid, 'name').querySelector('.mx-data-grid__title')!.innerHTML).toBe('<b>Name!</b>');
    expect(header(grid, 'name').getAttribute('aria-label')).toBe('Name');
    expect(header(grid, 'id').hasAttribute('aria-label')).toBe(false);
    await grid.dispose();
  });
});
