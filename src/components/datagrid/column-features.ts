/**
 * The column features available to the user. Enable or disable them for every column through the
 * grid's `settings`, and for one column with the field of the same name on its definition. The
 * column's value takes precedence (`settings: { resizable: false }` and
 * `{ field: 'note', resizable: true }` allow only that column to be resized).
 */
export interface ColumnFeatures {
  /** Allows editing cells in place: typing, Enter, F2 or a double-click opens the cell's editor. The default is `false`. */
  editable: boolean;
  /**
   * Allows filling the cells of a new row until it is saved. The default is `true`. A column with its
   * own `editable` and no `creatable` uses the same value for new rows, and
   * `editable: false, creatable: true` can be entered only when the row is created.
   */
  creatable: boolean;
  /** Allows sorting by clicking the header, with Enter on it, or from the column menu. The default is `true`. */
  sortable: boolean;
  /**
   * Allows resizing by dragging the header edge, double-clicking it to fit, or "Width" in the column
   * menu. The default is `true`.
   */
  resizable: boolean;
  /**
   * Allows moving by dragging the header, or "Move" in the column menu. A column that cannot move keeps
   * its position. The default is `true`.
   */
  movable: boolean;
  /** Allows hiding from the column menu and the column list. The default is `true`. */
  hideable: boolean;
  /** Allows pinning to the start or end edge, and unpinning, from the column menu. The default is `true`. */
  pinnable: boolean;
  /** Shows the column menu: its button in the header, and Alt+ArrowDown on the header. The default is `true`. */
  menu: boolean;
  /**
   * Shows a cell in the filter row, with a condition and a value box for the column type. The row
   * appears while a visible column has one. The default is `false`.
   */
  filterRow: boolean;
  /**
   * Shows the header filter: a button in the header (and an entry in the column menu) that opens the
   * column's values for selection. The default is `false`.
   */
  headerFilter: boolean;
  /**
   * Makes the column a field of the filter builder, and the filter panel shows its conditions with its
   * title. The default is `true`.
   */
  filterBuilder: boolean;
  /** Includes the column's cells in what Ctrl+C copies. The default is `true`. */
  copyable: boolean;
  /**
   * Allows the column's cells to be selected in cell ranges (`cellSelection`). When disabled, a range
   * omits them and a click there draws no range. The default is `true`.
   */
  cellSelectable: boolean;
  /** Includes the column in `exportCsv()` and `exportRows()`. The default is `true`. */
  exportable: boolean;
  /**
   * A lookup column's filter row and header filter list only the keys of rows that match the other
   * filters (the cities of the selected state). The default is `true`.
   */
  syncLookupFilterValues: boolean;
  /**
   * Includes this column in the search panel's search. The default is `true`. A column that disables
   * its own filters (`filterRow: false` and no `headerFilter: true`, or the reverse) is omitted unless
   * it sets `searchable` itself.
   */
  searchable: boolean;
  /**
   * Allows grouping by the column: dragging its header to the group panel, or "Group by this column"
   * in its menu. Programmatic grouping (`groupIndex`, `grid.group`) always works. The default is `true`.
   */
  groupable: boolean;
  /** A grouped column still appears among the other columns. The default is `false`. */
  showWhenGrouped: boolean;
  /**
   * Allows the user to expand and collapse the groups of this column. When disabled, they change only
   * programmatically (`expandAll()`, `collapseGroup()`…). The default is `true`.
   */
  allowCollapsing: boolean;
  /** Group rows show their row count, "(12)". The default is `true`. */
  groupCount: boolean;
  /**
   * "Group by this column", "Ungroup" and "Ungroup all" in the column menu. When not set on the grid
   * and column, they appear while the group panel accepts headers, as the keyboard alternative.
   */
  groupMenu: boolean;
}
