/** Where the table ended, to go on writing under it. */
export interface PdfExportResult {
  /** The page of the last row (from 1). */
  readonly page: number;
  /** The bottom of the last row on that page, in the document's units. */
  readonly y: number;
}
