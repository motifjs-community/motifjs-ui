import type { Bind } from '@motifx/core';
import type { GridCustomSummaryInfo } from './grid-custom-summary-info';
import type { GridGroupSummaryItem } from './grid-group-summary-item';
import type { GridSummaryItem } from './grid-summary-item';
import type { GridSummaryTexts } from './grid-summary-texts';

/**
 * The `summary` prop: values calculated from the rows under the filter and the search, in a row below
 * the rows (`totalItems`) and for each group (`groupItems`). Every field except
 * `calculateCustomSummary` is a value or a tracked function.
 *
 * @example
 * summary={{ totalItems: [{ column: 'amount', summaryType: 'sum' }], groupItems: [{ column: 'id', summaryType: 'count' }] }}
 */
export interface GridSummary<T = any> {
  totalItems?: Bind<readonly GridSummaryItem[]>;
  groupItems?: Bind<readonly GridGroupSummaryItem[]>;
  /** One function for every `custom` item, called through the steps of each. Distinguish the items by `name`. */
  calculateCustomSummary?: (info: GridCustomSummaryInfo<T>) => void;
  /**
   * The values reflect unsaved edits, new rows and rows marked for deletion. Otherwise, they change once
   * the changes are saved. The default is `false`.
   */
  recalculateWhileEditing?: Bind<boolean>;
  /**
   * Omits empty values (`null`, `undefined`, `''`) from the summaries calculated in the browser, and
   * `count` counts every row. An item can set its own value. The default is `true`.
   */
  skipEmptyValues?: Bind<boolean>;
  /** The item strings by type, over the `gridSummary…` strings of `uiLocale` and the grid's `texts`. */
  texts?: Bind<Partial<GridSummaryTexts>>;
}
