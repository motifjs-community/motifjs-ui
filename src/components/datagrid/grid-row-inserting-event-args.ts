import type { EventArgs } from '@motifx/core';

/** Occurs before a new row is sent. Change `data` to change what is sent, or set `cancel = true` to keep it unsent. */
export interface GridRowInsertingEventArgs<T> extends EventArgs {
  readonly row: T;
  /** The values sent. */
  readonly data: Partial<T>;
}
