import { reactive } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridRowDragEventArgs } from './grid-row-drag-event-args';
import type { GridRowDropEventArgs } from './grid-row-drop-event-args';
import { rowDropPlace } from './view/row-drop-place';
import { scrollStep } from '../../parts/drag/scroll-step';

type Row = { id: number; name: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80 },
  { field: 'name', title: 'Name', width: 200 },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}` }));

const ROW = 36;
const HEAD = 36;
/** Where each grid's viewport is on the screen. */
const places = new WeakMap<HTMLElement, { left: number; top: number; width: number; height: number }>();

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
const px = (text: string, re: RegExp) => Number(re.exec(text)?.[1] ?? 0);

/** A layout for jsdom: viewports where `places` says, the header on top, rows where their transform puts them. */
function layout(this: HTMLElement): DOMRect {
  const vp = this.closest('.mx-data-grid__viewport') as HTMLElement | null;
  const at = vp ? places.get(vp) : undefined;
  if (!vp || !at) return rect(0, 0, 0, 0);
  if (this === vp) return rect(at.left, at.top, at.width, at.height);
  const bodyTop = at.top + HEAD - vp.scrollTop;
  if (this.classList.contains('mx-data-grid__head')) return rect(at.left, at.top, at.width, HEAD);
  if (this.classList.contains('mx-data-grid__body')) return rect(at.left, bodyTop, at.width, 10_000);
  const row = this.closest('.mx-data-grid__body > *') as HTMLElement | null;
  if (!row) return rect(0, 0, 0, 0);
  const top = bodyTop + px(row.style.transform, /translateY\((-?[\d.]+)px\)/) + px(row.style.translate, /^0 (-?[\d.]+)px/);
  return this === row ? rect(at.left, top, at.width, ROW) : rect(at.left, top, 36, ROW);
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

async function make(props: Partial<DataGridProps<Row>>, place = { left: 0, top: 100, width: 600, height: 400 }) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: ROW, locale: 'en-US', label: 'Tasks', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, Math.min(10_000, v))) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => place.height - HEAD });
  places.set(vp, place);
  (grid as any).measure();
  await settle();
  return grid;
}

const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
/** The middle of grid row `i` on the screen, `part` of the way down it. */
const yOf = (grid: DataGrid<any>, i: number, part = 0.5) => rowEl(grid, i).getBoundingClientRect().top + ROW * part;

function pointer(type: string, target: EventTarget, x: number, y: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  target.dispatchEvent(e);
  return e;
}

/** Takes row `i` by its drag icon (or `field`) and moves the pointer past the threshold. */
function take(grid: DataGrid<any>, i: number, field = 'mx:drag') {
  const cell = cellOf(grid, i, field);
  const y = yOf(grid, i);
  pointer('pointerdown', cell, 10, y);
  pointer('pointermove', document.body, 10, y + 8);
}

const moveTo = (x: number, y: number) => pointer('pointermove', document.body, x, y);
const drop = (x: number, y: number) => pointer('pointerup', document.body, x, y);
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const line = (grid: DataGrid<any>) => grid.element.querySelector('.mx-data-grid__row-drop') as HTMLElement | null;
const ghost = (grid: DataGrid<any>) => grid.element.querySelector('.mx-data-grid__ghost') as HTMLElement | null;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(layout);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('DataGrid row drag and drop', () => {
  it('shows a drag icon column only while rows can be dragged, live', async () => {
    const grid = await make({ rows: makeRows(5) });
    const head = () => grid.element.querySelector('[role="columnheader"][data-field="mx:drag"]') as HTMLElement | null;
    expect(head()?.hasAttribute('aria-colindex')).toBe(false);
    expect(rowEl(grid, 0).hasAttribute('data-draggable')).toBe(false);
    const changed = vi.fn();
    grid.onOptionChanged(changed);
    grid.rowDragging.allowReordering = true;
    await settle();
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ name: 'rowDragging.allowReordering', value: true, previous: false }));
    const cell = cellOf(grid, 0, 'mx:drag');
    expect([rowEl(grid, 0).hasAttribute('data-draggable'), cell.getAttribute('aria-label'), cell.getAttribute('aria-keyshortcuts')]).toEqual([
      true,
      'Drag to move the row',
      'Control+Shift+ArrowUp Control+Shift+ArrowDown',
    ]);
    expect(head()?.textContent).toContain('Move');
    expect(cell.getAttribute('aria-colindex')).toBe('1');
    grid.rowDragging.showDragIcons = false;
    await settle();
    expect(cellOf(grid, 0, 'mx:drag').hasAttribute('aria-colindex')).toBe(false);
    expect(rowEl(grid, 0).hasAttribute('data-draggable')).toBe(true);
    await grid.dispose();
  });

  it('drags a row by its icon: the copy, the line, the events with the indexes, then onReorder', async () => {
    const state = reactive({ rows: makeRows(10) });
    const seen: string[] = [];
    let reorder: GridRowDropEventArgs<Row> | null = null;
    const grid = await make({
      rows: () => state.rows,
      rowDragging: {
        allowReordering: true,
        onDragStart: (e) => seen.push(`start ${e.fromIndex} ${e.itemData.id}`),
        onDragChange: (e) => seen.push(`change ${e.toIndex}`),
        onDragEnd: (e) => seen.push(`end ${e.toIndex}`),
        onReorder: (e) => {
          reorder = e;
          const rows = state.rows;
          const from = rows.indexOf(e.itemData);
          const to = rows.indexOf(e.toItemData!);
          rows.splice(from, 1);
          rows.splice(to, 0, e.itemData);
        },
      },
    });
    take(grid, 1);
    expect(seen).toEqual(['start 1 2']);
    expect(ghost(grid)?.dataset.kind).toBe('row');
    expect(ghost(grid)?.textContent).toContain('Name 2');
    expect(rowEl(grid, 1).dataset.dragSource).toBe('indicate');
    // Over the lower half of row 4: it would land after it, at index 4.
    moveTo(10, yOf(grid, 4, 0.75));
    expect(seen.at(-1)).toBe('change 4');
    expect(line(grid)?.hidden).toBe(false);
    expect(line(grid)?.style.transform).toBe(`translateY(${5 * ROW}px)`);
    expect(ghost(grid)?.dataset.target).toBe('move');
    drop(10, yOf(grid, 4, 0.75));
    expect(seen.slice(-1)).toEqual(['end 4']);
    expect(reorder).toMatchObject({ fromIndex: 1, toIndex: 4, dropInsideItem: false, itemKey: 2 });
    // By identity: matching the grids field by field walks their whole object graph.
    expect([reorder!.fromComponent, reorder!.toComponent, reorder!.component].every((c) => c === grid)).toBe(true);
    expect(reorder!.toItemData?.id).toBe(5);
    expect([ghost(grid), line(grid)?.hidden, rowEl(grid, 1).dataset.dragSource]).toEqual([null, true, undefined]);
    await settle();
    expect(state.rows.slice(0, 5).map((r) => r.id)).toEqual([1, 3, 4, 5, 2]);
    expect(grid.element.querySelector('.mx-data-grid__live')?.textContent).toBe('Row moved to position 5 of 10');
    await grid.dispose();
  });

  it('pushes the rows aside with dropFeedbackMode push, and puts them back when dropped', async () => {
    const onReorder = vi.fn();
    const grid = await make({ rows: makeRows(10), rowDragging: { allowReordering: true, dropFeedbackMode: 'push', onReorder } });
    take(grid, 1);
    expect(rowEl(grid, 1).dataset.dragSource).toBe('push');
    moveTo(10, yOf(grid, 3, 0.75));
    const shift = (i: number) => rowEl(grid, i).style.translate;
    // Rows 2 and 3 move up a row; row 1 stands where it would land; the line is not shown.
    expect([shift(1), shift(2), shift(3), shift(4)]).toEqual([`0 ${2 * ROW}px`, `0 ${-ROW}px`, `0 ${-ROW}px`, '']);
    expect(line(grid)?.hidden ?? true).toBe(true);
    // Back up above row 0: the rows before it move down.
    moveTo(10, yOf(grid, 0, 0.1));
    expect([shift(0), shift(1), shift(2)]).toEqual([`0 ${ROW}px`, `0 ${-ROW}px`, '']);
    drop(10, yOf(grid, 0, 0.1));
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ fromIndex: 1, toIndex: 0 }));
    expect([shift(0), shift(1), rowEl(grid, 1).dataset.dragSource]).toEqual(['', '', undefined]);
    await grid.dispose();
  });

  it('lets the handlers cancel the start, a place and the drop; Escape cancels too', async () => {
    const onReorder = vi.fn();
    const handlers = {
      start: (e: GridRowDragEventArgs<Row>) => (e.cancel = e.itemData.id === 1),
      change: (e: GridRowDragEventArgs<Row>) => (e.cancel = e.toIndex === 5),
      end: (e: GridRowDragEventArgs<Row>) => (e.cancel = e.toIndex === 6),
    };
    const grid = await make({
      rows: makeRows(10),
      rowDragging: { allowReordering: true, onDragStart: (e) => handlers.start(e), onDragChange: (e) => handlers.change(e), onDragEnd: (e) => handlers.end(e), onReorder },
    });
    take(grid, 0);
    expect(ghost(grid)).toBe(null);
    drop(10, yOf(grid, 4));
    take(grid, 2);
    moveTo(10, yOf(grid, 5, 0.75));
    expect([ghost(grid)?.dataset.target, line(grid)?.hidden ?? true]).toEqual(['none', true]);
    drop(10, yOf(grid, 5, 0.75));
    take(grid, 2);
    moveTo(10, yOf(grid, 6, 0.75));
    drop(10, yOf(grid, 6, 0.75));
    take(grid, 2);
    moveTo(10, yOf(grid, 7, 0.25));
    key(document.body, 'Escape');
    expect(ghost(grid)).toBe(null);
    drop(10, yOf(grid, 7, 0.25));
    expect(onReorder).not.toHaveBeenCalled();
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__live')?.textContent).toBe('The move was canceled');
    await grid.dispose();
  });

  it('drops a row onto another with allowDropInsideItem', async () => {
    const onReorder = vi.fn();
    const grid = await make({ rows: makeRows(10), rowDragging: { allowDropInsideItem: true, onReorder } });
    take(grid, 1);
    moveTo(10, yOf(grid, 5, 0.5));
    expect(rowEl(grid, 5).hasAttribute('data-drop-target')).toBe(true);
    expect(line(grid)?.hidden ?? true).toBe(true);
    // Between rows takes no drop without allowReordering.
    moveTo(10, yOf(grid, 5, 0.9));
    expect([rowEl(grid, 5).hasAttribute('data-drop-target'), ghost(grid)?.dataset.target]).toEqual([false, 'none']);
    moveTo(10, yOf(grid, 5, 0.5));
    drop(10, yOf(grid, 5, 0.5));
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ fromIndex: 1, toIndex: 5, dropInsideItem: true }));
    expect(onReorder.mock.calls[0][0].toItemData.id).toBe(6);
    expect(rowEl(grid, 5).hasAttribute('data-drop-target')).toBe(false);
    await grid.dispose();
  });

  it('moves a row to another grid of its group: onRemove there, onAdd here, room made with push', async () => {
    const left = reactive({ rows: makeRows(5) });
    const right = reactive({ rows: makeRows(3, 100) });
    const calls: string[] = [];
    const a = await make({
      rows: () => left.rows,
      label: 'Left',
      rowDragging: { group: 'tasks', data: 'L', onRemove: (e) => (calls.push(`remove ${e.fromIndex} → ${e.toIndex} ${e.toData}`), left.rows.splice(left.rows.indexOf(e.itemData), 1)) },
    });
    const b = await make(
      {
        rows: () => right.rows,
        label: 'Right',
        rowDragging: { group: 'tasks', data: 'R', dropFeedbackMode: 'push', onAdd: (e) => (calls.push(`add ${e.fromIndex} → ${e.toIndex} ${e.fromData}`), right.rows.splice(e.toIndex, 0, e.itemData)) },
      },
      { left: 700, top: 100, width: 600, height: 400 },
    );
    take(a, 3);
    moveTo(710, yOf(b, 1, 0.25));
    expect([rowEl(b, 0).style.translate, rowEl(b, 1).style.translate, rowEl(b, 2).style.translate]).toEqual(['', `0 ${ROW}px`, `0 ${ROW}px`]);
    expect(rowEl(a, 3).dataset.dragSource).toBe('indicate');
    drop(710, yOf(b, 1, 0.25));
    expect(calls).toEqual(['remove 3 → 1 R', 'add 3 → 1 L']);
    await settle();
    expect(left.rows.map((r) => r.id)).toEqual([1, 2, 3, 5]);
    expect(right.rows.map((r) => r.id)).toEqual([100, 4, 101, 102]);
    expect(rowEl(b, 1).style.translate).toBe('');
    expect(a.element.querySelector('.mx-data-grid__live')?.textContent).toBe('Row moved to Right');
    // A grid of another group takes nothing.
    b.rowDragging.group = 'other';
    take(a, 0);
    moveTo(710, yOf(b, 1, 0.25));
    expect(ghost(a)?.dataset.target).toBe('none');
    drop(710, yOf(b, 1, 0.25));
    expect(calls).toHaveLength(2);
    await a.dispose();
    await b.dispose();
  });

  it('drags the whole row without the icons, and lets a click still select', async () => {
    const onReorder = vi.fn();
    const grid = await make({ rows: makeRows(6), settings: { selection: 'single' }, rowDragging: { allowReordering: true, showDragIcons: false, onReorder } });
    take(grid, 0, 'name');
    moveTo(10, yOf(grid, 2, 0.75));
    drop(10, yOf(grid, 2, 0.75));
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ fromIndex: 0, toIndex: 2 }));
    await settle();
    const cell = cellOf(grid, 3, 'name');
    pointer('pointerdown', cell, 10, yOf(grid, 3));
    drop(10, yOf(grid, 3));
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(grid.selectedKeys).toEqual([4]);
    await grid.dispose();
  });

  it('moves the active row with Ctrl+Shift+Up / Down, the keys an option, announced', async () => {
    const state = reactive({ rows: makeRows(5) });
    const seen: string[] = [];
    const grid = await make({
      rows: () => state.rows,
      rowDragging: {
        allowReordering: true,
        onDragStart: () => seen.push('start'),
        onDragEnd: () => seen.push('end'),
        onReorder: (e) => {
          seen.push(`reorder ${e.fromIndex} ${e.toIndex}`);
          state.rows.splice(e.fromIndex, 1);
          state.rows.splice(e.toIndex, 0, e.itemData);
          e.component.refresh();
        },
      },
    });
    const cell = cellOf(grid, 2, 'name');
    cell.focus();
    key(cell, 'ArrowUp', { ctrlKey: true, shiftKey: true });
    expect(seen).toEqual(['start', 'end', 'reorder 2 1']);
    await settle();
    await settle();
    expect(state.rows.map((r) => r.id)).toEqual([1, 3, 2, 4, 5]);
    expect(grid.focusedRowIndex).toBe(1);
    expect(grid.element.querySelector('.mx-data-grid__live')?.textContent).toBe('Row moved to position 2 of 5');
    // The keys are an option; Alt+Up moves now, Ctrl+Shift+Down does not.
    grid.rowDragging.moveDownKeys = ['Alt+ArrowDown'];
    key(document.activeElement!, 'ArrowDown', { ctrlKey: true, shiftKey: true });
    expect([seen.length, grid.focusedRowIndex]).toEqual([3, 2]);
    key(document.activeElement!, 'ArrowDown', { altKey: true });
    expect(seen.at(-1)).toBe('reorder 2 3');
    await settle();
    await settle();
    // At the top there is nowhere to go; with `keyboard: false` the keys do nothing.
    grid.focusCell(0, 'name');
    key(document.activeElement!, 'ArrowUp', { ctrlKey: true, shiftKey: true });
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__live')?.textContent).toBe('The row is first already');
    grid.rowDragging.keyboard = false;
    grid.focusCell(1, 'name');
    const count = seen.length;
    key(document.activeElement!, 'ArrowUp', { ctrlKey: true, shiftKey: true });
    expect(seen).toHaveLength(count);
    await grid.dispose();
  });

  it('moveRow() raises the same events; paged, the indexes are the grid’s', async () => {
    const onReorder = vi.fn();
    const grid = await make({ rows: makeRows(30), mode: 'paged', pageSize: 10, rowDragging: { allowReordering: true, onReorder } });
    grid.page = 1;
    await settle();
    expect(await grid.moveRow(12, 14)).toBe(true);
    expect(onReorder).toHaveBeenCalledWith(expect.objectContaining({ fromIndex: 12, toIndex: 14 }));
    expect(onReorder.mock.calls[0][0].itemData.id).toBe(13);
    take(grid, 11);
    moveTo(10, yOf(grid, 13, 0.75));
    drop(10, yOf(grid, 13, 0.75));
    expect(onReorder.mock.calls[1][0]).toMatchObject({ fromIndex: 11, toIndex: 13 });
    expect(await grid.moveRow(12, 12)).toBe(false);
    await grid.dispose();
  });

  it('shows a drag template in the container, at cursorOffset, along dragDirection, inside boundary', async () => {
    const holder = document.body.appendChild(document.createElement('div'));
    holder.id = 'drag-holder';
    const grid = await make({
      rows: makeRows(10),
      rowDragging: { allowReordering: true, container: '#drag-holder', cursorOffset: '5 6', dragDirection: 'vertical', dragTemplate: (e) => `Moving ${e.itemData.name}` },
    });
    take(grid, 2);
    const copy = holder.querySelector('.mx-data-grid__ghost') as HTMLElement;
    expect(copy?.textContent).toBe('Moving Name 3');
    expect(ghost(grid)).toBe(null);
    // Vertical only: moving sideways leaves it where it started.
    const at = copy.style.transform;
    moveTo(200, yOf(grid, 2) + 8);
    expect(copy.style.transform).toBe(at);
    drop(200, yOf(grid, 2) + 8);
    expect(holder.querySelector('.mx-data-grid__ghost')).toBe(null);
    await grid.dispose();
  });

  it('scrolls the rows near their edges while dragging', async () => {
    const grid = await make({ rows: makeRows(100), rowDragging: { allowReordering: true, scrollSpeed: 20, scrollSensitivity: 50 } });
    const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
    take(grid, 1);
    moveTo(10, 100 + 400 - 5);
    expect(vp.scrollTop).toBeGreaterThan(0);
    const after = vp.scrollTop;
    await new Promise((r) => setTimeout(r, 40));
    expect(vp.scrollTop).toBeGreaterThan(after);
    drop(10, 100 + 400 - 5);
    const stopped = vp.scrollTop;
    await new Promise((r) => setTimeout(r, 40));
    expect(vp.scrollTop).toBe(stopped);
    grid.rowDragging.autoScroll = false;
    take(grid, (grid.getVisibleRows()[2]?.rowIndex ?? 3));
    moveTo(10, 100 + 400 - 5);
    expect(vp.scrollTop).toBe(stopped);
    drop(10, 100 + 400 - 5);
    await grid.dispose();
  });
});

describe('row drag helpers', () => {
  it('scrollStep: nothing in the middle, faster towards the edge, full speed past it', () => {
    expect(scrollStep(300, 100, 500, 60, 30)).toBe(0);
    expect(scrollStep(470, 100, 500, 60, 30)).toBe(15);
    expect(scrollStep(499, 100, 500, 60, 30)).toBe(30);
    expect(scrollStep(520, 100, 500, 60, 30)).toBe(30);
    expect(scrollStep(130, 100, 500, 60, 30)).toBe(-15);
    expect(scrollStep(50, 100, 500, 60, 30)).toBe(-30);
    expect(scrollStep(470, 100, 500, 0, 30)).toBe(0);
  });

  it('rowDropPlace: before the row whose middle lies after the pointer, onto the middle half', () => {
    const rows = [0, 1, 2].map((k) => ({ top: k * 36, bottom: k * 36 + 36 }));
    const none = () => false;
    expect(rowDropPlace(rows, -5, none)).toEqual({ gap: 0, inside: -1 });
    expect(rowDropPlace(rows, 10, none)).toEqual({ gap: 0, inside: -1 });
    expect(rowDropPlace(rows, 20, none)).toEqual({ gap: 1, inside: -1 });
    expect(rowDropPlace(rows, 200, none)).toEqual({ gap: 3, inside: -1 });
    expect(rowDropPlace(rows, 36 + 18, () => true)).toEqual({ gap: -1, inside: 1 });
    expect(rowDropPlace(rows, 36 + 4, () => true)).toEqual({ gap: 1, inside: -1 });
  });
});
