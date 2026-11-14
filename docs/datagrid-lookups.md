# DataGrid: Lookup columns

> DataGrid · @motifx-community/ui 0.1.0-beta.10

## Lookup columns

A column with `lookup` holds a key, such as a customer ID, and displays the text of the matching item. Items can come from an array or from a `DataSource` of any adapter, including another service or a different protocol from the rows. Only the keys on screen are requested. Unknown keys at any given moment are sent together (`id in [...]`, up to `batchSize` each), or one at a time with `resolve: 'byKey'` for a service that returns one item by key. Texts are cached per source and shared by every column and grid that uses it. While a key loads, its cell is empty and busy. A key the source does not contain appears as it is, muted, and prevents its row from being saved.

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

Editing opens a `DropDown` with search (or `editor: 'combobox'`, or the kit's `Lookup` with columns) over its own data source on the same adapter, so its search never affects a source displayed on the page. Typing on the cell opens the list and searches the typed text, and the selected text appears immediately. `filter(row, context)` narrows the list for the row (through `context.getValue`, so a newly selected province is included), `setCellValue` writes other fields along with the value (in this example, a new province clears the district), and `onEditorPreparing` changes the editor's props, so the district waits for a province (`e.getValue('province')`).

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

When the row already includes the text (OData `$expand`), `textFrom` reads it from the row, and the lookup source is used only for editing and lists. `sortField` sorts on the server by that field. Without them, a lookup column sorts by its key, and in-memory rows can sort by text with `sortBy: 'text'`. The filter row offers “(All)” and the texts (always `=`), and the header filter lists the texts with “(empty)” first. Both are searched by text and, with `syncLookupFilterValues`, contain only the keys of rows that match the other filters. Copy and export write the text (`raw` writes the key), and pasted text becomes the key of the single item that has it.

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

| Lookup field | Description |
| --- | --- |
| `dataSource` | `Bind<DataSource \| unknown[]>`. The items, searched and resolved on their own service, or an in-memory array. |
| `valueField, textField` | The field that matches the cell value (by default, the source's key, or the value itself in an array of plain values), and the displayed text as a field or `(item) => text` (by default, the value). |
| `searchFields` | The fields searched by the editor and text searches. By default, `textField` when it is a field. |
| `filter` | `(row, context) => FilterExpression`. Narrows the items for a row (for cascading lists, `context.getValue('province')` returns the entered value, otherwise the row's). `row` is `null` for filter lists. |
| `allowClearing` | `Bind<boolean>`. Adds a clear button to the editor. The default is `false`. |
| `resolve, batchSize` | `'batch'` (the default: keys in one request, `batchSize` 20 each) or `'byKey'` (one request per key). |
| `sortBy` | `Bind<'key' \| 'text'>`. Sorts in-memory rows by key (the default) or by displayed text. |
| `editor, editorOptions` | `'dropdown'` (the default), `'combobox'` or `'lookup'`, and props for it (such as a `Lookup`'s `columns`). A column's own `editor` still takes precedence and receives the lookup in its context. |
| `searchLimit` | The maximum number of items containing the search panel's text that the search converts to keys. The default is 100. |
| `filterSearchLimit` | The same for the header filter's search box. The default is 1000. |
| `pageSize` | The number of items the editor's list loads per request while scrolling (with a data source). The default is 50. |
| `parallelRequests` | The number of simultaneous requests: of keys with `'byKey'`, of batches with `'batch'`. The default is 6. |
| `pasteSearchLimit` | The number of items searched for pasted text. The default is 50. |

## Feedback

Loading issues…

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

/** In-memory sales whose customer comes from another service: only the customers on screen are requested, several in one request. */
export default function Lookups() {
  const s = reactive({ requests: 0, keys: 0 });
  // Simulates another service. In an application, use new data.RestAdapter({ url: '/api/customers', key: 'id' }) here.
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

/** An invoice as its service returns it, with the customer included (OData `$expand=customer`). */
type Invoice = { id: number; customerId: number; customer: { name: string }; total: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The name is read from the row itself, and the customer service is used only for editing. */
export default function TextFrom() {
  const s = reactive({ requests: 0 });
  const people = makeCustomers(600);
  const invoices: Invoice[] = Array.from({ length: 5_000 }, (_, i) => {
    const customer = people[(i * 53) % people.length];
    return { id: i + 1, customerId: customer.id, customer: { name: customer.name }, total: ((i * 4337) % 50_000) / 10 };
  });
  // Simulate two services: new data.ODataAdapter({ url: '/odata/Invoices', key: 'id' }) with expand: ['customer'], and the customer service.
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
