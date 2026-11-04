# DataGrid: Master-detail

> DataGrid · @motifx-community/ui 0.1.0-beta.1

## Master-detail

`masterDetail` gives every row details of its own: the expand column opens a row to show what `template` makes for it — here another grid over a data source of its own, filtered by the customer's key — in a row across the grid that stays in place while the columns scroll sideways. The details are made the first time they show and kept while the row is open; they go when the row leaves the data, or with the grid. The list stays virtual: each detail is measured as it is drawn (and again when its content changes size), so the scroll bar, the rows after it and moving to a row stay right, and the rows themselves are still a small pool.

```tsx
/** A customer, as another made-up service keeps it. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` made-up customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
```

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `masterDetail.enabled` | `Bind<boolean>` | `false` | The expand column, after the status and check box columns and pinned like them: the user opens and closes the details. Off, they open from code only. |
| `masterDetail.template` | `(ctx: DetailContext<T>) => unknown` | — | What a row’s details hold: a component (another `DataGrid`, a `FormLayout`, `Tabs` …), an element or a text. Made the first time the details show. `ctx`: `row` (the row itself) and `rowIndex`, both read again in getters when the row shows another one and on `grid.repaint()` or `grid.repaintRows(keys)`, `key`, `grid`, `collapse()`. |
| `masterDetail.autoExpandAll` | `Bind<boolean>` | `false` | Every row starts open. Changing it, `enabled` or `template` opens or closes every row again. |
| `masterDetail.canExpand` | `Bind<boolean> \| (row) => boolean` | `true` | Whether a row has details; a row without has no arrow, and `expandRow` leaves it closed. New rows not saved yet have none. |
| `masterDetail.keepDetails` | `Bind<boolean>` | `true` | A closed row keeps what its details hold and shows it as it was when it opens again; off, closing disposes it. |
| `masterDetail.keepAcrossPages` | `Bind<boolean>` | `false` | Paged grid: the details of the page left keep what they hold while the user pages (up to `keepLimit`); off, another page or page size disposes them, and they are made again when their page shows. A row stays open either way. |
| `masterDetail.keepLimit` | `Bind<number>` | `100` | Details out of view that keep their content (open ones, and closed ones with `keepDetails`); past it the ones seen longest ago are disposed, and made again when they show. |
| `masterDetail.height` | `Bind<number> \| (row) => number` | the content’s | A height of their own in pixels, the content scrolling inside; a function gives each row its own. |
| `masterDetail.estimatedHeight` | `Bind<number>` | `200` | What details count as before they are drawn and measured, while none is; then the average of those measured. Only the scroll bar uses it. |
| `masterDetail.columnWidth` | `Bind<number>` | `36` | Width of the expand column, in pixels. |
| `masterDetail.toggleKeys` | `Bind<string[]>` | `['Enter', ' ']` | Keys on the expand cell that open and close the details. |
| `masterDetail.arrowKeys` | `Bind<boolean>` | `true` | Right on the expand cell of a closed row opens it, Left on an open one closes it; otherwise they move as on any cell. |

Open rows are kept by key: sorting, the filters, the search, grouping and paging leave them open, and a row that comes back after a filter opens again. Selecting and editing the rows work as before; a row edited in the edit form keeps its details under the form. Copying and exporting leave the details out, and the saved layout does not keep which rows are open.

## Tabs and forms in the details

The details can hold any component. Here they are tabs: a read-only `FormLayout` with the customer, and a list of its orders made when the tab is first shown — the row takes its height, the rows after it move. `canExpand` leaves the customers without orders without an arrow; `ctx.collapse()` closes a row from inside its details; the buttons call `expandAllRows()` and `collapseAllRows()`.

```tsx
/** A customer, as another made-up service keeps it. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` made-up customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
```

## Keyboard and accessibility

The arrow is a button with `aria-expanded` and `aria-controls`; the row says `aria-expanded` too. A row's details are a row of their own in the grid's reading order (`aria-owns`), right after it and counted in `aria-rowindex` and `aria-rowcount`, with one cell across the columns named “Details of row 3” (`gridDetailsOf`, `gridDetails` for the arrow and its column; both in `uiLocale` and the grid's `texts`).

| Key | What it does |
| --- | --- |
| `Enter, Space (`toggleKeys`)` | On the expand cell: opens or closes the row’s details. |
| `Right / Left (`arrowKeys`)` | On the expand cell: Right opens a closed row, Left closes an open one; then they move to the next cell. Mirrored right to left. |
| `Up / Down, Page Up / Page Down` | Move from row to row; a row’s details are passed over. |
| `Tab` | On a row whose details show: into the details, to their first stop. With details on the screen Tab otherwise leaves the grid, as Shift+Tab does from a row. |
| `Tab in the details` | Moves through their content; from the last stop it leaves the grid. |
| `Escape, Shift+Tab on the first stop` | Back to the row the details belong to (Escape the content does not use itself). |
| `Enter on the details’ own cell` | Into the content, to its first stop. |

## Events and methods

| Event | Gets | When |
| --- | --- | --- |
| `onRowExpanding / onRowCollapsing` | `{ kind: 'detail', key, row, cancel }` | A row’s details are about to open or close, by the user or from code; `cancel` keeps them as they are. The same events as for groups (`kind: 'group'`). |
| `onRowExpanded / onRowCollapsed` | `{ kind: 'detail', key, row }` | They opened or closed. |
| `onRowPrepared` | `{ rowType: 'detail', row, rowIndex, element }` | A row’s details were drawn for a row. |
| `onOptionChanged` | `{ name: 'masterDetail.enabled', value, previous }` | A `masterDetail` option was assigned through `grid.masterDetail`. |

| Member | Returns | What it does |
| --- | --- | --- |
| `expandRow(key) / collapseRow(key)` | `boolean` | Opens or closes a row’s details by its key, as the arrow does (the events come, `cancel` holds); a row not loaded, or one without details, does not. |
| `isRowExpanded(key)` | `boolean` | Whether a row’s details are open. Reactive. |
| `expandAllRows() / collapseAllRows()` | `void` | Opens or closes every row’s details at once, without row events (as `expandAll()` does for groups). |
| `masterDetail` | read/write, live | `grid.masterDetail.enabled = true`; a function is followed. |
| `getVisibleRows()` | `GridVisibleRow[]` | A row's details are listed right after it, `rowType: 'detail'`, with its index and key. |

## Example files

`MasterDetail.tsx`

```tsx
import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import type { CustomerOrder } from './customer-order';
import { makeCustomerOrders, orderColumns } from './customer-orders';
import { makeCustomers, type Customer } from './customers';

const customers = makeCustomers(2000);
const orders = new data.ArrayAdapter<CustomerOrder, number>({ data: makeCustomerOrders(customers), key: 'id' });

const columns: GridColumn<Customer>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'name', title: 'Customer', width: 220, flex: 1 },
  { field: 'city', title: 'City', width: 140 },
];

/** A customer's orders: a grid over a source of its own, filtered by the customer's key, disposed with the details. */
function Orders(props: { customerId: unknown; name: string }) {
  const source = new data.DataSource<CustomerOrder, number>({ adapter: orders, loadMode: 'all', filter: data.where('customerId', '=', props.customerId) });
  return (
    <DataGrid
      class="dg-orders"
      style="block-size: 14rem"
      dataSource={source}
      columns={orderColumns}
      label={`Orders of ${props.name}`}
      locale="en"
      settings={{ rowCount: true }}
      onDisposing={() => source.dispose()}
    />
  );
}

