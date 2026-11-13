import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { measureNow, whenMeasured } from '../../core/measure';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridCellSelectionChangedEventArgs } from './grid-cell-selection-changed-event-args';
import type { GridColumn } from './grid-column';
import type { GridSelectionChangedEventArgs } from './grid-selection-changed-event-args';

type Row = { id: number; name: string; amount: number; city: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
  { field: 'city', title: 'City' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: (i + 1) * 10, city: i % 2 ? 'Izmir' : 'Ankara' }));

const ROW = 36;
const HEAD = 36;
const COL = 100;
const PLACE = { left: 0, top: 100, width: 600, height: 400 };
/** The grid of each viewport, for the layout. */
const grids = new WeakMap<HTMLElement, DataGrid<any>>();

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
const px = (text: string, re: RegExp) => Number(re.exec(text)?.[1] ?? 0);

/** A layout for jsdom: the viewport where `PLACE` says, the header on top, rows where their transform puts them, columns 100 px wide in display order. */
function layout(this: HTMLElement): DOMRect {
  const vp = this.closest('.mx-data-grid__viewport') as HTMLElement | null;
  const grid = vp ? grids.get(vp) : undefined;
  if (!vp || !grid) return rect(0, 0, 0, 0);
  const at = PLACE;
  if (this === vp) return rect(at.left, at.top, at.width, at.height);
  if (this.classList.contains('mx-data-grid__head')) return rect(at.left, at.top, at.width, HEAD);
  const bodyTop = at.top + HEAD - vp.scrollTop;
  if (this.classList.contains('mx-data-grid__body')) return rect(at.left, bodyTop, at.width, 10_000);
  const visible: string[] = (grid as any).model.columns.visible();
  const x = (el: HTMLElement) => at.left + Math.max(0, visible.indexOf(el.dataset.field ?? '')) * COL - vp.scrollLeft;
  if (this.classList.contains('mx-data-grid__header-cell')) return rect(x(this), at.top, COL, HEAD);
  const row = this.closest('.mx-data-grid__body > *') as HTMLElement | null;
  if (!row) return rect(0, 0, 0, 0);
  const top = bodyTop + px(row.style.transform, /translateY\((-?[\d.]+)px\)/);
  return this === row ? rect(at.left, top, at.width, ROW) : rect(x(this), top, COL, ROW);
}

async function settle() {
  await settled(4);
}

async function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: ROW, locale: 'en-US', label: 'Orders', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  let left = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, Math.min(10_000, v))) });
  Object.defineProperty(vp, 'scrollLeft', { configurable: true, get: () => left, set: (v: number) => (left = Math.max(0, Math.min(300, v))) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => PLACE.height - HEAD });
  // The edge scroll reads the room it scrolls and how far it can go.
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => PLACE.width });
  Object.defineProperty(vp, 'scrollHeight', { configurable: true, get: () => 10_000 + PLACE.height - HEAD });
  Object.defineProperty(vp, 'scrollWidth', { configurable: true, get: () => 300 + PLACE.width });
  grids.set(vp, grid);
  lastGrid = grid;
  (grid as any).measure();
  await settle();
  return grid;
}

const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
/** The middle of a cell on the screen. */
const point = (grid: DataGrid<any>, i: number, field: string) => {
  const r = cellOf(grid, i, field).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** The grid made last: a drag draws with the window's next measuring round, run at once after each pointer event. */
let lastGrid: DataGrid<any> | null = null;

function pointer(type: string, target: EventTarget, x: number, y: number, init: MouseEventInit = {}) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, ...init });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  target.dispatchEvent(e);
  if (lastGrid && !lastGrid.isDisposed) measureNow(lastGrid);
  return e;
}

/** Presses on a cell, moves over the cells given (past the threshold), and lets go on the last. */
async function drag(grid: DataGrid<any>, from: [number, string], over: [number, string][], init: MouseEventInit = {}, release = true) {
  const start = point(grid, ...from);
  pointer('pointerdown', cellOf(grid, ...from), start.x, start.y, init);
  for (const to of over) {
    const p = point(grid, ...to);
    pointer('pointermove', document.body, p.x, p.y + 1, init);
    // The selection follows the pointer at each frame of the window.
    await whenMeasured(grid);
  }
  if (!release) return settle();
  const end = over.length ? point(grid, ...over[over.length - 1]) : start;
  pointer('pointerup', document.body, end.x, end.y, init);
  pointer('click', cellOf(grid, ...(over[over.length - 1] ?? from)), end.x, end.y, init);
  await settle();
}

