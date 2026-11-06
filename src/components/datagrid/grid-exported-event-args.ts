/** Occurs when an export finishes. */
export interface GridExportedEventArgs {
  /** `'rows'`, `'csv'`, or the format a writer of `exportSheet()` wrote (`'xlsx'`). */
  readonly format: 'rows' | 'csv' | 'xlsx' | (string & {});
  readonly rows: number;
  /** With `'csv'`, the text written. */
  readonly text?: string;
}
