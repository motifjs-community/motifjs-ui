import type { GridCellPoint } from './grid-cell-point';

/**
 * A rectangle of cells: the rows from `from` to `to` in the grid's order, in the columns between
 * them. `from` is where the range was started (its anchor), `to` its far corner. `fields` are the
 * columns it covers, in display order; given by code it may be omitted.
 */
export interface GridCellRange {
  from: GridCellPoint;
  to: GridCellPoint;
  fields?: string[];
}
