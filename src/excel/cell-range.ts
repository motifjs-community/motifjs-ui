/** The cells an export wrote: its first and last cell (rows and columns from 1). */
export interface CellRange {
  from: { row: number; column: number };
  to: { row: number; column: number };
}
