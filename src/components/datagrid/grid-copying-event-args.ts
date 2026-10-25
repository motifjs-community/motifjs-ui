import type { EventArgs } from '@motifx/core';

/** Cells are about to go to the clipboard (Ctrl+C, `copy()`); change `text` or `html`, or `cancel`. */
export interface GridCopyingEventArgs extends EventArgs {
  /** Tab-separated text. */
  text: string;
  /** An HTML table of the same cells. */
  html: string;
  /** Rows copied; 0 for the active cell alone. */
  readonly rows: number;
}
