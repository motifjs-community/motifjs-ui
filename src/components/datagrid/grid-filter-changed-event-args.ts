import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';

/** The filters applied. */
export interface GridFilterChangedEventArgs {
  readonly filters: GridFilters;
  /** The whole filter of the rows, as the data layer has it. */
  readonly filter: data.FilterExpression | null;
}
