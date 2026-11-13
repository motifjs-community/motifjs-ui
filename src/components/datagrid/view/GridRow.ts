import { Component, ComponentBase, createSignal, untracked } from '@motifx/core';
import { orderControls } from '../../../core/order-controls';
import type { CellContext } from '../cell-context';
import type { CellTipTarget } from './cell-tip-target';
import type { GridAction } from '../grid-action';
import type { GridColumn } from '../grid-column';
import { part, removePart, textPart } from '../../../core/draw-parts';
import { css, mark, put, text as writeText } from '../../../core/part-writes';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD, STATUS_FIELD } from '../model/ColumnModel';
import { KeyedItems } from '../../../parts/data/KeyedItems';
import type { GridModel } from '../model/GridModel';
import type { RowState } from '../row-state';
import type { ActionWidths } from './ActionWidths';
import { createCheck, drawCheck } from './check-mark';
import { createDragHandle } from './drag-handle';
import { createExpandButton, drawExpandButton } from './expand-button';
import type { ResolvedAction } from './resolved-action';
import { RowActions } from './RowActions';
import { givenValue } from '../../../core/given-field';
import { readField } from '../model/read-field';

const NO_RANGES: [number, number][] = [];

const STATUS_TEXT = {
  new: 'gridStatusNew',
  changed: 'gridStatusChanged',
  removed: 'gridStatusRemoved',
  saving: 'gridStatusSaving',
} as const;

/**
 * One pooled row of the body: a row component with a cell component per column, so a column's own
 * `cell` content is a child of its cell. It is built once and then shows other rows while the user
 * scrolls; `use` changes what it shows and draws it. It follows nothing: the body has it draw a part
 * again (`drawLook`, `drawCells`, `drawRanges`, `drawActions`) when the grid tells what changed. Cells
 * show the unsaved edit of their row when there is one. Inside the cells, texts, the selection check
 * box and the action buttons are parts of their cell.
 */
export class GridRow<T> {
  /** The row's component, a child of the body. */
  readonly part: Component<HTMLDivElement>;
  readonly element: HTMLDivElement;
  /** Cell components by field. */
  private readonly cellParts = new Map<string, Component<HTMLDivElement>>();
  /** Grid index (new rows included); -1 while the row is not used. */
  index = -1;
  /** The row shown; `undefined` while it is loading. */
  row: T | undefined;
  /** The tracker's id of the row; `undefined` while it is loading. */
  rowId: string | undefined;
  /** The buttons of the actions cell, while the grid has actions. */
  readonly actions: RowActions<T> | null = null;
  /** Grows when the row shows another one or is drawn again: what a column's own cell content reads follows it. */
  private readonly shown = createSignal(0);
  private readonly texts = new Map<string, ComponentBase>();
  /** The parts after a cell's text that mark what the search found, and what they were drawn for. */
  private readonly marked = new Map<string, { parts: ComponentBase[]; key: string }>();
  /** Whether the search marks cells now (read when the cells are drawn). */
  private searching = false;
  /** What each cell shows as text, and the hints of lookup cells, for the cell tip. */
  private readonly shownTexts = new Map<string, string>();
  private readonly hints = new Map<string, string>();
  /** The message of a row that failed to save, on its status cell. */
  private statusMessage = '';
  private readonly check: Component<HTMLSpanElement>;
  private readonly expand: Component<HTMLSpanElement>;
  /** The "…" of the adaptive detail. */
  private readonly more: Component<HTMLSpanElement>;

  constructor(
    private readonly model: GridModel<T>,
    widths: ActionWidths,
  ) {
    this.part = new Component<HTMLDivElement>('div');
    const el = this.part.element;
    this.part.class.add('mx-data-grid__row');
    this.part.attr.add({ role: 'row' });
    mark(this.part, 'hidden', true);
    this.element = el;
    this.check = createCheck(model.text('gridSelectRow'));
    this.expand = createExpandButton(model.text('gridDetails'));
    this.more = createExpandButton(model.text('gridAdaptive'), 'mx-data-grid__adaptive-button', 'more');
    // The grid's own columns always have their cells; a virtual column gets them while it is drawn.
    for (const field of model.columns.state.order) if (model.columns.isInternal(field) || model.columnWindow.has(field)) this.part.controls.add(this.makeCell(field));
    if (model.columns.actionsWanted()) this.actions = new RowActions<T>(this.cellParts.get(ACTIONS_FIELD)!, widths);
    this.draw();
  }

