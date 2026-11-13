import { Component, untracked } from '@motifx/core';
import { kept, mark, put } from '../../../core/part-writes';
import { FILTER_ROW, type GridModel } from '../model/GridModel';
import { FilterCell } from './FilterCell';
import { orderControls } from '../../../core/order-controls';

/**
 * The filter row under the header: a cell per column, built when the row first shows; a column's
 * editors are created the first time its cell is needed. Cells are components carrying
 * `data-field`, so the grid's per-column sheet pins and hides them with the headers, and the
 * editors are children of their cell.
 */
export class FilterRow<T> extends Component<HTMLDivElement> {
  readonly filterCells = new Map<string, FilterCell<T>>();
  private readonly cellParts = new Map<string, Component<HTMLDivElement>>();

  constructor(private readonly grid: GridModel<T>) {
    super();
  }

  override onConfigured() {
    const grid = this.grid;
    this.class.add('mx-data-grid__row mx-data-grid__row--filter');
    this.attr.add({ role: 'row' });
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
      put(this, 'aria-rowindex', String(grid.columns.bandDepth() + 2));
      kept(this, grid.showsFilterRow());
      mark(this, 'data-active', grid.state.activeRow === FILTER_ROW);
    });
    for (const cell of this.filterCells.values()) cell.draw();
  }

  /** Puts the cells in display order, numbers the visible ones and makes the editors the row needs now; while columns are virtual, only the columns drawn have their cell in the row. */
  arrange(visible: string[]) {
    if (!this.isConfigured) return;
    const drawn = this.grid.columnWindow;
    const shown = new Set(visible);
    const desired: Component<HTMLDivElement>[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      this.makeCell(field);
      const cell = this.cellParts.get(field)!;
      desired.push(cell);
      put(cell, 'aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cellParts) {
      if (shown.has(field) && drawn.has(field)) continue;
      put(cell, 'aria-colindex', null);
      if (drawn.all) desired.push(cell);
      else if (cell.parent === this) this.controls.silentDetach(cell);
    }
    orderControls(this, desired);
    this.makeCells(visible);
  }

  /** Makes the editors of the visible columns that have a filter cell, while the row shows. */
  makeCells(visible: string[]) {
    untracked(() => {
      const grid = this.grid;
      if (!grid.showsFilterRow()) return;
      for (const field of visible) {
        if (grid.columns.isInternal(field) || this.filterCells.has(field) || !grid.columns.can(field, 'filterRow') || !this.cellParts.has(field)) continue;
        const cell = this.cellParts.get(field)!;
        this.filterCells.set(field, new FilterCell<T>(grid, field, cell));
      }
    });
  }

  /** A column's cell (one added at run time too; placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.isConfigured) this.makeCell(field);
  }

  private makeCell(field: string) {
    if (this.cellParts.has(field)) return;
    const part = new Component<HTMLDivElement>('div');
    part.class.add('mx-data-grid__filter-cell');
    part.attr.add({ role: 'gridcell', 'data-field': field });
    put(part, 'tabindex', '-1');
    this.cellParts.set(field, part);
    this.controls.add(part);
  }

  /** A column removed, or recreated: its cell and editors go. */
  removeColumn(field: string) {
    this.filterCells.get(field)?.dispose();
    this.filterCells.delete(field);
    const part = this.cellParts.get(field);
    this.cellParts.delete(field);
    if (part?.parent) part.parent.controls.remove(part);
    else if (part && !part.isDisposed) void part.dispose({ skipLeaveTransition: true });
  }

  /** A column's cell. */
  cellPart(field: string): Component<HTMLDivElement> | undefined {
    return this.cellParts.get(field);
  }

  /** The column of the cell an event came from. */
  fieldFrom(e: Event): string | undefined {
    if (!this.motif.isEventFrom(e)) return undefined;
    for (const [field, cell] of this.cellParts) if (cell.motif.isEventFrom(e)) return field;
    return undefined;
  }

  /** The filter cell an event came from. */
  cellFrom(e: Event): FilterCell<T> | undefined {
    if (!this.motif.isEventFrom(e)) return undefined;
    for (const cell of this.filterCells.values()) if (cell.part.motif.isEventFrom(e)) return cell;
    return undefined;
  }
}
