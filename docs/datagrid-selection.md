# DataGrid: Selection and export

> DataGrid · @motifx-community/ui 0.1.0-beta.7

## Selection

`selection` is `single`, where the selection follows the active row, or `multiple`, with a check box column. Clicking selects a row, Ctrl adds or removes one, and Shift selects a range. Shift+Space, Shift+arrow keys and Ctrl+A do the same from the keyboard. The header check box selects every row of the filter, including on a server, where the grid keeps a state of “all except these keys” instead of the rows. `selection` provides that state, and `selectionFilter` provides the same thing as a filter for the server. Selected rows use the selection appearance of the design language, as its lists and trees do, with its fill and text color and any frame, raised effect or start bar it defines. The hover and active row tints sit above it, with the keyboard focus ring on top, and a selected row stays one row high.

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

Ctrl+C copies the selected rows, or the active cell, as tab-separated text and an HTML table, so a spreadsheet or document receives it as a table. Ctrl+V on a cell writes tab-separated text, from a spreadsheet or copied from the grid, into the editable cells to the right of and below that cell. Each value is interpreted by column type (numbers and dates by locale, yes or no, and a list option by its text) and goes into the row's draft with validation, as if typed. Cells that cannot be edited keep their values. Rows below the active row are saved according to the save mode.

```tsx
/** An order, as stored by the sample server. */
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

`exportCsv()` saves the rows of the filter, in sort order, with the visible columns in their order, as a CSV file that a spreadsheet can open directly. The file is UTF-8 with a byte order mark and uses the locale's separator (`;` where decimals use a comma), with column titles first, and text that a spreadsheet would run as a formula is neutralized. `exportRows()` returns the same rows as objects. In-memory rows are used as they are, and server rows are requested in parts through the data source, so its filter, search and sort apply and nothing on screen changes. `exportButton` adds an “Export” button to the toolbar, and `exportable` excludes a column.

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

The grid does not include an xlsx writer. The application provides ExcelJS (`npm i exceljs`, an optional peer dependency) and calls `exportDataGrid({ component, worksheet })` from `@motifx-community/ui/excel`, a separate entry point that applications without Excel export never load. With `export: { formats: ['xlsx', 'csv'] }`, the toolbar's export button becomes a menu (“Export all data to Excel”, and “Export selected rows to Excel” with `allowExportSelectedData`). The Excel commands raise `onExporting` with `format: 'xlsx'` and `selectedRowsOnly`, and the handler writes and saves the workbook. In this example, it is a Blob download, with ExcelJS loaded on the first export.

```tsx
/** An order, as stored by the sample server. */
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

