import { untracked, type Component } from '@motifx/core';
import { loose, part, removePart } from '../../../core/draw-parts';
import { orderControls } from '../../../core/order-controls';
import { css, kept, mark, put } from '../../../core/part-writes';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { fillSummaryCell } from './summary-cell';

/**
 * One pooled footer row of a group: after the group's rows, a cell per column with the group items
 * shown in the footer (`showInGroupFooter`), on one line each. Made once and reused for other groups
 * while the user scrolls, like the other rows. The row itself takes focus, as a group row's cell does.
 * It follows nothing: it is drawn when it shows another group, and the body draws it again when the
 * grid tells a change it reads.
 */
export class GroupFooterRow<T> {
  /** The row's component, a child of the body. */
  readonly part: Component<HTMLDivElement>;
  readonly element: HTMLDivElement;
  /** Cell components by field. */
  readonly cells = new Map<string, Component<HTMLDivElement>>();
  /** Grid index; -1 while the row is not used. */
  index = -1;
  node: GroupNode | null = null;

  constructor(private readonly model: GridModel<T>) {
    this.part = loose<HTMLDivElement>('div', 'mx-data-grid__row mx-data-grid__group-footer');
    const el = this.part.element;
    this.part.attr.add({ role: 'row' });
    put(this.part, 'tabindex', '-1');
    kept(this.part, false);
    this.element = el;
    for (const field of model.columns.state.order) this.addColumn(field);
    this.draw();
  }

  /** The cell component of `field`, while the row has that cell. */
  cellPart(field: string): Component<HTMLDivElement> | undefined {
    return this.cells.get(field);
  }

  /** A column's cell (one added at run time too; placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cells.has(field) || !this.model.columnWindow.has(field)) return;
    const cell = part<HTMLDivElement>(this.part, 'div', 'mx-data-grid__cell mx-data-grid__summary-cell');
    cell.attr.add({ role: 'gridcell', 'data-field': field });
    this.cells.set(field, cell);
    this.redraw();
  }

  removeColumn(field: string) {
    removePart(this.cells.get(field));
    this.cells.delete(field);
  }

  /** Shows the footer of the group at grid row `index`, at `top`. */
  use(index: number, node: GroupNode, top: number) {
    if (this.index !== index || this.node !== node) {
      this.index = index;
      this.node = node;
      this.draw();
    }
    kept(this.part, true);
    css(this.part, 'transform', `translateY(${top}px)`);
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
    kept(this.part, false);
  }

  /** Puts the cells in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their cell in the row. */
  arrange(visible: string[]) {
    const drawn = this.model.columnWindow;
    const shown = new Set(visible);
    const desired: Component<HTMLDivElement>[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      this.addColumn(field);
      const cell = this.cells.get(field)!;
      desired.push(cell);
      put(cell, 'aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cells) {
      if (shown.has(field) && drawn.has(field)) continue;
      put(cell, 'aria-colindex', null);
      if (drawn.all) desired.push(cell);
      else if (cell.parent === this.part) this.part.controls.silentDetach(cell);
    }
    orderControls(this.part, desired);
    if (!drawn.all) this.redraw();
  }

  dispose() {
    // Cells taken out while columns are virtual go too.
    for (const cell of this.cells.values()) if (!cell.parent && !cell.isDisposed) void cell.dispose({ skipLeaveTransition: true });
    removePart(this.part);
  }

  /** Draws the row as the grid is now. */
  draw() {
    untracked(() => this.drawRow());
  }

  private drawRow() {
    const { model, node, index, element } = this;
    if (!node || index < 0) {
      put(this.part, 'aria-rowindex', null);
      return;
    }
    put(this.part, 'aria-rowindex', String(model.ariaRowIndex(index)));
    put(this.part, 'aria-level', String(node.level + 2));
    mark(this.part, 'data-active', model.state.activeRow === index);
    css(this.part, '--_level', String(node.level));
    const s = model.summaries;
    const items = s.groupItems().filter((i) => i.footer);
    const parts = s.partsByColumn(items, s.groupValues(node));
    const separator = model.text('gridSummarySeparator');
    const some = !model.columnWindow.all;
    for (const [field, cell] of this.cells) if (!some || cell.parent === this.part) fillSummaryCell(cell, parts.get(field) ?? [], separator);
    const ev = model.events;
    if (ev.listened(ev.rowPrepared)) ev.rowPrepared.fire({ row: undefined, rowIndex: index, rowType: 'groupFooter', groupKey: [...node.path], isSelected: false, part: this.part });
  }
}
