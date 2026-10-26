import type { GridFilterValue } from './grid-filter-value';
import type { GridHeaderFilterItemsRequest } from './grid-header-filter-items-request';

/**
 * The entries of a column's header filter instead of its values: `{ text, value }` items, where a
 * value may be a filter expression (`data.where('amount', '<', 100)`); or a function that gives them.
 */
export type GridHeaderFilterItems<T> = readonly GridFilterValue[] | ((request: GridHeaderFilterItemsRequest<T>) => readonly GridFilterValue[] | Promise<readonly GridFilterValue[]>);
