import { reactive, type Component } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, CheckBox, DataGrid, enStrings, trStrings, uiLocale, type GridAction, type GridColumn } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { SlowAdapter } from '../../shared/slow-adapter';

interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}

const CUSTOMERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Cahit Arf', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'İlhan Koman', 'Margaret Hamilton'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
const STATUSES = ['Draft', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];
const NOTES = ['', 'Leave at the door', 'Call before delivery', 'Gift wrap, please, with a card that says happy birthday', '', 'Fragile'];

function makeOrders(n: number): Order[] {
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

const COLUMNS: GridColumn<Order>[] = [
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

/** The columns of the filter examples: a filter cell and a header filter on most of them. */
const FILTER_COLUMNS: GridColumn<Order>[] = COLUMNS.map((c) => ({ ...c, filterRow: c.field !== 'note', headerFilter: c.field !== 'note' && c.field !== 'id' }));

const today = () => new Date().toISOString().slice(0, 10);
const newOrder = () => ({ date: today(), status: 'Draft', paid: false });

/** Orders in memory that answer like a server, and turn down a note with "error" in it. */
class OrderService extends SlowAdapter<Order, number> {
  protected override updateRow(key: number, changes: Partial<Order>): Promise<Partial<Order>> {
    return this.later(changes, () => super.updateRow(key, changes));
  }

  protected override insertRow(values: Partial<Order>): Promise<Partial<Order>> {
    return this.later(values, () => super.insertRow(values));
  }

  private later(values: Partial<Order>, save: () => Promise<Partial<Order>>): Promise<Partial<Order>> {
    const message = 'The server does not take this note.';
    return new Promise((done, fail) =>
      setTimeout(() => {
        if (String(values.note ?? '').includes('error')) fail(data.DataError.create('MJD202', { operation: 'save', fields: { note: message } }, message));
        else save().then(done, fail);
      }, 300),
    );
  }
}

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
  ['sort / layout', '`SortItem[]` / `GridLayout`', '—', 'The first sort order; a saved layout.'],
  ['onLayoutChange', '`(layout) => void`', '—', 'After the user resized, moved, hid, pinned or sorted.'],
  ['layoutKey', '`string`', '—', 'Keeps the layout and the filters in the browser’s `localStorage` under this name; a grid made again with it gets them back.'],
  ['label', '`Bind<string>`', '`uiLocale` “Data grid”', 'The accessible name. The same as `text`.'],
  ['texts / locale', '`Bind<Partial<UiStrings>>` / `Bind<string>`', '— / page language', 'Texts of this grid only; the locale of numbers, dates and sorting.'],
  ['rowHeight', '`Bind<number>`', 'from CSS', 'A fixed row height; by default the density decides.'],
  ['actions', '`GridActionItem[] | (row, state) => GridActionItem[]`', '—', 'The buttons of each row: actions, or the names of the ready ones (`edit`, `remove`, `restore`, `save`, `cancel`). A function is followed per row.'],
  ['selectedKeys / onSelectionChanged', '`Bind<unknown[]>` / `(e) => void`', '—', 'Keys of the selected rows (a function is followed); told after every change of the selection.'],
  ['filters', '`GridFilters`', '—', 'The first filters, by field: `{ city: { op: \'=\', value: \'Ankara\' }, status: { values: [\'Draft\'] } }`.'],
  ['loadValues', '`(request) => { values, total }`', '—', 'The values of a header filter from a server that cannot group: `{ column, search, filter, skip, take, signal }`.'],
  ['enabled / disabled, visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const SETTINGS = [
  ['editable', '`false`', 'Edit cells in place. A column can decide itself, also per row with `(row) => boolean`.'],
  ['creatable', '`true`', 'Fill the cells of new rows. A column with its own `editable` and no `creatable` uses the same; `editable: false, creatable: true` is entered only when the row is created.'],
  ['addRows, newRowButton, tabChain', '`false`, `true`, `true`', 'The user adds rows; the bar’s “New row” button; Tab on a new row’s last cell opens the next one.'],
  ['enterMoves', "`'none'`", 'Enter in an editor keeps the value and stays, goes `down`, or goes on like Tab (`next`).'],
  ['rowStatus', '`true`', 'The narrow column that marks new, changed, deleted, saving and failed rows.'],
  ['saveButtons, errorSummary', '`true`', '“Save changes” and “Discard” in batch mode; “N rows with errors” and “Next error”.'],
  ['sortable, multiSort', '`true`', 'Sort from the header; Shift adds a column to the sort.'],
  ['resizable, movable, hideable, pinnable, menu', '`true`', 'What the user may do with the columns; a column can say otherwise for itself.'],
  ['headerButtons', "`'hover'`", 'The menu button shows on hover and focus (always on touch screens), or `always`.'],
  ['columnChooser, layoutReset', '`true`', 'The column list and “Reset layout” in the column menu.'],
  ['tooltips, striped, rowCount, pager', '`true`, `false`, `true`, `true`', 'Full text of a clipped cell; stripes; the row count; the pager.'],
  ['actionsColumn, actionsPosition, actionsSticky, actionsWidth', "`true`, `'end'`, `true`, `140`", 'The actions column, at the start or the end, pinned to its edge or scrolling with the rows, and its width.'],
  ['selection, selectionColumn, selectAll, selectedCount', "`'none'`, `true`, `true`, `true`", '`single` or `multiple`; the check box column; the header check box and Ctrl+A; “N selected” in the bar.'],
  ['filterRow, headerFilter', '`false`', 'The filter row and the header filter; a column can turn them on or off for itself.'],
  ['filterDelay', '`300`', 'Milliseconds from the last key typed in the filter row to the filter.'],
  ['copyable, exportable', '`true`', 'Columns that go into what Ctrl+C copies and into an export; a column can say otherwise for itself.'],
  ['copyValues, copyHeaders', "`'shown'`, `false`", 'Ctrl+C copies the text the cells show or their `raw` values; copied rows start with the column titles.'],
  ['paste, pasteNewRows', '`true`, `false`', 'Ctrl+V writes into the editable cells; pasted lines past the last row open new rows (with `addRows`).'],
  ['exportButton', '`false`', 'An “Export” button in the bar that saves the rows as CSV.'],
  ['saveLayout', '`true`', 'With `layoutKey`, the layout and the filters are kept and come back.'],
];

const COLUMN_FIELDS = [
  ['field, title', 'The value’s key (a dotted path reads a nested value) and the header text (`Bind<string>`).'],
  ['type', '`text`, `number`, `date`, `boolean`, `list`: alignment, format, sorting and the editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`).'],
  ['width, minWidth, maxWidth, flex', 'Pixels; `flex` shares the free space until the user resizes.'],
  ['sticky, hidden, align', 'Pinned to an edge; hidden at first; the alignment.'],
  ['value, format, compare', 'Read the value another way; show it another way; sort it another way (rows in memory).'],
  ['cell', '`(ctx) => component`: content of your own, made once per pooled cell; read `ctx.row` and `ctx.value` in getters.'],
  ['editor', '`(ctx) => Field | component`: an editor of your own. A `Field` is read through its value; anything else calls `ctx.setValue`.'],
  ['required, validate, options', 'An empty value is not taken; `(value, row) => message`; the choices of a list (an array, or a function of the row, also async).'],
  ['filterOperators, filterOperator', 'The conditions the filter row offers for the column, and the one it starts with.'],
  ['editable, creatable, sortable, resizable, movable, hideable, pinnable, menu, filterRow, headerFilter, copyable, exportable', 'Switch a feature for this column; wins over `settings`.'],
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
  ['filters, filter', 'read/write, read-only', 'The filters by field; the whole filter the rows are loaded with.'],
  ['onSelectionChanged', 'event', 'Subscribe with `grid.onSelectionChanged((e) => …)`.'],
];

const METHODS = [
  ['addRow(values?)', '`Promise<boolean>`', 'Opens a new row as the “New row” button does; `false` when the row being edited cannot be left.'],
  ['deleteRow(row?) / restoreRow(row)', '`Promise<boolean>` / `void`', 'Deletes a row (default: the active one) as the save mode says; takes a batch deletion back.'],
  ['saveChanges() / discardChanges()', '`Promise<{ saved, failed }>` / `void`', 'Sends every unsaved change; drops them all.'],
  ['goToNextError()', '`boolean`', 'Moves to the next row that failed or has a message.'],
  ['refresh() / retry()', '`void`', 'Loads again keeping the position; loads what failed again.'],
  ['scrollToIndex(i, align?)', '`void`', 'Brings a row into view (in paged mode: its page).'],
  ['autoSizeColumns() / resetLayout() / focus()', '', 'Fits the columns; back to the definitions; focuses the active cell.'],
  ['selectRow(row, add?) / deselectRow(row) / isSelected(row)', '', 'One row in or out of the selection.'],
  ['selectAll() / clearSelection()', '', 'Every row of the filter, loaded or not; none.'],
  ['clearFilters()', '', 'Takes every filter away.'],
  ['copy() / paste(text)', '`string` / `number`', 'What Ctrl+C and Ctrl+V do: copies the selected rows or the active cell (returns the text); pastes tab-separated text from the active cell (returns the cells written).'],
  ['exportRows(options?)', '`Promise<object[]>`', 'The rows of the filter in the sort order, by field, with the visible exportable columns: shown text or `raw` values; a server’s rows in parts through the data source.'],
  ['exportCsv(options?)', '`Promise<string>`', 'The same as a CSV file a spreadsheet opens: byte order mark, the locale’s separator, titles first. Options: `values`, `selected`, `fileName`, `download`, `separator`, `headers`, `bom`, `escapeFormulas`, `pageSize`, `onProgress`, `signal`.'],
];

const KEYS = [
  ['Arrow keys', 'Move between cells, the headers included. In a right-to-left page Left and Right swap.'],
  ['Home / End, Ctrl + Home / End', 'The first data column / the last column; the first / the last row (only that block is loaded).'],
  ['PageUp / PageDown', 'A screen up or down.'],
  ['Enter (header), Shift + Enter', 'Sort; add the column to the sort.'],
  ['Alt + Down, Shift + F10 (header)', 'The column menu; there “Move” and “Width” work with Left and Right, Enter keeps, Escape takes back.'],
  ['Typing, Enter, F2, double-click', 'Edit the cell; typing starts with that character.'],
  ['Space, Delete, Backspace', 'Toggle a check box column; empty the cell; edit from empty.'],
  ['Escape', 'In an editor: close it without the value (a new row goes). On a row: take its edits back.'],
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
];

const A11Y = [
  ['Pattern', 'The APG data grid: `role="grid"`, rows and cells with `aria-rowindex` and `aria-colindex`; `aria-rowcount` is the real total, also in a virtual list.'],
  ['Reading order', 'Drawn rows are reused while scrolling and stay where they are in the page; the row group lists them in row order with `aria-owns`, so a screen reader reads them top to bottom.'],
  ['One tab stop', 'Only the active cell is in the Tab order; focus never falls to the page: the focused row stays while it scrolls away.'],
  ['Sorting', '`aria-sort` on the first sorted header.'],
  ['Messages', 'A cell with a message has `aria-invalid` and is described by it while it is active; the status cell names the row’s state, not only with a color.'],
  ['Announcements', 'Sorting, moving, saving, errors, copying, pasting and exports are announced through a polite live region.'],
  ['Busy', '`aria-busy` while the first rows load and while a row is saved in `wait` mode.'],
  ['Actions', 'Real buttons with the action’s text as their name (also when only the icon shows, with the text as a tooltip); one of them is in the cell’s roving focus; the “more” button has `aria-haspopup="menu"`.'],
  ['Selection', '`aria-multiselectable` on the grid, `aria-selected` on every row while selection is on; the check boxes are `role="checkbox"` with `aria-checked` (`mixed` in the header).'],
  ['Filters', 'The filter row is a row of the grid (its fields are named after the column); the condition button names the condition; the header filter is a `dialog` with a listbox.'],
];

const HOOKS = [
  ['.mx-data-grid', 'The grid. `data-striped`, `data-header-buttons`, `data-mode`.'],
  ['.mx-data-grid__viewport, __head, __body', 'The scrolling area with `role="grid"`, the sticky header, the rows.'],
  ['.mx-data-grid__row', 'A row: `data-active`, `data-selected`, `data-status`, `data-odd`, `data-loading`.'],
  ['.mx-data-grid__actions, __action, __more', 'The actions cell and its buttons (kit button classes, `data-action`).'],
  ['.mx-data-grid__select, __check', 'The selection column and its check box (`aria-checked`).'],
  ['.mx-data-grid__row--filter, __filter-cell, __condition', 'The filter row, its cells, the condition button (`data-set`).'],
  ['.mx-data-grid__filter-button, __values', 'The header filter button (`data-active`) and its window.'],
  ['.mx-data-grid__cell, __header-cell', 'A cell (`data-changed`, `aria-invalid`), a header (`data-sort`, `data-sortable`).'],
  ['.mx-data-grid__editor', 'The editor of the active cell; its field carries `data-in-cell` and is drawn without a frame.'],
  ['.mx-data-grid__bar, __pager, __export', 'The bar under the rows, its pager and its “Export” button (`aria-busy` while it runs).'],
];

const TOKENS = [
  ['datagrid.row-height, datagrid.row-padding', 'The row height, from the density tokens.'],
  ['datagrid.cell-padding, datagrid.font-size, datagrid.head-font-weight', 'Cells and headers.'],
  ['datagrid.background, head-background, head-color, line-color, outline-color, edge-color', 'Surfaces and lines.'],
  ['datagrid.hover, stripe, active, new, changed, invalid, placeholder', 'Row tints and the marks of cells.'],
  ['datagrid.bar-*, gap, icon-size, button-size, resize-width, mark-size, invalid-width, radius, border-width', 'The bar, the header parts and the marks.'],
  ['datagrid.selected, check-size, check-mark-size, check-radius', 'Selected rows and the selection check boxes.'],
  ['datagrid.action-gap, filter-padding, values-width, values-gap', 'The action buttons, the filter row, the header filter window.'],
];

export default function DataGridPage() {
  const s = reactive({
    orders: makeOrders(40),
    loads: 0,
    pagedLoads: 0,
    saveMode: 'wait' as data.SaveMode,
    position: 'bottom' as 'top' | 'bottom',
    lang: 'en',
    striped: true,
    resizable: true,
    movable: true,
    pinnable: true,
    menu: true,
    tooltips: true,
    always: false,
    rowCount: true,
    added: 0,
    actionOrders: makeOrders(30),
    actionsAt: 'end' as 'start' | 'end',
    actionsSticky: true,
    actionsWidth: 140,
    actionNote: '',
    selectionMode: 'multiple' as 'none' | 'single' | 'multiple',
    filterNote: '',
    copyRaw: false,
    copyHeaders: false,
    pasteRows: false,
    copied: '',
    exported: '',
    progress: '',
    keepLayout: true,
    showLayout: true,
    batchNote: '',
  });

  // Server-like data: 100,000 orders that answer late, loaded in blocks where the list looks.
  const many = makeOrders(100_000);
  const blocks = new SlowAdapter<Order, number>({ data: many, key: 'id' }, 300);
  blocks.onLoading(() => s.loads++);
  const virtualSource = new data.DataSource<Order, number>({ adapter: blocks, loadMode: 'blocks', pageSize: 100 });
  const pages = new SlowAdapter<Order, number>({ data: many, key: 'id' }, 250);
  pages.onLoading(() => s.pagedLoads++);
  const pagedSource = new data.DataSource<Order, number>({ adapter: pages, loadMode: 'page', pageSize: 20 });
  const service = new OrderService({ data: makeOrders(30), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);
  const editSource = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });
  const batchService = new OrderService({ data: makeOrders(200), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 250);
  const batchSource = new data.DataSource<Order, number>({ adapter: batchService, loadMode: 'page', pageSize: 15 });

  let local: DataGrid<Order> | null = null;
  let virtual: DataGrid<Order> | null = null;
  let editing: DataGrid<Order> | null = null;
  let host: Component<HTMLDivElement> | null = null;
  let selecting: DataGrid<Order> | null = null;
  let serverSelecting: DataGrid<Order> | null = null;
  let filtering: DataGrid<Order> | null = null;
  let serverFiltering: DataGrid<Order> | null = null;
  let paged: DataGrid<Order> | null = null;
  let batch: DataGrid<Order> | null = null;
  let clip: DataGrid<Order> | null = null;
  let exporting: DataGrid<Order> | null = null;
  let kept: DataGrid<Order> | null = null;

  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    onclick: (row) => {
      row.status = 'Approved';
      s.actionNote = `Order ${row.id} approved`;
    },
  };
  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.actionNote = `Order ${row.id} sent to the printer`) };
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.actionNote = `Mail to ${row.customer}`) };

  // Server-like data for selection and filters: the adapter groups, so header filters get their values from it.
  const selectSource = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: many, key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  const filterSource = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: many, key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  const describe = (sel: { all: boolean; keys: unknown[]; except: unknown[] } | undefined) =>
    !sel ? '' : sel.all ? `all but ${sel.except.length} (${sel.except.slice(0, 5).join(', ')})` : `${sel.keys.length} picked (${sel.keys.slice(0, 5).join(', ')})`;

  const addFromCode = () => {
    if (!host) return;
    host.controls.clear();
    const grid = new DataGrid<Order>({ rows: makeOrders(8), rowKey: 'id', columns: COLUMNS.slice(0, 4), settings: { striped: true }, label: 'Created with new' });
    grid.element.style.blockSize = '14rem';
    host.controls.add(grid);
    grid.sort = [{ field: 'customer', dir: 'asc' }];
    s.added++;
  };

  const exportServer = async () => {
    s.progress = 'starting…';
    try {
      await paged?.exportCsv({ pageSize: 10_000, fileName: 'orders', onProgress: (n, total) => (s.progress = `${n.toLocaleString('en')} of ${total.toLocaleString('en')}`) });
      s.progress += ' — saved';
    } catch {
      s.progress = 'failed';
    }
  };

  const makeAgain = () => {
    s.showLayout = false;
    setTimeout(() => (s.showLayout = true), 0);
  };

  return (
    <>
      <p class="lead">
        A grid for data entry and large data: rows in memory or from any adapter of the data layer, a virtual list or
        pages, sorting, column layout, editing with the kit's editors, new rows with the Tab chain, three save modes,
        row actions, selection, filters, copy and paste, export and a layout that is kept — and every feature can be
        turned off, for the grid or for one column.
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
        <Example
          code={`
<DataGrid
  rows={() => this.orders}
  rowKey="id"
  columns={columns}
  settings={{ editable: true, addRows: true, striped: true }}
  newRow={{ create: () => ({ date: today(), status: 'Draft' }) }}
  ref={(g) => (this.grid = g)}
/>

const grid = new DataGrid<Order>({ rows, rowKey: 'id', columns });
this.panel.controls.add(grid);
grid.sort = [{ field: 'customer', dir: 'asc' }];
`}
          stack
        >
          <DataGrid
            class="dg-local"
            style="block-size: 20rem"
            rows={() => s.orders}
            rowKey="id"
            columns={COLUMNS}
            label="Orders"
            locale="en"
            settings={{ editable: true, addRows: true, striped: true }}
            newRow={{ create: newOrder }}
            ref={(g: DataGrid<Order>) => (local = g)}
          />
          <div class="docs-flow">
            <Button text="Add a row from code" variant="outline" onclick={() => void local?.addRow({ customer: 'Ada Lovelace' })} />
            <Button text="Push an order into the array" variant="outline" onclick={() => s.orders.push({ ...makeOrders(1)[0], id: s.orders.length + 1, customer: 'Pushed' })} />
            <Button text="Add a grid from code" variant="outline" onclick={addFromCode} />
            <output class="dg-local-count">{() => `${s.orders.length} orders in the array`}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="virtual" title="Server data, virtual">
        <p>
          <Rich text="With a `DataSource` that loads by `blocks`, the scroll bar is sized from the total and only the rows where the list looks are asked for. A jump (Ctrl+End, dragging the bar) asks only where it lands; a block left behind while loading is aborted. A row that has not come yet shows as a placeholder. Above 10 million pixels of rows the bar is scaled." />
        </p>
        <Example
          code={`
const orders = new data.DataSource({
  adapter: new data.ODataAdapter({ url: '/odata/Orders', key: 'OrderID' }),
  loadMode: 'blocks',
  pageSize: 100,
});

<DataGrid dataSource={orders} columns={columns} />
`}
          stack
        >
          <DataGrid class="dg-virtual" style="block-size: 22rem" dataSource={virtualSource} columns={COLUMNS} label="100,000 orders" locale="en" ref={(g: DataGrid<Order>) => (virtual = g)} />
          <div class="docs-flow">
            <Button text="Go to the end" variant="outline" onclick={() => virtual?.scrollToIndex(virtual.total - 1, 'end')} />
            <Button text="Back to the top" variant="outline" onclick={() => virtual?.scrollToIndex(0)} />
            <Button text="Fit the columns" variant="outline" onclick={() => virtual?.autoSizeColumns()} />
            <output class="dg-loads">{() => `${s.loads} loads for ${virtual?.total ?? 0} rows`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="paged" title="Pages">
        <p>
          <Rich text="A `DataSource` that loads by `page` makes a paged grid: one page is asked for at a time, and a sort goes back to the first page. Rows in memory page with `mode` set to `paged`." />
        </p>
        <Example
          code={`
const orders = new data.DataSource({ adapter, loadMode: 'page', pageSize: 20 });
<DataGrid dataSource={orders} columns={columns} />

<DataGrid rows={() => this.orders} rowKey="id" mode="paged" pageSize={20} columns={columns} />
`}
          stack
        >
          <DataGrid class="dg-paged" style="block-size: 24rem" dataSource={pagedSource} columns={COLUMNS} label="Orders by page" locale="en" ref={(g: DataGrid<Order>) => (paged = g)} />
          <output class="dg-paged-loads">{() => `${s.pagedLoads} loads`}</output>
        </Example>
      </Section>

      <Section anchor="editing" title="Editing and save modes">
        <p>
          <Rich text="Typing on a cell, Enter, F2 or a double-click opens its editor; only the active cell has one. What is typed goes into the row's draft in the grid's `ChangeTracker`, kept by key, and the row is saved when it is left: `wait` sends it and waits, `background` sends it through one queue and goes on, `batch` keeps everything until “Save changes”. A row with a message cannot be left; Escape gives up. This service turns down a note with “error” in it." />
        </p>
        <Example
          code={`
<DataGrid
  dataSource={orders}
  columns={columns}
  saveMode={() => this.saveMode}
  settings={{ editable: true, addRows: true }}
  validateRow={(row) => (row.status === 'Cancelled' && row.paid ? { paid: 'A cancelled order is not paid.' } : null)}
/>
<Button text="Save" enabled={() => grid.hasChanges} onclick={() => grid.saveChanges()} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Save mode">
            {(['wait', 'background', 'batch'] as const).map((mode) => (
              <Button key={mode} text={mode} size="sm" variant={() => (s.saveMode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.saveMode === mode} onclick={() => (s.saveMode = mode)} />
            ))}
          </div>
          <DataGrid
            class="dg-editing"
            style="block-size: 22rem"
            dataSource={editSource}
            columns={COLUMNS}
            label="Orders to edit"
            locale="en"
            saveMode={() => s.saveMode}
            settings={{ editable: true, addRows: true, striped: true }}
            newRow={{ create: newOrder }}
            validateRow={(row: Order) => (row.status === 'Cancelled' && row.paid ? { paid: 'A cancelled order is not paid.' } : null)}
            ref={(g: DataGrid<Order>) => (editing = g)}
          />
          <div class="docs-flow">
            <Button text="Delete the active row" variant="outline" onclick={() => void editing?.deleteRow()} />
            <Button text="Undo the deletion" variant="ghost" visible={() => s.saveMode === 'batch'} onclick={() => editing?.activeRow && editing.restoreRow(editing.activeRow)} />
            <output class="dg-changes">{() => `${editing?.changes.count ?? 0} unsaved, ${editing?.errorCount ?? 0} with errors`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="batch" title="Saving all at once">
        <p>
          <Rich text="With `saveMode: 'batch'` every edit, new row and deletion waits for `saveChanges()`; then the deletions, the updates and the new rows go out, each kind in one call, and rows the server turns down keep their marks. Here over a server that loads by page: the changes stay while the pages turn, and the page's own buttons follow `hasChanges`." />
        </p>
        <Example
          code={`
const orders = new data.DataSource({ adapter, loadMode: 'page', pageSize: 15 });

<DataGrid dataSource={orders} columns={columns} saveMode="batch"
  settings={{ editable: true, addRows: true, saveButtons: false }}
  actions={(row, state) => (state.isRemoved ? ['restore'] : ['remove'])}
  ref={(g) => (this.grid = g)} />
<Button text="Save changes" enabled={() => this.grid.hasChanges} onclick={() => this.grid.saveChanges()} />
`}
          stack
        >
          <DataGrid
            class="dg-batch"
            style="block-size: 24rem"
            dataSource={batchSource}
            columns={COLUMNS}
            label="Orders saved together"
            locale="en"
            saveMode="batch"
            settings={{ editable: true, addRows: true, saveButtons: false, actionsWidth: 100 }}
            newRow={{ create: newOrder }}
            actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : ['remove'])}
            ref={(g: DataGrid<Order>) => (batch = g)}
          />
          <div class="docs-flow">
            <Button
              text="Save changes"
              tone="accent"
              enabled={() => !!batch?.hasChanges}
              onclick={async () => {
                const result = await batch?.saveChanges();
                if (result) s.batchNote = `${result.saved} saved, ${result.failed} failed`;
              }}
            />
            <Button text="Discard" variant="outline" enabled={() => !!batch?.hasChanges} onclick={() => batch?.discardChanges()} />
            <output class="dg-batch-note">{() => `${batch?.changes.count ?? 0} unsaved${s.batchNote ? ` · ${s.batchNote}` : ''}`}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="new-rows" title="New rows">
        <p>
          <Rich text="`addRow()` or the bar's “New row” opens a row at the bottom (the grid goes to the very end; in a virtual list only the last block is loaded) or at the top, with its first cell a new row can fill in edit mode. Tab on the last cell of a new row saves it and opens the next one; Escape drops it; one left untouched goes by itself." />
        </p>
        <Example
          code={`
<DataGrid rows={() => this.orders} rowKey="id" columns={columns}
  settings={{ editable: true, addRows: true }}
  newRow={{ position: () => this.position, create: () => ({ date: today() }) }} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="New rows">
            {(['bottom', 'top'] as const).map((position) => (
              <Button key={position} text={position} size="sm" variant={() => (s.position === position ? 'solid' : 'ghost')} aria-pressed={() => s.position === position} onclick={() => (s.position = position)} />
            ))}
          </div>
          <DataGrid
            class="dg-new"
            style="block-size: 18rem"
            rows={makeOrders(12)}
            rowKey="id"
            columns={COLUMNS}
            label="New rows"
            locale="en"
            settings={{ editable: true, addRows: true }}
            newRow={{ position: () => s.position, create: newOrder }}
          />
        </Example>
      </Section>

      <Section anchor="actions" title="Row actions">
        <p>
          <Rich text="`actions` gives each row its buttons, as a list or as a function of the row and its state (`isNew`, `isEditing`, `isDirty`, `isSaving`, `hasError`, `isRemoved`, `isSelected`); when what the function reads changes, the row's buttons change. The grid's ready actions are named by strings. The buttons that do not fit the column go into the “more” menu, the first ones in the list stay. The column sits at the start or the end, pinned to its edge or scrolling with the rows." />
        </p>
        <Example
          code={`
const approve: GridAction<Order> = {
  id: 'approve', text: 'Approve', tone: 'accent',
  visible: (row) => row.status === 'Draft',
  onclick: (row) => (row.status = 'Approved'),
};

<DataGrid rows={() => this.orders} rowKey="id" columns={columns}
  actions={(row, state) => (state.isRemoved ? ['restore'] : [approve, 'edit', 'remove', print, mail])}
  settings={{ editable: true, actionsPosition: () => this.at, actionsSticky: () => this.sticky, actionsWidth: () => this.width }} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Actions column">
            {(['start', 'end'] as const).map((at) => (
              <Button key={at} text={at} size="sm" variant={() => (s.actionsAt === at ? 'solid' : 'ghost')} aria-pressed={() => s.actionsAt === at} onclick={() => (s.actionsAt = at)} />
            ))}
            <CheckBox label="Pinned" x-model={() => s.actionsSticky} />
            {[100, 140, 260].map((w) => (
              <Button key={`w${w}`} text={`${w}px`} size="sm" variant={() => (s.actionsWidth === w ? 'solid' : 'ghost')} aria-pressed={() => s.actionsWidth === w} onclick={() => (s.actionsWidth = w)} />
            ))}
          </div>
          <DataGrid
            class="dg-actions"
            style="block-size: 20rem"
            rows={() => s.actionOrders}
            rowKey="id"
            columns={COLUMNS}
            label="Orders with actions"
            locale="en"
            saveMode="batch"
            actions={(row: Order, state) => (state.isRemoved ? ['restore'] : [approve, 'edit', 'remove', print, mail])}
            settings={{ editable: true, actionsPosition: () => s.actionsAt, actionsSticky: () => s.actionsSticky, actionsWidth: () => s.actionsWidth }}
          />
          <output class="dg-action-note">{() => s.actionNote}</output>
        </Example>
      </Section>

      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selection` is `single` (the selection follows the active row) or `multiple`, with a check box column. A click selects a row, Ctrl adds or takes out, Shift selects a range; Shift+Space, Shift+arrows and Ctrl+A do it from the keyboard. The header check box selects every row of the filter — on a server too: the grid keeps a state, “all but these keys”, never the rows. `selection` gives that state, `selectionFilter` the same as a filter for the server." />
        </p>
        <Example
          code={`
<DataGrid rows={() => this.orders} rowKey="id" columns={columns}
  settings={{ selection: 'multiple' }}
  selectedKeys={() => this.keys}
  onSelectionChanged={(e) => (this.keys = e.selection.keys)} />

grid.selection;       // { all: true, except: [7, 12], filter: … }
grid.selectionFilter; // and(filter, not(id in [7, 12]))
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Selection mode">
            {(['none', 'single', 'multiple'] as const).map((mode) => (
              <Button key={mode} text={mode} size="sm" variant={() => (s.selectionMode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.selectionMode === mode} onclick={() => (s.selectionMode = mode)} />
            ))}
          </div>
          <DataGrid
            class="dg-selection"
            style="block-size: 16rem"
            rows={makeOrders(40)}
            rowKey="id"
            columns={COLUMNS}
            label="Orders to select"
            locale="en"
            settings={{ selection: () => s.selectionMode }}
            ref={(g: DataGrid<Order>) => (selecting = g)}
          />
          <output class="dg-selection-state">{() => `${(selecting?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(selecting?.selection)}`}</output>
          <DataGrid
            class="dg-server-selection"
            style="block-size: 16rem"
            dataSource={selectSource}
            columns={COLUMNS}
            label="100,000 orders to select"
            locale="en"
            settings={{ selection: 'multiple' }}
            actions={[print, mail]}
            ref={(g: DataGrid<Order>) => (serverSelecting = g)}
          />
          <output class="dg-server-selection-state">{() => `${(serverSelecting?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(serverSelecting?.selection)}`}</output>
        </Example>
      </Section>

      <Section anchor="filters" title="Filters">
        <p>
          <Rich text="The filter row has a cell per column: a condition chosen in the cell, by the column type (contains, starts with, =, <, between, empty…), and the kit's field for the value; typing applies after a short pause. The header filter lists the column's values with their counts, honoring the other filters: rows in memory are counted by the grid, an adapter that groups is asked with `group`, any other server answers `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), together with AND." />
        </p>
        <Example
          code={`
const columns = [
  { field: 'customer', title: 'Customer', filterRow: true, headerFilter: true },
  { field: 'amount', title: 'Amount', type: 'number', filterRow: true, filterOperator: '>=' },
  …
];
<DataGrid rows={() => this.orders} rowKey="id" columns={columns} settings={{ filterRow: true, headerFilter: true }} />

grid.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } };
grid.filter; // the data layer's filter the rows are loaded with
`}
          stack
        >
          <DataGrid
            class="dg-filters"
            style="block-size: 20rem"
            rows={makeOrders(200)}
            rowKey="id"
            columns={FILTER_COLUMNS}
            label="Orders to filter"
            locale="en"
            settings={{ striped: true }}
            ref={(g: DataGrid<Order>) => (filtering = g)}
          />
          <div class="docs-flow">
            <Button text="Ankara and İzmir, 100 to 500" variant="outline" onclick={() => filtering && (filtering.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } })} />
            <Button text="Clear the filters" variant="ghost" onclick={() => filtering?.clearFilters()} />
            <output class="dg-filter-count">{() => `${filtering?.total ?? 0} of 200 orders`}</output>
          </div>
          <DataGrid
            class="dg-server-filters"
            style="block-size: 20rem"
            dataSource={filterSource}
            columns={FILTER_COLUMNS}
            label="100,000 orders to filter"
            locale="en"
            ref={(g: DataGrid<Order>) => (serverFiltering = g)}
          />
          <output class="dg-server-filter">{() => `${(serverFiltering?.total ?? 0).toLocaleString('en')} orders · ${JSON.stringify(serverFiltering?.filter ?? null)}`}</output>
        </Example>
      </Section>

      <Section anchor="clipboard" title="Copy and paste">
        <p>
          <Rich text="Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table: a spreadsheet or a document takes it as a table. Ctrl+V on a cell writes tab-separated text — from a spreadsheet, or copied here — into the editable cells from that cell rightwards and downwards. Each value is read by the column type (numbers and dates in the locale, yes or no, a list option by its text) and goes into the row's draft with its checks, as if typed; cells that cannot be edited keep their values. The rows below the active one are saved as the save mode says." />
        </p>
        <Example
          code={`
<DataGrid rows={() => this.orders} rowKey="id" columns={columns}
  settings={{ editable: true, selection: 'multiple', copyValues: 'shown', copyHeaders: true, addRows: true, pasteNewRows: true }} />

grid.copy(); // what Ctrl+C copies, as text
grid.paste('Ada Lovelace\\tİzmir\\nGrace Hopper\\tAnkara');
{ field: 'note', title: 'Note', copyable: false }
`}
          stack
        >
          <div class="docs-flow">
            <CheckBox label="Values, not the shown text" x-model={() => s.copyRaw} />
            <CheckBox label="Column titles" x-model={() => s.copyHeaders} />
            <CheckBox label="New rows from extra lines" x-model={() => s.pasteRows} />
          </div>
          <DataGrid
            class="dg-clipboard"
            style="block-size: 18rem"
            rows={makeOrders(20)}
            rowKey="id"
            columns={COLUMNS}
            label="Orders to copy"
            locale="en"
            saveMode="batch"
            settings={{
              editable: true,
              addRows: true,
              selection: 'multiple',
              copyValues: () => (s.copyRaw ? 'raw' : 'shown'),
              copyHeaders: () => s.copyHeaders,
              pasteNewRows: () => s.pasteRows,
            }}
            ref={(g: DataGrid<Order>) => (clip = g)}
          />
          <div class="docs-flow">
            <Button text="Copy from code" variant="outline" onclick={() => (s.copied = clip?.copy() ?? '')} />
            <Button text="Paste two lines at the active cell" variant="outline" onclick={() => clip?.paste('Ada Lovelace\tİzmir\nGrace Hopper\tAnkara')} />
            <output class="dg-copied">{() => (s.copied ? `Copied: ${s.copied.replace(/\t/g, ' → ').replace(/\r?\n/g, ' ¶ ')}` : '')}</output>
          </div>
        </Example>
      </Section>

      <Section anchor="export" title="Export">
        <p>
          <Rich text="`exportCsv()` saves the rows of the filter, in the sort order, with the visible columns in their order, as a CSV file a spreadsheet opens as it is: UTF-8 with a byte order mark, the locale's separator (`;` where decimals take a comma), the column titles first, and text that would run as a formula made harmless. `exportRows()` gives the same rows as objects. Rows in memory are taken as they are; a server's are asked for in parts through the data source, so its filter, search and sort apply and nothing on the screen changes. `exportButton` puts an “Export” button in the bar; `exportable` takes a column out." />
        </p>
        <Example
          code={`
<DataGrid rows={() => this.orders} rowKey="id" columns={columns} settings={{ exportButton: true }} />

await grid.exportCsv({ fileName: 'orders' });
const rows = await grid.exportRows({ values: 'raw', selected: true });
await serverGrid.exportCsv({ pageSize: 10_000, onProgress: (n, total) => (this.progress = n / total) });
`}
          stack
        >
          <DataGrid
            class="dg-export"
            style="block-size: 16rem"
            rows={makeOrders(60)}
            rowKey="id"
            columns={FILTER_COLUMNS}
            label="Orders to export"
            locale="en"
            settings={{ exportButton: true, filterRow: true }}
            ref={(g: DataGrid<Order>) => (exporting = g)}
          />
          <div class="docs-flow">
            <Button
              text="The first two rows as objects"
              variant="outline"
              onclick={async () => {
                const rows = (await exporting?.exportRows({ values: 'raw' })) ?? [];
                s.exported = JSON.stringify(rows.slice(0, 2));
              }}
            />
            <Button text="Export the 100,000 orders by page" variant="outline" onclick={() => void exportServer()} />
          </div>
          <output class="dg-exported">{() => s.exported}</output>
          <output class="dg-export-progress">{() => (s.progress ? `Server export: ${s.progress}` : '')}</output>
        </Example>
      </Section>

      <Section anchor="layout" title="Keeping the layout">
        <p>
          <Rich text="With `layoutKey` the grid keeps the column widths, order, hidden and pinned columns, the sort and the filters in the browser's `localStorage`, and a grid made again with the same name — after a reload too — gets them back. Storage that is full or blocked is skipped quietly. `resetLayout()` (also in the column menu) goes back to the column definitions. To keep the layout elsewhere, a server for instance, read `layout` and `filters`, listen to `onLayoutChange`, and give them back through the props of the same names." />
        </p>
        <Example
          code={`
<DataGrid rows={() => this.orders} rowKey="id" columns={columns} layoutKey="orders"
  settings={{ saveLayout: () => this.keep }} />

grid.resetLayout();
`}
          stack
        >
          <div class="docs-flow">
            <CheckBox label="Keep the layout" x-model={() => s.keepLayout} />
            <Button text="Make the grid again" variant="outline" onclick={makeAgain} />
            <Button text="Reset the layout" variant="ghost" onclick={() => kept?.resetLayout()} />
          </div>
          {() =>
            s.showLayout && (
              <DataGrid
                class="dg-layout"
                style="block-size: 18rem"
                rows={makeOrders(40)}
                rowKey="id"
                columns={FILTER_COLUMNS}
                label="Orders that keep their layout"
                locale="en"
                layoutKey="docs-orders"
                settings={{ saveLayout: () => s.keepLayout }}
                ref={(g: DataGrid<Order>) => (kept = g)}
              />
            )
          }
        </Example>
      </Section>

      <Section anchor="settings" title="Turning features off">
        <p>
          <Rich text="Every feature has a switch in `settings`, each a value or a function; a column can turn one on or off for itself, and its value wins. `grid.settings` and `grid.columnSettings(field)` change them while the grid shows." />
        </p>
        <Example
          code={`
<DataGrid settings={{ resizable: () => this.resizable, striped: true }} columns={[{ field: 'id', title: 'No', movable: false, menu: false }, …]} />

grid.settings.headerButtons = 'always';
grid.columnSettings('customer').resizable = false;
`}
          stack
        >
          <div class="docs-flow">
            <CheckBox label="Striped" x-model={() => s.striped} />
            <CheckBox label="Resizing" x-model={() => s.resizable} />
            <CheckBox label="Moving" x-model={() => s.movable} />
            <CheckBox label="Pinning" x-model={() => s.pinnable} />
            <CheckBox label="Column menu" x-model={() => s.menu} />
            <CheckBox label="Menu button always" x-model={() => s.always} />
            <CheckBox label="Tooltips" x-model={() => s.tooltips} />
            <CheckBox label="Row count" x-model={() => s.rowCount} />
          </div>
          <DataGrid
            class="dg-settings"
            style="block-size: 16rem"
            rows={makeOrders(25)}
            rowKey="id"
            label="Switches"
            locale="en"
            columns={[{ ...COLUMNS[0], movable: false, menu: false }, ...COLUMNS.slice(1)]}
            settings={{
              striped: () => s.striped,
              resizable: () => s.resizable,
              movable: () => s.movable,
              pinnable: () => s.pinnable,
              menu: () => s.menu,
              headerButtons: () => (s.always ? 'always' : 'hover'),
              tooltips: () => s.tooltips,
              rowCount: () => s.rowCount,
            }}
          />
        </Example>
        <ApiTable head={['Setting', 'Default', 'What it does']} rows={SETTINGS} />
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
          <Rich text="Every text the grid writes — the bar, the pager, the column menu, the row states, the action buttons, the filter conditions, the announcements — comes from `uiLocale.strings` (the `grid…` keys), or from the grid's own `texts`. Numbers and dates follow `locale`." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
<DataGrid texts={{ gridNoRows: 'Nothing here yet' }} locale="tr" … />
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            New row reads <output class="dg-text">{() => uiLocale.strings.gridNewRow}</output>
          </span>
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

