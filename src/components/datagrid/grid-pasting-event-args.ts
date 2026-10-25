import type { EventArgs } from '@motifx/core';

/** Text is about to be pasted into the cells (Ctrl+V, `paste()`); change `text`, or `cancel`. */
export interface GridPastingEventArgs extends EventArgs {
  text: string;
  readonly rowIndex: number;
  readonly field: string;
}
