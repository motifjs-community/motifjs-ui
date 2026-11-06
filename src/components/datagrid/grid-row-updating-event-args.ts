import type { EventArgs } from '@motifx/core';

/**
 * Occurs before a row's changes are sent. Change `changes` to change what is sent, or set
 * `cancel = true` to keep them unsent.
 */
export interface GridRowUpdatingEventArgs<T, K = unknown> extends EventArgs {
  readonly key: K;
  /** The row as it was read. */
  readonly row: T;
  /** The changed fields and their new values. */
  readonly changes: Partial<T>;
}
