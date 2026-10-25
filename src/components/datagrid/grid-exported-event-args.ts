/** An export finished. */
export interface GridExportedEventArgs {
  readonly format: 'rows' | 'csv';
  readonly rows: number;
  /** `'csv'`: the text written. */
  readonly text?: string;
}
