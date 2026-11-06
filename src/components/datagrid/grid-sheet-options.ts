import type { GridLoadPanel } from './grid-load-panel';

/** How `exportSheet()` collects the rows. Every field has a default. */
export interface GridSheetOptions {
  /** The file format being written, reported in `onExported`. The default is `'xlsx'`. */
  format?: string;
  /**
   * Exports only the selected rows. When omitted, it uses the selection requested once by the toolbar's
   * "Export selected rows", otherwise `false`.
   */
  selectedRowsOnly?: boolean;
  /** Adds a first row of column titles. The default is `true`. */
  headers?: boolean;
  /** While grouped, adds a row per group ("Column: value") before its rows. The default is `true`. */
  groups?: boolean;
  /** Includes group summary items, group footers and the totals, except with selected rows. The default is `true`. */
  summaries?: boolean;
  /** The rows per request when the data comes from a server. The default is the `exportPageSize` setting. */
  pageSize?: number;
  /** Called after each part arrives. */
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
  /** The panel over the rows while the export runs. `true` or `false` enables or disables it. It is enabled by default. */
  loadPanel?: boolean | GridLoadPanel;
}
