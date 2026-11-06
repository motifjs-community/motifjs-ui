# DataGrid: Grouping and summaries

> DataGrid · @motifx-community/ui 0.1.0-beta.3

## Grouping

Rows are grouped by one column or several: a row per group shows “Column: value (count)” — a lookup column its text, rows in memory the column's format — with an arrow that opens and closes it, and the groups below it moved in. Grouped columns leave the columns unless `showWhenGrouped`. `groupIndex` on the columns groups at the start; `groupPanel` puts the panel at the start of the toolbar, where a header dropped groups by its column; a chip turns the order of its groups when clicked, moves along the panel and, dragged back onto the headers, ungroups the column where it lands. The column menu does the same from the keyboard. A sort sorts the rows inside the groups; the header of a grouped column, like its chip, sorts its groups; `calculateGroupValue` groups by a value of its own. Paged, the pages count group rows and data rows; a closed group is one row.

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

On a server: a `DataSource` that loads by `blocks` over an adapter that groups is asked only for the groups with their counts (`loadGroups`, `group` with `groupsOnly`); the rows come in group order, in blocks, only for the open groups where the list looks — here the groups start closed (`autoExpandGroup: false`). An adapter that cannot group (OData, REST), a source that loads by page, or a `calculateGroupValue` function gets every matching row, grouped in the browser without remote grouping. Filters, the search and selection work over the groups; “select all” stays every row of the filter. The CSV export writes a “Column: value” line before each group; `group` is kept with the layout.

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

## Summaries

