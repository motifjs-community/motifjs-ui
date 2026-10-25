import type { EventArgs } from '@motifx/core';

/** A new row is about to be sent; change `data` to change what goes out, `cancel` keeps it unsent. */
export interface GridRowInsertingEventArgs<T> extends EventArgs {
  readonly row: T;
  /** The values sent. */
  readonly data: Partial<T>;
}
