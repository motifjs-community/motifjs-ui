import type { ColumnFeatures } from './column-features';

/**
 * Everything in the grid that can be turned on or off. Give some of them through the `settings`
 * prop (a value or a function each); `grid.settings` holds all of them and is live: assign a field
 * and the grid follows.
 */
export interface GridSettings extends ColumnFeatures {
  /** Shift+click (Shift+Enter) on a header adds the column to the sort. Default `true`. */
  multiSort: boolean;
  /** The user can add rows (the "New row" button and the Tab chain). `addRow()` always works. Default `false`. */
  addRows: boolean;
  /** The grid's own "New row" button in the bottom bar, while `addRows` is on. Default `true`. */
  newRowButton: boolean;
  /** Tab on the last editable cell of a new row saves it and opens the next new row. Default `true`. */
  tabChain: boolean;
  /** Where Enter in an open editor goes after keeping the value: stay, the cell below, or on like Tab. Default `'none'`. */
  enterMoves: 'none' | 'down' | 'next';
  /** The narrow column at the start that marks new, changed, removed, saving and failed rows. Default `true`. */
  rowStatus: boolean;
  /** "Save changes" and "Discard" in the bottom bar while there are unsaved changes (batch mode). Default `true`. */
  saveButtons: boolean;
  /** "N rows with errors" and "Next error" in the bottom bar. Default `true`. */
  errorSummary: boolean;
  /** Header buttons show on hover and focus (always on touch screens), or always. Default `'hover'`. */
  headerButtons: 'hover' | 'always';
  /** The list of columns (show/hide) in the column menu. Default `true`. */
  columnChooser: boolean;
  /** "Reset layout" in the column menu. Default `true`. */
  layoutReset: boolean;
  /** Full text of a clipped cell, or its message, on hover and on keyboard focus. Default `true`. */
  tooltips: boolean;
  /** Alternate row background. Default `false`. */
  striped: boolean;
  /** Row count in the bottom bar. Default `true`. */
  rowCount: boolean;
  /** The pager in paged mode. Turn it off to page from your own controls (`grid.page`). Default `true`. */
  pager: boolean;
  /** The actions column, while the `actions` prop gives actions. Default `true`. */
  actionsColumn: boolean;
  /** Where the actions column sits. Default `'end'`. */
  actionsPosition: 'start' | 'end';
  /** The actions column stays at its edge while the rows scroll sideways; `false` scrolls it with them. Default `true`. */
  actionsSticky: boolean;
  /** Width of the actions column in pixels; actions that do not fit go into its "more" menu. Default `140`. */
  actionsWidth: number;
  /** No selection, one row, or any number of rows. Default `'none'`. */
  selection: 'none' | 'single' | 'multiple';
  /** The check box column in front of the rows (multiple selection). Default `true`. */
  selectionColumn: boolean;
  /** The check box in its header and Ctrl+A select every row of the filter (multiple selection). Default `true`. */
  selectAll: boolean;
  /** "N selected" in the bottom bar. Default `true`. */
  selectedCount: boolean;
  /** Milliseconds between the last key typed in the filter row and the filter being applied. Default `300`. */
  filterDelay: number;
  /** What Ctrl+C copies: the text the cells show, or their values (numbers and dates in a neutral form). Default `'shown'`. */
  copyValues: 'shown' | 'raw';
  /** Copied rows start with a line of column titles. Default `false`. */
  copyHeaders: boolean;
  /** Ctrl+V writes tab-separated text into the editable cells from the active one, rightwards and downwards. Default `true`. */
  paste: boolean;
  /** Pasted lines past the last row open new rows (while `addRows` is on). Default `false`. */
  pasteNewRows: boolean;
  /** An "Export" button in the bottom bar that saves the rows as a CSV file. Default `false`. */
  exportButton: boolean;
  /** With `layoutKey`, the layout and the filters are kept in the browser's storage and come back. Default `true`. */
  saveLayout: boolean;
}
