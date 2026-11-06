import type { EventArgs } from '@motifx/core';

/**
 * Occurs before the active cell moves (by keys, a click or programmatically). Row indexes count new
 * rows, -1 is the header and -2 is the filter row. Set `cancel = true` to keep it in place.
 */
export interface GridFocusedCellChangingEventArgs<T> extends EventArgs {
  readonly rowIndex: number;
  readonly field: string;
  readonly previousRowIndex: number;
  readonly previousField: string;
  /** The row it moves to, or `undefined` on the header, a group row or a row still loading. */
  readonly row: T | undefined;
}
