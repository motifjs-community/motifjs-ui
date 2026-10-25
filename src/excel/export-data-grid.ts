import type { Alignment, Cell, Worksheet } from 'exceljs';
import type { GridSheet } from '../components/datagrid/grid-sheet';
import type { GridSheetCell } from '../components/datagrid/grid-sheet-cell';
import type { GridSheetColumn } from '../components/datagrid/grid-sheet-column';
import { guardFormula } from '../components/datagrid/model/formula-guard';
import type { CellRange } from './cell-range';
import { excelDateFormat } from './date-format';
import type { ExcelExportOptions } from './excel-export-options';
import { excelNumberFormat } from './number-format';

/** Pixels of one character of Excel's default font (Calibri 11), which column widths count in. */
const DIGIT_WIDTH = 7;
/** Excel's widest column, in characters. */
const MAX_WIDTH = 255;
/** Excel's deepest outline. */
const MAX_LEVEL = 7;

type RowType = GridSheet['rows'][number]['rowType'];

/** How a column's cells are written: its number and date formats. */
interface ColumnWriter {
  number: Intl.NumberFormat | null;
  date: string | null;
  /** Number formats by the fraction digits a value shows. */
  numbers: Map<string, string | undefined>;
}

/**
 * Writes a DataGrid to an ExcelJS worksheet's `excelExporter.exportDataGrid` does:
 * the header row, the group rows ("Column: value", their summaries) with outline levels, the data
 * rows in the grid's order with its filter, search and grouping (every matching row, loaded in
 * parts from a server), the group footers and the totals. Numbers stay numbers with a number format
 * made from the column's `Intl` format, dates stay dates, yes/no cells are `TRUE` / `FALSE`, lookup
 * and list cells hold their texts. Bring your own ExcelJS: create the workbook and the worksheet,
 * then save the workbook when the promise resolves with the cells written.
 *
 * @example
 * onExporting={(e) => {
 *   if (e.format !== 'xlsx') return;
 *   const workbook = new ExcelJS.Workbook();
 *   exportDataGrid({ component: e.component, worksheet: workbook.addWorksheet('Orders'), selectedRowsOnly: e.selectedRowsOnly })
 *     .then(() => workbook.xlsx.writeBuffer())
 *     .then((buffer) => saveFile(new Blob([buffer]), 'Orders.xlsx'));
 * }}
 */
export function exportDataGrid<T = any>(options: ExcelExportOptions<T>): Promise<CellRange> {
  if (!options || typeof options !== 'object') return Promise.reject(new TypeError('exportDataGrid needs an options object.'));
  const { component, worksheet } = options;
  if (!component || typeof component.exportSheet !== 'function') return Promise.reject(new TypeError('exportDataGrid: `component` must be a DataGrid.'));
  if (!worksheet || typeof worksheet !== 'object') return Promise.reject(new TypeError('exportDataGrid: `worksheet` must be an ExcelJS worksheet.'));
  const start = topLeft(worksheet, options.topLeftCell);
  return component.exportSheet(
    {
      format: 'xlsx',
      selectedRowsOnly: options.selectedRowsOnly,
      headers: options.headers,
      groups: options.groups,
      summaries: options.summaries,
      pageSize: options.pageSize,
      onProgress: options.onProgress,
      signal: options.signal,
      loadPanel: options.loadPanel ?? true,
    },
    (sheet) => write(sheet, worksheet, start, options),
  );
}

function topLeft(worksheet: Worksheet, given: ExcelExportOptions['topLeftCell']): { row: number; column: number } {
  if (typeof given === 'string') {
    const cell = worksheet.getCell(given);
    return { row: Number(cell.row), column: Number(cell.col) };
  }
  return { row: given?.row ?? 1, column: given?.column ?? 1 };
}

