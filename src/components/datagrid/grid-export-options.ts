import type { GridLoadPanel } from './grid-load-panel';

/** How `exportCsv()` and `exportRows()` write the rows. Every field has a default. */
export interface GridExportOptions {
  /** The displayed text of the cells, or their values (numbers and dates in a neutral form). The default is `'shown'`. */
  values?: 'shown' | 'raw';
  /** Exports only the selected rows ("all" over a server is the filter minus the rows removed). The default is `false`. */
  selected?: boolean;
  /** The rows per request when the data comes from a server. The default is `1000`. */
  pageSize?: number;
  /** Called after each part arrives. */
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
  /**
   * The panel over the rows while the export runs, with its progress and a button that stops it. `true`
   * enables it. By default, it is disabled.
   */
  loadPanel?: boolean | GridLoadPanel;
  /** For CSV, the file name. The default is the grid's label, or `export`, with `.csv`. */
  fileName?: string;
  /** For CSV, saves the file. Otherwise, only the text is returned. The default is `true`. */
  download?: boolean;
  /** For CSV, the field separator. By default, `;` where the locale writes decimals with a comma, otherwise `,`. */
  separator?: string;
  /** For CSV while grouped, adds a "Column: value" line before each group. The default is `true`. */
  groups?: boolean;
  /**
   * Includes the summaries as the grid displays them: each group's footer line after its rows, the
   * totals row last (as objects with the same fields in `exportRows()`), and the group summary items on
   * the group lines. Several items of one column share a cell, one per line. This does not apply with
   * `selected`. The default is `true`.
   */
  summaries?: boolean;
  /** For CSV, adds a first line of column titles. The default is `true`. */
  headers?: boolean;
  /** For CSV, starts with a byte order mark so that spreadsheets read UTF-8. The default is `true`. */
  bom?: boolean;
  /**
   * For CSV, prefixes text that a spreadsheet would run as a formula (`=`, `+`, `-`, `@`) with a `'`. The
   * default is `true`.
   */
  escapeFormulas?: boolean;
}
