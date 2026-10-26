import type { ColumnFeatures } from './column-features';
import type { ColumnResizeMode } from './column-resize-mode';
import type { GridActionLocation } from './grid-action-location';
import type { GridCellExtendKeys } from './grid-cell-extend-keys';
import type { GridCellSummaryItem } from './grid-cell-summary-item';
import type { GridRowExtendKeys } from './grid-row-extend-keys';
import type { GridDateInterval } from './grid-date-interval';

/**
 * Everything in the grid that can be turned on or off. Give some of them through the `settings`
 * prop (a value or a function each); `grid.settings` holds all of them and is live: assign a field
 * and the grid follows.
 */
export interface GridSettings extends ColumnFeatures {
  /**
   * Resizing a column: `'widget'` changes that column alone and the columns after it shift with it;
   * `'nextColumn'` moves only the edge between it and the next column, which gives or takes the
   * difference, so nothing else moves. A column can set its own. Default `'widget'`.
   */
  resizeMode: ColumnResizeMode;
  /** Shift+click (Shift+Enter) on a header adds the column to the sort. Default `true`. */
  multiSort: boolean;
  /** The user can add rows (the "New row" button and the Tab chain). `addRow()` always works. Default `false`. */
  addRows: boolean;
  /** The grid's own "New row" button in the toolbar, while `addRows` is on. Default `true`. */
  newRowButton: boolean;
  /** Tab on the last editable cell of a new row saves it and opens the next new row. Default `true`. */
  tabChain: boolean;
  /** Where Enter in an open editor goes after keeping the value: stay, the cell below, or on like Tab. Default `'none'`. */
  enterMoves: 'none' | 'down' | 'next';
  /** The narrow column at the start that marks new, changed, removed, saving and failed rows. Default `true`. */
  rowStatus: boolean;
  /** "Save changes" and "Discard" in the toolbar (batch mode); they are dimmed while there is nothing to save. Default `true`. */
  saveButtons: boolean;
  /** "N rows with errors" and "Next error" in the bottom bar. Default `true`. */
  errorSummary: boolean;
  /** Header buttons show on hover and focus (always on touch screens), or always. Default `'hover'`. */
  headerButtons: 'hover' | 'always';
  /** The list of columns (show/hide) in the column menu, and behind the toolbar's column button. Default `true`. */
  columnChooser: boolean;
  /** A button in the toolbar that opens the list of columns (while `columnChooser` is on). Default `false`. */
  columnChooserButton: boolean;
  /** "Reset layout" in the column menu. Default `true`. */
  layoutReset: boolean;
  /** Full text of a clipped cell, or its message, on hover and on keyboard focus. Default `true`. */
  tooltips: boolean;
  /** Alternate row background. Default `false`. */
  striped: boolean;
  /** Row count in the bottom bar. Default `true`. */
  rowCount: boolean;
  /**
   * The pager in paged mode; `'auto'` shows it only while there is more than one page. Turn it off
   * to page from your own controls (`grid.page`). Default `true`.
   */
  pager: boolean | 'auto';
  /** The actions column, while the `actions` prop gives actions. Default `true`. */
  actionsColumn: boolean;
  /** Where the actions column sits. Default `'end'`. */
  actionsPosition: 'start' | 'end';
  /** The actions column stays at its edge while the rows scroll sideways; `false` scrolls it with them. Default `true`. */
  actionsSticky: boolean;
  /** Width of the actions column in pixels; actions that do not fit go into its "more" menu. Default `140`. */
  actionsWidth: number;
  /**
   * Where the actions show: in each row, in the toolbar (the `rowActions` item) or in the bottom bar,
   * for the rows they act on (`actionsTarget`). An action's `location` wins. Default `'row'`.
   */
  actionsLocation: GridActionLocation;
  /**
   * The rows the toolbar and the bottom bar act on: the selected rows, the active row, or `'auto'`:
   * the selected rows while selection is on, else the active row. Default `'auto'`.
   */
  actionsTarget: 'selection' | 'focused' | 'auto';
  /**
   * How actions show: `'auto'` the buttons that fit and a "more" menu for the rest; `'menu'` only the
   * "more" button, with every action in its menu (in the bars, one "Actions" menu button). The column
   * is then as wide as that button, unless an action is a button always (`menu: 'never'`): then
   * `actionsWidth`. An action's `menu` wins. The context menu always lists them all. Default `'auto'`.
   */
  actionsDisplay: 'auto' | 'menu';
  /** On several rows an action can be used while it is enabled for all of them, or for any (it runs on those). Default `'all'`. */
  actionsMultipleEnabled: 'all' | 'any';
  /** The count of rows after an action's text when it acts on several ("Approve (3)"). Default `true`. */
  actionsShowCount: boolean;
  /** Running an action on several rows one by one, a failed row stops the rest. Default `false`. */
  actionsStopOnError: boolean;
  /** While an action works on several rows: a panel over the rows with the progress. Default `true`. */
  actionsProgress: boolean;
  /** A "Stop" button in that panel. Default `true`. */
  actionsStopButton: boolean;
  /** A row's actions in its context menu (right click, Shift+F10), wherever they show. Default `true`. */
  actionsContextMenu: boolean;
  /** No selection, one row, or any number of rows. Default `'none'`. */
  selection: 'none' | 'single' | 'multiple';
  /** The check box column in front of the rows (multiple selection). Default `true`. */
  selectionColumn: boolean;
  /** The check box in its header and Ctrl+A select every row of the filter (multiple selection). Default `true`. */
  selectAll: boolean;
  /** "N selected" in the bottom bar. Default `true`. */
  selectedCount: boolean;
  /**
   * Multiple selection: pressing on a row and dragging over others selects the rows passed, live
   * (Ctrl/⌘ adds them to the selection, Shift goes from the anchor); dragging over the check boxes
   * gives the rows passed the state the first one takes. Default `true`.
   */
  rowDragSelection: boolean;
  /**
   * Rectangles of cells, as in a spreadsheet: `'single'` one range at a time, `'multiple'` more with
   * Ctrl/⌘. Pressing on a cell and dragging draws a range, Shift+click and Shift with the arrows
   * extend it; Ctrl+C copies it, Ctrl+V fills it, Delete empties it. While it is on, clicks on the
   * cells draw ranges and rows are selected from the check box column. Default `'none'`.
   */
  cellSelection: 'none' | 'single' | 'multiple';
  /** Ranges are drawn by dragging over the cells (off: only Shift+click and the keys draw them). Default `true`. */
  cellDragSelection: boolean;
  /** Pixels the pointer moves after a press before a drag selection starts; a shorter move is a click. Default `5`. */
  dragSelectionThreshold: number;
  /** While rows or cells are selected by dragging, the rows scroll when the pointer is near or past an edge, down and sideways. Default `true`. */
  dragSelectionAutoScroll: boolean;
  /** Pixels a frame those rows scroll by at the edge (and past it), less on the way in. Default `30`. */
  dragSelectionScrollSpeed: number;
  /** How near an edge, in pixels, the scrolling starts. Default `60`. */
  dragSelectionScrollSensitivity: number;
  /** On a touch screen a drag scrolls the rows (`'scroll'`), or a long press starts a drag selection (`'longPress'`). Default `'scroll'`. */
  dragSelectionTouch: 'scroll' | 'longPress';
  /** Milliseconds a finger rests before a drag selection starts (`dragSelectionTouch: 'longPress'`). Default `500`. */
  dragSelectionLongPress: number;
  /** A drag selection may start on a cell the user can edit (a click on it still edits it). Default `true`. */
  dragSelectionOnEditableCells: boolean;
  /** Keys that select every cell (`cellSelection` on): the rows the user can reach, every selectable column. Default `['Mod+A']`. */
  selectAllCellsKeys: readonly string[];
  /** Keys that clear the cell ranges. Default `['Escape']`. */
  clearCellSelectionKeys: readonly string[];
  /**
   * Keys that extend the last cell range from its far corner (no range: one from the active cell),
   * focus going with the corner. Default: Shift with the arrows, PageUp / PageDown and Home / End;
   * `Mod+Shift` with the arrows to the edges, with Home / End to the first and last cell.
   */
  extendCellsKeys: GridCellExtendKeys;
  /** Multiple selection: keys that select or deselect the active row. Default `['Shift+Space']` (Space alone does on the check box column and on cells that cannot be edited). */
  toggleRowSelectionKeys: readonly string[];
  /** Multiple selection: keys that move the active row and extend the selection from the anchor. Default Shift with Up / Down and PageUp / PageDown. */
  extendRowSelectionKeys: GridRowExtendKeys;
  /** The count, sum and average of the selected cells in the bottom bar, while more than one cell is selected. Default `true`. */
  cellSummary: boolean;
  /** What that summary shows, in order. Default `['average', 'count', 'sum']`. */
  cellSummaryItems: readonly GridCellSummaryItem[];
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
  /** An "Export" button in the toolbar: the formats of `export` (a CSV file by default), as a menu when it offers more than one. Default `false`. */
  exportButton: boolean;
  /** With `layoutKey`, the layout, the filters and the search text are kept in the browser's storage and come back. Default `true`. */
  saveLayout: boolean;
  /** A search box in the toolbar that looks for its text in every searchable column at once. Default `false`. */
  searchPanel: boolean;
  /** Width of the search box: pixels, or any CSS length. Default `160`. */
  searchPanelWidth: number | string;
  /** The search box's placeholder. Default: the `gridSearchPlaceholder` text of `uiLocale`. */
  searchPlaceholder: string;
  /** Milliseconds between the last key typed in the search box and the search. Default `700`. */
  searchDelay: number;
  /** The text the search found is marked in the cells. Default `true`. */
  highlightSearchText: boolean;
  /** Only text in the same case as the search text is marked (the search itself ignores case). Default `false`. */
  highlightCaseSensitive: boolean;
  /** The search looks only in the visible columns. Default `false`: hidden columns too. */
  searchVisibleColumnsOnly: boolean;
  /**
   * The filter panel under the rows: a check box that turns the filter value on and off, its text
   * (which opens the filter builder) or "Create Filter", and "Clear". Default `false`.
   */
  filterPanel: boolean;
  /**
   * The filter row and the header filters are part of the filter value, both ways: what the builder
   * sets shows in them where they can show it, what they set shows in the panel and the builder.
   * `'auto'`: while the filter panel shows. Default `'auto'`.
   */
  filterSyncEnabled: boolean | 'auto';
  /** The group panel at the start of the toolbar: the grouped columns as chips, and where headers are dropped to group by them. Default `false`. */
  groupPanel: boolean;
  /** Headers can be dragged to the group panel and chips back to the headers or along the panel. Off, the panel only shows the grouping. Default `true`. */
  groupPanelDragging: boolean;
  /** What the empty group panel says. Default: the `gridGroupPanelEmpty` text of `uiLocale`. */
  groupPanelEmptyText: string;
  /** Groups start open; a column's `autoExpandGroup` decides for its own level. Default `true`. */
  autoExpandAll: boolean;
  /** A group opens and closes from its arrow (and the keyboard), or from a click anywhere on its row. A column can set its own. Default `'button'`. */
  groupExpandMode: 'button' | 'rowClick';
  /**
   * Who groups the rows of a data source: `'auto'` the source's adapter when it groups and the source
   * loads by blocks (else memory), `true` the adapter whenever the source loads by blocks and every
   * level has a field it groups by, `false` always memory, from every matching row. Default `'auto'`.
   */
  remoteGrouping: 'auto' | boolean;
  /**
   * Grouping or summaries in memory over a source that loads pages or blocks: rows asked for per
   * request while every matching row loads; 0 asks for all at once. Default `0`.
   */
  groupLoadPageSize: number;
  /** The row under the rows with the items of `summary.totalItems`; an item's `visible` wins. Default `true`. */
  totalSummary: boolean;
  /** The items of `summary.groupItems` in group rows and group footers; an item's `visible` wins. Default `true`. */
  groupSummary: boolean;
  /** The row of totals is a stop of its own in the Tab order after the rows, so the keyboard reaches it. Default `true`. */
  totalSummaryTabStop: boolean;
  /**
   * Who computes the summaries of a data source that loads pages or blocks: `'auto'` the source's
   * adapter when it can (its `summary` capability), `true` the adapter always (it may load every row
   * to do so), `false` the browser, from every matching row. Items of type `custom`, and items of a
   * column with a `value` reader, are always computed in the browser. Default `'auto'`.
   */
  remoteSummary: 'auto' | boolean;
  /** Keys that open and close a group row (`KeyboardEvent.key` values). Default `['Enter', ' ']`. */
  groupToggleKeys: readonly string[];
  /** Right and Left open and close a group row, then go into it and out to the group above. Default `true`. */
  groupArrowKeys: boolean;
  /** Pixels a pressed header or chip moves before it is dragged. Default `5`. */
  dragThreshold: number;
  /** Rows of room the body keeps while it has no rows to show (empty, loading, failed), so the message shows in a grid without a height. Default `3`. */
  emptyRows: number;
  /** A dragged header or chip shows its title next to the pointer, marked with what a drop would do. Default `true`. */
  dragGhost: boolean;
  /** Milliseconds the pointer rests on a cell before its tooltip shows (keyboard focus shows it at once). Default `500`. */
  tooltipDelay: number;
  /** Rows drawn above and below the visible ones, so a quick scroll shows no gap. More costs more per scroll. Default `4`. */
  extraRows: number;
  /**
   * Infinite mode (`mode: 'infinite'`): rows left below the view when the next part starts to load;
   * 0 loads it when the last row comes into view. Default `0`.
   */
  loadMoreDistance: number;
  /**
   * The rows next to the ones in view load before they are needed, so scrolling seldom waits: in
   * virtual mode a part (`pageSize` rows) on each side, in infinite mode the next part one part
   * earlier. Default `false`.
   */
  preloadEnabled: boolean;
  /** Infinite mode: a "Loading more rows" mark at the bottom of the rows while a part loads, with Retry when it fails. Default `true`. */
  loadMoreIndicator: boolean;
  /**
   * `'virtual'`: only the scrolling columns in view (and `extraColumns` on each side) get cells, in
   * every row, the header and the filter, group and summary rows; pinned columns, the active column
   * and the columns that set `columnRenderingMode: 'standard'` always do. `'standard'`: every
   * column gets its cells. A column's own value wins. Default `'standard'`.
   */
  columnRenderingMode: 'standard' | 'virtual';
  /** Columns drawn beyond the ones in view on each side while columns are virtual, so a quick sideways scroll shows no gap. Default `2`. */
  extraColumns: number;
  /**
   * While columns are virtual: milliseconds that drawing the columns coming into view may take
   * before the next ones are drawn only once the sideways scrolling stops (`renderAsync: 'auto'`).
   * Default `300`.
   */
  columnRenderingThreshold: number;
  /**
   * While columns are virtual, the columns coming into view are drawn: as the rows scroll sideways
   * (`false`), once the scrolling stops (`true`), or `'auto'`: once it stops while drawing them takes
   * longer than `columnRenderingThreshold`. Default `'auto'`.
   */
  renderAsync: boolean | 'auto';
  /** Milliseconds without sideways scrolling before the columns that waited are drawn (`renderAsync`). Default `300`. */
  columnRenderingDelay: number;
  /** Width of a column that gives none, in pixels. Default `140`. */
  columnWidth: number;
  /** Smallest width the user can resize a column to, for columns that give no `minWidth`. Default `48`. */
  columnMinWidth: number;
  /** Width of the row status column, in pixels. Default `28`. */
  rowStatusWidth: number;
  /** Width of the selection column (multiple selection), in pixels. Default `36`. */
  selectionColumnWidth: number;
  /** Pixels one arrow key resizes a column by ("Width" in the column menu). Default `10`. */
  resizeStep: number;
  /** Pixels one arrow key resizes a column by while Shift is held. Default `1`. */
  resizeFineStep: number;
  /** Page buttons shown on each side of the current page in the pager (and near its ends). Default `1`. */
  pagerNeighbors: number;
  /** The pager's first, previous, next and last buttons. Default `true`. */
  pagerNavigation: boolean;
  /** "Page 3 of 12 (250 items)" in the pager. Default `true`. */
  pagerInfo: boolean;
  /**
   * The pager's text: `{0}` (or `{page}`) is the page, `{1}` (`{count}`) the page count, `{2}`
   * (`{total}`) the rows. Default: the `gridPageOf` text of `uiLocale`.
   */
  pagerInfoText: string;
  /** The accessible name of the pager. Default: the `gridPager` text of `uiLocale` and the grid's name. */
  pagerLabel: string;
  /**
   * `'full'`: page buttons, and the page sizes as buttons; `'compact'`: a box for the page number and
   * a drop-down of the page sizes, without the text; `'adaptive'`: full while it fits in the grid's
   * width, else compact. Default `'adaptive'`.
   */
  pagerDisplayMode: 'adaptive' | 'compact' | 'full';
  /** The page sizes in the pager, to change how many rows a page shows. Default `false`. */
  pageSizeSelector: boolean;
  /**
   * The page sizes it offers: numbers, and `'all'` for one page with every row; `'auto'` is half,
   * once and twice the page size. Default `'auto'`.
   */
  allowedPageSizes: readonly (number | 'all')[] | 'auto';
  /** In paged mode PageUp and PageDown go to the previous and next page, or move a screen of rows (`'rows'`). Default `'page'`. */
  pageKeys: 'page' | 'rows';
  /** Values the header filter loads per request while its list scrolls. Default `100`. */
  headerFilterPageSize: number;
  /** Height of the header filter's list, in rows. Default `8`. */
  headerFilterRows: number;
  /**
   * The deepest part of the year → month → day … tree the header filter lists a date column by;
   * `null` lists the dates one by one. A column's `headerFilterInterval` wins. Default `'day'`.
   */
  headerFilterDateInterval: GridDateInterval | null;
  /** Rows an export asks a server for per request; `exportCsv({ pageSize })` wins. Default `1000`. */
  exportPageSize: number;
  /** Pasted texts read as "yes" in a yes/no column, besides the `yes` text of `uiLocale` (any case). Default `['true', '1', 'x', '✓', '✔']`. */
  trueTexts: readonly string[];
  /** Pasted texts read as "no" in a yes/no column, besides the `no` text of `uiLocale` (any case). Default `['false', '0', '']`. */
  falseTexts: readonly string[];
  /** Keys that open the active cell's editor with its value (`KeyboardEvent.key` values). Default `['Enter', 'F2']`. */
  editKeys: readonly string[];
  /** Keys that empty the active cell without opening its editor. Default `['Delete']`. */
  clearKeys: readonly string[];
  /** Typing a character on a cell opens its editor with that character. Default `true`. */
  editOnKeyPress: boolean;
  /** What opens a cell's editor with the pointer: a double-click, or one click on the cell. Default `'dblClick'`. */
  startEditAction: 'click' | 'dblClick';
  /**
   * How a row is edited and when it is handed to saving: `'row'` in the cells, on leaving the row;
   * `'cell'` in the cells, on leaving each cell (a new row on leaving it); `'batch'` in the cells,
   * kept until `saveChanges()` (the same as `saveMode: 'batch'`); `'form'` in a form that takes the
   * row's place, on its Save; `'popup'` in that form in a modal window, on its Save. How a row
   * handed over is sent is `saveMode`'s: waiting, in the background or kept for `saveChanges()`.
   * Default `'row'`.
   */
  editMode: 'row' | 'cell' | 'batch' | 'form' | 'popup';
  /** Deleting a row asks first (not in batch mode, where a deletion is only marked). Default `true`. */
  confirmDelete: boolean;
  /** The text of a cell is selected when its editor opens; off, the caret goes to its end. Default `true`. */
  selectTextOnEditStart: boolean;
  /**
   * Columns hide while the grid is narrower than they are, the last one first (with `hidingPriority`
   * on some columns: only those, the lowest first), and a "…" column opens a row's adaptive detail
   * with their values. Pinned and grouped columns never hide. Default `false`.
   */
  columnHidingEnabled: boolean;
  /** Where a band's caption sits over its columns; a band's `align` wins. Default `'center'`. */
  bandAlign: 'start' | 'center' | 'end';
}
