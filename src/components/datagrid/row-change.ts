/** An updated row as `grid.changes` lists it. */
export interface RowChange<T> {
  /** The row with the changes applied (a copy). */
  row: T;
  /** Only the changed fields and their new values. */
  changed: Partial<T>;
  /** The row as it was before the changes (a copy). */
  original: T;
}
