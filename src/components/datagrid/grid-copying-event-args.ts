import type { EventArgs } from '@motifx/core';
import type { GridCellRange } from './grid-cell-range';

/** Cells are about to go to the clipboard (Ctrl+C, `copy()`); change `text` or `html`, or `cancel`. */
export interface GridCopyingEventArgs extends EventArgs {
  /** Tab-separated text. */
  text: string;
  /** An HTML table of the same cells. */
  html: string;
  /** Rows copied (lines, for cell ranges); 0 for the active cell alone. */
  readonly rows: number;
  /** The cell ranges copied (`cellSelection`); empty for rows or the active cell. */
  readonly ranges: readonly GridCellRange[];
}
