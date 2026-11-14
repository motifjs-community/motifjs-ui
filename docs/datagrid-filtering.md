# DataGrid: Filtering and search

> DataGrid · @motifx-community/ui 0.1.0-beta.11

## Filters

The filter row has one cell per column, with a condition chosen in the cell according to the column type (contains, starts with, =, <, between, empty …) and the kit field for the value. Typing applies the filter after a short pause. The header filter lists the column's values with their counts, taking the other filters into account. For in-memory rows, the grid does the counting. An adapter that supports grouping is queried with `group`, and any other server answers through `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), combined with AND.

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

## Custom filter editors

A column's `filterEditor` replaces the filter row's editor of its type. A `Field` it returns, such as a `NumberBox` with a minimum, is bound to the column's filter both ways. Any other component receives a `FilterEditorContext`: it writes the value with `ctx.setValue` (`ctx.clear()` removes it) and hears the filter change elsewhere, such as the filters being cleared, through `ctx.onChanged`. `ctx.operator` is the condition chosen in the cell. The editor for a cell, the column's `editor`, is separate: see [Editing](datagrid-editing.md).

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

## List choices from a server

A list column's `options` can be a function, which can return a promise. In a cell's editor it is called with the row, so the choices can depend on it. Everywhere else (the cell text, the filter row, the search panel, the filter builder and pasted text) it is called once with `row` `null`, returns every choice, and its answer is kept until `refresh()`. Until it arrives, the cells show the values and the filter row's list says it is loading. Here the server is asked once, however many places use the choices.

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

## Filter panel and builder

`settings.filterPanel` adds a panel below the rows that shows the filter value as text, such as `[City] Equals 'Ankara' And [Amount] Is greater than '900.00'`, using column titles, formats and lookup text. Clicking it opens the kit's [FilterBuilder](filterbuilder.md) in a modal window with every column (`filterBuilder` disables it for a column), and with “is any of” and “is none of” for each one. OK applies the value as the filter value, and Cancel and Escape discard it. The check box turns the filter value off and on, and Clear removes it.

With `filterSyncEnabled` (on while the panel is visible), the filter row and header filters are part of the filter value. A condition set in the builder appears in the column's cell or value list if they can display it (one each), and what they set appears in the panel and opens in the builder. Conditions they cannot display, such as an OR group or a second condition on a column, stay only in the filter value. The filter goes to the data source like any other. This example uses 100,000 orders on a server, or 200 in memory. A layout saved with `layoutKey`, and `state()`, keep the filter value and the check box.

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

| Option | Description |
| --- | --- |
| `settings.filterPanel` | The panel below the rows: the check box, the filter as text (clicking it opens the builder), “Create Filter” when there is no filter, and “Clear”. `boolean`, default `false`. |
| `settings.filterSyncEnabled` | Makes the filter row and header filters part of the filter value, in both directions. `'auto'` applies while the panel is visible. `boolean \| 'auto'`, default `'auto'`. |
| `settings.filterBuilder, column `filterBuilder`` | Whether the column is a field in the builder. `boolean`, default `true`. |
| `filterValue` | The filter value. A function is tracked, and user changes arrive in `onFilterChanged` (`e.filterValue`). Also available as a property. `Bind<data.FilterExpression \| null>`, default `null`. |
| `filterEnabled` | Whether the filter value applies, which is the panel's check box. Also available as a property. `Bind<boolean>`, default `true`. |
| `filterPanelText` | Customizes the panel's text, starting from the default text. `({ text, filterValue }) => string`. |
| `filterBuilder` | Any prop of `FilterBuilder` except `value` and `fields` (`customOperations`, `maxGroupLevel`, `groupOperations`, its events …), also live as `grid.filterBuilder`. `GridFilterBuilderOptions`, default `{}`. |
| `filterBuilderPopup` | The window: `title`, `showTitle`, `width` (`'40rem'`), `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`. Also live as `grid.filterBuilderPopup`. `GridFilterBuilderPopup`, default `{}`. |
| `openFilterBuilder(), closeFilterBuilder(apply?), clearFilterValue()` | The panel's actions, available programmatically. `filterText` is the panel's text, and `filterBuilderInstance` is the open builder. |
| `onFilterBuilderOpening / Opened, onFilterBuilderClosing / Closed` | `e.cancel` keeps the builder closed or open, and `e.apply` and `e.applied` indicate whether OK was clicked. `onFilterChanging` (cancelable) and `onFilterChanged` also include `filterValue` and `filterEnabled`. |

