import type { EventArgs } from '@motifx/core';

/**
 * A new row is about to open. `data` is what it starts with (`newRow.create()`), `values` what counts
 * as entered (the values given to `addRow`); change either. `cancel` opens no row.
 */
export interface GridInitNewRowEventArgs<T> extends EventArgs {
  data: Partial<T>;
  values: Partial<T>;
}
