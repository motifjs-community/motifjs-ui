import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { withOrders } from './code';
import Events from './examples/Events';
import KeepLayout from './examples/KeepLayout';
import Switches from './examples/Switches';
import Toolbar from './examples/Toolbar';

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
  ['exportButton', '`false`', 'An “Export” button in the toolbar: the formats of the `export` prop (CSV by default), as a menu when it offers more than one command.'],
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
  ['onGroupingChanging / onGroupingChanged, onGroupDropping', 'see [Grouping](/datagrid/grouping#grouping)', 'yes', 'The grouping; a dropped header or chip.'],
  ['onRowExpanding / onRowExpanded, onRowCollapsing / onRowCollapsed', '`{ key }`', 'yes / —', 'A group opens or closes.'],
  ['onCopying / onPasting', '`{ text, html, rows }` / `{ text, rowIndex, field }`', 'yes', 'Ctrl+C, `copy()`; Ctrl+V, `paste()`: change the text, or stop it.'],
  ['onSummaryChanged', '`{ total, editing }`', '', 'The summary values were worked out again: new rows, a new filter or search, a save, or (with `recalculateWhileEditing`) an unsaved change.'],
  ['onExporting / onExported', '`{ format, component, selectedRowsOnly, options }` / `{ format, rows, text? }`', 'yes / —', 'An export is about to start (change its options); for a format the grid does not write (`xlsx`) the handler writes it with `exportDataGrid`. It finished (`exportDataGrid` tells it with `format: \'xlsx\'`).'],
  ['onContextMenuPreparing', '`{ target, field, row?, rowIndex, items }`', 'yes', 'A header’s column menu (`header`) or a row’s menu (`row`: a right click or the context menu key; it opens only when you add items) is about to open: change `items`.'],
  ['onToolbarPreparing', '`{ items }`', '', 'The toolbar is laid out: change the list of items it takes.'],
];

export default function DataGridLayoutPage() {
  return (
    <>
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
          <Rich text="Every action of the user has an event, given as a prop or listened to with `grid.onX((e) => …)`; one that is about to happen (`…ing`) can be stopped with `e.cancel = true`, and most can change what happens (the values sent, the items of a menu, the text copied). Here amounts over 900 are drawn in bold, the rows get a menu of their own (right click, or Shift + F10), a change to “Cancelled” is not saved, and the list tells what happened. Methods do the same from code: `editCell`, `cellValue`, `navigateToRow`, `columnOption`, `state()` and the others in the [API reference](/datagrid/api#api)." />
        </p>
        <Example files={withOrders('Events.tsx')} stack>
          <Events />
        </Example>
        <ApiTable head={['Event', 'Gets', 'Cancel', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
