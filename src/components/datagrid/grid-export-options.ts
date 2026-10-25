/** How `exportCsv()` and `exportRows()` write the rows. Every field has a default. */
export interface GridExportOptions {
  /** The text the cells show, or their values (numbers and dates in a neutral form). Default `'shown'`. */
  values?: 'shown' | 'raw';
  /** Only the selected rows ("all" selected over a server: the filter less the rows taken out). Default `false`. */
  selected?: boolean;
  /** Rows asked for per request when the data comes from a server. Default `1000`. */
  pageSize?: number;
  /** Told after each part arrives. */
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
  /** CSV: the file name. Default: the grid's label, or `export`, with `.csv`. */
  fileName?: string;
  /** CSV: save the file (else only the text is returned). Default `true`. */
  download?: boolean;
  /** CSV: the field separator. Default: `;` where the locale writes decimals with a comma, else `,`. */
  separator?: string;
  /** CSV, while grouped: a "Column: value" line before each group. Default `true`. */
  groups?: boolean;
  /** CSV: a first line of column titles. Default `true`. */
  headers?: boolean;
  /** CSV: start with a byte order mark so spreadsheets read UTF-8. Default `true`. */
  bom?: boolean;
  /** CSV: text that a spreadsheet would run as a formula (`=`, `+`, `-`, `@`) gets a `'` in front. Default `true`. */
  escapeFormulas?: boolean;
}
