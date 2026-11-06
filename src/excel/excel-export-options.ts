import type { Worksheet } from 'exceljs';
import type { DataGrid } from '../components/datagrid/DataGrid';
import type { GridLoadPanel } from '../components/datagrid/grid-load-panel';
import type { ExcelCustomizeCellArgs } from './excel-customize-cell-args';

/** The options of `exportDataGrid`. Every field except `component` and `worksheet` has a default. */
export interface ExcelExportOptions<T = any> {
  /** The grid to export. */
  component: DataGrid<T>;
  /** The ExcelJS worksheet to write to (`workbook.addWorksheet('Orders')`). */
  worksheet: Worksheet;
  /**
   * Where the first cell goes: `{ row, column }` from 1, or a reference such as `'B2'`.
   * The default is `{ row: 1, column: 1 }`.
   */
  topLeftCell?: { row: number; column: number } | string;
  /** Called for every written cell, after its value and style are set. */
  customizeCell?: (e: ExcelCustomizeCellArgs<T>) => void;
  /** Adds Excel's filter buttons to the header row. The default is `false`. */
  autoFilterEnabled?: boolean;
  /** Keeps columns as wide as they are in the grid. The default is `true`. */
  keepColumnWidths?: boolean;
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
  /** Prefixes text that a spreadsheet would run as a formula (`=`, `+`, `-`, `@`…) with `'`. The default is `false`. */
  encodeExecutableContent?: boolean;
  /** Writes a first row of column titles. The default is `true`. */
  headers?: boolean;
  /** Keeps the header row in view while the sheet scrolls. The default is `true`. */
  frozenHeader?: boolean;
  /** Merges band headers over their columns, and a column's header down the band rows above it. The default is `true`. */
  mergeHeaders?: boolean;
  /** While grouped, writes a row per group ("Column: value") before its rows. The default is `true`. */
  groups?: boolean;
  /**
   * Lets the rows of a group be collapsed in Excel, with outline levels by group (at most 7, Excel's limit).
   * The default is `true`.
   */
  outline?: boolean;
  /**
   * Writes group summary items, group footers and the row of totals, as the grid shows them. This does not apply to
   * selected rows. The default is `true`.
   */
  summaries?: boolean;
  /** Gives number and date cells an Excel number format created from the column's `Intl` format. The default is `true`. */
  numberFormats?: boolean;
  /** Writes the grid's yes/no text in yes/no cells instead of Excel's `TRUE` / `FALSE`. The default is `false`. */
  booleanText?: boolean;
  /** The rows per request when the data comes from a server. The default is the grid's `exportPageSize` setting. */
  pageSize?: number;
  /** Called after each part of the rows arrives. */
  onProgress?: (loaded: number, total: number) => void;
  /** Stops the export, and its promise rejects with an `AbortError`. */
  signal?: AbortSignal;
}
