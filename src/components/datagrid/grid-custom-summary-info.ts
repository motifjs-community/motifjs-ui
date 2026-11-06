import type { DataGrid } from './DataGrid';

/**
 * What `calculateCustomSummary` receives, once per step of one item over one set of rows: `'start'`
 * (set the initial `totalValue`), `'calculate'` once per row (add `value` to `totalValue`), and
 * `'finalize'` (adjust `totalValue`, which becomes the item's value).
 */
export interface GridCustomSummaryInfo<T = any> {
  /** The item's `name`. */
  readonly name: string | undefined;
  readonly summaryProcess: 'start' | 'calculate' | 'finalize';
  /** With `'calculate'`, the row's value in the item's column, or the row itself when the item has no column. */
  readonly value: unknown;
  totalValue: unknown;
  /** For a group item, the group's level (0 for the top level), or `undefined` for a total item. */
  readonly groupIndex: number | undefined;
  readonly component: DataGrid<T>;
}
