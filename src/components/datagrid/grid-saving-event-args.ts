import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * Occurs before changes are sent (leaving a row, the `background` queue or "Save changes"). Set
 * `cancel = true` to keep them all unsent. Each row then raises its own `onRowInserting`,
 * `onRowUpdating` or `onRowRemoving`.
 */
export interface GridSavingEventArgs<T> extends EventArgs {
  /** The changes that are sent, in order. */
  readonly changes: readonly data.Change<T, unknown>[];
}
