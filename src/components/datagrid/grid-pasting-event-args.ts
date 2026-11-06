import type { EventArgs } from '@motifx/core';

/** Occurs before text is pasted into the cells (Ctrl+V, `paste()`). Change `text`, or set `cancel = true`. */
export interface GridPastingEventArgs extends EventArgs {
  text: string;
  readonly rowIndex: number;
  readonly field: string;
}
