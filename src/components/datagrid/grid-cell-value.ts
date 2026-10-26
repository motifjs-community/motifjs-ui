/** One selected cell, as `getSelectedCellValues()` gives it: its value (the unsaved edit, when there is one). */
export interface GridCellValue<T> {
  rowIndex: number;
  /** The row's key; `undefined` for a new row. */
  key: unknown;
  field: string;
  value: unknown;
  row: T;
}
