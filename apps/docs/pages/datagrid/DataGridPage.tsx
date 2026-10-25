import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import BatchSave from './examples/BatchSave';
import Cascade from './examples/Cascade';
import Clipboard from './examples/Clipboard';
import Export from './examples/Export';
import Filters from './examples/Filters';
import FromCode from './examples/FromCode';
import Grouping from './examples/Grouping';
import GroupingServer from './examples/GroupingServer';
import KeepLayout from './examples/KeepLayout';
import Localization from './examples/Localization';
import Lookups from './examples/Lookups';
import NewRows from './examples/NewRows';
import Pages from './examples/Pages';
import RowActions from './examples/RowActions';
import SaveModes from './examples/SaveModes';
import Search from './examples/Search';
import Selection from './examples/Selection';
import Summaries from './examples/Summaries';
import SummariesServer from './examples/SummariesServer';
import Switches from './examples/Switches';
import TextFrom from './examples/TextFrom';
import Events from './examples/Events';
import Toolbar from './examples/Toolbar';
import Virtual from './examples/Virtual';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

/** An example's file, then the order data it uses. */
const withOrders = (name: string, ...more: string[]) => code(name, ...more, 'orders.ts', 'order.ts');

const PROPS = [
  ['columns', '`GridColumn<T>[]`', '—', 'The column definitions, in their first order. See Columns below.'],
  ['rows', '`Bind<T[]>`', '—', 'Rows in memory. The grid puts them in a `DataSource` over an `ArrayAdapter`: `push`, `splice` and a new array are followed; saved edits, new rows and deletions go into the array.'],
  ['dataSource', '`Bind<DataSource | null>`', '—', 'Rows of the data layer, from any adapter. Loading by `blocks` makes a virtual list that asks only where it looks; by `page` a paged grid. Wins over `rows`.'],
  ['rowKey', '`string | (row) => unknown`', '—', 'The identity of `rows`. A data source uses its adapter’s key.'],
  ['mode', "`Bind<'virtual' | 'paged'>`", "`'virtual'`", 'One long list, or pages with a pager; never both. A source that loads by page is always paged.'],
  ['pageSize', '`Bind<number>`', '`100`', 'Rows per page for rows in memory; a source that loads pages or blocks uses its own.'],
  ['saveMode', "`Bind<'wait' | 'background' | 'batch'>`", "`'wait'`", 'When changes are sent: see Save modes. Changing it starts again with the data (unsaved changes go).'],
  ['newRow', '`{ position?: Bind<\'top\' | \'bottom\'>, create?: () => Partial<T> }`', 'bottom', 'Where new rows open and what they start with.'],
  ['validateRow', '`(row, { isNew, changed }) => messages | string | null`', '—', 'Checks a whole row before it is saved: a message per field, or one for the row.'],
  ['settings', '`GridSettingsProps`', '—', 'The feature switches below, each a value or a function.'],
  ['sort / layout', '`SortItem[]` / `GridLayout`', '—', 'The first sort order; a saved layout (columns, sort and `group`).'],
  ['onLayoutChange', '`(layout) => void`', '—', 'After the user resized, moved, hid, pinned or sorted.'],
  ['layoutKey', '`string`', '—', 'Keeps the layout, the filters and the search text in the browser’s `localStorage` under this name; a grid made again with it gets them back.'],
  ['layoutStorage', '`{ getItem, setItem, removeItem }`', '`localStorage`', 'Where `layoutKey` keeps them: `sessionStorage`, or a store of your own.'],
  ['on…', '`(e) => void`', '—', 'Every event of the Events table below, by its name (`onCellClick`, `onRowUpdating` …); `grid.onCellClick(fn)` listens the same way.'],
  ['label', '`Bind<string>`', '`uiLocale` “Data grid”', 'The accessible name. The same as `text`.'],
  ['texts / locale', '`Bind<Partial<UiStrings>>` / `Bind<string>`', '— / page language', 'Texts of this grid only; the locale of numbers, dates and sorting.'],
  ['rowHeight', '`Bind<number>`', 'from CSS', 'A fixed row height; by default the density decides.'],
  ['actions', '`GridActionItem[] | (row, state) => GridActionItem[]`', '—', 'The buttons of each row: actions, or the names of the ready ones (`edit`, `remove`, `restore`, `save`, `cancel`). A function is followed per row.'],
  ['selectedKeys / onSelectionChanged', '`Bind<unknown[]>` / `(e) => void`', '—', 'Keys of the selected rows (a function is followed); told after every change of the selection.'],
  ['filters', '`GridFilters`', '—', 'The first filters, by field: `{ city: { op: \'=\', value: \'Ankara\' }, status: { values: [\'Draft\'] } }`.'],
  ['searchText / onSearchTextChanged', '`Bind<string>` / `(e) => void`', '`\'\'`', 'The search panel’s text (a function is followed); told when it changes, typed or set from code (`{ text }`). The two together bind it both ways.'],
  ['toolbar', '`{ visible?: Bind<boolean>, items?: Bind<(GridToolbarItem | GridToolbarItemName)[]> }`', 'the items whose features are on', 'The bar above the rows: which items, in which order and place; `visible` left out shows it while it has an item.'],
  ['onRowExpanding / onRowExpanded', '`(e) => void`', '—', 'Before and after a group opens: `{ key }`, the values of the groups from the top level down; `e.cancel = true` keeps it closed.'],
  ['onRowCollapsing / onRowCollapsed', '`(e) => void`', '—', 'Before and after a group closes; `e.cancel = true` keeps it open.'],
  ['onGroupingChanging / onGroupingChanged', '`(e) => void`', '—', 'Before and after the grouping changes, by the user or from code: `{ group, previous, byUser }`; `e.cancel = true` keeps it.'],
  ['onGroupDropping', '`(e) => void`', '—', 'A header or a chip dropped to change the grouping: `{ field, from, to, index }`; `e.cancel = true` cancels the drop.'],
  ['groupCell', '`(ctx) => component`', '—', 'Content of your own in the group rows of columns without a `groupCell`.'],
  ['summary', '`Bind<GridSummary>`', '—', 'The summaries: `totalItems` in the row under the rows, `groupItems` in group rows and footers, and how they are worked out. See Summaries.'],
  ['onSummaryChanged', '`(e) => void`', '—', 'The summary values were worked out again: `{ total, editing }`.'],
  ['loadValues', '`(request) => { values, total }`', '—', 'The values of a header filter from a server that cannot group: `{ column, search, filter, skip, take, signal }`.'],
  ['onEditorPreparing', '`(e) => void`', '—', 'Before a cell editor is made: `{ field, row, isNew, options, cancel }`. Change `e.options`, the editor’s props (`enabled = false` disables it), or set `e.cancel`.'],
  ['enabled / disabled, visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const SETTINGS = [
  ['editable', '`false`', 'Edit cells in place. A column can decide itself, also per row with `(row) => boolean`.'],
  ['creatable', '`true`', 'Fill the cells of new rows. A column with its own `editable` and no `creatable` uses the same; `editable: false, creatable: true` is entered only when the row is created.'],
  ['addRows, newRowButton, tabChain', '`false`, `true`, `true`', 'The user adds rows; the toolbar’s “New row” button; Tab on a new row’s last cell opens the next one.'],
  ['enterMoves', "`'none'`", 'Enter in an editor keeps the value and stays, goes `down`, or goes on like Tab (`next`).'],
  ['rowStatus', '`true`', 'The narrow column that marks new, changed, deleted, saving and failed rows.'],
  ['saveButtons, errorSummary', '`true`', '“Save changes” and “Discard” in the toolbar in batch mode (dimmed while there is nothing to save); “N rows with errors” and “Next error” in the bar under the rows.'],
  ['sortable, multiSort', '`true`', 'Sort from the header; Shift adds a column to the sort.'],
  ['resizable, movable, hideable, pinnable, menu', '`true`', 'What the user may do with the columns; a column can say otherwise for itself.'],
  ['resizeMode', "`'widget'`", 'Dragging a column edge: `widget` changes that column and the columns after it shift; `nextColumn` moves only the edge between it and the next column, which gives or takes the difference. A column can set its own.'],
  ['headerButtons', "`'hover'`", 'The menu button shows on hover and focus (always on touch screens), or `always`.'],
  ['columnChooser, layoutReset', '`true`', 'The column list and “Reset layout” in the column menu.'],
  ['columnChooserButton', '`false`', 'A toolbar button that opens the column list (while `columnChooser` is on).'],
  ['tooltips, striped, rowCount, pager', '`true`, `false`, `true`, `true`', 'Full text of a clipped cell; stripes; the row count; the pager.'],
  ['actionsColumn, actionsPosition, actionsSticky, actionsWidth', "`true`, `'end'`, `true`, `140`", 'The actions column, at the start or the end, pinned to its edge or scrolling with the rows, and its width.'],
  ['selection, selectionColumn, selectAll, selectedCount', "`'none'`, `true`, `true`, `true`", '`single` or `multiple`; the check box column; the header check box and Ctrl+A; “N selected” in the bar.'],
  ['filterRow, headerFilter', '`false`', 'The filter row and the header filter; a column can turn them on or off for itself.'],
  ['syncLookupFilterValues', '`true`', 'A lookup column’s filter row and header filter list only the keys of the rows the other filters leave; off, they list the lookup source. A column can say otherwise for itself.'],
  ['filterDelay', '`300`', 'Milliseconds from the last key typed in the filter row to the filter.'],
  ['copyable, exportable', '`true`', 'Columns that go into what Ctrl+C copies and into an export; a column can say otherwise for itself.'],
  ['copyValues, copyHeaders', "`'shown'`, `false`", 'Ctrl+C copies the text the cells show or their `raw` values; copied rows start with the column titles.'],
  ['paste, pasteNewRows', '`true`, `false`', 'Ctrl+V writes into the editable cells; pasted lines past the last row open new rows (with `addRows`).'],
  ['exportButton', '`false`', 'An “Export” button in the toolbar that saves the rows as CSV.'],
  ['saveLayout', '`true`', 'With `layoutKey`, the layout, the filters and the search text are kept and come back.'],
  ['searchPanel', '`false`', 'The search box in the toolbar. `searchText` and `searchByText()` search without it too.'],
  ['searchPanelWidth, searchPlaceholder', "`160`, `uiLocale` “Search…”", 'The box’s width (pixels or a CSS length) and its placeholder.'],
  ['searchDelay', '`700`', 'Milliseconds from the last key typed in the search box to the search; Enter searches at once.'],
  ['highlightSearchText, highlightCaseSensitive', '`true`, `false`', 'Mark what the search found in the cells; mark only text in the same case (the search itself ignores case).'],
  ['searchVisibleColumnsOnly', '`false`', 'Search only the visible columns; by default hidden ones too.'],
  ['searchable', '`true`', 'The columns the search looks in; a column can say otherwise for itself (one that turns its own filters off is left out).'],
  ['groupPanel', '`false`', 'The group panel at the start of the toolbar: a chip per grouped column, and where headers are dropped to group by them.'],
  ['groupPanelDragging, groupPanelEmptyText', "`true`, `uiLocale` “Drag a column header here…”", 'Headers drag to the panel and chips back (off: the panel only shows the grouping); what the empty panel says.'],
  ['groupMenu', 'unset', '“Group by this column”, “Ungroup” and “Ungroup all” in the column menu. Left unset (grid and column), they show while the panel takes headers, as the keyboard’s way to do the same.'],
  ['groupable, showWhenGrouped', '`true`, `false`', 'The columns the user can group by; a grouped column still shows among the columns. A column can say otherwise for itself.'],
  ['autoExpandAll, allowCollapsing', '`true`, `true`', 'Groups start open (a column’s `autoExpandGroup` decides for its level); the user can open and close them (code always can; a column can say otherwise).'],
  ['groupExpandMode', "`'button'`", 'A group opens from its arrow and the keyboard, or with `rowClick` from a click anywhere on its row. A column can set its own.'],
  ['groupCount', '`true`', 'Group rows show their row count; a column can say otherwise for itself.'],
  ['groupToggleKeys, groupArrowKeys', "`['Enter', ' ']`, `true`", 'The keys that open and close a group row; Right and Left open, close and go in and out.'],
  ['remoteGrouping', "`'auto'`", 'Who groups a data source’s rows: `auto` its adapter when it groups (blocks), `true` the adapter whenever the source loads by blocks, `false` always the browser, from every matching row.'],
  ['groupLoadPageSize', '`0`', 'Grouping or summaries in the browser over a source that loads pages or blocks: rows per request while every matching row loads (0: one request).'],
  ['totalSummary, groupSummary', '`true`', 'The row of totals with the items of `summary.totalItems`; the items of `summary.groupItems` in group rows and footers. An item’s `visible` wins.'],
  ['totalSummaryTabStop', '`true`', 'The row of totals is a Tab stop of its own after the rows.'],
  ['remoteSummary', "`'auto'`", 'Who works out the summaries of a source that loads pages or blocks: `auto` its adapter when it has the `summary` capability, `true` the adapter always, `false` the browser, from every matching row. `custom` items and columns with a `value` reader are always worked out in the browser.'],
  ['dragThreshold', '`5`', 'Pixels a pressed header or chip moves before it is dragged.'],
  ['dragGhost', '`true`', 'A dragged header or chip shows its title next to the pointer, marked with what a drop would do: group, move, ungroup. While a header is dragged the whole toolbar takes drops for the group panel and is marked.'],
  ['columnWidth, columnMinWidth', '`140`, `48`', 'The width of a column that gives none, and the smallest width the user can resize one to; a column’s `width` and `minWidth` win.'],
  ['rowStatusWidth, selectionColumnWidth', '`28`, `36`', 'Widths of the row status column and the check box column.'],
  ['resizeStep, resizeFineStep', '`10`, `1`', 'Pixels one arrow key resizes a column by (“Width” in the column menu), and with Shift.'],
  ['tooltipDelay', '`500`', 'Milliseconds the pointer rests on a cell before its tooltip shows (keyboard focus shows it at once).'],
  ['extraRows', '`4`', 'Rows drawn above and below the visible ones, so a quick scroll shows no gap; more costs more per scroll.'],
  ['pagerNeighbors, pagerNavigation, pagerInfo', '`1`, `true`, `true`', 'Page buttons on each side of the current page; the first, previous, next and last buttons; “Page 3 of 12”.'],
  ['headerFilterPageSize, headerFilterRows', '`100`, `8`', 'Values the header filter loads per request; the height of its list in rows.'],
  ['exportPageSize', '`1000`', 'Rows an export asks a server for per request; `exportCsv({ pageSize })` wins.'],
  ['trueTexts, falseTexts', "`['true', '1', 'x', '✓', '✔']`, `['false', '0', '']`", 'Pasted texts read as yes and as no in a yes/no column, besides the `yes` and `no` texts; a column can give its own.'],
  ['editKeys, clearKeys', "`['Enter', 'F2']`, `['Delete']`", 'Keys that open the active cell’s editor, and that empty it (`KeyboardEvent.key` values).'],
  ['editOnKeyPress', '`true`', 'Typing a character on a cell opens its editor with it. A column can set its own.'],
  ['startEditAction', "`'dblClick'`", 'A double-click, or one `click` on the active cell, opens its editor. A column can set its own.'],
];

const EVENTS = [
  ['onCellClick / onCellDblClick', '`{ field, row, rowIndex, rowType, groupKey?, element, event }`', 'yes', 'A cell was clicked or double-clicked (also in a group footer, `rowType: \'groupFooter\'`, and in the row of totals, `\'totalFooter\'`); cancel: no selection, no group toggle, no editor.'],
  ['onRowClick / onRowDblClick', '`{ row, rowIndex, rowType, groupKey?, element, event }`', 'yes', 'The same for the row, after its cell’s event.'],
  ['onCellPrepared', '`{ field, row, rowIndex, value, isNew, element }`', '', 'A cell was drawn for a row: style it. Cells are reused while scrolling, so set and clear what you change. Costs nothing while nobody listens.'],
  ['onRowPrepared', '`{ row, rowIndex, rowType, groupKey?, isSelected, element }`', '', 'A data row, group row, group footer (`groupFooter`) or the row of totals (`totalFooter`) was drawn; the same rule.'],
  ['onContentReady', '`{ total }`', '', 'Rows arrived and are laid out (after a load, a filter, a sort, a page, a resize).'],
  ['onDataErrorOccurred', '`{ error, operation, row? }`', '', 'A load (`operation: \'load\'`) or the save of a row (`\'save\'`, with `row`) failed.'],
  ['onEditingStart', '`{ field, row, rowIndex, isNew }`', 'yes', 'A cell editor is about to open.'],
  ['onEditorPreparing', '`{ field, row, isNew, options }`', 'yes', 'The editor is about to be made: change its props in `options`.'],
  ['onInitNewRow', '`{ data, values }`', 'yes', 'A new row is about to open: `data` is what it starts with, `values` what counts as entered; cancel opens no row.'],
  ['onSaving / onSaved', '`{ changes }` / `{ changes, saved, failed }`', 'yes / —', 'Changes are about to be sent (leaving a row, the background queue, “Save changes”); the answer came.'],
  ['onRowInserting / onRowInserted', '`{ row, data }` / `{ row, key }`', 'yes / —', 'Per new row: change `data` (what is sent) or keep it unsent; it was saved.'],
  ['onRowUpdating / onRowUpdated', '`{ key, row, changes }` / `{ key, row, changes }`', 'yes / —', 'Per changed row: change `changes` or keep them unsent; they were saved.'],
  ['onRowRemoving / onRowRemoved', '`{ key, row }`', 'yes / —', 'Per deleted row, when the deletion is sent (batch: on “Save changes”); it was deleted.'],
  ['onEditCanceling / onEditCanceled', '`{ rows }`', 'yes / —', 'Unsaved changes are about to be dropped: Escape on a row, the “Cancel” action, `discardChanges()`.'],
  ['onFocusedCellChanging / onFocusedCellChanged', '`{ rowIndex, field, previousRowIndex, previousField, row }`', 'yes / —', 'The active cell moves (keys, a click, code); -1 is the header, -2 the filter row.'],
  ['onFocusedRowChanging / onFocusedRowChanged', '`{ rowIndex, previousRowIndex, row }` / `{ rowIndex, row, key }`', 'yes / —', 'The active row changes.'],
  ['onKeyHandling', '`{ event, rowIndex, field }`', 'yes', 'A key went down in the rows, an editor, the filter row or a group chip, before the grid handles it; cancel and handle it yourself. the standard calls it `onKeyDown`, a DOM event name in JSX.'],
  ['onOptionChanged', '`{ name, field?, value, previous }`', '', 'A setting was assigned: `grid.settings`, `columnSettings(field)` (with `field`), `toolbar` (`toolbar.visible`, `toolbar.items`), `columnOption`.'],
  ['onSortChanging / onSortChanged', '`{ sort, previous, byUser }`', 'yes / —', 'The sort is about to change, by the user or from code.'],
  ['onFilterChanging / onFilterChanged', '`{ filters, previous }` / `{ filters, filter }`', 'yes / —', 'The filter row and header filters are about to apply; cancel puts the ones before back in the cells.'],
  ['onSearchTextChanging / onSearchTextChanged', '`{ text, previous }` / `{ text }`', 'yes / —', 'The search text is about to change; cancel keeps the one before in the box.'],
  ['onPageChanging / onPageChanged', '`{ page, previous }`', 'yes / —', 'Another page is about to show.'],
  ['onSelectionChanging / onSelectionChanged', '`{ selection, previous }` / `{ selection }`', 'yes / —', 'The selection is about to change, by the user or from code.'],
  ['onLayoutChanging / onLayoutChange', '`{ layout, previous }` / `layout`', 'yes / —', 'The user resized, moved, hid, pinned, sorted or reset; cancel puts the layout before back.'],
  ['onGroupingChanging / onGroupingChanged, onGroupDropping', 'see Grouping', 'yes', 'The grouping; a dropped header or chip.'],
  ['onRowExpanding / onRowExpanded, onRowCollapsing / onRowCollapsed', '`{ key }`', 'yes / —', 'A group opens or closes.'],
  ['onCopying / onPasting', '`{ text, html, rows }` / `{ text, rowIndex, field }`', 'yes', 'Ctrl+C, `copy()`; Ctrl+V, `paste()`: change the text, or stop it.'],
  ['onSummaryChanged', '`{ total, editing }`', '', 'The summary values were worked out again: new rows, a new filter or search, a save, or (with `recalculateWhileEditing`) an unsaved change.'],
  ['onExporting / onExported', '`{ format, options }` / `{ format, rows, text? }`', 'yes / —', 'An export is about to start (change its options); it finished.'],
  ['onContextMenuPreparing', '`{ target, field, row?, rowIndex, items }`', 'yes', 'A header’s column menu (`header`) or a row’s menu (`row`: a right click or the context menu key; it opens only when you add items) is about to open: change `items`.'],
  ['onToolbarPreparing', '`{ items }`', '', 'The toolbar is laid out: change the list of items it takes.'],
];


const COLUMN_FIELDS = [
  ['field, title', 'The value’s key (a dotted path reads a nested value) and the header text (`Bind<string>`).'],
  ['type', '`text`, `number`, `date`, `boolean`, `list`: alignment, format, sorting and the editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`).'],
  ['width, minWidth, maxWidth, flex', 'Pixels (default: the `columnWidth` and `columnMinWidth` settings); `flex` shares the free space until the user resizes.'],
  ['sticky, hidden, align', 'Pinned to an edge; hidden at first; the alignment.'],
  ['value, format, compare', 'Read the value another way; show it another way; sort it another way (rows in memory).'],
  ['cell', '`(ctx) => component`: content of your own, made once per pooled cell; read `ctx.row` and `ctx.value` in getters.'],
  ['editor', '`(ctx) => Field | component`: an editor of your own. A `Field` is read through its value; anything else calls `ctx.setValue`.'],
  ['required, validate, options', 'An empty value is not taken; `(value, row) => message`; the choices of a list (an array, or a function of the row, also async).'],
  ['filterOperators, filterOperator', 'The conditions the filter row offers for the column, and the one it starts with.'],
  ['lookup', '`GridLookup`: the cell keeps a key and shows the text of its item from another source (see Lookup columns). `type` still decides the alignment.'],
  ['textFrom, sortField', 'The text of a lookup cell read from the row (`\'customer.name\'` or `(row) => text`): the source is then asked only to edit and to list. The field a server sorts the column by.'],
  ['setCellValue', '`(values, value, row) => void | Promise`: called when the user commits a value (editor, paste, Delete), before it is written. `values` starts as `{ [field]: value }`; add fields to write them too. A promise keeps the cell busy until it settles.'],
  ['editable, creatable, sortable, resizable, movable, hideable, pinnable, menu, filterRow, headerFilter, copyable, exportable, syncLookupFilterValues, searchable', 'Switch a feature for this column; wins over `settings`.'],
  ['resizeMode', 'How this column’s edge is dragged (`widget` or `nextColumn`); wins over `settings`.'],
  ['headerCell', '`(ctx) => component | Node | string`: content of your own in the header in place of the title text, made once; `ctx.title`, `ctx.sort`, `ctx.column` in getters. The title stays the header’s accessible name.'],
  ['editOnKeyPress, startEditAction', 'How the user opens this column’s editor; wins over `settings`.'],
  ['trueTexts, falseTexts', 'A yes/no column: the pasted texts read as yes and as no; wins over `settings`.'],
  ['groupIndex', '`Bind<number | undefined>`: the column’s place among the grouped columns; the rows start grouped by it. A function is followed: a new value moves the column there, `undefined` ungroups it.'],
  ['autoExpandGroup', 'The column’s groups start open; wins over `autoExpandAll`.'],
  ['groupable, showWhenGrouped, allowCollapsing, groupCount, groupMenu, groupExpandMode', 'The grouping switches for this column; each wins over `settings`.'],
  ['groupCompare', '`(a, b) => number`: the order of the column’s groups in memory (`dir` still turns it).'],
  ['calculateGroupValue', '`(row) => value` for rows in memory, or the field a server groups by: what the rows are grouped and the groups ordered by instead of the value.'],
  ['groupCell', '`(ctx) => component`: content of your own in the column’s group rows, made once per pooled group row; read `ctx.value`, `ctx.text`, `ctx.count`, `ctx.level`, `ctx.key`, `ctx.isExpanded`, `ctx.summaryItems` (`{ name, column, summaryType, value, text }` of the group row) in getters.'],
];

const LOOKUP_FIELDS = [
  ['dataSource', '`Bind<DataSource | unknown[]>`: the items, searched and resolved on their own service, or an array in memory.'],
  ['valueField, textField', 'The field that matches the cell value (default: the source’s key; an array of plain values: the value); the text shown, a field or `(item) => text` (default: the value).'],
  ['searchFields', 'Fields the editor and the text searches look in. Default: `textField` when it is a field.'],
  ['filter', '`(row) => FilterExpression`: narrows the items for a row (cascading lists); `null` row: the filter lists.'],
  ['allowClearing', '`Bind<boolean>`: a clear button in the editor. Default `false`.'],
  ['resolve, batchSize', '`\'batch\'` (default: keys in one request, `batchSize` 100 each) or `\'byKey\'` (one request per key).'],
  ['sortBy', '`Bind<\'key\' | \'text\'>`: rows in memory sorted by the key (default) or by the text shown.'],
  ['editor, editorOptions', '`\'dropdown\'` (default), `\'combobox\'` or `\'lookup\'`, and props for it (a `Lookup`’s `columns`). A column’s own `editor` still wins and gets the lookup in its context.'],
  ['searchLimit', 'How many items whose text holds the search panel’s text the search turns into keys, at most. Default 100.'],
  ['filterSearchLimit', 'The same for the header filter’s search box. Default 1000.'],
  ['pageSize', 'Items the editor’s list loads per request while it scrolls (a data source). Default 50.'],
  ['parallelRequests', '`\'byKey\'`: requests at the same time. Default 6.'],
  ['pasteSearchLimit', 'Items a pasted text is looked for in. Default 50.'],
];

const PROPERTIES = [
  ['settings', 'read/write, live', '`grid.settings.striped = true`, or a function that is followed.'],
  ['columnSettings(field)', 'read/write, live', 'One column’s own switches; `undefined` follows `settings` again.'],
  ['dataSource, changeTracker', 'read-only', 'The `DataSource` the rows come from and the `ChangeTracker` of their unsaved changes: listen to them like any other.'],
  ['total, loading, pageCount', 'read-only, reactive', 'Rows, the first load running, pages.'],
  ['sort, page, layout', 'read/write', 'Assign to change them.'],
  ['hasChanges, changes, errorCount', 'read-only, reactive', 'Unsaved changes (`{ added, updated, removed, count }`) and rows with errors.'],
  ['activeRow, activeField', 'read-only', 'The row and the field of the active cell.'],
  ['actions', 'read-only', 'The ready actions: `edit`, `remove`, `restore`, `save`, `cancel`.'],
  ['selection, selectedCount', 'read-only, reactive', 'The selection as a state (`{ all, keys, except, filter }`) and how many rows it holds.'],
  ['selectedKeys, selectedRows', 'read/write, read-only', 'Keys and rows of the selected rows that are known (loaded); assign keys to select them.'],
  ['selectionFilter', 'read-only', 'The selection as a filter of the data layer, for work on the server.'],
  ['filters, filter', 'read/write, read-only', 'The filters by field; the whole filter the rows are loaded with (the search included).'],
  ['searchText', 'read/write, reactive', 'The search text; assigning searches at once, a function is followed.'],
  ['group', 'read/write, reactive', 'The grouped columns in order with the order of their groups (`[{ field, dir }]`); assign to group, `[]` ungroups.'],
  ['summary', 'read/write, reactive', 'The summaries as they read now; assign a new one, or a function that is followed.'],
  ['summaryStatus', 'read-only, reactive', '`\'loading\'` while a server works out the totals (or every row loads for them), `\'error\'` when that failed, else `\'ready\'`.'],
  ['onRowExpanding, onRowExpanded, onRowCollapsing, onRowCollapsed, onGroupingChanging, onGroupingChanged, onGroupDropping', 'event', 'Subscribe with `grid.onRowExpanded((e) => …)`; the same as the props.'],
  ['toolbar', 'read/write, live', '`grid.toolbar.items = [\'searchPanel\', { text: \'Refresh\', click }]`, `grid.toolbar.visible = false`; a function is followed.'],
  ['onSearchTextChanged', 'event', 'Subscribe with `grid.onSearchTextChanged((e) => …)`; the same as the prop.'],
  ['onSelectionChanged', 'event', 'Subscribe with `grid.onSelectionChanged((e) => …)`.'],
  ['onEditorPreparing', 'event', 'Subscribe with `grid.onEditorPreparing((e) => …)`; the same as the prop.'],
  ['every event of the Events table', 'event', '`grid.onRowUpdating((e) => …)` returns a handle; `dispose()` stops listening.'],
  ['status, loadError, failedBlocks', 'read-only, reactive', '`\'loading\' | \'ready\' | \'error\'`; the error of the last load; blocks that failed after the first answer.'],
  ['editingCell', 'read-only, reactive', 'The cell whose editor is open: `{ rowIndex, field, row }`, or `null`.'],
  ['saving, exporting', 'read-only, reactive', 'A row is being saved and the grid waits (`wait` mode); an export is running.'],
  ['focusedRowIndex, focusedRowKey', 'read/write', 'The active row by index or key; assigning moves there (a key: when its row is loaded).'],
];

const METHODS = [
  ['addRow(values?)', '`Promise<boolean>`', 'Opens a new row as the “New row” button does; `false` when the row being edited cannot be left.'],
  ['deleteRow(row?) / restoreRow(row)', '`Promise<boolean>` / `void`', 'Deletes a row (default: the active one) as the save mode says; takes a batch deletion back.'],
  ['saveChanges() / discardChanges()', '`Promise<{ saved, failed }>` / `void`', 'Sends every unsaved change; drops them all.'],
  ['goToNextError()', '`boolean`', 'Moves to the next row that failed or has a message.'],
  ['refresh() / retry()', '`void`', 'Loads again keeping the position (the lookup texts too); loads what failed again.'],
  ['refreshLookups()', '`void`', 'Forgets the texts of the lookup columns and asks for the ones on the screen again.'],
  ['scrollToIndex(i, align?)', '`void`', 'Brings a row into view (in paged mode: its page).'],
  ['autoSizeColumns() / resetLayout() / focus()', '', 'Fits the columns; back to the definitions; focuses the active cell.'],
  ['selectRow(row, add?) / deselectRow(row) / isSelected(row)', '', 'One row in or out of the selection.'],
  ['selectAll() / clearSelection()', '', 'Every row of the filter, loaded or not; none.'],
  ['clearFilters()', '', 'Takes every filter away, and the search text.'],
  ['searchByText(text)', '`void`', 'Searches for a text at once, as the search panel does; `\'\'` stops searching.'],
  ['showColumnChooser()', '`void`', 'Opens the column list, under the toolbar’s column button when it shows.'],
  ['expandAll(level?) / collapseAll(level?)', '`void`', 'Opens or closes every group of a level (0 is the top level), or of every level.'],
  ['expandGroup(key) / collapseGroup(key) / isGroupExpanded(key)', '`boolean`', 'One group by its key, the values from the top level down (`[\'Ankara\', \'Draft\']`): whether it opened or closed, and whether it is open.'],
  ['clearGrouping()', '`void`', 'Takes every grouping away.'],
  ['groupBy(field, index?, dir?) / ungroup(field) / setGroupOrder(field, dir)', '`void`', 'Groups by a column at a place among the grouped ones (a grouped one moves); takes one out; sets the order of its groups.'],
  ['copy() / paste(text)', '`string` / `number`', 'What Ctrl+C and Ctrl+V do: copies the selected rows or the active cell (returns the text); pastes tab-separated text from the active cell (returns the cells written).'],
  ['exportRows(options?)', '`Promise<object[]>`', 'The rows of the filter in the sort order, by field, with the visible exportable columns: shown text or `raw` values; a server’s rows in parts through the data source. Group footers and the totals come as objects of the same fields (`summaries: false` leaves them out).'],
  ['exportCsv(options?)', '`Promise<string>`', 'The same as a CSV file a spreadsheet opens: byte order mark, the locale’s separator, titles first, a line per group while grouped, group footers after their rows and the totals last. Options: `values`, `selected`, `fileName`, `download`, `separator`, `headers`, `groups`, `summaries`, `bom`, `escapeFormulas`, `pageSize`, `onProgress`, `signal`.'],
  ['getTotalSummaryValue(name)', '`unknown`', 'A value of the totals by the item’s `name`, its place in `totalItems`, its type, its column or `type_column` (`\'sum_amount\'`). Reactive.'],
  ['getGroupSummaryValue(key, name)', '`unknown`', 'A value of a group’s summary, the group by its key (as `expandGroup`), the item as above. Reactive.'],
  ['getVisibleRows()', '`GridVisibleRow[]`', 'The rows drawn now: `{ rowIndex, rowType, row, key, groupKey?, element }`.'],
  ['getRowElement(i) / getCellElement(i, field)', '`HTMLElement | undefined`', 'The element of a drawn row or cell.'],
  ['getKeyByRowIndex(i) / getRowIndexByKey(key)', '`unknown` / `number`', 'A row’s key by its index, and the index of a loaded row by its key (-1 when it is not loaded).'],
  ['byKey(key)', '`Promise<T | undefined>`', 'The row with this key: loaded, found before, or asked of the data source.'],
  ['cellValue(i, field, value?)', '`unknown`', 'The value a cell shows; with `value`, writes it as the user would (checked, and saved as the save mode says).'],
  ['navigateToRow(key)', '`Promise<boolean>`', 'Goes to the row with this key (its page in paged mode) and makes it the active row.'],
  ['focusCell(i, field?) / editCell(i, field) / editRow(i) / closeEditCell()', '`boolean`', 'Moves the active cell as the arrows do; opens a cell’s editor, or the first one of a row; keeps the open editor’s value and closes it.'],
  ['beginUpdate() / endUpdate()', '`void`', 'Changes from code in between lay the rows out once, at the last `endUpdate()`.'],
  ['repaint()', '`void`', 'Draws the rows on the screen again, without loading (after what a template or `onRowPrepared` reads changed).'],
  ['columnOption(field, name?, value?)', '`unknown`', 'Reads or writes a column’s `width`, `visible`, `sticky`, `visibleIndex`, `sortOrder`, `sortIndex`, `groupIndex` or a feature switch; without a name, all of them.'],
  ['getCombinedFilter()', '`FilterExpression | null`', 'The whole filter of the rows: the source’s own, the filter row, the header filters and the search.'],
  ['state() / state(value)', '`GridStateValue` / `void`', 'What the user set up — columns, sort, grouping, filters, search text, page, selected keys, active row — and putting it back.'],
];

const KEYS = [
  ['Arrow keys', 'Move between cells, the headers included. In a right-to-left page Left and Right swap.'],
  ['Home / End, Ctrl + Home / End', 'The first data column / the last column; the first / the last row (only that block is loaded).'],
  ['PageUp / PageDown', 'A screen up or down.'],
  ['Enter (header), Shift + Enter', 'Sort; add the column to the sort.'],
  ['Alt + Down, Shift + F10 (header)', 'The column menu; there “Move” and “Width” work with Left and Right, Enter keeps, Escape takes back.'],
  ['Typing, Enter, F2, double-click', 'Edit the cell; typing starts with that character (a lookup cell opens its list and searches it).'],
  ['Space, Delete, Backspace', 'Toggle a check box column; empty the cell; edit from empty.'],
  ['Escape', 'In an editor: close it without the value (a new row goes). On a row: take its edits back.'],
  ['Shift + F10, the context menu key (row)', 'The row’s menu, when `onContextMenuPreparing` gives it items.'],
  ['Any key', 'The keys that edit and empty a cell are the `editKeys` and `clearKeys` settings; `onKeyHandling` takes any key before the grid does.'],
  ['Tab / Shift + Tab in an editor', 'The next / previous editable cell, row by row; at the end of a new row the next new row opens.'],
  ['Up / Down in an editor', 'Keep the value and go to the row above or below.'],
  ['Left / Right in the actions cell', 'Move between its buttons; Enter or Space presses one; Alt + Down opens the “more” menu.'],
  ['Shift + Space, Space', 'Select or deselect the row; Space alone where it does not edit (the check box column, a cell that cannot be edited).'],
  ['Shift + Up / Down, Shift + click, Ctrl + click', 'Extend the selection from the anchor; add or take out one row.'],
  ['Ctrl + A', 'Select every row of the filter.'],
  ['Ctrl + C', 'Copy the selected rows (multiple selection), else the active cell: tab-separated text and an HTML table.'],
  ['Ctrl + V', 'Paste tab-separated text into the editable cells from the active one, rightwards and downwards.'],
  ['Typing, Enter or F2 on the filter row', 'Into the cell’s value box; Escape or Enter back to the cell; Tab to the next value box; Delete clears the cell.'],
  ['Alt + Down on the filter row', 'The condition menu (for a yes/no column, its list).'],
  ['Alt + Down on a header', 'The column menu; without one, the header filter.'],
  ['Left / Right, Home / End in the toolbar', 'Move between its items (the toolbar is one Tab stop before the rows); in the search box the arrows stay in its text.'],
  ['Escape, Enter in the search box', 'Empty the box (the rows come back at once); search without waiting for the pause.'],
  ['Enter, Space on a group row', 'Open or close the group.'],
  ['Arrow keys on a group footer', 'The footer is a row the arrows reach like a group row; the keys that edit or select do nothing there.'],
  ['Tab after the rows', 'The row of totals (`totalSummaryTabStop`); Shift + Tab goes back to the active cell. Ctrl + End goes to the last row, as before.'],
  ['Right / Left on a group row', 'Open the group, then go to its first row; close it, then go to the group it is in.'],
  ['Enter, Delete, Shift + Left / Right on a chip', 'Turn the order of the groups; ungroup; move the chip. Left and Right go from chip to chip like any toolbar item.'],
];

const A11Y = [
  ['Pattern', 'The APG data grid: `role="grid"`, rows and cells with `aria-rowindex` and `aria-colindex`; `aria-rowcount` is the real total, also in a virtual list.'],
  ['Reading order', 'Drawn rows are reused while scrolling and stay where they are in the page; the row group lists them in row order with `aria-owns`, so a screen reader reads them top to bottom.'],
  ['One tab stop', 'Only the active cell is in the Tab order; focus never falls to the page: the focused row stays while it scrolls away.'],
  ['Sorting', '`aria-sort` on the first sorted header.'],
  ['Messages', 'A cell with a message has `aria-invalid` and is described by it while it is active; the status cell names the row’s state, not only with a color.'],
  ['Announcements', 'Sorting, moving, saving, errors, copying, pasting and exports are announced through a polite live region.'],
  ['Busy', '`aria-busy` while the first rows load and while a row is saved in `wait` mode; on a lookup cell while its text loads, and on a cell while its `setCellValue` runs.'],
  ['Lookup keys', 'A key the lookup source does not have is not shown only by its color: it is underlined and its hint (“Not found in the list”) shows on hover and focus.'],
  ['Actions', 'Real buttons with the action’s text as their name (also when only the icon shows, with the text as a tooltip); one of them is in the cell’s roving focus; the “more” button has `aria-haspopup="menu"`.'],
  ['Selection', '`aria-multiselectable` on the grid, `aria-selected` on every row while selection is on; the check boxes are `role="checkbox"` with `aria-checked` (`mixed` in the header).'],
  ['Filters', 'The filter row is a row of the grid (its fields are named after the column); the condition button names the condition; the header filter is a `dialog` with a listbox.'],
  ['Toolbar', 'The kit’s `Toolbar` (`role="toolbar"`, named after the grid): one Tab stop with arrow keys between its items; a button that shows only its icon is named by its text, which is also its tooltip and its line in the “more” menu.'],
  ['Search', 'The box is a search field named “Search in the grid”; the number of records found is announced politely; what was found is marked with `<mark>`, which reads as the same text.'],
  ['Group rows', 'Rows of the grid with `aria-expanded` and `aria-level`; their one cell spans the columns (`aria-colspan`), reads “Column: value (count)” and is a cell the arrows reach. Grouping, ungrouping and moving a chip are announced.'],
  ['Summaries', 'The row of totals is a row of the grid after the rows (`aria-rowindex`, counted in `aria-rowcount`) in a row group named “Totals”; each cell is named by what its items say about their columns (“Sum of Amount: 1,234”), also when it shows only “Sum: 1,234”. Group footers are rows with `aria-level`; items under their columns in a group row are cells of that row. `aria-busy` while a server works the totals out.'],
  ['Group panel', 'A `group` named “Grouping” in the toolbar; each chip is a button named after its column and the order of its groups, described by the keys it takes. Every drag has a keyboard way: the column menu and the chips’ keys.'],
];

const HOOKS = [
  ['.mx-data-grid', 'The grid. `data-striped`, `data-header-buttons`, `data-mode`.'],
  ['.mx-data-grid__viewport, __head, __body', 'The scrolling area with `role="grid"`, the sticky header, the rows.'],
  ['.mx-data-grid__row', 'A row: `data-active`, `data-selected`, `data-status`, `data-odd`, `data-loading`.'],
  ['.mx-data-grid__actions, __action, __more', 'The actions cell and its buttons (kit button classes, `data-action`).'],
  ['.mx-data-grid__select, __check', 'The selection column and its check box (`aria-checked`).'],
  ['.mx-data-grid__row--filter, __filter-cell, __condition', 'The filter row, its cells, the condition button (`data-set`).'],
  ['.mx-data-grid__filter-button, __values', 'The header filter button (`data-active`) and its window.'],
  ['.mx-data-grid__cell, __header-cell', 'A cell (`data-changed`, `aria-invalid`; a lookup cell `data-lookup="loading"` with `aria-busy`, or `"missing"`), a header (`data-sort`, `data-sortable`).'],
  ['.mx-data-grid__editor', 'The editor of the active cell; its field carries `data-in-cell` and is drawn without a frame.'],
  ['.mx-data-grid__toolbar, __toolbar-gap', 'The toolbar above the rows (the kit’s `.mx-toolbar`) and the gap between its `before` and `after` items.'],
  ['.mx-data-grid__add, __save, __revert, __export, __columns, __search', 'The toolbar’s own items: “New row”, “Save changes”, “Discard”, “Export” (busy while it runs), the column list, the search box.'],
  ['.mx-data-grid__mark', 'Text the search found, a `<mark>` in the cell.'],
  ['.mx-data-grid__group-row, __group-cell, __group-toggle, __group-count', 'A group row (`data-expanded`, `--_level`), its cell, its arrow and its count.'],
  ['.mx-data-grid__foot, __total-row', 'The sticky row group under the rows and its row of totals (`data-state="loading"` while a server works them out).'],
  ['.mx-data-grid__summary-cell, __summary-item', 'A cell holding summary items (row of totals, group footer, an aligned item of a group row) and each item in it, with the item’s `cssClass`.'],
  ['.mx-data-grid__group-footer, __group-summary', 'A group footer (`--_level`); the summary text after a group row’s count.'],
  ['.mx-data-grid__group-panel, __chip, __group-empty', 'The group panel (`data-drop` while a header can drop there, `data-locked` without dragging), its chips (`data-dir`, `data-dragging`) and its empty text.'],
  ['.mx-data-grid__bar, __pager', 'The bar under the rows and its pager.'],
];

const TOKENS = [
  ['datagrid.row-height, datagrid.row-padding', 'The row height, from the density tokens.'],
  ['datagrid.cell-padding, datagrid.font-size, datagrid.head-font-weight', 'Cells and headers.'],
  ['datagrid.background, head-background, head-color, line-color, outline-color, edge-color', 'Surfaces and lines.'],
  ['datagrid.hover, stripe, active, new, changed, invalid, placeholder', 'Row tints and the marks of cells.'],
  ['datagrid.bar-*, gap, icon-size, button-size, resize-width, mark-size, invalid-width, radius, border-width', 'The bar, the header parts and the marks.'],
  ['datagrid.selected, check-size, check-mark-size, check-radius', 'Selected rows and the selection check boxes.'],
  ['datagrid.action-gap, filter-padding, values-width, values-gap', 'The action buttons, the filter row, the header filter window.'],
  ['datagrid.search-mark-background, search-mark-color, search-mark-line', 'The text the search found: its tint, its text and the line under it.'],
  ['datagrid.group-indent, group-font-weight, group-background, group-count-color', 'Group rows: the step of each level, the text, the row and the count.'],
  ['datagrid.chip-gap, chip-radius, chip-background, chip-border-color, panel-empty-color, drop-target', 'The group panel, its chips, its empty text and the tint where something can be dropped.'],
];

export default function DataGridPage() {
  return (
    <>
      <p class="lead">
        A grid for data entry and large data: rows in memory or from any adapter of the data layer, a virtual list or
        pages, sorting, column layout, editing with the kit's editors, new rows with the Tab chain, three save modes,
        row actions, selection, filters, a search panel, grouping, summaries, a toolbar, lookup columns from other services, copy and paste,
        export and a layout that is kept — and every feature can be turned off, for the grid or for one column.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Give rows in memory with `rows` and their key with `rowKey`; the grid puts them in a `DataSource` over an `ArrayAdapter` itself. Every prop takes a value or a function. Created with `new`, the grid is an object like any other: add it, sort it, ask it." />
        </p>
        <Example files={withOrders('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="virtual" title="Server data, virtual">
        <p>
          <Rich text="With a `DataSource` that loads by `blocks`, the scroll bar is sized from the total and only the rows where the list looks are asked for. A jump (Ctrl+End, dragging the bar) asks only where it lands; a block left behind while loading is aborted. A row that has not come yet shows as a placeholder. Above 10 million pixels of rows the bar is scaled." />
        </p>
        <Example files={[...withOrders('Virtual.tsx'), slowAdapterFile]} stack>
          <Virtual />
        </Example>
      </Section>

      <Section anchor="paged" title="Pages">
        <p>
          <Rich text="A `DataSource` that loads by `page` makes a paged grid: one page is asked for at a time, and a sort goes back to the first page. Rows in memory page with `mode` set to `paged`." />
        </p>
        <Example files={[...withOrders('Pages.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Pages />
        </Example>
      </Section>

      <Section anchor="editing" title="Editing and save modes">
        <p>
          <Rich text="Typing on a cell, Enter, F2 or a double-click opens its editor; only the active cell has one. What is typed goes into the row's draft in the grid's `ChangeTracker`, kept by key, and the row is saved when it is left: `wait` sends it and waits, `background` sends it through one queue and goes on, `batch` keeps everything until “Save changes”. A row with a message cannot be left; Escape gives up. This service turns down a note with “error” in it." />
        </p>
        <Example files={[...withOrders('SaveModes.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <SaveModes />
        </Example>
      </Section>

      <Section anchor="batch" title="Saving all at once">
        <p>
          <Rich text="With `saveMode: 'batch'` every edit, new row and deletion waits for `saveChanges()`; then the deletions, the updates and the new rows go out, each kind in one call, and rows the server turns down keep their marks. Here over a server that loads by page: the changes stay while the pages turn, and the page's own buttons follow `hasChanges`." />
        </p>
        <Example files={[...withOrders('BatchSave.tsx', 'order-service.ts'), slowAdapterFile]} stack>
          <BatchSave />
        </Example>
      </Section>

      <Section anchor="new-rows" title="New rows">
        <p>
          <Rich text="`addRow()` or the toolbar's “New row” opens a row at the bottom (the grid goes to the very end; in a virtual list only the last block is loaded) or at the top, with its first cell a new row can fill in edit mode. Tab on the last cell of a new row saves it and opens the next one; Escape drops it; one left untouched goes by itself." />
        </p>
        <Example files={withOrders('NewRows.tsx')} stack>
          <NewRows />
        </Example>
      </Section>

      <Section anchor="actions" title="Row actions">
        <p>
          <Rich text="`actions` gives each row its buttons, as a list or as a function of the row and its state (`isNew`, `isEditing`, `isDirty`, `isSaving`, `hasError`, `isRemoved`, `isSelected`); when what the function reads changes, the row's buttons change. The grid's ready actions are named by strings. The buttons that do not fit the column go into the “more” menu, the first ones in the list stay. The column sits at the start or the end, pinned to its edge or scrolling with the rows." />
        </p>
        <Example files={withOrders('RowActions.tsx')} stack>
          <RowActions />
        </Example>
      </Section>

      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selection` is `single` (the selection follows the active row) or `multiple`, with a check box column. A click selects a row, Ctrl adds or takes out, Shift selects a range; Shift+Space, Shift+arrows and Ctrl+A do it from the keyboard. The header check box selects every row of the filter — on a server too: the grid keeps a state, “all but these keys”, never the rows. `selection` gives that state, `selectionFilter` the same as a filter for the server." />
        </p>
        <Example files={[...withOrders('Selection.tsx'), slowAdapterFile]} stack>
          <Selection />
        </Example>
      </Section>

      <Section anchor="filters" title="Filters">
        <p>
          <Rich text="The filter row has a cell per column: a condition chosen in the cell, by the column type (contains, starts with, =, <, between, empty…), and the kit's field for the value; typing applies after a short pause. The header filter lists the column's values with their counts, honoring the other filters: rows in memory are counted by the grid, an adapter that groups is asked with `group`, any other server answers `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), together with AND." />
        </p>
        <Example files={[...withOrders('Filters.tsx'), slowAdapterFile]} stack>
          <Filters />
        </Example>
      </Section>

      <Section anchor="search" title="Search panel">
        <p>
          <Rich text="`searchPanel` puts a search box in the toolbar: its text is looked for in every searchable column at once, after a short typing pause. Each column reads it by its type — text columns contain it (without case, in the locale), number, date and yes/no columns match it when it reads as one of their values, list columns by their option texts — and the columns are joined with OR, then with the filter row and the header filter with AND. A text no column can read leaves no row. The filter goes to the data source like any other (`data.where`, `data.or`), so a server runs it; what was found is marked in the cells. `searchText` binds the text both ways with `onSearchTextChanged`; `searchByText()` searches from code." />
        </p>
        <p>
          <Rich text="A lookup column is searched by its texts: the lookup source — here a customers service apart from the sales' server — is asked for the items whose text holds the search (at most `searchLimit`), and their keys go to the rows' server as `customerId in [...]`. A column with a `textFrom` field searches that field of the row instead." />
        </p>
        <Example files={[...code('Search.tsx', 'customers.ts', 'orders.ts', 'order.ts'), slowAdapterFile]} stack>
          <Search />
        </Example>
      </Section>

      <Section anchor="grouping" title="Grouping">
        <p>
          <Rich text="Rows are grouped by one column or several: a row per group shows “Column: value (count)” — a lookup column its text, rows in memory the column's format — with an arrow that opens and closes it, and the groups below it moved in. Grouped columns leave the columns unless `showWhenGrouped`. `groupIndex` on the columns groups at the start; `groupPanel` puts the panel at the start of the toolbar, where a header dropped groups by its column; a chip turns the order of its groups when clicked, moves along the panel and, dragged back onto the headers, ungroups the column where it lands. The column menu does the same from the keyboard. A sort sorts the rows inside the groups; the header of a grouped column, like its chip, sorts its groups; `calculateGroupValue` groups by a value of its own. Paged, the pages count group rows and data rows; a closed group is one row." />
        </p>
        <Example files={withOrders('Grouping.tsx')} stack>
          <Grouping />
        </Example>
        <p>
          <Rich text="On a server: a `DataSource` that loads by `blocks` over an adapter that groups is asked only for the groups with their counts (`loadGroups`, `group` with `groupsOnly`); the rows come in group order, in blocks, only for the open groups where the list looks — here the groups start closed (`autoExpandGroup: false`). An adapter that cannot group (OData, REST), a source that loads by page, or a `calculateGroupValue` function gets every matching row, grouped in the browser without remote grouping. Filters, the search and selection work over the groups; “select all” stays every row of the filter. The CSV export writes a “Column: value” line before each group; `group` is kept with the layout." />
        </p>
        <Example files={[...withOrders('GroupingServer.tsx'), slowAdapterFile]} stack>
          <GroupingServer />
        </Example>
      </Section>

      <Section anchor="summaries" title="Summaries">
        <p>
          <Rich text="`summary` gives values of the rows under the filter and the search: `totalItems` in a row of totals under the rows — it stays at the bottom while the rows scroll and moves sideways with the columns — and `groupItems` for each group: after the group row's count, under their column in the group row (`alignByColumn`), or in a footer row after the group's rows (`showInGroupFooter`). An item aggregates a `column` (its `value` reader too) with `summaryType` `sum`, `min`, `max`, `avg`, `count` or `custom`, shows under `showInColumn` (else its column), several in one column one under the other, and its text is `displayFormat` (`{0}` the value, `{1}` the column) or a text of `summary.texts` and `uiLocale`, formatted by `valueFormat` (`Intl` options or a function; else the column's format), or `customizeText`. A `custom` item goes through `calculateCustomSummary` in three steps: `start`, `calculate` per row, `finalize`. Empty values are left out (`skipEmptyValues`; `count` counts every row). Unsaved edits count once saved, or as they are made with `recalculateWhileEditing`. `getTotalSummaryValue(name)` and `getGroupSummaryValue(key, name)` read the values; `onSummaryChanged` tells when they are worked out again; the CSV and `exportRows()` write the footers and the totals." />
        </p>
        <Example files={withOrders('Summaries.tsx')} stack>
          <Summaries />
        </Example>
        <p>
          <Rich text="On a server: a source that loads pages or blocks asks its adapter for the totals of the query when the adapter has the `summary` capability (`remoteSummary`; `DataSource.loadSummary`), and asks for the group summaries with the groups when it groups (`loadGroups` with `groupSummary`). Here the made-up server does both: one request for the totals, one for the groups, whatever the list shows. An adapter without it, a `custom` item or a computed column get every matching row, loaded once per row set (`groupLoadPageSize` a request), and the values are worked out in the browser; group summaries only the browser can work out group the rows in the browser too." />
        </p>
        <Example files={[...withOrders('SummariesServer.tsx'), slowAdapterFile]} stack>
          <SummariesServer />
        </Example>
        <ApiTable
          head={['Field', 'What it does']}
          rows={[
            ['totalItems, groupItems', 'The items of the row of totals and of each group; a function is followed.'],
            ['calculateCustomSummary', '`(e) => void` with `{ name, summaryProcess, value, totalValue, groupIndex, component }`: one function for every `custom` item; set `e.totalValue` at `start`, fold `e.value` (the column’s value, or the row without a column) into it at each `calculate`, adjust it at `finalize`.'],
            ['recalculateWhileEditing', '`false`: the values follow unsaved edits, new rows and rows marked for deletion. Off, they change once the changes are saved.'],
            ['skipEmptyValues', '`true`: empty values (`null`, `undefined`, `\'\'`) are left out of what the browser works out; off, `sum` and `avg` count them as 0. An item can set its own.'],
            ['texts', 'The item texts by type: `sum`, `sumOtherColumn`, `min`, `minOtherColumn`, `max`, `maxOtherColumn`, `avg`, `avgOtherColumn`, `count`; over the `gridSummary…` texts of `uiLocale` and the grid’s `texts`.'],
          ]}
        />
        <ApiTable
          head={['Item field', 'What it does']}
          rows={[
            ['column', 'The column aggregated. Without one, `count` counts rows and `custom` gets the rows themselves.'],
            ['summaryType', "`'sum' | 'min' | 'max' | 'avg' | 'count' | 'custom'`, default `'count'`."],
            ['name', 'Names the item for `getTotalSummaryValue` and `calculateCustomSummary`.'],
            ['showInColumn', 'The column the item shows under (default: `column`); away from its column the text names the column (“Sum of Amount: …”).'],
            ['valueFormat', '`Intl.NumberFormatOptions`, `Intl.DateTimeFormatOptions` or `(value) => string`; default: the column’s format (`count`: a plain number).'],
            ['displayFormat, customizeText', 'The text, `{0}` the formatted value and `{1}` the column’s title; `({ value, valueText }) => string` wins over it.'],
            ['alignment, cssClass', "`'start' | 'center' | 'end'` (default: the column's); a class of your own on the item."],
            ['skipEmptyValues', 'Leave empty values out for this item; default `summary.skipEmptyValues`.'],
            ['visible', 'Show the item; default the `totalSummary` (`groupSummary`) setting.'],
            ['showInGroupFooter, alignByColumn', 'Group items: in the group footer; under their column in the group row, not under the first column, which holds the text.'],
          ]}
        />
      </Section>

      <Section anchor="toolbar" title="Toolbar">
        <p>
          <Rich text="The bar above the rows holds the grid's own items whose features are on, at the end, in this order: “New row” (`addRows`, `newRowButton`), “Save changes” and “Discard” (batch mode, `saveButtons`), “Export” (`exportButton`), the column list (`columnChooserButton`) and the search box (`searchPanel`); with none of them it does not show. `toolbar.items` lists exactly what it holds: the grid's items by name, an object with a `name` to change one of them, and items of your own — a button with `text`, `icon`, `hint` and `click`, or any component with `content` — at the start (`location: 'before'`) or at the end. Buttons that do not fit go into its “more” menu (`overflow`); the grid's own show only their icons there (`showText`), and their texts in the menu." />
        </p>
        <Example files={withOrders('Toolbar.tsx')} stack>
          <Toolbar />
        </Example>
        <ApiTable
          head={['Item field', 'What it does']}
          rows={[
            ['name', 'One of the grid’s items (`groupPanel`, `searchPanel`, `addRowButton`, `saveButton`, `revertButton`, `exportButton`, `columnChooserButton`) to change, or a name of your own. A grid item whose feature is off stays out.'],
            ['location', "`'before'` or `'after'` (default; the group panel `'before'`): which end of the bar."],
            ['text, icon, hint', 'The button’s text, icon and tooltip (default: the text when only the icon shows).'],
            ['showText', "`'always'` (default) or `'inMenu'`: only the icon in the bar, the text in the “more” menu (the grid’s own buttons)."],
            ['visible, enabled', 'Leave the item out; dim it.'],
            ['overflow', "`'never'` (default; the grid’s buttons `'auto'`), `'auto'` or `'always'`: whether it may go into the “more” menu."],
            ['content', '`() => component`: your own component in place of a button, made once.'],
            ['click', '`(e) => void` with `{ item, grid, event }`; on a grid item it replaces what the item does.'],
          ]}
        />
      </Section>

      <Section anchor="clipboard" title="Copy and paste">
        <p>
          <Rich text="Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table: a spreadsheet or a document takes it as a table. Ctrl+V on a cell writes tab-separated text — from a spreadsheet, or copied here — into the editable cells from that cell rightwards and downwards. Each value is read by the column type (numbers and dates in the locale, yes or no, a list option by its text) and goes into the row's draft with its checks, as if typed; cells that cannot be edited keep their values. The rows below the active one are saved as the save mode says." />
        </p>
        <Example files={withOrders('Clipboard.tsx')} stack>
          <Clipboard />
        </Example>
      </Section>

      <Section anchor="export" title="Export">
        <p>
          <Rich text="`exportCsv()` saves the rows of the filter, in the sort order, with the visible columns in their order, as a CSV file a spreadsheet opens as it is: UTF-8 with a byte order mark, the locale's separator (`;` where decimals take a comma), the column titles first, and text that would run as a formula made harmless. `exportRows()` gives the same rows as objects. Rows in memory are taken as they are; a server's are asked for in parts through the data source, so its filter, search and sort apply and nothing on the screen changes. `exportButton` puts an “Export” button in the toolbar; `exportable` takes a column out." />
        </p>
        <Example files={[...withOrders('Export.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Export />
        </Example>
      </Section>

      <Section anchor="lookups" title="Lookup columns">
        <p>
          <Rich text="A column with `lookup` keeps a key (a customer id) and shows the text of its item, from a `DataSource` of any adapter — another service, another protocol than the rows — or from an array. Only the keys on the screen are asked for: the unknown ones of a moment go out together (`id in [...]`, at most `batchSize` each), or one by one with `resolve: 'byKey'` for a service that gives one item by key. The texts are kept per source and shared by every column and grid using it. While a key loads its cell is empty and busy; a key the source does not have shows as it is, muted, and stops its row from being saved." />
        </p>
        <Example files={[...code('Lookups.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <Lookups />
        </Example>
        <p>
          <Rich text="Editing opens a `DropDown` with search (or `editor: 'combobox'`, or the kit's `Lookup` with columns) over a data source of its own on the same adapter, so its search never moves a source the page shows. Typing on the cell opens the list and searches what was typed; the picked text shows at once. `filter(row)` narrows the list for the row, `setCellValue` writes other fields with the value — here a new province empties the district — and `onEditorPreparing` changes the editor's props: the district waits for a province." />
        </p>
        <Example files={code('Cascade.tsx', 'places.ts')} stack>
          <Cascade />
        </Example>
        <p>
          <Rich text="When the row already brings the text (OData `$expand`), `textFrom` reads it there and the lookup source is asked only to edit and to list; `sortField` sorts the server by it. Without them a lookup column sorts by its key; rows in memory can sort by the text with `sortBy: 'text'`. The filter row offers “(All)” and the texts (always `=`), the header filter the texts with “(empty)” first, both searched by text and, with `syncLookupFilterValues`, holding only the keys of the rows the other filters leave. Copy and export write the text (`raw`: the key); a pasted text becomes the key of the one item that has it." />
        </p>
        <Example files={[...code('TextFrom.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <TextFrom />
        </Example>
        <ApiTable head={['Lookup field', 'What it does']} rows={LOOKUP_FIELDS} />
      </Section>

      <Section anchor="layout" title="Keeping the layout">
        <p>
          <Rich text="With `layoutKey` the grid keeps the column widths, order, hidden and pinned columns, the sort, the filters and the search text in the browser's `localStorage`, and a grid made again with the same name — after a reload too — gets them back. Storage that is full or blocked is skipped quietly. `resetLayout()` (also in the column menu) goes back to the column definitions. To keep the layout elsewhere, a server for instance, read `layout` and `filters`, listen to `onLayoutChange`, and give them back through the props of the same names." />
        </p>
        <Example files={withOrders('KeepLayout.tsx')} stack>
          <KeepLayout />
        </Example>
      </Section>

      <Section anchor="settings" title="Turning features off">
        <p>
          <Rich text="Every feature has a switch in `settings`, each a value or a function; a column can turn one on or off for itself, and its value wins. `grid.settings` and `grid.columnSettings(field)` change them while the grid shows." />
        </p>
        <Example files={withOrders('Switches.tsx')} stack>
          <Switches />
        </Example>
        <ApiTable head={['Setting', 'Default', 'What it does']} rows={SETTINGS} />
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="Every action of the user has an event, given as a prop or listened to with `grid.onX((e) => …)`; one that is about to happen (`…ing`) can be stopped with `e.cancel = true`, and most can change what happens (the values sent, the items of a menu, the text copied). Here amounts over 900 are drawn in bold, the rows get a menu of their own (right click, or Shift + F10), a change to “Cancelled” is not saved, and the list tells what happened. Methods do the same from code: `editCell`, `cellValue`, `navigateToRow`, `columnOption`, `state()` and the others in the API reference." />
        </p>
        <Example files={withOrders('Events.tsx')} stack>
          <Events />
        </Example>
        <ApiTable head={['Event', 'Gets', 'Cancel', 'When']} rows={EVENTS} />
      </Section>

      <Section anchor="columns" title="Columns">
        <ApiTable head={['Field', 'What it does']} rows={COLUMN_FIELDS} />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Every text the grid writes — the toolbar, the search box, the bar, the pager, the column menu, the row states, the action buttons, the filter conditions, the summary texts (`gridSummarySum`, `gridSummarySumOtherColumn`, … `gridSummaryCount`, `gridSummarySeparator`, `gridTotalSummary`), the announcements — comes from `uiLocale.strings` (the `grid…` keys), or from the grid's own `texts`. Numbers and dates follow `locale`." />
        </p>
        <Example files={withOrders('Localization.tsx')} stack>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <p>
          <Rich text="The rows and their saving are the data layer's: `grid.dataSource` and `grid.changeTracker` are a `DataSource` and a `ChangeTracker` of `@motifx-community/data`, with their own events (`onChanged`)." />
        </p>
      </Section>
    </>
  );
}

