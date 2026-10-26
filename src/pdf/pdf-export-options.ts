import type { jsPDF } from 'jspdf';
import type { DataGrid } from '../components/datagrid/DataGrid';
import type { GridLoadPanel } from '../components/datagrid/grid-load-panel';
import type { PdfCustomDrawCellArgs } from './pdf-custom-draw-cell-args';
import type { PdfCustomizeCellArgs } from './pdf-customize-cell-args';
import type { PdfMargin } from './pdf-margin';
import type { PdfRowExportingArgs } from './pdf-row-exporting-args';

/**
 * Options of `exportDataGrid` (`pdfExporter.exportDataGrid` options, and a few of our
 * own). Every field but `jsPDFDocument` and `component` has a default. Sizes are in the units the
 * jsPDF document was made with.
 */
export interface PdfExportOptions<T = any> {
  /** The jsPDF document to draw on (`new jsPDF()`); the table starts on its current page. */
  jsPDFDocument: jsPDF;
  /** The grid to export. */
  component: DataGrid<T>;
  /** Where the table starts, from the top left margin, on its first page. Default `{ x: 0, y: 0 }`. */
  topLeft?: { x?: number; y?: number };
  /** Each column's width, in order; one left out takes the grid's. Default: the grid's widths, made to fit the page. */
  columnWidths?: readonly (number | undefined)[];
  /** Space kept free at the page's edges. Default 40 points on every side. */
  margin?: PdfMargin;
  /** How far the rows of a group sit in from its group row, per level. Default `0`. */
  indent?: number;
  /** The header rows again at the top of every page. Default `true`. */
  repeatHeaders?: boolean;
  /** Only the selected rows. Default: what the toolbar's command asked for ("Export selected rows"), else `false`. */
  selectedRowsOnly?: boolean;
  /** The panel over the rows while they load, with its progress and a button that stops the export. Default on. */
  loadPanel?: boolean | GridLoadPanel;
  /** Called for every cell, before the rows are measured: change its text and look. */
  customizeCell?: (e: PdfCustomizeCellArgs<T>) => void;
  /** Called before a cell is drawn; draw it yourself (an image, a bar) and set `cancel`. */
  customDrawCell?: (e: PdfCustomDrawCellArgs<T>) => void;
  /** Called before a row is placed: change its height. */
  onRowExporting?: (e: PdfRowExportingArgs) => void;
  /** Columns narrower when they are wider than the page (`'shrink'`), always as wide as it (`'fill'`), or as the grid has them (`'none'`). Without `columnWidths`. Default `'shrink'`. */
  fitColumns?: 'shrink' | 'fill' | 'none';
  /** Long text goes on to more lines; off, a line that does not fit ends in "…". Default `false`. */
  wordWrapEnabled?: boolean;
  /** The font size of the cells, in points. Default `10`. */
  fontSize?: number;
  /** The rows of column titles. Default `true`. */
  headers?: boolean;
  /** While grouped: a row per group ("Column: value") before its rows. Default `true`. */
  groups?: boolean;
  /** Group summary items, group footers and the row of totals, as the grid shows them. Not with selected rows. Default `true`. */
  summaries?: boolean;
  /** Rows asked for per request when the data comes from a server. Default: the grid's `exportPageSize` setting. */
  pageSize?: number;
  /** Told after each part of the rows arrives. */
  onProgress?: (loaded: number, total: number) => void;
  /** Stops the export; its promise rejects with an `AbortError` and nothing is drawn. */
  signal?: AbortSignal;
}
