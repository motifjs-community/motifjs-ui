import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { withOrders } from './code';
import Localization from './examples/Localization';

const PROPS = [
  ['columns', '`(GridColumn<T> | GridBand<T>)[]`', '—', 'The column definitions, in their first order, and bands over them (`{ title, columns }`). See Columns below and [Band headers](/datagrid/bands#bands).'],
  ['adaptiveDetail', '`GridAdaptiveDetail`, each field a `Bind`', '`{ colCount: 2 }`', 'The row’s adaptive detail while columns hide to fit the width (`settings.columnHidingEnabled`, `hidingPriority`): `colCount`, `minColWidth`, `labelMode`, `editors`, `expandOnEdit`, `columnWidth`, `toggleKeys`. Live through `grid.adaptiveDetail`. See [Adaptive columns](/datagrid/bands#adaptive).'],
  ['onAdaptiveDetailRowPreparing, onAdaptiveDetailRowExpanding / Expanded, onAdaptiveDetailRowCollapsing / Collapsed', '`(e) => void`', '—', 'A row’s adaptive detail lays out its form (`e.formOptions`); it is about to open or close (`e.cancel`), and did.'],
  ['rows', '`Bind<T[]>`', '—', 'Rows in memory. The grid puts them in a `DataSource` over an `ArrayAdapter`: `push`, `splice` and a new array are followed; saved edits, new rows and deletions go into the array.'],
  ['dataSource', '`Bind<DataSource | null>`', '—', 'Rows of the data layer, from any adapter. Loading by `blocks` makes a virtual list that asks only where it looks; by `page` a paged grid. Wins over `rows`.'],
  ['rowKey', '`string | (row) => unknown`', '—', 'The identity of `rows`. A data source uses its adapter’s key.'],
  ['mode', "`Bind<'virtual' | 'paged' | 'infinite'>`", "`'virtual'`", 'One long list, pages with a pager, or parts that load as the list nears its end (see [Scrolling](/datagrid/scrolling#modes)). A source that loads by page is always paged.'],
  ['onMoreRowsLoading / onMoreRowsLoaded', '`(e) => void`', '—', 'Infinite mode: before the next part of the rows loads (`{ skip, take }`, `e.cancel` keeps the rows as they are), and when it came (`{ skip, count, ended }`).'],
  ['pageSize', '`Bind<number>`', '`100`', 'Rows per page for rows in memory (0: every row on one page); a source that loads pages or blocks uses its own. The pager’s page sizes (`pageSizeSelector`) and `pageSize(n)` change it; the size the user chose is kept with the layout.'],
  ['onPageSizeChanging / onPageSizeChanged', '`(e) => void`', '—', 'Before and after the rows per page change: `{ pageSize, previous }` (0: all); `e.cancel = true` keeps them.'],
  ['saveMode', "`Bind<'wait' | 'background' | 'batch'>`", "`'wait'`", 'When changes are sent: see [Save modes](/datagrid/editing#editing). Changing it starts again with the data (unsaved changes go).'],
  ['newRow', '`{ position?: Bind<\'top\' | \'bottom\'>, create?: () => Partial<T> }`', 'bottom', 'Where new rows open and what they start with.'],
  ['validateRow', '`(row, { isNew, changed }) => messages | string | null`', '—', 'Checks a whole row before it is saved: a message per field, or one for the row.'],
  ['form / popup', '`GridEditForm` / `GridEditPopup`, each field a `Bind`', '`{ colCount: 2 }` / —', "The edit form of `editMode` `'form'` and `'popup'` (items, columns, labels) and its window (title, size, buttons). Live through `grid.form` and `grid.popup`. See [Edit forms and popups](/datagrid/forms#forms)."],
  ['settings', '`GridSettingsProps`', '—', 'The feature switches below, each a value or a function.'],
  ['sort / layout', '`SortItem[]` / `GridLayout`', '—', 'The first sort order; a saved layout (columns, sort and `group`).'],
  ['onLayoutChange', '`(layout) => void`', '—', 'After the user resized, moved, hid, pinned or sorted.'],
  ['layoutKey', '`string`', '—', 'Keeps the layout, the filters and the search text in the browser’s `localStorage` under this name; a grid made again with it gets them back.'],
  ['layoutStorage', '`{ getItem, setItem, removeItem }`', '`localStorage`', 'Where `layoutKey` keeps them: `sessionStorage`, or a store of your own.'],
  ['on…', '`(e) => void`', '—', 'Every event of the [Events table](/datagrid/layout#events), by its name (`onCellClick`, `onRowUpdating` …); `grid.onCellClick(fn)` listens the same way.'],
  ['label', '`Bind<string>`', '`uiLocale` “Data grid”', 'The accessible name. The same as `text`.'],
  ['texts / locale', '`Bind<Partial<UiStrings>>` / `Bind<string>`', '— / page language', 'Texts of this grid only; the locale of numbers, dates and sorting.'],
  ['rowHeight', '`Bind<number>`', 'from CSS', 'A fixed row height; by default the density decides.'],
  ['actions', '`GridActionItem[] | (row, state) => GridActionItem[]`', '—', 'The buttons of each row: actions, or the names of the ready ones (`edit`, `remove`, `restore`, `save`, `cancel`). A function is followed per row.'],
  ['selectedKeys / onSelectionChanged', '`Bind<unknown[]>` / `(e) => void`', '—', 'Keys of the selected rows (a function is followed); told after every change of the selection (`e.byDrag` while rows are selected by dragging).'],
  ['cellRanges / onCellSelectionChanging / onCellSelectionChanged', '`Bind<GridCellRange[]>` / `(e) => void`', '—', 'The cell ranges (`settings.cellSelection`; a function is followed); asked before a change (`e.cancel`) and told after it (`e.byDrag` while one is drawn). See [Selecting by dragging](/datagrid/drag-select#cells).'],
  ['filters', '`GridFilters`', '—', 'The first filters, by field: `{ city: { op: \'=\', value: \'Ankara\' }, status: { values: [\'Draft\'] } }`.'],
  ['filterValue, filterEnabled', '`Bind<data.FilterExpression | null>`, `Bind<boolean>`', '`null`, `true`', 'The filter value the filter panel shows and the builder edits (with `filterSyncEnabled`, the filter row\'s and header filters\' too) and whether it applies; functions are followed, the user\'s changes come in `onFilterChanged`. See [Filter panel and builder](/datagrid/filtering#filter-panel).'],
  ['filterPanelText, filterBuilder, filterBuilderPopup', 'function, objects', '—', 'The panel\'s text; the builder\'s props (any of `FilterBuilder` but `value` and `fields`); its window (`title`, `width`, `height`, …).'],
  ['onFilterBuilderOpening / Opened / Closing / Closed', '`(e) => void`', '—', 'The builder\'s window opens and closes; the `…ing` ones cancel (`e.apply` says whether OK was pressed).'],
  ['searchText / onSearchTextChanged', '`Bind<string>` / `(e) => void`', '`\'\'`','The search panel’s text (a function is followed); told when it changes, typed or set from code (`{ text }`). The two together bind it both ways.'],
  ['toolbar', '`{ visible?: Bind<boolean>, items?: Bind<(GridToolbarItem | GridToolbarItemName)[]> }`', 'the items whose features are on', 'The bar above the rows: which items, in which order and place; `visible` left out shows it while it has an item.'],
  ['export', '`{ formats?, allowExportSelectedData?, texts? }`, each a `Bind`', "`{ formats: ['csv'] }`", 'What the toolbar’s export button (`exportButton`) offers: a command per format (`\'xlsx\'`, `\'csv\'`, any of your own), and “Export selected rows” for each with `allowExportSelectedData`; one command is a plain button, more a menu. `texts`: `exportTo`, `exportAll`, `exportSelectedRows` (`{format}` is the format’s name), `formats` (names by code). Live through `grid.export`.'],
  ['onRowExpanding / onRowExpanded', '`(e) => void`', '—', "Before and after a group or a row's details open: `{ kind, key, row }` — `kind: 'group'` with the values of the groups from the top level down, or `kind: 'detail'` with the row's key and the row; `e.cancel = true` keeps it closed."],
  ['onRowCollapsing / onRowCollapsed', '`(e) => void`', '—', "Before and after a group or a row's details close; `e.cancel = true` keeps it open."],
  ['masterDetail', '`GridMasterDetail<T>`, each field a `Bind`', '`{ enabled: false }`', 'Details under the rows: the expand column (`enabled`), what they hold (`template`), `autoExpandAll`, `canExpand`, `keepDetails`, `keepLimit`, `height`, `estimatedHeight`, `columnWidth`, `toggleKeys`, `arrowKeys`. Live through `grid.masterDetail`. See [Master-detail](/datagrid/master-detail#master-detail).'],
  ['onGroupingChanging / onGroupingChanged', '`(e) => void`', '—', 'Before and after the grouping changes, by the user or from code: `{ group, previous, byUser }`; `e.cancel = true` keeps it.'],
  ['onGroupDropping', '`(e) => void`', '—', 'A header or a chip dropped to change the grouping: `{ field, from, to, index }`; `e.cancel = true` cancels the drop.'],
  ['groupCell', '`(ctx) => component`', '—', 'Content of your own in the group rows of columns without a `groupCell`.'],
  ['summary', '`Bind<GridSummary>`', '—', 'The summaries: `totalItems` in the row under the rows, `groupItems` in group rows and footers, and how they are worked out. See [Summaries](/datagrid/grouping#summaries).'],
  ['onSummaryChanged', '`(e) => void`', '—', 'The summary values were worked out again: `{ total, editing }`.'],
  ['loadValues', '`(request) => { values, total }`', '—', 'The values of a header filter from a server that cannot group: `{ column, search, filter, skip, take, signal }`.'],
  ['onEditorPrepared / onRowValidating', '`(e) => void`', '—', 'An editor was made, in a cell or the edit form; a row is checked before it is saved (add messages, or `isValid = false`). See [Events and methods](/datagrid/forms#form-api).'],
  ['onEditorPreparing', '`(e) => void`', '—', 'Before a cell editor is made: `{ field, row, isNew, options, cancel }`. Change `e.options`, the editor’s props (`enabled = false` disables it), or set `e.cancel`.'],
  ['enabled / disabled, visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const COLUMN_FIELDS = [
  ['field, title', 'The value’s key (a dotted path reads a nested value) and the header text (`Bind<string>`).'],
  ['type', '`text`, `number`, `date`, `boolean`, `list`: alignment, format, sorting and the editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`).'],
  ['width, minWidth, maxWidth, flex', 'Pixels (default: the `columnWidth` and `columnMinWidth` settings); `flex` shares the free space until the user resizes.'],
  ['sticky, hidden, align', 'Pinned to an edge (a column in a band sticks with its band); hidden at first; the alignment.'],
  ['ownerBand, hidingPriority', 'The band a column given flat sits in (its `name` or place); its place in the order columns hide in to fit the width, the lowest first.'],
  ['value, format, compare', 'Read the value another way; show it another way — `Intl` options for a number or date column (`{ style: \'currency\', currency: \'EUR\' }`, which an Excel export turns into the number format too) or a function that writes the text; sort it another way (rows in memory).'],
  ['cell', '`(ctx) => component`: content of your own, made once per pooled cell; read `ctx.row` and `ctx.value` in getters.'],
  ['editor', '`(ctx) => Field | component`: an editor of your own. A `Field` is read through its value; anything else calls `ctx.setValue`.'],
  ['required, validate, options', 'An empty value is not taken; `(value, row) => message`; the choices of a list (an array, or a function of the row, also async).'],
  ['validationRules', 'the standard grid’s rule set (`required`, `numeric`, `range`, `stringLength`, `pattern`, `email`, `compare`, `custom`, `async`), checked after `required` and `validate`. See [Validation rules](/datagrid/forms#rules).'],
  ['formItem', 'The column in the edit form: `visible`, `colSpan`, `label`, `helpText`, `editorOptions`, `order`.'],
  ['filterOperators, filterOperator', 'The conditions the filter row offers for the column, and the one it starts with.'],
  ['headerFilterInterval', '`Bind<number | number[] | \'year\' | \'quarter\' | \'month\' | \'day\' | \'hour\' | \'minute\' | \'second\' | null>`: how the header filter groups the values. A number column in ranges of that size (“0 – 100”; several sizes make a tree), a date column in a tree of its parts down to that one (default: the `headerFilterDateInterval` setting, `day`); `null` lists every value. A range picked filters with `>=` its start and `<` its end. See [Ranges, dates and entries](/datagrid/filtering#intervals).'],
  ['headerFilterItems', '`{ text, value, count? }[]` or `(request) => items`: the header filter’s entries instead of the values; a value may be a filter expression. The function gets `{ column, filter, signal, values() }` — `values()` gives the values it would list.'],
  ['filterValues, filterType', '`Bind<unknown[]>`, `Bind<\'include\' | \'exclude\'>`: the values chosen in the header filter, and whether they keep the rows or leave them out. A function is followed; `grid.filters` holds them as `values` and `filterType`.'],
  ['lookup', '`GridLookup`: the cell keeps a key and shows the text of its item from another source (see [Lookup columns](/datagrid/lookups#lookups)). `type` still decides the alignment.'],
  ['textFrom, sortField', 'The text of a lookup cell read from the row (`\'customer.name\'` or `(row) => text`): the source is then asked only to edit and to list. The field a server sorts the column by.'],
  ['setCellValue', '`(values, value, row) => void | Promise`: called when the user commits a value (editor, paste, Delete), before it is written. `values` starts as `{ [field]: value }`; add fields to write them too. A promise keeps the cell busy until it settles.'],
  ['editable, creatable, sortable, resizable, movable, hideable, pinnable, menu, filterRow, headerFilter, filterBuilder, copyable, exportable, syncLookupFilterValues, searchable', 'Switch a feature for this column; wins over `settings`.'],
  ['resizeMode', 'How this column’s edge is dragged (`widget` or `nextColumn`); wins over `settings`.'],
  ['columnRenderingMode', '`standard`: the column keeps its cells out of view; `virtual`: it gets them only in view (see [Virtual columns](/datagrid/scrolling#virtual-columns)); wins over `settings`.'],
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

const PROPERTIES = [
  ['settings', 'read/write, live', '`grid.settings.striped = true`, or a function that is followed.'],
  ['columnSettings(field)', 'read/write, live', 'One column’s own switches; `undefined` follows `settings` again.'],
  ['dataSource, changeTracker', 'read-only', 'The `DataSource` the rows come from and the `ChangeTracker` of their unsaved changes: listen to them like any other.'],
  ['total, loading, pageCount', 'read-only, reactive', 'Rows, the first load running, pages (as `totalCount()` and the standard grid’s `pageCount()`).'],
  ['sort, page, layout', 'read/write', 'Assign to change them.'],
  ['hasChanges, changes, errorCount', 'read-only, reactive', 'Unsaved changes (`{ added, updated, removed, count }`) and rows with errors.'],
  ['activeRow, activeField', 'read-only', 'The row and the field of the active cell.'],
  ['actions', 'read-only', 'The ready actions: `edit`, `remove`, `restore`, `save`, `cancel`.'],
  ['actionTargets, barActions', 'read-only, reactive', 'The rows the toolbar’s and the bottom bar’s actions act on, and the actions they show: see [Row actions](/datagrid/editing#actions).'],
  ['selection, selectedCount', 'read-only, reactive', 'The selection as a state (`{ all, keys, except, filter }`) and how many rows it holds.'],
  ['selectedKeys, selectedRows', 'read/write, read-only', 'Keys and rows of the selected rows that are known (loaded); assign keys to select them.'],
  ['cellRanges, cellSelectionSummary', 'read/write, read-only; reactive', 'The cell ranges by row key and field (assign to set them); the count, sum, average, smallest and largest of their cells.'],
  ['selectionFilter', 'read-only', 'The selection as a filter of the data layer, for work on the server.'],
  ['filters, filter', 'read/write, read-only', 'The filters by field; the whole filter the rows are loaded with (the search included).'],
  ['filterValue, filterEnabled, filterText', 'read/write, read/write, read-only; reactive', 'The filter value (assigning shares its conditions out to the filter row and header filters with sync), whether it applies, and the panel\'s text.'],
  ['filterBuilder, filterBuilderPopup', 'read/write, live', '`grid.filterBuilder.maxGroupLevel = 1`, `grid.filterBuilderPopup.width = \'50rem\'`; `filterBuilderInstance` is the open builder.'],
  ['searchText', 'read/write, reactive', 'The search text; assigning searches at once, a function is followed.'],
  ['group', 'read/write, reactive', 'The grouped columns in order with the order of their groups (`[{ field, dir }]`); assign to group, `[]` ungroups.'],
  ['summary', 'read/write, reactive', 'The summaries as they read now; assign a new one, or a function that is followed.'],
  ['summaryStatus', 'read-only, reactive', '`\'loading\'` while a server works out the totals (or every row loads for them), `\'error\'` when that failed, else `\'ready\'`.'],
  ['onRowExpanding, onRowExpanded, onRowCollapsing, onRowCollapsed, onGroupingChanging, onGroupingChanged, onGroupDropping', 'event', 'Subscribe with `grid.onRowExpanded((e) => …)`; the same as the props.'],
  ['form, popup', 'read/write, live', "`grid.form.colCount = 3`, `grid.popup.title = 'Order'`; a function is followed."],
  ['masterDetail', 'read/write, live', '`grid.masterDetail.enabled = true`; a function is followed.'],
  ['adaptiveDetail, adaptiveHiddenColumns', 'read/write, live; read-only, reactive', '`grid.adaptiveDetail.colCount = 1`; the columns the width hides now.'],
  ['toolbar', 'read/write, live', '`grid.toolbar.items = [\'searchPanel\', { text: \'Refresh\', click }]`, `grid.toolbar.visible = false`; a function is followed.'],
  ['export', 'read/write, live', '`grid.export.formats = [\'xlsx\', \'csv\']`, `grid.export.allowExportSelectedData = true`; a function is followed.'],
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
  ['deleteRows(rows)', '`Promise<boolean>`', 'Deletes several rows in one save (one request when the adapter saves in batches), asking once with `confirmDelete`; `false` when a row failed or the user said no.'],
  ['saveChanges() / discardChanges()', '`Promise<{ saved, failed }>` / `void`', 'Sends every unsaved change; drops them all.'],
  ['goToNextError()', '`boolean`', 'Moves to the next row that failed or has a message.'],
  ['runAction(id, rows?) / stopAction()', '`Promise<ran | null>` / `void`', 'Runs an action on rows (default: the rows the bars act on) as a press does; stops the one working on several rows.'],
  ['refresh() / retry()', '`void`', 'Loads again keeping the position (the lookup texts too); loads what failed again.'],
  ['refreshLookups()', '`void`', 'Forgets the texts of the lookup columns and asks for the ones on the screen again.'],
  ['scrollToIndex(i, align?)', '`void`', 'Brings a row into view (in paged mode: its page).'],
  ['autoSizeColumns() / resetLayout() / focus()', '', 'Fits the columns; back to the definitions; focuses the active cell.'],
  ['selectRow(row, add?) / deselectRow(row) / isSelected(row)', '', 'One row in or out of the selection.'],
  ['selectAll() / clearSelection()', '', 'Every row of the filter, loaded or not; none.'],
  ['clearFilters()', '', 'Takes every filter away, the filter value too, and the search text.'],
  ['openFilterBuilder() / closeFilterBuilder(apply?) / clearFilterValue()', '`boolean` / `boolean` / `void`', 'The filter panel\'s builder window and its Clear, from code.'],
  ['searchByText(text)', '`void`', 'Searches for a text at once, as the search panel does; `\'\'` stops searching.'],
  ['showColumnChooser()', '`void`', 'Opens the column list, under the toolbar’s column button when it shows.'],
  ['expandAll(level?) / collapseAll(level?)', '`void`', 'Opens or closes every group of a level (0 is the top level), or of every level.'],
  ['expandGroup(key) / collapseGroup(key) / isGroupExpanded(key)', '`boolean`', 'One group by its key, the values from the top level down (`[\'Ankara\', \'Draft\']`): whether it opened or closed, and whether it is open.'],
  ['expandRow(key) / collapseRow(key) / isRowExpanded(key)', '`boolean`', "A row's details by the row's key (`masterDetail`): whether they opened or closed (the row events come and can cancel), and whether they are open."],
  ['expandAllRows() / collapseAllRows()', '`void`', "Every row's details open or close at once, without row events."],
  ['expandAdaptiveDetailRow(key) / collapseAdaptiveDetailRow() / isAdaptiveDetailRowExpanded(key)', '`boolean`', "A row's adaptive detail by the row's key: whether it opened (the one open closes first) or closed, and whether it is open."],
  ['clearGrouping()', '`void`', 'Takes every grouping away.'],
  ['groupBy(field, index?, dir?) / ungroup(field) / setGroupOrder(field, dir)', '`void`', 'Groups by a column at a place among the grouped ones (a grouped one moves); takes one out; sets the order of its groups.'],
  ['copy() / paste(text)', '`string` / `number`', 'What Ctrl+C and Ctrl+V do: copies the cell ranges, the selected rows or the active cell (returns the text); pastes tab-separated text from the active cell or the last range’s first cell, one value into every cell of the ranges (returns the cells written).'],
  ['selectCells(from, to?, add?) / clearCellSelection() / getSelectedCellValues()', '`boolean` / `void` / `GridCellValue<T>[]`', 'A range from cell to cell (`{ key or rowIndex, field }`), alone or after the others; none; the selected cells of the loaded rows with their values.'],
  ['exportRows(options?)', '`Promise<object[]>`', 'The rows of the filter in the sort order, by field, with the visible exportable columns: shown text or `raw` values; a server’s rows in parts through the data source. Group footers and the totals come as objects of the same fields (`summaries: false` leaves them out).'],
  ['exportCsv(options?)', '`Promise<string>`', 'The same as a CSV file a spreadsheet opens: byte order mark, the locale’s separator, titles first, a line per group while grouped, group footers after their rows and the totals last. Options: `values`, `selected`, `fileName`, `download`, `separator`, `headers`, `groups`, `summaries`, `bom`, `escapeFormulas`, `pageSize`, `onProgress`, `signal`.'],
  ['exportTo(format, options?)', '`Promise<void>`', 'What a command of the export button does: `csv` runs `exportCsv`; another format raises `onExporting` with that `format` (and `selectedRowsOnly` from `options.selected`), where the app writes the file.'],
  ['exportSheet(options, write)', '`Promise<R>`', 'The rows of an export as a sheet of typed cells (header, group rows, data rows, group footers, totals) handed to `write`: what `exportDataGrid` writes, and what a writer of your own (PDF…) takes. Loads like `exportRows`, with the load panel; no `onExporting`, then `onExported`.'],
  ['cancelExport()', '`void`', 'Stops the export the load panel shows; its promise rejects with an `AbortError`.'],
  ['getTotalSummaryValue(name)', '`unknown`', 'A value of the totals by the item’s `name`, its place in `totalItems`, its type, its column or `type_column` (`\'sum_amount\'`). Reactive.'],
  ['getGroupSummaryValue(key, name)', '`unknown`', 'A value of a group’s summary, the group by its key (as `expandGroup`), the item as above. Reactive.'],
  ['getVisibleRows()', '`GridVisibleRow[]`', 'The rows drawn now: `{ rowIndex, rowType, row, key, groupKey?, element }`.'],
  ['getRowElement(i) / getCellElement(i, field)', '`HTMLElement | undefined`', 'The element of a drawn row or cell.'],
  ['getKeyByRowIndex(i) / getRowIndexByKey(key)', '`unknown` / `number`', 'A row’s key by its index, and the index of a loaded row by its key (-1 when it is not loaded).'],
  ['byKey(key)', '`Promise<T | undefined>`', 'The row with this key: loaded, found before, or asked of the data source.'],
  ['cellValue(i, field, value?)', '`unknown`', 'The value a cell shows; with `value`, writes it as the user would (checked, and saved as the save mode says).'],
  ['navigateToRow(key)', '`Promise<boolean>`', 'Goes to the row with this key (its page in paged mode) and makes it the active row.'],
  ['focusCell(i, field?) / editCell(i, field) / editRow(i) / closeEditCell()', '`boolean`', 'Moves the active cell as the arrows do; opens a cell’s editor, or the first one of a row (in the form modes its form); keeps the open editor’s value and closes it.'],
  ['editRowByKey(key)', '`boolean`', '`editRow` for the row with this key, while it is loaded.'],
  ['saveEditData() / cancelEditData()', '`Promise<boolean>` / `void`', 'Saves or gives up what is being edited, as Save and Cancel do: the edit form, else the row being edited; in batch mode every unsaved change.'],
  ['beginUpdate() / endUpdate()', '`void`', 'Changes from code in between lay the rows out once, at the last `endUpdate()`.'],
  ['repaint()', '`void`', 'Draws the rows on the screen again, without loading (after what a template or `onRowPrepared` reads changed).'],
  ['columnOption(field, name?, value?) / columnOption(field, options)', '`unknown`', 'Reads or writes a column’s `width`, `visible` (`hidden`), `flex`, `sticky`, `visibleIndex`, `sortOrder`, `sortIndex`, `groupIndex`, `filterValues`, `filterType`, a feature switch or any field of its definition (`title`, `format`, `lookup`, `cell`, `type` …: the column is drawn again, its layout, sort and filter kept); without a name, all of them; an object sets several. Each change is told through `onOptionChanged` with the column’s `field`.'],
  ['addColumn(column, index?) / deleteColumn(field)', '`void`', 'A column at run time, at a place among the data columns (default: last; what the kept layout says of it applies), or taken out with its sort, grouping and filter. The layout and the kept layout follow; `onOptionChanged` tells `name: \'columns\'` with the fields before and after.'],
  ['columnCount() / getVisibleColumns()', '`number` / `GridColumn[]`', 'The data columns, the hidden ones too; the definitions of those shown now, in display order.'],
  ['pageIndex(n?) / pageSize(n?) / totalCount()', '`number` / `void`', 'The page shown (with `n`: go there, as `page`; infinite: the last part shown, with `n` the parts up to it load); the rows per page, 0 for all (with `n`: as the pager’s page sizes, back to the first page, `onPageSizeChanging` first); the rows of every page (infinite: −1 until known).'],
  ['loadMore() / loadingMore / endReached', '`boolean`', 'Infinite mode: loads the next part (`onMoreRowsLoading` first); a part is loading; every row shows.'],
  ['getCombinedFilter()', '`FilterExpression | null`', 'The whole filter of the rows: the source’s own, the filter row, the header filters and the search.'],
  ['state() / state(value)', '`GridStateValue` / `void`', 'What the user set up — columns, sort, grouping, filters, search text, page and page size, selected keys, active row — and putting it back.'],
];

const KEYS = [
  ['Arrow keys', 'Move between cells, the headers included. In a right-to-left page Left and Right swap.'],
  ['Home / End, Ctrl + Home / End', 'The first data column / the last column; the first / the last row (only that block is loaded; infinite: the last row shown, and the next part loads).'],
  ['PageUp / PageDown', 'In paged mode the previous / next page (`pageKeys`; on the first and last page, a screen); in a virtual list a screen up or down.'],
  ['Tab in the pager', 'Its buttons one by one: the page sizes, first, previous, the pages, next, last; compact, the page number box (Enter goes there) and the page size list.'],
  ['Enter (header), Shift + Enter', 'Sort; add the column to the sort.'],
  ['Alt + Down, Shift + F10 (header)', 'The column menu; there “Move” and “Width” work with Left and Right, Enter keeps, Escape takes back.'],
  ['Typing, Enter, F2, double-click', 'Edit the cell; typing starts with that character (a lookup cell opens its list and searches it).'],
  ['Space, Delete, Backspace', 'Toggle a check box column; empty the cell; edit from empty.'],
  ['Escape', 'In an editor: close it without the value (a new row goes). On a row: take its edits back.'],
  ['Shift + F10, the context menu key (row)', 'The row’s menu: its actions (the selection’s common ones inside a selection of several rows) and what `onContextMenuPreparing` adds; Escape goes back to the cell.'],
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
  ['Actions', 'Real buttons with the action’s text as their name (also when only the icon shows, with the text as a tooltip); one of them is in the cell’s roving focus; the “more” button has `aria-haspopup="menu"` and is named “More actions for row N”. In the toolbar and the bottom bar a button that acts on several rows is named with the count (“Approve, 3 rows”) and described by what the bar acts on (“Actions for 3 selected rows”), said politely when that changes; nothing there moves focus by itself.'],
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
  ['.mx-data-grid__bar-action, __bar-menu, __bar-actions, __bar-target', 'The actions in the toolbar and the bottom bar (kit buttons, `data-action`), their “Actions” menu button, the bottom bar’s toolbar of them, and the hidden text that says what they act on.'],
  ['.mx-data-grid__select, __check', 'The selection column and its check box (`aria-checked`).'],
  ['.mx-data-grid__row--filter, __filter-cell, __condition', 'The filter row, its cells, the condition button (`data-set`).'],
  ['.mx-data-grid__filter-button, __values', 'The header filter button (`data-active`) and its window.'],
  ['.mx-data-grid__cell, __header-cell', 'A cell (`data-changed`, `aria-invalid`; a lookup cell `data-lookup="loading"` with `aria-busy`, or `"missing"`), a header (`data-sort`, `data-sortable`).'],
  ['.mx-data-grid__editor', 'The editor of the active cell; its field carries `data-in-cell` and is drawn without a frame.'],
  ['.mx-data-grid__expand, __expand-button, __detail-row, __detail-cell', "Master-detail: the expand column's cells and their arrow (`aria-expanded`), a row's details and their one cell (`data-fixed` with a `height` of their own); a row with open details carries `data-expanded`."],
  ['.mx-data-grid__form-row, __form-cell, __form, __form-field, __form-message, __form-buttons, __popup', "The edit form: the row in place of the edited row and its one cell, the form, a column’s field (`data-field`), the row’s message, Save and Cancel; `__popup` is the window of `editMode: 'popup'`."],
  ['.mx-data-grid__toolbar, __toolbar-gap', 'The toolbar above the rows (the kit’s `.mx-toolbar`) and the gap between its `before` and `after` items.'],
  ['.mx-data-grid__add, __save, __revert, __export, __columns, __search', 'The toolbar’s own items: “New row”, “Save changes”, “Discard”, “Export” (busy while it runs), the column list, the search box.'],
  ['.mx-data-grid__mark', 'Text the search found, a `<mark>` in the cell.'],
  ['.mx-data-grid__group-row, __group-cell, __group-toggle, __group-count', 'A group row (`data-expanded`, `--_level`), its cell, its arrow and its count.'],
  ['.mx-data-grid__foot, __total-row', 'The sticky row group under the rows and its row of totals (`data-state="loading"` while a server works them out).'],
  ['.mx-data-grid__summary-cell, __summary-item', 'A cell holding summary items (row of totals, group footer, an aligned item of a group row) and each item in it, with the item’s `cssClass`.'],
  ['.mx-data-grid__group-footer, __group-summary', 'A group footer (`--_level`); the summary text after a group row’s count.'],
  ['.mx-data-grid__group-panel, __chip, __group-empty', 'The group panel (`data-drop` while a header can drop there, `data-locked` without dragging), its chips (`data-dir`, `data-dragging`) and its empty text.'],
  ['.mx-data-grid__bar, __pager', 'The bar under the rows and its pager (a `nav`, `data-look="full"` or `"compact"`).'],
  ['.mx-data-grid__page-sizes, __page-size, __page-size-list, __page-info, __pages, __page, __page-jump, __page-number', 'The pager’s parts: the page size buttons (`aria-pressed`) and their drop-down (compact), the text, the page buttons (`aria-current="page"`), and the page number box (compact).'],
  ['.mx-data-grid__values-tree, __values-all', 'The header filter’s tree of date parts or ranges (the kit’s `TreeView`) and its “Select all” check box.'],
];

const TOKENS = [
  ['datagrid.grid, row, selection, indicator, cell, changed, invalid, placeholder, header-cell', 'Units: the grid, a row (`header`, `band`, `filter`, `total`, `body`, `group`, `group-footer`, `selected`, drag and drop states), the selection\'s frame and mark, a cell and a header in their states, the marks over a cell.'],
  ['datagrid.title, sort, head-button, resize, column-drop, filter-cell, filter, condition, group-*, chip*, toolbar, ghost*, status-*, check*, editor, expand*, drag-*, row-drop, detail-*, adaptive-*, form*, values*, state, note, load-more, export-panel, mark, filter-panel, filter-text, bar, pager*, page-*, tip', 'Units: every other piece, in its states.'],
  ['datagrid.record-height, row-space, cell-inset, icon-size, button-size, resize-hit-width, group-indent, chip-spacing', 'Sizes the layout counts with.'],
  ['datagrid.hover-tint, stripe-tint, active-tint, new-tint', 'The tints over a row (and its cells): under the pointer, every other row, the keys\' row, a new row.'],
  ['datagrid.range-fill, range-fill-opacity, range-selected-fill, range-border-color, range-border-width, range-anchor-fill, row-run-border-color, row-run-border-width', 'Selecting by dragging: the cell ranges\' fill, frame and anchor cell; the frame around the rows a drag selects.'],
  ['datagrid.pinned-edge-width, pinned-edge-color, search-mark-line, search-mark-thickness, search-mark-offset, status-*-mark', 'The edge of the pinned columns, the line under what the search found, the status symbols.'],
];

export default function DataGridApiPage() {
  return (
    <>
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
          <Rich text="The rows and their saving are the data layer's: `grid.dataSource` and `grid.changeTracker` are a `DataSource` and a `ChangeTracker` of `@motifx-community/data`, with their own events (`onChanged`). `changeTracker.removeRows(rows)` and `removeKeys(keys)` delete several rows in one save, as `deleteRows` does." />
        </p>
      </Section>
    </>
  );
}
