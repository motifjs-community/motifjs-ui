import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled, tick } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number | null };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80, editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, amount: i * 10 }));

/** Rows in an array whose writes are listed and can fail. */
class TestRows extends data.ArrayAdapter<Row, number> {
  readonly calls: string[] = [];
  fail: string | null = null;

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push(`update ${key} ${JSON.stringify(changes)}`);
    return this.fail ? Promise.reject(data.DataError.create('MJD202', { operation: 'update' }, this.fail)) : super.updateRow(key, changes);
  }

  protected override insertRow(values: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push(`insert ${JSON.stringify(values)}`);
    return super.insertRow(values);
  }

  protected override removeRow(key: number): Promise<void> {
    this.calls.push(`remove ${key}`);
    return super.removeRow(key);
  }
}

async function settle() {
  await settled(4);
}

function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return grid;
}

function server(rows = makeRows(4)) {
  const adapter = new TestRows({ data: rows, key: 'id', createKey: () => 100 });
  const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
  return { adapter, source, rows };
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const header = (grid: DataGrid<any>, f: string) => grid.element.querySelector(`[role="columnheader"][data-field="${f}"]`) as HTMLElement;
const editing = () => !!(document.activeElement as HTMLElement | null)?.closest('.mx-data-grid__editor');
const click = (el: Element, type = 'click', init: MouseEventInit = {}) => el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));

/** Types into a cell's editor and leaves it with a key. */
function typeInto(grid: DataGrid<any>, i: number, field: string, value: string, then = 'Enter') {
  const cell = cellOf(grid, i, field);
  cell.focus();
  key(cell, value[0]);
  const input = document.activeElement as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  key(input, then);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('pointer events', () => {
  it('tells cell and row clicks; cancel keeps the row unselected', async () => {
    const onCellClick = vi.fn();
    const grid = make({ rows: makeRows(3), settings: { selection: 'multiple' }, onCellClick });
    await settle();
    const rowClicks: number[] = [];
    let stop = false;
    grid.onRowClick((e) => {
      rowClicks.push(e.rowIndex);
      e.cancel = stop;
    });
    click(cellOf(grid, 1, 'name'));
    expect(onCellClick.mock.calls[0][0]).toMatchObject({ field: 'name', rowIndex: 1, rowType: 'data', row: { id: 2 } });
    expect([rowClicks, grid.selectedKeys]).toEqual([[1], [2]]);
    stop = true;
    click(cellOf(grid, 2, 'name'));
    expect([rowClicks, grid.selectedKeys]).toEqual([[1, 2], [2]]);
    await grid.dispose();
  });

  it('tells double-clicks; cancel keeps the editor closed', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    const cancel = grid.onCellDblClick((e) => (e.cancel = true));
    const rows = vi.fn();
    grid.onRowDblClick(rows);
    cellOf(grid, 0, 'name').focus();
    click(cellOf(grid, 0, 'name'), 'dblclick');
    expect([editing(), rows.mock.calls[0][0].rowIndex]).toEqual([false, 0]);
    cancel.dispose();
    click(cellOf(grid, 0, 'name'), 'dblclick');
    expect(editing()).toBe(true);
    await grid.dispose();
  });

  it('opens a row menu with the items onContextMenuPreparing gives, and changes the column menu', async () => {
    const grid = make({ rows: makeRows(3) });
    await settle();
    const plain = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    cellOf(grid, 0, 'name').dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(false);
    const chosen = vi.fn();
    grid.onContextMenuPreparing((e) => {
      if (e.target === 'row') e.items.push({ text: `Open ${e.row?.id}`, click: chosen });
      else if (e.field === 'amount') e.cancel = true;
      else e.items.unshift({ text: 'Mine' });
    });
    const asked = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    cellOf(grid, 1, 'name').dispatchEvent(asked);
    expect(asked.defaultPrevented).toBe(true);
    const more = (grid as any).moreMenu;
    expect(more.opened).toBe(true);
    expect(more.list.element.textContent).toContain('Open 2');
    more.close();
    const menu = (grid as any).menu;
    (grid as any).openMenu('name', (grid as any).headerAnchor('name'));
    expect(menu.list.element.querySelector('[role^="menuitem"]').textContent).toBe('Mine');
    menu.close();
    (grid as any).openMenu('amount', (grid as any).headerAnchor('amount'));
    expect(menu.opened).toBe(false);
    await grid.dispose();
  });
});

