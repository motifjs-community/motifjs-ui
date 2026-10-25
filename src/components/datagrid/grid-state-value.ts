import type { GridFilters } from './grid-filters';
import type { GridLayout } from './grid-layout';

/** What the user set up in a grid, to store and give back with `grid.state(value)`. */
export interface GridStateValue extends GridLayout {
  filters: GridFilters;
  searchText: string;
  /** Paged mode, 0-based. */
  page: number;
  selectedKeys: unknown[];
  /** The active row's key; `undefined` when it has none. */
  focusedRowKey?: unknown;
}
