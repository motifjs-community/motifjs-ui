# DataGrid: Bands and adaptive columns

> DataGrid · @motifx-community/ui 0.1.0-beta.1

## Band headers

A band is a header over several columns (band column): give it a `title` and the `columns` under it — columns and other bands, to any depth. The header becomes a row per level of bands over the columns' own titles, each band spanning its columns. Drag a column: it moves only inside its band; drag a band: its columns go with it. A band is pinned, hidden and moved as a whole, from its own menu (its header's button, Alt+Down) or with `columnOption` by its `name`. Here “Payment” sits over three columns and “Order” over two columns and the “Delivery” band.

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

| Band field | Type | Default | What it does |
| --- | --- | --- | --- |
| `title, columns` | `Bind<string>`, `(GridColumn \| GridBand)[]` | — | The band’s caption and what sits under it: columns and bands, to any depth. A band holds no data. |
| `name` | `string` | `band-` and its place | Its identity in the layout, `columnOption`, `columnSettings` and the events (`band-1`, `band-1-2` when it has none). |
| `isBand, ownerBand` | `boolean`, `string \| number` | — | Bands given flat’s `customizeColumns` does: a band with `isBand`, and columns (or bands) that name it in `ownerBand`, by `name` or by its place in `columns`. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | the `bandAlign` setting | Where the caption sits over its columns. |
| `sticky, hidden` | `'start' \| 'end'`, `boolean` | — | The band pinned, or hidden, with all its columns. A column inside a band takes its band’s side; pinning it pins the band. |
| `movable, hideable, pinnable, menu` | `Bind<boolean>` | the grid’s settings | What the user may do with the band: drag it among its neighbours, hide it, pin it, open its menu. |
| `headerCell` | `(ctx) => unknown` | — | Content of your own in the band’s header, made once; `ctx.band`, `ctx.title`. |
| `settings.bandAlign` | `Bind<'start' \| 'center' \| 'end'>` | `'center'` | Where the captions sit when a band does not say. |

| Topic | How bands do it |
| --- | --- |
| `Moving` | A column moves only among the columns and bands of its own band, a band among those beside it, both inside their pinned zone and not across one that cannot move (`movable: false`), by dragging the header, with “Move” in the menu and the arrow keys, or with `columnOption(name, 'visibleIndex', n)`. |
| `Sizing` | The columns are resized as always (the edge of a column’s header, a double-click fits it); a band follows its columns. |
| `Sorting and filters` | A band’s header does not sort and has no filter: its columns do, as before. |
| `Hiding` | Hiding every column of a band hides the band; hiding a band (its menu, `columnOption(name, 'visible', false)`) hides its columns. The last shown column stays. |
| `Column chooser` | With bands the list of columns is a tree with check boxes, the bands over their columns; a band’s check box shows or hides all of them. |
| `Layout` | `grid.layout` keeps the columns’ order, widths and hidden state, and `bands` with each band’s hidden state and side; a band’s place comes from its columns. A layout that tears a band apart puts it together where its first column is. `layoutKey` keeps it all. |
| `Export` | CSV writes a line per level of bands above the titles, each band’s title over its first column; `exportSheet()` adds header rows, and `merges` names the cells a band (and a column down the band rows) spans for the writer to merge. |
| `Rows` | Only the header changes: the rows, the virtual list and paging are as before. |

Band rows are `row`s of `columnheader`s in the head's row group: a band's header carries the `aria-colindex` of its first column and `aria-colspan` its columns, the columns keep their own index, and the band rows count in `aria-rowindex` and `aria-rowcount`. Over a pinned column no band covers an empty piece stays with the column, so the band rows scroll under it.

## Adaptive columns

