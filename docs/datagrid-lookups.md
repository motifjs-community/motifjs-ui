# DataGrid: Lookup columns

> DataGrid · @motifx-community/ui 0.1.0-beta.0

## Lookup columns

A column with `lookup` keeps a key (a customer id) and shows the text of its item, from a `DataSource` of any adapter — another service, another protocol than the rows — or from an array. Only the keys on the screen are asked for: the unknown ones of a moment go out together (`id in [...]`, at most `batchSize` each), or one by one with `resolve: 'byKey'` for a service that gives one item by key. The texts are kept per source and shared by every column and grid using it. While a key loads its cell is empty and busy; a key the source does not have shows as it is, muted, and stops its row from being saved.

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

Editing opens a `DropDown` with search (or `editor: 'combobox'`, or the kit's `Lookup` with columns) over a data source of its own on the same adapter, so its search never moves a source the page shows. Typing on the cell opens the list and searches what was typed; the picked text shows at once. `filter(row, context)` narrows the list for the row (by `context.getValue`, so a province just picked counts), `setCellValue` writes other fields with the value — here a new province empties the district — and `onEditorPreparing` changes the editor's props: the district waits for a province (`e.getValue('province')`).

```tsx
/** Provinces and their districts, for the cascading lists. */
export interface Province {
  code: string;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province: string;
}

export const PROVINCES: Province[] = [
  { code: 'AN', name: 'Ankara' },
  { code: 'IS', name: 'İstanbul' },
  { code: 'IZ', name: 'İzmir' },
];

export const DISTRICTS: District[] = [
  { id: 1, name: 'Çankaya', province: 'AN' },
  { id: 2, name: 'Keçiören', province: 'AN' },
  { id: 3, name: 'Yenimahalle', province: 'AN' },
  { id: 4, name: 'Kadıköy', province: 'IS' },
  { id: 5, name: 'Beşiktaş', province: 'IS' },
  { id: 6, name: 'Üsküdar', province: 'IS' },
  { id: 7, name: 'Bornova', province: 'IZ' },
  { id: 8, name: 'Karşıyaka', province: 'IZ' },
  { id: 9, name: 'Konak', province: 'IZ' },
];
```

When the row already brings the text (OData `$expand`), `textFrom` reads it there and the lookup source is asked only to edit and to list; `sortField` sorts the server by it. Without them a lookup column sorts by its key; rows in memory can sort by the text with `sortBy: 'text'`. The filter row offers “(All)” and the texts (always `=`), the header filter the texts with “(empty)” first, both searched by text and, with `syncLookupFilterValues`, holding only the keys of the rows the other filters leave. Copy and export write the text (`raw`: the key); a pasted text becomes the key of the one item that has it.

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

| Lookup field | What it does |
| --- | --- |
| `dataSource` | `Bind<DataSource \| unknown[]>`: the items, searched and resolved on their own service, or an array in memory. |
| `valueField, textField` | The field that matches the cell value (default: the source’s key; an array of plain values: the value); the text shown, a field or `(item) => text` (default: the value). |
| `searchFields` | Fields the editor and the text searches look in. Default: `textField` when it is a field. |
| `filter` | `(row, context) => FilterExpression`: narrows the items for a row (cascading lists: `context.getValue('province')`, the value entered, else the row’s); `null` row: the filter lists. |
| `allowClearing` | `Bind<boolean>`: a clear button in the editor. Default `false`. |
| `resolve, batchSize` | `'batch'` (default: keys in one request, `batchSize` 100 each) or `'byKey'` (one request per key). |
| `sortBy` | `Bind<'key' \| 'text'>`: rows in memory sorted by the key (default) or by the text shown. |
| `editor, editorOptions` | `'dropdown'` (default), `'combobox'` or `'lookup'`, and props for it (a `Lookup`’s `columns`). A column’s own `editor` still wins and gets the lookup in its context. |
| `searchLimit` | How many items whose text holds the search panel’s text the search turns into keys, at most. Default 100. |
| `filterSearchLimit` | The same for the header filter’s search box. Default 1000. |
| `pageSize` | Items the editor’s list loads per request while it scrolls (a data source). Default 50. |
| `parallelRequests` | `'byKey'`: requests at the same time. Default 6. |
| `pasteSearchLimit` | Items a pasted text is looked for in. Default 50. |

## Example files

`Lookups.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';

type Sale = { id: number; customerId: number | null; amount: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Sales in memory whose customer comes from another service: only the customers on the screen are asked for, several in one request. */
export default function Lookups() {
  const s = reactive({ requests: 0, keys: 0 });
  // Stands in for another service: new data.RestAdapter({ url: '/api/customers', key: 'id' }) goes in its place.
  const service = new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 400);
  // Counts the requests that turn keys into names; the editor's own list loads are not among them.
  service.onLoading((e) => {
    const asked = e.options.filter as data.FilterCondition | undefined;
    if (asked?.op !== 'in' || !Array.isArray(asked.value)) return;
    s.requests++;
    s.keys = asked.value.length;
  });
  const customers = new data.DataSource<Customer, number>({ adapter: service });
  const sales: Sale[] = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, customerId: i === 4 ? 9999 : ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 }));
  const columns: GridColumn<Sale>[] = [
    { field: 'id', title: 'No', type: 'number', width: 80, editable: false },
    {
      field: 'customerId',
      title: 'Customer',
      width: 220,
      flex: 1,
      required: true,
      filterRow: true,
      headerFilter: true,
      lookup: {
        dataSource: customers,
        valueField: 'id',
        textField: 'name',
        editor: 'lookup',
        editorOptions: { columns: [{ field: 'name', caption: 'Name' }, { field: 'city', caption: 'City', width: '7rem' }] },
      },
    },
    { field: 'amount', title: 'Amount', type: 'number', width: 120, filterRow: true, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];
  let grid: DataGrid<Sale> | null = null;

  return (
    <>
      <DataGrid
        class="dg-lookups"
        style="block-size: 30rem"
        rows={sales}
        rowKey="id"
        columns={columns}
        label="Sales with customers from another service"
        locale="en"
        saveMode="batch"
        settings={{ editable: true, filterDelay: 200 }}
        ref={(g: DataGrid<Sale>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Read the names again" variant="outline" onclick={() => grid?.refreshLookups()} />
        <output class="dg-lookup-requests">{() => `${s.requests} requests for names to the customers service, the last for ${s.keys} customers`}</output>
      </Stack>
    </>
  );
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

`Cascade.tsx`

```tsx
import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { DISTRICTS, PROVINCES } from './places';

type Branch = { id: number; name: string; province: string | null; district: number | null };

const branches: Branch[] = [
  { id: 1, name: 'Head office', province: 'AN', district: 1 },
  { id: 2, name: 'Harbour', province: 'IZ', district: 9 },
  { id: 3, name: 'Bridge', province: 'IS', district: 6 },
  { id: 4, name: 'Not placed yet', province: null, district: null },
];

const columns: GridColumn<Branch>[] = [
  { field: 'name', title: 'Branch', width: 160, flex: 1, required: true },
  {
    field: 'province',
    title: 'Province',
    width: 150,
    lookup: { dataSource: PROVINCES, valueField: 'code', textField: 'name' },
    // Another province empties the district.
    setCellValue: (values) => {
      values.district = null;
    },
  },
  {
    field: 'district',
    title: 'District',
    width: 150,
    lookup: {
      dataSource: DISTRICTS,
      valueField: 'id',
      textField: 'name',
      allowClearing: true,
      // The districts of the province entered (else the row's); every district for the filter lists.
      filter: (row, { getValue }) => (row ? data.where('province', '=', getValue('province')) : null),
    },
  },
];

/** Province and district: a new province clears the district, whose list follows the province and waits for one. */
export default function Cascade() {
  return (
    <DataGrid
      class="dg-cascade"
      style="block-size: 24rem"
      rows={branches}
      rowKey="id"
      columns={columns}
      label="Branches"
      locale="en"
      settings={{ editable: true, addRows: true, filterRow: true, headerFilter: true }}
      newRow={{ create: () => ({ id: Math.max(0, ...branches.map((b) => b.id)) + 1, province: null, district: null }) }}
      onEditorPreparing={(e) => {
        if (e.field === 'district') e.options.enabled = e.getValue('province') !== null;
      }}
    />
  );
}
```

`places.ts`

```tsx
/** Provinces and their districts, for the cascading lists. */
export interface Province {
  code: string;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province: string;
}

export const PROVINCES: Province[] = [
  { code: 'AN', name: 'Ankara' },
  { code: 'IS', name: 'İstanbul' },
  { code: 'IZ', name: 'İzmir' },
];

export const DISTRICTS: District[] = [
  { id: 1, name: 'Çankaya', province: 'AN' },
  { id: 2, name: 'Keçiören', province: 'AN' },
  { id: 3, name: 'Yenimahalle', province: 'AN' },
  { id: 4, name: 'Kadıköy', province: 'IS' },
  { id: 5, name: 'Beşiktaş', province: 'IS' },
  { id: 6, name: 'Üsküdar', province: 'IS' },
  { id: 7, name: 'Bornova', province: 'IZ' },
  { id: 8, name: 'Karşıyaka', province: 'IZ' },
  { id: 9, name: 'Konak', province: 'IZ' },
];
```

`TextFrom.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';

/** An invoice as its service sends it: the customer comes along with it (OData `$expand=customer`). */
type Invoice = { id: number; customerId: number; customer: { name: string }; total: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The name read from the row itself: the customers' service is asked only to edit. */
export default function TextFrom() {
  const s = reactive({ requests: 0 });
  const people = makeCustomers(600);
  const invoices: Invoice[] = Array.from({ length: 5_000 }, (_, i) => {
    const customer = people[(i * 53) % people.length];
    return { id: i + 1, customerId: customer.id, customer: { name: customer.name }, total: ((i * 4337) % 50_000) / 10 };
  });
  // Stand in for two services: new data.ODataAdapter({ url: '/odata/Invoices', key: 'id' }) with expand: ['customer'], and the customers'.
  const invoiceSource = new data.DataSource<Invoice, number>({ adapter: new SlowAdapter<Invoice, number>({ data: invoices, key: 'id' }, 250), loadMode: 'blocks', pageSize: 100 });
  const customerService = new SlowAdapter<Customer, number>({ data: people, key: 'id' }, 400);
  customerService.onLoading(() => s.requests++);
  const columns: GridColumn<Invoice>[] = [
    { field: 'id', title: 'Invoice', type: 'number', width: 100, editable: false },
    {
      field: 'customerId',
      title: 'Customer',
      width: 220,
      flex: 1,
      textFrom: 'customer.name',
      sortField: 'customer.name',
      lookup: { dataSource: new data.DataSource<Customer, number>({ adapter: customerService }), valueField: 'id', textField: 'name' },
    },
    { field: 'total', title: 'Total', type: 'number', width: 120, editable: false, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];

  return (
    <>
      <DataGrid class="dg-text-from" style="block-size: 28rem" dataSource={invoiceSource} columns={columns} label="Invoices" locale="en" saveMode="batch" settings={{ editable: true }} />
      <output class="dg-text-from-requests">{() => `${s.requests} requests to the customers service`}</output>
    </>
  );
}
```
