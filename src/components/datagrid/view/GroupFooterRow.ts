import { untracked } from '@motifx/core';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { fillSummaryCell } from './summary-cell';
import { placeInOrder } from './place-in-order';

/**
 * One pooled footer row of a group: after the group's rows, a cell per column with the group items
 * shown in the footer (`showInGroupFooter`), on one line each. Made once and reused for other groups
 * while the user scrolls, like the other rows. The row itself takes focus, as a group row's cell does.
 * It follows nothing: it is drawn when it shows another group, and the body draws it again when the
 * grid tells a change it reads.
 */
export class GroupFooterRow<T> {
  readonly element: HTMLDivElement;
  readonly cells = new Map<string, HTMLDivElement>();
  /** Grid index; -1 while the row is not used. */
  index = -1;
  node: GroupNode | null = null;

  constructor(private readonly model: GridModel<T>) {
    const el = document.createElement('div');
    el.className = 'mx-data-grid__row mx-data-grid__group-footer';
    el.setAttribute('role', 'row');
    el.tabIndex = -1;
    el.hidden = true;
    this.element = el;
    for (const field of model.columns.state.order) this.addColumn(field);
    this.draw();
  }

  /** A column's cell (one added at run time too; placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cells.has(field) || !this.model.columnWindow.has(field)) return;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__cell mx-data-grid__summary-cell';
    cell.setAttribute('role', 'gridcell');
    cell.dataset.field = field;
    this.cells.set(field, cell);
    this.element.append(cell);
    this.redraw();
  }

  removeColumn(field: string) {
    this.cells.get(field)?.remove();
    this.cells.delete(field);
  }

  /** Shows the footer of the group at grid row `index`, at `top`. */
  use(index: number, node: GroupNode, top: number) {
    if (this.index !== index || this.node !== node) {
      this.index = index;
      this.node = node;
      this.draw();
    }
    this.element.hidden = false;
    this.element.style.transform = `translateY(${top}px)`;
  }

  redraw() {
    this.draw();
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.node !== null) {
      this.index = -1;
      this.node = null;
      this.draw();
    }
    this.element.hidden = true;
  }

  /** Puts the cells in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their cell in the row. */
  arrange(visible: string[]) {
    const drawn = this.model.columnWindow;
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      this.addColumn(field);
      const cell = this.cells.get(field)!;
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
    if (!drawn.all) this.redraw();
  }

  dispose() {}

  /** Draws the row as the grid is now. */
  draw() {
    untracked(() => this.drawRow());
  }

  private drawRow() {
    const { model, node, index, element } = this;
    if (!node || index < 0) {
      element.removeAttribute('aria-rowindex');
      return;
    }
    element.setAttribute('aria-rowindex', String(model.ariaRowIndex(index)));
    element.setAttribute('aria-level', String(node.level + 2));
    element.toggleAttribute('data-active', model.state.activeRow === index);
    element.style.setProperty('--_level', String(node.level));
    const s = model.summaries;
    const items = s.groupItems().filter((i) => i.footer);
    const parts = s.partsByColumn(items, s.groupValues(node));
    const separator = model.text('gridSummarySeparator');
    const some = !model.columnWindow.all;
    for (const [field, cell] of this.cells) if (!some || cell.parentElement === element) fillSummaryCell(cell, parts.get(field) ?? [], separator);
    const ev = model.events;
    if (ev.listened(ev.rowPrepared)) ev.rowPrepared.fire({ row: undefined, rowIndex: index, rowType: 'groupFooter', groupKey: [...node.path], isSelected: false, element });
  }
}
