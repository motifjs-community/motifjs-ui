# DataGrid: Scrolling

> DataGrid · @motifx-community/ui 0.1.0-beta.3

## Scrolling modes

The `mode` prop picks how the rows are reached. Every mode draws only the rows in view from a small pool of rows, so the page never holds one element per row.

| Mode | What it does |
| --- | --- |
| `'virtual' (default)` | One long list: the scroll bar is as long as every row, blocks load where the view is (a source with `loadMode: 'blocks'`), the rows between are never asked for. |
| `'paged'` | Pages with a pager; a source that loads by page is always paged. |
| `'infinite'` | The rows show part by part, `pageSize` each; the next part loads as the view nears the end and the scroll bar grows with the rows that came. No total is needed. Rows in memory, groups and summaries are shown part by part the same way. |

## Infinite scrolling

With `mode: 'infinite'` the grid shows 50 orders, and as the last of them comes into view it asks the server for the next 50, with “Loading more rows…” over the bottom while they come. This server cannot count (`count: false`): the grid finds the end when a part comes back short. Turn on “The next part fails” and scroll down: the mark offers Retry. Sort, filter or search: it starts again from the first part.

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

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `mode` | `Bind<'virtual' \| 'paged' \| 'infinite'>` | `'virtual'` | How the rows are shown; another mode starts the data again. |
| `pageSize` | `Bind<number>` | `100` | Rows of a part for rows in memory (0: every row at once). A source that loads by blocks uses its own block size. |
| `settings.loadMoreDistance` | `Bind<number>` | `0` | Rows left below the view when the next part starts to load; 0 waits for the last row to come into view. |
| `settings.preloadEnabled` | `Bind<boolean>` | `false` | The next part loads one part earlier (in virtual mode: a part on each side of the view), so scrolling seldom waits. |
| `settings.loadMoreIndicator` | `Bind<boolean>` | `true` | The “Loading more rows…” mark over the last rows while a part loads, with Retry when it failed. |
| `DataSource count` | `boolean` | `true` | Off, no part asks the server for a total: a part shorter than the block size ends the rows (an empty one after a full one too). |

| Member | Gets or returns | What it does |
| --- | --- | --- |
| `onMoreRowsLoading` | `{ skip, take, cancel }` | The next part is about to load (the view near the end, `loadMore()`, Ctrl+End); `cancel` keeps the rows as they are. |
| `onMoreRowsLoaded` | `{ skip, count, ended }` | A part came: `count` rows from `skip`; `ended` once every row shows. |
| `loadMore()` | `boolean` | Loads the next part, after `onMoreRowsLoading`; `false` while the rows load, a part is loading or failed, or every row shows. |
| `loadingMore, endReached` | `boolean`, reactive | A part is loading; every row shows (always outside infinite mode). |
| `retry()` | — | Loads a part that failed again (the mark’s Retry does the same). |
| `pageIndex(), pageIndex(n), page` | `number` | The last part shown; with a number, loads the parts up to that one and scrolls to its first row. |
| `pageCount` | `number`, reactive | The parts of every row once their count is known, else the parts shown. |
| `total, totalCount()` | `number` | `total`: the rows shown so far. `totalCount()`: every matching row once known (counted, or the last part came), −1 until then. |
| `refresh()` | — | Loads the rows shown again, keeping the position. |

| Topic | How infinite mode does it |
| --- | --- |
| `The end` | With a count the end is known from the first part; without one (`count: false`) a part that comes back short is the last one. Scrolling at the end asks for nothing more. |
| `Failing parts` | A part that fails shows Retry in the mark (in the bottom bar with `loadMoreIndicator` off); scrolling does not ask for it again until Retry. The rows shown stay; the first part failing shows the grid’s own error. |
| `Sort, filter, search` | Start again from the first part, at the top. |
| `Grouping` | Group rows and rows show part by part together. Groups from a server load only the rows of the part shown; in memory every row is already there. |
| `Selection, export` | “Select all” and Ctrl+A select every matching row, loaded or not; the export writes every row, the parts not loaded too. |
| `Editing, details` | The row in edit, the focused row, its details and the selection stay as parts come; new rows open after the rows shown. |
| `Pager` | Hidden: the rows are reached by scrolling. |
| `Assistive technology` | `aria-rowcount` is −1 until the last part came; each row keeps its `aria-rowindex`. |

