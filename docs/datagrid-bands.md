# DataGrid: Bands and adaptive columns

> DataGrid · @motifx-community/ui 0.1.0-beta.10

## Band headers

A band is a header that spans several columns. Give it a `title` and the `columns` under it, which can be columns or other bands to any depth. The header gains one row per band level above the column titles, with each band spanning its columns. A column can be dragged only within its band, and dragging a band moves its columns with it. A band is pinned, hidden and moved as a whole, from its own menu (its header button or Alt+Down) or with `columnOption` by its `name`. In this example, “Payment” spans three columns, and “Order” spans two columns and the “Delivery” band.

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

| Band field | Type | Default | Description |
| --- | --- | --- | --- |
| `title, columns` | `Bind<string>`, `(GridColumn \| GridBand)[]` | — | The band's caption and its contents: columns and bands, to any depth. A band holds no data. |
| `name` | `string` | `band-` and its position | Its identity in the layout, `columnOption`, `columnSettings` and the events (`band-1`, or `band-1-2` when nested, if none is given). |
| `isBand, ownerBand` | `boolean`, `string \| number` | — | Bands specified as a flat list: a band with `isBand`, and columns or bands that reference it in `ownerBand`, by `name` or by its position in `columns`. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | The `bandAlign` setting | The position of the caption above its columns. |
| `sticky, hidden` | `'start' \| 'end'`, `boolean` | — | Pins or hides the band with all its columns. A column inside a band uses its band's side, and pinning it pins the band. |
| `movable, hideable, pinnable, menu` | `Bind<boolean>` | The grid's settings | What the user can do with the band: drag it among its neighbors, hide it, pin it and open its menu. |
| `headerCell` | `(ctx) => unknown` | — | Custom content in the band's header, created once. Provides `ctx.band` and `ctx.title`. |
| `settings.bandAlign` | `Bind<'start' \| 'center' \| 'end'>` | `'center'` | The position of captions when a band does not specify one. |

