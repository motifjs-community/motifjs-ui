import type { DataGrid } from './DataGrid';

/**
 * What `calculateCustomSummary` receives, once per step of one item over one set of rows: `'start'`
 * (set `totalValue` to begin with), `'calculate'` once per row (fold `value` into `totalValue`),
 * `'finalize'` (adjust `totalValue`, which becomes the item's value).
 */
export interface GridCustomSummaryInfo<T = any> {
  /** The item's `name`. */
  readonly name: string | undefined;
  readonly summaryProcess: 'start' | 'calculate' | 'finalize';
  /** `'calculate'`: the row's value in the item's column, or the row itself when the item has no column. */
  readonly value: unknown;
  totalValue: unknown;
  /** For a group item, the group's level (0 for the top one); `undefined` for a total item. */
  readonly groupIndex: number | undefined;
  readonly component: DataGrid<T>;
}
