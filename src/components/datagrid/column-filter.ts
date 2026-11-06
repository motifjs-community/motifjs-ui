import type { GridFilterOperator } from './grid-filter-operator';

/**
 * The filter of one column: the condition of the filter row (`op`, `value`, and `value2` for
 * `between`) and the values selected in the header filter (any of them). Both apply together.
 */
export interface ColumnFilter {
  /** The condition. By default, it depends on the column type (`contains` for text, `=` otherwise). */
  op?: GridFilterOperator;
  value?: unknown;
  /** The upper end of `between`. */
  value2?: unknown;
  /**
   * The values of the header filter, where `null` represents empty values. A value can also be the
   * start of an interval (`headerFilterInterval`), a date part (`2024`, `'2024/3'`) or an item's own
   * value (`headerFilterItems`, which can be a filter expression).
   */
  values?: readonly unknown[];
  /** With `'exclude'`, the rows with `values` are omitted instead of kept. The default is `'include'`. */
  filterType?: 'include' | 'exclude';
}