function write<T>(sheet: GridSheet<T>, worksheet: Worksheet, start: { row: number; column: number }, options: ExcelExportOptions<T>): CellRange {
  const cols = sheet.columns;
  const range: CellRange = { from: { ...start }, to: { row: start.row, column: start.column + Math.max(0, cols.length - 1) } };
  worksheet.properties.outlineProperties = { summaryBelow: false, summaryRight: false };
  if (options.keepColumnWidths !== false) {
    cols.forEach((col, j) => {
      if (col.width > 0) worksheet.getColumn(start.column + j).width = Math.min(MAX_WIDTH, Math.floor((col.width / DIGIT_WIDTH) * 100) / 100);
    });
  }
  const formats = options.numberFormats !== false;
  const writers = cols.map(
    (col): ColumnWriter => ({
      number: formats && col.numberFormat ? new Intl.NumberFormat(sheet.locale, col.numberFormat) : null,
      date: formats && col.dateFormat ? excelDateFormat(new Intl.DateTimeFormat(sheet.locale, col.dateFormat)) : null,
      numbers: new Map(),
    }),
  );
  sheet.rows.forEach((row, i) => {
    const excelRow = worksheet.getRow(start.row + i);
    if (row.rowType !== 'header' && options.outline !== false) excelRow.outlineLevel = Math.min(MAX_LEVEL, row.level);
    row.cells.forEach((cell, j) => {
      const excelCell = excelRow.getCell(start.column + j);
      writeCell(excelCell, cell, row.rowType, j, cols[j], writers[j], sheet.rtl, options);
      options.customizeCell?.({ gridCell: cell.gridCell, excelCell });
      if (options.encodeExecutableContent && typeof excelCell.value === 'string') excelCell.value = guardFormula(excelCell.value);
    });
    range.to.row = start.row + i;
  });
  const view = { ...(worksheet.views[0] ?? {}) };
  if (sheet.rtl) view.rightToLeft = true;
  if (sheet.headerRows > 0) {
    if (options.frozenHeader !== false && !('state' in view)) Object.assign(view, { state: 'frozen', ySplit: start.row + sheet.headerRows - 1 });
    if (options.autoFilterEnabled && !worksheet.autoFilter && sheet.rows.length > 0) worksheet.autoFilter = { from: { row: start.row + sheet.headerRows - 1, column: start.column }, to: { ...range.to } };
  }
  if (Object.keys(view).length) worksheet.views = [view];
  return range;
}

function writeCell<T>(excelCell: Cell, cell: GridSheetCell<T>, rowType: RowType, index: number, col: GridSheetColumn<T>, writer: ColumnWriter, rtl: boolean, options: ExcelExportOptions<T>) {
  const value = cell.value;
  if (value instanceof Date) excelCell.value = excelDate(value);
  else if (typeof value === 'boolean' && options.booleanText) excelCell.value = cell.text;
  else excelCell.value = value;
  if (value === null) return;
  const header = rowType === 'header';
  const groupText = rowType === 'group' && index === 0;
  // Header, group and summary cells are bold; the header centered, a group's text at the start.
  if (rowType !== 'data') excelCell.font = { ...excelCell.font, bold: true };
  const align = header ? 'center' : groupText ? 'start' : col.align;
  const alignment: Partial<Alignment> = { ...excelCell.alignment, horizontal: align === 'center' ? 'center' : (align === 'end') !== rtl ? 'right' : 'left', vertical: 'top' };
  if (typeof value === 'string' && value.includes('\n')) alignment.wrapText = true;
  excelCell.alignment = alignment;
  if (rowType !== 'data') return;
  if (typeof value === 'number' && writer.number) {
    const numFmt = numberFormatOf(writer, value);
    if (numFmt) excelCell.numFmt = numFmt;
  } else if (value instanceof Date && writer.date) {
    excelCell.numFmt = writer.date;
  } else if (typeof value === 'string' && /^[@=+-]/.test(value)) {
    // Text, so Excel does not read it as a formula when the cell is edited.
    excelCell.numFmt = '@';
  }
}

function numberFormatOf(writer: ColumnWriter, value: number): string | undefined {
  // The format depends only on the fraction digits a value shows: worked out once per count.
  const shown = writer.number!.formatToParts(Math.abs(value));
  const key = `${shown.find((p) => p.type === 'fraction')?.value.length ?? 0}`;
  if (!writer.numbers.has(key)) writer.numbers.set(key, excelNumberFormat(writer.number!, value));
  return writer.numbers.get(key);
}

/** ExcelJS writes a date as UTC: the local day and time are moved there, so Excel shows what the grid shows. */
function excelDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
}
