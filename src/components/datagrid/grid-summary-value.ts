import type { GridSummaryType } from './grid-summary-type';

/** One summary item of a group as its row shows it, for a column's own `groupCell`. */
export interface GridSummaryValue {
  readonly name: string | undefined;
  readonly column: string | undefined;
  readonly summaryType: GridSummaryType;
  readonly value: unknown;
  /** The text the item shows. */
  readonly text: string;
}
