# ComboBox and Autocomplete

> Choice · @motifx-community/ui 0.1.0-beta.0

A text field with a list that follows what is typed. The items come from memory or from a data source of the data layer, searched on the server. `Autocomplete` is the free-text kind: the value is the text.

## Import

```tsx
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## From JSX and from code

```tsx
/** The cities the combo boxes of the examples suggest. */
export const cities = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin', 'Samsun', 'Trabzon'];
```

## From a data source

With `dataSource` the search goes to the data source (its `searchFields`), after `searchDelay`. In `'blocks'` mode only the rows in view load; a value on no loaded page is found by key, so the field shows its text at once. This one holds 10,000 products and answers after 300 ms.

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

| Key | What it does |
| --- | --- |
| `Typing` | Searches and opens the list; the first match is highlighted. |
| `Down / Up, Alt + Down` | Open the list with every item; move in it. |
| `Enter` | Take the highlighted item (or the text, see `acceptCustomValue`) and close. |
| `Tab, leaving` | An item whose text is the text is taken; otherwise the custom value or the chosen item again. |
| `Escape` | Close the list; closed, undo the typing; then, with `clearButton`, empty it. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pattern` | The APG combobox with list autocomplete: the input is `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`. |
| `Highlight` | `aria-activedescendant` names the highlighted option; focus stays in the input. |
| `Loading` | Rows not loaded yet are options with `aria-busy`, reading "Loading…" from `uiLocale`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| null>` | `null` | The value of the chosen item; `x-model` binds it. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives. |
| `textField, valueField, iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | As for DropDown; groups for items in memory. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How items in memory match. |
| `minSearchLength` | `Bind<number>` | `0` | Characters to type before the list opens. |
| `searchDelay` | `Bind<number>` | `0` / `250` | Milliseconds after the last key before searching (in memory / a data source). |
| `acceptCustomValue` | `Bind<boolean>` | `false` | Text that matches no item becomes the value; otherwise the field goes back to the chosen item. |
| `autoHighlight` | `Bind<boolean>` | `true` | The first match is highlighted, so Enter takes it. |
| `showDropDownButton, clearButton` | `Bind<boolean>` | `true`, `false` | The arrow that opens every item; the button that empties it. |
| `itemTemplate, matchWidth, placeholder` |  |  | As for DropDown. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `selectedItem` | The item of the value, when known. |
| `listItems` | The `DataItems` the list shows (what the last search matched). |
| `opened, open(), close(), clear()` | The list and the value. |
| `refresh()` | Your items may be plain or reactive; the box reads them as they are. After changing them in place, call `refresh()`. The open list and the text of the value follow. Autocomplete has it too. |
| `onValueChanged, onOpened, onClosed, onValidated` | As for DropDown. |

The items part is shared: `DataItems` feeds any list control from an array or a data source.

## Example files

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ComboBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A combo box bound with x-model, and combo boxes created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const town = new ComboBox<string, string>({ label: `Town ${++added}`, items: cities, minSearchLength: 2 });
    town.onValueChanged((e) => (form.result = `${town.label}: ${e.value ?? '—'}`));
    host?.controls.add(town);
    town.focus();
  };

  return (
    <>
      <ComboBox label="&City" items={cities} x-model={() => form.city} clearButton />
      <output class="cb-city">{() => `city: ${form.city ?? '—'}`}</output>
      <Button text="Add a combo box from code" variant="outline" onclick={addFromCode} />
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

/** 10,000 products behind a server that answers after 300 ms: the search goes to the data source, the value's text is found by key. */
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
