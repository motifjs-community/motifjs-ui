import type { GridExportCell } from '../components/datagrid/grid-export-cell';
import type { PdfCell } from './pdf-cell';

/** What `customizeCell` gets for each cell: the grid's cell and the PDF cell to change. */
export interface PdfCustomizeCellArgs<T = any> {
  readonly gridCell: GridExportCell<T>;
  readonly pdfCell: PdfCell;
}
