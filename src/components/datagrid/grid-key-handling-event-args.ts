import type { EventArgs } from '@motifx/core';

/**
 * Occurs when a key is pressed in the grid (a cell, an editor, the filter row, a group chip), before the
 * grid handles it. Set `cancel = true` to prevent the grid's handling and handle `event` yourself.
 */
export interface GridKeyHandlingEventArgs extends EventArgs {
  readonly event: KeyboardEvent;
  /** The active row, where -1 is the header and -2 is the filter row. */
  readonly rowIndex: number;
  readonly field: string;
}
