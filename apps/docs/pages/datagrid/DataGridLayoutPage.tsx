import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { withOrders } from './code';
import Events from './examples/Events';
import KeepLayout from './examples/KeepLayout';
import RuntimeColumns from './examples/RuntimeColumns';
import Switches from './examples/Switches';
import Toolbar from './examples/Toolbar';

const SETTINGS = [
  ['editable', '`false`', 'Allows editing cells in place. A column can set its own value, also per row with `(row) => boolean`.'],
  ['creatable', '`true`', 'Allows filling the cells of new rows. A column with its own `editable` and no `creatable` uses the same value, and `editable: false, creatable: true` can be entered only when the row is created.'],
  ['addRows, newRowButton, tabChain', '`false`, `true`, `true`', 'Allows the user to add rows, shows the toolbar\'s “New row” button, and makes Tab on a new row\'s last cell open the next one.'],
  ['enterMoves', "`'none'`", 'Enter in an editor keeps the value and either stays, moves `down`, or continues like Tab (`next`).'],
  ['rowStatus', '`true`', 'The narrow column that marks new, changed, deleted, saving and failed rows.'],
  ['saveButtons, errorSummary', '`true`', '“Save changes” and “Discard” in the toolbar in batch mode (disabled when there is nothing to save), and “N rows with errors” and “Next error” in the bar below the rows.'],
  ['sortable, multiSort', '`true`', 'Sorts from the header, and Shift adds a column to the sort.'],
  ['resizable, movable, hideable, pinnable, menu', '`true`', 'What the user can do with the columns. A column can set its own values.'],
  ['resizeMode', "`'widget'`", 'The result of dragging a column edge: `widget` resizes that column and shifts the following ones, and `nextColumn` moves only the edge between it and the next column, which takes up the difference. A column can set its own value.'],
  ['headerButtons', "`'hover'`", 'The menu button appears on hover and focus (always on touch screens), or `always`.'],
  ['columnChooser, layoutReset', '`true`', 'The column list and “Reset layout” in the column menu.'],
  ['columnChooserButton', '`false`', 'A toolbar button that opens the column list (while `columnChooser` is on).'],
  ['tooltips, striped, rowCount', '`true`, `false`, `true`', 'The full text of a clipped cell, stripes, and the row count.'],
  ['pager', '`true`', 'The pager in paged mode. `auto` shows it only when there is more than one page.'],
  ['actionsColumn, actionsPosition, actionsSticky, actionsWidth', "`true`, `'end'`, `true`, `140`", 'The actions column, at the start or the end, pinned to its edge or scrolling with the rows, and its width.'],
  ['actionsLocation, actionsTarget, actionsDisplay', "`'row'`, `'auto'`, `'auto'`", 'Where actions appear (the row, the toolbar or the bottom bar), which rows the bars act on, and whether to use buttons or a menu only. See [Row actions](/datagrid/editing#actions).'],
  ['actionsMultipleEnabled, actionsShowCount, actionsStopOnError', "`'all'`, `true`, `false`", 'Actions on several rows: enabled for all or any, the count after the text, and whether a failed row stops the rest.'],
  ['actionsProgress, actionsStopButton, actionsContextMenu', '`true`, `true`, `true`', 'The progress panel and its Stop button while an action runs on several rows, and the actions in the row\'s context menu.'],
  ['selection, selectionColumn, selectAll, selectedCount', "`'none'`, `true`, `true`, `true`", '`single` or `multiple`, the check box column, the header check box and Ctrl+A, and “N selected” in the bar.'],
  ['filterRow, headerFilter', '`false`', 'The filter row and the header filter. A column can enable or disable them for itself.'],
  ['syncLookupFilterValues', '`true`', 'A lookup column\'s filter row and header filter list only the keys of rows that match the other filters. When disabled, they list the lookup source. A column can set its own value.'],
  ['filterDelay', '`300`', 'The delay in milliseconds from the last key typed in the filter row to the filter.'],
  ['copyable, exportable', '`true`', 'The columns included in Ctrl+C and in an export. A column can set its own value.'],
  ['copyValues, copyHeaders', "`'shown'`, `false`", 'Ctrl+C copies the displayed text of the cells or their `raw` values, and copied rows start with the column titles.'],
  ['paste, pasteNewRows', '`true`, `false`', 'Ctrl+V writes into editable cells, and pasted lines past the last row open new rows (with `addRows`).'],
  ['exportButton', '`false`', 'An “Export” button in the toolbar, using the formats of the `export` prop (CSV by default), as a menu when it offers more than one command.'],
  ['saveLayout', '`true`', 'With `layoutKey`, the layout, the filters and the search text are saved and restored.'],
  ['searchPanel', '`false`', 'The search box in the toolbar. `searchText` and `searchByText()` also search without it.'],
  ['filterPanel, filterSyncEnabled', "`false`, `'auto'`", 'The filter panel below the rows, and whether the filter row and header filters are part of the filter value (`\'auto\'` applies while the panel is visible). See [Filter panel and builder](/datagrid/filtering#filter-panel).'],
  ['searchPanelWidth, searchPlaceholder',"`160`, `uiLocale` “Search…”", 'The box\'s width (in pixels or as a CSS length) and its placeholder.'],
  ['searchDelay', '`700`', 'The delay in milliseconds from the last key typed in the search box to the search. Enter searches immediately.'],
  ['highlightSearchText, highlightCaseSensitive', '`true`, `false`', 'Highlights matches in the cells, and limits highlighting to text in the same case (the search itself is case-insensitive).'],
  ['searchVisibleColumnsOnly', '`false`', 'Searches only the visible columns. By default, hidden columns are included.'],
  ['searchable', '`true`', 'The columns the search covers. A column can set its own value, and a column that disables its own filters is excluded.'],
  ['groupPanel', '`false`', 'The group panel at the start of the toolbar, with a chip per grouped column and a drop area for grouping by headers.'],
  ['groupPanelDragging, groupPanelEmptyText', "`true`, `uiLocale` “Drag a column header here…”", 'Allows headers to be dragged to the panel and chips back (otherwise, the panel only displays the grouping), and sets the text of the empty panel.'],
  ['groupMenu', 'Not set', '“Group by this column”, “Ungroup” and “Ungroup all” in the column menu. When not set on the grid and column, they appear while the panel accepts headers, as the keyboard alternative.'],
  ['groupable, showWhenGrouped', '`true`, `false`', 'The columns the user can group by. A grouped column still appears among the columns. A column can set its own value.'],
  ['autoExpandAll, allowCollapsing', '`true`, `true`', 'Groups start expanded (a column\'s `autoExpandGroup` applies to its level), and the user can expand and collapse them (code always can, and a column can set its own value).'],
  ['groupExpandMode', "`'button'`", 'A group expands from its arrow and the keyboard, or with `rowClick` from a click anywhere on its row. A column can set its own value.'],
  ['groupCount', '`true`', 'Group rows show their row count. A column can set its own value.'],
  ['groupToggleKeys, groupArrowKeys', "`['Enter', ' ']`, `true`", 'The keys that expand and collapse a group row. Right and Left expand, collapse, and move in and out.'],
  ['remoteGrouping', "`'auto'`", 'What groups a data source\'s rows: `auto` uses its adapter when it supports grouping (pages or blocks), `true` always uses the adapter when the source loads by pages or blocks, and `false` always uses the browser, from every matching row.'],
  ['groupLoadPageSize', '`0`', 'For grouping or summaries in the browser over a source that loads pages or blocks, the rows per request while every matching row loads (0 means one request).'],
  ['totalSummary, groupSummary', '`true`', 'The totals row with the items of `summary.totalItems`, and the items of `summary.groupItems` in group rows and footers. An item\'s `visible` takes precedence.'],
  ['totalSummaryTabStop', '`true`', 'Makes the totals row a separate Tab stop after the rows.'],
  ['remoteSummary', "`'auto'`", 'What calculates the summaries of a source that loads pages or blocks: `auto` uses its adapter when it has the `summary` capability, `true` always uses the adapter, and `false` uses the browser, from every matching row. `custom` items and columns with a `value` reader are always calculated in the browser.'],
  ['dragThreshold', '`5`', 'The distance in pixels a pressed header or chip moves before it is dragged.'],
  ['dragGhost', '`true`', 'A dragged header or chip shows its title next to the pointer, marked with what a drop would do: group, move or ungroup. While a header is being dragged, the whole toolbar accepts drops for the group panel and is marked.'],
  ['emptyRows', '`3`', 'The number of rows of space the body keeps while it has no rows to show (empty, loading or failed), so that the message appears in a grid without a height.'],
  ['columnWidth, columnMinWidth', '`140`, `48`', 'The width of a column that does not set one, and the minimum width the user can resize a column to. A column\'s `width` and `minWidth` take precedence.'],
  ['rowStatusWidth, selectionColumnWidth', '`28`, `36`', 'The widths of the row status column and the check box column.'],
  ['resizeStep, resizeFineStep', '`10`, `1`', 'The number of pixels one arrow key resizes a column (“Width” in the column menu), and with Shift.'],
  ['tooltipDelay', '`500`', 'The delay in milliseconds before a cell\'s tooltip appears under the pointer (keyboard focus shows it immediately).'],
  ['extraRows', '`4`', 'The rows rendered above and below the visible ones, so that a quick scroll shows no gap. More rows cost more per scroll.'],
  ['loadMoreDistance, preloadEnabled, loadMoreIndicator', '`0`, `false`, `true`', 'For infinite mode: the rows left below the view when the next page loads, a page loaded ahead (in virtual mode, one on each side), and the “Loading more rows…” indicator with Retry. See [Infinite scrolling](/datagrid/scrolling#infinite).'],
  ['columnRenderingMode, extraColumns', "`'standard'`, `2`", 'With `virtual`, only the visible scrolling columns and `extraColumns` on each side have cells. A column\'s own `columnRenderingMode` takes precedence. See [Virtual columns](/datagrid/scrolling#virtual-columns).'],
  ['renderAsync, columnRenderingThreshold, columnRenderingDelay', "`'auto'`, `300`, `300`", 'Whether virtual columns coming into view are rendered during scrolling, once scrolling stops, or once it stops when rendering took longer than the threshold (ms), and the idle time before they are rendered (ms).'],
  ['pagerNeighbors, pagerNavigation, pagerInfo', '`1`, `true`, `true`', 'The page buttons on each side of the current page, the first, previous, next and last buttons, and “Page 3 of 12 (250 items)”.'],
  ['pagerInfoText, pagerLabel', '`uiLocale` strings', 'The pager\'s text (`{0}` or `{page}`, `{1}` or `{count}`, `{2}` or `{total}`) and its accessible name.'],
  ['pagerDisplayMode', "`'adaptive'`", '`full` shows page buttons and page sizes as buttons, `compact` shows a page number box and a drop-down of sizes, and `adaptive` uses `full` while it fits in the bar.'],
  ['pageSizeSelector, allowedPageSizes', "`false`, `'auto'`", 'The page sizes in the pager, and the sizes it offers (numbers and `all`, where `auto` is half, once and twice the page size).'],
  ['pageKeys', "`'page'`", 'In paged mode, PageUp and PageDown move to the previous and next page, or move a screen of rows (`rows`).'],
  ['headerFilterPageSize, headerFilterRows', '`100`, `8`', 'The values the header filter loads per request, and the height of its list or tree in rows.'],
  ['headerFilterDateInterval', "`'day'`", 'The deepest level of the year → month → day tree in a date column\'s header filter. `null` lists every date. A column\'s `headerFilterInterval` takes precedence.'],
  ['exportPageSize', '`1000`', 'The rows an export requests from a server per request. `exportCsv({ pageSize })` takes precedence.'],
  ['trueTexts, falseTexts', "`['true', '1', 'x', '✓', '✔']`, `['false', '0', '']`", 'Pasted text read as yes and as no in a yes/no column, in addition to the `yes` and `no` strings. A column can set its own values.'],
  ['editKeys, clearKeys', "`['Enter', 'F2']`, `['Delete']`", 'The keys that open the active cell\'s editor, and the keys that clear it (`KeyboardEvent.key` values).'],
  ['editOnKeyPress', '`true`', 'Typing a character on a cell opens its editor with that character. A column can set its own value.'],
  ['startEditAction', "`'dblClick'`", 'A double-click, or one `click` on the active cell, opens its editor. A column can set its own value.'],
  ['columnHidingEnabled, bandAlign', "`false`, `'center'`", 'Columns hide while the grid is narrower than they are, a “…” column opens their values, and this sets where band captions appear. See [Bands and adaptive columns](/datagrid/bands#adaptive).'],
  ['editMode, confirmDelete, selectTextOnEditStart', "`'row'`, `true`, `true`", 'How rows are edited, in the cells (`row`, `cell`, `batch`) or in a form (`form`, `popup`), whether deleting prompts first, and whether an editor opens with its text selected. See [Edit forms and popups](/datagrid/forms#forms).'],
];