| Topic | Band behavior |
| --- | --- |
| `Moving` | A column moves only among the columns and bands of its own band, and a band among those beside it, both within their pinned zone and not across an item that cannot move (`movable: false`). They move by dragging the header, with “Move” in the menu and the arrow keys, or with `columnOption(name, 'visibleIndex', n)`. |
| `Sizing` | Columns resize as usual (drag the edge of a column's header, or double-click to fit), and a band follows its columns. |
| `Sorting and filters` | A band's header does not sort and has no filter, but its columns work as usual. |
| `Hiding` | Hiding every column of a band hides the band, and hiding a band (from its menu or with `columnOption(name, 'visible', false)`) hides its columns. The last visible column stays. |
| `Column chooser` | With bands, the column list is a tree with check boxes, with bands above their columns. A band's check box shows or hides all of them. |
| `Layout` | `grid.layout` keeps the column order, widths and hidden state, plus `bands` with each band's hidden state and side. A band's position comes from its columns. A layout that splits a band reassembles it at its first column. `layoutKey` saves all of this. |
| `Export` | CSV writes one line per band level above the titles, with each band's title over its first column. `exportSheet()` adds header rows, and `merges` lists the cells a band (and a column spanning the band rows) covers, for the writer to merge. |
| `Rows` | Only the header changes. The rows, the virtual list and paging work as usual. |

Band rows are `row` elements of `columnheader` cells in the header's row group. A band's header has the `aria-colindex` of its first column and an `aria-colspan` of its columns, the columns keep their own index, and band rows count in `aria-rowindex` and `aria-rowcount`. Above a pinned column with no band, an empty piece stays with the column so that the band rows scroll under it.

## Adaptive columns

With `settings.columnHidingEnabled`, the grid hides columns while it is narrower than they are, starting from the last. With `hidingPriority` on some columns, only those hide, lowest first. A “…” column then opens a row's adaptive detail below it, showing the titles and values of the hidden columns (with editors where the row can be edited), one row at a time. This is calculated from the column widths and the grid's width (through a `ResizeObserver`), never from the rendered output, and recalculated whenever either changes. Drag the splitter to see it. Hidden columns still count as visible, so the column chooser, `getVisibleColumns()`, export and copying include them.

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `settings.columnHidingEnabled` | `Bind<boolean>` | `false` | Hides columns while the grid is narrower than they are, starting from the last, and shows them in the row's adaptive detail. |
| `column.hidingPriority` | `Bind<number>` | — | When set on any column, only columns with a priority hide (even without `columnHidingEnabled`), lowest first. Pinned and grouped columns never hide. |
| `adaptiveDetail.colCount, minColWidth, labelMode` | `Bind<number>`, `Bind<string>`, `Bind<'top' \| 'side' \| 'floating' \| 'hidden'>` | `2`, —, `'side'` | The form layout of the detail (the kit's `FormLayout`). |
| `adaptiveDetail.editors` | `Bind<boolean>` | `true` | Uses editors instead of text for cells the user can fill, in the `row`, `cell` and `batch` edit modes. They write into the row's draft, as its cells do. |
| `adaptiveDetail.expandOnEdit` | `Bind<boolean>` | `true` | Editing a row with hidden columns it can fill opens its detail, and leaving the row closes it (the `row` edit mode). |
| `adaptiveDetail.columnWidth, toggleKeys` | `Bind<number>`, `Bind<string[]>` | `36`, `['Enter', ' ']` | The width of the “…” column, and the keys on its cell that open and close the detail. |

The detail is a separate row directly after its row, before the row's master-detail when both are open. It is measured as it renders, is in the reading order (`aria-owns`), counts in `aria-rowindex`, and has one cell named “Hidden columns of row 3” (`gridAdaptiveOf`, with `gridAdaptive` naming the “…” and its column). Grouped rows, paging and the virtual list keep it below its row, and a wider grid with nothing hidden closes it.

## Keyboard

| Key | Description |
| --- | --- |
| `Up on a column’s header` | Moves to its band's header, and again to the band above. |
| `Down on a band’s header` | Moves to the first column or band under it. |
| `Left / Right, Home / End on a band’s header` | Moves along the bands of its row. |
| `Alt+Down, the context menu key on a band’s header` | Opens its menu: pin, move, hide the band, the column chooser and reset. |
| `Enter, Space on the “…” cell (`toggleKeys`)` | Opens or closes the row's adaptive detail. |
| `Tab on a row whose detail shows` | Moves into the detail. From its last stop, it moves into the row's master-detail or, while the row is being edited, on to the next row's cells. |
| `Tab on the last cell editor of a row` | Moves into the editors of its open adaptive detail. |
| `Escape, Shift+Tab on the detail’s first stop` | Returns to the row. |

## Events and methods

| Member | Parameters or return value | Description |
| --- | --- | --- |
| `onAdaptiveDetailRowPreparing` | `{ row, key, rowIndex, editors, formOptions }` | Occurs before a row's detail lays out its form, when it opens and again when other columns hide or show. Change `formOptions` (`items`, which are the hidden fields or kit form items, plus `colCount`, `minColWidth` and `labelMode`). |
| `onAdaptiveDetailRowExpanding / onAdaptiveDetailRowCollapsing` | `{ row, key, rowIndex, cancel }` | Occurs before a row's detail opens or closes, from its “…”, its keys or code. Set `cancel` to keep it as it is. |
| `onAdaptiveDetailRowExpanded / onAdaptiveDetailRowCollapsed` | `{ row, key, rowIndex }` | Occurs after it opens or closes. |
| `expandAdaptiveDetailRow(key) / collapseAdaptiveDetailRow()` | `boolean` | Opens a row's detail by key (any open detail closes first), or closes the open one. |
| `isAdaptiveDetailRowExpanded(key)` | `boolean` | Indicates whether that row's detail is open. Reactive. |
| `adaptiveHiddenColumns` | `string[]`, reactive | The columns currently hidden by width, in display order. |
| `adaptiveDetail` | read/write, live | `grid.adaptiveDetail.colCount = 1`. `onOptionChanged` reports `adaptiveDetail.colCount`. |
| `getVisibleRows()` | `GridVisibleRow[]` | The open detail directly after its row, with `rowType: 'detailAdaptive'`, before the row's master-detail. |

## Feedback

Loading issues…

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

/** Band headers: drag a column inside its band or a band among its neighbors, and pin and hide bands from their menus. */
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
