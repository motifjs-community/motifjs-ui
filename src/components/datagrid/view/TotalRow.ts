import { Component, untracked } from '@motifx/core';
import { put } from '../../../core/draw-parts';
import type { GridModel } from '../model/GridModel';
import { fillSummaryCell } from './summary-cell';
import { placeInOrder } from './place-in-order';

/**
 * The row of totals under the rows: a cell per column, holding the items of `summary.totalItems`
 * that show under it, one under the other. It stays at the bottom of the viewport while the rows
 * scroll, and moves sideways with the columns (sticky columns stay). A stop of its own in the Tab
 * order (`totalSummaryTabStop`), after the rows. It follows nothing: it draws itself again whenever the grid tells a
 * change, and writes its cells (and tells `rowPrepared`) only when what they show changed.
 */
export class TotalRow<T> extends Component<HTMLDivElement> {
  /** Cell elements by field. */
  readonly cells = new Map<string, HTMLDivElement>();
  /** What the cells show, as last written: `''` writes them again. */
  private drawnKey = '';

  constructor(private readonly grid: GridModel<T>) {
    super();
  }

  override onConfigured() {
    const { grid } = this;
    this.class.add('mx-data-grid__row mx-data-grid__total-row');
    this.element.setAttribute('role', 'row');
    for (const field of grid.columns.state.order) if (grid.columnWindow.has(field)) this.makeCell(field);
    this.motif.setDisposable(grid.notices.on(() => this.draw()));
    this.draw();
  }

  /** Writes the items again (`grid.repaint()`). */
  redraw() {
    this.drawnKey = '';
    this.draw();
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
    this.drawnKey = '';
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
    if (!drawn.all) this.drawnKey = '';
    this.draw();
  }

  /** Draws the row as the grid is now: its place and state, and the cells when what they show changed. */
  draw() {
    if (this.isDisposed || !this.isConfigured) return;
    untracked(() => {
      const { grid } = this;
      const el = this.element;
      const s = grid.summaries;
      const status = s.state.status;
      put(el, 'aria-rowindex', String(grid.count + grid.headRows + 1 + grid.openDetailCount()));
      put(el, 'tabindex', grid.settings.get('totalSummaryTabStop') && s.showsTotal() ? '0' : null);
      put(el, 'aria-busy', status === 'loading' ? 'true' : null);
      put(el, 'data-state', status === 'ready' ? null : status);
      const parts = s.partsByColumn(s.totalItems(), s.total);
      const some = !grid.columnWindow.all;
      const filled = [...this.cells].filter(([, cell]) => !some || cell.parentElement === el);
      const key = JSON.stringify(filled.map(([field]) => [field, parts.get(field) ?? []]));
      if (key === this.drawnKey) return;
      this.drawnKey = key;
      for (const [field, cell] of filled) fillSummaryCell(cell, parts.get(field) ?? [], null);
      const ev = grid.events;
      if (ev.listened(ev.rowPrepared)) ev.rowPrepared.fire({ row: undefined, rowIndex: grid.count, rowType: 'totalFooter', isSelected: false, element: el });
    });
  }
}