With `settings.columnHidingEnabled` the grid hides columns while it is narrower than they are, the last one first; with a `hidingPriority` on some columns only those hide, the lowest first. A “…” column then opens a row's adaptive detail under it: the hidden columns' titles and values (editors where the row can be edited), one row at a time. It is worked out from the column widths and the grid's width (a `ResizeObserver`), never from what it draws, and again whenever either changes: drag the splitter. The hidden columns still count as shown — the column chooser, `getVisibleColumns()`, the export and copying have them.

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

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `settings.columnHidingEnabled` | `Bind<boolean>` | `false` | Columns hide while the grid is narrower than they are, the last one first, and show in the rows’ adaptive detail. |
| `column.hidingPriority` | `Bind<number>` | — | Given on any column, only columns with one hide (without `columnHidingEnabled` too), the lowest first. Pinned and grouped columns never hide. |
| `adaptiveDetail.colCount, minColWidth, labelMode` | `Bind<number>`, `Bind<string>`, `Bind<'top' \| 'side' \| 'floating' \| 'hidden'>` | `2`, —, `'side'` | How the detail lays out its form (the kit’s `FormLayout`). |
| `adaptiveDetail.editors` | `Bind<boolean>` | `true` | Editors instead of texts for the cells the user can fill, in the `row`, `cell` and `batch` edit modes; they write into the row’s draft as its cells do. |
| `adaptiveDetail.expandOnEdit` | `Bind<boolean>` | `true` | Editing a row whose hidden columns it can fill opens its detail, and leaving the row closes it again (the `row` edit mode). |
| `adaptiveDetail.columnWidth, toggleKeys` | `Bind<number>`, `Bind<string[]>` | `36`, `['Enter', ' ']` | The “…” column’s width; the keys on its cell that open and close the detail. |

The detail is a row of its own right after its row, before the row's master-detail when both are open (order): measured as it is drawn, in the reading order (`aria-owns`), counted in `aria-rowindex`, its one cell named “Hidden columns of row 3” (`gridAdaptiveOf`; `gridAdaptive` names the “…” and its column). Grouped rows, paging and the virtual list keep it under its row; a wider grid with nothing hidden closes it.

## Keyboard

| Key | What it does |
| --- | --- |
| `Up on a column’s header` | To its band’s header; again to the band above. |
| `Down on a band’s header` | To the first column or band under it. |
| `Left / Right, Home / End on a band’s header` | Along the bands of its row. |
| `Alt+Down, the context menu key on a band’s header` | Its menu: pin, move, hide the band, the column chooser, reset. |
| `Enter, Space on the “…” cell (`toggleKeys`)` | Opens or closes the row’s adaptive detail. |
| `Tab on a row whose detail shows` | Into the detail; from its last stop into the row’s master-detail, or, while the row is edited, on to the next row’s cells. |
| `Tab on the last cell editor of a row` | Into the editors of its open adaptive detail. |
| `Escape, Shift+Tab on the detail’s first stop` | Back to the row. |

## Events and methods

| Member | Gets or returns | What it does |
| --- | --- | --- |
| `onAdaptiveDetailRowPreparing` | `{ row, key, rowIndex, editors, formOptions }` | A row’s detail is about to lay out its form, when it opens and again when other columns hide or show: change `formOptions` (`items` — the hidden fields, or kit form items —, `colCount`, `minColWidth`, `labelMode`). |
| `onAdaptiveDetailRowExpanding / onAdaptiveDetailRowCollapsing` | `{ row, key, rowIndex, cancel }` | A row’s detail is about to open or close, from its “…”, its keys or code; `cancel` keeps it as it is. |
| `onAdaptiveDetailRowExpanded / onAdaptiveDetailRowCollapsed` | `{ row, key, rowIndex }` | It opened or closed. |
| `expandAdaptiveDetailRow(key) / collapseAdaptiveDetailRow()` | `boolean` | Opens a row’s detail by its key (the one open closes first), or closes the one open. |
| `isAdaptiveDetailRowExpanded(key)` | `boolean` | Whether that row’s detail is open. Reactive. |
| `adaptiveHiddenColumns` | `string[]`, reactive | The columns the width hides now, in display order. |
| `adaptiveDetail` | read/write, live | `grid.adaptiveDetail.colCount = 1`; `onOptionChanged` tells `adaptiveDetail.colCount`. |
| `getVisibleRows()` | `GridVisibleRow[]` | The open detail right after its row, `rowType: 'detailAdaptive'`, before the row's master-detail. |

## Example files

