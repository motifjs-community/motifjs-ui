# DataGrid: Master-detail

> DataGrid · @motifx-community/ui 0.1.0-beta.8

## Master-detail

`masterDetail` gives every row its own details. The expand column opens a row to display the output of `template` (in this example, another grid over its own data source, filtered by the customer's key) in a row spanning the grid, which stays in place while the columns scroll sideways. Details are created the first time they are shown and kept while the row is open, and they are removed when the row leaves the data or when the grid is disposed. The list stays virtual: each detail is measured as it renders (and again when its content changes size), so the scrollbar, the following rows and navigation to a row stay accurate, and the rows themselves remain a small pool.

```tsx
/** A customer, as stored by a second sample service. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` sample customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `masterDetail.enabled` | `Bind<boolean>` | `false` | The expand column, after the status and check box columns and pinned with them, lets the user open and close details. When disabled, they can be opened only programmatically. |
| `masterDetail.template` | `(ctx: DetailContext<T>) => unknown` | — | The content of a row's details: a component (another `DataGrid`, a `FormLayout`, `Tabs` …), an element or text. It is created the first time the details are shown. `ctx` provides `row` (the row itself) and `rowIndex`, both getters that are read again when the row shows another one and on `grid.repaint()` or `grid.repaintRows(keys)`, plus `key`, `grid` and `collapse()`. |
| `masterDetail.autoExpandAll` | `Bind<boolean>` | `false` | Every row starts open. Changing this setting, `enabled` or `template` opens or closes every row again. |
| `masterDetail.canExpand` | `Bind<boolean> \| (row) => boolean` | `true` | Whether a row has details. A row without details has no arrow, and `expandRow` leaves it closed. Unsaved new rows have no details. |
| `masterDetail.keepDetails` | `Bind<boolean>` | `true` | A closed row keeps the content of its details and shows it unchanged when it reopens. When disabled, closing disposes the content. |
| `masterDetail.keepAcrossPages` | `Bind<boolean>` | `false` | In a paged grid, the details of the previous page keep their content while the user changes pages (up to `keepLimit`). When disabled, changing the page or page size disposes them, and they are recreated when their page appears. A row stays open in either case. |
| `masterDetail.keepLimit` | `Bind<number>` | `100` | The number of details out of view that keep their content (open ones, and closed ones with `keepDetails`). Past this limit, the least recently seen are disposed and recreated when they appear. |
| `masterDetail.height` | `Bind<number> \| (row) => number` | The content's height | A fixed height in pixels, with the content scrolling inside. A function sets a height per row. |
| `masterDetail.estimatedHeight` | `Bind<number>` | `200` | The estimated height of details before they are rendered and measured, used until the first measurement, after which the measured average applies. Only the scrollbar uses it. |
| `masterDetail.columnWidth` | `Bind<number>` | `36` | The width of the expand column, in pixels. |
| `masterDetail.toggleKeys` | `Bind<string[]>` | `['Enter', ' ']` | The keys on the expand cell that open and close the details. |
| `masterDetail.arrowKeys` | `Bind<boolean>` | `true` | Right on the expand cell of a closed row opens it, and Left on an open row closes it. Otherwise, they move as on any cell. |

Open rows are tracked by key, so sorting, filtering, searching, grouping and paging leave them open, and a row that returns after a filter opens again. Selection and editing work as usual, and a row edited in the edit form keeps its details below the form. Copy and export omit the details, and the saved layout does not include which rows are open.

## Tabs and forms in the details

Details can contain any component. In this example, they are tabs with a read-only `FormLayout` for the customer and a list of its orders that is created when the tab is first shown. The row adjusts its height, and the following rows move. `canExpand` hides the arrow for customers without orders, `ctx.collapse()` closes a row from inside its details, and the buttons call `expandAllRows()` and `collapseAllRows()`.

```tsx
/** A customer, as stored by a second sample service. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` sample customers, the same ones every time. */
export function makeCustomers(n: number): Customer[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]} ${Math.floor(i / (FIRST.length * LAST.length)) + 1}`,
    city: CITIES[(i * 5) % CITIES.length],
  }));
}
```

## Keyboard and accessibility

The arrow is a button with `aria-expanded` and `aria-controls`, and the row also has `aria-expanded`. A row's details are a separate row in the grid's reading order (`aria-owns`), directly after it and counted in `aria-rowindex` and `aria-rowcount`, with one cell across the columns named “Details of row 3” (`gridDetailsOf`, and `gridDetails` for the arrow and its column, both in `uiLocale` and the grid's `texts`).

| Key | Description |
| --- | --- |
| `Enter, Space (`toggleKeys`)` | On the expand cell, opens or closes the row's details. |
| `Right / Left (`arrowKeys`)` | On the expand cell, Right opens a closed row and Left closes an open one. Then they move to the next cell. Mirrored on right-to-left pages. |
| `Up / Down, Page Up / Page Down` | Moves between rows, skipping a row's details. |
| `Tab` | On a row whose details are visible, moves into the details, to their first stop. With details on screen, Tab otherwise leaves the grid, as Shift+Tab does from a row. |
| `Tab in the details` | Moves through their content. From the last stop, it leaves the grid. |
| `Escape, Shift+Tab on the first stop` | Returns to the row the details belong to, when the content does not use Escape itself. |
| `Enter on the details’ own cell` | Moves into the content, to its first stop. |

## Events and methods

| Event | Parameters | When |
| --- | --- | --- |
| `onRowExpanding / onRowCollapsing` | `{ kind: 'detail', key, row, cancel }` | Occurs before a row's details open or close, from the user or programmatically. Set `cancel` to keep them as they are. These are the same events as for groups (`kind: 'group'`). |
| `onRowExpanded / onRowCollapsed` | `{ kind: 'detail', key, row }` | Occurs after they open or close. |
| `onRowPrepared` | `{ rowType: 'detail', row, rowIndex, element }` | Occurs when a row's details have been rendered for a row. |
| `onOptionChanged` | `{ name: 'masterDetail.enabled', value, previous }` | Occurs when a `masterDetail` option is assigned through `grid.masterDetail`. |

| Member | Returns | Description |
| --- | --- | --- |
| `expandRow(key) / collapseRow(key)` | `boolean` | Opens or closes a row's details by key, as the arrow does (the events run, and `cancel` applies). It has no effect on a row that is not loaded or has no details. |
| `isRowExpanded(key)` | `boolean` | Indicates whether a row's details are open. Reactive. |
| `expandAllRows() / collapseAllRows()` | `void` | Opens or closes every row's details at once, without row events (as `expandAll()` does for groups). |
| `masterDetail` | read/write, live | `grid.masterDetail.enabled = true`. A function is tracked reactively. |
| `getVisibleRows()` | `GridVisibleRow[]` | A row's details are listed directly after it, with `rowType: 'detail'` and with its index and key. |

## Feedback

Loading issues…

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
/** A customer, as stored by a second sample service. */
export interface Customer {
  id: number;
  name: string;
  city: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger', 'Barbara', 'Donald', 'İlhan', 'Margaret', 'Feza', 'Ali Nesin'];
const LAST = ['Lovelace', 'Hopper', 'Turing', 'Arf', 'Johnson', 'Dijkstra', 'Liskov', 'Knuth', 'Koman', 'Hamilton', 'Gürsey', 'Yılmaz'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];

/** `n` sample customers, the same ones every time. */
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

/** The details of a customer: its fields and the total of its orders. */
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

/** A customer's details: tabs, the first with a read-only form. The other tab is created when first shown, and the row grows with it. */
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
