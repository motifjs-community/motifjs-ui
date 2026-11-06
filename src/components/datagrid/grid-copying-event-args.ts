import type { EventArgs } from '@motifx/core';
import type { GridCellRange } from './grid-cell-range';

/** Occurs before cells are copied to the clipboard (Ctrl+C, `copy()`). Change `text` or `html`, or set `cancel = true`. */
export interface GridCopyingEventArgs extends EventArgs {
  /** The tab-separated text. */
  text: string;
  /** An HTML table of the same cells. */
  html: string;
  /** The rows copied (lines, for cell ranges), or 0 for the active cell alone. */
  readonly rows: number;
  /** The cell ranges copied (`cellSelection`). Empty for rows or the active cell. */
  readonly ranges: readonly GridCellRange[];
}
