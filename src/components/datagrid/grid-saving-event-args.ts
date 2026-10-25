import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * Changes are about to be sent (leaving a row, the queue of `background`, "Save changes"); `cancel`
 * keeps them all unsent. Each row then gets its own `onRowInserting`, `onRowUpdating` or `onRowRemoving`.
 */
export interface GridSavingEventArgs<T> extends EventArgs {
  /** What is sent, in order. */
  readonly changes: readonly data.Change<T, unknown>[];
}
