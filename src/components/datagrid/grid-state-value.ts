import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';
import type { GridLayout } from './grid-layout';

/** What the user set up in a grid, to store and give back with `grid.state(value)`. */
export interface GridStateValue extends GridLayout {
  filters: GridFilters;
  /** The filter value (what the filter panel shows); with sync it holds the columns' filters too. */
  filterValue: data.FilterExpression | null;
  /** Whether the filter value applies (the filter panel's check box). */
  filterEnabled: boolean;
  searchText: string;
  /** Paged mode, 0-based. */
  page: number;
  /** Rows per page in paged mode; 0: every row on one page. */
  pageSize: number;
  selectedKeys: unknown[];
  /** The active row's key; `undefined` when it has none. */
  focusedRowKey?: unknown;
}
