# ComboBox and Autocomplete

> Choice · @motifx-community/ui 0.1.0-beta.10

A text input with a list that filters as the user types. Items can come from memory or from a data layer source that is searched on the server. `Autocomplete` is the free-text variant, where the value is the text itself.

## Import

```tsx
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## Declarative and programmatic

```tsx
/** The cities the combo boxes of the examples suggest. */
export const cities = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin', 'Samsun', 'Trabzon'];
```

## From a data source

With `dataSource`, the search goes to the data source (using its `searchFields`) after `searchDelay`. In `'blocks'` mode, only the visible rows load, and a value that is not on a loaded page is looked up by key so the field can show its text immediately. This example has 10,000 products and responds after 300 ms.

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

## Custom values and Autocomplete

```tsx
/** The cities the combo boxes of the examples suggest. */
export const cities = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin', 'Samsun', 'Trabzon'];
```

## Keyboard

| Key | Description |
| --- | --- |
| `Typing` | Searches and opens the list, highlighting the first match. |
| `Down / Up, Alt + Down` | Opens the list with all items, or moves the highlight within it. |
| `Enter` | Accepts the highlighted item, or the text (see `acceptCustomValue`), and closes the list. |
| `Tab, leaving` | If an item's text matches the input, it is selected. Otherwise, the custom value is used or the selected item is restored. |
| `Escape` | Closes the list. When closed, it reverts the typing, and then clears the value with `clearButton`. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pattern` | The APG combobox with list autocomplete. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`. |
| `Highlight` | `aria-activedescendant` identifies the highlighted option while focus stays in the input. |
| `Loading` | Rows not loaded yet are options with `aria-busy`, which announce "Loading…" from `uiLocale`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| null>` | `null` | The value of the selected item. `x-model` binds it. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server. |
| `textField, valueField, iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | Same as DropDown. Groups apply to in-memory items. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How in-memory items are matched. |
| `minSearchLength` | `Bind<number>` | `0` | The number of characters to type before the list opens. |
| `searchDelay` | `Bind<number>` | `0` / `250` | The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source). |
| `acceptCustomValue` | `Bind<boolean>` | `false` | Text that matches no item becomes the value. Otherwise, the field reverts to the selected item. |
| `autoHighlight` | `Bind<boolean>` | `true` | Highlights the first match, so Enter accepts it. |
| `showDropDownButton, clearButton` | `Bind<boolean>` | `true`, `false` | The arrow that opens all items, and the button that clears the value. |
| `itemTemplate, matchWidth, placeholder` |  |  | Same as DropDown. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `selectedItem` | The item for the current value, when known. |
| `listItems` | The `DataItems` shown in the list, which are the results of the last search. |
| `opened, open(), close(), clear()` | The list and the value. |
| `refresh()` | Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The open list and the value text update. Autocomplete has the same method. |
| `onValueChanged, onOpened, onClosed, onValidated` | Same as DropDown. |

The items logic is a shared part: `DataItems` supplies any list control from an array or a data source.

## Feedback

Loading issues…

## Example files

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ComboBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A combo box bound with x-model, and combo boxes created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const town = new ComboBox<string, string>({ label: `Town ${++added}`, items: cities, minSearchLength: 2 });
    town.onValueChanged((e) => (form.result = `${town.label}: ${e.value ?? '—'}`));
    host?.controls.add(town);
    town.focus();
  };

  return (
    <>
      <ComboBox label="&City" items={cities} x-model={() => form.city} clearButton />
      <output class="cb-city">{() => `city: ${form.city ?? '—'}`}</output>
      <Button text="Add a combo box programmatically" variant="outline" onclick={addProgrammatic} />
      <output class="cb-made">{() => form.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

`cities.ts`

```tsx
/** The cities the combo boxes of the examples suggest. */
export const cities = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin', 'Samsun', 'Trabzon'];
```

`Products.tsx`

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { ComboBox } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Product {
  id: number;
  name: string;
  category: string;
}

const categories = ['Beverages', 'Condiments', 'Dairy', 'Grains', 'Produce', 'Seafood'];
const rows: Product[] = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: `${categories[i % 6]} item ${i + 1}`, category: categories[i % 6] }));

/** 10,000 products on a server that responds after 300 ms. The search goes to the data source, and the value's text is looked up by key. */
export default function Products() {
  const line = reactive({ product: 2500 as number | null });
  const products = new data.DataSource<Product, number>({
    adapter: new SlowAdapter<Product, number>({ data: rows, key: 'id' }, 300),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <ComboBox label="Product" dataSource={products} textField="name" valueField="id" x-model={() => line.product} stretch />
      <output class="cb-product">{() => `product: ${line.product ?? '—'}`}</output>
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

`CustomValues.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Autocomplete, ComboBox } from '@motifx-community/ui';
import { cities } from './cities';

/** A combo box that takes text matching no item, and an Autocomplete whose value is the text itself. */
export default function CustomValues() {
  const form = reactive({ tag: '', query: '' });
  return (
    <>
      <ComboBox label="Tag" items={['bug', 'feature', 'docs']} acceptCustomValue x-model={() => form.tag} />
      <Autocomplete label="Search" items={cities} x-model={() => form.query} />
      <output class="cb-query">{() => `query: "${form.query}"`}</output>
    </>
  );
}
```