/** Two thousand customers in a virtual list; each opens to a grid of its own orders. */
export default function MasterDetail() {
  return (
    <DataGrid
      class="dg-master"
      style="block-size: 30rem"
      rows={customers}
      rowKey="id"
      columns={columns}
      label="Customers and their orders"
      locale="en"
      masterDetail={{ enabled: true, template: (ctx) => <Orders customerId={ctx.key} name={ctx.row.name} /> }}
    />
  );
}
```

`customer-orders.ts`

```tsx
import type { GridColumn } from '@motifx-community/ui';
import type { Customer } from './customers';
import type { CustomerOrder } from './customer-order';

const ITEMS = ['Notebook', 'Pencil set', 'Desk lamp', 'Chair', 'Monitor', 'Keyboard', 'Coffee beans', 'Tea', 'Backpack', 'Umbrella'];
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A few orders of every customer (none for every seventh), the same ones every time. */
export function makeCustomerOrders(customers: Customer[]): CustomerOrder[] {
  const day = Date.UTC(2026, 0, 1);
  const out: CustomerOrder[] = [];
  for (const c of customers) {
    const count = c.id % 7 === 0 ? 0 : 2 + (c.id % 5);
    for (let k = 0; k < count; k++) {
      const n = out.length + 1;
      out.push({
        id: n,
        customerId: c.id,
        date: new Date(day + ((n * 37) % 300) * 86_400_000).toISOString().slice(0, 10),
        item: ITEMS[(n * 3) % ITEMS.length],
        quantity: 1 + (n % 4),
        amount: ((n * 7919) % 50_000) / 100,
      });
    }
  }
  return out;
}

