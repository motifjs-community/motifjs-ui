import type { EventArgs } from '@motifx/core';

/** Occurs before a row's deletion is sent. Set `cancel = true` to keep the row (marked in batch mode). */
export interface GridRowRemovingEventArgs<T, K = unknown> extends EventArgs {
  readonly key: K;
  readonly row: T;
}
