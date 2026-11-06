import type { Bind } from '@motifx/core';
import type { GridSummaryTextInfo } from './grid-summary-text-info';
import type { GridSummaryType } from './grid-summary-type';

/**
 * One item of the total summary: a value calculated from a column's rows, displayed in the row below
 * the rows. Every field except `customizeText` is a value or a tracked function.
 *
 * @example
 * { column: 'amount', summaryType: 'sum', valueFormat: { style: 'currency', currency: 'EUR' } }
 */
export interface GridSummaryItem {
  /**
   * The column whose values are aggregated (including its `value` reader). Without one, `count` counts
   * rows and `custom` receives the rows themselves.
   */
  column?: Bind<string | undefined>;
  /** The aggregate type. The default is `'count'`. */
  summaryType?: Bind<GridSummaryType>;
  /** Names the item for `getTotalSummaryValue(name)` and `calculateCustomSummary`. */
  name?: Bind<string | undefined>;
  /** The column the item appears below. The default is `column`. */
  showInColumn?: Bind<string | undefined>;
  /**
   * How the value is formatted: `Intl` options (numbers and dates, in the grid's locale) or a function.
   * The default is the column's format (for `count`, a plain number).
   */
  valueFormat?: Bind<Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | undefined> | ((value: unknown) => string);
  /**
   * The item's text, where `{0}` is the formatted value and `{1}` is the column's title. The default
   * comes from `summary.texts`.
   */
  displayFormat?: Bind<string | undefined>;
  /** Returns the item's text from its value and formatted value. Takes precedence over `displayFormat`. */
  customizeText?: (info: GridSummaryTextInfo) => string;
  /** The alignment. The default is the alignment of the column it appears below. */
  alignment?: Bind<'start' | 'center' | 'end' | undefined>;
  /** A custom class name on the item's element. */
  cssClass?: Bind<string | undefined>;
  /** Omits empty values (`count` always counts every row). The default is `summary.skipEmptyValues`. */
  skipEmptyValues?: Bind<boolean | undefined>;
  /** Shows the item. The default is the grid's `totalSummary` setting (`groupSummary` for a group item). */
  visible?: Bind<boolean | undefined>;
}
