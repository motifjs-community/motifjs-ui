import type { jsPDF } from 'jspdf';
import type { DataGrid } from '../components/datagrid/DataGrid';
import type { GridLoadPanel } from '../components/datagrid/grid-load-panel';
import type { PdfCustomDrawCellArgs } from './pdf-custom-draw-cell-args';
import type { PdfCustomizeCellArgs } from './pdf-customize-cell-args';
import type { PdfMargin } from './pdf-margin';
import type { PdfRowExportingArgs } from './pdf-row-exporting-args';

/**
 * The options of `exportDataGrid`. Every field except `jsPDFDocument` and `component` has a default.
 * Sizes are in the units the jsPDF document was created with.
 */
export interface PdfExportOptions<T = any> {
  /** The jsPDF document to draw on (`new jsPDF()`). The table starts on its current page. */
  jsPDFDocument: jsPDF;
  /** The grid to export. */
  component: DataGrid<T>;
  /** Where the table starts on its first page, from the top left margin. The default is `{ x: 0, y: 0 }`. */
  topLeft?: { x?: number; y?: number };
  /** Each column's width, in order. An omitted width uses the grid's. By default, the grid's widths are fitted to the page. */
  columnWidths?: readonly (number | undefined)[];
  /** The space kept free at the page's edges. The default is 40 points on every side. */
  margin?: PdfMargin;
  /** How far the rows of a group are indented from its group row, per level. The default is `0`. */
  indent?: number;
  /** Repeats the header rows at the top of every page. The default is `true`. */
  repeatHeaders?: boolean;
  /**
   * Exports only the selected rows. The default is what the toolbar command requested ("Export selected rows"),
   * otherwise `false`.
   */
  selectedRowsOnly?: boolean;
  /**
   * Shows the panel over the rows while they load, with its progress and a button that stops the export.
   * It is on by default.
   */
  loadPanel?: boolean | GridLoadPanel;
  /** Called for every cell, before the rows are measured, to change its text and appearance. */
  customizeCell?: (e: PdfCustomizeCellArgs<T>) => void;
  /** Called before a cell is drawn, to draw it with custom code (an image, a bar) and set `cancel`. */
  customDrawCell?: (e: PdfCustomDrawCellArgs<T>) => void;
  /** Called before a row is placed, to change its height. */
  onRowExporting?: (e: PdfRowExportingArgs) => void;
  /**
   * Narrows columns that are wider than the page (`'shrink'`), always fits them to its width (`'fill'`), or keeps
   * the grid's widths (`'none'`). This does not apply with `columnWidths`. The default is `'shrink'`.
   */
  fitColumns?: 'shrink' | 'fill' | 'none';
  /** Wraps long text to more lines. When off, a line that does not fit ends in "…". The default is `false`. */
  wordWrapEnabled?: boolean;
  /** The font size of the cells, in points. The default is `10`. */
  fontSize?: number;
  /** Draws the rows of column titles. The default is `true`. */
  headers?: boolean;
  /** While grouped, draws a row per group ("Column: value") before its rows. The default is `true`. */
  groups?: boolean;
  /**
   * Draws group summary items, group footers and the row of totals, as the grid shows them. This does not apply to
   * selected rows. The default is `true`.
   */
  summaries?: boolean;
  /** The rows per request when the data comes from a server. The default is the grid's `exportPageSize` setting. */
  pageSize?: number;
  /** Called after each part of the rows arrives. */
  onProgress?: (loaded: number, total: number) => void;
  /** Stops the export. Its promise rejects with an `AbortError`, and nothing is drawn. */
  signal?: AbortSignal;
}
