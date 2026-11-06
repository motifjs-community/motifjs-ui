import type { GridCellPoint } from './grid-cell-point';

/**
 * A rectangle of cells: the rows from `from` to `to` in the grid's order, in the columns between
 * them. `from` is where the range started (its anchor), and `to` is its far corner. `fields` holds the
 * columns it covers, in display order, and can be omitted when set programmatically.
 */
export interface GridCellRange {
  from: GridCellPoint;
  to: GridCellPoint;
  fields?: string[];
}
