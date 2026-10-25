import type { Bind } from '@motifx/core';
import type { GridSummaryTextInfo } from './grid-summary-text-info';
import type { GridSummaryType } from './grid-summary-type';

/**
 * One item of the total summary: a value of a column's rows shown in the row under the rows. Every
 * field but `customizeText` is a value or a function that is followed.
 *
 * @example
 * { column: 'amount', summaryType: 'sum', valueFormat: { style: 'currency', currency: 'EUR' } }
 */
export interface GridSummaryItem {
  /** The column whose values are aggregated (its `value` reader too). Without one, `count` counts rows and `custom` gets the rows themselves. */
  column?: Bind<string | undefined>;
  /** Default `'count'`. */
  summaryType?: Bind<GridSummaryType>;
  /** Names the item for `getTotalSummaryValue(name)` and `calculateCustomSummary`. */
  name?: Bind<string | undefined>;
  /** The column the item shows under. Default: `column`. */
  showInColumn?: Bind<string | undefined>;
  /**
   * How the value is formatted: `Intl` options (numbers and dates, in the grid's locale) or a function.
   * Default: the column's format (`count`: a plain number).
   */
  valueFormat?: Bind<Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | undefined> | ((value: unknown) => string);
  /** The item's text, `{0}` the formatted value, `{1}` the column's title. Default: a text of `summary.texts`. */
  displayFormat?: Bind<string | undefined>;
  /** The item's text from its value and formatted value; wins over `displayFormat`. */
  customizeText?: (info: GridSummaryTextInfo) => string;
  /** Default: the alignment of the column it shows under. */
  alignment?: Bind<'start' | 'center' | 'end' | undefined>;
  /** A class name of your own on the item's element. */
  cssClass?: Bind<string | undefined>;
  /** Leave empty values out (`count` always counts every row). Default: `summary.skipEmptyValues`. */
  skipEmptyValues?: Bind<boolean | undefined>;
  /** Show the item. Default: the grid's `totalSummary` setting (`groupSummary` for a group item). */
  visible?: Bind<boolean | undefined>;
}
