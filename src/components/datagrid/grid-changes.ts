import type { RowChange } from './row-change';

/** Unsaved changes, as `grid.changes` returns them. */
export interface GridChanges<T> {
  added: T[];
  updated: RowChange<T>[];
  removed: T[];
  /** Number of rows with a change. */
  count: number;
}
