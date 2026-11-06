# DataGrid: Scrolling

> DataGrid · @motifx-community/ui 0.1.0-beta.5

## Scrolling modes

The `mode` prop determines how rows are reached. Every mode renders only the visible rows from a small pool, so the page never holds one element per row.

| Mode | Description |
| --- | --- |
| `'virtual' (default)` | A single long list. The scrollbar is as long as every row, blocks load at the visible position (with a source using `loadMode: 'blocks'`), and rows in between are never requested. |
| `'paged'` | Pages with a pager. A source that loads by page is always paged. |
| `'infinite'` | Rows appear page by page, `pageSize` at a time. The next page loads as the view nears the end, and the scrollbar grows with the loaded rows. No total is required. In-memory rows, groups and summaries appear page by page the same way. |

## Infinite scrolling

With `mode: 'infinite'`, the grid shows 50 orders, and when the last of them comes into view, it requests the next 50 from the server, with “Loading more rows…” at the bottom while they arrive. This server cannot provide a count (`count: false`), so the grid finds the end when a page comes back short. Turn on “The next page fails” and scroll down, and the indicator offers Retry. Sorting, filtering or searching starts again from the first page.

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `Bind<'virtual' \| 'paged' \| 'infinite'>` | `'virtual'` | How rows are displayed. Changing the mode reloads the data. |
| `pageSize` | `Bind<number>` | `100` | The rows per page for in-memory rows (0 shows every row at once). A source that loads by blocks uses its own block size. |
| `settings.loadMoreDistance` | `Bind<number>` | `0` | The number of rows left below the view when the next page starts to load. 0 waits for the last row to come into view. |
| `settings.preloadEnabled` | `Bind<boolean>` | `false` | Loads the next page one page earlier (in virtual mode, one page on each side of the view), so that scrolling rarely has to wait. |
| `settings.loadMoreIndicator` | `Bind<boolean>` | `true` | The “Loading more rows…” indicator over the last rows while a page loads, with Retry if it fails. |
| `DataSource count` | `boolean` | `true` | When disabled, no page asks the server for a total. A page shorter than the block size ends the rows, as does an empty page after a full one. |

| Member | Parameters or return value | Description |
| --- | --- | --- |
| `onMoreRowsLoading` | `{ skip, take, cancel }` | Occurs before the next page loads (the view is near the end, `loadMore()`, or Ctrl+End). Set `cancel` to keep the rows as they are. |
| `onMoreRowsLoaded` | `{ skip, count, ended }` | Occurs when a page arrives: `count` rows from `skip`, and `ended` once every row is displayed. |
| `loadMore()` | `boolean` | Loads the next page, after `onMoreRowsLoading`. Returns `false` while rows are loading, when a page is loading or has failed, or when every row is displayed. |
| `loadingMore, endReached` | `boolean`, reactive | Indicates whether a page is loading, and whether every row is displayed (always true outside infinite mode). |
| `retry()` | — | Reloads a page that failed, as the indicator's Retry does. |
| `pageIndex(), pageIndex(n), page` | `number` | The last displayed page. With a number, loads the pages up to that one and scrolls to its first row. |
| `pageCount` | `number`, reactive | The number of pages of all rows once the count is known, otherwise the displayed pages. |
| `total, totalCount()` | `number` | `total` is the number of rows displayed so far. `totalCount()` is every matching row once known (counted, or when the last page arrived), and −1 until then. |
| `refresh()` | — | Reloads the displayed rows and keeps the position. |

| Topic | Infinite mode behavior |
| --- | --- |
| `The end` | With a count, the end is known from the first page. Without one (`count: false`), a page that comes back short is the last. Scrolling at the end requests nothing further. |
| `Failing parts` | A page that fails shows Retry in the indicator (or in the bottom bar with `loadMoreIndicator` off), and scrolling does not request it again until Retry. The displayed rows stay, and a failure of the first page shows the grid's own error. |
| `Sort, filter, search` | Starts again from the first page, at the top. |
| `Grouping` | Group rows and data rows appear page by page together. Groups from a server load only the rows of the displayed page, and in memory, every row is already available. |
| `Selection, export` | “Select all” and Ctrl+A select every matching row, loaded or not, and export writes every row, including pages not yet loaded. |
| `Editing, details` | The row being edited, the focused row, its details and the selection stay as pages arrive, and new rows open after the displayed rows. |
| `Pager` | Hidden. Rows are reached by scrolling. |
| `Assistive technology` | `aria-rowcount` is −1 until the last page arrives, and each row keeps its `aria-rowindex`. |

