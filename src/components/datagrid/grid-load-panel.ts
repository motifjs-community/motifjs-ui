/** The panel over the rows while an export runs: its text, its progress and a button that stops it. */
export interface GridLoadPanel {
  /** Enables the panel. The default is `true` for `exportDataGrid`, and `false` for `exportCsv` and `exportRows`. */
  enabled?: boolean;
  /** The panel's text. The default is the `gridExporting` text of `uiLocale`. */
  text?: string;
  /** Shows "1,000 of 25,000 rows" below the text, with a progress bar. The default is `true`. */
  showProgress?: boolean;
  /** Shows a button that stops the export (its promise rejects with an `AbortError`). The default is `true`. */
  cancelButton?: boolean;
}
