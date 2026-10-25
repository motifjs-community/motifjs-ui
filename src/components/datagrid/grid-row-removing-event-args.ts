import type { EventArgs } from '@motifx/core';

/** A row's deletion is about to be sent; `cancel` keeps it (marked in batch mode). */
export interface GridRowRemovingEventArgs<T, K = unknown> extends EventArgs {
  readonly key: K;
  readonly row: T;
}
