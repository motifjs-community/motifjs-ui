import type { data } from '@motifx-community/data';
import type { GridColumn } from './grid-column';

/** The request `loadValues` receives: a part of the distinct values of a column. */
export interface GridValuesRequest<T> {
  column: GridColumn<T>;
  /** The text typed in the list's search box. */
  search: string;
  /** The grid's other filters and the source's own, which the values should match. */
  filter: data.FilterExpression | null;
  skip: number;
  take: number;
  signal: AbortSignal;
}
