/** An export finished. */
export interface GridExportedEventArgs {
  /** `'rows'`, `'csv'`, or the format a writer of `exportSheet()` wrote (`'xlsx'`). */
  readonly format: 'rows' | 'csv' | 'xlsx' | (string & {});
  readonly rows: number;
  /** `'csv'`: the text written. */
  readonly text?: string;
}
