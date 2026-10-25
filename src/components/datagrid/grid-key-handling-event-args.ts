import type { EventArgs } from '@motifx/core';

/**
 * A key went down in the grid (a cell, an editor, the filter row, a group chip) and the grid is about
 * to handle it. `cancel` stops the grid's own handling: do your own with `event`.
 */
export interface GridKeyHandlingEventArgs extends EventArgs {
  readonly event: KeyboardEvent;
  /** The active row (-1 the header, -2 the filter row). */
  readonly rowIndex: number;
  readonly field: string;
}
