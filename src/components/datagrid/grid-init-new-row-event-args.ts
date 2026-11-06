import type { EventArgs } from '@motifx/core';

/**
 * Occurs before a new row opens. `data` is its initial content (`newRow.create()`), and `values` is what
 * counts as entered (the values passed to `addRow`). Change either. Set `cancel = true` to open no row.
 */
export interface GridInitNewRowEventArgs<T> extends EventArgs {
  data: Partial<T>;
  values: Partial<T>;
}
