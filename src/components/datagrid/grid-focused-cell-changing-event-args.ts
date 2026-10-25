import type { EventArgs } from '@motifx/core';

/**
 * The active cell is about to move (keys, a click, code). Row indexes count new rows; -1 is the header,
 * -2 the filter row. `cancel` keeps it where it is.
 */
export interface GridFocusedCellChangingEventArgs<T> extends EventArgs {
  readonly rowIndex: number;
  readonly field: string;
  readonly previousRowIndex: number;
  readonly previousField: string;
  /** The row it moves to; `undefined` on the header, a group row or a row that loads. */
  readonly row: T | undefined;
}
