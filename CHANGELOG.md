# Changelog

All notable changes to this package are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Check boxes and radios

- The check box, the radio circle and the check boxes of DataGrid, ListBox and TreeView draw one
  stroke all around; the pressable depth is a 1px shadow under the mark instead of a darker bottom
  border, which vanished on dark backgrounds and left the outline open at the bottom.
- `checkbox.radius` and the `check-radius` of DataGrid, ListBox and TreeView read the design
  system's new `radius.xs`, so a check box stays square in a design language with round corners
  (Lounge). Same 4px as before in Tactile.
- The docs site has a Style menu (Tactile / Lounge) next to Theme, kept between visits.

### rewrite

- The components are being rewritten from scratch, one at a time. Removed: `Button`, `Label`,
  `Panel`, `Stack`, `Grid`, `GroupBox`, `SplitContainer`, `MxForm`, their component tokens and docs
  pages, the layout props of `Control` (`dock`, offsets, size, grid cells), `UiLocale`,
  `FormResult` / `CloseReason` and the `x-model` helpers of `Control`. The entries below describe
  them as they were.
- Kept: `Control`, `FocusContainer`, `addShortcut`, `parseAccessKey`, the focus guard and the
  `enabled` cascade. The window stack marks a modal window with `modal`. The token build writes
  empty files when there are no component tokens.

### Button

- `Button`: a native `<button>`; `variant` (solid / outline / ghost), `tone` (standard / accent /
  danger), `size` (sm / md / lg) from the density tokens, pressable solid faces; `text` with an `&`
  access key or JSX children; `icon` (an address, an element or a component) at the start or end;
  `stretch`, `type`, `hint`; `toggle` / `pressed` with `x-model`; `busy` (spinner, presses ignored,
  size kept, `aria-busy`); `focusableWhenDisabled` (`aria-disabled`, stays in the Tab order). Every
  prop is a value or a function and a settable, reactive property; set from code, a function is
  bound and followed too (`Control` setters as well: `ctrl.enabled = () => !state.busy`).
- A menu: `menu` (items with icon, hint, enabled, visible, checked, beginGroup, each a value or a
  function the open menu follows; click, data) or any
  content (`dropDown`), opened by the whole button or, with `split`, by an arrow next to it while the
  button keeps its own action; `split` changes live; `opened`, `open()`, `close()`, `onItemClick`.
- Shared parts: `Popup` (top layer, follows its anchor, flips when there is no room, closes on
  Escape / a press outside / focus leaving, gives focus back) and `MenuList` (arrows, Home / End,
  letters, `&` keys); `placePopup`; `IconSource`.
- `uiLocale` / `enStrings` / `trStrings` / `UiStrings`: the texts controls write, reactive, starting
  with the page's `lang`.
- Component tokens `button.*`, `popup.*`, `menu.*`. `@motifx/core` 1.2.0-rc.19.

### TextBox

- `TextBox`: a native `<input>` in a field frame; `label` (`&` access key) with `labelMode` top /
  side / floating / hidden, `placeholder`, `helpText`, `hint`, `prefix` / `suffix`, `icon`,
  `buttons` (your own, each with `enabled`, `visible`, `position`, `tabStop`), `clearButton`
  (Escape too), `type` (text, password with a reveal button, email, search, tel, url), `maxLength`
  / `minLength` / `showCounter`, `updateOn` input / change, `selectOnFocus`, `align`, `readOnly`,
  `required`, `size`, `variant` (outline, filled, underline), `stretch`, `inputMode`,
  `autocomplete`, `spellcheck`, `name`; `onValueChanged` (`byUser`), `onEnter`, `onValidated`.