  /** The cell component of `field`, while the row has that cell. */
  cellPart(field: string): Component<HTMLDivElement> | undefined {
    return this.cellParts.get(field);
  }

  /**
   * What the cell tip shows for the cell of `field`: its message, the hint of a lookup cell, and its text when it is cut
   * off (none for a cell that holds buttons or content of its own); `null` while the row has no such cell.
   */
  tipOf(field: string): CellTipTarget | null {
    const part = this.cellParts.get(field);
    if (!part) return null;
    const { model } = this;
    const message = (): string => (field === STATUS_FIELD ? this.statusMessage : model.columns.isInternal(field) ? '' : model.error(this.rowId, field));
    const hint = (): string => this.hints.get(field) ?? '';
    return this.shownTexts.has(field) ? { part, message, hint, text: () => this.shownTexts.get(field) ?? '' } : { part, message, hint };
  }

  /** The text the cell of `field` shows; `undefined` for a cell that holds buttons or content of its own. */
  shownText(field: string): string | undefined {
    return this.shownTexts.get(field);
  }

  /** The tip of the action button or the cell an event came from; `null` when it came from none of them. */
  tipFrom(e: Event): CellTipTarget | null {
    const button = this.actions?.tipFrom(e);
    if (button) return button;
    for (const [field, cell] of this.cellParts) if (cell.motif.isEventFrom(e)) return this.tipOf(field);
    return null;
  }

  /** Draws all of the row as it is. */
  draw() {
    untracked(() => {
      this.drawLook();
      this.drawCells();
      this.drawRanges();
      if (this.actions) this.drawActions();
    });
  }

  /** Shows grid row `index` at `top`. Visibility and position change at once, so a cell can take focus right after. */
  use(index: number, row: T | undefined, rowId: string | undefined, top: number) {
    if (this.index !== index || this.row !== row || this.rowId !== rowId) {
      this.index = index;
      this.row = row;
      this.rowId = rowId;
      this.shown.value = this.shown.peek() + 1;
      this.draw();
    }
    mark(this.part, 'hidden', false);
    css(this.part, 'transform', `translateY(${top}px)`);
  }

  /**
   * Shows whether the row's details are open (`masterDetail`): the arrow, and `aria-expanded` on the
   * row too while the grid is a tree (grouped; ARIA allows it on the rows of a treegrid only).
   * `controls` is the id of the details' row while it is drawn.
   */
  drawExpand(can: boolean, open: boolean, controls: string | null) {
    drawExpandButton(this.expand, can, open, this.model.text('gridDetails'), controls);
    if (can && this.model.groups.any) put(this.part, 'aria-expanded', String(open));
    else put(this.part, 'aria-expanded', null);
    mark(this.part, 'data-expanded', can && open);
  }

  /** Shows whether the row's adaptive detail is open on its "…"; `controls` is the id of the detail's row while it is drawn. */
  drawAdaptive(shown: boolean, open: boolean, controls: string | null) {
    drawExpandButton(this.more, shown, open, this.model.text('gridAdaptive'), controls);
  }

