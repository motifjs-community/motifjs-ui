# DataGrid: Grouping and summaries

> DataGrid · @motifx-community/ui 0.1.0-beta.3

## Grouping

Rows can be grouped by one or more columns. Each group has a row showing “Column: value (count)”, using the text of a lookup column or the column's format for in-memory rows, with an arrow that expands and collapses it and with lower-level groups indented. Grouped columns are removed from the columns area unless `showWhenGrouped` is set. `groupIndex` on columns sets the initial grouping, and `groupPanel` adds a panel at the start of the toolbar where dropping a header groups by its column. Clicking a chip reverses the order of its groups, and a chip can move along the panel or be dragged back onto the headers to ungroup the column at that position. The column menu provides the same actions from the keyboard. Sorting applies to the rows inside the groups, and the header of a grouped column, like its chip, sorts its groups. `calculateGroupValue` groups by a computed value. In paged mode, pages count both group rows and data rows, and a collapsed group counts as one row.

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

On a server, a `DataSource` that loads by `blocks` over an adapter that supports grouping is asked only for the groups and their counts (`loadGroups`, `group` with `groupsOnly`). Rows arrive in group order, in blocks, only for expanded groups in the visible area. In this example, the groups start collapsed (`autoExpandGroup: false`). An adapter that cannot group (OData, REST), a source that loads by page, or a `calculateGroupValue` function loads every matching row and groups them in the browser. Filters, search and selection work with groups, and “select all” still means every row of the filter. CSV export writes a “Column: value” line before each group, and `group` is saved with the layout.

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

`summary` calculates values for the rows that match the filter and search. `totalItems` appear in a totals row below the rows, which stays at the bottom while the rows scroll and moves sideways with the columns. `groupItems` appear for each group: after the group row's count, under their column in the group row (`alignByColumn`), or in a footer row after the group's rows (`showInGroupFooter`). An item aggregates a `column` (and its `value` reader) with a `summaryType` of `sum`, `min`, `max`, `avg`, `count` or `custom`, and appears under `showInColumn` (otherwise its own column), with several items in one column stacked. Its text is `displayFormat` (`{0}` for the value and `{1}` for the column), or a string from `summary.texts` and `uiLocale`, formatted by `valueFormat` (`Intl` options or a function, otherwise the column's format), or `customizeText`. A `custom` item uses `calculateCustomSummary` in three stages: `start`, `calculate` per row, and `finalize`. Empty values are excluded (`skipEmptyValues`, and `count` counts every row). Unsaved edits count once saved, or as they are made with `recalculateWhileEditing`. `getTotalSummaryValue(name)` and `getGroupSummaryValue(key, name)` read the values, `onSummaryChanged` reports recalculation, and CSV and `exportRows()` write the footers and totals.

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

On a server, a source that loads pages or blocks requests the totals of the query from its adapter when the adapter has the `summary` capability (`remoteSummary`, `DataSource.loadSummary`), and requests group summaries with the groups when it groups (`loadGroups` with `groupSummary`). The sample server in this example does both, using one request for totals and one for groups, regardless of what the list shows. An adapter without this capability, a `custom` item or a computed column loads every matching row once per row set (`groupLoadPageSize` per request), and the values are calculated in the browser. If only the browser can calculate the group summaries, the rows are grouped in the browser as well.

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

| Field | Description |
| --- | --- |
| `totalItems, groupItems` | The items of the totals row and of each group. A function is tracked. Items are read as provided, so after changing them in place, call `grid.refreshSummary()`. |
| `calculateCustomSummary` | `(e) => void` with `{ name, summaryProcess, value, totalValue, groupIndex, component }`. One function for every `custom` item. Set `e.totalValue` at `start`, combine `e.value` (the column's value, or the row when there is no column) into it at each `calculate`, and adjust it at `finalize`. |
| `recalculateWhileEditing` | With `false`, the values reflect unsaved edits, new rows and rows marked for deletion. When enabled, they change once the changes are saved. |
| `skipEmptyValues` | With `true`, empty values (`null`, `undefined`, `''`) are excluded from browser calculations. When disabled, `sum` and `avg` count them as 0. An item can set its own value. |
| `texts` | The item strings by type: `sum`, `sumOtherColumn`, `min`, `minOtherColumn`, `max`, `maxOtherColumn`, `avg`, `avgOtherColumn` and `count`. They override the `gridSummary…` strings of `uiLocale` and the grid's `texts`. |

| Item field | Description |
| --- | --- |
| `column` | The column to aggregate. Without one, `count` counts rows and `custom` receives the rows themselves. |
| `summaryType` | `'sum' \| 'min' \| 'max' \| 'avg' \| 'count' \| 'custom'`, default `'count'`. |
| `name` | Names the item for `getTotalSummaryValue` and `calculateCustomSummary`. |
| `showInColumn` | The column the item appears under (by default, `column`). When it appears under a different column, the text names its column (“Sum of Amount: …”). |
| `valueFormat` | `Intl.NumberFormatOptions`, `Intl.DateTimeFormatOptions` or `(value) => string`. By default, the column's format (or a plain number for `count`). |
| `displayFormat, customizeText` | The text, where `{0}` is the formatted value and `{1}` is the column's title. `({ value, valueText }) => string` takes precedence. |
| `alignment, cssClass` | `'start' \| 'center' \| 'end'` (by default, the column's), and a custom class on the item. |
| `skipEmptyValues` | Excludes empty values for this item. The default is `summary.skipEmptyValues`. |
| `visible` | Whether the item appears. The default is the `totalSummary` (`groupSummary`) setting. |
| `showInGroupFooter, alignByColumn` | For group items: places them in the group footer, or under their column in the group row, except under the first column, which holds the text. |

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

`GroupingServer.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders grouped on the server: the groups arrive with their counts, and rows load only in the visible area. */
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

/** 100,000 orders on a server that calculates the totals and returns the group summaries with the groups. */
export default function SummariesServer() {
  const s = reactive({ asked: 0 });
  // An adapter with the `summary` capability is asked for the values (`remoteSummary: 'auto'`). Without it,
  // every matching row is loaded once and the values are calculated in the browser.
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
