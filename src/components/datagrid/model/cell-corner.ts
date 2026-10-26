/** A corner of a cell range: the row by its id and key, the grid index it was last found at, the column. */
export interface CellCorner {
  /** The tracker's id of the row; `undefined` while the row was still loading. */
  rowId: string | undefined;
  key: unknown;
  index: number;
  field: string;
}
