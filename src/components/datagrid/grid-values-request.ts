import type { data } from '@motifx-community/data';
import type { GridColumn } from './grid-column';

/** What `loadValues` is asked for: a part of the distinct values of a column. */
export interface GridValuesRequest<T> {
  column: GridColumn<T>;
  /** The text typed in the list's search box. */
  search: string;
  /** The other filters of the grid (and the source's own), which the values should honor. */
  filter: data.FilterExpression | null;
  skip: number;
  take: number;
  signal: AbortSignal;
}
