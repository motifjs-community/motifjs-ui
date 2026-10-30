import { Component, createSignal, untracked } from '@motifx/core';
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
  /** Grows when a cell is added, so the items are written into it. */
  private readonly version = createSignal(0);

  constructor(private readonly grid: GridModel<T>) {
    super();
  }

  override onConfigured() {
    const { grid } = this;
    this.class.add('mx-data-grid__row mx-data-grid__total-row');
    this.attr.add({
      role: 'row',
      'aria-rowindex': () => {
        void grid.details.state.version;
        void grid.adaptive.state.rowId;
        void grid.columns.state.adaptive;
        return String(grid.count + grid.headRows + 1 + grid.openDetailCount());
      },
      tabindex: () => (grid.settings.get('totalSummaryTabStop') && grid.summaries.showsTotal() ? '0' : null),
      'aria-busy': () => (grid.summaries.state.status === 'loading' ? 'true' : null),
      'data-state': () => (grid.summaries.state.status === 'ready' ? null : grid.summaries.state.status),
    });
    for (const field of grid.columns.state.order) if (grid.columnWindow.has(field)) this.makeCell(field);
    this.bindings.watch(() => this.draw());
  }

  /** Writes the items again (`grid.repaint()`). */
  redraw() {
    this.version.value = this.version.peek() + 1;
  }

  /** A column's cell (one added at run time too; placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.isConfigured) this.makeCell(field);
  }

  private makeCell(field: string) {
    if (this.cells.has(field)) return;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__cell mx-data-grid__summary-cell';
    cell.setAttribute('role', 'gridcell');
    cell.dataset.field = field;
    this.cells.set(field, cell);
    this.element.append(cell);
    this.version.value++;
  }

  removeColumn(field: string) {
    this.cells.get(field)?.remove();
    this.cells.delete(field);
  }

  /** Puts the cells in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their cell in the row. */
  arrange(visible: string[]) {
    if (!this.isConfigured) return;
    const drawn = this.grid.columnWindow;
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      this.makeCell(field);
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
    if (!drawn.all) this.version.value++;
  }

  private draw() {
    void this.version.value;
    const { grid } = this;
    const s = grid.summaries;
    const parts = s.partsByColumn(s.totalItems(), s.total);
    const some = !grid.columnWindow.all;
    for (const [field, cell] of this.cells) if (!some || cell.parentElement === this.element) fillSummaryCell(cell, parts.get(field) ?? [], null);
    const ev = grid.events;
    if (ev.listened(ev.rowPrepared)) untracked(() => ev.rowPrepared.fire({ row: undefined, rowIndex: grid.count, rowType: 'totalFooter', isSelected: false, element: this.element }));
  }
}
