import type { GridDateInterval } from './grid-date-interval';

/**
 * How a column's header filter groups its values: for a number column the size of each range
 * ("0 – 100", "100 – 200"; several sizes make a tree, the largest first), for a date column the
 * deepest part of its year → month → day … tree. `null` lists the values one by one.
 */
export type GridHeaderFilterInterval = number | readonly number[] | GridDateInterval | null;