## In-memory rows, grouped

In-memory rows also appear page by page, here 100 places at a time, grouped by city. Group rows and data rows both count, so the next city's group appears with its page. Details, selection and group summaries work as in the other modes.

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

## Virtual columns

With `settings.columnRenderingMode: 'virtual'`, only the visible scrolling columns and `extraColumns` on each side have cells. The other columns keep their position in the layout and receive cells as they come into view. This example shows 100,000 hours of 200 sensors, in bands of 20, with the hour and the sum pinned. Turn off “Virtual columns” to see the same grid with every column rendered.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, NumberBox, Stack } from '@motifx-community/ui';
import type { GridColumnItem } from '@motifx-community/ui';

type Reading = { id: number };

const SENSORS = 200;

/** 200 sensors in bands of 20, with each reading calculated from the row, so no row holds 200 values. */
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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `settings.columnRenderingMode` | `Bind<'standard' \| 'virtual'>` | `'standard'` | With `'virtual'`, only the visible scrolling columns and `extraColumns` on each side have cells. Pinned columns always have them. |
| `column.columnRenderingMode` | `Bind<'standard' \| 'virtual'>` | The grid's value | A column's own setting. `'standard'` keeps its cells while it is out of view (for cell content with its own state), and `'virtual'` releases only that column. |
| `settings.extraColumns` | `Bind<number>` | `2` | The columns rendered beyond the visible ones on each side, so that a quick sideways scroll shows no gap. |
| `settings.renderAsync` | `Bind<boolean \| 'auto'>` | `'auto'` | Whether columns coming into view are rendered during scrolling (`false`), once scrolling stops (`true`), or once it stops when rendering takes longer than the threshold. |
| `settings.columnRenderingThreshold` | `Bind<number>` | `300` | How long rendering new columns can take, in milliseconds, before they wait for scrolling to stop (`renderAsync: 'auto'`). |
| `settings.columnRenderingDelay` | `Bind<number>` | `300` | How long, in milliseconds, there must be no sideways scrolling before waiting columns are rendered. |

| Topic | Virtual column behavior |
| --- | --- |
| `Rows of every kind` | The header, the filter row, the rows, group row items under their columns, the group footers and the totals all follow, and the row being edited keeps its editor's column. |
| `Pinned columns and bands` | Pinned columns are always rendered. A band header spans only its rendered columns and goes with the last of them, and its `aria-colindex` and `aria-colspan` stay those of all its columns. |
| `Keyboard` | The active column is always rendered. Tab, the arrow keys, Home and End can move into a column without cells, which receives them and scrolls into view. |
| `Layout` | Resizing, moving (including dragging a header past columns without cells), pinning and hiding work as usual, and “Fit all columns” renders every column while measuring them. |
| `Assistive technology` | Cells keep their `aria-colindex` and the grid its `aria-colcount`, so a screen reader still announces column 120 of 202. |
| `Export, copy` | CSV, Excel and PDF write every column, including those without cells, and copying reads the values rather than the cells. |
| `Events` | `onCellPrepared` and `onRowPrepared` run as cells are created, so they run again after a sideways scroll. |

## Keyboard

| Key | Description |
| --- | --- |
| `Ctrl+End` | In infinite mode, moves to the last displayed row, and the next page loads. |
| `Down, Page Down on the last rows` | In infinite mode, the view nears the end and the next page loads. |
| `Home, End, Tab, Left / Right` | With virtual columns, moves into a column without cells, which is rendered and scrolled into view. |

## Feedback

Loading issues…

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
  // Simulates a server. In an application, use new data.RestAdapter({ url: '/api/orders', key: 'id' }) here.
  const server = new OrderServer({ data: makeOrders(1_030), key: 'id', capabilities: { count: false } }, 600);
  server.onLoading(() => s.loads++);
  // `count: false`: no page requests a total, and a page shorter than 50 rows is the last one.
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 50, count: false });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Load a part ahead" x-model={() => s.preload} />
        <CheckBox label="The next page fails" x-model={() => s.failing} onValueChanged={(e) => (server.failing = !!e.value)} />
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