const EVENTS = [
  ['onCellClick / onCellDblClick', '`{ field, row, rowIndex, rowType, groupKey?, part, event }`', 'yes', 'Occurs when a cell is clicked or double-clicked (also in a group footer, `rowType: \'groupFooter\'`, and in the totals row, `\'totalFooter\'`). Canceling prevents selection, the group toggle and the editor.'],
  ['onRowClick / onRowDblClick', '`{ row, rowIndex, rowType, groupKey?, part, event }`', 'yes', 'The same for the row, after its cell\'s event.'],
  ['onCellPrepared', '`{ field, row, rowIndex, value, isNew, part }`', '', 'Occurs when a cell is rendered for a row, so that you can style it. Cells are reused while scrolling, so set and clear what you change. It has no cost when there are no listeners.'],
  ['onRowPrepared', '`{ row, rowIndex, rowType, groupKey?, isSelected, part }`', '', 'Occurs when a data row, group row, group footer (`groupFooter`) or the totals row (`totalFooter`) is rendered. The same rule applies.'],
  ['onContentReady', '`{ total }`', '', 'Occurs when rows have arrived and been laid out (after a load, a filter, a sort, a page change or a resize).'],
  ['onDataErrorOccurred', '`{ error, operation, row? }`', '', 'Occurs when a load (`operation: \'load\'`) or the save of a row (`\'save\'`, with `row`) fails.'],
  ['onEditingStart', '`{ field, row, rowIndex, isNew }`', 'yes', "Occurs before a cell editor or a row's edit form (`field` `''`) opens."],
  ['onEditorPreparing / onEditorPrepared', '`{ field, row, isNew, options }` / `{ field, row, isNew, editor, part, place }`', 'yes / —', 'Occur before and after the editor of a cell or form field is created. Change its props in `options` in the first event.'],
  ['onRowValidating', '`{ key, row, isNew, changed, errors, isValid, errorText }`', 'yes', 'Occurs when a row is validated before saving, after its cells. Add messages to `errors`, or set `isValid = false` (or cancel) with `errorText`.'],
  ['onInitNewRow', '`{ data, values }`', 'yes', 'Occurs before a new row opens. `data` is its initial content, and `values` is what counts as entered. Canceling opens no row.'],
  ['onSaving / onSaved', '`{ changes }` / `{ changes, saved, failed }`', 'yes / —', 'Occur before changes are sent (leaving a row, the background queue or “Save changes”) and after the response arrives.'],
  ['onRowInserting / onRowInserted', '`{ row, data }` / `{ row, key }`', 'yes / —', 'Per new row: change `data` (what is sent) or keep it unsent. The second event occurs after saving.'],
  ['onRowUpdating / onRowUpdated', '`{ key, row, changes }` / `{ key, row, changes }`', 'yes / —', 'Per changed row: change `changes` or keep them unsent. The second event occurs after saving.'],
  ['onRowRemoving / onRowRemoved', '`{ key, row }`', 'yes / —', 'Per deleted row, when the deletion is sent (in batch mode, on “Save changes”). The second event occurs after the deletion.'],
  ['onEditCanceling / onEditCanceled', '`{ rows }`', 'yes / —', 'Occurs before unsaved changes are discarded: Escape on a row, the “Cancel” action, or `discardChanges()`.'],
  ['onFocusedCellChanging / onFocusedCellChanged', '`{ rowIndex, field, previousRowIndex, previousField, row }`', 'yes / —', 'Occurs when the active cell moves (by keys, a click or code). -1 is the header and -2 is the filter row.'],
  ['onFocusedRowChanging / onFocusedRowChanged', '`{ rowIndex, previousRowIndex, row }` / `{ rowIndex, row, key }`', 'yes / —', 'Occurs when the active row changes.'],
  ['onKeyHandling', '`{ event, rowIndex, field }`', 'yes', 'Occurs when a key is pressed in the rows, an editor, the filter row or a group chip, before the grid handles it. Cancel it to handle the key yourself. The name avoids `onKeyDown`, a DOM event name in JSX.'],
  ['onOptionChanged', '`{ name, field?, value, previous }`', '', 'Occurs when a setting is assigned: `grid.settings`, `columnSettings(field)` (with `field`), `toolbar` (`toolbar.visible`, `toolbar.items`), `columnOption` (with `field`), or a column is added or removed (`name: \'columns\'`, with the fields).'],
  ['onSortChanging / onSortChanged', '`{ sort, previous, byUser }`', 'yes / —', 'Occurs before the sort changes, by the user or programmatically.'],
  ['onFilterChanging / onFilterChanged', '`{ filters, previous }` / `{ filters, filter }`', 'yes / —', 'Occurs before the filter row and header filters apply. Canceling restores the previous ones in the cells.'],
  ['onSearchTextChanging / onSearchTextChanged', '`{ text, previous }` / `{ text }`', 'yes / —', 'Occurs before the search text changes. Canceling keeps the previous text in the box.'],
  ['onPageChanging / onPageChanged', '`{ page, previous }`', 'yes / —', 'Occurs before another page appears.'],
  ['onPageSizeChanging / onPageSizeChanged', '`{ pageSize, previous }`', 'yes / —', 'Occurs before the rows per page change (0 means all). The grid returns to the first page.'],
  ['onMoreRowsLoading / onMoreRowsLoaded', '`{ skip, take }` / `{ skip, count, ended }`', 'yes / —', 'In infinite mode, occur before and after the next page of rows loads.'],
  ['onSelectionChanging / onSelectionChanged', '`{ selection, previous }` / `{ selection }`', 'yes / —', 'Occurs before the selection changes, by the user or programmatically.'],
  ['onLayoutChanging / onLayoutChange', '`{ layout, previous }` / `layout`', 'yes / —', 'Occurs when the user resizes, moves, hides, pins, sorts or resets. Canceling restores the previous layout.'],
  ['onGroupingChanging / onGroupingChanged, onGroupDropping', 'See [Grouping](/datagrid/grouping#grouping)', 'yes', 'The grouping, and a dropped header or chip.'],
  ['onRowExpanding / onRowExpanded, onRowCollapsing / onRowCollapsed', '`{ kind, key, row }`', 'yes / —', "Occurs when a group (`kind: 'group'`) or a row's details (`kind: 'detail'`) open or close."],
  ['onCopying / onPasting', '`{ text, html, rows }` / `{ text, rowIndex, field }`', 'yes', 'Ctrl+C and `copy()`, and Ctrl+V and `paste()`. Change the text or stop the action.'],
  ['onSummaryChanged', '`{ total, editing }`', '', 'Occurs when summary values are recalculated: new rows, a new filter or search, a save, or (with `recalculateWhileEditing`) an unsaved change.'],
  ['onExporting / onExported', '`{ format, component, selectedRowsOnly, options }` / `{ format, rows, text? }`', 'yes / —', 'Occur before an export starts, where you can change its options, and after it finishes. For a format the grid does not write (`xlsx`), the handler writes it with `exportDataGrid`, which raises the second event with `format: \'xlsx\'`.'],
  ['onContextMenuPreparing', '`{ target, field, row?, rowIndex, items }`', 'yes', 'Occurs before a header\'s column menu (`header`) or a row\'s menu (`row`: a right-click or the Menu key) opens. `items` holds the row\'s actions, and the menu opens only if it has items. Change `items`.'],
  ['onActionRunning / onActionRan', '`{ action, rows, selection, location }` / `{ action, rows, location, done, failed, canceled, errors }`', 'yes / —', 'Occur before and after an action runs. See [Row actions](/datagrid/editing#actions).'],
  ['onToolbarPreparing', '`{ items }`', '', 'Occurs when the toolbar is laid out. Change the list of items it uses.'],
];