describe('drawing events', () => {
  it('tells each drawn cell and row, only while listened', async () => {
    const grid = make({ rows: makeRows(3) });
    await settle();
    const cells: string[] = [];
    const sub = grid.onCellPrepared((e) => {
      if (e.field === 'amount') {
        cells.push(`${e.rowIndex}:${e.value}`);
        e.part.element.classList.toggle('big', (e.value as number) > 5);
      }
    });
    const rows = vi.fn();
    grid.onRowPrepared(rows);
    grid.repaint();
    await tick();
    expect(cells.sort()).toEqual(['0:0', '1:10', '2:20']);
    expect(cellOf(grid, 1, 'amount').classList.contains('big')).toBe(true);
    expect(rows.mock.calls.map(([e]) => e.rowType)).toEqual(['data', 'data', 'data']);
    sub.dispose();
    cells.length = 0;
    grid.repaint();
    await tick();
    expect(cells).toEqual([]);
    await grid.dispose();
  });

  it('tells when the content is ready and when a load fails', async () => {
    const adapter = new TestRows({ data: makeRows(3), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
    const ready = vi.fn();
    const errors = vi.fn();
    const grid = make({ dataSource: source, onContentReady: ready, onDataErrorOccurred: errors });
    await settle();
    expect(ready).toHaveBeenCalled();
    expect(ready.mock.lastCall![0].total).toBe(3);
    vi.spyOn(adapter as any, 'loadRows').mockRejectedValue(new Error('offline'));
    grid.refresh();
    await settle();
    expect(errors.mock.calls[0][0]).toMatchObject({ operation: 'load' });
    await grid.dispose();
    source.dispose();
  });
});

describe('editing events', () => {
  it('asks before an editor opens', async () => {
    const grid = make({ rows: makeRows(2), settings: { editable: true } });
    await settle();
    const seen: string[] = [];
    grid.onEditingStart((e) => {
      seen.push(e.field);
      e.cancel = e.field === 'name';
    });
    expect(grid.editCell(0, 'name')).toBe(true);
    expect(editing()).toBe(false);
    grid.editCell(0, 'amount');
    expect(editing()).toBe(true);
    expect(seen).toEqual(['name', 'amount']);
    await grid.dispose();
  });

  it('asks before a new row opens: its starting and entered values, or no row', async () => {
    const grid = make({ rows: makeRows(2), settings: { editable: true, addRows: true }, newRow: { create: () => ({ amount: 1 }) } });
    await settle();
    grid.onInitNewRow((e) => {
      if (e.values.name === 'stop') e.cancel = true;
      e.data.amount = 5;
      e.values.name ??= 'Typed';
    });
    expect(await grid.addRow()).toBe(true);
    expect([grid.cellValue(2, 'amount'), grid.cellValue(2, 'name')]).toEqual([5, 'Typed']);
    grid.discardChanges();
    await tick();
    expect(await grid.addRow({ name: 'stop' })).toBe(false);
    expect(grid.total).toBe(2);
    await grid.dispose();
  });

  it('tells each save: before (change what is sent, keep a row back) and after', async () => {
    const { adapter, source } = server();
    const grid = make({ dataSource: source, settings: { editable: true, addRows: true }, saveMode: 'batch' });
    await settle();
    const log: string[] = [];
    grid.onSaving((e) => log.push(`saving ${e.changes.length}`));
    grid.onRowUpdating((e) => {
      if (e.key === 2) e.cancel = true;
      else e.changes.amount = 99;
    });
    grid.onRowUpdated((e) => log.push(`updated ${e.key}`));
    grid.onRowInserting((e) => log.push(`inserting ${e.data.name}`));
    grid.onRowInserted((e) => log.push(`inserted ${e.key}`));
    grid.onRowRemoving((e) => log.push(`removing ${e.key}`));
    grid.onRowRemoved((e) => log.push(`removed ${e.key}`));
    grid.onSaved((e) => log.push(`saved ${e.saved} failed ${e.failed}`));
    grid.cellValue(0, 'name', 'A');
    grid.cellValue(1, 'name', 'B');
    await grid.deleteRow(source.rows[3]);
    await grid.addRow({ name: 'New' });
    await grid.saveChanges();
    expect(adapter.calls).toEqual(['remove 4', 'update 1 {"name":"A","amount":99}', 'insert {"name":"New"}']);
    expect(log).toEqual(['saving 4', 'removing 4', 'inserting New', 'removed 4', 'updated 1', 'inserted 100', 'saved 3 failed 0']);
    expect(grid.cellValue(1, 'name')).toBe('B');
    expect(grid.hasChanges).toBe(true);
    grid.onSaving((e) => (e.cancel = true));
    await grid.saveChanges();
    expect(adapter.calls).toHaveLength(3);
    await grid.dispose();
    source.dispose();
  });

  it('tells a failed save as a data error with its row', async () => {
    const { adapter, source, rows } = server();
    adapter.fail = 'Locked';
    const errors = vi.fn();
    const grid = make({ dataSource: source, settings: { editable: true }, saveMode: 'batch', onDataErrorOccurred: errors });
    await settle();
    grid.cellValue(0, 'name', 'X');
    await grid.saveChanges();
    expect(errors.mock.calls[0][0]).toMatchObject({ operation: 'save', row: rows[0] });
    expect(errors.mock.calls[0][0].error.plainMessage).toBe('Locked');
    await grid.dispose();
    source.dispose();
  });

  it('asks before unsaved changes are dropped (Escape, discardChanges)', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    let keep = true;
    const dropped = vi.fn();
    grid.onEditCanceling((e) => (e.cancel = keep));
    grid.onEditCanceled(dropped);
    typeInto(grid, 0, 'name', 'Draft');
    await tick();
    key(cellOf(grid, 0, 'name'), 'Escape');
    expect(grid.cellValue(0, 'name')).toBe('Draft');
    grid.discardChanges();
    expect(grid.hasChanges).toBe(true);
    keep = false;
    grid.discardChanges();
    expect(grid.hasChanges).toBe(false);
    expect(dropped.mock.calls[0][0].rows).toHaveLength(1);
    await grid.dispose();
  });
});

describe('focus, keys, settings', () => {
  it('asks before the active cell and row move, and tells after', async () => {
    const grid = make({ rows: makeRows(4) });
    await settle();
    const changed: string[] = [];
    grid.onFocusedCellChanged((e) => changed.push(`cell ${e.rowIndex} ${e.field}`));
    grid.onFocusedRowChanged((e) => changed.push(`row ${e.rowIndex} ${e.key}`));
    let block = false;
    grid.onFocusedRowChanging((e) => (e.cancel = block && e.rowIndex === 2));
    cellOf(grid, 0, 'name').focus();
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    expect(grid.focusedRowIndex).toBe(1);
    block = true;
    key(cellOf(grid, 1, 'name'), 'ArrowDown');
    expect(grid.focusedRowIndex).toBe(1);
    key(cellOf(grid, 1, 'name'), 'ArrowRight');
    expect(changed).toEqual(['cell 0 name', 'cell 1 name', 'row 1 2', 'cell 1 amount']);
    const stay = grid.onFocusedCellChanging((e) => (e.cancel = true));
    key(cellOf(grid, 1, 'amount'), 'ArrowLeft');
    expect(grid.activeField).toBe('amount');
    stay.dispose();
    await grid.dispose();
  });

  it('lets the app take a key before the grid handles it', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    const keys: string[] = [];
    grid.onKeyHandling((e) => {
      keys.push(e.event.key);
      e.cancel = e.event.key === 'F2';
    });
    cellOf(grid, 0, 'name').focus();
    key(cellOf(grid, 0, 'name'), 'F2');
    expect(editing()).toBe(false);
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    expect(grid.focusedRowIndex).toBe(1);
    expect(keys).toEqual(['F2', 'ArrowDown']);
    await grid.dispose();
  });

  it('tells every setting assigned, of the grid, a column and the toolbar', async () => {
    const onOptionChanged = vi.fn();
    const grid = make({ rows: makeRows(2), onOptionChanged });
    await settle();
    grid.settings.striped = true;
    grid.columnSettings('name').sortable = false;
    grid.toolbar.visible = false;
    expect(onOptionChanged.mock.calls.map(([e]) => e)).toEqual([
      { name: 'striped', value: true, previous: false },
      { name: 'sortable', field: 'name', value: false, previous: undefined },
      { name: 'toolbar.visible', value: false, previous: undefined },
    ]);
    await grid.dispose();
  });

  it('lets the toolbar be changed while it is laid out', async () => {
    const grid = make({
      rows: makeRows(2),
      settings: { searchPanel: true },
      onToolbarPreparing: (e) => e.items.unshift({ text: 'Refresh', click: () => grid.refresh() }),
    });
    await settle();
    const bar = grid.element.querySelector('.mx-data-grid__toolbar')!;
    expect(bar.textContent).toContain('Refresh');
    expect(bar.querySelector('.mx-data-grid__search')).not.toBeNull();
    await grid.dispose();
  });
});

