import type { EventArgs } from '@motifx/core';

/** A row's changes are about to be sent; change `changes` to change what goes out, `cancel` keeps them unsent. */
export interface GridRowUpdatingEventArgs<T, K = unknown> extends EventArgs {
  readonly key: K;
  /** The row as it was read. */
  readonly row: T;
  /** The changed fields and their new values. */
  readonly changes: Partial<T>;
}
