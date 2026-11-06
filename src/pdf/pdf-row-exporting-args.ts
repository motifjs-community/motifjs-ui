import type { PdfCell } from './pdf-cell';

/** What `onRowExporting` receives before a row is placed: its cells and its calculated height, which can be changed. */
export interface PdfRowExportingArgs {
  readonly rowCells: readonly PdfCell[];
  /** A height less than its text needs is raised to that height. */
  rowHeight: number;
}
