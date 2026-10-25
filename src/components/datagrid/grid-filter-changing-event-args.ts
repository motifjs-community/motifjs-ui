import type { EventArgs } from '@motifx/core';
import type { GridFilters } from './grid-filters';

/** The filters of the filter row and the header filters are about to apply; `cancel` puts the ones before back. */
export interface GridFilterChangingEventArgs extends EventArgs {
  readonly filters: GridFilters;
  readonly previous: GridFilters;
}
