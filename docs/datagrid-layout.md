# DataGrid: Layout and events

> DataGrid · @motifx-community/ui 0.1.0-beta.1

## Toolbar

The bar above the rows holds the grid's own items whose features are on, at the end, in this order: “New row” (`addRows`, `newRowButton`), “Save changes” and “Discard” (batch mode, `saveButtons`), “Export” (`exportButton`), the column list (`columnChooserButton`) and the search box (`searchPanel`); with none of them it does not show. `toolbar.items` lists exactly what it holds: the grid's items by name, an object with a `name` to change one of them, and items of your own — a button with `text`, `icon`, `hint` and `click`, or any component with `content` — at the start (`location: 'before'`) or at the end. Buttons that do not fit go into its “more” menu (`overflow`); the grid's own show only their icons there (`showText`), and their texts in the menu.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

| Item field | What it does |
| --- | --- |
| `name` | One of the grid’s items (`groupPanel`, `rowActions`, `searchPanel`, `addRowButton`, `saveButton`, `revertButton`, `exportButton`, `columnChooserButton`) to change, or a name of your own. A grid item whose feature is off stays out. |
| `location` | `'before'` or `'after'` (default; the group panel and `rowActions` `'before'`): which end of the bar. |
| `text, icon, hint` | The button’s text, icon and tooltip (default: the text when only the icon shows). |
| `showText` | `'always'` (default) or `'inMenu'`: only the icon in the bar, the text in the “more” menu (the grid’s own buttons). |
| `visible, enabled` | Leave the item out; dim it. |
| `overflow` | `'never'` (default; the grid’s buttons `'auto'`), `'auto'` or `'always'`: whether it may go into the “more” menu. |
| `content` | `() => component`: your own component in place of a button, made once. |
| `click` | `(e) => void` with `{ item, grid, event }`; on a grid item it replaces what the item does. |

## Columns at run time

`addColumn(column, index?)` adds a column at a place among the data columns, with its own width, visibility and sticky side (or what the kept layout says of it); `deleteColumn(field)` takes one out, and its sort, grouping and filter go with it. `columnOption(field, name, value)` changes one option of a column while it shows — its layout (`width`, `visible`, `sticky`, `visibleIndex`), sort, grouping, header filter values, a feature switch, or any field of its definition (`title`, `format`, `lookup`, `cell`, `type` …), the column drawn again with it — and `columnOption(field, { … })` several at once. The layout, `layoutKey` and `onLayoutChange` follow; `onOptionChanged` tells each change (`name: 'columns'` for a column added or taken out). `columnCount()` and `getVisibleColumns()` read them.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

## Keeping the layout

With `layoutKey` the grid keeps the column widths, order, hidden and pinned columns, the sort, the filters and the search text in the browser's `localStorage`, and a grid made again with the same name — after a reload too — gets them back. Storage that is full or blocked is skipped quietly. `resetLayout()` (also in the column menu) goes back to the column definitions. To keep the layout elsewhere, a server for instance, read `layout` and `filters`, listen to `onLayoutChange`, and give them back through the props of the same names.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

## Turning features off

Every feature has a switch in `settings`, each a value or a function; a column can turn one on or off for itself, and its value wins. `grid.settings` and `grid.columnSettings(field)` change them while the grid shows.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

