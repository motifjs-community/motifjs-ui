import type { GridFilterOperator } from './grid-filter-operator';

/**
 * The filter of one column: the condition of the filter row (`op`, `value`, and `value2` for
 * `between`) and the values chosen in the header filter (any of them). Both apply together.
 */
export interface ColumnFilter {
  /** Default: by the column type (`contains` for text, `=` otherwise). */
  op?: GridFilterOperator;
  value?: unknown;
  /** The upper end of `between`. */
  value2?: unknown;
  /** Values of the header filter; `null` stands for empty values. */
  values?: readonly unknown[];
}
