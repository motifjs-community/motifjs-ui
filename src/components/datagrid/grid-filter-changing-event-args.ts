import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';

/**
 * Occurs before the filters (filter row, header filters, the builder's filter value, the panel's check
 * box) apply. Set `cancel = true` to restore the previous ones.
 */
export interface GridFilterChangingEventArgs extends EventArgs {
  readonly filters: GridFilters;
  readonly previous: GridFilters;
  readonly filterValue: data.FilterExpression | null;
  readonly previousFilterValue: data.FilterExpression | null;
  readonly filterEnabled: boolean;
  readonly previousFilterEnabled: boolean;
}
