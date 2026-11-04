# DataGrid: Selection and export

> DataGrid · @motifx-community/ui 0.1.0-beta.1

## Selection

`selection` is `single` (the selection follows the active row) or `multiple`, with a check box column. A click selects a row, Ctrl adds or takes out, Shift selects a range; Shift+Space, Shift+arrows and Ctrl+A do it from the keyboard. The header check box selects every row of the filter — on a server too: the grid keeps a state, “all but these keys”, never the rows. `selection` gives that state, `selectionFilter` the same as a filter for the server. Selected rows wear the design language's own selection look, as its lists and trees do: its fill and text colour, and its frame, raised effect or bar at the start where it has them; the hover and the active row's tint lie over it, the keyboard focus ring on top, and a selected row stays one row high.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## Copy and paste

Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table: a spreadsheet or a document takes it as a table. Ctrl+V on a cell writes tab-separated text — from a spreadsheet, or copied here — into the editable cells from that cell rightwards and downwards. Each value is read by the column type (numbers and dates in the locale, yes or no, a list option by its text) and goes into the row's draft with its checks, as if typed; cells that cannot be edited keep their values. The rows below the active one are saved as the save mode says.

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

## Export

`exportCsv()` saves the rows of the filter, in the sort order, with the visible columns in their order, as a CSV file a spreadsheet opens as it is: UTF-8 with a byte order mark, the locale's separator (`;` where decimals take a comma), the column titles first, and text that would run as a formula made harmless. `exportRows()` gives the same rows as objects. Rows in memory are taken as they are; a server's are asked for in parts through the data source, so its filter, search and sort apply and nothing on the screen changes. `exportButton` puts an “Export” button in the toolbar; `exportable` takes a column out.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## Export to Excel

the grid does not carry an xlsx writer: the app brings ExcelJS (`npm i exceljs`, an optional peer dependency) and calls `exportDataGrid({ component, worksheet })` from `@motifx-community/ui/excel` — a separate entry, so apps that never export to Excel never load it. With `export: { formats: ['xlsx', 'csv'] }` the toolbar's export button becomes a menu (“Export all data to Excel”, “Export selected rows to Excel” with `allowExportSelectedData`); the Excel commands raise `onExporting` with `format: 'xlsx'` and `selectedRowsOnly`, and the handler writes the workbook and saves it, here as a Blob download with ExcelJS loaded on the first export.

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

