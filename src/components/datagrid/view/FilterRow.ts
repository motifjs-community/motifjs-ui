import { Component, untracked } from '@motifx/core';
import { mark, put } from '../../../core/draw-parts';
import { FILTER_ROW, type GridModel } from '../model/GridModel';
import { FilterCell } from './FilterCell';
import { placeInOrder } from './place-in-order';

/**
 * The filter row under the header: a cell per column, built when the row first shows; a column's
 * editors are created the first time its cell is needed. Cells are plain elements carrying
 * `data-field`, so the grid's per-column sheet pins and hides them with the headers.
 */
export class FilterRow<T> extends Component<HTMLDivElement> {
  readonly filterCells = new Map<string, FilterCell<T>>();
  private readonly cellEls = new Map<string, HTMLDivElement>();

  constructor(private readonly grid: GridModel<T>) {
    super();
  }

  override onConfigured() {
    const grid = this.grid;
    this.class.add('mx-data-grid__row mx-data-grid__row--filter');
    this.element.setAttribute('role', 'row');
    for (const field of grid.columns.state.order) if (grid.columnWindow.has(field)) this.makeCell(field);
    this.motif.setDisposable(grid.notices.on(() => this.draw()));
    this.motif.setDisposable(() => {
      for (const c of this.filterCells.values()) c.dispose();
    });
    this.draw();
  }

  /** Draws the row and its cells as the grid is now. */
  draw() {
    if (this.isDisposed) return;
    untracked(() => {
      const { grid } = this;
      const el = this.element;
      put(el, 'aria-rowindex', String(grid.columns.bandDepth() + 2));
      mark(el, 'hidden', !grid.showsFilterRow());
      mark(el, 'data-active', grid.state.activeRow === FILTER_ROW);
    });
    for (const cell of this.filterCells.values()) cell.draw();
  }

  /** Puts the cells in display order, numbers the visible ones and makes the editors the row needs now; while columns are virtual, only the columns drawn have their cell in the row. */
  arrange(visible: string[]) {
    if (!this.isConfigured) return;
    const drawn = this.grid.columnWindow;
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      this.makeCell(field);
      const cell = this.cellEls.get(field)!;
      desired.push(cell);
      cell.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cellEls) {
      if (shown.has(field) && drawn.has(field)) continue;
      cell.removeAttribute('aria-colindex');
      if (drawn.all) desired.push(cell);
      else cell.remove();
    }
    placeInOrder(this.element, desired);
    this.makeCells(visible);
  }

  /** Makes the editors of the visible columns that have a filter cell, while the row shows. */
  makeCells(visible: string[]) {
    untracked(() => {
      const grid = this.grid;
      if (!grid.showsFilterRow()) return;
      for (const field of visible) {
        if (grid.columns.isInternal(field) || this.filterCells.has(field) || !grid.columns.can(field, 'filterRow') || !this.cellEls.has(field)) continue;
        this.filterCells.set(field, new FilterCell<T>(grid, field, this.cellEls.get(field)!, this));
      }
    });
  }

  /** A column's cell (one added at run time too; placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.isConfigured) this.makeCell(field);
  }

  private makeCell(field: string) {
    if (this.cellEls.has(field)) return;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__filter-cell';
    cell.setAttribute('role', 'gridcell');
    cell.tabIndex = -1;
    cell.dataset.field = field;
    this.cellEls.set(field, cell);
    this.element.append(cell);
  }

  /** A column removed, or recreated: its cell and editors go. */
  removeColumn(field: string) {
    this.filterCells.get(field)?.dispose();
    this.filterCells.delete(field);
    this.cellEls.get(field)?.remove();
    this.cellEls.delete(field);
  }

  cellElement(field: string): HTMLElement | undefined {
    return this.cellEls.get(field);
  }

  /** The filter cell an element belongs to. */
  cellOf(el: Element | null): FilterCell<T> | undefined {
    const cell = el?.closest?.('.mx-data-grid__filter-cell') as HTMLElement | null;
    return cell ? this.filterCells.get(cell.dataset.field ?? '') : undefined;
  }
}
