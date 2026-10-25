import type { Cell } from 'exceljs';
import type { GridExportCell } from '../components/datagrid/grid-export-cell';

/** What `customizeCell` gets for each cell written: the grid's cell and the ExcelJS cell, its value and style set. */
export interface ExcelCustomizeCellArgs<T = any> {
  readonly gridCell: GridExportCell<T>;
  /** Change its `value`, `numFmt`, `font`, `fill`, `alignment`, `border`… */
  readonly excelCell: Cell;
}