The sheet holds the header row (frozen), the rows in the grid's order with its filter, search and grouping — every matching row, a server's loaded in parts while a panel over the rows shows the progress and a button that stops it — the group rows (“Column: value” with their summary items, those aligned by column under their columns) with outline levels Excel folds, the group footers and the totals. Numbers stay numbers with a number format made from the column's `Intl` format, dates stay dates, yes/no cells are Excel's `TRUE` / `FALSE` (`booleanText` writes the grid's text), lookup and list cells hold their texts, a column with a `format` function its text, and widths follow the grid. `customizeCell({ gridCell, excelCell })` changes any cell; `gridCell` has `rowType`, `column`, `data`, `value`, `groupIndex`, `groupSummaryItems` and `totalSummaryItemName`. The promise resolves with the cells written, `{ from, to }`.

| exportDataGrid option | Default | What it does |
| --- | --- | --- |
| `component, worksheet` | — | The grid, and the ExcelJS worksheet to write to (`workbook.addWorksheet('Orders')`). |
| `topLeftCell` | `{ row: 1, column: 1 }` | Where the first cell goes: `{ row, column }` or a reference such as `'B2'`. |
| `customizeCell` | — | `({ gridCell, excelCell }) => void` for every cell, after its value and style are set. |
| `autoFilterEnabled` | `false` | Excel’s filter buttons on the header row. |
| `keepColumnWidths` | `true` | Columns as wide as in the grid. |
| `selectedRowsOnly` | the toolbar’s command, else `false` | Only the selected rows (no group rows or summaries, as with CSV). |
| `loadPanel` | on | The panel over the rows while they load: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`. |
| `encodeExecutableContent` | `false` | Text a spreadsheet would run as a formula gets a `'` in front. |
| `headers, frozenHeader` | `true` | The row of column titles; it stays in view while the sheet scrolls. |
| `groups, outline, summaries` | `true` | Group rows; outline levels by group (at most 7); group summary items, footers and the totals. |
| `numberFormats, booleanText` | `true`, `false` | Excel number formats from the columns’ `Intl` formats; the grid’s yes/no text instead of `TRUE` / `FALSE`. |
| `pageSize, onProgress, signal` | the `exportPageSize` setting | Rows per request to a server; told after each part; stops the export (the promise rejects with an `AbortError`). |

## Export to PDF

The same way for PDF: the app brings jsPDF (`npm i jspdf`, an optional peer dependency) and calls `exportDataGrid({ jsPDFDocument, component })` from `@motifx-community/ui/pdf`, its own entry. Add `'pdf'` to `export.formats` and the toolbar's menu offers “Export all data to PDF” (and the selected rows); the command raises `onExporting` with `format: 'pdf'`, and the handler makes the document, draws the grid on it and saves it. The table is drawn with jsPDF's own calls, no table plugin: the header rows with bands merged over their columns, the rows in the grid's order with its filter, search and grouping and the texts and alignment the grid shows, the group rows across the row, the group footers and the totals. Columns take the grid's widths, narrowed to fit the page; rows that do not fit go on to the next page under the header rows again; right to left, the columns run from the right edge.

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

jsPDF's own fonts (Helvetica, Times, Courier) write Latin-1 only: Turkish letters such as İ, ş and ğ, and Cyrillic, Greek or Arabic text, need a TrueType font that has them, added to the document before the export (`doc.addFileToVFS`, `doc.addFont`, `doc.setFont`) — with a bold style too, which group rows and totals use. This example fetches Noto Sans the first time it exports and keeps jsPDF's font when it cannot. The promise resolves with where the table ends (`{ page, y }`), to go on writing under it.

| exportDataGrid option | Default | What it does |
| --- | --- | --- |
| `jsPDFDocument, component` | — | The jsPDF document to draw on (`new jsPDF()`; the table starts on its current page), and the grid. |
| `topLeft` | `{ x: 0, y: 0 }` | Where the table starts, from the top left margin, on its first page. |
| `margin` | 40 points on every side | Space kept free at the page’s edges: a number, or `{ top, right, bottom, left }`. |
| `columnWidths` | the grid’s, made to fit | Each column’s width, in order; one left out takes the grid’s. |
| `fitColumns` | `'shrink'` | Without `columnWidths`: the grid's widths narrowed when wider than the page (`'shrink'`), always as wide as it (`'fill'`), or as they are (`'none'`). |
| `repeatHeaders` | `true` | The header rows (bands included) again at the top of every page. |
| `indent` | `0` | How far the rows of a group sit in from its group row, per level. |
| `customizeCell` | — | `({ gridCell, pdfCell }) => void` for every cell before the rows are measured: `text`, `font` (`size`, `name`, `style`), `textColor`, `backgroundColor`, `borderColor`, `borderWidth`, the four `draw…Border`s, `horizontalAlign`, `verticalAlign`, `padding`, `wordWrapEnabled`. |
| `customDrawCell` | — | `({ doc, rect, gridCell, pdfCell, cancel }) => void` before a cell is drawn: draw it yourself (an image, a bar) and set `cancel` (the borders are still drawn). |
| `onRowExporting` | — | `({ rowCells, rowHeight }) => void` before a row is placed: a taller `rowHeight` (never less than its text needs). |
| `wordWrapEnabled, fontSize` | `false`, `10` | Long text on more lines (off: a line that does not fit ends in “…”); the cells’ font size in points. |
| `selectedRowsOnly` | the toolbar’s command, else `false` | Only the selected rows (no group rows or summaries, as with CSV and Excel). |
| `loadPanel` | on | The panel over the rows while they load, with the progress and a Stop button; `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`. |
| `headers, groups, summaries` | `true` | The header rows; a row per group; group summary items, footers and the totals. |
| `pageSize, onProgress, signal` | the `exportPageSize` setting | Rows per request to a server; told after each part; stops the export (the promise rejects with an `AbortError`, nothing is drawn). |

## Example files

`Selection.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridAction, type GridSelection } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const MODES = ['none', 'single', 'multiple'] as const;

const describe = (sel: GridSelection | undefined) =>
  !sel ? '' : sel.all ? `all but ${sel.except.length} (${sel.except.slice(0, 5).join(', ')})` : `${sel.keys.length} picked (${sel.keys.slice(0, 5).join(', ')})`;

/** Single and multiple selection; over 100,000 rows on a server "all" is a state, never the rows. */
export default function Selection() {
  const s = reactive({ mode: 'multiple' as 'none' | 'single' | 'multiple', selection: undefined as GridSelection | undefined, note: '' });
  // The server groups, so "all but these keys" goes to it as a filter.
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  let grid: DataGrid<Order> | null = null;
  let server: DataGrid<Order> | null = null;

  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = `Order ${row.id} sent to the printer`) };
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = `Mail to ${row.customer}`) };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-selection"
        style="block-size: 28rem"
        rows={makeOrders(40)}
        rowKey="id"
        columns={columns}
        label="Orders to select"
        locale="en"
        settings={{ selection: () => s.mode }}
        onSelectionChanged={(e) => (s.selection = e.selection)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-selection-state">{() => `${(grid?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(s.selection)}`}</output>
      <DataGrid
        class="dg-server-selection"
        style="block-size: 28rem"
        dataSource={orders}
        columns={columns}
        label="100,000 orders to select"
        locale="en"
        settings={{ selection: 'multiple' }}
        actions={[print, mail]}
        ref={(g: DataGrid<Order>) => (server = g)}
      />
      <output class="dg-server-selection-state">{() => `${(server?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(server?.selection)}`}</output>
      <output>{() => s.note}</output>
    </>
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

`slow-adapter.ts`

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

`Clipboard.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Ctrl+C and Ctrl+V as tab-separated text, and the same from code. */
export default function Clipboard() {
  const s = reactive({ raw: false, headers: false, newRows: false, copied: '' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Values, not the shown text" x-model={() => s.raw} />
        <CheckBox label="Column titles" x-model={() => s.headers} />
        <CheckBox label="New rows from extra lines" x-model={() => s.newRows} />
      </Stack>
      <DataGrid
        class="dg-clipboard"
        style="block-size: 28rem"
        rows={makeOrders(20)}
        rowKey="id"
        columns={columns}
        label="Orders to copy"
        locale="en"
        saveMode="batch"
        settings={{
          editable: true,
          addRows: true,
          selection: 'multiple',
          copyValues: () => (s.raw ? 'raw' : 'shown'),
          copyHeaders: () => s.headers,
          pasteNewRows: () => s.newRows,
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Copy from code" variant="outline" onclick={() => (s.copied = grid?.copy() ?? '')} />
        <Button text="Paste two lines at the active cell" variant="outline" onclick={() => grid?.paste('Ada Lovelace\tİzmir\nGrace Hopper\tAnkara')} />
        <output class="dg-copied">{() => (s.copied ? `Copied: ${s.copied.replace(/\t/g, ' → ').replace(/\r?\n/g, ' ¶ ')}` : '')}</output>
      </Stack>
    </>
  );
}
```

`Export.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, filterColumns, makeOrders } from './orders';
import { pagedOrders } from './paged-orders';

/** The bar's "Export" button, rows as objects, and 100,000 rows of a server saved in parts. */
export default function Export() {
  const s = reactive({ exported: '', progress: '' });
  let grid: DataGrid<Order> | null = null;

  const firstTwo = async () => {
    const rows = (await grid?.exportRows({ values: 'raw' })) ?? [];
    s.exported = JSON.stringify(rows.slice(0, 2));
  };

  // A grid made with `new` exports without being shown; this one reads the orders of the paged grid.
  const exportServer = async () => {
    const server = new DataGrid<Order>({ dataSource: pagedOrders, columns, label: 'Orders by page', locale: 'en' });
    s.progress = 'starting…';
    try {
      await server.exportCsv({ pageSize: 10_000, fileName: 'orders', onProgress: (n, total) => (s.progress = `${n.toLocaleString('en')} of ${total.toLocaleString('en')}`) });
      s.progress += ' — saved';
    } catch {
      s.progress = 'failed';
    } finally {
      server.dispose();
    }
  };

  return (
    <>
      <DataGrid
        class="dg-export"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={filterColumns}
        label="Orders to export"
        locale="en"
        settings={{ exportButton: true, filterRow: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="The first two rows as objects" variant="outline" onclick={firstTwo} />
        <Button text="Export the 100,000 orders by page" variant="outline" onclick={() => void exportServer()} />
      </Stack>
      <output class="dg-exported">{() => s.exported}</output>
      <output class="dg-export-progress">{() => (s.progress ? `Server export: ${s.progress}` : '')}</output>
    </>
  );
}
```

`paged-orders.ts`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { makeOrders } from './orders';

/** How many times the server below was asked for rows. */
export const pagedLoads = reactive({ count: 0 });

const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 250);
server.onLoading(() => pagedLoads.count++);

/** 100,000 orders on a server, loaded a page at a time; the paged grid shows them, the export reads them. */
export const pagedOrders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'page', pageSize: 20 });
```

`ExcelExport.tsx`

```tsx
import { reactive } from '@motifx/core';
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';
import { exportDataGrid } from '@motifx-community/ui/excel';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Saves a file through a link the browser downloads. */
function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The toolbar's export menu: Excel through ExcelJS and `exportDataGrid`, CSV by the grid itself. */
export default function ExcelExport() {
  const s = reactive({ saved: '' });
  // Grouped by city; the amount in `Intl` options, which become its Excel number format.
  const byCity = columns.map((c) =>
    c.field === 'city' ? { ...c, groupIndex: 0 } : c.field === 'amount' ? { ...c, width: 150, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 } } : c,
  );
  const summary: GridSummary<Order> = {
    totalItems: [
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },
      { column: 'amount', summaryType: 'sum' },
    ],
    groupItems: [
      { column: 'amount', summaryType: 'sum', alignByColumn: true },
      { column: 'amount', summaryType: 'max', showInGroupFooter: true },
    ],
  };

  // The grid raises onExporting for 'xlsx'; the file is written here. ExcelJS
  // loads the first time, so the page does not carry it until someone exports.
  const onExporting = async (e: GridExportingEventArgs) => {
    if (e.format !== 'xlsx') return;
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    const range = await exportDataGrid({
      component: e.component,
      worksheet,
      selectedRowsOnly: e.selectedRowsOnly,
      autoFilterEnabled: true,
      customizeCell: ({ gridCell, excelCell }) => {
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') excelCell.font = { color: { argb: 'FFB42318' } };
      },
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveFile(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Orders.xlsx');
    s.saved = `Orders.xlsx: rows ${range.from.row}–${range.to.row}, columns ${range.from.column}–${range.to.column}`;
  };

  return (
    <>
      <DataGrid
        class="dg-excel"
        style="block-size: 32rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={byCity}
        label="Orders for Excel"
        locale="en"
        summary={summary}
        settings={{ exportButton: true, selection: 'multiple' }}
        export={{ formats: ['xlsx', 'csv'], allowExportSelectedData: true }}
        onExporting={onExporting}
      />
      <output class="dg-excel-saved">{() => s.saved}</output>
    </>
  );
}
```

`PdfExport.tsx`

```tsx
import { reactive } from '@motifx/core';
import { DataGrid, type GridExportingEventArgs, type GridSummary } from '@motifx-community/ui';
import { exportDataGrid } from '@motifx-community/ui/pdf';
import type { jsPDF } from 'jspdf';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

// jsPDF's own fonts write Latin-1 only: "İzmir" and "İlhan Koman" need a font that has their letters.
const FONT = 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans@0.2.3/';
let font: Promise<{ regular: string; bold: string }> | null = null;

async function base64(url: string): Promise<string> {
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

/** Noto Sans in the document, fetched once; without the network the document keeps jsPDF's own font. */
async function useNotoSans(doc: jsPDF) {
  font ??= Promise.all([base64(`${FONT}NotoSans_400Regular.ttf`), base64(`${FONT}NotoSans_700Bold.ttf`)]).then(([regular, bold]) => ({ regular, bold }));
  try {
    const { regular, bold } = await font;
    doc.addFileToVFS('NotoSans-Regular.ttf', regular);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', bold);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    doc.setFont('NotoSans', 'normal');
  } catch {
    font = null;
  }
}

/** The toolbar's export menu with PDF: `onExporting` draws the grid on a jsPDF document and saves it. */
export default function PdfExport() {
  const s = reactive({ saved: '' });
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c));
  const summary: GridSummary<Order> = {
    totalItems: [{ column: 'amount', summaryType: 'sum' }],
    groupItems: [
      { column: 'id', summaryType: 'count' },
      { column: 'amount', summaryType: 'sum', showInGroupFooter: true },
    ],
  };

  // the grid raises onExporting for 'pdf' and the file is made here. jsPDF loads
  // the first time someone exports.
  const onExporting = async (e: GridExportingEventArgs) => {
    if (e.format !== 'pdf') return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape' });
    await useNotoSans(doc);
    doc.setFontSize(14);
    doc.text('Orders by city', 14, 14);
    const end = await exportDataGrid({
      jsPDFDocument: doc,
      component: e.component,
      selectedRowsOnly: e.selectedRowsOnly,
      topLeft: { y: 6 },
      margin: 14,
      indent: 4,
      customizeCell: ({ gridCell, pdfCell }) => {
        if (gridCell.rowType === 'group') pdfCell.backgroundColor = '#EEF2F8';
        if (gridCell.rowType === 'data' && gridCell.column?.field === 'status' && gridCell.value === 'Cancelled') pdfCell.textColor = '#B42318';
      },
    });
    doc.save('Orders.pdf');
    s.saved = `Orders.pdf: ${doc.getNumberOfPages()} pages, the table ends on page ${end.page}`;
  };

  return (
    <>
      <DataGrid
        class="dg-pdf"
        style="block-size: 28rem"
        rows={makeOrders(120)}
        rowKey="id"
        columns={byCity}
        label="Orders for PDF"
        locale="en"
        summary={summary}
        settings={{ exportButton: true, selection: 'multiple' }}
        export={{ formats: ['pdf', 'csv'], allowExportSelectedData: true }}
        onExporting={onExporting}
      />
      <output class="dg-pdf-saved">{() => s.saved}</output>
    </>
  );
}
```
