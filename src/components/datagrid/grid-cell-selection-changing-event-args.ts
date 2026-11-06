import type { EventArgs } from '@motifx/core';
import type { GridCellRange } from './grid-cell-range';

/** Occurs before the cell ranges change, by the user or programmatically. Set `cancel = true` to keep them. */
export interface GridCellSelectionChangingEventArgs extends EventArgs {
  readonly ranges: GridCellRange[];
  readonly previous: GridCellRange[];
  /** Indicates that a range is being drawn with the pointer. */
  readonly byDrag: boolean;
}
