import type { ColumnFilter } from './column-filter';

/** The grid's filters by field. Read and assign them through `grid.filters`. */
export type GridFilters = Record<string, ColumnFilter>;
