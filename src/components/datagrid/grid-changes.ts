import type { RowChange } from './row-change';

/** Unsaved changes, as `grid.changes` returns them. */
export interface GridChanges<T> {
  /** New rows: the grid's row for each, and the values entered in it. */
  added: RowChange<T>[];
  updated: RowChange<T>[];
  removed: T[];
  /** Number of rows with a change. */
  count: number;
}
