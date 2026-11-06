/** Where the table ended, for continuing to write below it. */
export interface PdfExportResult {
  /** The page of the last row, counted from 1. */
  readonly page: number;
  /** The bottom of the last row on that page, in the document's units. */
  readonly y: number;
}
