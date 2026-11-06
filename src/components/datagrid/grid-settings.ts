import type { ColumnFeatures } from './column-features';
import type { ColumnResizeMode } from './column-resize-mode';
import type { GridActionLocation } from './grid-action-location';
import type { GridCellExtendKeys } from './grid-cell-extend-keys';
import type { GridCellSummaryItem } from './grid-cell-summary-item';
import type { GridRowExtendKeys } from './grid-row-extend-keys';
import type { GridDateInterval } from './grid-date-interval';

/**
 * Every grid feature that can be enabled or disabled. Set them through the `settings` prop, each as a
 * value or a function. `grid.settings` holds all of them and is live, so assigning a field takes effect
 * immediately.
 */
export interface GridSettings extends ColumnFeatures {
  /**
   * The result of dragging a column edge: `'widget'` resizes that column and shifts the following ones,
   * and `'nextColumn'` moves only the edge between it and the next column, which takes up the
   * difference. A column can set its own value. The default is `'widget'`.
   */
  resizeMode: ColumnResizeMode;
  /** Shift+click (Shift+Enter) on a header adds the column to the sort. The default is `true`. */
  multiSort: boolean;
  /** Allows the user to add rows (the "New row" button and the Tab chain). `addRow()` always works. The default is `false`. */
  addRows: boolean;
  /** Shows the "New row" button in the toolbar while `addRows` is on. The default is `true`. */
  newRowButton: boolean;
  /** Tab on the last editable cell of a new row saves it and opens the next new row. The default is `true`. */
  tabChain: boolean;
  /** Enter in an open editor keeps the value and either stays, moves down, or continues like Tab. The default is `'none'`. */
  enterMoves: 'none' | 'down' | 'next';
  /** The narrow column at the start that marks new, changed, removed, saving and failed rows. The default is `true`. */
  rowStatus: boolean;
  /**
   * "Save changes" and "Discard" in the toolbar in batch mode, disabled when there is nothing to save.
   * The default is `true`.
   */
  saveButtons: boolean;
  /** "N rows with errors" and "Next error" in the bottom bar. The default is `true`. */
  errorSummary: boolean;
  /** Header buttons appear on hover and focus (always on touch screens), or always. The default is `'hover'`. */
  headerButtons: 'hover' | 'always';
  /** The column list (show/hide) in the column menu and behind the toolbar's column button. The default is `true`. */
  columnChooser: boolean;
  /** A button in the toolbar that opens the column list (while `columnChooser` is on). The default is `false`. */
  columnChooserButton: boolean;
  /** "Reset layout" in the column menu. The default is `true`. */
  layoutReset: boolean;
  /** Full text of a clipped cell, or its message, on hover and on keyboard focus. The default is `true`. */
  tooltips: boolean;
  /** Alternate row background. The default is `false`. */
  striped: boolean;
  /** Row count in the bottom bar. The default is `true`. */
  rowCount: boolean;
  /**
   * The pager in paged mode. `'auto'` shows it only while there is more than one page. Disable it to
   * page from custom controls (`grid.page`). The default is `true`.
   */
  pager: boolean | 'auto';
  /** The actions column, while the `actions` prop provides actions. The default is `true`. */
  actionsColumn: boolean;
  /** The position of the actions column. The default is `'end'`. */
  actionsPosition: 'start' | 'end';
  /**
   * Keeps the actions column at its edge while the rows scroll horizontally. `false` scrolls it with
   * them. The default is `true`.
   */
  actionsSticky: boolean;
  /** The width of the actions column in pixels. Actions that do not fit go into its "more" menu. The default is `140`. */
  actionsWidth: number;
  /**
   * Where actions appear: in each row, in the toolbar (the `rowActions` item) or in the bottom bar, for
   * the rows they act on (`actionsTarget`). An action's `location` takes precedence. The default is
   * `'row'`.
   */
  actionsLocation: GridActionLocation;
  /**
   * The rows the toolbar and the bottom bar act on: the selected rows, the active row, or `'auto'`:
   * the selected rows while selection is on, otherwise the active row. The default is `'auto'`.
   */
  actionsTarget: 'selection' | 'focused' | 'auto';
  /**
   * How actions appear: `'auto'` shows the buttons that fit and a "more" menu for the rest, and `'menu'`
   * shows only the "more" button, with every action in its menu (in the bars, one "Actions" menu
   * button). The column is then as wide as that button, unless an action is always a button
   * (`menu: 'never'`), which uses `actionsWidth`. An action's `menu` takes precedence. The context menu
   * always lists them all. The default is `'auto'`.
   */
  actionsDisplay: 'auto' | 'menu';
  /**
   * On several rows, an action is available while it is enabled for all of them, or for any (it runs on
   * those). The default is `'all'`.
   */
  actionsMultipleEnabled: 'all' | 'any';
  /** The count of rows after an action's text when it acts on several ("Approve (3)"). The default is `true`. */
  actionsShowCount: boolean;
  /** When an action runs on several rows one by one, a failed row stops the rest. The default is `false`. */
  actionsStopOnError: boolean;
  /** Shows a panel over the rows with the progress while an action runs on several rows. The default is `true`. */
  actionsProgress: boolean;
  /** A "Stop" button in that panel. The default is `true`. */
  actionsStopButton: boolean;
  /** A row's actions in its context menu (right click, Shift+F10), wherever they show. The default is `true`. */
  actionsContextMenu: boolean;
  /** No selection, one row, or any number of rows. The default is `'none'`. */
  selection: 'none' | 'single' | 'multiple';
  /** The check box column in front of the rows (multiple selection). The default is `true`. */
  selectionColumn: boolean;
  /** The check box in its header and Ctrl+A select every row of the filter (multiple selection). The default is `true`. */
  selectAll: boolean;
  /** "N selected" in the bottom bar. The default is `true`. */
  selectedCount: boolean;
  /**
   * In multiple selection, pressing the pointer on a row and dragging over others selects those rows as
   * it moves (Ctrl/⌘ adds them to the selection, and Shift extends from the anchor). Dragging over the
   * check boxes applies the first row's new state to those rows. The default is `true`.
   */
  rowDragSelection: boolean;
  /**
   * Rectangles of cells, as in a spreadsheet: `'single'` allows one range at a time, and `'multiple'`
   * allows more with Ctrl/⌘. Dragging from a cell draws a range, and Shift+click and Shift with the
   * arrows extend it. Ctrl+C copies it, Ctrl+V fills it and Delete clears it. While enabled, clicks on
   * the cells draw ranges and rows are selected from the check box column. The default is `'none'`.
   */
  cellSelection: 'none' | 'single' | 'multiple';
  /** Ranges are drawn by dragging over the cells. Otherwise, only Shift+click and the keys draw them. The default is `true`. */
  cellDragSelection: boolean;
  /**
   * The distance in pixels the pointer moves before a drag selection starts. A shorter move is a click.
   * The default is `5`.
   */
  dragSelectionThreshold: number;
  /**
   * While rows or cells are selected by dragging, the rows scroll vertically and horizontally when the
   * pointer is near or past an edge. The default is `true`.
   */
  dragSelectionAutoScroll: boolean;
  /** The pixels per frame those rows scroll at the edge and past it, and fewer on the approach. The default is `30`. */
  dragSelectionScrollSpeed: number;
  /** The distance from an edge, in pixels, at which scrolling starts. The default is `60`. */
  dragSelectionScrollSensitivity: number;
  /**
   * On a touch screen, a drag scrolls the rows (`'scroll'`), or a long press starts a drag selection
   * (`'longPress'`). The default is `'scroll'`.
   */
  dragSelectionTouch: 'scroll' | 'longPress';
  /**
   * The delay in milliseconds before a resting finger starts a drag selection
   * (`dragSelectionTouch: 'longPress'`). The default is `500`.
   */
  dragSelectionLongPress: number;
  /** A drag selection may start on a cell the user can edit (a click on it still edits it). The default is `true`. */
  dragSelectionOnEditableCells: boolean;
  /**
   * Keys that select every cell (with `cellSelection`): the rows the user can reach, in every selectable
   * column. The default is `['Mod+A']`.
   */
  selectAllCellsKeys: readonly string[];
  /** Keys that clear the cell ranges. The default is `['Escape']`. */
  clearCellSelectionKeys: readonly string[];
  /**
   * Keys that extend the last cell range from its far corner (or start one from the active cell), with
   * focus moving along. By default, Shift with the arrows, PageUp / PageDown and Home / End, `Mod+Shift`
   * with the arrows to the edges, and `Mod+Shift` with Home / End to the first and last cell.
   */
  extendCellsKeys: GridCellExtendKeys;
  /**
   * In multiple selection, the keys that select or deselect the active row. The default is
   * `['Shift+Space']`. Space alone works on the check box column and on cells that cannot be edited.
   */
  toggleRowSelectionKeys: readonly string[];
  /**
   * In multiple selection, the keys that move the active row and extend the selection from the anchor.
   * By default, Shift with Up / Down and PageUp / PageDown.
   */
  extendRowSelectionKeys: GridRowExtendKeys;
  /**
   * The count, sum and average of the selected cells in the bottom bar, while more than one cell is
   * selected. The default is `true`.
   */
  cellSummary: boolean;
  /** What that summary shows, in order. The default is `['average', 'count', 'sum']`. */
  cellSummaryItems: readonly GridCellSummaryItem[];
  /** The delay in milliseconds from the last key typed in the filter row to the filter. The default is `300`. */
  filterDelay: number;
  /**
   * What Ctrl+C copies: the displayed text of the cells, or their values (numbers and dates in a neutral
   * form). The default is `'shown'`.
   */
  copyValues: 'shown' | 'raw';
  /** Copied rows start with a line of column titles. The default is `false`. */
  copyHeaders: boolean;
  /**
   * Ctrl+V writes tab-separated text into the editable cells from the active cell, to the right and
   * down. The default is `true`.
   */
  paste: boolean;
  /** Pasted lines past the last row open new rows (while `addRows` is on). The default is `false`. */
  pasteNewRows: boolean;
  /**
   * An "Export" button in the toolbar, using the formats of `export` (CSV by default), as a menu when it
   * offers more than one. The default is `false`.
   */
  exportButton: boolean;
  /**
   * With `layoutKey`, the layout, the filters and the search text are saved in the browser's storage and
   * restored. The default is `true`.
   */
  saveLayout: boolean;
  /** A search box in the toolbar that searches every searchable column at once. The default is `false`. */
  searchPanel: boolean;
  /** The width of the search box, in pixels or as a CSS length. The default is `160`. */
  searchPanelWidth: number | string;
  /** The search box's placeholder. The default is the `gridSearchPlaceholder` text of `uiLocale`. */
  searchPlaceholder: string;
  /** The delay in milliseconds from the last key typed in the search box to the search. The default is `700`. */
  searchDelay: number;
  /** Highlights matches in the cells. The default is `true`. */
  highlightSearchText: boolean;
  /** Limits highlighting to text in the same case (the search itself is case-insensitive). The default is `false`. */
  highlightCaseSensitive: boolean;
  /** Searches only the visible columns. The default is `false`, which includes hidden columns. */
  searchVisibleColumnsOnly: boolean;
  /**
   * The filter panel below the rows: a check box that enables or disables the filter value, its text
   * (which opens the filter builder) or "Create Filter", and "Clear". The default is `false`.
   */
  filterPanel: boolean;
  /**
   * Makes the filter row and the header filters part of the filter value, in both directions: the
   * builder's conditions appear in them where they can be displayed, and theirs appear in the panel and
   * the builder. `'auto'` applies while the filter panel is visible. The default is `'auto'`.
   */
  filterSyncEnabled: boolean | 'auto';
  /**
   * The group panel at the start of the toolbar, with a chip per grouped column and a drop area for
   * grouping by headers. The default is `false`.
   */
  groupPanel: boolean;
  /**
   * Allows headers to be dragged to the group panel, and chips back to the headers or along the panel.
   * Otherwise, the panel only displays the grouping. The default is `true`.
   */
  groupPanelDragging: boolean;
  /** The text of the empty group panel. The default is the `gridGroupPanelEmpty` text of `uiLocale`. */
  groupPanelEmptyText: string;
  /** Groups start expanded. A column's `autoExpandGroup` applies to its level. The default is `true`. */
  autoExpandAll: boolean;
  /**
   * A group expands from its arrow and the keyboard, or from a click anywhere on its row. A column can
   * set its own value. The default is `'button'`.
   */
  groupExpandMode: 'button' | 'rowClick';
  /**
   * What groups the rows of a data source: `'auto'` uses its adapter when it supports grouping and the
   * source loads by blocks (otherwise the browser), `true` uses the adapter whenever the source loads by
   * blocks and every level has a field to group by, and `false` always uses the browser, from every
   * matching row. The default is `'auto'`.
   */
  remoteGrouping: 'auto' | boolean;
  /**
   * For grouping or summaries in the browser over a source that loads pages or blocks, the rows per
   * request while every matching row loads. 0 means one request. The default is `0`.
   */
  groupLoadPageSize: number;
  /**
   * The row below the rows with the items of `summary.totalItems`. An item's `visible` takes precedence.
   * The default is `true`.
   */
  totalSummary: boolean;
  /**
   * The items of `summary.groupItems` in group rows and group footers. An item's `visible` takes
   * precedence. The default is `true`.
   */
  groupSummary: boolean;
  /** Makes the totals row a separate Tab stop after the rows, so that the keyboard reaches it. The default is `true`. */
  totalSummaryTabStop: boolean;
  /**
   * What calculates the summaries of a source that loads pages or blocks: `'auto'` uses its adapter
   * when it has the `summary` capability, `true` always uses the adapter (which may load every row), and
   * `false` uses the browser, from every matching row. Items of type `custom`, and items of a column
   * with a `value` reader, are always calculated in the browser. The default is `'auto'`.
   */
  remoteSummary: 'auto' | boolean;
  /** Keys that expand and collapse a group row (`KeyboardEvent.key` values). The default is `['Enter', ' ']`. */
  groupToggleKeys: readonly string[];
  /** Right and Left expand and collapse a group row, then move into it and out to the group above. The default is `true`. */
  groupArrowKeys: boolean;
  /** The distance in pixels a pressed header or chip moves before it is dragged. The default is `5`. */
  dragThreshold: number;
  /**
   * The number of rows of space the body keeps while it has no rows to show (empty, loading or failed),
   * so that the message appears in a grid without a height. The default is `3`.
   */
  emptyRows: number;
  /** A dragged header or chip shows its title next to the pointer, marked with what a drop would do. The default is `true`. */
  dragGhost: boolean;
  /**
   * The delay in milliseconds before a cell's tooltip appears under the pointer (keyboard focus shows it
   * immediately). The default is `500`.
   */
  tooltipDelay: number;
  /**
   * The rows rendered above and below the visible ones, so that a quick scroll shows no gap. More rows
   * cost more per scroll. The default is `4`.
   */
  extraRows: number;
  /**
   * In infinite mode (`mode: 'infinite'`), the rows left below the view when the next page starts to
   * load. 0 loads it when the last row comes into view. The default is `0`.
   */
  loadMoreDistance: number;
  /**
   * Loads the rows next to those in view before they are needed, so that scrolling rarely waits. In
   * virtual mode, loads a page (`pageSize` rows) on each side, and in infinite mode, loads the next page
   * one page earlier. The default is `false`.
   */
  preloadEnabled: boolean;
  /**
   * In infinite mode, a "Loading more rows" indicator at the bottom of the rows while a page loads, with
   * Retry when it fails. The default is `true`.
   */
  loadMoreIndicator: boolean;
  /**
   * With `'virtual'`, only the scrolling columns in view (and `extraColumns` on each side) have cells, in
   * every row, the header and the filter, group and summary rows. Pinned columns, the active column and
   * the columns that set `columnRenderingMode: 'standard'` always have them. With `'standard'`, every
   * column has its cells. A column's own value takes precedence. The default is `'standard'`.
   */
  columnRenderingMode: 'standard' | 'virtual';
  /**
   * The columns rendered beyond those in view on each side while columns are virtual, so that a quick
   * horizontal scroll shows no gap. The default is `2`.
   */
  extraColumns: number;
  /**
   * While columns are virtual, the time in milliseconds that rendering the columns coming into view can
   * take before the next ones are rendered only once horizontal scrolling stops (`renderAsync: 'auto'`).
   * The default is `300`.
   */
  columnRenderingThreshold: number;
  /**
   * While columns are virtual, when the columns coming into view are rendered: during horizontal
   * scrolling (`false`), once scrolling stops (`true`), or once it stops when rendering them takes longer
   * than `columnRenderingThreshold` (`'auto'`). The default is `'auto'`.
   */
  renderAsync: boolean | 'auto';
  /**
   * The idle time in milliseconds after horizontal scrolling before the waiting columns are rendered
   * (`renderAsync`). The default is `300`.
   */
  columnRenderingDelay: number;
  /** The width of a column that does not set one, in pixels. The default is `140`. */
  columnWidth: number;
  /** The minimum width the user can resize a column to, for columns without a `minWidth`. The default is `48`. */
  columnMinWidth: number;
  /** The width of the row status column, in pixels. The default is `28`. */
  rowStatusWidth: number;
  /** The width of the selection column (multiple selection), in pixels. The default is `36`. */
  selectionColumnWidth: number;
  /** The number of pixels one arrow key resizes a column ("Width" in the column menu). The default is `10`. */
  resizeStep: number;
  /** The number of pixels one arrow key resizes a column while Shift is held. The default is `1`. */
  resizeFineStep: number;
  /** The page buttons shown on each side of the current page in the pager, and near its ends. The default is `1`. */
  pagerNeighbors: number;
  /** The pager's first, previous, next and last buttons. The default is `true`. */
  pagerNavigation: boolean;
  /** "Page 3 of 12 (250 items)" in the pager. The default is `true`. */
  pagerInfo: boolean;
  /**
   * The pager's text: `{0}` (or `{page}`) is the page, `{1}` (`{count}`) is the page count, and `{2}`
   * (`{total}`) is the rows. The default is the `gridPageOf` text of `uiLocale`.
   */
  pagerInfoText: string;
  /** The accessible name of the pager. The default is the `gridPager` text of `uiLocale` and the grid's name. */
  pagerLabel: string;
  /**
   * `'full'` shows page buttons and page sizes as buttons, `'compact'` shows a page number box and a
   * drop-down of page sizes, without the text, and `'adaptive'` uses `'full'` while it fits in the
   * grid's width, otherwise `'compact'`. The default is `'adaptive'`.
   */
  pagerDisplayMode: 'adaptive' | 'compact' | 'full';
  /** The page sizes in the pager, which change how many rows a page shows. The default is `false`. */
  pageSizeSelector: boolean;
  /**
   * The page sizes it offers: numbers, and `'all'` for one page with every row. `'auto'` is half, once
   * and twice the page size. The default is `'auto'`.
   */
  allowedPageSizes: readonly (number | 'all')[] | 'auto';
  /**
   * In paged mode, PageUp and PageDown move to the previous and next page, or move a screen of rows
   * (`'rows'`). The default is `'page'`.
   */
  pageKeys: 'page' | 'rows';
  /** The values the header filter loads per request while its list scrolls. The default is `100`. */
  headerFilterPageSize: number;
  /** The height of the header filter's list, in rows. The default is `8`. */
  headerFilterRows: number;
  /**
   * The deepest level of the year → month → day … tree in a date column's header filter. `null` lists
   * every date. A column's `headerFilterInterval` takes precedence. The default is `'day'`.
   */
  headerFilterDateInterval: GridDateInterval | null;
  /**
   * The rows an export requests from a server per request. `exportCsv({ pageSize })` takes precedence.
   * The default is `1000`.
   */
  exportPageSize: number;
  /**
   * Pasted text read as "yes" in a yes/no column, in addition to the `yes` text of `uiLocale` (any case).
   * The default is `['true', '1', 'x', '✓', '✔']`.
   */
  trueTexts: readonly string[];
  /**
   * Pasted text read as "no" in a yes/no column, in addition to the `no` text of `uiLocale` (any case).
   * The default is `['false', '0', '']`.
   */
  falseTexts: readonly string[];
  /** Keys that open the active cell's editor with its value (`KeyboardEvent.key` values). The default is `['Enter', 'F2']`. */
  editKeys: readonly string[];
  /** Keys that clear the active cell without opening its editor. The default is `['Delete']`. */
  clearKeys: readonly string[];
  /** Typing a character on a cell opens its editor with that character. The default is `true`. */
  editOnKeyPress: boolean;
  /** What opens a cell's editor with the pointer: a double-click, or one click on the cell. The default is `'dblClick'`. */
  startEditAction: 'click' | 'dblClick';
  /**
   * How a row is edited and when it is saved. `'row'` edits in the cells and saves on leaving the row.
   * `'cell'` edits in the cells and saves on leaving each cell (a new row, on leaving it). `'batch'` edits
   * in the cells and keeps the changes until `saveChanges()` (the same as `saveMode: 'batch'`). `'form'`
   * edits in a form that replaces the row, and saves on its Save. `'popup'` uses that form in a modal
   * window. `saveMode` determines how the row is then sent: waiting, in the background or kept for
   * `saveChanges()`. The default is `'row'`.
   */
  editMode: 'row' | 'cell' | 'batch' | 'form' | 'popup';
  /** Prompts before a row is deleted, except in batch mode, where a deletion is only marked. The default is `true`. */
  confirmDelete: boolean;
  /** Selects a cell's text when its editor opens. Otherwise, the caret moves to its end. The default is `true`. */
  selectTextOnEditStart: boolean;
  /**
   * Columns hide while the grid is narrower than they are, the last one first (with `hidingPriority` on
   * some columns, only those, the lowest first), and a "…" column opens a row's adaptive detail with
   * their values. Pinned and grouped columns never hide. The default is `false`.
   */
  columnHidingEnabled: boolean;
  /** Where a band's caption appears over its columns. A band's `align` takes precedence. The default is `'center'`. */
  bandAlign: 'start' | 'center' | 'end';
}