## Rows in memory, grouped

Rows in memory are shown part by part too, here 100 places at a time grouped by city: group rows and rows count alike, so the next city's group shows once its part does. Details, selection and the group summaries work as in the other modes.

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

## Virtual columns

With `settings.columnRenderingMode: 'virtual'` (`columnRenderingMode`) only the scrolling columns in view, and `extraColumns` on each side, get cells; the others keep their place in the layout and get cells as they come into view. Here 100,000 hours of 200 sensors, in bands of 20, with the hour and the sum pinned. Turn “Virtual columns” off to see the same grid with every column drawn.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, NumberBox, Stack } from '@motifx-community/ui';
import type { GridColumnItem } from '@motifx-community/ui';

type Reading = { id: number };

const SENSORS = 200;

/** 200 sensors in bands of 20, each reading worked out from the row: no row holds 200 values. */
const columns: GridColumnItem<Reading>[] = [
  { field: 'id', title: 'Hour', type: 'number', width: 90, sticky: 'start' },
  ...Array.from({ length: SENSORS / 20 }, (_, b) => ({
    title: `Sensors ${b * 20 + 1}–${b * 20 + 20}`,
    columns: Array.from({ length: 20 }, (_, k) => {
      const n = b * 20 + k;
      return { field: `s${n}`, title: `S${n + 1}`, type: 'number' as const, width: 90, value: (r: Reading) => ((r.id * (n + 7)) % 1000) / 10 };
    }),
  })),
  { field: 'total', title: 'Sum', type: 'number', width: 100, sticky: 'end', value: (r: Reading) => (r.id * 31) % 100_000 },
];

const rows: Reading[] = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1 }));

