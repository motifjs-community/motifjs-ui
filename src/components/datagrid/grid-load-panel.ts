/** The panel over the rows while an export runs: what it says, how far it got, and a button that stops it. */
export interface GridLoadPanel {
  /** Default `true` for `exportDataGrid`, `false` for `exportCsv` and `exportRows`. */
  enabled?: boolean;
  /** Default: the `gridExporting` text of `uiLocale`. */
  text?: string;
  /** "1,000 of 25,000 rows" under the text, with a progress bar. Default `true`. */
  showProgress?: boolean;
  /** A button that stops the export (its promise rejects with an `AbortError`). Default `true`. */
  cancelButton?: boolean;
}
