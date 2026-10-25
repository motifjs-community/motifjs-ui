import { createSignal, effect, untracked } from '@motifx/core';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { fillSummaryCell } from './summary-cell';
import { placeInOrder } from './place-in-order';

/**
 * One pooled footer row of a group: after the group's rows, a cell per column with the group items
 * shown in the footer (`showInGroupFooter`), on one line each. Made once and reused for other groups
 * while the user scrolls, like the other rows. The row itself takes focus, as a group row's cell does.
 */
export class GroupFooterRow<T> {
  readonly element: HTMLDivElement;
  readonly cells = new Map<string, HTMLDivElement>();
  /** Grid index; -1 while the row is not used. */
  index = -1;
  node: GroupNode | null = null;
  private readonly shown = createSignal(0);
  private readonly stop: () => void;

  constructor(private readonly model: GridModel<T>) {
    const el = document.createElement('div');
    el.className = 'mx-data-grid__row mx-data-grid__group-footer';
    el.setAttribute('role', 'row');
    el.tabIndex = -1;
    el.hidden = true;
    for (const field of model.columns.state.order) {
      const cell = document.createElement('div');
      cell.className = 'mx-data-grid__cell mx-data-grid__summary-cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.field = field;
      this.cells.set(field, cell);
      el.append(cell);
    }
    this.element = el;
    this.stop = effect(() => this.draw());
  }

  /** Shows the footer of the group at grid row `index`, at `top`. */
  use(index: number, node: GroupNode, top: number) {
    if (this.index !== index || this.node !== node) {
      this.index = index;
      this.node = node;
      this.shown.value = this.shown.peek() + 1;
    }
    this.element.hidden = false;
    this.element.style.transform = `translateY(${top}px)`;
  }

  redraw() {
    this.shown.value = this.shown.peek() + 1;
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.node !== null) {
      this.index = -1;
      this.node = null;
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
    this.stop();
  }

  private draw() {
    void this.shown.value;
    const { model, node, index, element } = this;
    if (!node || index < 0) {
      element.removeAttribute('aria-rowindex');
      return;
    }
    element.setAttribute('aria-rowindex', String(index + 1 + model.headRows));
    element.setAttribute('aria-level', String(node.level + 2));
    element.toggleAttribute('data-active', model.state.activeRow === index);
    element.style.setProperty('--_level', String(node.level));
    const s = model.summaries;
    const items = s.groupItems().filter((i) => i.footer);
    const parts = s.partsByColumn(items, s.groupValues(node));
    const separator = model.text('gridSummarySeparator');
    for (const [field, cell] of this.cells) fillSummaryCell(cell, parts.get(field) ?? [], separator);
    const ev = model.events;
    if (ev.listened(ev.rowPrepared)) untracked(() => ev.rowPrepared.fire({ row: undefined, rowIndex: index, rowType: 'groupFooter', groupKey: [...node.path], isSelected: false, element }));
  }
}
