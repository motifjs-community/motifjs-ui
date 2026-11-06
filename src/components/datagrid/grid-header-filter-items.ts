import type { GridFilterValue } from './grid-filter-value';
import type { GridHeaderFilterItemsRequest } from './grid-header-filter-items-request';

/**
 * Custom entries of a column's header filter in place of its values: `{ text, value }` items, where a
 * value can be a filter expression (`data.where('amount', '<', 100)`), or a function that returns them.
 */
export type GridHeaderFilterItems<T> = readonly GridFilterValue[] | ((request: GridHeaderFilterItemsRequest<T>) => readonly GridFilterValue[] | Promise<readonly GridFilterValue[]>);