const click = async (grid: DataGrid<any>, i: number, field: string, init: MouseEventInit = {}) => {
  const cell = cellOf(grid, i, field);
  cell.focus();
  const p = point(grid, i, field);
  pointer('pointerdown', cell, p.x, p.y, init);
  pointer('pointerup', cell, p.x, p.y, init);
  pointer('click', cell, p.x, p.y, init);
  await settle();
};
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const active = () => document.activeElement as HTMLElement;
const marks = (grid: DataGrid<any>, i: number) => [...rowEl(grid, i).querySelectorAll('[data-range]')].map((c) => `${(c as HTMLElement).dataset.field}:${(c as HTMLElement).dataset.range}`);
const said = async (grid: DataGrid<any>) => {
  await settle();
  return grid.element.querySelector('.mx-data-grid__live')?.textContent ?? '';
};

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(layout);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('DataGrid: selecting rows by dragging', () => {
  it('selects the rows passed, live, once per change, told as a drag; a short move stays a click', async () => {
    const grid = await make({ rows: makeRows(10), settings: { selection: 'multiple' } });
    const changes: GridSelectionChangedEventArgs[] = [];
    grid.onSelectionChanged((e) => changes.push(e));
    await drag(grid, [1, 'name'], [[2, 'name'], [3, 'name'], [3, 'city'], [4, 'name']], {}, false);
    expect(grid.selectedKeys).toEqual([2, 3, 4, 5]);
    // No text is selected meanwhile: the rows cancel their own selectstart and are marked unselectable.
    const body = grid.element.querySelector('.mx-data-grid__body')!;
    const selecting = new Event('selectstart', { bubbles: true, cancelable: true });
    cellOf(grid, 3, 'name').dispatchEvent(selecting);
    expect([selecting.defaultPrevented, body.hasAttribute('data-drag-select')]).toEqual([true, true]);
    expect(rowEl(grid, 2).hasAttribute('data-selected')).toBe(true);
    expect([cellOf(grid, 1, 'mx:select').dataset.run, cellOf(grid, 1, 'id').dataset.run, cellOf(grid, 4, 'city').dataset.run]).toEqual(['top start', 'top', 'bottom end']);
    // Let go where the pointer is: the selection ends at the place the release reports.
    const last = point(grid, 4, 'name');
    pointer('pointerup', document.body, last.x, last.y + 1);
    await settle();
    expect(cellOf(grid, 2, 'id').hasAttribute('data-run')).toBe(false);
    expect(body.hasAttribute('data-drag-select')).toBe(false);
    const after = new Event('selectstart', { bubbles: true, cancelable: true });
    cellOf(grid, 3, 'name').dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
    // The press, then rows 3, 4 and 5: one change each, all by dragging.
    expect(changes.map((c) => [c.selection.keys.length, c.byDrag])).toEqual([[1, true], [2, true], [3, true], [4, true]]);
    expect(await said(grid)).toBe('4 rows selected');
    // A move inside the threshold is a click: only that row.
    const p = point(grid, 6, 'name');
    pointer('pointerdown', cellOf(grid, 6, 'name'), p.x, p.y);
    pointer('pointermove', document.body, p.x + 2, p.y + 2);
    pointer('pointerup', document.body, p.x + 2, p.y + 2);
    pointer('click', cellOf(grid, 6, 'name'), p.x, p.y);
    expect(grid.selectedKeys).toEqual([7]);
  });

  it('adds the run with Ctrl, goes from the anchor with Shift, and paints the check boxes', async () => {
    const grid = await make({ rows: makeRows(10), settings: { selection: 'multiple' } });
    await drag(grid, [0, 'name'], [[1, 'name']]);
    await drag(grid, [4, 'name'], [[5, 'name']], { ctrlKey: true });
    expect(grid.selectedKeys).toEqual([1, 2, 5, 6]);
    await drag(grid, [7, 'name'], [[8, 'name']], { shiftKey: true });
    // From the anchor (row 4) to row 8, on top of what was selected before the anchor.
    expect(grid.selectedKeys.sort((a, b) => (a as number) - (b as number))).toEqual([1, 2, 5, 6, 7, 8, 9]);
    // Over the check boxes the rows passed take the state the first one takes: off here.
    await drag(grid, [5, 'mx:select'], [[6, 'mx:select'], [7, 'mx:select']]);
    expect(grid.selectedKeys.sort((a, b) => (a as number) - (b as number))).toEqual([1, 2, 5, 9]);
    await drag(grid, [2, 'mx:select'], [[3, 'mx:select']]);
    expect(grid.selectedKeys.sort((a, b) => (a as number) - (b as number))).toEqual([1, 2, 3, 4, 5, 9]);
  });

  it('can be cancelled by onSelectionChanging, given up with Escape, and turned off', async () => {
    const grid = await make({ rows: makeRows(10), settings: { selection: 'multiple' } });
    grid.selectedKeys = [9];
    const stop = grid.onSelectionChanging((e) => (e.cancel = e.byDrag && e.selection.keys.length > 2));
    await drag(grid, [0, 'name'], [[1, 'name'], [2, 'name'], [3, 'name']]);
    expect(grid.selectedKeys).toEqual([1, 2]);
    stop.dispose();
    await drag(grid, [0, 'name'], [[1, 'name'], [2, 'name']], {}, false);
    expect(grid.selectedKeys).toEqual([1, 2, 3]);
    key(document.body, 'Escape');
    expect(grid.selectedKeys).toEqual([1, 2]);
    expect(await said(grid)).toBe('Selection by dragging canceled');
    pointer('pointerup', document.body, 0, 0);
    grid.settings.rowDragSelection = false;
    await drag(grid, [4, 'name'], [[6, 'name']]);
    expect(grid.selectedKeys).toEqual([7]);
  });

  it('skips group rows, and leaves the row drag icon to row drag and drop', async () => {
    const grouped = await make({ rows: makeRows(6), settings: { selection: 'multiple' }, columns: [...columns.slice(0, 3), { ...columns[3], groupIndex: 0 }] });
    // Rows: Ankara (0), 1, 3, 5, Izmir (4), 2, 4, 6: from row 1 to row 5 the group row in between is left out.
    await drag(grouped, [1, 'name'], [[3, 'name'], [5, 'name']]);
    expect(grouped.selectedKeys.sort()).toEqual([1, 2, 3, 5]);
    await grouped.dispose();
    const grid = await make({ rows: makeRows(6), settings: { selection: 'multiple' }, rowDragging: { allowReordering: true } });
    const reorder = vi.fn();
    grid.rowDragging.onReorder = reorder;
    await drag(grid, [0, 'mx:drag'], [[2, 'mx:drag']]);
    expect(grid.selectedKeys).toEqual([]);
    await drag(grid, [0, 'name'], [[2, 'name']]);
    expect(grid.selectedKeys).toEqual([1, 2, 3]);
    // With the whole row dragged (no icons), a drag moves the row.
    grid.rowDragging.showDragIcons = false;
    await settle();
    await drag(grid, [4, 'name'], [[5, 'name']]);
    expect(grid.selectedKeys).toEqual([1, 2, 3]);
  });

  it('scrolls near the bottom edge and takes in the rows that come', async () => {
    const grid = await make({ rows: makeRows(200), settings: { selection: 'multiple' } });
    const start = point(grid, 1, 'name');
    pointer('pointerdown', cellOf(grid, 1, 'name'), start.x, start.y);
    pointer('pointermove', document.body, start.x, start.y + 10);
    pointer('pointermove', document.body, start.x, PLACE.top + PLACE.height + 40);
    for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 20));
    const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
    expect(vp.scrollTop).toBeGreaterThan(100);
    pointer('pointerup', document.body, start.x, PLACE.top + PLACE.height + 40);
    expect(grid.selectedCount).toBeGreaterThan(12);
    expect(grid.selectedKeys[0]).toBe(2);
  });
});