`BandHeaders.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack, type GridColumnItem } from '@motifx-community/ui';
import type { Order } from './order';
import { makeOrders } from './orders';

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Two levels of bands over the order columns. */
const columns: GridColumnItem<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  {
    name: 'order',
    title: 'Order',
    columns: [
      { field: 'customer', title: 'Customer', width: 170 },
      { field: 'date', title: 'Date', type: 'date', width: 120 },
      {
        name: 'delivery',
        title: 'Delivery',
        columns: [
          { field: 'city', title: 'City', width: 120 },
          { field: 'note', title: 'Note', width: 220 },
        ],
      },
    ],
  },
  {
    name: 'payment',
    title: 'Payment',
    align: 'end',
    columns: [
      { field: 'status', title: 'Status', width: 110 },
      { field: 'paid', title: 'Paid', type: 'boolean', width: 70 },
      { field: 'amount', title: 'Amount', type: 'number', width: 110, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
    ],
  },
];

/** Band headers: drag a column inside its band or a band among its neighbours, pin and hide bands from their menus. */
export default function BandHeaders() {
  const s = reactive({ csv: '', layout: '' });
  let grid: DataGrid<Order> | null = null;
  const showLayout = () => (s.layout = grid ? JSON.stringify(grid.layout.bands) : '');

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Pin “Order”" variant="outline" onclick={() => grid?.columnOption('order', 'sticky', grid.columnOption('order', 'sticky') ? null : 'start')} />
        <Button text="Hide or show “Delivery”" variant="outline" onclick={() => grid?.columnOption('delivery', 'visible', !grid.columnOption('delivery', 'visible'))} />
        <Button text="Columns…" variant="outline" onclick={() => grid?.showColumnChooser()} />
        <Button
          text="CSV header"
          variant="ghost"
          onclick={async () => {
            const csv = (await grid?.exportCsv({ download: false, bom: false, separator: ',' })) ?? '';
            s.csv = csv.split('\r\n').slice(0, 3).join('\n');
          }}
        />
      </Stack>
      <DataGrid
        class="dg-bands"
        style="block-size: 28rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={columns}
        label="Orders under band headers"
        locale="en"
        settings={{ columnChooserButton: true }}
        onLayoutChange={() => showLayout()}
        onContentReady={() => showLayout()}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-bands-layout">{() => `bands: ${s.layout}`}</output>
      <pre class="dg-bands-csv" x-display={() => s.csv !== ''}>
        {() => s.csv}
      </pre>
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

`AdaptiveColumns.tsx`

```tsx
import { createSignal, reactive } from '@motifx/core';
import { Button, DataGrid, Panel, SplitContainer, Stack, type GridColumn, type SplitPosition } from '@motifx-community/ui';
import type { Order } from './order';
import { makeOrders } from './orders';

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The columns hide in this order as the grid gets narrower: the note first, the customer never. */
const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 60, editable: false },
  { field: 'customer', title: 'Customer', width: 140 },
  { field: 'city', title: 'City', width: 100, hidingPriority: 3 },
  { field: 'date', title: 'Date', type: 'date', width: 110, hidingPriority: 2, editable: false },
  { field: 'status', title: 'Status', width: 100, hidingPriority: 4 },
  { field: 'note', title: 'Note', width: 180, hidingPriority: 0 },
  { field: 'amount', title: 'Amount', type: 'number', width: 100, hidingPriority: 1, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
];

/** Adaptive columns: drag the splitter (or use the buttons) to make the grid narrower; the "…" opens a row's hidden values. */
export default function AdaptiveColumns() {
  const s = reactive({ width: '70%' as SplitPosition });
  const grid = createSignal<DataGrid<Order> | null>(null);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Narrow" variant="outline" onclick={() => (s.width = 420)} />
        <Button text="Medium" variant="outline" onclick={() => (s.width = 640)} />
        <Button text="Wide" variant="outline" onclick={() => (s.width = '100%')} />
        <Button text="Open row 3" variant="ghost" onclick={() => grid.value?.expandAdaptiveDetailRow(3)} />
        <output class="dg-adaptive-hidden">{() => `hidden: ${grid.value?.adaptiveHiddenColumns.join(', ') || 'none'}`}</output>
      </Stack>
      <SplitContainer class="dg-adaptive-split" x-model={() => s.width} firstMinSize={240} secondMinSize={0} collapsible={false} style="block-size: 30rem; inline-size: 100%">
        <DataGrid
          class="dg-adaptive"
          style="block-size: 100%"
          rows={makeOrders(300)}
          rowKey="id"
          columns={columns}
          label="Orders that adapt to their width"
          locale="en"
          settings={{ editable: true }}
          saveMode="batch"
          ref={(g: DataGrid<Order>) => (grid.value = g)}
        />
        <Panel text="Room" padding="sm">
          <p>The space the grid gives up.</p>
        </Panel>
      </SplitContainer>
    </>
  );
}
```