The sheet contains the frozen header row and the rows in grid order with the filter, search and grouping applied. Every matching row is included, and server rows load in parts while a panel over the rows shows the progress and a Stop button. It also includes group rows (“Column: value” with their summary items, with aligned items under their columns) with Excel outline levels, group footers and totals. Numbers stay numbers, with a number format derived from the column's `Intl` format, and dates stay dates. Yes/no cells are Excel's `TRUE` and `FALSE` (`booleanText` writes the grid's text), lookup and list cells contain their text, a column with a `format` function contains its text, and widths follow the grid. `customizeCell({ gridCell, excelCell })` changes any cell, and `gridCell` provides `rowType`, `column`, `data`, `value`, `groupIndex`, `groupSummaryItems` and `totalSummaryItemName`. The promise resolves with the cells written, `{ from, to }`.

| exportDataGrid option | Default | Description |
| --- | --- | --- |
| `component, worksheet` | — | The grid, and the ExcelJS worksheet to write to (`workbook.addWorksheet('Orders')`). |
| `topLeftCell` | `{ row: 1, column: 1 }` | The position of the first cell: `{ row, column }` or a reference such as `'B2'`. |
| `customizeCell` | — | `({ gridCell, excelCell }) => void` for every cell, after its value and style are set. |
| `autoFilterEnabled` | `false` | Adds Excel filter buttons to the header row. |
| `keepColumnWidths` | `true` | Makes columns as wide as in the grid. |
| `selectedRowsOnly` | The toolbar command, otherwise `false` | Exports only the selected rows, without group rows or summaries, as with CSV. |
| `loadPanel` | On | The panel over the rows while they load: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`. |
| `encodeExecutableContent` | `false` | Prefixes text that a spreadsheet would run as a formula with `'`. |
| `headers, frozenHeader` | `true` | The row of column titles, which stays in view while the sheet scrolls. |
| `groups, outline, summaries` | `true` | Group rows, outline levels by group (up to 7), group summary items, footers and totals. |
| `numberFormats, booleanText` | `true`, `false` | Excel number formats from the columns' `Intl` formats, and the grid's yes/no text instead of `TRUE` and `FALSE`. |
| `pageSize, onProgress, signal` | The `exportPageSize` setting | The rows per request to a server, a callback after each part, and a signal that stops the export (the promise rejects with an `AbortError`). |

## Export to PDF

PDF export works the same way. The application provides jsPDF (`npm i jspdf`, an optional peer dependency) and calls `exportDataGrid({ jsPDFDocument, component })` from `@motifx-community/ui/pdf`, a separate entry point. Add `'pdf'` to `export.formats`, and the toolbar menu offers “Export all data to PDF” (and the selected rows). The command raises `onExporting` with `format: 'pdf'`, and the handler creates the document, draws the grid on it and saves it. The table is drawn with jsPDF's own calls and no table plugin. It includes the header rows with bands merged over their columns, the rows in grid order with the filter, search, grouping, text and alignment of the grid, the group rows across the row, the group footers and the totals. Columns use the grid's widths, narrowed to fit the page, and rows that do not fit continue on the next page below repeated header rows. In right-to-left layouts, the columns run from the right edge.

```tsx
/** An order, as stored by the sample server. */
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

The built-in jsPDF fonts (Helvetica, Times, Courier) support Latin-1 only. Turkish letters such as İ, ş and ğ, and Cyrillic, Greek or Arabic text, require a TrueType font that contains them, added to the document before export (`doc.addFileToVFS`, `doc.addFont`, `doc.setFont`). A bold style is also needed, because group rows and totals use it. This example fetches Noto Sans on the first export, and keeps the jsPDF font if the fetch fails. The promise resolves with the end of the table (`{ page, y }`), so that you can continue writing below it.

| exportDataGrid option | Default | Description |
| --- | --- | --- |
| `jsPDFDocument, component` | — | The jsPDF document to draw on (`new jsPDF()`, with the table starting on its current page), and the grid. |
| `topLeft` | `{ x: 0, y: 0 }` | The position where the table starts on its first page, measured from the top left margin. |
| `margin` | 40 points on each side | The space kept free at the page edges: a number, or `{ top, right, bottom, left }`. |
| `columnWidths` | The grid's widths, scaled to fit | The width of each column, in order. An omitted column uses the grid's width. |
| `fitColumns` | `'shrink'` | Without `columnWidths`: narrows the grid's widths when wider than the page (`'shrink'`), always makes them as wide as the page (`'fill'`), or leaves them as they are (`'none'`). |
| `repeatHeaders` | `true` | Repeats the header rows, including bands, at the top of every page. |
| `indent` | `0` | The indent of a group's rows from its group row, per level. |
| `customizeCell` | — | `({ gridCell, pdfCell }) => void` for every cell, before the rows are measured: `text`, `font` (`size`, `name`, `style`), `textColor`, `backgroundColor`, `borderColor`, `borderWidth`, the four `draw…Border` options, `horizontalAlign`, `verticalAlign`, `padding` and `wordWrapEnabled`. |
| `customDrawCell` | — | `({ doc, rect, gridCell, pdfCell, cancel }) => void` before a cell is drawn. Draw it yourself, such as an image or a bar, and set `cancel` (the borders are still drawn). |
| `onRowExporting` | — | `({ rowCells, rowHeight }) => void` before a row is placed. Set a taller `rowHeight` (never less than its text requires). |
| `wordWrapEnabled, fontSize` | `false`, `10` | Wraps long text onto more lines (otherwise, a line that does not fit ends in “…”), and sets the cell font size in points. |
| `selectedRowsOnly` | The toolbar command, otherwise `false` | Exports only the selected rows, without group rows or summaries, as with CSV and Excel. |
| `loadPanel` | On | The panel over the rows while they load, with the progress and a Stop button: `true` / `false`, or `{ enabled, text, showProgress, cancelButton }`. |
| `headers, groups, summaries` | `true` | The header rows, one row per group, group summary items, footers and totals. |
| `pageSize, onProgress, signal` | The `exportPageSize` setting | The rows per request to a server, a callback after each part, and a signal that stops the export (the promise rejects with an `AbortError`, and nothing is drawn). |

## Feedback

Loading issues…

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
  // The server groups, so "all except these keys" is sent to it as a filter.
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

/** `n` sample orders, the same ones every time. */
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
/** An order, as stored by the sample server. */
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

/** Ctrl+C and Ctrl+V as tab-separated text, and the same programmatically. */
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
        <Button text="Copy programmatically" variant="outline" onclick={() => (s.copied = grid?.copy() ?? '')} />
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

  // A grid created with `new` can export without being shown. This one reads the orders of the paged grid.
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

/** The number of times rows were requested from the server below. */
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

  // The grid raises onExporting for 'pdf', and the file is written here. jsPDF loads
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
