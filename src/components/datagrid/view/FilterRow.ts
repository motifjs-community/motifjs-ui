import { Component, untracked } from '@motifx/core';
import { FILTER_ROW, type GridModel } from '../model/GridModel';
import { FilterCell } from './FilterCell';
import { placeInOrder } from './place-in-order';

/**
 * The filter row under the header: a cell per column, built when the row first shows; a column's
 * editors are made the first time its cell is needed. Cells are plain elements carrying
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
    this.attr.add({
      role: 'row',
      'aria-rowindex': '2',
      hidden: () => (grid.showsFilterRow() ? null : ''),
      'data-active': () => (grid.state.activeRow === FILTER_ROW ? '' : null),
    });
    for (const field of grid.columns.state.order) {
      const cell = document.createElement('div');
      cell.className = 'mx-data-grid__filter-cell';
      cell.setAttribute('role', 'gridcell');
      cell.tabIndex = -1;
      cell.dataset.field = field;
      this.cellEls.set(field, cell);
      this.element.append(cell);
    }
    this.motif.setDisposable(() => {
      for (const c of this.filterCells.values()) c.dispose();
    });
  }

  /** Puts the cells in display order, numbers the visible ones and makes the editors the row needs now. */
  arrange(visible: string[]) {
    if (!this.cellEls.size) return;
    const shown = new Set(visible);
    const desired: HTMLElement[] = [];
    visible.forEach((field, i) => {
      const cell = this.cellEls.get(field);
      if (!cell) return;
      desired.push(cell);
      cell.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cellEls) {
      if (shown.has(field)) continue;
      desired.push(cell);
      cell.removeAttribute('aria-colindex');
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
        if (grid.columns.isInternal(field) || this.filterCells.has(field) || !grid.columns.can(field, 'filterRow')) continue;
        this.filterCells.set(field, new FilterCell<T>(grid, field, this.cellEls.get(field)!, this));
      }
    });
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
