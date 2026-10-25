/** A row in the new-row area: added in the grid; it stays there after it is saved, until a refresh. */
export interface AddedRow<T> {
  /** The tracker's id of the row (`+1`, `+2` …). */
  rowId: string;
  row: T;
}
