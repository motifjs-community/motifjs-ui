import type { GridCellRange } from './grid-cell-range';

/** Occurs when the cell ranges change, by the user or programmatically. */
export interface GridCellSelectionChangedEventArgs {
  ranges: GridCellRange[];
  /** Indicates that a range is being drawn with the pointer. */
  byDrag: boolean;
}
