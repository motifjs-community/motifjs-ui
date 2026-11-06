import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';

/** Occurs when the filters apply. */
export interface GridFilterChangedEventArgs {
  readonly filters: GridFilters;
  /** The whole filter of the rows, in data layer form. */
  readonly filter: data.FilterExpression | null;
  /** The filter value (what the filter panel shows), as selected. */
  readonly filterValue: data.FilterExpression | null;
  /** Indicates whether the filter value applies (the filter panel's check box). */
  readonly filterEnabled: boolean;
}