/** 100,000 rows × 200 columns: only the columns in view (and two on each side) get cells. */
export default function VirtualColumns() {
  const s = reactive({ virtual: true, extra: 2 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Virtual columns" x-model={() => s.virtual} />
        <NumberBox label="Extra columns" labelMode="side" min={0} max={20} x-model={() => s.extra} />
      </Stack>
      <DataGrid
        class="dg-columns"
        style="block-size: 30rem"
        rows={rows}
        rowKey="id"
        columns={columns}
        label="Sensor readings"
        locale="en"
        settings={{ columnRenderingMode: () => (s.virtual ? 'virtual' : 'standard'), extraColumns: () => s.extra ?? 0, filterRow: true }}
      />
    </>
  );
}
```

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `settings.columnRenderingMode` | `Bind<'standard' \| 'virtual'>` | `'standard'` | `'virtual'`: only the scrolling columns in view and `extraColumns` on each side get cells; pinned columns always do. |
| `column.columnRenderingMode` | `Bind<'standard' \| 'virtual'>` | the grid’s | One column’s own: `'standard'` keeps its cells while it is out of view (a cell content with a state of its own), `'virtual'` lets only it go. |
| `settings.extraColumns` | `Bind<number>` | `2` | Columns drawn beyond the ones in view on each side, so a quick sideways scroll shows no gap. |
| `settings.renderAsync` | `Bind<boolean \| 'auto'>` | `'auto'` | The columns coming into view are drawn as the rows scroll (`false`), once the scrolling stops (`true`), or once it stops while drawing them takes longer than the threshold. |
| `settings.columnRenderingThreshold` | `Bind<number>` | `300` | Milliseconds drawing the new columns may take before they wait for the scrolling to stop (`renderAsync: 'auto'`). |
| `settings.columnRenderingDelay` | `Bind<number>` | `300` | Milliseconds without sideways scrolling before the columns that waited are drawn. |

| Topic | How virtual columns do it |
| --- | --- |
| `Rows of every kind` | The header, the filter row, the rows, the group rows’ items under their columns, the group footers and the totals all follow; the row in edit keeps its editor’s column. |
| `Pinned columns and bands` | Pinned columns are always drawn. A band header spans only its columns drawn and goes with the last of them; its `aria-colindex` and `aria-colspan` stay those of all its columns. |
| `Keyboard` | The active column is always drawn: Tab, the arrow keys, Home and End move into a column without cells, which gets them and scrolls into view. |
| `Layout` | Resizing, moving (dragging a header past columns without cells too), pinning and hiding work as before; “Fit all columns” draws every column while it measures them. |
| `Assistive technology` | Cells keep their `aria-colindex` and the grid its `aria-colcount`, so a screen reader still names column 120 of 202. |
| `Export, copy` | CSV, Excel and PDF write every column, the ones without cells too; copying reads the values, not the cells. |
| `Events` | `onCellPrepared` and `onRowPrepared` run as cells are made, so again after a sideways scroll. |

## Keyboard

| Key | What it does |
| --- | --- |
| `Ctrl+End` | Infinite: the last row shown, and the next part loads. |
| `Down, Page Down on the last rows` | Infinite: the view nears the end and the next part loads. |
| `Home, End, Tab, Left / Right` | Virtual columns: into a column without cells; it is drawn and scrolled into view. |

## Example files

`InfiniteScroll.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** A server that cannot count, and fails on purpose while `failing` is on. */
class OrderServer extends SlowAdapter<Order, number> {
  failing = false;

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<Order>> {
    const result = await super.load(options);
    if (this.failing && (options.skip ?? 0) > 0) throw new Error('The server did not answer.');
    return result;
  }
}

/** 1,030 orders from a slow server without a count, loaded 50 at a time as the list nears its end. */
export default function InfiniteScroll() {
  const s = reactive({ loads: 0, parts: 0, preload: false, failing: false });
  // Stands in for a server: new data.RestAdapter({ url: '/api/orders', key: 'id' }) goes in its place.
  const server = new OrderServer({ data: makeOrders(1_030), key: 'id', capabilities: { count: false } }, 600);
  server.onLoading(() => s.loads++);
  // `count: false`: no part asks for a total; a part shorter than 50 rows is the last one.
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 50, count: false });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Load a part ahead" x-model={() => s.preload} />
        <CheckBox label="The next part fails" x-model={() => s.failing} onValueChanged={(e) => (server.failing = !!e.value)} />
        <Button text="Load more" variant="outline" onclick={() => grid?.loadMore()} />
        <Button text="To the last row" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />
        <output class="dg-infinite-state">{() => `${s.loads} loads, ${s.parts} parts came${grid?.endReached ? ', every row is here' : ''}`}</output>
      </Stack>
      <DataGrid
        class="dg-infinite"
        style="block-size: 30rem"
        mode="infinite"
        dataSource={orders}
        columns={columns}
        label="Orders, part by part"
        locale="en"
        settings={{ preloadEnabled: () => s.preload, selection: 'multiple', filterRow: true }}
        onMoreRowsLoaded={() => s.parts++}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
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

`InfiniteGroups.tsx`

```tsx
import { DataGrid } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 2,000 orders in memory, grouped by city: the group rows and the rows show 100 places at a time. */
export default function InfiniteGroups() {
  return (
    <DataGrid
      class="dg-infinite-groups"
      style="block-size: 28rem"
      mode="infinite"
      pageSize={100}
      rows={makeOrders(2_000)}
      rowKey="id"
      columns={columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c))}
      label="Orders by city, part by part"
      locale="en"
      settings={{ groupPanel: true, selection: 'multiple' }}
      summary={{ groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }] }}
      masterDetail={{ enabled: true, template: (ctx) => <p class="dg-infinite-detail">{() => `${(ctx.row as Order).customer} · ${(ctx.row as Order).note || 'no note'}`}</p> }}
    />
  );
}
```
