import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';

/**
 * The filters (filter row, header filters, the filter value of the builder, the panel's check box)
 * are about to apply; `cancel` puts the ones before back.
 */
export interface GridFilterChangingEventArgs extends EventArgs {
  readonly filters: GridFilters;
  readonly previous: GridFilters;
  readonly filterValue: data.FilterExpression | null;
  readonly previousFilterValue: data.FilterExpression | null;
  readonly filterEnabled: boolean;
  readonly previousFilterEnabled: boolean;
}
