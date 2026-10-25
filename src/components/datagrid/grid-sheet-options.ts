import type { GridLoadPanel } from './grid-load-panel';

/** How `exportSheet()` collects the rows. Every field has a default. */
export interface GridSheetOptions {
  /** The file format being written, told in `onExported`. Default `'xlsx'`. */
  format?: string;
  /**
   * Only the selected rows. Left out, the selection the toolbar's "Export selected rows" asked for
   * (once), else `false`.
   */
  selectedRowsOnly?: boolean;
  /** A first row of column titles. Default `true`. */
  headers?: boolean;
  /** While grouped: a row per group ("Column: value") before its rows. Default `true`. */
  groups?: boolean;
  /** Group summary items, group footers and the totals, as the grid shows them. Not with selected rows. Default `true`. */
  summaries?: boolean;
  /** Rows asked for per request when the data comes from a server. Default: the `exportPageSize` setting. */
  pageSize?: number;
  /** Told after each part arrives. */
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
  /** The panel over the rows while it runs; `true` / `false` turns it on or off. Default on. */
  loadPanel?: boolean | GridLoadPanel;
}
