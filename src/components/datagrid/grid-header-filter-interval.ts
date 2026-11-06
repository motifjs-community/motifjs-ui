import type { GridDateInterval } from './grid-date-interval';

/**
 * How a column's header filter groups its values: for a number column, the size of each range
 * ("0 – 100", "100 – 200", and several sizes create a tree, largest first), and for a date column, the
 * deepest level of its year → month → day … tree. `null` lists every value.
 */
export type GridHeaderFilterInterval = number | readonly number[] | GridDateInterval | null;
