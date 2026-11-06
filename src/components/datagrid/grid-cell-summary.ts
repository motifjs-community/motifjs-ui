/** The summary of the selected cells, as in a spreadsheet's status bar. Only loaded rows count. */
export interface GridCellSummary {
  /** The number of cells in the ranges, each counted once. */
  cells: number;
  /** The number of cells that hold a value. */
  count: number;
  /** The number of cells that hold a number. */
  numbers: number;
  sum: number;
  /** The average, or `null` while no cell holds a number. */
  average: number | null;
  min: number | null;
  max: number | null;
}
