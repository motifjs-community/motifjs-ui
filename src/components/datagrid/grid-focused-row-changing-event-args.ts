import type { EventArgs } from '@motifx/core';

/** Occurs before the active row changes. Set `cancel = true` to keep it and the active cell. */
export interface GridFocusedRowChangingEventArgs<T> extends EventArgs {
  readonly rowIndex: number;
  readonly previousRowIndex: number;
  readonly row: T | undefined;
}