- Mask: `mask` (`0` digit, `9` optional digit, `a` letter, `*` letter or digit, `\` fixed),
  `maskChars` (own characters with case), `maskPlaceholder`, `maskValue` raw / formatted,
  `showMask`; typing, deleting and pasting follow the mask; an unfilled mask fails validation.
- Validation: `rules` (required, email, url, pattern, length, range, compare, custom, async),
  `error` from outside, `validateOn` blur / input / manual, `isValid`, `validationMessage`,
  `validating`, `validate()`, `resetValidation()`; `ValidationGroup` and `validateFields(root)`
  focus the first failed field. Messages come from `uiLocale` and follow it.
- Shared parts: `Field` (the base of every editor), `InputMask` / `MaskedText` / `parseMask`
  (work on any `<input>`), `checkRules`. `Control.changeProperty` stores a user's value without
  dropping a bound getter. New `uiLocale` texts. Component tokens `field.*`.

### The rest of the set

- Editors: `TextArea` (auto-grow between `minRows` / `maxRows`, resize, counter, Ctrl+Enter),
  `NumberBox` (`min` / `max` / `step` / `largeStep`, spin buttons that repeat, wheel, `Intl` formats
  with locale-aware typing, decimal arithmetic, `clamp`, `allowEmpty`), `Slider` (one value or a
  range, ticks and labels, value bubble, vertical, RTL).
- Choice: `CheckBox` (three states), `Switch`, `RadioGroup` (APG keys, columns), `ListBox` (single or
  multiple, select all, search, data sources), `TagBox` (tags, search, `maxTags`, custom values).
- Data: `TreeView` (nested or flat items, lazy children with retry, selection, tri-state check boxes,
  filter, long trees drawn in view), `DataGrid` (moved in from motifjs-data-grid onto
  `@motifx-community/data`: virtual or paged, sorting, column layout, editing with the kit's
  editors, new rows, three save modes, row actions, selection over any number of rows, filter row
  and header filter, copy and paste, CSV export, a saved layout). Rows stay in place in the DOM
  while scrolling; the reading order is given through `aria-owns`. `resizeMode` (grid and column):
  `widget` resizes the column alone, `nextColumn` moves only the edge between it and the next column.
- `DataGrid` lookup columns: `lookup` (a `DataSource` of any adapter, also of another service, or an
  array; `valueField`, `textField`, `searchFields`, `filter(row)`, `allowClearing`, `resolve`
  `batch` / `byKey`, `batchSize`, `sortBy`, `editor` `dropdown` / `combobox` / `lookup`,
  `editorOptions`). Only the keys on the screen are asked for, several in one request, and only the
  cells that show them are drawn again; loading and "not found" states; the chosen text is
  remembered. `textFrom` and `sortField` on any column; `setCellValue` (also async) and the
  `onEditorPreparing` event for every column; the `syncLookupFilterValues` setting (grid and
  column); `refreshLookups()`. Filter row "(All)" lists, header filter texts, copy, export and paste
  by text, and a key the source does not have stops its row from being saved.
- `DataGrid` search panel and toolbar. `searchPanel` (with `searchPanelWidth`, `searchPlaceholder`,
  `searchDelay`, `highlightSearchText`, `highlightCaseSensitive`, `searchVisibleColumnsOnly`, all
  live) puts a search box in a toolbar above the rows; `searchText` (followed, told back through
  `onSearchTextChanged`), `searchByText()`, `searchable` (grid and column; a column that turns its
  filters off is left out). Text columns contain the text, numbers, dates and yes/no equal it when it
  reads as one, lists match their option texts, lookup columns ask their own source for the keys
  whose text holds it (`lookup.searchLimit`) or search a `textFrom` field; the columns are joined
  with OR and with the filters with AND, a text no column reads keeps no row, and the filter goes to
  the data source like any other. What was found is marked with `<mark>`; the count is announced; the
  text is kept with the layout. `toolbar` (`visible`, `items`, also `grid.toolbar`, live): the grid's
  own items (`addRowButton`, `saveButton`, `revertButton`, `exportButton`, `columnChooserButton`,
  `searchPanel`) whose features are on, or the listed ones, changed by name, and items of the app's
  own (buttons or `content`) at the start or the end, on the kit's `Toolbar` with its "more" menu.
  "New row", "Save changes" / "Discard" and "Export" moved from the bar under the rows to the toolbar
  (the bar keeps the counts, the error summary and the pager); `columnChooserButton` setting,
  `showColumnChooser()`; the `gridPendingChanges` text went with the bar's old buttons. `clearFilters()`
  also clears the search text. `KeyedItems.searchInMemory`.
- `DataGrid` grouping. Column `groupIndex` (followed when a function), `groupable` (grid and
  column), `showWhenGrouped`, `autoExpandGroup`, `calculateGroupValue` (a function for rows in
  memory, a field for a server) and `groupCell`; settings `groupPanel`, `groupPanelDragging`,
  `groupPanelEmptyText`, `autoExpandAll`, `groupExpandMode` (`button` / `rowClick`, also per column),
  `remoteGrouping` (`auto` / `true` / `false`), `groupLoadPageSize`, `groupToggleKeys`,
  `groupArrowKeys`, `dragThreshold`, and the column features `groupable`, `showWhenGrouped`,
  `allowCollapsing`, `groupCount`, `groupMenu` (grid and column, the column wins), all live; column
  `groupCompare`; grid `groupCell`; export option `groups`. `grid.group` (read and assign),
  `groupBy(field, index?, dir?)`, `ungroup(field)`, `setGroupOrder(field, dir)`, `clearGrouping()`,
  `expandAll(level?)`, `collapseAll(level?)`, `expandGroup(key)`, `collapseGroup(key)`,
  `isGroupExpanded(key)`; `onRowExpanding` / `onRowExpanded` / `onRowCollapsing` / `onRowCollapsed`,
  `onGroupingChanging` / `onGroupingChanged` (user or code) and `onGroupDropping` (a header or chip
  dropped), the "before" ones cancellable. Group rows are pooled like data rows: "Column: value (count)" (a lookup's
  text, the column's format, "(empty)"), an arrow, moved in by level; a closed group is one row, in
  the virtual list and in pages alike. The grid is a `treegrid` while grouped (`aria-expanded`,
  `aria-level`, `aria-colspan`). Enter / Space open and close a group row, Right and Left open and
  close it and go in and out. The group panel (`groupPanel` toolbar item, at the start): headers
  dropped anywhere on the toolbar group (the bar is outlined while a header is dragged and filled
  under the pointer; a copy of the dragged header or chip follows the pointer, marked when a drop
  would group, move or ungroup; `dragGhost` turns it off), chips turn the order of their groups (click, Enter), move (drag, Shift +
  arrows) and ungroup (Delete, or dragged back onto the headers, where the column lands); the column
  menu has "Group by this column", "Ungroup", "Ungroup all". A grouped column leaves the columns and
  the sort; its header sorts its groups. Data: rows in memory and sources that load everything are
  grouped in memory; a source that loads by blocks over an adapter that groups is asked for the
  groups only and loads the rows of the open groups where the list looks; anything else gets every
  matching row grouped in memory. Filters, search, selection, editing (a saved row moves to its
  group), copy (a group row copies its text), the CSV export (a "Column: value" line per group) and
  the kept layout (`group`) work with it. Texts `gridGroup…` / `gridUngroup…` in en and tr; component
  tokens `datagrid.group-*`, `chip-*`, `panel-empty-color`, `drop-target`.
- `KeyedItems` (shared, batched key → item cache per source and value field); `DataItems.find`
  goes through it. `DropDown` and `ComboBox` ask for a value on no loaded page by their `valueField`
  when it is a field. `DropDown.open(search)` starts the search box with a text.
- Layout and windows: `Stack`, `Grid`, `DockPanel`, `Panel`, `GroupBox`, `SplitContainer`, `Tabs`,
  `Accordion`, `MxForm` (window and modal form, `show` / `showDialog`, move, resize, minimize,
  maximize, nested modals), `messageBox`, `confirm`.
- Commands: `Toolbar` (roving focus, overflow menu), `MenuBar`, `ContextMenu`; `MenuList` gained
  submenus, shortcuts and radio items.
- `DataGrid`: every behaviour is the developer's, today's value its default. New settings
  `tooltipDelay` (500), `extraRows` (4), `columnWidth` (140), `columnMinWidth` (48), `rowStatusWidth`
  (28), `selectionColumnWidth` (36), `resizeStep` (10), `resizeFineStep` (1), `pagerNeighbors` (1),
  `pagerNavigation` (`true`), `pagerInfo` (`true`), `headerFilterPageSize` (100), `headerFilterRows`
  (8), `exportPageSize` (1000), `trueTexts` / `falseTexts`, `editKeys` (`['Enter', 'F2']`),
  `clearKeys` (`['Delete']`), `editOnKeyPress` (`true`), `startEditAction` (`'dblClick'`); column
  fields `headerCell`, `editOnKeyPress`, `startEditAction`, `trueTexts`, `falseTexts` (a column's
  value wins); lookup fields `pageSize` (50), `filterSearchLimit` (1000), `parallelRequests` (6),
  `pasteSearchLimit` (50); prop `layoutStorage` (default `localStorage`). Events, the standard names,
  `…ing` cancelable: `onCellClick`, `onCellDblClick`, `onRowClick`, `onRowDblClick`, `onCellPrepared`,
  `onRowPrepared`, `onContentReady`, `onDataErrorOccurred`, `onEditingStart`, `onInitNewRow`,
  `onSaving` / `onSaved`, `onRowInserting` / `Inserted`, `onRowUpdating` / `Updated`, `onRowRemoving` /
  `Removed`, `onEditCanceling` / `Canceled`, `onFocusedCellChanging` / `Changed`,
  `onFocusedRowChanging` / `Changed`, `onKeyHandling` (`onKeyDown`, a DOM event name in
  JSX), `onOptionChanged`, `onExporting` / `onExported`, `onContextMenuPreparing` (the column menu's
  items, and a row menu on right click or Shift + F10 when items are added), `onToolbarPreparing`,
  `onSelectionChanging`, `onSortChanging` / `Changed`, `onFilterChanging` / `Changed`,
  `onPageChanging` / `Changed`, `onLayoutChanging`, `onSearchTextChanging`, `onCopying`, `onPasting`;
  every event also as `grid.onX(fn)`. State and methods: `status`, `loadError`, `failedBlocks`,
  `editingCell`, `saving`, `exporting`, `focusedRowIndex`, `focusedRowKey`, `getVisibleRows()`,
  `getRowElement()`, `getCellElement()`, `getKeyByRowIndex()`, `getRowIndexByKey()`, `byKey()`,
  `cellValue()`, `navigateToRow()`, `focusCell()`, `editCell()`, `editRow()`, `closeEditCell()`,
  `beginUpdate()` / `endUpdate()`, `repaint()`, `columnOption()`, `getCombinedFilter()`, `state()`.
  `OptionList` `extraRows` (6) and `typingDelay` (600); `KeyedItems` `parallelRequests` (6) and
  `pasteSearchLimit` (50).
- `DataGrid` summaries's `summary`. Prop and property `summary` (`totalItems`,
  `groupItems`, `calculateCustomSummary`, `recalculateWhileEditing`, `skipEmptyValues`, `texts`, each
  followed when a function); item fields `column`, `summaryType` (`sum`, `min`, `max`, `avg`, `count`,
  `custom`), `name`, `showInColumn`, `valueFormat` (`Intl` options or a function; default the column's
  format), `displayFormat` (`{0}`, `{1}`), `customizeText`, `alignment`, `cssClass`, `skipEmptyValues`,
  `visible`, and for group items `showInGroupFooter`, `alignByColumn`. Settings `totalSummary`,
  `groupSummary` (an item's `visible` wins), `totalSummaryTabStop`, `remoteSummary` (`auto` / `true` /
  `false`); `groupLoadPageSize` also paces every-row loads for summaries. `getTotalSummaryValue(name)`
  (by name, place, type, column or `type_column`), `getGroupSummaryValue(key, name)`, `summaryStatus`,
  `onSummaryChanged` (`{ total, editing }`). The row of totals sits under the rows in a sticky row group,
  moves sideways with the columns (sticky ones stay), stacks several items in a column, is a row of the
  ARIA model and a Tab stop of its own; its cells read as items that name their column ("Sum of Amount:
  1,234"). Group items show after the group row's count, under their columns in the group row, or in
  group footer rows (pooled like the other rows, reached by the arrows, in pages too). Totals of rows in
  memory are worked out in the data path; a source that loads pages or blocks asks its adapter
  (`DataSource.loadSummary`) or loads every matching row once (shared with grouping); a server that
  groups gets the group summaries with the groups, and group items only memory can work out group in
  memory. `rowType` `groupFooter` and `totalFooter` in the click and prepared events; `GroupCellContext`
  `summaryItems`. Export: group footers after their rows and the totals last in the CSV and
  `exportRows()`, group items on the group lines; option `summaries`. Texts `gridSummary…`,
  `gridSummarySeparator`, `gridTotalSummary` in en and tr.
- Feedback: `ProgressBar`, `Spinner` (with `Spinner.cover`), `Tooltip` / `addTooltip`, `Toast` /
  `toast` / `Toaster`.
- `Control` binds DOM events given from code (`new Button({ onclick })`); its private state getter is
  `controlState`, so a subclass may have a `state` field.
- Fixed: `Stack`, `Grid` and `DockPanel` overflowed the call stack when a child was added in their
  `ref`. `TreeView` reported a check again and again when `checkedKeys` was bound both ways with
  `onCheckChanged` writing the keys back; keys equal to the checked ones now change nothing. A tooltip
  shown for keyboard focus closed at once when focusing scrolled its field into view; it now follows
  the field while the page scrolls and closes only if the field is off the screen when scrolling ends.

### DataGrid selection look, menu tones, deletions in one save

- Selected rows wear the design language's selection look, as the lists and the tree do: tokens
  `datagrid.selected` (`color.selection.bg`, was `color.accent.subtle`), new `selected-text`
  (`color.selection.fg`), `selected-border` (`color.selection.border`), `selected-border-width`
  (`selection.border-width`), `selected-effect` (`effect.selection`), `indicator-width`,
  `indicator-length`, `indicator-radius` (`indicator.*`) and `indicator-color`
  (`color.selection.indicator`). The fill is the row's background, the frame and the effect are
  drawn over the cells (sticky ones too) and the bar at the start where the language has one (Fluent);
  none of it takes room. Hover and the active row's tint lie over the fill, the focus ring on top; on
  a selected row the fill stands for the stripe and the new-row tint.
- `datagrid.ghost-shadow` and `datagrid.export-shadow` are `{elevation.popup}` (were `{shadow.8}`).
- `MenuItem.tone` (`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`): `MenuList`
  writes `data-tone` on the item (none for `standard`) and follows a function. The grid gives each
  action's `tone` to its items in the row's "more" menu, the context menu and the bars' "Actions" menu.
- `deleteRows(rows)`: several rows in one save, asked once. The ready `remove` on several rows
  (bars, context menu) uses it, through the data layer's `ChangeTracker.removeRows`: in `wait` and
  `background` one save, one request when the adapter saves in batches; `batch` marks them as before.
- Docs: the selection look (Selection), `tone` and the one save (Row actions), `deleteRows` (API).
  `e2e/checks/36-datagrid-bar-actions.mjs` checks that the Delete item carries `data-tone="danger"`.
- `Toolbar`: a button that moves into the "more" menu keeps its `tone` on the menu item.

### DataGrid master-detail rows

- `masterDetail` (each field a `Bind`, live through `grid.masterDetail`): `enabled` (the expand
  column, after the status and check box columns, pinned like them), `template(ctx)` (what a row's
  details hold: a component, an element or a text; `ctx` has `row`, `rowIndex`, `key`, `grid`,
  `collapse()`), `autoExpandAll`, `canExpand` (a value or a function of the row), `keepDetails`
  (default `true`: a closed row keeps its content), `keepLimit` (default `100` details kept out of
  view), `height` (a value or a function of the row; default the content's), `estimatedHeight`
  (default `200`), `columnWidth` (default `36`), `toggleKeys` (default `['Enter', ' ']`), `arrowKeys`
  (default `true`). Changing `enabled`, `autoExpandAll` or `template` opens or closes every row again.
- A row's details are a row of their own under it, one cell across the grid that stays in place while
  the columns scroll sideways. They are not pooled: made the first time they show, kept while the row
  is open (parked out of view, laid out but not drawn), disposed when the row leaves the data, past
  `keepLimit`, on closing without `keepDetails`, or with the grid. Their height is measured (a
  `ResizeObserver`, so a tab or a nested grid that changes size moves the rows after it) and fed to the
  scroll geometry (`ExtraHeights`, two Fenwick trees), so the scroll bar, `reveal` and moving to a row
  stay right in the virtual list and on a page; the pooled rows keep their path.
- Methods `expandRow(key)`, `collapseRow(key)`, `isRowExpanded(key)` (reactive), `expandAllRows()`,
  `collapseAllRows()`. The row events are the groups' ones, now with `kind: 'group' | 'detail'` (and
  `row` for details): `onRowExpanding` / `onRowCollapsing` (cancellable) and `onRowExpanded` /
  `onRowCollapsed`, from the user and from code. `onRowPrepared` with `rowType: 'detail'`,
  `getVisibleRows()` lists the details after their row. `GridRowExpandingEventArgs` and
  `GridRowExpandedEventArgs` are unions by `kind`: a handler that reads a group's `key` narrows first.
- Keyboard and ARIA: Enter / Space and Right / Left on the expand cell, Tab into the row's details,
  Escape or Shift+Tab back to the row, Tab out of the grid from their last stop; with details on the
  screen Tab never lands in another row's details. The arrow is a button with `aria-expanded` and
  `aria-controls`; grouped (a treegrid) the row says `aria-expanded` too. The details come right after
  their row in `aria-owns`, count in `aria-rowindex` / `aria-rowcount`, and are named “Details of row
  3”. Clicks, keys, focus, paste and tooltips inside the details are left to their content.
- Texts `gridDetails`, `gridDetailsOf` (en, tr); tokens `datagrid.expand-color`, `expand-radius`,
  `detail-padding`, `detail-background`. Docs: “Master-detail” page (`/datagrid/master-detail`).
  `e2e/checks/39-datagrid-master-detail.mjs`.

### DataGrid edit forms, popups and validation rules

- `settings.editMode: 'row' | 'cell' | 'batch' | 'form' | 'popup'` (default `'row'`, live): how a
  row is edited and when it is handed to saving. `saveMode` still says how a row handed over is
  sent. `'row'` is what the grid did before (in the cells, on leaving the row); `'cell'` saves an
  existing row as each of its cells is left (a new row on leaving it); `'batch'` sets the save mode
  to `'batch'` (the same as `saveMode: 'batch'` with `'row'`), and switching to or from it starts
  again with the data, like `saveMode`.
- `'form'`: the row opens as a form in its place, across the grid's width — the kit's `FormLayout`
  with a field per column, each the editor its cell gets (by type, a lookup's, the column's own
  `editor`), framed and labelled, read-only where the user cannot fill it, with the messages of the
  checks on the fields and the row's own message above them. The rows after it move down by its
  height, in the virtual list and on a page. Save (or Enter in a one-line field) saves the row as the
  save mode says, Cancel (or Escape) gives it up; focus goes into the form and back to the row. A
  field whose value changed through another (`setCellValue`) is made again. Typing on a cell does
  not open it; Enter, F2, the start-edit click, the `edit` action, `editRow()` and `addRow()` do.
  Editing another row, a new row, sorting, filtering, paging and `refresh()` give the form up, as
  the standard does.
- `'popup'`: the same form in the kit's `MxForm` as a modal window, for existing and new rows:
  Save and Cancel in its footer (Enter and Escape press them), the close button cancels, focus stays
  inside and comes back to the row.
- `form` prop / `grid.form` (live): `items` (field names or kit `FormItem`s — a column's field gets
  its editor; groups, buttons and templates are the form's own), `colCount` (default 2),
  `minColWidth`, `labelMode`. `popup` prop / `grid.popup` (live): `title`, `showTitle`, `width`,
  `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`. Column
  `formItem`: `visible`, `colSpan`, `label`, `helpText`, `editorOptions`, `order`. `onOptionChanged`
  tells `form.*` and `popup.*`.
- Column `validationRules`, the standard set: `required` (`trim`), `numeric`, `range`, `stringLength`
  (`trim`), `pattern`, `email`, `compare` (`comparisonTarget(row)`, `comparisonType`), `custom` and
  `async` (`validationCallback({ value, row, column, rule })`), each with `message`,
  `ignoreEmptyValue` (defaults) and, where the standard has it, `reevaluate` (on for
  `async`). Checked with the kit's `checkRules` as a value is written and before the row is saved,
  after `required` and `validate` (which keep working); `async` rules run last and together, the row
  waits for them (its cell busy) and a value is not checked twice. Batch `saveChanges()` checks every
  row first. Messages in the cells, the form and the window.
- `onRowValidating` (`{ key, row, isNew, changed, errors, isValid, errorText, cancel }`) after the
  cells, once per check of the row: add or take out messages, or say no with `errorText`.
  `onEditorPrepared` (`{ field, row, isNew, editor, element, place: 'cell' | 'form' }`).
  `onEditingStart` comes for the form too (`field` `''`); `onEditorPreparing` for every form field
  (`cancel` leaves it out).
- `settings.confirmDelete` (default `true`): `deleteRow()` and the ready `remove`
  ask with the kit's `confirm()` first, once for all the rows an action deletes; not in batch mode.
  `settings.selectTextOnEditStart` (default `true`, what the grid did): off, the caret goes to the end.
- Methods: `editRow(i)` opens the form in the form modes, `editRowByKey(key)`, `saveEditData()`,
  `cancelEditData()`; `closeEditCell()` keeps the form's values. Texts in en and tr:
  `gridConfirmDelete`, `gridConfirmDeleteRows`, `gridConfirmDeleteTitle`, `gridEditRowTitle`,
  `gridNewRowTitle`, `gridRowInvalid`. Tokens: `datagrid.form-padding`, `form-gap`,
  `form-background`, `form-message-color`, `form-label-color`, `form-label-font-size`.
- Docs: a new page "Edit forms and popups" (`/datagrid/forms`: the form with groups and an edit-mode
  switch, the window, the rules with an async one) with the tables of modes, settings, form and popup
  options, rules, events and methods; rows in the API and layout pages; a browser check
  `e2e/checks/38-datagrid-forms.mjs`.

### DataGrid actions in the bars

- Row actions can show in the toolbar (`actionsLocation: 'toolbar'`, the new `rowActions` toolbar
  item, at the start, placed through `toolbar.items` like the others) or at the start of the bottom
  bar (`'bottom'`, on a kit `Toolbar` of its own) for the rows they act on: the selected rows, or the
  active row without selection (`actionsTarget: 'selection' | 'focused' | 'auto'`). Default
  `'row'`, as before; an action's `location` wins, and the actions column shows only while an action
  sits in the row. No target: nothing shows. One row: its own actions, as the row would show them.
  Several rows: the actions every row has (same `id`, visible for each), disabled while disabled for
  one of them (`actionsMultipleEnabled: 'any'`: enabled for any, and run on those), with the count
  after the text ("Print (3)", `actionsShowCount`), named "Print, 3 rows" and described by what the
  bar acts on ("Actions for 3 selected rows"), which is announced when it changes.
- Running on several rows: `onclickMany(rows, e)` once, else `onclick` for each row in turn, a
  promise waited for; a throw, a rejection or a promise of `false` counts the row as failed and does
  not stop the others unless `actionsStopOnError` (or the action's `stopOnError`). While it waits the
  export load panel shows the progress and a Stop button (`actionsProgress`, `actionsStopButton`,
  `grid.stopAction()`); the outcome is announced ("Print: 2 of 3 done, 1 failed"). `multiple: false`
  keeps an action to one row (the ready `edit`). The ready `remove` marks every row in batch mode and
  sends each in the other modes.
- After "select all" over a server (rows not loaded) only actions with `onclickSelection(selection,
  e)` show; they get the selection state of `grid.selection`.
- A row's actions are in its context menu (right click, Shift+F10 / the context menu key), wherever
  they show: inside a selection of several rows the common ones, with the count, for all of them;
  right click makes the row the active one. `actionsContextMenu` and an action's `contextMenu` turn
  it off; `onContextMenuPreparing` gets them in `e.items`; an empty menu does not open.
- `actionsDisplay: 'menu'`: a row shows only its "more" button, every action in its menu, and the
  column is as wide as that button (unless an action is a button always); the bars show one
  "Actions" menu button. An action's `menu: 'auto' | 'always' | 'never'` wins. The row's "more"
  button is named "More actions for row N".
- New: `onActionRunning` (cancelable: `{ action, rows, selection, location }`), `onActionRan`
  (`{ action, rows, location, done, failed, canceled, errors }`), `grid.runAction(id, rows?)`,
  `grid.actionTargets`, `grid.barActions`, `grid.stopAction()`. A press in a row runs through the same
  events. `GridAction.onclick` is optional now and may return a promise; new fields `location`,
  `menu`, `multiple`, `multipleEnabled`, `stopOnError`, `showCount`, `contextMenu`, `beginGroup`,
  `onclickMany`, `onclickSelection`. Texts in en and tr (`gridActionCount`, `gridActionCountLabel`,
  `gridActionsForRow`, `gridActionsForSelectedRow`, `gridActionsForSelectedRows`, `gridActionRunning`,
  `gridActionProgress`, `gridActionStop`, `gridActionDone`, `gridActionPartly`, `gridActionFailed`,
  `gridActionStopped`, `gridMoreActionsForRow`).
- Docs: "Row actions" has a new example (location switch, menu only, Approve with `onclickMany`,
  Print row by row, Delete) and tables of the settings, action fields, events and members; a browser
  check `e2e/checks/36-datagrid-bar-actions.mjs`.

### DataGrid Excel export

- New entry `@motifx-community/ui/excel`: `exportDataGrid({ component, worksheet, … })` writes a
  `DataGrid` to an ExcelJS worksheet's `excelExporter.exportDataGrid`; ExcelJS is an
  optional peer dependency the app brings, and apps that do not import the entry never load it. It
  resolves with the cells written (`{ from, to }`). Options `topLeftCell` (`{ row, column }` or
  `'B2'`), `customizeCell({ gridCell, excelCell })`, `autoFilterEnabled`, `keepColumnWidths`,
  `selectedRowsOnly`, `loadPanel`, `encodeExecutableContent`, and `headers`, `frozenHeader`, `groups`,
  `outline`, `summaries`, `numberFormats`, `booleanText`, `pageSize`, `onProgress`, `signal`. Also
  `excelNumberFormat` and `excelDateFormat` (an `Intl` format as an Excel number format).
- The sheet: a frozen header row, the rows in the grid's order with its filter, search and grouping
  (every matching row, a server's in parts), group rows ("Column: value" with their summary items,
  aligned ones under their columns) with outline levels, group footers and the totals (several items
  of a column a row each). Numbers stay numbers with a number format made from the column's `Intl`
  format, dates stay dates, yes/no cells are `TRUE` / `FALSE`, lookup and list cells and columns with a
  `format` function hold their texts; widths follow the grid.
- Column `format` also takes `Intl` options for number and date columns (shown by the grid, and the
  number format in Excel).
- `export` prop and live `grid.export` (`formats`, default `['csv']`; `allowExportSelectedData`;
  `texts`: `exportTo`, `exportAll`, `exportSelectedRows`, `formats`): the toolbar's export button
  offers a command per format, and "Export selected rows" for each, as a menu when there is more than
  one. `csv` is written by the grid as before; other formats raise `onExporting` with `format`,
  `component` and `selectedRowsOnly`, where the app writes the file. `exportTo(format, options)`,
  `exportSheet(options, write)` (the rows as a sheet of typed cells for any writer; `onExported`
  follows with its `format`), `cancelExport()`; types `GridSheet`, `GridSheetRow`, `GridSheetCell`,
  `GridSheetColumn`, `GridExportCell`, `GridSheetOptions`, `GridExportSettings`, `GridExportTexts`,
  `GridLoadPanel`.
- A load panel over the rows while an export runs, with its progress and a button that stops it
  (`loadPanel`; on for `exportDataGrid`, off for `exportCsv` / `exportRows`). A stopped export rejects
  with the `AbortError`. Texts `gridExportAll`, `gridExportSelectedRows`, `gridExportProgress`,
  `gridExportCancel`, `gridExportCanceled`, `gridFormatXlsx`, `gridFormatCsv`, `gridFormatPdf` in en
  and tr. ExcelJS 4.4 as a dev dependency for the tests and the docs.

### DropDown, ComboBox, Autocomplete, Lookup

- `DropDown`: pick one item (APG select-only combobox); `items` (plain values, `DropDownItem`s or any
  shape through `textField` / `valueField` / `iconField` / `groupField` / `enabledField`) or a
  `dataSource` of `@motifx-community/data` (searched on the server, a value on no loaded page found
  by key); `searchEnabled` (a TextBox in the list), `searchMode`, `searchDelay`, `clearButton`,
  `itemTemplate`, `fieldTemplate`, `matchWidth`, groups, type-ahead, long lists drawn in view only.
- `ComboBox`: a text field whose list follows the text (APG combobox, list autocomplete); items in
  memory or a data source; `minSearchLength`, `searchDelay`, `acceptCustomValue`, `autoHighlight`,
  `showDropDownButton`. `Autocomplete`: the value is the text.
- `Lookup`: a drop-down with a table-like list (`columns` with captions, widths, alignment), a search
  box on by default, for data sources.
- Shared parts: `OptionList` (`role="listbox"`, items or an `ItemSource` that loads while scrolled,
  windowing with spacer rows, `handleKey`, `typeAhead`), `DataItems` (an array or a `DataSource`
  behind one interface), `readItemField`, `functionValue` (a function prop with parameters is the
  value, one without is a getter). `@motifx-community/data` is a peer dependency.

### Calendar, DateBox

- `Calendar`: the APG date grid with year and decade views; `min`, `max`, `disabledDates`, `locale`
  (names and first day of the week from `Intl`), `firstDayOfWeek`, `showWeekNumbers` (ISO),
  `showOtherMonths`, `showTodayButton`, `currentView`, `minView` (pick a month or a year).
- `DateBox`: `type` date / time / datetime typed through a mask in the locale's order
  (`datePatternOf`), a calendar and a list of times (`timeStep`, `showSeconds`) on a popup,
  `displayFormat` while not edited, `min` / `max` / `disabledDates` checked, an unfinished text
  reported (`unfinished`, `invalidDate`).

### FormLayout

- `FormLayout`: the fields of a data object on a grid (`columns`, `minColumnWidth`), each with an
  editor by name or by the type of its value (`FormLayout.editors` can be extended), bound both ways;
  groups with captions, `colSpan`, `visible`, buttons (`submit`), templates; one validation group;
  `onValidSubmit` / `onInvalidSubmit`.

### Field

- A stored `null` stays `null` (a nullable value round-trips). A field checked when it is left waits
  for a press in progress to end, so an error line appearing cannot move a button away from the
  pointer. The clear button is shared (`showClearButton`). `Popup` placements on every side
  (`top`, `start`, `end-start` …) and a closed popup stays hidden whatever its content's display.

### docs app

- The docs site is one MotifJS app: `Application` + router (history mode), `DocsLayout` with a
  `RouterView`, pages loaded when first opened, `SiteSettings` and `PageOutline` services (each
  `Section` adds itself to the outline), the side-menu search is a `TextBox`.
- Every example is its own file (`pages/<id>/examples/`), complete with imports and state; the page
  runs it and "Show code" shows its exact source, a tab per file, with a Copy button. The content
  column grows with wide windows. The browser checks fail on any MotifJS console warning.

### design system

- The look comes from `@motifx-community/design-system` (a peer dependency): its primitive,
  semantic and density tokens, the three themes (`[data-theme]`, `prefers-color-scheme` by
  default), `[data-density="compact"]`, the fonts, the reset, the typography ramp, the focus ring
  and the reduced-motion / reduced-transparency / forced-colors overrides. `styles.css` imports
  the design system's stylesheet first. This package defines no color, size, font or motion value
  of its own and never redefines a design-system token.
- Component tokens (`button.*`, `form.*`, `groupbox.*`, `split.*`): DTCG 2025.10 JSON in
  `tokens/component/`, one fine-tuning knob per component, each referencing a design-system token
  (or a literal size only that component has). Built with Style Dictionary against the design
  system's source — a reference to a token that does not exist, or a `$type` mismatch, fails the
  build — and written as `--mx-<component>-*` inside `@layer mx.components`, after the design
  system's layers. Title bars read `color.bg.bar` and `bar.height` (density-aware), the form
  footer `color.bg.layer`, the close button's hover the danger colors.
- `./tokens`: `cssVar` / `cssProperty` over the design system's token names plus the component
  token names (`TokenName`), and the `componentTokens` map.
- Tests check that the generated files match the source, that every kit CSS file sits in
  `@layer mx.components` and that every `var(--mx-…)` it uses is a design-system or component
  token; `npm run lint:css` runs the design system's shared stylelint config.

### components

- `Control`: the base of every control. `text`, `enabled` (alias `disabled`), `visible`,
  `tabStop` and `tabIndex` work the same as props (value or getter) and as properties set from
  code; a value set in code replaces a bound getter; every property is reactive to read.
  `enabled` is the control's own value (like the HTML attribute), `isEnabled` whether it can be
  used now (like CSS `:enabled`). `enabled = false` disables the whole subtree (native
  `disabled`, otherwise `tabindex="-1"` + `aria-disabled`, pointer input swallowed), restores it
  exactly, nests, follows content added later, and leaves windows opened inside usable. Hiding or
  disabling the focused part moves focus on instead of dropping it to `<body>`. `focus()`,
  `canFocus`, `focused`, `focusWithin`, `parentControl`, `onAccessKey()`, `addShortcut()`.
  Layout props on every control: `dock`, `left` / `top` / `right` / `bottom`, `width` /
  `height`, `row` / `column` / `rowSpan` / `columnSpan` (1-based, as CSS grid lines). Subclass
  API: `applyProperty` / `peekProperty`, `observeProperty`, `getProperty` / `setProperty` /
  `bindProperty`, `focusElement`, `hasModel` / `writeModel` (two-way `x-model`), `strings`.
  Untouched properties cost nothing; only getter props create effects; state is kept off class
  fields so `ref` callbacks (called by core before fields exist) stick.
- `FocusContainer`: remembers the active control inside (`activeControl`, reactive and
  assignable; `restoreFocus()`) and is a scope for Tab: the outermost one runs `tabIndex` order
  per level of the control tree (ties in document order, one radio per group) and leaves Tab to
  the browser until a control sets a `tabIndex`; `cyclesTab` keeps Tab inside a modal window.
- Keyboard: `&Text` access keys (`parseAccessKey`): Alt + key, Control + Option + key on Apple
  platforms (where Option types characters), written to `aria-keyshortcuts`. The key is
  underlined while the modifiers are held, after an Alt tap (kept from the browser menu while the
  page has access keys), or always with `data-mx-access-keys="always"`; AltGr is ignored; scope
  is the modal form, else the focused window, else the page; shared keys cycle focus; disabled
  controls do not take the key; plain elements take part via `aria-keyshortcuts`.
  `addShortcut(chord, handler, { scope, inEditable })` and `control.addShortcut` (most specific
  scope first, silent across a modal form, plain keys left to text fields and windows). One
  capture listener for the document.
- Focus guard: focus inside a Control never falls to `<body>` when it is removed, disposed or
  hidden; it moves to the next usable element from that spot.
- Layout: `Panel` (padding as token step or free CSS; `scrollable`, a Tab stop so it can be
  scrolled by keyboard; docking: `dock` top / bottom / start / end / fill / float on any child,
  `start` / `end` following the reading direction, document order, CSS grid, no script on
  resize), `Stack` (vertical / horizontal flex line, `gap`, `align`, `justify`, `wrap`), `Grid`
  (`rows` / `columns` as CSS tracks or pixels, with `*` / `2*` as a shrinkable-share shorthand;
  children by `row` / `column` / spans), `GroupBox` (`<fieldset>` + `<legend>`, access key focuses
  its first field, docks like a Panel, `controls.add` goes inside the frame), `SplitContainer`
  (`orientation` as in Stack, `position`, `fixedPanel`, `firstMinSize` / `secondMinSize`,
  `collapsed`, `resizable`, `step`, `splitterSize`; pointer and keyboard with a localized
  `separator`; RTL aware; `first` / `second` are `SplitPanel`s).
- `Label`: a `<label>` with the type ramp (`textStyle`) and theme `tone`s, inheriting font and
  color when unset. `target` (control, element or id) makes it the target's accessible name
  (`for`, or `aria-labelledby` for non-labelable elements); a click focuses the target and the
  access key moves focus there without clicking. Without a target it names the field inside it.
  `accessKeys`, `textAlign`, `verticalAlign`, `ellipsis` and `maxLines` (full text as a tooltip
  on hover). Labels inside a disabled control dim.
- `Button`: standard / accent / danger, outline and ghost buttons with reactive `variant` /
  `size` / `tone` props exposed as `data-*` attributes; built on `Control`. Static look props
  create no effects. Solid buttons are pressable the way the design system describes: opaque fill,
  bottom edge (`control.edge.width`, `color.stroke.control.edge`), inner top highlight
  (`color.highlight.control`), press offset on `:active`; the focus ring keeps its inner ring.
- `MxForm`: a form (title bar, close/maximize/minimize caption buttons, content area) shown when
  needed. `show(host, disposeRef?)` opens it as a modeless window, `showDialog(host,
  disposeRef?)` as a modal one that resolves with a `FormResult` (`'ok'`, `'cancel'`, any string,
  like `dialog.returnValue`); `host` is any component or the `Application`. It dies when it
  closes, or when `host` or `disposeRef` is disposed while it is open. Content from a subclass
  `view()`, the `content` prop or JSX children; cancelable async `onClosing` (reason `'code'`,
  `'user'` or `'owner'`), `onClosed`, `defaultButton` / `cancelButton` (props or assignable from a
  subclass), `data-result` buttons, nested dialogs, window order, dragging and edge resizing
  (`resizable`). A modal form closes on Escape by default (`closeOnEscape`), keeps Tab inside and
  cannot be minimized; Tab moves on from a modeless window to the page. In JSX,
  `x-model={() => state.open}` binds it two-way (the form writes `false` back when the user closes
  it and keeps its state between openings; `modal` picks dialog or window). Minimize collapses a
  window to its title bar, or moves it into `minimizeTarget`. Events inside a window stop at the
  window's root. `form.*` tokens.
- `src/core/`: `FormResult`, `CloseReason`, the reactive `UiLocale` for component texts (en, tr),
  focus helpers, the page-wide window stack and the scroll lock.
- Base styles of the kit: only the aria-disabled dimming inside a disabled control and the
  access-key underline, inside `@layer mx.components`; everything else comes from the design system.

### entries

- `.` (components and core exports), `./tokens`, `./styles.css`. The per-theme files are the
  design system's (`@motifx-community/design-system/themes/*.css`).

### docs

- A full reference page per component (usage both ways, behaviour, keyboard, accessibility,
  localization, API tables, styling hooks, tokens) and a token reference: the component tokens,
  and the design system's layers for reference (from its `json/*` export). The theme and density
  switches use the design system's `setTheme` / `setDensity`.
- The DataGrid reference is a side-menu group of eight pages (overview, editing, filtering and
  search, lookup columns, grouping and summaries, selection and export, layout and events, API
  reference), at most five live grids each, so no page is slow to open; a pointer to a section on
  another page is a link (`[text](/page#anchor)` in a table cell's text).
