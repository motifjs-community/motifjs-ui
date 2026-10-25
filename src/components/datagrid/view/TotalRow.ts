import { Component, untracked } from '@motifx/core';
import type { GridModel } from '../model/GridModel';
import { fillSummaryCell } from './summary-cell';
import { placeInOrder } from './place-in-order';

/**
 * The row of totals under the rows: a cell per column, holding the items of `summary.totalItems`
 * that show under it, one under the other. It stays at the bottom of the viewport while the rows
 * scroll, and moves sideways with the columns (sticky columns stay). A stop of its own in the Tab
 * order (`totalSummaryTabStop`), after the rows.
 */
export class TotalRow<T> extends Component<HTMLDivElement> {
  /** Cell elements by field. */
  readonly cells = new Map<string, HTMLDivElement>();

  constructor(private readonly grid: GridModel<T>) {
    super();
  }

  override onConfigured() {
    const { grid } = this;
    this.class.add('mx-data-grid__row mx-data-grid__total-row');
    this.attr.add({
      role: 'row',
      'aria-rowindex': () => String(grid.count + grid.headRows + 1),
      tabindex: () => (grid.settings.get('totalSummaryTabStop') && grid.summaries.showsTotal() ? '0' : null),
      'aria-busy': () => (grid.summaries.state.status === 'loading' ? 'true' : null),
      'data-state': () => (grid.summaries.state.status === 'ready' ? null : grid.summaries.state.status),
    });
    for (const field of grid.columns.state.order) {
      const cell = document.createElement('div');
      cell.className = 'mx-data-grid__cell mx-data-grid__summary-cell';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.field = field;
      this.cells.set(field, cell);
      this.element.append(cell);
    }
    this.bindings.watch(() => this.draw());
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

  private draw() {
    const { grid } = this;
    const s = grid.summaries;
    const parts = s.partsByColumn(s.totalItems(), s.total);
    for (const [field, cell] of this.cells) fillSummaryCell(cell, parts.get(field) ?? [], null);
    const ev = grid.events;
    if (ev.listened(ev.rowPrepared)) untracked(() => ev.rowPrepared.fire({ row: undefined, rowIndex: grid.count, rowType: 'totalFooter', isSelected: false, element: this.element }));
  }
}
