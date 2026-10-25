import type { EventArgs } from '@motifx/core';

/**
 * Unsaved changes are about to be dropped: Escape on a row, a row's "Cancel" action, `discardChanges()`.
 * `rows` are the rows whose edits go (a new row goes away); `cancel` keeps them.
 */
export interface GridEditCancelingEventArgs<T> extends EventArgs {
  readonly rows: readonly T[];
}