describe('DataGrid: cell ranges', () => {
  it('draws a range by dragging, with its frame, its anchor and aria-selected; a click starts over', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple' } });
    const changes: GridCellSelectionChangedEventArgs[] = [];
    grid.onCellSelectionChanged((e) => changes.push(e));
    await drag(grid, [1, 'name'], [[2, 'amount'], [3, 'city']]);
    expect(marks(grid, 1)).toEqual(['name:top start anchor', 'amount:top', 'city:top end']);
    expect(marks(grid, 2)).toEqual(['name:start', 'amount:', 'city:end']);
    expect(marks(grid, 3)).toEqual(['name:bottom start', 'amount:bottom', 'city:bottom end']);
    expect([cellOf(grid, 2, 'amount').getAttribute('aria-selected'), cellOf(grid, 4, 'amount').getAttribute('aria-selected'), cellOf(grid, 2, 'id').getAttribute('aria-selected')]).toEqual(['true', 'false', 'false']);
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-multiselectable')).toBe('true');
    expect(grid.cellRanges).toEqual([{ from: { field: 'name', key: 2, rowIndex: 1 }, to: { field: 'city', key: 4, rowIndex: 3 }, fields: ['name', 'amount', 'city'] }]);
    expect(changes.length).toBe(3);
    expect(changes.every((c) => c.byDrag)).toBe(true);
    expect(await said(grid)).toBe('3 × 3 cells selected');
    await click(grid, 5, 'name');
    expect(grid.cellRanges).toEqual([]);
    expect(marks(grid, 2)).toEqual([]);
  });

  it('adds ranges with Ctrl (several ranges), extends the last with Shift+click; one range alone in single mode', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple' } });
    await drag(grid, [0, 'id'], [[1, 'name']]);
    await drag(grid, [4, 'amount'], [[5, 'amount']], { ctrlKey: true });
    expect(grid.cellRanges.map((r) => r.fields)).toEqual([['id', 'name'], ['amount']]);
    expect(await said(grid)).toBe('6 cells selected in 2 ranges');
    await click(grid, 7, 'city', { shiftKey: true });
    expect(grid.cellRanges[1]).toEqual({ from: { field: 'amount', key: 5, rowIndex: 4 }, to: { field: 'city', key: 8, rowIndex: 7 }, fields: ['amount', 'city'] });
    await click(grid, 9, 'id', { ctrlKey: true });
    expect(grid.cellRanges.length).toBe(3);
    grid.settings.cellSelection = 'single';
    await settle();
    expect(grid.cellRanges.length).toBe(1);
    await drag(grid, [0, 'id'], [[1, 'id']], { ctrlKey: true });
    expect(grid.cellRanges.length).toBe(1);
    grid.settings.cellSelection = 'none';
    await settle();
    expect(grid.cellRanges).toEqual([]);
  });

  it('extends from the active cell with Shift and the keys, selects every cell, clears with Escape and with a plain move', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple' } });
    await click(grid, 1, 'name');
    key(active(), 'ArrowDown', { shiftKey: true });
    key(active(), 'ArrowRight', { shiftKey: true });
    expect(grid.cellRanges[0]).toEqual({ from: { field: 'name', key: 2, rowIndex: 1 }, to: { field: 'amount', key: 3, rowIndex: 2 }, fields: ['name', 'amount'] });
    expect(active()).toBe(cellOf(grid, 2, 'amount'));
    expect(await said(grid)).toBe('2 × 2 cells selected');
    key(active(), 'End', { shiftKey: true });
    expect(grid.cellRanges[0].fields).toEqual(['name', 'amount', 'city']);
    key(active(), 'ArrowDown');
    expect(grid.cellRanges).toEqual([]);
    key(active(), 'a', { ctrlKey: true });
    expect(grid.cellRanges[0]).toEqual({ from: { field: 'id', key: 1, rowIndex: 0 }, to: { field: 'city', key: 10, rowIndex: 9 }, fields: ['id', 'name', 'amount', 'city'] });
    expect(await said(grid)).toBe('10 × 4 cells selected');
    key(active(), 'Escape');
    expect(grid.cellRanges).toEqual([]);
    expect(await said(grid)).toBe('Cell selection cleared');
    // The keys are options.
    grid.settings.selectAllCellsKeys = ['Alt+A'];
    key(active(), 'a', { ctrlKey: true });
    expect(grid.cellRanges).toEqual([]);
    key(active(), 'a', { altKey: true });
    expect(grid.cellRanges.length).toBe(1);
  });

  it('takes the keys that extend a range, select a row and extend the rows from the settings, live', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple', selection: 'multiple' } });
    await click(grid, 1, 'name');
    grid.settings.extendCellsKeys = { ...grid.settings.extendCellsKeys, down: ['Alt+J'], last: ['Alt+Shift+End'] };
    // The old chord no longer extends: it is a plain move with Shift.
    key(active(), 'ArrowDown', { shiftKey: true });
    expect(grid.cellRanges).toEqual([]);
    await click(grid, 1, 'name');
    key(active(), 'j', { altKey: true });
    expect(grid.cellRanges[0]).toEqual({ from: { field: 'name', key: 2, rowIndex: 1 }, to: { field: 'name', key: 3, rowIndex: 2 }, fields: ['name'] });
    key(active(), 'End', { ctrlKey: true, shiftKey: true });
    expect(grid.cellRanges[0].to.rowIndex).toBe(2);
    key(active(), 'End', { altKey: true, shiftKey: true });
    expect(grid.cellRanges[0].to).toEqual({ field: 'city', key: 10, rowIndex: 9 });
    // Rows, from the check box column.
    grid.settings.toggleRowSelectionKeys = ['Alt+Space'];
    grid.settings.extendRowSelectionKeys = { ...grid.settings.extendRowSelectionKeys, down: ['Alt+ArrowDown'] };
    cellOf(grid, 3, 'mx:select').focus();
    key(active(), ' ', { shiftKey: true });
    expect(grid.selectedKeys).toEqual([]);
    key(active(), ' ', { altKey: true });
    expect(grid.selectedKeys).toEqual([4]);
    key(active(), 'ArrowDown', { shiftKey: true });
    expect(grid.selectedKeys).toEqual([4]);
    key(active(), 'ArrowDown', { altKey: true });
    key(active(), 'ArrowDown', { altKey: true });
    expect(grid.selectedKeys.sort()).toEqual([4, 5, 6, 7]);
  });

  it('copies the ranges as tab-separated text, the cells outside every range empty, with onCopying', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple' } });
    await drag(grid, [0, 'id'], [[1, 'name']]);
    await drag(grid, [2, 'amount'], [[2, 'amount']], { ctrlKey: true });
    const copying = vi.fn();
    grid.onCopying(copying);
    expect(grid.copy()).toBe('1\tName 1\t\r\n2\tName 2\t\r\n\t\t30');
    expect(copying).toHaveBeenCalledWith(expect.objectContaining({ rows: 3, ranges: grid.cellRanges }));
    expect(await said(grid)).toBe('5 cells copied');
    grid.settings.copyHeaders = true;
    grid.settings.copyValues = 'raw';
    expect(grid.copy()).toBe('Id\tName\tAmount\r\n1\tName 1\t\r\n2\tName 2\t\r\n\t\t30');
    grid.columnSettings('name').copyable = false;
    expect(grid.copy()).toBe('Id\tAmount\r\n1\t\r\n2\t\r\n\t30');
  });

  it('fills a range with one pasted value, pastes a block at its first cell, and empties it with Delete through the save path', async () => {
    const rows = makeRows(10);
    const grid = await make({ rows, settings: { cellSelection: 'multiple', editable: true } });
    const updating = vi.fn();
    grid.onRowUpdating(updating);
    await drag(grid, [1, 'id'], [[3, 'amount']]);
    cellOf(grid, 1, 'id').focus();
    // `id` cannot be edited: it keeps its value.
    expect(grid.paste('7')).toBe(6);
    await settle();
    const values = (from: number, to: number, fields: string[]) => Array.from({ length: to - from }, (_, k) => fields.map((f) => grid.cellValue(from + k, f)));
    expect(values(1, 4, ['id', 'name', 'amount'])).toEqual([[2, '7', 7], [3, '7', 7], [4, '7', 7]]);
    await drag(grid, [5, 'name'], [[6, 'name']]);
    cellOf(grid, 5, 'name').focus();
    expect(grid.paste('A\t1\r\nB\t2')).toBe(4);
    await settle();
    expect(values(5, 7, ['name', 'amount'])).toEqual([['A', 1], ['B', 2]]);
    await drag(grid, [7, 'name'], [[8, 'amount']]);
    cellOf(grid, 8, 'amount').focus();
    updating.mockClear();
    key(active(), 'Delete');
    await settle();
    expect(values(7, 9, ['name', 'amount'])).toEqual([[null, null], [null, null]]);
    expect(updating).toHaveBeenCalledWith(expect.objectContaining({ key: 8 }));
    expect(await said(grid)).toBe('4 cells cleared');
    // Row 9 is the active one: it stays in edit until it is left.
    expect(grid.hasChanges).toBe(true);
  });

  it('is set and read by code, by key; survives rows added above, goes with a sort; events can cancel', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple', editable: true, addRows: true }, newRow: { position: 'top' } });
    expect(grid.selectCells({ key: 3, field: 'name' }, { key: 5, field: 'amount' })).toBe(true);
    expect(grid.getSelectedCellValues().map((c) => `${c.key}.${c.field}=${c.value}`)).toEqual(['3.name=Name 3', '3.amount=30', '4.name=Name 4', '4.amount=40', '5.name=Name 5', '5.amount=50']);
    await settle();
    expect(grid.cellSelectionSummary).toEqual({ cells: 6, count: 6, numbers: 3, sum: 120, average: 40, min: 30, max: 50 });
    expect(grid.element.querySelector('.mx-data-grid__cell-summary')?.textContent).toBe('Avg: 40 · Count: 6 · Sum: 120');
    await settle();
    grid.settings.cellSummaryItems = ['min', 'max'];
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__cell-summary')?.textContent).toBe('Min: 30 · Max: 50');
    // A new row at the top: the range keeps its rows.
    await grid.addRow();
    await settle();
    expect(grid.cellRanges[0].from).toEqual({ field: 'name', key: 3, rowIndex: 3 });
    grid.cancelEditData();
    const stop = grid.onCellSelectionChanging((e) => (e.cancel = !e.byDrag && e.ranges.length === 0));
    grid.clearCellSelection();
    expect(grid.cellRanges.length).toBe(1);
    stop.dispose();
    grid.sort = [{ field: 'amount', dir: 'desc' }];
    await settle();
    expect(grid.cellRanges).toEqual([]);
    grid.cellRanges = [{ from: { key: 1, field: 'id' }, to: { rowIndex: 1, field: 'id' } }];
    expect(grid.cellRanges[0].to.key).toBe(9);
  });

  it('follows the options: a column opts out, drags turn off, editable cells may be left to clicks', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple', editable: true, startEditAction: 'click' } });
    grid.columnSettings('amount').cellSelectable = false;
    await drag(grid, [0, 'name'], [[1, 'city']]);
    expect(grid.cellRanges[0].fields).toEqual(['name', 'city']);
    expect(cellOf(grid, 0, 'amount').hasAttribute('aria-selected')).toBe(false);
    expect(marks(grid, 0)).toEqual(['name:top start end anchor', 'city:top start end']);
    grid.settings.cellSelectable = false;
    grid.columnSettings('amount').cellSelectable = true;
    await drag(grid, [3, 'amount'], [[4, 'amount']]);
    expect(grid.cellRanges[0].fields).toEqual(['amount']);
    grid.settings.cellSelectable = true;
    grid.settings.cellDragSelection = false;
    await drag(grid, [6, 'name'], [[7, 'name']]);
    expect(grid.cellRanges).toEqual([]);
    grid.settings.cellDragSelection = true;
    grid.settings.dragSelectionOnEditableCells = false;
    await drag(grid, [6, 'name'], [[7, 'name']]);
    expect(grid.cellRanges).toEqual([]);
    await drag(grid, [6, 'id'], [[7, 'id']]);
    expect(grid.cellRanges.length).toBe(1);
    // A drag is not a click: no editor opens; a click on the active cell still edits it.
    grid.settings.dragSelectionOnEditableCells = true;
    cellOf(grid, 2, 'name').focus();
    await drag(grid, [2, 'name'], [[3, 'name']]);
    expect(grid.editingCell).toBe(null);
    await click(grid, 2, 'name');
    expect(grid.editingCell?.field).toBe('name');
  });

  it('keeps row selection to the check boxes while cells are selected', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple', selection: 'multiple' } });
    await click(grid, 1, 'name');
    expect(grid.selectedKeys).toEqual([]);
    await drag(grid, [1, 'mx:select'], [[3, 'mx:select']]);
    expect(grid.selectedKeys).toEqual([2, 3, 4]);
    expect(grid.cellRanges).toEqual([]);
    await drag(grid, [1, 'name'], [[2, 'name']]);
    expect([grid.selectedKeys.length, grid.cellRanges.length]).toEqual([3, 1]);
    // Over a selected row the range is drawn whole, with its own text color.
    expect(rowEl(grid, 1).hasAttribute('data-selected') && cellOf(grid, 1, 'name').hasAttribute('data-range')).toBe(true);
  });

  it('belongs to the page it was drawn on, and to the rows as they are grouped', async () => {
    const grid = await make({ rows: makeRows(30), mode: 'paged', pageSize: 10, settings: { cellSelection: 'multiple' } });
    await drag(grid, [1, 'name'], [[3, 'amount']]);
    expect(grid.cellRanges.length).toBe(1);
    grid.page = 1;
    await settle();
    expect(grid.cellRanges).toEqual([]);
    await drag(grid, [11, 'name'], [[12, 'name']]);
    expect(grid.cellRanges[0].from.key).toBe(12);
    grid.groupBy('city');
    await settle();
    expect(grid.cellRanges).toEqual([]);
  });

  it('leaves a touch drag to scrolling, unless a long press starts it', async () => {
    const grid = await make({ rows: makeRows(10), settings: { cellSelection: 'multiple', dragSelectionLongPress: 30 } });
    const touch = (type: string, target: EventTarget, x: number, y: number) => {
      const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
      Object.defineProperty(e, 'pointerId', { value: 2 });
      Object.defineProperty(e, 'pointerType', { value: 'touch' });
      target.dispatchEvent(e);
    };
    const a = point(grid, 1, 'name');
    const b = point(grid, 3, 'city');
    touch('pointerdown', cellOf(grid, 1, 'name'), a.x, a.y);
    touch('pointermove', document.body, b.x, b.y);
    touch('pointerup', document.body, b.x, b.y);
    await settle();
    expect(grid.cellRanges).toEqual([]);
    grid.settings.dragSelectionTouch = 'longPress';
    // Moving before the press is long enough still scrolls.
    touch('pointerdown', cellOf(grid, 1, 'name'), a.x, a.y);
    touch('pointermove', document.body, b.x, b.y);
    touch('pointerup', document.body, b.x, b.y);
    await settle();
    expect(grid.cellRanges).toEqual([]);
    touch('pointerdown', cellOf(grid, 1, 'name'), a.x, a.y);
    await new Promise((r) => setTimeout(r, 60));
    touch('pointermove', document.body, b.x, b.y);
    touch('pointerup', document.body, b.x, b.y);
    await settle();
    expect(grid.cellRanges[0].fields).toEqual(['name', 'amount', 'city']);
  });

  it('holds a touchmove listener on the rows from before a press, only for the long press, so a drag can stop the page scrolling', async () => {
    // A phone decides when the finger lands whether the page may scroll at once: a listener added on the press is too late.
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const added: { target: EventTarget; passive: unknown }[] = [];
    const removed: EventTarget[] = [];
    vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (this: EventTarget, type: string, fn: any, options?: any) {
      if (type === 'touchmove') added.push({ target: this, passive: typeof options === 'object' ? options.passive : undefined });
      return add.call(this, type, fn, options);
    });
    vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(function (this: EventTarget, type: string, fn: any, options?: any) {
      if (type === 'touchmove') removed.push(this);
      return remove.call(this, type, fn, options);
    });
    const plain = await make({ rows: makeRows(5), settings: { cellSelection: 'multiple' } });
    const plainVp = plain.element.querySelector('.mx-data-grid__viewport')!;
    expect(added.some((a) => a.target === plainVp)).toBe(false);

    const grid = await make({ rows: makeRows(5), settings: { cellSelection: 'multiple', dragSelectionTouch: 'longPress' } });
    const vp = grid.element.querySelector('.mx-data-grid__viewport')!;
    // On an element a listener is not passive unless asked: only the window, the document and the body default to passive.
    expect(added.some((a) => a.target === vp && a.passive !== true)).toBe(true);
    grid.settings.dragSelectionTouch = 'scroll';
    await settle();
    expect(removed).toContain(vp);
    vi.restoreAllMocks();
  });

  it('scrolls sideways near the edge while drawing a range', async () => {
    const grid = await make({ rows: makeRows(10), columns: [...columns, { field: 'e1', title: 'E1' }, { field: 'e2', title: 'E2' }, { field: 'e3', title: 'E3' }], settings: { cellSelection: 'single' } });
    const start = point(grid, 0, 'id');
    pointer('pointerdown', cellOf(grid, 0, 'id'), start.x, start.y);
    pointer('pointermove', document.body, start.x + 10, start.y);
    pointer('pointermove', document.body, PLACE.left + PLACE.width + 30, start.y);
    for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 20));
    const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
    pointer('pointerup', document.body, PLACE.left + PLACE.width + 30, start.y);
    expect(vp.scrollLeft).toBeGreaterThan(0);
    expect(grid.cellRanges[0].to.field).toBe('e3');
  });
});
