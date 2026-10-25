import type { EventArgs } from '@motifx/core';

/** The active row is about to change; `cancel` keeps it (and the active cell). */
export interface GridFocusedRowChangingEventArgs<T> extends EventArgs {
  readonly rowIndex: number;
  readonly previousRowIndex: number;
  readonly row: T | undefined;
}
