/** A new or updated row as `grid.changes` lists it. */
export interface RowChange<T> {
  /** The row itself, as the data has it (the changes are not in it until they are saved). */
  row: T;
  /** Only the changed fields and their new values. */
  changed: Partial<T>;
}