/** The columns of a customer's orders. */
export const orderColumns: GridColumn<CustomerOrder>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'date', title: 'Date', type: 'date', width: 130 },
  { field: 'item', title: 'Item', width: 180, flex: 1 },
  { field: 'quantity', title: 'Qty', type: 'number', width: 80 },
  { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
];
```

`customer-order.ts`

```tsx
/** One order of a customer, for the master-detail examples. */
export interface CustomerOrder {
  id: number;
  customerId: number;
  date: string;
  item: string;
  quantity: number;
  amount: number;
}
```

`customers.ts`

```tsx
/** A customer, as another made-up service keeps it. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` made-up customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
```

`DetailTabs.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, FormLayout, Stack, Tab, Tabs, type DetailContext, type FormItem, type GridColumn } from '@motifx-community/ui';
import { makeCustomerOrders } from './customer-orders';
import { makeCustomers, type Customer } from './customers';

const customers = makeCustomers(60);
const orders = makeCustomerOrders(customers);
const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

/** What the details show of a customer: its fields and what its orders come to. */
interface Profile extends Customer {
  orders: number;
  total: string;
  since: string;
}

const profiles: Profile[] = customers.map((c) => {
  const own = orders.filter((o) => o.customerId === c.id);
  return { ...c, orders: own.length, total: money.format(own.reduce((sum, o) => sum + o.amount, 0)), since: own[0]?.date ?? '' };
});

const columns: GridColumn<Profile>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'name', title: 'Customer', width: 220, flex: 1 },
  { field: 'city', title: 'City', width: 140 },
  { field: 'orders', title: 'Orders', type: 'number', width: 100 },
];

const items: FormItem[] = [
  { field: 'name', label: 'Name' },
  { field: 'city', label: 'City' },
  { field: 'since', label: 'First order' },
  { field: 'total', label: 'Orders total' },
];

/** A customer's details: tabs, the first a read-only form; the other tab is made when first shown, and the row grows with it. */
function CustomerTabs(props: { ctx: DetailContext<Profile> }) {
  const profile = reactive({ ...props.ctx.row });
  return (
    <Tabs label={`About ${profile.name}`} size="sm">
      <Tab title="Profile">
        <FormLayout data={profile} items={items} columns={2} readOnly />
      </Tab>
      <Tab title="Orders">
        <ul class="dg-detail-list">
          {orders
            .filter((o) => o.customerId === profile.id)
            .map((o) => (
              <li key={String(o.id)}>{`${o.date} · ${o.item} × ${o.quantity} · ${money.format(o.amount)}`}</li>
            ))}
        </ul>
        <Button text="Close" size="sm" variant="outline" onclick={() => props.ctx.collapse()} />
      </Tab>
    </Tabs>
  );
}

/** Customers with tabs in their details; those without orders have none. The buttons open and close every row. */
export default function DetailTabs() {
  const s = reactive({ log: '' });
  let grid: DataGrid<Profile> | null = null;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Details">
        <Button text="Open all" size="sm" variant="outline" onclick={() => grid?.expandAllRows()} />
        <Button text="Close all" size="sm" variant="outline" onclick={() => grid?.collapseAllRows()} />
        <output class="dg-detail-log">{() => s.log}</output>
      </Stack>
      <DataGrid
        class="dg-detail-tabs"
        style="block-size: 30rem"
        ref={(g: DataGrid<Profile>) => (grid = g)}
        rows={profiles}
        rowKey="id"
        columns={columns}
        label="Customers with their details"
        locale="en"
        settings={{ selection: 'single' }}
        masterDetail={{ enabled: true, canExpand: (row: Profile) => row.orders > 0, template: (ctx) => <CustomerTabs ctx={ctx} /> }}
        onRowExpanded={(e) => e.kind === 'detail' && (s.log = `Opened ${(e.row as Profile).name}`)}
        onRowCollapsed={(e) => e.kind === 'detail' && (s.log = `Closed ${(e.row as Profile).name}`)}
      />
    </>
  );
}
```
