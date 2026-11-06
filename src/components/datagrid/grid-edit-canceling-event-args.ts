import type { EventArgs } from '@motifx/core';

/**
 * Occurs before unsaved changes are discarded: Escape on a row, a row's "Cancel" action, or
 * `discardChanges()`. `rows` holds the rows whose edits are discarded (a new row is removed). Set
 * `cancel = true` to keep them.
 */
export interface GridEditCancelingEventArgs<T> extends EventArgs {
  readonly rows: readonly T[];
}
