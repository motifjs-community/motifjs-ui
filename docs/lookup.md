# Lookup

> Choice · @motifx-community/ui 0.1.0-beta.6

Selects one row from a table-style list, typically from a data source searched on the server, such as a customer by company, contact and city. The field shows the text of the selected row, and everything else works as in DropDown.

## Import

```tsx
import { Lookup, type LookupColumn } from '@motifx-community/ui';
```

## Columns from a data source

`columns` arranges every row on one grid under a header, and the search box searches the data source's `searchFields`. Rows load as the list scrolls.

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

## Values on unloaded pages

A value whose row is not loaded is requested by key, in one request together with the keys other fields and grids on the same source need at that moment. In the meantime, the field shows a spinner in place of the arrow, the list stays closed, and the key is never shown as text. A record that already has the name can provide it through `valueText`, and the field shows it immediately. A key the server does not have appears muted and underlined, with the reason in its title. If the request failed, opening the list tries again.

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

## API reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `Bind<readonly LookupColumn[]>` | `[]` | `{ field, caption?, width?, align? }`: a field name or function, a header text, a CSS grid track and the alignment. |
| `showColumnHeaders` | `Bind<boolean>` | `true` | Shows a header above the rows. |
| `popupWidth` | `Bind<string>` | `lookup.popup-width` | The minimum width of the list. |
| `searchEnabled` | `Bind<boolean>` | `true` | Adds a search box above the list. DropDown has this off by default. |
| `everything of DropDown` |  |  | `items`, `dataSource`, `valueText`, `textField`, `valueField`, `searchDelay`, `clearButton`, validation, keyboard support and more. |
| `refresh()` |  |  | Your items and columns can be plain or reactive, and the lookup reads them as they are. After changing them in place, call `refresh()`. |

## Feedback

Loading issues…

## Example files

`Customers.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Lookup } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Customer {
  id: string;
  company: string;
  contact: string;
  city: string;
  phone: string;
}

const cities = ['Berlin', 'London', 'Madrid', 'México D.F.', 'Paris', 'São Paulo', 'İstanbul', 'Seattle'];
const people = ['Maria Anders', 'Ana Trujillo', 'Antonio Moreno', 'Thomas Hardy', 'Christina Berglund', 'Hanna Moos', 'Frédérique Citeaux', 'Martín Sommer'];
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `C${String(i + 1).padStart(4, '0')}`,
  company: `${['Alfreds', 'Bon app', 'Ernst', 'Folk och fä', 'Hanari', 'Island', 'Lehmanns', 'Wartian'][i % 8]} ${['Futterkiste', 'Trading', 'Handel', 'HB', 'Carnes', 'Markt', 'Foods', 'Herkku'][(i >> 3) % 8]} ${i + 1}`,
  contact: people[i % 8],
  city: cities[(i * 3) % 8],
  phone: `0${(212 + (i % 9)).toString()} ${String(1000000 + i * 37).slice(0, 7)}`,
}));

/** 2,000 customers behind a server that answers after 250 ms, picked from columns and searched by company, contact and city. */
export default function Customers() {
  const order = reactive({ customer: 'C0042' as string | null });
  const customers = new data.DataSource<Customer, string>({
    adapter: new SlowAdapter<Customer, string>({ data: rows, key: 'id' }, 250),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['company', 'contact', 'city'],
  });

  return (
    <>
      <Lookup
        label="&Customer"
        dataSource={customers}
        textField="company"
        valueField="id"
        popupWidth="40rem"
        columns={[
          { field: 'company', caption: 'Company', width: '2fr' },
          { field: 'contact', caption: 'Contact' },
          { field: 'city', caption: 'City', width: '7rem' },
          { field: 'phone', caption: 'Phone', width: '8rem', align: 'end' },
        ]}
        clearButton
        x-model={() => order.customer}
        stretch
      />
      <output class="lk-customer">{() => `customer: ${order.customer ?? '—'}`}</output>
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

`ByKey.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, Lookup } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Customer {
  id: number;
  company: string;
  city: string;
}

const companyOf = (id: number) => `${['Alfreds', 'Bon app', 'Ernst', 'Hanari', 'Island', 'Lehmanns'][id % 6]} ${['Trading', 'Handel', 'Markt', 'Foods'][id % 4]} ${id}`;
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, company: companyOf(i + 1), city: ['Berlin', 'Paris', 'İstanbul', 'Madrid'][i % 4] }));

/** Values on no loaded page of a server that answers after 1.2 s: one field waits for its row, one shows the name its record carries, one has a key the server does not have. */
export default function ByKey() {
  const customers = new data.DataSource<Customer, number>({
    adapter: new SlowAdapter<Customer, number>({ data: rows, key: 'id' }, 1200),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['company', 'city'],
  });
  const columns = [
    { field: 'company', caption: 'Company' },
    { field: 'city', caption: 'City', width: '7rem' },
  ];
  const waiting = reactive({ customer: 1500 as number | null });
  // A record as returned by the server: the customer's key and, beside it, the name.
  const order = reactive({ customer: 1500 as number | null, customerName: companyOf(1500) });

  const another = () => {
    const id = 100 + Math.floor(Math.random() * 1900);
    waiting.customer = id;
    order.customer = id;
    order.customerName = companyOf(id);
  };

  return (
    <>
      <Lookup class="lk-waits" label="Waits for its row" dataSource={customers} textField="company" valueField="id" columns={columns} x-model={() => waiting.customer} stretch />
      <Lookup
        class="lk-given"
        label="Shows the name it is given"
        dataSource={customers}
        textField="company"
        valueField="id"
        columns={columns}
        valueText={() => order.customerName}
        x-model={() => order.customer}
        stretch
      />
      <Lookup class="lk-missing" label="A key the server does not have" dataSource={customers} textField="company" valueField="id" columns={columns} value={9999} stretch />
      <Button class="lk-another" text="Another customer" variant="outline" onclick={another} />
    </>
  );
}
```
