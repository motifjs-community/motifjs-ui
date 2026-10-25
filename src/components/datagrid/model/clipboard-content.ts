/** What Ctrl+C puts on the clipboard. */
export interface ClipboardContent {
  /** Tab-separated lines (one cell: its text alone). */
  text: string;
  /** The same as an HTML table. */
  html: string;
  /** Rows copied; 0 for the active cell. */
  rows: number;
}
