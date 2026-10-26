/** What the selected cells add up to, as a spreadsheet's status bar shows it. Only loaded rows count. */
export interface GridCellSummary {
  /** Cells in the ranges, each once. */
  cells: number;
  /** Cells that hold a value. */
  count: number;
  /** Cells that hold a number. */
  numbers: number;
  sum: number;
  /** `null` while no cell holds a number. */
  average: number | null;
  min: number | null;
  max: number | null;
}
