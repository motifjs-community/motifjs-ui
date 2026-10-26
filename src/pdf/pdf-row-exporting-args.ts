import type { PdfCell } from './pdf-cell';

/** What `onRowExporting` gets before a row is placed: its cells and the height worked out for it, to change. */
export interface PdfRowExportingArgs {
  readonly rowCells: readonly PdfCell[];
  /** Less than its text needs is raised to that. */
  rowHeight: number;
}
