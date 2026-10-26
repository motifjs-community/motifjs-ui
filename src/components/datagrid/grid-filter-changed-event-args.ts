import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';

/** The filters applied. */
export interface GridFilterChangedEventArgs {
  readonly filters: GridFilters;
  /** The whole filter of the rows, as the data layer has it. */
  readonly filter: data.FilterExpression | null;
  /** The filter value (what the filter panel shows), as chosen. */
  readonly filterValue: data.FilterExpression | null;
  /** Whether the filter value applies (the filter panel's check box). */
  readonly filterEnabled: boolean;
}
