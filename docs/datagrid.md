# DataGrid

> DataGrid · @motifx-community/ui 0.1.0-beta.1

A grid for data entry and large data: rows in memory or from any adapter of the data layer, a virtual list or pages, sorting, column layout, editing with the kit's editors, new rows with the Tab chain, three save modes, row actions, selection, filters, a search panel, grouping, summaries, a toolbar, lookup columns from other services, copy and paste, export and a layout that is kept — and every feature can be turned off, for the grid or for one column.

## Import

```tsx
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## From JSX and from code

Give rows in memory with `rows` and their key with `rowKey`; the grid puts them in a `DataSource` over an `ArrayAdapter` itself. Every prop takes a value or a function. Created with `new`, the grid is an object like any other: add it, sort it, ask it.

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

## Server data, virtual

With a `DataSource` that loads by `blocks`, the scroll bar is sized from the total and only the rows where the list looks are asked for. A jump (Ctrl+End, dragging the bar) asks only where it lands; a block left behind while loading is aborted. A row that has not come yet shows as a placeholder. Above 10 million pixels of rows the bar is scaled.

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

## Pages

A `DataSource` that loads by `page` makes a paged grid: one page is asked for at a time, and a sort goes back to the first page. Rows in memory page with `mode` set to `paged`.

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

## Pager

The pager under the rows shows the page sizes (`pageSizeSelector`, the sizes of `allowedPageSizes`, `all` for one page with every row), “Page 3 of 12 (250 items)” (`pagerInfo`, `pagerInfoText` with `{0}`, `{1}`, `{2}`), the first, previous, next and last buttons (`pagerNavigation`) and the pages around the current one (`pagerNeighbors`). `pagerDisplayMode` picks its look: `full` with page buttons and the sizes as buttons, `compact` with a box for the page number and a drop-down of the sizes, `adaptive` (the default) full while it fits in the grid's width. The rows per page change from code with `pageSize(n)` too; either way `onPageSizeChanging` can keep the old size, the grid goes back to the first page, and with `layoutKey` the size is kept with the layout. PageUp and PageDown turn the page (`pageKeys`).

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

## Example files

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** Rows in memory given with `rows`, rows added from code, and a grid created with `new`. */
export default function FromCode() {
  const s = reactive({ orders: makeOrders(40) });
  let grid: DataGrid<Order> | null = null;
  let host: Stack | null = null;

  // The grid reads the array as it is: after a push it loads it again.
  const pushOrder = () => {
    s.orders.push({ ...makeOrders(1)[0], id: s.orders.length + 1, customer: 'Pushed' });
    grid?.refresh();
  };

  const addGrid = () => {
    if (!host) return;
    host.controls.clear();
    const made = new DataGrid<Order>({ rows: makeOrders(8), rowKey: 'id', columns: columns.slice(0, 4), settings: { striped: true }, label: 'Created with new' });
    made.element.style.blockSize = '24rem';
    host.controls.add(made);
    made.sort = [{ field: 'customer', dir: 'asc' }];
  };

  return (
    <>
      <DataGrid
        class="dg-local"
        style="block-size: 30rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders"
        locale="en"
        settings={{ editable: true, addRows: true, striped: true }}
        newRow={{ create: newOrder }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a row from code" variant="outline" onclick={() => void grid?.addRow({ customer: 'Ada Lovelace' })} />
        <Button text="Push an order into the array" variant="outline" onclick={pushOrder} />
        <Button text="Add a grid from code" variant="outline" onclick={addGrid} />
        <output class="dg-local-count">{() => `${s.orders.length} orders in the array`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
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

`Virtual.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders from a server, loaded by blocks only where the list looks. */
export default function Virtual() {
  const s = reactive({ loads: 0 });
  // Stands in for a server: new data.ODataAdapter({ url: '/odata/Orders', key: 'OrderID' }) goes in its place.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading(() => s.loads++);
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid class="dg-virtual" style="block-size: 32rem" dataSource={orders} columns={columns} label="100,000 orders" locale="en" ref={(g: DataGrid<Order>) => (grid = g)} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Go to the end" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />
        <Button text="Back to the top" variant="outline" onclick={() => grid?.scrollToIndex(0)} />
        <Button text="Fit the columns" variant="outline" onclick={() => grid?.autoSizeColumns()} />
        <output class="dg-loads">{() => `${s.loads} loads for ${grid?.total ?? 0} rows`}</output>
      </Stack>
    </>
  );
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

`Pages.tsx`

```tsx
import { DataGrid } from '@motifx-community/ui';
import { columns, makeOrders } from './orders';
import { pagedLoads, pagedOrders } from './paged-orders';

/** A server that loads by page makes a paged grid; rows in memory page with `mode="paged"`. */
export default function Pages() {
  return (
    <>
      <DataGrid class="dg-paged" style="block-size: 34rem" dataSource={pagedOrders} columns={columns} label="Orders by page" locale="en" />
      <output class="dg-paged-loads">{() => `${pagedLoads.count} loads`}</output>
      <DataGrid style="block-size: 34rem" rows={makeOrders(100)} rowKey="id" mode="paged" pageSize={20} columns={columns} label="Orders in memory by page" locale="en" />
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

`Pager.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The page sizes, the info text and the full, compact and adaptive looks of the pager. */
export default function Pager() {
  const s = reactive({ look: 'adaptive' as 'adaptive' | 'compact' | 'full', told: '' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Full" variant={() => (s.look === 'full' ? 'solid' : 'outline')} onclick={() => (s.look = 'full')} />
        <Button text="Compact" variant={() => (s.look === 'compact' ? 'solid' : 'outline')} onclick={() => (s.look = 'compact')} />
        <Button text="Adaptive" variant={() => (s.look === 'adaptive' ? 'solid' : 'outline')} onclick={() => (s.look = 'adaptive')} />
        <Button text="50 rows a page" variant="ghost" onclick={() => grid?.pageSize(50)} />
        <output class="dg-pager-state">{() => s.told}</output>
      </Stack>
      <DataGrid
        class="dg-pager"
        style="block-size: 30rem"
        rows={makeOrders(1000)}
        rowKey="id"
        mode="paged"
        pageSize={20}
        columns={columns}
        label="Orders in pages of a size you choose"
        locale="en"
        settings={{
          pageSizeSelector: true,
          allowedPageSizes: [10, 20, 50, 'all'],
          pagerDisplayMode: () => s.look,
        }}
        onPageSizeChanged={(e) => (s.told = `${e.pageSize || 'All'} rows a page (was ${e.previous || 'all'})`)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
    </>
  );
}
```
