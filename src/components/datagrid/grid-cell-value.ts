/** One selected cell, as `getSelectedCellValues()` returns it, with its value or unsaved edit. */
export interface GridCellValue<T> {
  rowIndex: number;
  /** The row's key, or `undefined` for a new row. */
  key: unknown;
  field: string;
  value: unknown;
  row: T;
}
