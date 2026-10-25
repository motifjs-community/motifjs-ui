import type { Bind } from '@motifx/core';
import type { GridSummaryItem } from './grid-summary-item';

/**
 * One item of the group summary: a value of each group's rows, in its group row ("City: Ankara (12)
 * · Sum of Amount: 1,234"), under its column in the group row, or in a row after the group's rows.
 */
export interface GridGroupSummaryItem extends GridSummaryItem {
  /** In a footer row after each group's rows, under `showInColumn` (else `column`). Default `false`. */
  showInGroupFooter?: Bind<boolean | undefined>;
  /** Under `showInColumn` (else `column`) in the group row instead of after its text; not under the first column, which holds the text. Default `false`. */
  alignByColumn?: Bind<boolean | undefined>;
}
