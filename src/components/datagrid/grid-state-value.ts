import type { data } from '@motifx-community/data';
import type { GridFilters } from './grid-filters';
import type { GridLayout } from './grid-layout';

/** What the user set up in a grid, to store and restore with `grid.state(value)`. */
export interface GridStateValue extends GridLayout {
  filters: GridFilters;
  /** The filter value (what the filter panel shows). With sync, it includes the columns' filters. */
  filterValue: data.FilterExpression | null;
  /** Indicates whether the filter value applies (the filter panel's check box). */
  filterEnabled: boolean;
  searchText: string;
  /** The page in paged mode, 0-based. */
  page: number;
  /** The rows per page in paged mode, or 0 for every row on one page. */
  pageSize: number;
  selectedKeys: unknown[];
  /** The active row's key, or `undefined` when it has none. */
  focusedRowKey?: unknown;
}