## Ranges, dates and custom entries

A column's `headerFilterInterval` groups its header filter. A number column uses ranges of that size (“0 – 250”, “250 – 500”), and several sizes such as `[1000, 100]` create a tree. A date column uses a tree of years, months and days, down to the part it names (`'year'`, `'quarter'`, `'month'`, `'day'`, `'hour'`, `'minute'`, `'second'`), and `null` lists individual dates. Dates are a tree by default, down to the day (`headerFilterDateInterval`). The tree is the kit's `TreeView` with check boxes and “Select all”. A checked month is stored as `'2026/3'` and a year as `2026`, and each filters with `>=` its first moment and `<` the next one's, so a server can run it too. Counts are calculated in the browser from the column's distinct values, whether counted in memory, grouped by an adapter that supports grouping, or from `loadValues`. A `datetime` column's tree goes down to the hour by default, and its filter row compares to the minute; a `date` column's compares by the day.

`headerFilterItems` provides custom header filter entries, as `{ text, value }`, where a value is a value or a filter expression (`data.where('city', 'in', […])`). A function receives the other filters and `values()`, the entries it would list, so that you can add to them. `filterValues` and `filterType` (both can be tracked functions) set the contents of the header filter. `'exclude'` leaves those values out, so values added later appear. In the list, selecting every value and then deselecting some leaves those out in the same way.

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

## Search panel

`searchPanel` adds a search box to the toolbar. Its text is searched in every searchable column at once, after a short typing pause. Each column interprets it according to its type: text columns contain it (case-insensitive and locale-aware), number, date and yes/no columns match when it can be read as one of their values, and list columns match their option text. The columns are joined with OR, and then with the filter row and header filter with AND. Text that no column can interpret returns no rows. The filter goes to the data source like any other (`data.where`, `data.or`), so a server can run it, and matches are highlighted in the cells. `searchText` binds the text in both directions with `onSearchTextChanged`, and `searchByText()` searches programmatically.

A lookup column is searched through its text. The lookup source (here, a customer service separate from the sales server) is queried for items whose text contains the search, up to `searchLimit`, and their keys go to the row server as `customerId in [...]`. A column with a `textFrom` field searches that field of the row instead.

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

## Feedback

Loading issues…

## Example files

`Filters.tsx`

