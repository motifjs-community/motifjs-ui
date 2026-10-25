/**
 * Column features the user can use. Turn them on or off for every column through the grid's
 * `settings`, and for one column with the field of the same name on its definition; the column's
 * value wins (`settings: { resizable: false }` and `{ field: 'note', resizable: true }` lets only
 * that column be resized).
 */
export interface ColumnFeatures {
  /** Edit the cells in place: typing, Enter, F2 or a double-click opens the cell's editor. Default `false`. */
  editable: boolean;
  /**
   * Fill the cells of a new row (until it is saved). Default `true`. A column that sets its own
   * `editable` and not `creatable` uses the same value for new rows; `editable: false, creatable: true`
   * is a column entered only once, when the row is created.
   */
  creatable: boolean;
  /** Sort by clicking the header, with Enter on it, or from the column menu. Default `true`. */
  sortable: boolean;
  /** Resize: drag the header edge, double-click it to fit, or "Width" in the column menu. Default `true`. */
  resizable: boolean;
  /** Move: drag the header, or "Move" in the column menu. A column that cannot move keeps its place. Default `true`. */
  movable: boolean;
  /** Hide from the column menu and the column list. Default `true`. */
  hideable: boolean;
  /** Pin to the start or end edge, or unpin, from the column menu. Default `true`. */
  pinnable: boolean;
  /** The column menu: its button in the header, and Alt+ArrowDown on the header. Default `true`. */
  menu: boolean;
  /** A cell in the filter row: a condition and a value box by the column type. The row shows while a visible column has one. Default `false`. */
  filterRow: boolean;
  /** The header filter: a button in the header (and an entry in the column menu) that opens the column's values to choose from. Default `false`. */
  headerFilter: boolean;
  /** The column's cells go into what Ctrl+C copies. Default `true`. */
  copyable: boolean;
  /** The column goes into `exportCsv()` and `exportRows()`. Default `true`. */
  exportable: boolean;
}
