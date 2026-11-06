import type { RowChange } from './row-change';

/** The unsaved changes, as `grid.changes` returns them. */
export interface GridChanges<T> {
  /** New rows: the grid's row for each, and the values entered in it. */
  added: RowChange<T>[];
  updated: RowChange<T>[];
  removed: T[];
  /** The number of rows with a change. */
  count: number;
}