describe('query events', () => {
  it('asks before the selection changes', async () => {
    const grid = make({ rows: makeRows(3), settings: { selection: 'multiple' } });
    await settle();
    grid.selectedKeys = [1];
    const stop = grid.onSelectionChanging((e) => (e.cancel = e.selection.keys.includes(3)));
    grid.selectRow(grid.dataSource.rows[1], true);
    grid.selectRow(grid.dataSource.rows[2], true);
    expect(grid.selectedKeys).toEqual([1, 2]);
    grid.selectAll();
    expect(grid.selection.all).toBe(true);
    stop.dispose();
    await grid.dispose();
  });

  it('asks before the sort, the filters, the page and the search text change, and tells after', async () => {
    const grid = make({ rows: makeRows(40), mode: 'paged', pageSize: 10, settings: { filterRow: true } });
    await settle();
    const log: string[] = [];
    grid.onSortChanging((e) => (e.cancel = e.sort[0]?.dir === 'desc'));
    grid.onSortChanged((e) => log.push(`sort ${e.sort.map((s) => s.dir)}`));
    click(header(grid, 'name'));
    click(header(grid, 'name'));
    expect(grid.sort).toEqual([{ field: 'name', dir: 'asc' }]);

    grid.onFilterChanging((e) => (e.cancel = e.filters.amount?.value === 0));
    grid.onFilterChanged((e) => log.push(`filter ${JSON.stringify(e.filters)}`));
    grid.filters = { amount: { op: '>', value: 100 } };
    await settle();
    grid.filters = { amount: { op: '>', value: 0 } };
    await settle();
    expect(grid.filters).toEqual({ amount: { op: '>', value: 100 } });

    grid.onPageChanging((e) => (e.cancel = e.page === 2));
    grid.onPageChanged((e) => log.push(`page ${e.page}`));
    grid.page = 1;
    grid.page = 2;
    expect(grid.page).toBe(1);

    grid.onSearchTextChanging((e) => (e.cancel = e.text === 'no'));
    grid.searchByText('no');
    expect(grid.searchText).toBe('');
    grid.searchByText('Name 2');
    expect(grid.searchText).toBe('Name 2');
    expect(log).toEqual(['sort asc', 'filter {"amount":{"op":">","value":100}}', 'page 1']);
    await grid.dispose();
  });

  it('asks before a layout change by the user is kept, and puts the one before back', async () => {
    const grid = make({ rows: makeRows(3) });
    await settle();
    const after = vi.fn();
    grid.onLayoutChange(after);
    const stop = grid.onLayoutChanging((e) => (e.cancel = true));
    (grid as any).startAdjust('move', 'name');
    key(header(grid, 'name'), 'ArrowRight');
    key(header(grid, 'name'), 'Enter');
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['id', 'name', 'amount']);
    expect(after).not.toHaveBeenCalled();
    stop.dispose();
    (grid as any).startAdjust('move', 'name');
    key(header(grid, 'name'), 'ArrowRight');
    key(header(grid, 'name'), 'Enter');
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['id', 'amount', 'name']);
    expect(after).toHaveBeenCalledTimes(1);
    await grid.dispose();
  });
});