| Setting | Default | What it does |
| --- | --- | --- |
| `editable` | `false` | Edit cells in place. A column can decide itself, also per row with `(row) => boolean`. |
| `creatable` | `true` | Fill the cells of new rows. A column with its own `editable` and no `creatable` uses the same; `editable: false, creatable: true` is entered only when the row is created. |
| `addRows, newRowButton, tabChain` | `false`, `true`, `true` | The user adds rows; the toolbar’s “New row” button; Tab on a new row’s last cell opens the next one. |
| `enterMoves` | `'none'` | Enter in an editor keeps the value and stays, goes `down`, or goes on like Tab (`next`). |
| `rowStatus` | `true` | The narrow column that marks new, changed, deleted, saving and failed rows. |
| `saveButtons, errorSummary` | `true` | “Save changes” and “Discard” in the toolbar in batch mode (dimmed while there is nothing to save); “N rows with errors” and “Next error” in the bar under the rows. |
| `sortable, multiSort` | `true` | Sort from the header; Shift adds a column to the sort. |
| `resizable, movable, hideable, pinnable, menu` | `true` | What the user may do with the columns; a column can say otherwise for itself. |
| `resizeMode` | `'widget'` | Dragging a column edge: `widget` changes that column and the columns after it shift; `nextColumn` moves only the edge between it and the next column, which gives or takes the difference. A column can set its own. |
| `headerButtons` | `'hover'` | The menu button shows on hover and focus (always on touch screens), or `always`. |
| `columnChooser, layoutReset` | `true` | The column list and “Reset layout” in the column menu. |
| `columnChooserButton` | `false` | A toolbar button that opens the column list (while `columnChooser` is on). |
| `tooltips, striped, rowCount` | `true`, `false`, `true` | Full text of a clipped cell; stripes; the row count. |
| `pager` | `true` | The pager in paged mode; `auto` only while there is more than one page. |
| `actionsColumn, actionsPosition, actionsSticky, actionsWidth` | `true`, `'end'`, `true`, `140` | The actions column, at the start or the end, pinned to its edge or scrolling with the rows, and its width. |
| `actionsLocation, actionsTarget, actionsDisplay` | `'row'`, `'auto'`, `'auto'` | Where the actions show (the row, the toolbar, the bottom bar), which rows the bars act on, and buttons or a menu only: see [Row actions](datagrid-editing.md#actions). |
| `actionsMultipleEnabled, actionsShowCount, actionsStopOnError` | `'all'`, `true`, `false` | Actions on several rows: enabled for all or any, the count after the text, a failed row stops the rest. |
| `actionsProgress, actionsStopButton, actionsContextMenu` | `true`, `true`, `true` | The progress panel and its Stop button while an action works on several rows; the actions in the row’s context menu. |
| `selection, selectionColumn, selectAll, selectedCount` | `'none'`, `true`, `true`, `true` | `single` or `multiple`; the check box column; the header check box and Ctrl+A; “N selected” in the bar. |
| `filterRow, headerFilter` | `false` | The filter row and the header filter; a column can turn them on or off for itself. |
| `syncLookupFilterValues` | `true` | A lookup column’s filter row and header filter list only the keys of the rows the other filters leave; off, they list the lookup source. A column can say otherwise for itself. |
| `filterDelay` | `300` | Milliseconds from the last key typed in the filter row to the filter. |
| `copyable, exportable` | `true` | Columns that go into what Ctrl+C copies and into an export; a column can say otherwise for itself. |
| `copyValues, copyHeaders` | `'shown'`, `false` | Ctrl+C copies the text the cells show or their `raw` values; copied rows start with the column titles. |
| `paste, pasteNewRows` | `true`, `false` | Ctrl+V writes into the editable cells; pasted lines past the last row open new rows (with `addRows`). |
| `exportButton` | `false` | An “Export” button in the toolbar: the formats of the `export` prop (CSV by default), as a menu when it offers more than one command. |
| `saveLayout` | `true` | With `layoutKey`, the layout, the filters and the search text are kept and come back. |
| `searchPanel` | `false` | The search box in the toolbar. `searchText` and `searchByText()` search without it too. |
| `filterPanel, filterSyncEnabled` | `false`, `'auto'` | The filter panel under the rows, and the filter row and header filters kept in the filter value (`'auto'`: while the panel shows). See [Filter panel and builder](datagrid-filtering.md#filter-panel). |
| `searchPanelWidth, searchPlaceholder` | `160`, `uiLocale` “Search…” | The box’s width (pixels or a CSS length) and its placeholder. |
| `searchDelay` | `700` | Milliseconds from the last key typed in the search box to the search; Enter searches at once. |
| `highlightSearchText, highlightCaseSensitive` | `true`, `false` | Mark what the search found in the cells; mark only text in the same case (the search itself ignores case). |
| `searchVisibleColumnsOnly` | `false` | Search only the visible columns; by default hidden ones too. |
| `searchable` | `true` | The columns the search looks in; a column can say otherwise for itself (one that turns its own filters off is left out). |
| `groupPanel` | `false` | The group panel at the start of the toolbar: a chip per grouped column, and where headers are dropped to group by them. |
| `groupPanelDragging, groupPanelEmptyText` | `true`, `uiLocale` “Drag a column header here…” | Headers drag to the panel and chips back (off: the panel only shows the grouping); what the empty panel says. |
| `groupMenu` | unset | “Group by this column”, “Ungroup” and “Ungroup all” in the column menu. Left unset (grid and column), they show while the panel takes headers, as the keyboard’s way to do the same. |
| `groupable, showWhenGrouped` | `true`, `false` | The columns the user can group by; a grouped column still shows among the columns. A column can say otherwise for itself. |
| `autoExpandAll, allowCollapsing` | `true`, `true` | Groups start open (a column’s `autoExpandGroup` decides for its level); the user can open and close them (code always can; a column can say otherwise). |
| `groupExpandMode` | `'button'` | A group opens from its arrow and the keyboard, or with `rowClick` from a click anywhere on its row. A column can set its own. |
| `groupCount` | `true` | Group rows show their row count; a column can say otherwise for itself. |
| `groupToggleKeys, groupArrowKeys` | `['Enter', ' ']`, `true` | The keys that open and close a group row; Right and Left open, close and go in and out. |
| `remoteGrouping` | `'auto'` | Who groups a data source’s rows: `auto` its adapter when it groups (blocks), `true` the adapter whenever the source loads by blocks, `false` always the browser, from every matching row. |
| `groupLoadPageSize` | `0` | Grouping or summaries in the browser over a source that loads pages or blocks: rows per request while every matching row loads (0: one request). |
| `totalSummary, groupSummary` | `true` | The row of totals with the items of `summary.totalItems`; the items of `summary.groupItems` in group rows and footers. An item’s `visible` wins. |
| `totalSummaryTabStop` | `true` | The row of totals is a Tab stop of its own after the rows. |
| `remoteSummary` | `'auto'` | Who works out the summaries of a source that loads pages or blocks: `auto` its adapter when it has the `summary` capability, `true` the adapter always, `false` the browser, from every matching row. `custom` items and columns with a `value` reader are always worked out in the browser. |
| `dragThreshold` | `5` | Pixels a pressed header or chip moves before it is dragged. |
| `dragGhost` | `true` | A dragged header or chip shows its title next to the pointer, marked with what a drop would do: group, move, ungroup. While a header is dragged the whole toolbar takes drops for the group panel and is marked. |
| `emptyRows` | `3` | Rows of room the body keeps while it has no rows to show (empty, loading, failed), so the message shows in a grid without a height. |
| `columnWidth, columnMinWidth` | `140`, `48` | The width of a column that gives none, and the smallest width the user can resize one to; a column’s `width` and `minWidth` win. |
| `rowStatusWidth, selectionColumnWidth` | `28`, `36` | Widths of the row status column and the check box column. |
| `resizeStep, resizeFineStep` | `10`, `1` | Pixels one arrow key resizes a column by (“Width” in the column menu), and with Shift. |
| `tooltipDelay` | `500` | Milliseconds the pointer rests on a cell before its tooltip shows (keyboard focus shows it at once). |
| `extraRows` | `4` | Rows drawn above and below the visible ones, so a quick scroll shows no gap; more costs more per scroll. |
| `loadMoreDistance, preloadEnabled, loadMoreIndicator` | `0`, `false`, `true` | Infinite mode: rows left below the view when the next part loads; a part loaded ahead (in virtual mode a part on each side); the “Loading more rows…” mark with Retry. See [Infinite scrolling](datagrid-scrolling.md#infinite). |
| `columnRenderingMode, extraColumns` | `'standard'`, `2` | `virtual`: only the scrolling columns in view and `extraColumns` on each side get cells; a column’s own `columnRenderingMode` wins. See [Virtual columns](datagrid-scrolling.md#virtual-columns). |
| `renderAsync, columnRenderingThreshold, columnRenderingDelay` | `'auto'`, `300`, `300` | Virtual columns coming into view are drawn as the rows scroll, once the scrolling stops, or once it stops while drawing them took longer than the threshold (ms); the quiet time before they are drawn (ms). |
| `pagerNeighbors, pagerNavigation, pagerInfo` | `1`, `true`, `true` | Page buttons on each side of the current page; the first, previous, next and last buttons; “Page 3 of 12 (250 items)”. |
| `pagerInfoText, pagerLabel` | `uiLocale` texts | The pager’s text (`{0}` or `{page}`, `{1}` or `{count}`, `{2}` or `{total}`) and its accessible name. |
| `pagerDisplayMode` | `'adaptive'` | `full`: page buttons, and the page sizes as buttons; `compact`: a page number box and a drop-down of the sizes; `adaptive`: full while it fits in the bar. |
| `pageSizeSelector, allowedPageSizes` | `false`, `'auto'` | The page sizes in the pager; the sizes it offers (numbers and `all`; `auto` is half, once and twice the page size). |
| `pageKeys` | `'page'` | In paged mode PageUp and PageDown go to the previous and next page, or move a screen of rows (`rows`). |
| `headerFilterPageSize, headerFilterRows` | `100`, `8` | Values the header filter loads per request; the height of its list (or tree) in rows. |
| `headerFilterDateInterval` | `'day'` | The deepest part of the year → month → day tree a date column’s header filter lists; `null` lists every date. A column’s `headerFilterInterval` wins. |
| `exportPageSize` | `1000` | Rows an export asks a server for per request; `exportCsv({ pageSize })` wins. |
| `trueTexts, falseTexts` | `['true', '1', 'x', '✓', '✔']`, `['false', '0', '']` | Pasted texts read as yes and as no in a yes/no column, besides the `yes` and `no` texts; a column can give its own. |
| `editKeys, clearKeys` | `['Enter', 'F2']`, `['Delete']` | Keys that open the active cell’s editor, and that empty it (`KeyboardEvent.key` values). |
| `editOnKeyPress` | `true` | Typing a character on a cell opens its editor with it. A column can set its own. |
| `startEditAction` | `'dblClick'` | A double-click, or one `click` on the active cell, opens its editor. A column can set its own. |
| `columnHidingEnabled, bandAlign` | `false`, `'center'` | Columns hide while the grid is narrower than they are, and a “…” column opens their values; where band captions sit. See [Bands and adaptive columns](datagrid-bands.md#adaptive). |
| `editMode, confirmDelete, selectTextOnEditStart` | `'row'`, `true`, `true` | How rows are edited: in the cells (`row`, `cell`, `batch`) or in a form (`form`, `popup`); deleting asks first; an editor opens with its text selected. See [Edit forms and popups](datagrid-forms.md#forms). |

## Events

Every action of the user has an event, given as a prop or listened to with `grid.onX((e) => …)`; one that is about to happen (`…ing`) can be stopped with `e.cancel = true`, and most can change what happens (the values sent, the items of a menu, the text copied). Here amounts over 900 are drawn in bold, the rows get a menu of their own (right click, or Shift + F10), a change to “Cancelled” is not saved, and the list tells what happened. Methods do the same from code: `editCell`, `cellValue`, `navigateToRow`, `columnOption`, `state()` and the others in the [API reference](datagrid-api.md#api).

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

| Event | Gets | Cancel | When |
| --- | --- | --- | --- |
| `onCellClick / onCellDblClick` | `{ field, row, rowIndex, rowType, groupKey?, element, event }` | yes | A cell was clicked or double-clicked (also in a group footer, `rowType: 'groupFooter'`, and in the row of totals, `'totalFooter'`); cancel: no selection, no group toggle, no editor. |
| `onRowClick / onRowDblClick` | `{ row, rowIndex, rowType, groupKey?, element, event }` | yes | The same for the row, after its cell’s event. |
| `onCellPrepared` | `{ field, row, rowIndex, value, isNew, element }` |  | A cell was drawn for a row: style it. Cells are reused while scrolling, so set and clear what you change. Costs nothing while nobody listens. |
| `onRowPrepared` | `{ row, rowIndex, rowType, groupKey?, isSelected, element }` |  | A data row, group row, group footer (`groupFooter`) or the row of totals (`totalFooter`) was drawn; the same rule. |
| `onContentReady` | `{ total }` |  | Rows arrived and are laid out (after a load, a filter, a sort, a page, a resize). |
| `onDataErrorOccurred` | `{ error, operation, row? }` |  | A load (`operation: 'load'`) or the save of a row (`'save'`, with `row`) failed. |
| `onEditingStart` | `{ field, row, rowIndex, isNew }` | yes | A cell editor, or a row’s edit form (`field` `''`), is about to open. |
| `onEditorPreparing / onEditorPrepared` | `{ field, row, isNew, options }` / `{ field, row, isNew, editor, element, place }` | yes / — | An editor of a cell or of a form field is about to be made (change its props in `options`); it was made. |
| `onRowValidating` | `{ key, row, isNew, changed, errors, isValid, errorText }` | yes | A row is checked before it is saved, after its cells: add messages to `errors`, or `isValid = false` (or cancel) with `errorText`. |
| `onInitNewRow` | `{ data, values }` | yes | A new row is about to open: `data` is what it starts with, `values` what counts as entered; cancel opens no row. |
| `onSaving / onSaved` | `{ changes }` / `{ changes, saved, failed }` | yes / — | Changes are about to be sent (leaving a row, the background queue, “Save changes”); the answer came. |
| `onRowInserting / onRowInserted` | `{ row, data }` / `{ row, key }` | yes / — | Per new row: change `data` (what is sent) or keep it unsent; it was saved. |
| `onRowUpdating / onRowUpdated` | `{ key, row, changes }` / `{ key, row, changes }` | yes / — | Per changed row: change `changes` or keep them unsent; they were saved. |
| `onRowRemoving / onRowRemoved` | `{ key, row }` | yes / — | Per deleted row, when the deletion is sent (batch: on “Save changes”); it was deleted. |
| `onEditCanceling / onEditCanceled` | `{ rows }` | yes / — | Unsaved changes are about to be dropped: Escape on a row, the “Cancel” action, `discardChanges()`. |
| `onFocusedCellChanging / onFocusedCellChanged` | `{ rowIndex, field, previousRowIndex, previousField, row }` | yes / — | The active cell moves (keys, a click, code); -1 is the header, -2 the filter row. |
| `onFocusedRowChanging / onFocusedRowChanged` | `{ rowIndex, previousRowIndex, row }` / `{ rowIndex, row, key }` | yes / — | The active row changes. |
| `onKeyHandling` | `{ event, rowIndex, field }` | yes | A key went down in the rows, an editor, the filter row or a group chip, before the grid handles it; cancel and handle it yourself. the standard calls it `onKeyDown`, a DOM event name in JSX. |
| `onOptionChanged` | `{ name, field?, value, previous }` |  | A setting was assigned: `grid.settings`, `columnSettings(field)` (with `field`), `toolbar` (`toolbar.visible`, `toolbar.items`), `columnOption` (with `field`); a column was added or taken out (`name: 'columns'`, the fields). |
| `onSortChanging / onSortChanged` | `{ sort, previous, byUser }` | yes / — | The sort is about to change, by the user or from code. |
| `onFilterChanging / onFilterChanged` | `{ filters, previous }` / `{ filters, filter }` | yes / — | The filter row and header filters are about to apply; cancel puts the ones before back in the cells. |
| `onSearchTextChanging / onSearchTextChanged` | `{ text, previous }` / `{ text }` | yes / — | The search text is about to change; cancel keeps the one before in the box. |
| `onPageChanging / onPageChanged` | `{ page, previous }` | yes / — | Another page is about to show. |
| `onPageSizeChanging / onPageSizeChanged` | `{ pageSize, previous }` | yes / — | The rows per page are about to change (0: all); the grid goes back to the first page. |
| `onMoreRowsLoading / onMoreRowsLoaded` | `{ skip, take }` / `{ skip, count, ended }` | yes / — | Infinite mode: the next part of the rows is about to load; it came. |
| `onSelectionChanging / onSelectionChanged` | `{ selection, previous }` / `{ selection }` | yes / — | The selection is about to change, by the user or from code. |
| `onLayoutChanging / onLayoutChange` | `{ layout, previous }` / `layout` | yes / — | The user resized, moved, hid, pinned, sorted or reset; cancel puts the layout before back. |
| `onGroupingChanging / onGroupingChanged, onGroupDropping` | see [Grouping](datagrid-grouping.md#grouping) | yes | The grouping; a dropped header or chip. |
| `onRowExpanding / onRowExpanded, onRowCollapsing / onRowCollapsed` | `{ kind, key, row }` | yes / — | A group (`kind: 'group'`) or a row's details (`kind: 'detail'`) open or close. |
| `onCopying / onPasting` | `{ text, html, rows }` / `{ text, rowIndex, field }` | yes | Ctrl+C, `copy()`; Ctrl+V, `paste()`: change the text, or stop it. |
| `onSummaryChanged` | `{ total, editing }` |  | The summary values were worked out again: new rows, a new filter or search, a save, or (with `recalculateWhileEditing`) an unsaved change. |
| `onExporting / onExported` | `{ format, component, selectedRowsOnly, options }` / `{ format, rows, text? }` | yes / — | An export is about to start (change its options); for a format the grid does not write (`xlsx`) the handler writes it with `exportDataGrid`. It finished (`exportDataGrid` tells it with `format: 'xlsx'`). |
| `onContextMenuPreparing` | `{ target, field, row?, rowIndex, items }` | yes | A header’s column menu (`header`) or a row’s menu (`row`: a right click or the context menu key; `items` hold the row’s actions, and it opens only when it has items) is about to open: change `items`. |
| `onActionRunning / onActionRan` | `{ action, rows, selection, location }` / `{ action, rows, location, done, failed, canceled, errors }` | yes / — | An action is about to run; it ran. See [Row actions](datagrid-editing.md#actions). |
| `onToolbarPreparing` | `{ items }` |  | The toolbar is laid out: change the list of items it takes. |

## Example files

`Toolbar.tsx`

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, type GridToolbarItem, type GridToolbarItemName } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** The toolbar: the grid's own items with items of the page's own, at the start and at the end. */
export default function Toolbar() {
  const s = reactive({ striped: true, exportText: false, refreshed: 0 });
  let grid: DataGrid<Order> | null = null;

  const items: (GridToolbarItem | GridToolbarItemName)[] = [
    { name: 'refresh', text: 'Refresh', hint: () => `Refreshed ${s.refreshed} times`, location: 'before', click: () => (grid?.refresh(), s.refreshed++) },
    { name: 'striped', location: 'before', content: () => <CheckBox label="Striped" x-model={() => s.striped} /> },
    { name: 'exportText', location: 'before', content: () => <CheckBox label="“Export” with its text" x-model={() => s.exportText} /> },
    'addRowButton',
    { name: 'exportButton', showText: () => (s.exportText ? 'always' : 'inMenu') },
    'columnChooserButton',
    'searchPanel',
  ];

  return (
    <DataGrid
      class="dg-toolbar"
      style="block-size: 30rem"
      rows={makeOrders(120)}
      rowKey="id"
      columns={columns}
      label="Orders with a toolbar"
      locale="en"
      newRow={{ create: newOrder }}
      settings={{ editable: true, addRows: true, exportButton: true, columnChooserButton: true, searchPanel: true, striped: () => s.striped }}
      toolbar={{ items }}
      ref={(g: DataGrid<Order>) => (grid = g)}
    />
  );
}
```

`orders.ts`

```tsx
import type { GridColumn } from '@motifx-community/ui';
import type { Order } from './order';

const CUSTOMERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Cahit Arf', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'İlhan Koman', 'Margaret Hamilton'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
const STATUSES = ['Draft', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];
const NOTES = ['', 'Leave at the door', 'Call before delivery', 'Gift wrap, please, with a card that says happy birthday', '', 'Fragile'];

/** `n` made-up orders, the same ones every time. */
export function makeOrders(n: number): Order[] {
  const day = Date.UTC(2026, 0, 1);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
    city: CITIES[(i * 3) % CITIES.length],
    date: new Date(day + ((i * 37) % 300) * 86_400_000).toISOString().slice(0, 10),
    status: STATUSES[i % STATUSES.length],
    paid: i % 3 === 0,
    amount: ((i * 7919) % 100_000) / 100,
    note: NOTES[i % NOTES.length],
  }));
}

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The order columns: the number pinned to the start, the amount to the end. */
export const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80, sticky: 'start', editable: false },
  { field: 'customer', title: 'Customer', width: 180, flex: 1, required: true },
  { field: 'city', title: 'City', type: 'list', width: 120, options: CITIES },
  { field: 'date', title: 'Date', type: 'date', width: 130, editable: false, creatable: true },
  { field: 'status', title: 'Status', type: 'list', width: 120, options: STATUSES, required: true },
  { field: 'paid', title: 'Paid', type: 'boolean', width: 80 },
  { field: 'note', title: 'Note', width: 200 },
  {
    field: 'amount',
    title: 'Amount',
    type: 'number',
    width: 120,
    sticky: 'end',
    required: true,
    validate: (v) => (typeof v === 'number' && v < 0 ? 'The amount cannot be negative.' : null),
    format: (v) => (typeof v === 'number' ? money.format(v) : ''),
  },
];

/** The same columns with a filter cell and a header filter on most of them. */
export const filterColumns: GridColumn<Order>[] = columns.map((c) => ({ ...c, filterRow: c.field !== 'note', headerFilter: c.field !== 'note' && c.field !== 'id' }));

const today = () => new Date().toISOString().slice(0, 10);

/** What a new order starts with. */
export const newOrder = () => ({ date: today(), status: 'Draft', paid: false });
```

`order.ts`

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

`RuntimeColumns.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

/** Columns added, taken out and changed while the grid shows; the layout, the sort and the filters follow. */
export default function RuntimeColumns() {
  const s = reactive({ paid: false, city: true, fields: '' });
  let grid: DataGrid<Order> | null = null;
  const show = () => (s.fields = grid ? `${grid.columnCount()} columns, shown: ${grid.getVisibleColumns().map((c) => c.field).join(', ')}` : '');

  const togglePaid = () => {
    if (!grid) return;
    if (s.paid) grid.deleteColumn('paid');
    else grid.addColumn({ field: 'paid', title: 'Paid', type: 'boolean', width: 80, headerFilter: true }, 2);
    s.paid = !s.paid;
  };
  const toggleCity = () => {
    if (!grid) return;
    if (s.city) grid.deleteColumn('city');
    else grid.addColumn(filterColumns.find((c) => c.field === 'city')!, 2);
    s.city = !s.city;
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (s.paid ? 'Take “Paid” out' : 'Add “Paid” after Customer')} variant="outline" onclick={togglePaid} />
        <Button text={() => (s.city ? 'Take “City” out' : 'Put “City” back')} variant="outline" onclick={toggleCity} />
        <Button text="Amount in euros" variant="outline" onclick={() => grid?.columnOption('amount', { title: 'Amount (€)', format: (v: unknown) => (typeof v === 'number' ? euros.format(v) : '') })} />
        <Button text="Hide or show “Note”" variant="ghost" onclick={() => grid?.columnOption('note', 'visible', !grid.columnOption('note', 'visible'))} />
      </Stack>
      <DataGrid
        class="dg-runtime-columns"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={filterColumns.filter((c) => c.field !== 'paid')}
        label="Orders with columns that change"
        locale="en"
        onOptionChanged={() => show()}
        onContentReady={() => show()}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-runtime-fields">{() => s.fields}</output>
    </>
  );
}
```

`KeepLayout.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** Widths, order, sort and filters kept under `layoutKey`; a grid made again gets them back. */
export default function KeepLayout() {
  const s = reactive({ keep: true, shown: true });
  let grid: DataGrid<Order> | null = null;

  const makeAgain = () => {
    s.shown = false;
    setTimeout(() => (s.shown = true), 0);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Keep the layout" x-model={() => s.keep} />
        <Button text="Make the grid again" variant="outline" onclick={makeAgain} />
        <Button text="Reset the layout" variant="ghost" onclick={() => grid?.resetLayout()} />
      </Stack>
      {s.shown && (
        <DataGrid
          class="dg-layout"
          style="block-size: 28rem"
          rows={makeOrders(40)}
          rowKey="id"
          columns={filterColumns}
          label="Orders that keep their layout"
          locale="en"
          layoutKey="docs-orders"
          settings={{ saveLayout: () => s.keep }}
          ref={(g: DataGrid<Order>) => (grid = g)}
        />
      )}
    </>
  );
}
```

`Switches.tsx`

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Features switched by functions in `settings`, by `grid.settings` and by one column's own settings. */
export default function Switches() {
  const s = reactive({ striped: true, resizable: true, nextColumn: false, movable: true, pinnable: true, menu: true, tooltips: true, rowCount: true });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Striped" x-model={() => s.striped} />
        <CheckBox label="Resizing" x-model={() => s.resizable} />
        <CheckBox label="Resize against the next column" x-model={() => s.nextColumn} />
        <CheckBox label="Moving" x-model={() => s.movable} />
        <CheckBox label="Pinning" x-model={() => s.pinnable} />
        <CheckBox label="Column menu" x-model={() => s.menu} />
        <CheckBox label="Menu button always" onValueChanged={(e) => grid && (grid.settings.headerButtons = e.value ? 'always' : 'hover')} />
        <CheckBox label="Tooltips" x-model={() => s.tooltips} />
        <CheckBox label="Row count" x-model={() => s.rowCount} />
        <CheckBox label="Customer column can resize" value={true} onValueChanged={(e) => grid && (grid.columnSettings('customer').resizable = e.value ? undefined : false)} />
      </Stack>
      <DataGrid
        class="dg-settings"
        style="block-size: 28rem"
        rows={makeOrders(25)}
        rowKey="id"
        label="Switches"
        locale="en"
        columns={[{ ...columns[0], movable: false, menu: false }, ...columns.slice(1)]}
        settings={{
          striped: () => s.striped,
          resizable: () => s.resizable,
          resizeMode: () => (s.nextColumn ? 'nextColumn' : 'widget'),
          movable: () => s.movable,
          pinnable: () => s.pinnable,
          menu: () => s.menu,
          tooltips: () => s.tooltips,
          rowCount: () => s.rowCount,
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
    </>
  );
}
```

`Events.tsx`

```tsx
import { reactive } from '@motifx/core';
import { DataGrid } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The grid's events: amounts over 900 in bold, a row menu of the page's own, no "Cancelled" saved, and a log of what happened. */
export default function Events() {
  const s = reactive({ log: [] as { id: number; text: string }[] });
  let next = 0;
  const log = (text: string) => {
    s.log.unshift({ id: ++next, text });
    if (s.log.length > 5) s.log.pop();
  };

  return (
    <>
      <DataGrid
        class="dg-events"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={columns}
        label="Orders with events"
        locale="en"
        settings={{ editable: true }}
        onCellPrepared={(e) => {
          // The cell is reused for other rows: set and clear.
          if (e.field === 'amount') e.element.style.fontWeight = (e.value as number) > 900 ? 'bold' : '';
        }}
        onContextMenuPreparing={(e) => {
          if (e.target === 'row' && e.row) e.items.push({ text: `Log order ${e.row.id}`, click: () => log(`Order ${e.row!.id} from the row menu`) });
        }}
        onRowUpdating={(e) => {
          if (e.changes.status === 'Cancelled') {
            e.cancel = true;
            log(`Order ${e.key}: cancelling is not saved here`);
          }
        }}
        onRowUpdated={(e) => log(`Order ${e.key} saved: ${Object.keys(e.changes).join(', ')}`)}
        onFocusedRowChanged={(e) => e.key !== undefined && log(`Row ${e.key}`)}
        onSortChanged={(e) => log(`Sorted: ${e.sort.map((x) => `${x.field} ${x.dir}`).join(', ') || 'none'}`)}
      />
      <ol class="dg-events-log" aria-label="What happened" aria-live="polite">
        {s.log.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ol>
    </>
  );
}
```