```tsx
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** The filter row and the header filter, on rows in memory. */
export default function Filters() {
  let grid: DataGrid<Order> | null = null;

  const setFilters = () => {
    if (grid) grid.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } };
  };

  return (
    <>
      <DataGrid
        class="dg-filters"
        style="block-size: 30rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={filterColumns}
        label="Orders to filter"
        locale="en"
        settings={{ striped: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Ankara and İzmir, 100 to 500" variant="outline" onclick={setFilters} />
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />
        <output class="dg-filter-count">{() => `${grid?.total ?? 0} of 200 orders`}</output>
      </Stack>
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

`FilterEditors.tsx`

```tsx
import { Component } from '@motifx/core';
import { ButtonGroup, DataGrid, NumberBox, type FilterEditorContext, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The status chosen from buttons, written to the filter through the context and redrawn when the filter changes. */
function statusButtons(ctx: FilterEditorContext<Order>) {
    const box = new Component<HTMLDivElement>('div');
    const buttons = new ButtonGroup({
        label: 'Status',
        size: 'sm',
        selection: 'single',
        allowEmpty: true,
        items: [
            { value: 'Approved', text: 'Approved' },
            { value: 'Shipped', text: 'Shipped' },
            { value: 'Delivered', text: 'Delivered' }
        ],
        value: ctx.value as string,
        onValueChanged: e => e.byUser && ctx.setValue(e.value)
    });
    ctx.onChanged(value => (buttons.value = (value as string) ?? null));
    box.controls.add(buttons);
    return box;
}

/** Each column's own filter editor: buttons for the status, a number box that takes no negative amount. */
export default function FilterEditors() {
    const own: GridColumn<Order>[] = columns.map(c =>
        c.field === 'status'
            ? { ...c, width: 260, filterEditor: statusButtons }
            : c.field === 'amount'
              ? { ...c, filterOperators: ['>=', '<='], filterEditor: () => new NumberBox({ labelMode: 'hidden', size: 'sm', min: 0, step: 100 }) }
              : c
    );
    return <DataGrid class="dg-filter-editors" style="block-size: 24rem" rows={makeOrders(200)} rowKey="id" columns={own} label="Orders with their own filter editors" settings={{ filterRow: true }} />;
}
```

`ServerChoices.tsx`

```tsx
import { reactive } from '@motifx/core';
import { DataGrid, type GridColumn, type ListOption } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const PLATES: Record<string, string> = { Ankara: '06', Antalya: '07', Bursa: '16', İstanbul: '34', İzmir: '35', Konya: '42', Trabzon: '61' };

/** The city choices come from a pretend server: asked once with no row, they write the cells, the filter row and the search. */
export default function ServerChoices() {
    const s = reactive({ asked: 0 });
    const cities = (): Promise<readonly ListOption[]> => {
        s.asked++;
        return new Promise(done => setTimeout(() => done(Object.entries(PLATES).map(([city, plate]) => ({ value: city, label: `${city} (${plate})` }))), 800));
    };
    const own: GridColumn<Order>[] = columns.map(c => (c.field === 'city' ? { ...c, width: 150, options: cities } : c));
    return (
        <>
            <DataGrid class="dg-server-choices" style="block-size: 24rem" rows={makeOrders(200)} rowKey="id" columns={own} label="Orders with cities from a server" settings={{ filterRow: true, searchPanel: true }} />
            <output class="dg-server-choices-asked">{() => `The server was asked ${s.asked} times`}</output>
        </>
    );
}
```

`FilterPanel.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, RadioGroup, Stack, Switch } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** The filter panel and its builder, on 100,000 orders of a server or 200 in memory, the filter row and header filters kept in step. */
export default function FilterPanel() {
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  const rows = makeOrders(200);
  const s = reactive({ where: 'server', sync: true, filter: null as data.FilterExpression | null });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="Rows"
          orientation="horizontal"
          items={[
            { value: 'server', text: '100,000 on a server' },
            { value: 'memory', text: '200 in memory' },
          ]}
          x-model={() => s.where}
        />
        <Switch label="filterSyncEnabled" x-model={() => s.sync} />
        <Button text="Open the builder" variant="outline" onclick={() => grid?.openFilterBuilder()} />
        <Button
          text="Paid, over 900"
          variant="ghost"
          onclick={() => (s.filter = data.and(data.where('paid', '=', true), data.where('amount', '>', 900)))}
        />
      </Stack>
      <DataGrid
        class="dg-server-filters"
        style="block-size: 30rem"
        dataSource={() => (s.where === 'server' ? orders : null)}
        rows={rows}
        rowKey="id"
        columns={filterColumns}
        label="Orders with a filter panel"
        locale="en"
        settings={{ filterPanel: true, filterSyncEnabled: () => s.sync }}
        filterValue={() => s.filter}
        filterBuilder={{ maxGroupLevel: 2 }}
        filterBuilderPopup={{ title: 'Filter the orders' }}
        onFilterChanged={(e) => (s.filter = e.filterValue)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-server-filter">{() => `${(grid?.total ?? 0).toLocaleString('en')} orders · ${JSON.stringify(grid?.filter ?? null)}`}</output>
      <output class="dg-filter-value">{() => `filterValue: ${JSON.stringify(s.filter)}`}</output>
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

`HeaderFilterIntervals.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const COAST = ['Antalya', 'İstanbul', 'İzmir', 'Trabzon'];

/** An order with the moment it was placed: its day and a time of that day. */
type Placed = Order & { placed: string };

const pad = (n: number) => String(n).padStart(2, '0');
const withTimes = (orders: Order[]): Placed[] => orders.map((o) => ({ ...o, placed: `${o.date}T${pad(8 + ((o.id * 7) % 10))}:${pad((o.id * 13) % 60)}:00` }));

/** The order columns with header filters: amounts in ranges, dates in a tree, cities with custom entries, and excluded statuses. */
const intervalColumns: GridColumn<Order>[] = columns.map((c) => {
  switch (c.field) {
    case 'amount':
      // "0 – 250", "250 – 500" …
      return { ...c, headerFilter: true, headerFilterInterval: 250 };
    case 'date':
      // Year → month → day, by the grid's headerFilterDateInterval.
      return { ...c, headerFilter: true };
    case 'city':
      return {
        ...c,
        headerFilter: true,
        headerFilterItems: [
          { text: 'On the coast', value: data.where('city', 'in', COAST) },
          { text: 'Inland', value: data.not(data.where('city', 'in', COAST)) },
          { text: 'Ankara only', value: 'Ankara' },
        ],
      };
    case 'status':
      // Every status except Cancelled, so statuses added later also appear.
      return { ...c, headerFilter: true, filterValues: ['Cancelled'], filterType: 'exclude' };
    default:
      return c;
  }
});
// A date and time: shown with its time, its header filter down to the hour, its filter row to the minute.
intervalColumns.splice(intervalColumns.findIndex((c) => c.field === 'date') + 1, 0, { field: 'placed', title: 'Placed', type: 'datetime', width: 160, headerFilter: true, filterRow: true });

/** The header filter with ranges of amounts, a tree of dates, custom entries and excluded values. */
export default function HeaderFilterIntervals() {
  const s = reactive({ months: false });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (s.months ? 'Dates down to the day' : 'Dates down to the month')} variant="outline" onclick={() => (s.months = !s.months)} />
        <Button text="Amounts in ranges of 1,000" variant="outline" onclick={() => grid?.columnOption('amount', 'headerFilterInterval', 1000)} />
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />
      </Stack>
      <DataGrid
        class="dg-intervals"
        style="block-size: 30rem"
        rows={withTimes(makeOrders(300))}
        rowKey="id"
        columns={intervalColumns}
        label="Orders filtered by ranges and dates"
        locale="en"
        settings={{ headerFilterDateInterval: () => (s.months ? 'month' : 'day') }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-intervals-filter">{() => `${grid?.total ?? 0} orders · ${JSON.stringify(grid?.filters ?? {})}`}</output>
    </>
  );
}
```

`Search.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, CheckBox, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';
import { columns, makeOrders } from './orders';

type Sale = { id: number; customerId: number; amount: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The search panel over rows in memory, and over a server whose customer names live on another service. */
export default function Search() {
  const s = reactive({ text: 'ankara', caseSensitive: false });

  // The sales and the customers are two services: the search asks the customers' service for the
  // names, then the sales' server only for keys.
  const customers = new data.DataSource<Customer, number>({ adapter: new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 300) });
  const salesServer = new SlowAdapter<Sale, number>({ data: Array.from({ length: 50_000 }, (_, i) => ({ id: i + 1, customerId: ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 })), key: 'id' }, 250);
  const sales = new data.DataSource<Sale, number>({ adapter: salesServer, loadMode: 'blocks', pageSize: 100 });
  const saleColumns: GridColumn<Sale>[] = [
    { field: 'id', title: 'No', type: 'number', width: 90 },
    { field: 'customerId', title: 'Customer', flex: 1, width: 220, lookup: { dataSource: customers, valueField: 'id', textField: 'name' } },
    { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];
  let server: DataGrid<Sale> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Search for “approved”" variant="outline" onclick={() => (s.text = 'approved')} />
        <CheckBox label="Mark only the same case" x-model={() => s.caseSensitive} />
      </Stack>
      <DataGrid
        class="dg-search"
        style="block-size: 30rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={columns}
        label="Orders to search"
        locale="en"
        searchText={() => s.text}
        onSearchTextChanged={(e) => (s.text = e.text)}
        settings={{ searchPanel: true, searchPanelWidth: 220, highlightCaseSensitive: () => s.caseSensitive }}
      />
      <output class="dg-search-text">{() => `Searching for “${s.text}”`}</output>
      <DataGrid
        class="dg-server-search"
        style="block-size: 30rem"
        dataSource={sales}
        columns={saleColumns}
        label="50,000 sales to search"
        locale="en"
        settings={{ searchPanel: true, searchPlaceholder: 'A customer, an amount…' }}
        ref={(g: DataGrid<Sale>) => (server = g)}
      />
      <output class="dg-server-search-filter">{() => `${(server?.total ?? 0).toLocaleString('en')} sales · ${JSON.stringify(server?.filter ?? null)}`}</output>
    </>
  );
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
