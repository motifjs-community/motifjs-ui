import type { data } from '@motifx-community/data';
import type { GridColumn } from './grid-column';
import type { GridFilterValue } from './grid-filter-value';

/** What a column's `headerFilterItems` function is asked with. */
export interface GridHeaderFilterItemsRequest<T> {
  column: GridColumn<T>;
  /** The other filters of the grid (and the source's own). */
  filter: data.FilterExpression | null;
  signal: AbortSignal;
  /** The values the header filter would list without the function, with their counts, to add to or change. */
  values(): Promise<GridFilterValue[]>;
}
