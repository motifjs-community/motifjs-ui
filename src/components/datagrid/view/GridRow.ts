import { ComponentBase, createSignal, effect, read, untracked } from '@motifx/core';
import type { CellContext } from '../cell-context';
import type { GridAction } from '../grid-action';
import type { GridColumn } from '../grid-column';
import { moreMark } from '../../../core/glyphs';
import { isNode } from '../../../core/node-kind';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD, STATUS_FIELD } from '../model/ColumnModel';
import { KeyedItems } from '../../../parts/data/KeyedItems';
import type { GridModel } from '../model/GridModel';
import type { RowState } from '../row-state';
import type { ActionWidths } from './ActionWidths';
import { createCheck, setCheck } from './check-mark';
import { createDragHandle } from './drag-handle';
import { createExpandButton, setExpandButton } from './expand-button';
import { placeInOrder } from './place-in-order';
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
 * One pooled row of the body, drawn without components: a row element with a cell element per
 * column. It is built once and then shows other rows while the user scrolls; `use` changes what it
 * shows and two effects draw it again: one for the row's look, one for its cells. Cells show the
 * unsaved edit of their row when there is one. The selection check box and the action buttons are
 * plain elements too; only a column's own `cell` content is a component.
 */
export class GridRow<T> {
  readonly element: HTMLDivElement;
  /** Cell elements by field. */
  readonly cells = new Map<string, HTMLDivElement>();
  /** Grid index (new rows included); -1 while the row is not used. */
  index = -1;
  /** The row shown; `undefined` while it is loading. */
  row: T | undefined;
  /** The tracker's id of the row; `undefined` while it is loading. */
  rowId: string | undefined;
  /** The buttons of the actions cell, while the grid has actions. */
  readonly actions: RowActions<T> | null = null;
  private readonly shown = createSignal(0);
  /** Grows when cells come or go while columns are virtual: the cells are drawn again. */
  private readonly columnsShown = createSignal(0);
  private readonly texts = new Map<string, Text>();
  /** Components of the columns' own cell contents, by field. */
  private readonly contents = new Map<string, ComponentBase>();
  /** The nodes after a cell's text node that mark what the search found, and what they were drawn for. */
  private readonly marked = new Map<string, { nodes: ChildNode[]; key: string }>();
  /** Whether the search marks cells now (read when the cells are drawn). */
  private searching = false;
  private readonly stops: (() => void)[] = [];
  private readonly check: HTMLSpanElement;
  private readonly expand: HTMLSpanElement;
  /** The "…" of the adaptive detail. */
  private readonly more: HTMLSpanElement;

  constructor(
    private readonly model: GridModel<T>,
    /** Holds the components of custom cells, so they live and go with it. */
    private readonly host: ComponentBase,
    widths: ActionWidths,
  ) {
    const el = document.createElement('div');
    el.className = 'mx-data-grid__row';
    el.setAttribute('role', 'row');
    el.hidden = true;
    this.element = el;
    this.check = createCheck(model.text('gridSelectRow'));
    this.expand = createExpandButton(model.text('gridDetails'));
    this.more = createExpandButton(model.text('gridAdaptive'));
    this.more.className = 'mx-data-grid__adaptive-button';
    this.more.replaceChildren(moreMark());
    // The grid's own columns always have their cells; a virtual column gets them while it is drawn.
    for (const field of model.columns.state.order) if (model.columns.isInternal(field) || model.columnWindow.has(field)) el.append(this.makeCell(field));
    this.stops.push(
      effect(() => this.drawLook()),
      effect(() => this.drawCells()),
      effect(() => this.drawRanges()),
    );
    if (model.columns.actionsWanted()) {
      this.actions = new RowActions<T>(this.cells.get(ACTIONS_FIELD)!, widths);
      this.stops.push(effect(() => this.drawActions()));
    }
  }

  /** Shows grid row `index` at `top`. Visibility and position change at once, so a cell can take focus right after. */
  use(index: number, row: T | undefined, rowId: string | undefined, top: number) {
    if (this.index !== index || this.row !== row || this.rowId !== rowId) {
      this.index = index;
      this.row = row;
      this.rowId = rowId;
      this.shown.value = this.shown.peek() + 1;
    }
    this.element.hidden = false;
    this.element.style.transform = `translateY(${top}px)`;
  }

