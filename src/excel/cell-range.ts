/** The cells an export wrote: the first and last cell, with rows and columns counted from 1. */
export interface CellRange {
  from: { row: number; column: number };
  to: { row: number; column: number };
}
