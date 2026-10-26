import type { EventArgs } from '@motifx/core';
import type { GridCellRange } from './grid-cell-range';

/** The cell ranges are about to change (by the user or by code); `cancel` keeps them as they are. */
export interface GridCellSelectionChangingEventArgs extends EventArgs {
  readonly ranges: GridCellRange[];
  readonly previous: GridCellRange[];
  /** The change comes from a range being drawn with the pointer. */
  readonly byDrag: boolean;
}
