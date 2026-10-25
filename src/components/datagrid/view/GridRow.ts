import { ComponentBase, createSignal, effect, read, untracked } from '@motifx/core';
import type { CellContext } from '../cell-context';
import type { GridAction } from '../grid-action';
import type { GridColumn } from '../grid-column';
import { ACTIONS_FIELD, SELECT_FIELD, STATUS_FIELD } from '../model/ColumnModel';
import type { GridModel } from '../model/GridModel';
import type { RowState } from '../row-state';
import type { ActionWidths } from './ActionWidths';
import { createCheck, setCheck } from './check-mark';
import { placeInOrder } from './place-in-order';
import type { ResolvedAction } from './resolved-action';
import { RowActions } from './RowActions';

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
  private readonly texts = new Map<string, Text>();
  private readonly stops: (() => void)[] = [];
  private readonly check: HTMLSpanElement;

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
    for (const field of model.columns.state.order) {
      if (field === STATUS_FIELD) el.append(this.statusCell());
      else if (field === SELECT_FIELD) el.append(this.ownCell(field, 'mx-data-grid__select', this.check));
      else if (field === ACTIONS_FIELD) el.append(this.ownCell(field, 'mx-data-grid__actions'));
      else el.append(this.cell(model.columns.get(field)));
    }
    this.stops.push(
      effect(() => this.drawLook()),
      effect(() => this.drawCells()),
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

  /** Puts the cells in display order and numbers the visible ones. */
  arrange(visible: string[]) {
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    visible.forEach((field, i) => {
      const cell = this.cells.get(field);
      if (!cell) return;
      desired.push(cell);
      cell.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cells) {
      if (shown.has(field)) continue;
      desired.push(cell);
      cell.removeAttribute('aria-colindex');
    }
    placeInOrder(this.element, desired);
  }

  dispose() {
    for (const stop of this.stops) stop();
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
      } else if (content instanceof Node) cell.append(content);
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
    el.setAttribute('aria-rowindex', String(index + 1 + model.headRows));
    el.toggleAttribute('data-odd', index % 2 === 1);
    el.toggleAttribute('data-loading', this.row === undefined);
    const active = model.state.activeRow === index;
    el.toggleAttribute('data-active', active);
    const status = model.status(rowId);
    if (status) el.dataset.status = status;
    else delete el.dataset.status;

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

  private drawActions() {
    void this.shown.value;
    const model = this.model;
    const { row, rowId, index } = this;
    const width = model.columns.width(ACTIONS_FIELD);
    void model.state.rowHeight;
    const more = model.text('gridMoreActions');
    let list: ResolvedAction<T>[] = [];
    if (model.columns.showsActions() && row !== undefined && rowId !== undefined && index >= 0) {
      const state = model.rowState(row, rowId, index);
      list = model.rowActions(row, state).map((action) => this.resolve(action, row, state));
    }
    untracked(() => this.actions!.draw(list, width, more));
  }

  private resolve(action: GridAction<T>, row: T, state: RowState): ResolvedAction<T> {
    const text = read(action.text) ?? '';
    const hasIcon = action.icon !== undefined && action.icon !== null;
    const showText = action.showText ?? !hasIcon;
    const disabled = typeof action.disabled === 'function' ? action.disabled(row, state) : !!action.disabled;
    return { action, row, state, text, hint: read(action.hint) ?? (showText ? '' : text), disabled, hasIcon, showText };
  }

  private drawCells() {
    void this.shown.value;
    const model = this.model;
    void model.state.edits;
    void model.state.version;
    const { row, rowId } = this;
    const formatter = model.formatter;
    for (const [field, cell] of this.cells) {
      if (model.columns.isInternal(field)) continue;
      const col = model.columns.get(field);
      const text = this.texts.get(field);
      if (text) {
        const shown = formatter.text(col, row, model.value(rowId, row, col));
        if (text.data !== shown) text.data = shown;
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
  }
}
