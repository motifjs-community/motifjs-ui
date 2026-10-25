// Excel export for the DataGrid, the standard `excelExporter` way: the app brings ExcelJS (an
// optional peer dependency), this entry only writes to the worksheet it is given. Apps that do not
// export to Excel never load it.
export { exportDataGrid } from './export-data-grid';
export { excelNumberFormat } from './number-format';
export { excelDateFormat } from './date-format';
export type { ExcelExportOptions } from './excel-export-options';
export type { ExcelCustomizeCellArgs } from './excel-customize-cell-args';
export type { CellRange } from './cell-range';
