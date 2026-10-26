import type { GridCellRange } from './grid-cell-range';

/** The cell ranges changed, by the user or by code. */
export interface GridCellSelectionChangedEventArgs {
  ranges: GridCellRange[];
  /** The change comes from a range being drawn with the pointer. */
  byDrag: boolean;
}
