import type { Worksheet } from 'exceljs';
import type { DataGrid } from '../components/datagrid/DataGrid';
import type { GridLoadPanel } from '../components/datagrid/grid-load-panel';
import type { ExcelCustomizeCellArgs } from './excel-customize-cell-args';

/** Options of `exportDataGrid` (`excelExporter.exportDataGrid` options, and a few of our own). Every field but `component` and `worksheet` has a default. */
export interface ExcelExportOptions<T = any> {
  /** The grid to export. */
  component: DataGrid<T>;
  /** The ExcelJS worksheet to write to (`workbook.addWorksheet('Orders')`). */
  worksheet: Worksheet;
  /** Where the first cell goes: `{ row, column }` from 1, or a reference such as `'B2'`. Default `{ row: 1, column: 1 }`. */
  topLeftCell?: { row: number; column: number } | string;
  /** Called for every cell written, after its value and style are set. */
  customizeCell?: (e: ExcelCustomizeCellArgs<T>) => void;
  /** Excel's filter buttons on the header row. Default `false`. */
  autoFilterEnabled?: boolean;
  /** Columns as wide as they are in the grid. Default `true`. */
  keepColumnWidths?: boolean;
  /** Only the selected rows. Default: what the toolbar's command asked for ("Export selected rows"), else `false`. */
  selectedRowsOnly?: boolean;
  /** The panel over the rows while the rows load, with its progress and a button that stops the export. Default on. */
  loadPanel?: boolean | GridLoadPanel;
  /** Text that a spreadsheet would run as a formula (`=`, `+`, `-`, `@`…) gets a `'` in front. Default `false`. */
  encodeExecutableContent?: boolean;
  /** A first row of column titles. Default `true`. */
  headers?: boolean;
  /** The header row stays in view while the sheet scrolls. Default `true`. */
  frozenHeader?: boolean;
  /** Band headers merge over their columns, and a column's header down the band rows above it. Default `true`. */
  mergeHeaders?: boolean;
  /** While grouped: a row per group ("Column: value") before its rows. Default `true`. */
  groups?: boolean;
  /** Rows of a group can be folded in Excel: outline levels by group (at most 7, Excel's limit). Default `true`. */
  outline?: boolean;
  /** Group summary items, group footers and the row of totals, as the grid shows them. Not with selected rows. Default `true`. */
  summaries?: boolean;
  /** Number and date cells get an Excel number format made from the column's `Intl` format. Default `true`. */
  numberFormats?: boolean;
  /** Yes/no cells hold the grid's yes/no text instead of Excel's `TRUE` / `FALSE`. Default `false`. */
  booleanText?: boolean;
  /** Rows asked for per request when the data comes from a server. Default: the grid's `exportPageSize` setting. */
  pageSize?: number;
  /** Told after each part of the rows arrives. */
  onProgress?: (loaded: number, total: number) => void;
  /** Stops the export; its promise rejects with an `AbortError`. */
  signal?: AbortSignal;
}
