import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { withOrders } from './code';
import Localization from './examples/Localization';

const PROPS = [
  ['columns', '`(GridColumn<T> | GridBand<T>)[]`', '—', 'The column definitions, in their initial order, and bands over them (`{ title, columns }`). See Columns below and [Band headers](/datagrid/bands#bands).'],
  ['adaptiveDetail', '`GridAdaptiveDetail`, each field a `Bind`', '`{ colCount: 2 }`', 'The row\'s adaptive detail while columns hide to fit the width (`settings.columnHidingEnabled`, `hidingPriority`): `colCount`, `minColWidth`, `labelMode`, `editors`, `expandOnEdit`, `columnWidth` and `toggleKeys`. Live through `grid.adaptiveDetail`. See [Adaptive columns](/datagrid/bands#adaptive).'],
  ['onAdaptiveDetailRowPreparing, onAdaptiveDetailRowExpanding / Expanded, onAdaptiveDetailRowCollapsing / Collapsed', '`(e) => void`', '—', 'Occur when a row\'s adaptive detail lays out its form (`e.formOptions`), before it opens or closes (`e.cancel`), and after.'],
  ['rows', '`Bind<T[]>`', '—', 'In-memory rows, plain or reactive. The grid reads them as they are, and returns the same objects in events, templates and getters. It places them in a `DataSource` over an `ArrayAdapter`. A new array (a function that returns one is tracked) reloads, and a change in place (`push`, `splice`, or a field) appears after `refresh()`, `repaint()` or `repaintRows(keys)`. Saved edits, new rows and deletions go into the array.'],
  ['dataSource', '`Bind<DataSource | null>`', '—', 'Data layer rows, from any adapter. Loading by `blocks` creates a virtual list that requests only the visible rows, and loading by `page` creates a paged grid. Takes precedence over `rows`.'],
  ['rowKey', '`string | (row) => unknown`', '—', 'The key of `rows`. A data source uses its adapter\'s key.'],
  ['mode', "`Bind<'virtual' | 'paged' | 'infinite'>`", "`'virtual'`", 'A single long list, pages with a pager, or pages that load as the list nears its end (see [Scrolling](/datagrid/scrolling#modes)). A source that loads by page is always paged.'],
  ['onMoreRowsLoading / onMoreRowsLoaded', '`(e) => void`', '—', 'In infinite mode, occur before the next page of rows loads (`{ skip, take }`, and `e.cancel` keeps the rows as they are), and when it arrives (`{ skip, count, ended }`).'],
  ['pageSize', '`Bind<number>`', '`100`', 'The rows per page for in-memory rows (0 places every row on one page). A source that loads pages or blocks uses its own. The pager\'s page sizes (`pageSizeSelector`) and `pageSize(n)` change it, and the user\'s choice is saved with the layout.'],
  ['onPageSizeChanging / onPageSizeChanged', '`(e) => void`', '—', 'Occur before and after the rows per page change: `{ pageSize, previous }` (0 means all). `e.cancel = true` keeps the current value.'],
  ['saveMode', "`Bind<'wait' | 'background' | 'batch'>`", "`'wait'`", 'When changes are sent: see [Save modes](/datagrid/editing#editing). Changing it reloads the data, and unsaved changes are discarded.'],
  ['newRow', '`{ position?: Bind<\'top\' | \'bottom\'>, create?: () => Partial<T> }`', 'bottom', 'Where new rows open, and their initial values.'],
  ['validateRow', '`(row, { values, getValue, isNew, changed }) => messages | string | null`', '—', 'Validates a whole row before saving, returning a message per field or one for the row. `row` is the row itself, `values` holds the entered, unsaved values, and `getValue(field)` returns the value a field will be saved with (the entered value, otherwise the row\'s).'],
  ['form / popup', '`GridEditForm` / `GridEditPopup`, each field a `Bind`', '`{ colCount: 2 }` / —', "The edit form of `editMode` `'form'` and `'popup'` (items, columns and labels) and its window (title, size and buttons). Live through `grid.form` and `grid.popup`. See [Edit forms and popups](/datagrid/forms#forms)."],
  ['settings', '`GridSettingsProps`', '—', 'The feature switches below, each a value or a function.'],
  ['sort / layout', '`SortItem[]` / `GridLayout`', '—', 'The initial sort order, and a saved layout (columns, sort and `group`).'],
  ['onLayoutChange', '`(layout) => void`', '—', 'Occurs after the user resizes, moves, hides, pins or sorts.'],
  ['layoutKey', '`string`', '—', 'Saves the layout, the filters and the search text in the browser\'s `localStorage` under this name, and a grid created again with this name restores them.'],
  ['layoutStorage', '`{ getItem, setItem, removeItem }`', '`localStorage`', 'Where `layoutKey` saves them: `sessionStorage`, or a custom store.'],
  ['on…', '`(e) => void`', '—', 'Every event in the [Events table](/datagrid/layout#events), by name (`onCellClick`, `onRowUpdating` …). `grid.onCellClick(fn)` subscribes the same way.'],
  ['label', '`Bind<string>`', '`uiLocale` “Data grid”', 'The accessible name. This is the same as `text`.'],
  ['texts / locale', '`Bind<Partial<UiStrings>>` / `Bind<string>`', '— / page language', 'Strings for this grid only, and the locale of numbers, dates and sorting.'],
  ['rowHeight', '`Bind<number>`', 'from CSS', 'A fixed row height. By default, the density determines it.'],
  ['actions', '`GridActionItem[] | (row, state) => GridActionItem[]`', '—', 'The buttons of each row: actions, or the names of built-in ones (`edit`, `remove`, `restore`, `save`, `cancel`). A function is called per row, again when the row\'s state changes (edited, saved, selected or deleted), and on `refreshActions()` or `repaintRows(keys)`.'],
  ['selectedKeys / onSelectionChanged', '`Bind<unknown[]>` / `(e) => void`', '—', 'The keys of the selected rows (a function is tracked), reported after every selection change (`e.byDrag` when rows are selected by dragging).'],
  ['cellRanges / onCellSelectionChanging / onCellSelectionChanged', '`Bind<GridCellRange[]>` / `(e) => void`', '—', 'The cell ranges (`settings.cellSelection`, and a function is tracked), with an event before a change (`e.cancel`) and after it (`e.byDrag` while one is drawn). See [Selecting by dragging](/datagrid/drag-select#cells).'],
  ['filters', '`GridFilters`', '—', 'The initial filters, by field: `{ city: { op: \'=\', value: \'Ankara\' }, status: { values: [\'Draft\'] } }`.'],
  ['filterValue, filterEnabled', '`Bind<data.FilterExpression | null>`, `Bind<boolean>`', '`null`, `true`', 'The filter value the filter panel shows and the builder edits (with `filterSyncEnabled`, including those of the filter row and header filters), and whether it applies. Functions are tracked, and user changes arrive in `onFilterChanged`. See [Filter panel and builder](/datagrid/filtering#filter-panel).'],
  ['filterPanelText, filterBuilder, filterBuilderPopup', 'function, objects', '—', 'The panel\'s text, the builder\'s props (any of `FilterBuilder` except `value` and `fields`), and its window (`title`, `width`, `height` …).'],
  ['onFilterBuilderOpening / Opened / Closing / Closed', '`(e) => void`', '—', 'Occur when the builder\'s window opens and closes. The `…ing` events can cancel (`e.apply` indicates whether OK was clicked).'],
  ['searchText / onSearchTextChanged', '`Bind<string>` / `(e) => void`', '`\'\'`','The search panel\'s text (a function is tracked), and an event when it changes, typed or set programmatically (`{ text }`). Together, they provide two-way binding.'],
  ['toolbar', '`{ visible?: Bind<boolean>, items?: Bind<(GridToolbarItem | GridToolbarItemName)[]> }`', 'The items whose features are enabled', 'The bar above the rows: which items, in which order and position. When `visible` is omitted, the bar appears while it has an item.'],
  ['export', '`{ formats?, allowExportSelectedData?, texts? }`, each a `Bind`', "`{ formats: ['csv'] }`", 'What the toolbar\'s export button (`exportButton`) offers: a command per format (`\'xlsx\'`, `\'csv\'` or a custom one), and “Export selected rows” for each with `allowExportSelectedData`. One command is a plain button, and several form a menu. `texts` has `exportTo`, `exportAll`, `exportSelectedRows` (`{format}` is the format\'s name) and `formats` (names by code). Live through `grid.export`.'],
  ['onRowExpanding / onRowExpanded', '`(e) => void`', '—', "Occur before and after a group or a row's details open: `{ kind, key, row }`, with `kind: 'group'` and the group values from the top level down, or `kind: 'detail'` with the row's key and the row. `e.cancel = true` keeps it closed."],
  ['onRowCollapsing / onRowCollapsed', '`(e) => void`', '—', "Occur before and after a group or a row's details close. `e.cancel = true` keeps it open."],
  ['masterDetail', '`GridMasterDetail<T>`, each field a `Bind`', '`{ enabled: false }`', 'Details below the rows: the expand column (`enabled`), the content (`template`), `autoExpandAll`, `canExpand`, `keepDetails`, `keepAcrossPages`, `keepLimit`, `height`, `estimatedHeight`, `columnWidth`, `toggleKeys` and `arrowKeys`. Live through `grid.masterDetail`. See [Master-detail](/datagrid/master-detail#master-detail).'],
  ['onGroupingChanging / onGroupingChanged', '`(e) => void`', '—', 'Occur before and after the grouping changes, by the user or programmatically: `{ group, previous, byUser }`. `e.cancel = true` keeps the current grouping.'],
  ['onGroupDropping', '`(e) => void`', '—', 'Occurs when a header or chip is dropped to change the grouping: `{ field, from, to, index }`. `e.cancel = true` cancels the drop.'],
  ['groupCell', '`(ctx) => component`', '—', 'Custom content in the group rows of columns without a `groupCell`.'],
  ['summary', '`Bind<GridSummary>`', '—', 'The summaries: `totalItems` in the row below the rows, `groupItems` in group rows and footers, and how they are calculated. See [Summaries](/datagrid/grouping#summaries).'],
  ['onSummaryChanged', '`(e) => void`', '—', 'Occurs when summary values are recalculated: `{ total, editing }`.'],
  ['loadValues', '`(request) => { values, total }`', '—', 'The values of a header filter from a server that cannot group: `{ column, search, filter, skip, take, signal }`.'],
  ['onEditorPrepared / onRowValidating', '`(e) => void`', '—', 'Occur when an editor is created, in a cell or the edit form, and when a row is validated before saving (add messages, or set `isValid = false`). See [Events and methods](/datagrid/forms#form-api).'],
  ['onEditorPreparing', '`(e) => void`', '—', 'Occurs before a cell editor is created: `{ field, row, values, getValue, isNew, options, cancel }` (`row` is the row itself, `values` holds what was entered in it, and `getValue(field)` returns the entered value, otherwise the row\'s). Change `e.options`, the editor\'s props (`enabled = false` disables it), or set `e.cancel`.'],
  ['enabled / disabled, visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const COLUMN_FIELDS = [
  ['field, title', 'The value\'s key (a dotted path reads a nested value) and the header text (`Bind<string>`).'],
  ['type', '`text`, `number`, `date`, `boolean`, `list`. Determines the alignment, format, sorting and editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`).'],
  ['width, minWidth, maxWidth, flex', 'In pixels (by default, the `columnWidth` and `columnMinWidth` settings). `flex` shares the free space until the user resizes.'],
  ['sticky, hidden, align', 'Pinned to an edge (a column in a band sticks with its band), initially hidden, and the alignment.'],
  ['ownerBand, hidingPriority', 'The band of a column in a flat list (its `name` or position), and its position in the order columns hide to fit the width, lowest first.'],
  ['value, format, compare', 'Customizes how the value is read, how it is displayed (`Intl` options for a number or date column, such as `{ style: \'currency\', currency: \'EUR\' }`, which an Excel export also converts to a number format, or a function that returns the text), and how it is sorted (in-memory rows).'],
  ['cell', '`(ctx) => component`: custom content, created once per pooled cell. Read `ctx.row` and `ctx.value` in getters.'],
  ['editor', '`(ctx) => Field | component`: a custom editor. A `Field` is read through its value, and any other component calls `ctx.setValue`.'],
  ['filterEditor', '`(ctx: FilterEditorContext) => Field | component`: a custom editor of the filter row’s value. A `Field` is bound to the filter both ways, and any other component calls `ctx.setValue` and hears `ctx.onChanged`.'],
  ['required, validate, options', 'An empty value is not accepted, `(value, row, context) => message`, and the choices of a list (an array, or a function `(row, context)`, which can be async; outside a row, for the cell text, the filter row, the search, the filter builder and pasted text, it is called once with `row` `null` and returns every choice, kept until `refresh()`). `row` is the row itself, `context.values` holds the entered values, and `context.getValue(field)` returns the entered value, otherwise the row\'s.'],
  ['validationRules', 'Validation rules (`required`, `numeric`, `range`, `stringLength`, `pattern`, `email`, `compare`, `custom`, `async`), checked after `required` and `validate`. See [Validation rules](/datagrid/forms#rules).'],
  ['formItem', 'The column in the edit form: `visible`, `colSpan`, `label`, `helpText`, `editorOptions`, `order`.'],
  ['filterOperators, filterOperator', 'The conditions the filter row offers for the column, and the initial condition.'],
  ['headerFilterInterval', '`Bind<number | number[] | \'year\' | \'quarter\' | \'month\' | \'day\' | \'hour\' | \'minute\' | \'second\' | null>`. How the header filter groups values. A number column uses ranges of that size (“0 – 100”, and several sizes create a tree), and a date column uses a tree of its parts down to that one (by default, the `headerFilterDateInterval` setting, `day`). `null` lists every value. A selected range filters with `>=` its start and `<` its end. See [Ranges, dates and entries](/datagrid/filtering#intervals).'],
  ['headerFilterItems', '`{ text, value, count? }[]` or `(request) => items`. Custom header filter entries in place of the values. A value can be a filter expression. The function receives `{ column, filter, signal, values() }`, and `values()` returns the values it would list.'],
  ['filterValues, filterType', '`Bind<unknown[]>`, `Bind<\'include\' | \'exclude\'>`. The values selected in the header filter, and whether they include or exclude rows. A function is tracked, and `grid.filters` holds them as `values` and `filterType`.'],
  ['lookup', '`GridLookup`. The cell holds a key and displays the text of its item from another source (see [Lookup columns](/datagrid/lookups#lookups)). `type` still determines the alignment.'],
  ['textFrom, sortField', 'The text of a lookup cell read from the row (`\'customer.name\'` or `(row) => text`), so that the source is used only for editing and lists, and the field a server sorts the column by.'],
  ['setCellValue', '`(values, value, row, context) => void | Promise`. Called when the user commits a value (editor, paste or Delete), before it is written. `values` starts as `{ [field]: value }`, and you can add fields to write them too. `row` is the row itself, and `context` holds the values entered so far (`values`, `getValue(field)`). A promise keeps the cell busy until it settles.'],
  ['editable, creatable, sortable, resizable, movable, hideable, pinnable, menu, filterRow, headerFilter, filterBuilder, copyable, exportable, syncLookupFilterValues, searchable', 'Enables or disables a feature for this column, and takes precedence over `settings`.'],
  ['resizeMode', 'How this column\'s edge is dragged (`widget` or `nextColumn`). Takes precedence over `settings`.'],
  ['columnRenderingMode', '`standard` keeps the column\'s cells out of view, and `virtual` creates them only in view (see [Virtual columns](/datagrid/scrolling#virtual-columns)). Takes precedence over `settings`.'],
  ['headerCell', '`(ctx) => component | Node | string`. Custom content in the header in place of the title text, created once, with `ctx.title`, `ctx.sort` and `ctx.column` in getters. The title stays the header\'s accessible name.'],
  ['editOnKeyPress, startEditAction', 'How the user opens this column\'s editor. Takes precedence over `settings`.'],
  ['trueTexts, falseTexts', 'For a yes/no column, the pasted text read as yes and as no. Takes precedence over `settings`.'],
  ['groupIndex', '`Bind<number | undefined>`. The column\'s position among grouped columns, so that the rows start grouped by it. A function is tracked: a new value moves the column there, and `undefined` ungroups it.'],
  ['autoExpandGroup', 'Whether the column\'s groups start expanded. Takes precedence over `autoExpandAll`.'],
  ['groupable, showWhenGrouped, allowCollapsing, groupCount, groupMenu, groupExpandMode', 'The grouping switches for this column, each of which takes precedence over `settings`.'],
  ['groupCompare', '`(a, b) => number`. The order of the column\'s groups in memory (`dir` still reverses it).'],
  ['calculateGroupValue', '`(row) => value` for in-memory rows, or the field a server groups by. The value used for grouping and ordering groups instead of the column\'s value.'],
  ['groupCell', '`(ctx) => component`. Custom content in the column\'s group rows, created once per pooled group row. Read `ctx.value`, `ctx.text`, `ctx.count`, `ctx.level`, `ctx.key`, `ctx.isExpanded` and `ctx.summaryItems` (`{ name, column, summaryType, value, text }` of the group row) in getters.'],
];

const PROPERTIES = [
  ['settings', 'read/write, live', '`grid.settings.striped = true`, or a tracked function.'],
  ['columnSettings(field)', 'read/write, live', 'A column\'s own switches. `undefined` returns to `settings`.'],
  ['dataSource, changeTracker', 'read-only', 'The `DataSource` the rows come from and the `ChangeTracker` of their unsaved changes. Subscribe to them like any other.'],
  ['total, loading, pageCount', 'read-only, reactive', 'The rows, whether the first load is running, and the pages (as `totalCount()` and `pageCount()`).'],
  ['sort, page, layout', 'read/write', 'Assign to change them.'],
  ['hasChanges, changes, errorCount', 'read-only, reactive', 'Unsaved changes (`{ added, updated, removed, count }`, where `added` and `updated` are `{ row, changed }`, the row itself and the entered values separately, and `removed` holds the rows), and rows with errors.'],
  ['activeRow, activeField', 'read-only', 'The row and the field of the active cell.'],
  ['actions', 'read-only', 'The built-in actions: `edit`, `remove`, `restore`, `save`, `cancel`.'],
  ['actionTargets, barActions', 'read-only, reactive', 'The rows the toolbar and bottom bar actions act on, and the actions they show. See [Row actions](/datagrid/editing#actions).'],
  ['selection, selectedCount', 'read-only, reactive', 'The selection as a state (`{ all, keys, except, filter }`), and the number of rows it holds.'],
  ['selectedKeys, selectedRows', 'read/write, read-only', 'The keys and rows of selected rows that are known (loaded). Assign keys to select them.'],
  ['cellRanges, cellSelectionSummary', 'read/write, read-only; reactive', 'The cell ranges by row key and field (assign to set them), and the count, sum, average, minimum and maximum of their cells.'],
  ['selectionFilter', 'read-only', 'The selection as a data layer filter, for server operations.'],
  ['filters, filter', 'read/write, read-only', 'The filters by field, and the whole filter the rows are loaded with (including the search).'],
  ['filterValue, filterEnabled, filterText', 'read/write, read/write, read-only; reactive', 'The filter value (assigning distributes its conditions to the filter row and header filters with sync), whether it applies, and the panel\'s text.'],
  ['filterBuilder, filterBuilderPopup', 'read/write, live', '`grid.filterBuilder.maxGroupLevel = 1`, `grid.filterBuilderPopup.width = \'50rem\'`. `filterBuilderInstance` is the open builder.'],
  ['searchText', 'read/write, reactive', 'The search text. Assigning searches immediately, and a function is tracked.'],
  ['group', 'read/write, reactive', 'The grouped columns in order, with the order of their groups (`[{ field, dir }]`). Assign to group, and `[]` ungroups.'],
  ['summary', 'read/write, reactive', 'The current summaries. Assign a new one, or a tracked function. Items are read as provided, so after changing them in place, call `refreshSummary()`.'],
  ['summaryStatus', 'read-only, reactive', '`\'loading\'` while a server calculates the totals (or every row loads for them), `\'error\'` if that failed, otherwise `\'ready\'`.'],
  ['onRowExpanding, onRowExpanded, onRowCollapsing, onRowCollapsed, onGroupingChanging, onGroupingChanged, onGroupDropping', 'event', 'Subscribe with `grid.onRowExpanded((e) => …)`. The same as the props.'],
  ['form, popup', 'read/write, live', "`grid.form.colCount = 3`, `grid.popup.title = 'Order'`. A function is tracked."],
  ['masterDetail', 'read/write, live', '`grid.masterDetail.enabled = true`. A function is tracked reactively.'],
  ['adaptiveDetail, adaptiveHiddenColumns', 'read/write, live; read-only, reactive', '`grid.adaptiveDetail.colCount = 1`, and the columns currently hidden by width.'],
  ['toolbar', 'read/write, live', '`grid.toolbar.items = [\'searchPanel\', { text: \'Refresh\', click }]`, `grid.toolbar.visible = false`. A function is tracked. Items are read as provided (`grid.toolbar.items` is your array), so after changing them in place, call `repaint()`.'],
  ['export', 'read/write, live', '`grid.export.formats = [\'xlsx\', \'csv\']`, `grid.export.allowExportSelectedData = true`. A function is tracked.'],
  ['onSearchTextChanged', 'event', 'Subscribe with `grid.onSearchTextChanged((e) => …)`. The same as the prop.'],
  ['onSelectionChanged', 'event', 'Subscribe with `grid.onSelectionChanged((e) => …)`.'],
  ['onEditorPreparing', 'event', 'Subscribe with `grid.onEditorPreparing((e) => …)`. The same as the prop.'],
  ['every event of the Events table', 'event', '`grid.onRowUpdating((e) => …)` returns a handle, and `dispose()` removes the subscription.'],
  ['status, loadError, failedBlocks', 'read-only, reactive', '`\'loading\' | \'ready\' | \'error\'`, the error of the last load, and the blocks that failed after the first response.'],
  ['editingCell', 'read-only, reactive', 'The cell whose editor is open: `{ rowIndex, field, row }`, or `null`.'],
  ['saving, exporting', 'read-only, reactive', 'Indicates that a row is being saved and the grid is waiting (`wait` mode), and that an export is running.'],
  ['focusedRowIndex, focusedRowKey', 'read/write', 'The active row by index or key. Assigning moves there (for a key, when its row is loaded).'],
];

const METHODS = [
  ['addRow(values?)', '`Promise<boolean>`', 'Opens a new row, as the “New row” button does. Returns `false` when the row being edited cannot be left.'],
  ['deleteRow(row?) / restoreRow(row)', '`Promise<boolean>` / `void`', 'Deletes a row (by default, the active row) according to the save mode, or undoes a batch deletion.'],
  ['deleteRows(rows)', '`Promise<boolean>`', 'Deletes several rows in one save (one request when the adapter saves in batches), prompting once with `confirmDelete`. Returns `false` when a row failed or the user declined.'],
  ['saveChanges() / discardChanges()', '`Promise<{ saved, failed }>` / `void`', 'Sends every unsaved change, or discards them all.'],
  ['goToNextError()', '`boolean`', 'Moves to the next row that failed or has a message.'],
  ['runAction(id, rows?) / stopAction()', '`Promise<ran | null>` / `void`', 'Runs an action on rows (by default, the rows the bars act on) as a click does, or stops the one running on several rows.'],
  ['refresh() / retry()', '`void`', 'Reloads while keeping the position (including lookup text), re-reads everything that displays your data, including summaries, and reloads what failed. Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refresh()`.'],
  ['refreshLookups()', '`void`', 'Clears the cached lookup text and requests the text on screen again.'],
  ['scrollToIndex(i, align?)', '`void`', 'Scrolls a row into view (in paged mode, its page).'],
  ['autoSizeColumns() / resetLayout() / focus()', '', 'Fits the columns, returns to the definitions, or sets focus on the active cell.'],
  ['selectRow(row, add?) / deselectRow(row) / isSelected(row)', '', 'Adds one row to or removes it from the selection.'],
  ['selectAll() / clearSelection()', '', 'Selects every row of the filter, loaded or not, or clears the selection.'],
  ['clearFilters()', '', 'Removes every filter, including the filter value and the search text.'],
  ['openFilterBuilder() / closeFilterBuilder(apply?) / clearFilterValue()', '`boolean` / `boolean` / `void`', 'The filter panel\'s builder window and its Clear action, programmatically.'],
  ['searchByText(text)', '`void`', 'Searches for text immediately, as the search panel does. `\'\'` stops searching.'],
  ['showColumnChooser()', '`void`', 'Opens the column list, below the toolbar\'s column button when it is visible.'],
  ['expandAll(level?) / collapseAll(level?)', '`void`', 'Expands or collapses every group of a level (0 is the top level), or of every level.'],
  ['expandGroup(key) / collapseGroup(key) / isGroupExpanded(key)', '`boolean`', 'One group by its key, with values from the top level down (`[\'Ankara\', \'Draft\']`). Returns whether it expanded or collapsed, and whether it is expanded.'],
  ['expandRow(key) / collapseRow(key) / isRowExpanded(key)', '`boolean`', "A row's details by the row's key (`masterDetail`). Returns whether they opened or closed (the row events run and can cancel), and whether they are open."],
  ['expandAllRows() / collapseAllRows()', '`void`', "Opens or closes every row's details at once, without row events."],
  ['expandAdaptiveDetailRow(key) / collapseAdaptiveDetailRow() / isAdaptiveDetailRowExpanded(key)', '`boolean`', "A row's adaptive detail by the row's key. Returns whether it opened (any open detail closes first) or closed, and whether it is open."],
  ['clearGrouping()', '`void`', 'Removes all grouping.'],
  ['groupBy(field, index?, dir?) / ungroup(field) / setGroupOrder(field, dir)', '`void`', 'Groups by a column at a position among the grouped columns (moving one that is already grouped), removes one, or sets the order of its groups.'],
  ['copy() / paste(text)', '`string` / `number`', 'The same as Ctrl+C and Ctrl+V. Copies the cell ranges, the selected rows or the active cell (and returns the text), or pastes tab-separated text from the active cell or the first cell of the last range, with one value going into every cell of the ranges (and returns the cells written).'],
  ['selectCells(from, to?, add?) / clearCellSelection() / getSelectedCellValues()', '`boolean` / `void` / `GridCellValue<T>[]`', 'A range from cell to cell (`{ key or rowIndex, field }`), alone or after the others, no range, or the selected cells of the loaded rows with their values.'],
  ['exportRows(options?)', '`Promise<object[]>`', 'The rows of the filter in sort order, by field, with the visible exportable columns, as displayed text or `raw` values. Server rows are requested in parts through the data source. Group footers and totals are included as objects with the same fields (`summaries: false` omits them).'],
  ['exportCsv(options?)', '`Promise<string>`', 'The same as a CSV file that a spreadsheet can open: a byte order mark, the locale\'s separator, titles first, one line per group while grouped, group footers after their rows, and totals last. Options: `values`, `selected`, `fileName`, `download`, `separator`, `headers`, `groups`, `summaries`, `bom`, `escapeFormulas`, `pageSize`, `onProgress`, `signal`.'],
  ['exportTo(format, options?)', '`Promise<void>`', 'Performs a command of the export button. `csv` runs `exportCsv`, and another format raises `onExporting` with that `format` (and `selectedRowsOnly` from `options.selected`), where the application writes the file.'],
  ['exportSheet(options, write)', '`Promise<R>`', 'Passes the rows of an export to `write` as a sheet of typed cells (header, group rows, data rows, group footers and totals). `exportDataGrid` writes this form, and a custom writer can use it too. It loads like `exportRows`, with the load panel, without `onExporting`, followed by `onExported`.'],
  ['cancelExport()', '`void`', 'Stops the export shown by the load panel. Its promise rejects with an `AbortError`.'],
  ['getTotalSummaryValue(name)', '`unknown`', 'A totals value by the item\'s `name`, its position in `totalItems`, its type, its column or `type_column` (`\'sum_amount\'`). Reactive.'],
  ['getGroupSummaryValue(key, name)', '`unknown`', 'A group summary value, with the group by its key (as in `expandGroup`) and the item as above. Reactive.'],
  ['getVisibleRows()', '`GridVisibleRow[]`', 'The currently rendered rows: `{ rowIndex, rowType, row, key, groupKey?, element }`.'],
  ['getRowElement(i) / getCellElement(i, field)', '`HTMLElement | undefined`', 'The element of a rendered row or cell.'],
  ['getKeyByRowIndex(i) / getRowIndexByKey(key)', '`unknown` / `number`', 'A row\'s key by its index, and the index of a loaded row by its key (-1 when it is not loaded).'],
  ['byKey(key)', '`Promise<T | undefined>`', 'The row with this key: loaded, previously found, or requested from the data source.'],
  ['cellValue(i, field, value?)', '`unknown`', 'The value displayed in a cell. With `value`, writes it as the user would (validated, and saved according to the save mode).'],
  ['navigateToRow(key)', '`Promise<boolean>`', 'Moves to the row with this key (its page in paged mode) and makes it the active row.'],
  ['focusCell(i, field?) / editCell(i, field) / editRow(i) / closeEditCell()', '`boolean`', 'Moves the active cell as the arrow keys do, opens a cell\'s editor or the first editor of a row (in form modes, its form), or keeps the open editor\'s value and closes it.'],
  ['editRowByKey(key)', '`boolean`', '`editRow` for the row with this key, while it is loaded.'],
  ['saveEditData() / cancelEditData()', '`Promise<boolean>` / `void`', 'Saves or discards the current edit, as Save and Cancel do: the edit form, otherwise the row being edited, and in batch mode every unsaved change.'],
  ['beginUpdate() / endUpdate()', '`void`', 'Programmatic changes in between lay out the rows once, at the last `endUpdate()`.'],
  ['repaint()', '`void`', 'Redraws everything that displays your data, without loading: the rows, their details and adaptive detail, the group rows and footers, the totals, the toolbar and the actions (after a row, an option or a value read by a template or `onRowPrepared` is changed in place).'],
  ['repaintRows(keys)', '`void`', 'Redraws only the rows with these keys, with their actions and details, after you change those rows in place.'],
  ['refreshSummary()', '`void`', 'Re-reads the summary items and recalculates the values, after an item, the items or row values are changed in place.'],
  ['refreshActions()', '`void`', 'Re-reads the actions of every row and both bars, after a value read by the `actions` function or by an action\'s `visible`, `disabled` or `text` is changed in place.'],
  ['columnOption(field, name?, value?) / columnOption(field, options)', '`unknown`', 'Reads or writes a column\'s `width`, `visible` (`hidden`), `flex`, `sticky`, `visibleIndex`, `sortOrder`, `sortIndex`, `groupIndex`, `filterValues`, `filterType`, a feature switch or any field of its definition (`title`, `format`, `lookup`, `cell`, `type` …, and the column is redrawn, keeping its layout, sort and filter). Without a name, it returns all of them, and an object sets several. Each change is reported through `onOptionChanged` with the column\'s `field`.'],
  ['addColumn(column, index?) / deleteColumn(field)', '`void`', 'Adds a column at runtime, at a position among the data columns (by default, last, and the saved layout applies), or removes one with its sort, grouping and filter. The layout and the saved layout follow, and `onOptionChanged` reports `name: \'columns\'` with the fields before and after.'],
  ['columnCount() / getVisibleColumns()', '`number` / `GridColumn[]`', 'The data columns, including hidden ones, and the definitions of those currently displayed, in display order.'],
  ['pageIndex(n?) / pageSize(n?) / totalCount()', '`number` / `void`', 'The displayed page (with `n`, moves there, as `page` does, and in infinite mode, the last displayed page, with `n` loading the pages up to it), the rows per page, 0 for all (with `n`, as the pager\'s page sizes, returning to the first page, with `onPageSizeChanging` first), and the rows of every page (in infinite mode, −1 until known).'],
  ['loadMore() / loadingMore / endReached', '`boolean`', 'In infinite mode, loads the next page (`onMoreRowsLoading` first), indicates that a page is loading, and indicates that every row is displayed.'],
  ['getCombinedFilter()', '`FilterExpression | null`', 'The whole filter of the rows: the source\'s own, the filter row, the header filters and the search.'],
  ['state() / state(value)', '`GridStateValue` / `void`', 'Saves and restores what the user set up: columns, sort, grouping, filters, search text, page and page size, selected keys, and the active row.'],
];

const KEYS = [
  ['Arrow keys', 'Moves between cells, including the headers. On right-to-left pages, Left and Right are reversed.'],
  ['Home / End, Ctrl + Home / End', 'Moves to the first data column or the last column, or to the first or last row (only that block is loaded, and in infinite mode, the last displayed row, and the next page loads).'],
  ['PageUp / PageDown', 'In paged mode, moves to the previous or next page (`pageKeys`, or one screen on the first and last pages). In a virtual list, moves one screen up or down.'],
  ['Tab in the pager', 'Moves through its buttons one by one: the page sizes, first, previous, the pages, next and last. In compact mode, it moves through the page number box (Enter goes there) and the page size list.'],
  ['Enter (header), Shift + Enter', 'Sorts, or adds the column to the sort.'],
  ['Alt + Down, Shift + F10 (header)', 'Opens the column menu, where “Move” and “Width” work with Left and Right, Enter keeps the change, and Escape reverts it.'],
  ['Typing, Enter, F2, double-click', 'Edits the cell. Typing starts with that character (a lookup cell opens its list and searches for it).'],
  ['Space, Delete, Backspace', 'Toggles a check box column, clears the cell, or edits from empty.'],
  ['Escape', 'In an editor, closes it without keeping the value (a new row is removed). On a row, reverts its edits.'],
  ['Shift + F10, the context menu key (row)', 'Opens the row\'s menu, with its actions (the common ones within a selection of several rows) and anything added by `onContextMenuPreparing`. Escape returns to the cell.'],
  ['Any key', 'The keys that edit and clear a cell are the `editKeys` and `clearKeys` settings, and `onKeyHandling` receives any key before the grid does.'],
  ['Tab / Shift + Tab in an editor', 'Moves to the next or previous editable cell, row by row. At the end of a new row, the next new row opens.'],
  ['Up / Down in an editor', 'Keeps the value and moves to the row above or below.'],
  ['Left / Right in the actions cell', 'Moves between its buttons. Enter or Space activates one, and Alt + Down opens the “more” menu.'],
  ['Shift + Space, Space', 'Selects or deselects the row. Space alone works where it does not edit (the check box column, or a cell that cannot be edited).'],
  ['Shift + Up / Down, Shift + click, Ctrl + click', 'Extends the selection from the anchor, or adds or removes one row.'],
  ['Ctrl + A', 'Selects every row of the filter.'],
  ['Ctrl + C', 'Copies the selected rows (multiple selection), otherwise the active cell, as tab-separated text and an HTML table.'],
  ['Ctrl + V', 'Pastes tab-separated text into the editable cells, from the active cell to the right and down.'],
  ['Typing, Enter or F2 on the filter row', 'Moves into the cell\'s value box. Escape or Enter returns to the cell, Tab moves to the next value box, and Delete clears the cell.'],
  ['Alt + Down on the filter row', 'Opens the condition menu (for a yes/no column, its list).'],
  ['Alt + Down on a header', 'Opens the column menu, or the header filter if there is no menu.'],
  ['Left / Right, Home / End in the toolbar', 'Moves between its items (the toolbar is one Tab stop before the rows). In the search box, the arrow keys stay in its text.'],
  ['Escape, Enter in the search box', 'Clears the box, and the rows return immediately, or searches without waiting for the pause.'],
  ['Enter, Space on a group row', 'Expands or collapses the group.'],
  ['Arrow keys on a group footer', 'The footer is a row the arrow keys reach like a group row, and the keys that edit or select have no effect there.'],
  ['Tab after the rows', 'Moves to the totals row (`totalSummaryTabStop`), and Shift + Tab returns to the active cell. Ctrl + End still moves to the last row.'],
  ['Right / Left on a group row', 'Expands the group and then moves to its first row, or collapses it and then moves to its parent group.'],
  ['Enter, Delete, Shift + Left / Right on a chip', 'Reverses the order of the groups, ungroups, or moves the chip. Left and Right move between chips like any toolbar item.'],
];

const A11Y = [
  ['Pattern', 'Follows the APG data grid pattern, with `role="grid"`, and rows and cells with `aria-rowindex` and `aria-colindex`. `aria-rowcount` is the real total, including in a virtual list.'],
  ['Reading order', 'Rendered rows are reused while scrolling and stay in place in the page. The row group lists them in row order with `aria-owns`, so a screen reader reads them from top to bottom.'],
  ['One tab stop', 'Only the active cell is in the Tab order, and focus never falls to the page, because the focused row stays while it scrolls away.'],
  ['Sorting', '`aria-sort` on the first sorted header.'],
  ['Messages', 'A cell with a message has `aria-invalid` and is described by it while active. The status cell names the row\'s state in words, not only with a color.'],
  ['Announcements', 'Sorting, moving, saving, errors, copying, pasting and exports are announced through a polite live region.'],
  ['Busy state', '`aria-busy` while the first rows load and while a row is saved in `wait` mode, on a lookup cell while its text loads, and on a cell while its `setCellValue` runs.'],
  ['Lookup keys', 'A key the lookup source does not contain is not indicated only by color. It is underlined, and its hint (“Not found in the list”) appears on hover and focus.'],
  ['Actions', 'Real buttons with the action\'s text as their name (even when only the icon is shown, with the text as a tooltip). One of them is in the cell\'s roving focus, and the “more” button has `aria-haspopup="menu"` and is named “More actions for row N”. In the toolbar and the bottom bar, a button that acts on several rows is named with the count (“Approve, 3 rows”) and described by what the bar acts on (“Actions for 3 selected rows”), announced politely when that changes. Nothing there moves focus on its own.'],
  ['Selection', '`aria-multiselectable` on the grid, and `aria-selected` on every row while selection is on. The check boxes are `role="checkbox"` with `aria-checked` (`mixed` in the header).'],
  ['Filters', 'The filter row is a row of the grid, and its fields are named after the column. The condition button names the condition, and the header filter is a `dialog` with a listbox.'],
  ['Toolbar', 'The kit\'s `Toolbar` (`role="toolbar"`, named after the grid), with one Tab stop and arrow keys between its items. An icon-only button is named by its text, which is also its tooltip and its line in the “more” menu.'],
  ['Search', 'The box is a search field named “Search in the grid”. The number of records found is announced politely, and matches are marked with `<mark>`, which reads as the same text.'],
  ['Group rows', 'Grid rows with `aria-expanded` and `aria-level`. Their single cell spans the columns (`aria-colspan`), reads “Column: value (count)” and is reachable with the arrow keys. Grouping, ungrouping and moving a chip are announced.'],
  ['Summaries', 'The totals row is a grid row after the rows (`aria-rowindex`, counted in `aria-rowcount`) in a row group named “Totals”. Each cell is named by what its items report about their columns (“Sum of Amount: 1,234”), even when it shows only “Sum: 1,234”. Group footers are rows with `aria-level`, and items under their columns in a group row are cells of that row. `aria-busy` applies while a server calculates the totals.'],
  ['Group panel', 'A `group` named “Grouping” in the toolbar. Each chip is a button named after its column and the order of its groups, and described by the keys it accepts. Every drag has a keyboard alternative: the column menu and the chip keys.'],
];

const HOOKS = [
  ['.mx-data-grid', 'The grid. `data-striped`, `data-header-buttons`, `data-mode`.'],
  ['.mx-data-grid__viewport, __head, __body', 'The scrolling area with `role="grid"`, the sticky header, and the rows.'],
  ['.mx-data-grid__row', 'A row, with `data-active`, `data-selected`, `data-status`, `data-odd` and `data-loading`.'],
  ['.mx-data-grid__actions, __action, __more', 'The actions cell and its buttons (kit button classes, `data-action`).'],
  ['.mx-data-grid__bar-action, __bar-menu, __bar-actions, __bar-target', 'The actions in the toolbar and the bottom bar (kit buttons, `data-action`), their “Actions” menu button, the bottom bar\'s toolbar, and the hidden text describing what they act on.'],
  ['.mx-data-grid__select, __check', 'The selection column and its check box (`aria-checked`).'],
  ['.mx-data-grid__row--filter, __filter-cell, __condition', 'The filter row, its cells, and the condition button (`data-set`).'],
  ['.mx-data-grid__filter-button, __values', 'The header filter button (`data-active`) and its window.'],
  ['.mx-data-grid__cell, __header-cell', 'A cell (`data-changed`, `aria-invalid`, and for a lookup cell `data-lookup="loading"` with `aria-busy`, or `"missing"`), and a header (`data-sort`, `data-sortable`).'],
  ['.mx-data-grid__editor', 'The editor of the active cell. Its field has `data-in-cell` and is drawn without a frame.'],
  ['.mx-data-grid__expand, __expand-button, __detail-row, __detail-cell', "Master-detail: the expand column's cells and their arrow (`aria-expanded`), and a row's details and their single cell (`data-fixed` with a fixed `height`). A row with open details has `data-expanded`."],
  ['.mx-data-grid__form-row, __form-cell, __form, __form-field, __form-message, __form-buttons, __popup', "The edit form: the row replacing the edited row and its single cell, the form, a column's field (`data-field`), the row's message, and Save and Cancel. `__popup` is the window of `editMode: 'popup'`."],
  ['.mx-data-grid__toolbar, __toolbar-gap', 'The toolbar above the rows (the kit\'s `.mx-toolbar`), and the gap between its `before` and `after` items.'],
  ['.mx-data-grid__add, __save, __revert, __export, __columns, __search', 'The toolbar\'s own items: “New row”, “Save changes”, “Discard”, “Export” (busy while running), the column list and the search box.'],
  ['.mx-data-grid__mark', 'Matched search text, a `<mark>` in the cell.'],
  ['.mx-data-grid__group-row, __group-cell, __group-toggle, __group-count', 'A group row (`data-expanded`, `--_level`), its cell, its arrow and its count.'],
  ['.mx-data-grid__foot, __total-row', 'The sticky row group below the rows and its totals row (`data-state="loading"` while a server calculates them).'],
  ['.mx-data-grid__summary-cell, __summary-item', 'A cell containing summary items (the totals row, a group footer or an aligned item of a group row) and each item in it, with the item\'s `cssClass`.'],
  ['.mx-data-grid__group-footer, __group-summary', 'A group footer (`--_level`), and the summary text after a group row\'s count.'],
  ['.mx-data-grid__group-panel, __chip, __group-empty', 'The group panel (`data-drop` while a header can be dropped there, `data-locked` without dragging), its chips (`data-dir`, `data-dragging`) and its empty text.'],
  ['.mx-data-grid__bar, __pager', 'The bar below the rows and its pager (a `nav`, with `data-look="full"` or `"compact"`).'],
  ['.mx-data-grid__page-sizes, __page-size, __page-size-list, __page-info, __pages, __page, __page-jump, __page-number', 'The pager\'s parts: the page size buttons (`aria-pressed`) and their drop-down (compact), the text, the page buttons (`aria-current="page"`), and the page number box (compact).'],
  ['.mx-data-grid__values-tree, __values-all', 'The header filter\'s tree of date parts or ranges (the kit\'s `TreeView`) and its “Select all” check box.'],
];

const TOKENS = [
  ['datagrid.grid, row, selection, indicator, cell, changed, invalid, placeholder, header-cell', 'Units: the grid, a row (`header`, `band`, `filter`, `total`, `body`, `group`, `group-footer`, `selected`, drag and drop states), the selection\'s frame and mark, a cell and a header in their states, and the marks over a cell.'],
  ['datagrid.title, sort, head-button, resize, column-drop, filter-cell, filter, condition, group-*, chip*, toolbar, ghost*, status-*, check*, editor, expand*, drag-*, row-drop, detail-*, adaptive-*, form*, values*, state, note, load-more, export-panel, mark, filter-panel, filter-text, bar, pager*, page-*, tip', 'Units: every other part, in its states.'],
  ['datagrid.record-height, row-space, cell-inset, icon-size, button-size, resize-hit-width, group-indent, chip-spacing', 'Sizes used by the layout.'],
  ['datagrid.hover-tint, stripe-tint, active-tint, new-tint', 'The tints over a row and its cells: under the pointer, alternate rows, the active row, and a new row.'],
  ['datagrid.range-fill, range-fill-opacity, range-selected-fill, range-border-color, range-border-width, range-anchor-fill, row-run-border-color, row-run-border-width', 'Selecting by dragging: the fill, frame and anchor cell of cell ranges, and the frame around rows selected by a drag.'],
  ['datagrid.pinned-edge-width, pinned-edge-color, search-mark-line, search-mark-thickness, search-mark-offset, status-*-mark', 'The edge of the pinned columns, the underline of search matches, and the status symbols.'],
];

export default function DataGridApiPage() {
  return (
    <>
      <Section anchor="columns" title="Columns">
        <ApiTable head={['Field', 'Description']} rows={COLUMN_FIELDS} />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="All strings the grid displays come from `uiLocale.strings` (the `grid…` keys) or from the grid's own `texts`: the toolbar, the search box, the bar, the pager, the column menu, the row states, the action buttons, the filter conditions, the summary strings (`gridSummarySum`, `gridSummarySumOtherColumn`, … `gridSummaryCount`, `gridSummarySeparator`, `gridTotalSummary`) and the announcements. Numbers and dates follow `locale`." />
        </p>
        <Example files={withOrders('Localization.tsx')} stack>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <p>
          <Rich text="The rows and their saving belong to the data layer. `grid.dataSource` and `grid.changeTracker` are a `DataSource` and a `ChangeTracker` from `@motifx-community/data`, with their own events (`onChanged`). `changeTracker.removeRows(rows)` and `removeKeys(keys)` delete several rows in one save, as `deleteRows` does." />
        </p>
      </Section>
    </>
  );
}
