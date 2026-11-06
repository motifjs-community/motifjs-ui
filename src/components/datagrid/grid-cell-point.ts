/**
 * A cell of the grid: its column and its row, by key or by grid index. When set programmatically,
 * either is enough (the key takes precedence). When read back, both are filled (`key` is `undefined`
 * for a new row or a row still loading).
 */
export interface GridCellPoint {
  field: string;
  key?: unknown;
  rowIndex?: number;
}
