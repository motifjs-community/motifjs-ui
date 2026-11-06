import type { Bind } from '@motifx/core';
import type { GridCustomSummaryInfo } from './grid-custom-summary-info';
import type { GridGroupSummaryItem } from './grid-group-summary-item';
import type { GridSummaryItem } from './grid-summary-item';
import type { GridSummaryTexts } from './grid-summary-texts';

/**
 * The `summary` prop: values of the rows under the filter and the search, in a row under the rows
 * (`totalItems`) and for each group (`groupItems`). Every field but `calculateCustomSummary` is a
 * value or a tracked function.
 *
 * @example
 * summary={{ totalItems: [{ column: 'amount', summaryType: 'sum' }], groupItems: [{ column: 'id', summaryType: 'count' }] }}
 */
export interface GridSummary<T = any> {
  totalItems?: Bind<readonly GridSummaryItem[]>;
  groupItems?: Bind<readonly GridGroupSummaryItem[]>;
  /** One function for every `custom` item, called through the steps of each one; tell them apart by `name`. */
  calculateCustomSummary?: (info: GridCustomSummaryInfo<T>) => void;
  /** The values follow unsaved edits, new rows and rows marked for deletion. Off, they change once the changes are saved. Default `false`. */
  recalculateWhileEditing?: Bind<boolean>;
  /** Leave empty values (`null`, `undefined`, `''`) out of the summaries computed in the browser; `count` counts every row. An item can set its own. Default `true`. */
  skipEmptyValues?: Bind<boolean>;
  /** The item texts by type, over the `gridSummary…` texts of `uiLocale` and the grid's `texts`. */
  texts?: Bind<Partial<GridSummaryTexts>>;
}