describe('clipboard and export events', () => {
  it('lets copy and paste be changed or stopped', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    cellOf(grid, 0, 'name').focus();
    const copy = grid.onCopying((e) => (e.text = `[${e.text}]`));
    expect(grid.copy()).toBe('[Name 1]');
    copy.dispose();
    grid.onCopying((e) => (e.cancel = true));
    expect(grid.copy()).toBe('');
    const paste = grid.onPasting((e) => (e.text = e.text.toUpperCase()));
    expect(grid.paste('ada')).toBe(1);
    expect(grid.cellValue(0, 'name')).toBe('ADA');
    paste.dispose();
    grid.onPasting((e) => (e.cancel = true));
    expect(grid.paste('x')).toBe(0);
    await grid.dispose();
  });

  it('lets an export be changed or stopped, and tells when it is done', async () => {
    const grid = make({ rows: makeRows(3) });
    await settle();
    const done = vi.fn();
    grid.onExported(done);
    let stop = false;
    grid.onExporting((e) => {
      e.cancel = stop;
      e.options = { ...e.options, values: 'raw' };
    });
    expect((await grid.exportRows())[1]).toEqual({ id: 2, name: 'Name 2', amount: 10 });
    expect(done.mock.calls[0][0]).toEqual({ format: 'rows', rows: 3 });
    const csv = await grid.exportCsv({ download: false, bom: false });
    expect(csv.split('\r\n')[1]).toBe('1,Name 1,0');
    expect(done.mock.calls[1][0]).toMatchObject({ format: 'csv', rows: 3 });
    stop = true;
    expect(await grid.exportRows()).toEqual([]);
    expect(await grid.exportCsv({ download: false })).toBe('');
    await grid.dispose();
  });
});
