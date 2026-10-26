import type { jsPDF } from 'jspdf';
import type { GridExportCell } from '../components/datagrid/grid-export-cell';
import type { PdfCell } from './pdf-cell';

/** What `customDrawCell` gets before a cell is drawn; `cancel` leaves its background and text to you (the borders are still drawn). */
export interface PdfCustomDrawCellArgs<T = any> {
  readonly doc: jsPDF;
  /** Where the cell is on the page. */
  readonly rect: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
  readonly gridCell: GridExportCell<T>;
  readonly pdfCell: PdfCell;
  cancel: boolean;
}
