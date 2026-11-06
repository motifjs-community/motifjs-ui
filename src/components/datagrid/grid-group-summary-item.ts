import type { Bind } from '@motifx/core';
import type { GridSummaryItem } from './grid-summary-item';

/**
 * One item of the group summary: a value calculated from each group's rows, in its group row ("City:
 * Ankara (12) · Sum of Amount: 1,234"), below its column in the group row, or in a row after the
 * group's rows.
 */
export interface GridGroupSummaryItem extends GridSummaryItem {
  /** Shows the item in a footer row after each group's rows, below `showInColumn` or `column`. The default is `false`. */
  showInGroupFooter?: Bind<boolean | undefined>;
  /**
   * Shows the item below `showInColumn` or `column` in the group row, in place of after its text, except
   * below the first column, which holds the text. The default is `false`.
   */
  alignByColumn?: Bind<boolean | undefined>;
}