export default function DataGridLayoutPage() {
  return (
    <>
      <Section anchor="toolbar" title="Toolbar">
        <p>
          <Rich text="The bar above the rows contains the grid's own items whose features are enabled, at the end, in this order: “New row” (`addRows`, `newRowButton`), “Save changes” and “Discard” (batch mode, `saveButtons`), “Export” (`exportButton`), the column list (`columnChooserButton`) and the search box (`searchPanel`). If there are none, the bar does not appear. `toolbar.items` lists its exact contents: grid items by name, an object with a `name` to change one of them, and custom items, such as a button with `text`, `icon`, `hint` and `click`, or any component with `content`, at the start (`location: 'before'`) or at the end. Buttons that do not fit move to the “more” menu (`overflow`). The grid's own buttons show only their icons in the bar (`showText`), with their text in the menu." />
        </p>
        <Example files={withOrders('Toolbar.tsx')} stack>
          <Toolbar />
        </Example>
        <ApiTable
          head={['Item field', 'Description']}
          rows={[
            ['name', 'One of the grid\'s items to change (`groupPanel`, `rowActions`, `searchPanel`, `addRowButton`, `saveButton`, `revertButton`, `exportButton`, `columnChooserButton`), or a custom name. A grid item whose feature is disabled is omitted.'],
            ['location', "`'before'` or `'after'` (the default, except `'before'` for the group panel and `rowActions`): which end of the bar."],
            ['text, icon, hint', 'The button\'s text, icon and tooltip (by default, the text when only the icon is shown).'],
            ['showText', "`'always'` (the default) or `'inMenu'`, which shows only the icon in the bar and the text in the “more” menu (the grid's own buttons)."],
            ['visible, enabled', 'Omits the item, or disables it.'],
            ['overflow', "`'never'` (the default, or `'auto'` for grid buttons), `'auto'` or `'always'`: whether it can move to the “more” menu."],
            ['content', '`() => component`: a custom component in place of a button, created once.'],
            ['click', '`(e) => void` with `{ item, grid, event }`. On a grid item, it replaces the item\'s action.'],
          ]}
        />
      </Section>

      <Section anchor="columns" title="Columns at runtime">
        <p>
          <Rich text="`addColumn(column, index?)` adds a column at a position among the data columns, with its own width, visibility and sticky side (or the values in the saved layout). `deleteColumn(field)` removes a column, along with its sort, grouping and filter. `columnOption(field, name, value)` changes one option of a column while it is displayed: its layout (`width`, `visible`, `sticky`, `visibleIndex`), sort, grouping, header filter values, a feature switch, or any field of its definition (`title`, `format`, `lookup`, `cell`, `type` …), and the column is redrawn. `columnOption(field, { … })` changes several at once. The layout, `layoutKey` and `onLayoutChange` follow, and `onOptionChanged` reports each change (`name: 'columns'` for a column added or removed). `columnCount()` and `getVisibleColumns()` read them." />
        </p>
        <Example files={withOrders('RuntimeColumns.tsx')} stack>
          <RuntimeColumns />
        </Example>
      </Section>

      <Section anchor="layout" title="Persisting the layout">
        <p>
          <Rich text="With `layoutKey`, the grid saves column widths, order, hidden and pinned columns, the sort, the filters and the search text in the browser's `localStorage`, and a grid created again with the same name, even after a reload, restores them. Storage that is full or blocked is silently skipped. `resetLayout()` (also in the column menu) returns to the column definitions. To store the layout elsewhere, such as on a server, read `layout` and `filters`, listen to `onLayoutChange`, and pass them back through the props of the same names." />
        </p>
        <Example files={withOrders('KeepLayout.tsx')} stack>
          <KeepLayout />
        </Example>
      </Section>

      <Section anchor="settings" title="Disabling features">
        <p>
          <Rich text="Every feature has a switch in `settings`, as a value or a function. A column can enable or disable a feature for itself, and its value takes precedence. `grid.settings` and `grid.columnSettings(field)` change them at runtime." />
        </p>
        <Example files={withOrders('Switches.tsx')} stack>
          <Switches />
        </Example>
        <ApiTable head={['Setting', 'Default', 'Description']} rows={SETTINGS} />
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="Every user action has an event, set as a prop or subscribed to with `grid.onX((e) => …)`. An event raised before an action (`…ing`) can stop it with `e.cancel = true`, and most can change the result (the values sent, the items of a menu or the text copied). In this example, amounts over 900 are bold, rows have a custom menu (right-click or Shift + F10), a change to “Cancelled” is not saved, and the list shows what happened. Methods do the same programmatically: `editCell`, `cellValue`, `navigateToRow`, `columnOption`, `state()` and the others in the [API reference](/datagrid/api#api)." />
        </p>
        <Example files={withOrders('Events.tsx')} stack>
          <Events />
        </Example>
        <ApiTable head={['Event', 'Parameters', 'Cancel', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
