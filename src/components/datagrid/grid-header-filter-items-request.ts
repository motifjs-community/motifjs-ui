import type { data } from '@motifx-community/data';
import type { GridColumn } from './grid-column';
import type { GridFilterValue } from './grid-filter-value';

/** What a column's `headerFilterItems` function receives. */
export interface GridHeaderFilterItemsRequest<T> {
  column: GridColumn<T>;
  /** The grid's other filters, and the source's own. */
  filter: data.FilterExpression | null;
  signal: AbortSignal;
  /** Returns the values the header filter would list without the function, with their counts. */
  values(): Promise<GridFilterValue[]>;
}