  /** Draws the row again as it is. */
  redraw() {
    this.shown.value = this.shown.peek() + 1;
    this.draw();
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.row !== undefined) {
      this.index = -1;
      this.row = undefined;
      this.rowId = undefined;
      this.shown.value = this.shown.peek() + 1;
      this.draw();
    }
    mark(this.part, 'hidden', true);
  }

  /** Puts the cells in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their cells in the row. */
  arrange(visible: string[]) {
    const drawn = this.model.columnWindow;
    const shown = new Set(visible);
    const desired: Component<HTMLDivElement>[] = [];
    let made = false;
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      let cell = this.cellParts.get(field);
      if (!cell) {
        cell = this.makeCell(field);
        made = true;
      }
      desired.push(cell);
      put(cell, 'aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cellParts) {
      if (shown.has(field) && drawn.has(field)) continue;
      put(cell, 'aria-colindex', null);
      if (drawn.all) desired.push(cell);
      else if (cell.parent === this.part) this.part.controls.silentDetach(cell);
    }
    orderControls(this.part, desired);
    if (made || !drawn.all)
      untracked(() => {
        this.drawCells();
        this.drawRanges();
      });
  }

  /** Keys of a lookup source came: the lookup cells that show one of them are drawn again (all of them for `null`). */
  drawLookups(items: KeyedItems<any>, keys: readonly string[] | null) {
    if (this.row === undefined) return;
    const model = this.model;
    const wanted = keys ? new Set(keys) : null;
    for (const [field, text] of this.texts) {
      const col = model.columns.get(field);
      if (!col.lookup || model.lookups.items(col) !== items) continue;
      if (wanted && !wanted.has(KeyedItems.keyString(model.value(this.rowId, this.row, col)))) continue;
      this.drawLookup(this.cellParts.get(field)!, text, col);
    }
  }

  /** A column added at run time gets its cell (placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cellParts.has(field) || !this.model.columnWindow.has(field)) return;
    this.part.controls.add(this.cell(this.model.columns.get(field)));
    this.redraw();
  }

  /** A column removed loses its cell, and its own content goes. */
  removeColumn(field: string) {
    const cell = this.cellParts.get(field);
    this.cellParts.delete(field);
    this.texts.delete(field);
    this.marked.delete(field);
    this.shownTexts.delete(field);
    this.hints.delete(field);
    // Its own content goes with it.
    if (cell?.parent) cell.parent.controls.remove(cell);
    else if (cell && !cell.isDisposed) void cell.dispose({ skipLeaveTransition: true });
  }

  dispose() {
    this.model.actionSets.markRow(this, false, false);
    if (this.part.parent) this.part.parent.controls.remove(this.part);
    else if (!this.part.isDisposed) void this.part.dispose({ skipLeaveTransition: true });
  }

  private makeCell(field: string): Component<HTMLDivElement> {
    if (field === STATUS_FIELD) return this.statusCell();
    if (field === DRAG_FIELD) return this.ownCell(field, 'mx-data-grid__drag', createDragHandle());
    if (field === SELECT_FIELD) return this.ownCell(field, 'mx-data-grid__select', this.check);
    if (field === EXPAND_FIELD) return this.ownCell(field, 'mx-data-grid__expand', this.expand);
    if (field === ACTIONS_FIELD) return this.ownCell(field, 'mx-data-grid__actions');
    if (field === ADAPTIVE_FIELD) return this.ownCell(field, 'mx-data-grid__adaptive-cell', this.more);
    return this.cell(this.model.columns.get(field));
  }

  /** A cell component, known by its field. */
  private newCell(field: string, className: string): Component<HTMLDivElement> {
    const part = new Component<HTMLDivElement>('div');
    part.class.add(className);
    part.attr.add({ role: 'gridcell' });
    put(part, 'tabindex', '-1');
    part.attr.add({ 'data-field': field });
    this.cellParts.set(field, part);
    return part;
  }

  private cell(col: GridColumn<T>): Component<HTMLDivElement> {
    const cell = this.newCell(col.field, 'mx-data-grid__cell');
    if (col.cell) {
      const content = col.cell(this.context(col));
      if (content instanceof ComponentBase) cell.controls.add(content);
      else if (content !== undefined && content !== null) {
        textPart(cell, String(content));
        this.shownTexts.set(col.field, String(content));
      }
    } else {
      this.texts.set(col.field, textPart(cell, ''));
    }
    return cell;
  }

  /** A cell of one of the grid's own columns (selection, actions). */
  private ownCell(field: string, className: string, content?: ComponentBase): Component<HTMLDivElement> {
    const cell = this.newCell(field, `mx-data-grid__cell ${className}`);
    if (content) cell.controls.add(content);
    return cell;
  }

  /** The row status cell: a mark by state (drawn by CSS), its name for assistive technology, the message on hover. */
  private statusCell(): Component<HTMLDivElement> {
    const cell = this.newCell(STATUS_FIELD, 'mx-data-grid__cell mx-data-grid__status');
    part(cell, 'span', 'mx-data-grid__status-mark').attr.add({ 'aria-hidden': 'true' });
    return cell;
  }

  private context(col: GridColumn<T>): CellContext<T> {
    const view = this;
    const model = this.model;
    return {
      get row() {
        void view.shown.value;
        return view.row;
      },
      get value() {
        void view.shown.value;
        void model.state.edits;
        return model.value(view.rowId, view.row, col);
      },
      get index() {
        void view.shown.value;
        return view.index;
      },
      column: col,
    };
  }

  /** The row's own marks: its place, odd, active, status, selection, drag and the messages of its cells. */
  drawLook() {
    const model = this.model;
    const { index, rowId } = this;
    void model.state.edits;
    if (index < 0) {
      put(this.part, 'aria-rowindex', null);
      return;
    }
    put(this.part, 'aria-rowindex', String(model.ariaRowIndex(index)));
    // Grouped, the grid is a tree: data rows sit below every level (new rows outside the groups).
    const levels = model.groups.state.items.length;
    if (levels) put(this.part, 'aria-level', String(model.addedIndex(index) >= 0 ? 1 : levels + 1));
    else put(this.part, 'aria-level', null);
    mark(this.part, 'data-odd', index % 2 === 1);
    mark(this.part, 'data-loading', this.row === undefined);
    const active = model.state.activeRow === index;
    mark(this.part, 'data-active', active);
    const status = model.status(rowId);
    if (status) put(this.part, 'data-status', status);
    else put(this.part, 'data-status', null);

    // A loaded data row can be dragged; its drag cell says how, also by the keys.
    const drag = model.rowDrag;
    const draggable = drag.enabled && this.row !== undefined && rowId !== undefined && !model.isNew(rowId);
    mark(this.part, 'data-draggable', draggable);
    const dragCell = this.cellParts.get(DRAG_FIELD)!;
    if (draggable && drag.showsIcons) {
      put(dragCell, 'aria-label', model.text('gridDragRow'));
      // `aria-keyshortcuts` names the keys as `KeyboardEvent` does: Control, Meta.
      const keys = drag.get('keyboard') ? [...drag.get('moveUpKeys'), ...drag.get('moveDownKeys')].map((k) => k.replace(/\bctrl\b/gi, 'Control').replace(/\b(cmd|mod)\b/gi, 'Meta')).join(' ') : '';
      if (keys) put(dragCell, 'aria-keyshortcuts', keys);
      else put(dragCell, 'aria-keyshortcuts', null);
    } else {
      put(dragCell, 'aria-label', null);
      put(dragCell, 'aria-keyshortcuts', null);
    }

    // Selection: new rows and rows still loading have no key to select by.
    const mode = model.settings.get('selection');
    const selectable = mode !== 'none' && this.row !== undefined && rowId !== undefined && !model.isNew(rowId);
    const selected = selectable && model.selection.isSelected(model.selectId(this.row));
    mark(this.part, 'data-selected', selected);
    if (mode !== 'none') put(this.part, 'aria-selected', String(selected));
    else put(this.part, 'aria-selected', null);
    if (mode === 'multiple') drawCheck(this.check, selected, model.text('gridSelectRow'), selectable);

    // The message of the active cell describes it.
    const activeField = active ? model.state.activeField : '';
    for (const [field, cell] of this.cellParts) {
      if (!model.columns.isInternal(field) && field === activeField && model.error(rowId, field)) put(cell, 'aria-describedby', model.errorId);
      else put(cell, 'aria-describedby', null);
    }

    const statusCell = this.cellParts.get(STATUS_FIELD)!;
    const message = status === 'failed' || status === 'invalid' ? model.rowMessage(rowId) || model.text('gridSaveFailed') : '';
    this.statusMessage = message;
    if (status) put(statusCell, 'data-status', status);
    else put(statusCell, 'data-status', null);
    const label = !status ? null : message ? `${model.text('gridStatusFailed')}: ${message}` : model.text(STATUS_TEXT[status as keyof typeof STATUS_TEXT]);
    if (label) put(statusCell, 'aria-label', label);
    else put(statusCell, 'aria-label', null);
    if (message) put(statusCell, 'data-error', message);
    else put(statusCell, 'data-error', null);
  }

  /**
   * The cell ranges and the rows a drag selects, on the cells only: `data-range` with the edges of
   * the ranges, `data-run` with the edges of the run, and `aria-selected` while cells can be
   * selected. Only what changed is written; the cells' text is left alone.
   */
  drawRanges() {
    const { index } = this;
    const look = this.model.cellRanges.look;
    const loaded = index >= 0 && this.row !== undefined;
    const marks = loaded ? this.model.cellRanges.marksOf(index, look) : null;
    const { run, first, last } = look;
    const inRun = loaded && run !== null && index >= run.top && index <= run.bottom;
    const selectable = look.on ? look.selectable : null;
    for (const [field, cell] of this.cellParts) {
      const mark = marks?.get(field);
      setData(cell, 'range', mark);
      let edges: string | undefined;
      if (inRun) {
        const parts: string[] = [];
        if (index === run.top) parts.push('top');
        if (index === run.bottom) parts.push('bottom');
        if (field === first) parts.push('start');
        if (field === last) parts.push('end');
        edges = parts.join(' ');
      }
      setData(cell, 'run', edges);
      put(cell, 'aria-selected', selectable?.has(field) ? String(mark !== undefined) : null);
    }
  }

  drawActions() {
    if (!this.actions) return;
    const model = this.model;
    const sets = model.actionSets;
    const { row, rowId, index } = this;
    const width = model.columns.width(ACTIONS_FIELD);
    void model.state.rowHeight;
    const display = model.settings.get('actionsDisplay');
    const more = { label: model.text('gridMoreActionsForRow', { row: model.formatter.count(index + 1) }), hint: model.text('gridMoreActions') };
    const shows = model.columns.showsActions();
    let list: ResolvedAction<T>[] = [];
    let inRow = false;
    let never = false;
    // With `actions` as a function the rows tell whether an action sits in the row.
    if ((shows || !model.actionList) && row !== undefined && rowId !== undefined && index >= 0) {
      const state = model.rowState(row, rowId, index);
      const placed = model.rowActions(row, state).filter((a) => sets.locationOf(a) === 'row');
      inRow = placed.length > 0;
      never = placed.some((a) => sets.menuOf(a) === 'never');
      if (shows) list = placed.map((action) => this.resolve(action, row, state));
    }
    untracked(() => {
      sets.markRow(this, inRow, never);
      this.actions!.draw(list, width, more, display);
    });
  }

  private resolve(action: GridAction<T>, row: T, state: RowState): ResolvedAction<T> {
    const text = readField(action, 'text') ?? '';
    const hasIcon = action.icon !== undefined && action.icon !== null;
    const showText = action.showText ?? !hasIcon;
    const given = givenValue<GridAction<T>['disabled']>(action, 'disabled');
    const disabled = typeof given === 'function' ? !!untracked(() => given(row, state)) : !!given;
    return { action, row, state, text, hint: readField(action, 'hint') ?? (showText ? '' : text), disabled, hasIcon, showText, menu: this.model.actionSets.menuOf(action) };
  }

  /** The cells' texts, their search marks, and whether they are changed, busy or in error. */
  drawCells() {
    const model = this.model;
    void model.state.edits;
    void model.state.version;
    const { row, rowId } = this;
    const formatter = model.formatter;
    // Read once per row: while nothing is searched no cell asks for marks.
    this.searching = model.search.marking();
    const some = !model.columnWindow.all;
    for (const [field, cell] of this.cellParts) {
      if (model.columns.isInternal(field) || (some && cell.parent !== this.part)) continue;
      const col = model.columns.get(field);
      const text = this.texts.get(field);
      if (text && col.lookup) this.drawLookup(cell, text, col);
      else {
        if (text) {
          const value = model.value(rowId, row, col);
          this.write(field, text, formatter.text(col, row, value), value);
        }
        busy(cell, model.isBusy(rowId, field));
      }
      const error = model.error(rowId, field);
      mark(cell, 'data-changed', model.isChanged(rowId, field));
      if (error) {
        put(cell, 'data-error', error);
        put(cell, 'aria-invalid', 'true');
      } else {
        put(cell, 'data-error', null);
        put(cell, 'aria-invalid', null);
      }
    }
    const ev = model.events;
    if (row !== undefined && this.index >= 0 && (ev.listened(ev.cellPrepared) || ev.listened(ev.rowPrepared))) untracked(() => this.tellPrepared(row));
  }

  /** `onCellPrepared` for each cell of the row (the grid's own columns too), then `onRowPrepared`. */
  private tellPrepared(row: T) {
    const { model, index, rowId } = this;
    const ev = model.events;
    const isNew = model.isNew(rowId);
    if (ev.listened(ev.cellPrepared)) {
      const some = !model.columnWindow.all;
      for (const [field, cell] of this.cellParts) {
        if (some && cell.parent !== this.part) continue;
        const value = model.columns.isInternal(field) ? undefined : model.value(rowId, row, model.columns.get(field));
        ev.cellPrepared.fire({ field, row, rowIndex: index, value, isNew, part: cell });
      }
    }
    const isSelected = !isNew && model.selection.isSelected(model.selectId(row));
    ev.tell(ev.rowPrepared, () => ({ row, rowIndex: index, rowType: isNew ? ('new' as const) : ('data' as const), isSelected, part: this.part }));
  }

  /** Writes a cell's text, with what the search found in it marked (`<mark>`). */
  private write(field: string, text: ComponentBase, shown: string, value: unknown) {
    this.shownTexts.set(field, shown);
    const ranges = this.searching && this.row !== undefined ? this.model.search.ranges(field, shown, value) : NO_RANGES;
    const marked = this.marked.get(field);
    if (!ranges.length) {
      if (marked) {
        for (const c of marked.parts) removePart(c);
        this.marked.delete(field);
      }
      writeText(text, shown);
      return;
    }
    const key = `${ranges.join(';')}|${shown}`;
    if (marked?.key === key) return;
    if (marked) for (const c of marked.parts) removePart(c);
    // The text is the only part of its cell: the marks and the texts between them follow it.
    const cell = text.parent!;
    const parts: ComponentBase[] = [];
    let at = ranges[0][0];
    writeText(text, shown.slice(0, at));
    for (const [start, end] of ranges) {
      if (start > at) parts.push(textPart(cell, shown.slice(at, start)));
      const mark = part<HTMLElement>(cell, 'mark', 'mx-data-grid__mark');
      mark.setText(shown.slice(start, end));
      parts.push(mark);
      at = end;
    }
    if (at < shown.length) parts.push(textPart(cell, shown.slice(at)));
    this.marked.set(field, { parts, key });
  }

  /** A lookup cell: its text, empty and busy while the key loads, the key itself (muted, with a hint) when the source does not have it. */
  private drawLookup(cell: Component<HTMLDivElement>, text: ComponentBase, col: GridColumn<T>) {
    const model = this.model;
    const { row, rowId } = this;
    // Keys are requested once the body is measured, so the first request holds every key on the screen.
    const value = model.value(rowId, row, col);
    const look = model.lookups.cell(col, row, value, model.isChanged(rowId, col.field), model.state.measured);
    this.write(col.field, text, look.text, value);
    if (look.state === 'loading' || look.state === 'missing') put(cell, 'data-lookup', look.state);
    else put(cell, 'data-lookup', null);
    this.hints.set(col.field, look.hint ?? '');
    if (look.hint) put(cell, 'data-hint', look.hint);
    else put(cell, 'data-hint', null);
    busy(cell, look.state === 'loading' || model.isBusy(rowId, col.field));
  }
}

/** Writes `data-<name>` when it changed; `undefined` takes it away. */
function setData(cell: Component<HTMLDivElement>, name: string, value: string | undefined) {
  if (value === '') mark(cell, `data-${name}`, true);
  else put(cell, `data-${name}`, value);
}

function busy(cell: ComponentBase, on: boolean) {
  if (on) put(cell, 'aria-busy', 'true');
  else put(cell, 'aria-busy', null);
}