  /**
   * Shows whether the row's details are open (`masterDetail`): the arrow, and `aria-expanded` on the
   * row too while the grid is a tree (grouped; ARIA allows it on the rows of a treegrid only).
   * `controls` is the id of the details' row while it is drawn.
   */
  drawExpand(can: boolean, open: boolean, controls: string | null) {
    const el = this.element;
    setExpandButton(this.expand, can, open, this.model.text('gridDetails'), controls);
    if (can && this.model.groups.any) el.setAttribute('aria-expanded', String(open));
    else el.removeAttribute('aria-expanded');
    el.toggleAttribute('data-expanded', can && open);
  }

  /** Shows whether the row's adaptive detail is open on its "…"; `controls` is the id of the detail's row while it is drawn. */
  drawAdaptive(shown: boolean, open: boolean, controls: string | null) {
    setExpandButton(this.more, shown, open, this.model.text('gridAdaptive'), controls);
  }

  /** Draws the row again as it is. */
  redraw() {
    this.shown.value = this.shown.peek() + 1;
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.row !== undefined) {
      this.index = -1;
      this.row = undefined;
      this.rowId = undefined;
      this.shown.value = this.shown.peek() + 1;
    }
    this.element.hidden = true;
  }

  /** Puts the cells in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their cells in the row. */
  arrange(visible: string[]) {
    const drawn = this.model.columnWindow;
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    let made = false;
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      let cell = this.cells.get(field);
      if (!cell) {
        cell = this.makeCell(field);
        made = true;
      }
      desired.push(cell);
      cell.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cells) {
      if (shown.has(field) && drawn.has(field)) continue;
      cell.removeAttribute('aria-colindex');
      if (drawn.all) desired.push(cell);
      else cell.remove();
    }
    placeInOrder(this.element, desired);
    if (made || !drawn.all) this.columnsShown.value = this.columnsShown.peek() + 1;
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
      this.drawLookup(this.cells.get(field)!, text, col);
    }
  }

  /** A column added at run time gets its cell (placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cells.has(field) || !this.model.columnWindow.has(field)) return;
    this.element.append(this.cell(this.model.columns.get(field)));
    this.redraw();
  }

  /** A column taken out loses its cell, and its own content goes. */
  removeColumn(field: string) {
    this.cells.get(field)?.remove();
    this.cells.delete(field);
    this.texts.delete(field);
    this.marked.delete(field);
    const content = this.contents.get(field);
    this.contents.delete(field);
    if (content && !content.isDisposed) void content.dispose({ skipLeaveTransition: true });
  }

  dispose() {
    for (const stop of this.stops) stop();
    this.model.actionSets.markRow(this, false, false);
  }

  private makeCell(field: string): HTMLDivElement {
    if (field === STATUS_FIELD) return this.statusCell();
    if (field === DRAG_FIELD) return this.ownCell(field, 'mx-data-grid__drag', createDragHandle());
    if (field === SELECT_FIELD) return this.ownCell(field, 'mx-data-grid__select', this.check);
    if (field === EXPAND_FIELD) return this.ownCell(field, 'mx-data-grid__expand', this.expand);
    if (field === ACTIONS_FIELD) return this.ownCell(field, 'mx-data-grid__actions');
    if (field === ADAPTIVE_FIELD) return this.ownCell(field, 'mx-data-grid__adaptive-cell', this.more);
    return this.cell(this.model.columns.get(field));
  }

  private cell(col: GridColumn<T>): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__cell';
    cell.setAttribute('role', 'gridcell');
    cell.tabIndex = -1;
    cell.dataset.field = col.field;
    this.cells.set(col.field, cell);
    if (col.cell) {
      const content = col.cell(this.context(col));
      if (content instanceof ComponentBase) {
        this.host.controls.add(content);
        cell.append(content.element as Node);
        this.contents.set(col.field, content);
      } else if (isNode(content)) cell.append(content);
      else if (content !== undefined && content !== null) cell.append(String(content));
    } else {
      const text = document.createTextNode('');
      cell.append(text);
      this.texts.set(col.field, text);
    }
    return cell;
  }

  /** A cell of one of the grid's own columns (selection, actions). */
  private ownCell(field: string, className: string, content?: Node): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = `mx-data-grid__cell ${className}`;
    cell.setAttribute('role', 'gridcell');
    cell.tabIndex = -1;
    cell.dataset.field = field;
    if (content) cell.append(content);
    this.cells.set(field, cell);
    return cell;
  }

  /** The row status cell: a mark by state (drawn by CSS), its name for assistive technology, the message on hover. */
  private statusCell(): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__cell mx-data-grid__status';
    cell.setAttribute('role', 'gridcell');
    cell.tabIndex = -1;
    cell.dataset.field = STATUS_FIELD;
    const mark = document.createElement('span');
    mark.className = 'mx-data-grid__status-mark';
    mark.setAttribute('aria-hidden', 'true');
    cell.append(mark);
    this.cells.set(STATUS_FIELD, cell);
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

  private drawLook() {
    void this.shown.value;
    const model = this.model;
    const el = this.element;
    const { index, rowId } = this;
    void model.state.edits;
    if (index < 0) {
      el.removeAttribute('aria-rowindex');
      return;
    }
    el.setAttribute('aria-rowindex', String(model.ariaRowIndex(index)));
    // Grouped, the grid is a tree: data rows sit below every level (new rows outside the groups).
    const levels = model.groups.state.items.length;
    if (levels) el.setAttribute('aria-level', String(model.addedIndex(index) >= 0 ? 1 : levels + 1));
    else el.removeAttribute('aria-level');
    el.toggleAttribute('data-odd', index % 2 === 1);
    el.toggleAttribute('data-loading', this.row === undefined);
    const active = model.state.activeRow === index;
    el.toggleAttribute('data-active', active);
    const status = model.status(rowId);
    if (status) el.dataset.status = status;
    else delete el.dataset.status;

    // A loaded data row can be dragged; its drag cell says how, also by the keys.
    const drag = model.rowDrag;
    const draggable = drag.enabled && this.row !== undefined && rowId !== undefined && !model.isNew(rowId);
    el.toggleAttribute('data-draggable', draggable);
    const dragCell = this.cells.get(DRAG_FIELD)!;
    if (draggable && drag.showsIcons) {
      dragCell.setAttribute('aria-label', model.text('gridDragRow'));
      // `aria-keyshortcuts` names the keys as `KeyboardEvent` does: Control, Meta.
      const keys = drag.get('keyboard') ? [...drag.get('moveUpKeys'), ...drag.get('moveDownKeys')].map((k) => k.replace(/\bctrl\b/gi, 'Control').replace(/\b(cmd|mod)\b/gi, 'Meta')).join(' ') : '';
      if (keys) dragCell.setAttribute('aria-keyshortcuts', keys);
      else dragCell.removeAttribute('aria-keyshortcuts');
    } else {
      dragCell.removeAttribute('aria-label');
      dragCell.removeAttribute('aria-keyshortcuts');
    }

    // Selection: new rows and rows still loading have no key to select by.
    const mode = model.settings.get('selection');
    const selectable = mode !== 'none' && this.row !== undefined && rowId !== undefined && !model.isNew(rowId);
    const selected = selectable && model.selection.isSelected(model.selectId(this.row));
    el.toggleAttribute('data-selected', selected);
    if (mode !== 'none') el.setAttribute('aria-selected', String(selected));
    else el.removeAttribute('aria-selected');
    if (mode === 'multiple') setCheck(this.check, selected, model.text('gridSelectRow'), selectable);

    // The message of the active cell describes it.
    const activeField = active ? model.state.activeField : '';
    for (const [field, cell] of this.cells) {
      if (!model.columns.isInternal(field) && field === activeField && model.error(rowId, field)) cell.setAttribute('aria-describedby', model.errorId);
      else cell.removeAttribute('aria-describedby');
    }

    const statusCell = this.cells.get(STATUS_FIELD)!;
    const message = status === 'failed' || status === 'invalid' ? model.rowMessage(rowId) || model.text('gridSaveFailed') : '';
    if (status) statusCell.dataset.status = status;
    else delete statusCell.dataset.status;
    const label = !status ? null : message ? `${model.text('gridStatusFailed')}: ${message}` : model.text(STATUS_TEXT[status as keyof typeof STATUS_TEXT]);
    if (label) statusCell.setAttribute('aria-label', label);
    else statusCell.removeAttribute('aria-label');
    if (message) statusCell.dataset.error = message;
    else delete statusCell.dataset.error;
  }

  /**
   * The cell ranges and the rows a drag selects, on the cells only: `data-range` with the edges of
   * the ranges, `data-run` with the edges of the run, and `aria-selected` while cells can be
   * selected. Only what changed is written; the cells' text is left alone.
   */
  private drawRanges() {
    void this.shown.value;
    void this.columnsShown.value;
    const { index } = this;
    const look = this.model.cellRanges.look;
    const loaded = index >= 0 && this.row !== undefined;
    const marks = loaded ? this.model.cellRanges.marksOf(index, look) : null;
    const { run, first, last } = look;
    const inRun = loaded && run !== null && index >= run.top && index <= run.bottom;
    const selectable = look.on ? look.selectable : null;
    for (const [field, cell] of this.cells) {
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
      const selected = selectable?.has(field) ? String(mark !== undefined) : null;
      if (cell.getAttribute('aria-selected') !== selected) {
        if (selected === null) cell.removeAttribute('aria-selected');
        else cell.setAttribute('aria-selected', selected);
      }
    }
  }

  private drawActions() {
    void this.shown.value;
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

  private drawCells() {
    void this.shown.value;
    void this.columnsShown.value;
    const model = this.model;
    void model.state.edits;
    void model.state.version;
    const { row, rowId } = this;
    const formatter = model.formatter;
    // Read once per row: while nothing is searched no cell asks for marks.
    this.searching = model.search.marking();
    const some = !model.columnWindow.all;
    for (const [field, cell] of this.cells) {
      if (model.columns.isInternal(field) || (some && cell.parentElement !== this.element)) continue;
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
      cell.toggleAttribute('data-changed', model.isChanged(rowId, field));
      if (error) {
        cell.dataset.error = error;
        cell.setAttribute('aria-invalid', 'true');
      } else {
        delete cell.dataset.error;
        cell.removeAttribute('aria-invalid');
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
      for (const [field, element] of this.cells) {
        if (some && element.parentElement !== this.element) continue;
        const value = model.columns.isInternal(field) ? undefined : model.value(rowId, row, model.columns.get(field));
        ev.cellPrepared.fire({ field, row, rowIndex: index, value, isNew, element });
      }
    }
    const isSelected = !isNew && model.selection.isSelected(model.selectId(row));
    ev.tell(ev.rowPrepared, () => ({ row, rowIndex: index, rowType: isNew ? ('new' as const) : ('data' as const), isSelected, element: this.element }));
  }

  /** Writes a cell's text, with what the search found in it marked (`<mark>`). */
  private write(field: string, text: Text, shown: string, value: unknown) {
    const ranges = this.searching && this.row !== undefined ? this.model.search.ranges(field, shown, value) : NO_RANGES;
    const marked = this.marked.get(field);
    if (!ranges.length) {
      if (marked) {
        for (const node of marked.nodes) node.remove();
        this.marked.delete(field);
      }
      if (text.data !== shown) text.data = shown;
      return;
    }
    const key = `${ranges.join(';')}|${shown}`;
    if (marked?.key === key) return;
    if (marked) for (const node of marked.nodes) node.remove();
    const nodes: ChildNode[] = [];
    let at = ranges[0][0];
    text.data = shown.slice(0, at);
    for (const [start, end] of ranges) {
      if (start > at) nodes.push(document.createTextNode(shown.slice(at, start)));
      const mark = document.createElement('mark');
      mark.className = 'mx-data-grid__mark';
      mark.textContent = shown.slice(start, end);
      nodes.push(mark);
      at = end;
    }
    if (at < shown.length) nodes.push(document.createTextNode(shown.slice(at)));
    text.after(...nodes);
    this.marked.set(field, { nodes, key });
  }

  /** A lookup cell: its text, empty and busy while the key loads, the key itself (muted, with a hint) when the source does not have it. */
  private drawLookup(cell: HTMLDivElement, text: Text, col: GridColumn<T>) {
    const model = this.model;
    const { row, rowId } = this;
    // Keys are asked for once the body is measured, so the first request holds every key on the screen.
    const value = model.value(rowId, row, col);
    const look = model.lookups.cell(col, row, value, model.isChanged(rowId, col.field), model.state.measured);
    this.write(col.field, text, look.text, value);
    if (look.state === 'loading' || look.state === 'missing') cell.dataset.lookup = look.state;
    else delete cell.dataset.lookup;
    if (look.hint) cell.dataset.hint = look.hint;
    else delete cell.dataset.hint;
    busy(cell, look.state === 'loading' || model.isBusy(rowId, col.field));
  }
}

/** Writes `data-<name>` when it changed; `undefined` takes it away. */
function setData(cell: HTMLElement, name: string, value: string | undefined) {
  if (cell.dataset[name] === value) return;
  if (value === undefined) delete cell.dataset[name];
  else cell.dataset[name] = value;
}

function busy(cell: HTMLElement, on: boolean) {
  if (on) cell.setAttribute('aria-busy', 'true');
  else cell.removeAttribute('aria-busy');
}