`summary` gives values of the rows under the filter and the search: `totalItems` in a row of totals under the rows — it stays at the bottom while the rows scroll and moves sideways with the columns — and `groupItems` for each group: after the group row's count, under their column in the group row (`alignByColumn`), or in a footer row after the group's rows (`showInGroupFooter`). An item aggregates a `column` (its `value` reader too) with `summaryType` `sum`, `min`, `max`, `avg`, `count` or `custom`, shows under `showInColumn` (else its column), several in one column one under the other, and its text is `displayFormat` (`{0}` the value, `{1}` the column) or a text of `summary.texts` and `uiLocale`, formatted by `valueFormat` (`Intl` options or a function; else the column's format), or `customizeText`. A `custom` item goes through `calculateCustomSummary` in three steps: `start`, `calculate` per row, `finalize`. Empty values are left out (`skipEmptyValues`; `count` counts every row). Unsaved edits count once saved, or as they are made with `recalculateWhileEditing`. `getTotalSummaryValue(name)` and `getGroupSummaryValue(key, name)` read the values; `onSummaryChanged` tells when they are worked out again; the CSV and `exportRows()` write the footers and the totals.

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

On a server: a source that loads pages or blocks asks its adapter for the totals of the query when the adapter has the `summary` capability (`remoteSummary`; `DataSource.loadSummary`), and asks for the group summaries with the groups when it groups (`loadGroups` with `groupSummary`). Here the made-up server does both: one request for the totals, one for the groups, whatever the list shows. An adapter without it, a `custom` item or a computed column get every matching row, loaded once per row set (`groupLoadPageSize` a request), and the values are worked out in the browser; group summaries only the browser can work out group the rows in the browser too.

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

| Field | What it does |
| --- | --- |
| `totalItems, groupItems` | The items of the row of totals and of each group; a function is followed. The items are kept as given: after a change in place call `grid.refreshSummary()`. |
| `calculateCustomSummary` | `(e) => void` with `{ name, summaryProcess, value, totalValue, groupIndex, component }`: one function for every `custom` item; set `e.totalValue` at `start`, fold `e.value` (the column’s value, or the row without a column) into it at each `calculate`, adjust it at `finalize`. |
| `recalculateWhileEditing` | `false`: the values follow unsaved edits, new rows and rows marked for deletion. Off, they change once the changes are saved. |
| `skipEmptyValues` | `true`: empty values (`null`, `undefined`, `''`) are left out of what the browser works out; off, `sum` and `avg` count them as 0. An item can set its own. |
| `texts` | The item texts by type: `sum`, `sumOtherColumn`, `min`, `minOtherColumn`, `max`, `maxOtherColumn`, `avg`, `avgOtherColumn`, `count`; over the `gridSummary…` texts of `uiLocale` and the grid’s `texts`. |

| Item field | What it does |
| --- | --- |
| `column` | The column aggregated. Without one, `count` counts rows and `custom` gets the rows themselves. |
| `summaryType` | `'sum' \| 'min' \| 'max' \| 'avg' \| 'count' \| 'custom'`, default `'count'`. |
| `name` | Names the item for `getTotalSummaryValue` and `calculateCustomSummary`. |
| `showInColumn` | The column the item shows under (default: `column`); away from its column the text names the column (“Sum of Amount: …”). |
| `valueFormat` | `Intl.NumberFormatOptions`, `Intl.DateTimeFormatOptions` or `(value) => string`; default: the column’s format (`count`: a plain number). |
| `displayFormat, customizeText` | The text, `{0}` the formatted value and `{1}` the column’s title; `({ value, valueText }) => string` wins over it. |
| `alignment, cssClass` | `'start' \| 'center' \| 'end'` (default: the column's); a class of your own on the item. |
| `skipEmptyValues` | Leave empty values out for this item; default `summary.skipEmptyValues`. |
| `visible` | Show the item; default the `totalSummary` (`groupSummary`) setting. |
| `showInGroupFooter, alignByColumn` | Group items: in the group footer; under their column in the group row, not under the first column, which holds the text. |

## Example files

`Grouping.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Orders in memory grouped by city, then by status; the group panel and the switches change it. */
export default function Grouping() {
  const s = reactive({ panel: true, dragging: true, open: true, collapsing: true, rowClick: false, showCity: false });
  let grid: DataGrid<Order> | null = null;
  const grouped = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, showWhenGrouped: () => s.showCity } : c.field === 'status' ? { ...c, groupIndex: 1 } : c));

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Group panel" x-model={() => s.panel} />
        <CheckBox label="Drag to group" x-model={() => s.dragging} />
        <CheckBox label="Groups start open" x-model={() => s.open} />
        <CheckBox label="The user can open and close" x-model={() => s.collapsing} />
        <CheckBox label="A click on the row opens" x-model={() => s.rowClick} />
        <CheckBox label="City stays a column" x-model={() => s.showCity} />
      </Stack>
      <DataGrid
        class="dg-grouping"
        style="block-size: 34rem"
        rows={makeOrders(500)}
        rowKey="id"
        columns={grouped}
        label="Orders by city and status"
        locale="en"
        settings={{
          groupPanel: () => s.panel,
          groupPanelDragging: () => s.dragging,
          autoExpandAll: () => s.open,
          allowCollapsing: () => s.collapsing,
          groupExpandMode: () => (s.rowClick ? 'rowClick' : 'button'),
          selection: 'multiple',
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <Button text="Open only the cities" variant="outline" onclick={() => (grid?.expandAll(0), grid?.collapseAll(1))} />
        <Button text="Ungroup" variant="outline" onclick={() => grid?.clearGrouping()} />
        <output class="dg-grouping-state">{() => `Grouped by ${grid?.group.map((g) => `${g.field} ${g.dir}`).join(', ') || 'nothing'}`}</output>
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

`GroupingServer.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders grouped on the server: the groups come with their counts, the rows only where the list looks. */
export default function GroupingServer() {
  const s = reactive({ loads: 0 });
  // An adapter that groups (here rows in memory acting as a server) answers `group` itself; one
  // that cannot (OData, REST) gets every matching row grouped in the browser instead.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading(() => s.loads++);
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  const grouped = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c));
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid
        class="dg-grouping-server"
        style="block-size: 32rem"
        dataSource={orders}
        columns={grouped}
        label="100,000 orders by status"
        locale="en"
        settings={{ groupPanel: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open “Shipped”" variant="outline" onclick={() => grid?.expandGroup(['Shipped'])} />
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <output class="dg-grouping-loads">{() => `${s.loads} loads for ${grid?.total ?? 0} rows`}</output>
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

`Summaries.tsx`

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack, type GridCustomSummaryInfo, type GridSummary } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Totals under the rows, group summaries in the group rows and footers, and a custom one: paid orders. */
export default function Summaries() {
  const s = reactive({ grouped: true, footers: true, aligned: true, live: false });
  let grid: DataGrid<Order> | null = null;
  // The amount gets room for its totals.
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: () => (s.grouped ? 0 : undefined) } : c.field === 'amount' ? { ...c, width: 170 } : c));

  // Counts the paid orders: start, then each row, then the result.
  const calculateCustomSummary = (e: GridCustomSummaryInfo<Order>) => {
    if (e.summaryProcess === 'start') e.totalValue = 0;
    else if (e.summaryProcess === 'calculate' && (e.value as Order).paid) e.totalValue = (e.totalValue as number) + 1;
  };

  const summary: GridSummary<Order> = {
    recalculateWhileEditing: () => s.live,
    totalItems: [
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', displayFormat: '{0} paid' },
      { column: 'date', summaryType: 'max', displayFormat: 'Last: {0}' },
      { name: 'total', column: 'amount', summaryType: 'sum' },
      { column: 'amount', summaryType: 'avg', valueFormat: { maximumFractionDigits: 0 } },
    ],
    groupItems: [
      { column: 'amount', summaryType: 'sum', alignByColumn: () => s.aligned },
      { column: 'amount', summaryType: 'max', showInGroupFooter: true, visible: () => s.footers },
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', showInGroupFooter: true, displayFormat: '{0} paid', visible: () => s.footers },
    ],
    calculateCustomSummary,
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Group by city" x-model={() => s.grouped} />
        <CheckBox label="Group footers" x-model={() => s.footers} />
        <CheckBox label="Sum under its column in the group row" x-model={() => s.aligned} />
        <CheckBox label="Follow unsaved edits" x-model={() => s.live} />
      </Stack>
      <DataGrid
        class="dg-summaries"
        style="block-size: 34rem"
        rows={makeOrders(300)}
        rowKey="id"
        columns={byCity}
        label="Orders with totals"
        locale="en"
        saveMode="batch"
        summary={summary}
        settings={{ editable: true, filterRow: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-summaries-total">{() => `The amounts add up to ${Number(grid?.getTotalSummaryValue('total') ?? 0).toLocaleString('en', { maximumFractionDigits: 2 })}`}</output>
    </>
  );
}
```

`SummariesServer.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders on a server that computes the totals itself and gives the group summaries with the groups. */
export default function SummariesServer() {
  const s = reactive({ asked: 0 });
  // An adapter with the `summary` capability is asked for the values (`remoteSummary: 'auto'`); one
  // without it gets every matching row loaded once and the values worked out in the browser.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading((e) => {
    if (e.options.summary || e.options.groupSummary) s.asked++;
  });
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  const byStatus = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : { ...c, filterRow: c.field === 'city' || c.field === 'amount', width: c.field === 'amount' ? 170 : c.width }));
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid
        class="dg-summaries-server"
        style="block-size: 32rem"
        dataSource={orders}
        columns={byStatus}
        label="100,000 orders with server totals"
        locale="en"
        settings={{ groupPanel: true }}
        summary={{
          totalItems: [
            { column: 'id', summaryType: 'count', showInColumn: 'customer' },
            { name: 'total', column: 'amount', summaryType: 'sum' },
            { column: 'amount', summaryType: 'max' },
          ],
          groupItems: [
            { column: 'amount', summaryType: 'sum' },
            { column: 'amount', summaryType: 'avg', showInGroupFooter: true, valueFormat: { maximumFractionDigits: 2 } },
            { column: 'id', summaryType: 'count', showInColumn: 'customer', showInGroupFooter: true },
          ],
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <output class="dg-summaries-server-state">{() => `${s.asked} summary requests · totals ${grid?.summaryStatus ?? 'loading'}`}</output>
      </Stack>
    </>
  );
}
```
