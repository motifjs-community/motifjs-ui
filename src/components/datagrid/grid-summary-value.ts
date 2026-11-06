import type { GridSummaryType } from './grid-summary-type';

/** One summary item of a group as its row displays it, for a column's custom `groupCell`. */
export interface GridSummaryValue {
  readonly name: string | undefined;
  readonly column: string | undefined;
  readonly summaryType: GridSummaryType;
  readonly value: unknown;
  /** The text the item displays. */
  readonly text: string;
}
