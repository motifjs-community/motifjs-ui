# ListBox

> Data · @motifx-community/ui 0.1.0-beta.3

A list displayed directly on the page. Users select one or more items with the keyboard or pointer. Items can come from memory or a data source, can be searched and grouped, and long lists render only the visible rows.

## Import

```tsx
import { ListBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## Declarative and programmatic

`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically.

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Multiple selection

When `selectionMode` is `'multiple'`, the value is an array and every change writes a new one. Each option below is a prop you can bind.

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Objects, groups, templates

Custom objects are read through `textField` and `valueField`. `groupField` places items under headers, `enabledField` disables specific items, and `itemTemplate` customizes how an item is drawn.

```tsx
import { reactive } from '@motifx/core';
import { ListBox } from '@motifx-community/ui';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪' },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷' },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦' },
];

/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with a template. */
export default function Countries() {
  const form = reactive({ country: 'JP' as string | null });
  return (
    <>
      <ListBox
        label="Country"
        items={countries}
        textField="name"
        valueField="code"
        groupField="region"
        enabledField={(c: Country) => c.member !== false}
        itemTemplate={(c: Country, host: HTMLElement) => {
          host.textContent = `${c.flag}  ${c.name}`;
        }}
        height={8}
        x-model={() => form.country}
      />
      <output class="lb-country">{() => `code: ${form.country ?? '—'}`}</output>
    </>
  );
}
```

## From a data source

With `dataSource`, the list reads a `DataSource` from the data layer, and the search runs there (using its `searchFields`). In `'blocks'` mode, only the visible rows load as the list scrolls. Selected values on unloaded rows stay selected, and “Select all” loads the values of every matching row. This example has 5,000 orders.

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { ListBox } from '@motifx-community/ui';

interface Order {
  id: number;
  name: string;
}

const rows: Order[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Order #${String(i + 1).padStart(5, '0')}` }));

/** 5,000 orders from a data source, loaded in blocks while the list scrolls and searched where they live. */
export default function Orders() {
  const form = reactive({ orders: [42, 4321] as number[] });
  const orders = new data.DataSource<Order, number>({
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <ListBox
        label="Orders"
        dataSource={orders}
        textField="name"
        valueField="id"
        selectionMode="multiple"
        selectAll
        searchEnabled
        height={10}
        x-model={() => form.orders}
      />
      <output class="lb-orders">{() => `${form.orders.length} chosen${form.orders.length && form.orders.length < 6 ? `: ${form.orders.join(', ')}` : ''}`}</output>
    </>
  );
}
```

## Validation and states

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | The list is one Tab stop. The search box, when enabled, is another. |
| `Down, Up, Home, End, Page Down, Page Up` | Moves the highlight and skips items that cannot be selected. In single selection, the item is also selected. |
| `A letter` | Moves to the next item that starts with that letter. Letters typed quickly are combined into one search. |
| `Space, Enter` | In single selection, selects the highlighted item. In multiple selection, selects or deselects it. |
| `Shift + Down / Up` | In multiple selection, moves and selects or deselects the next item. |
| `Shift + Space` | In multiple selection, selects every item from the last selected item to the highlighted one. |
| `Control + Shift + Home / End` | In multiple selection, selects every item from the highlighted one to the first or last item. |
| `Control + A` | In multiple selection, selects every item, or clears the selection if all are selected. |
| `Down in the search box` | Moves focus to the list. |
| `Control + click, Shift + click` | In multiple selection, adds or removes one item, or selects the items in between. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pattern` | The APG listbox. The list has `role="listbox"` and holds focus itself, and `aria-activedescendant` identifies the highlighted option. |
| `Options` | `role="option"` with `aria-selected`, and `aria-disabled` on disabled items. Multi-select lists have `aria-multiselectable`. |
| `Name` | The label names the list (`aria-labelledby`), help and error text describe it, and `aria-invalid` and `aria-required` report its state. |
| `Groups` | Each group has `role="group"` and is labeled by its header. |
| `Long lists` | Only visible rows are rendered. Each option reports its position with `aria-posinset` and `aria-setsize`, and loading rows have `aria-busy`. |
| `Focus` | The highlight appears while the list is in use, and it also gets the focus ring during keyboard use. |

## Localization

“Select all”, the search box, “No items” and “Loading…” come from `uiLocale.strings` (`selectAll`, `search`, `noItems`, `loading`).

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every list on the page: “Select all”, the search box, “No items”. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <ListBox label="Fruit" items={['Apple', 'Cherry', 'Pear']} selectionMode="multiple" selectAll searchEnabled />
      <ListBox label="Empty" items={[]} height={3} />
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-list-box` | Added to the field. `data-selection-mode` and `data-check-boxes`, plus the TextBox field attributes. |
| `.mx-list-box__search` | The search box. |
| `.mx-list, .mx-list__item, .mx-list__header, .mx-list__check` | The shared list, its options (`data-active`, `data-selected`), group headers and check boxes. |
| `.mx-list__item[data-select-all]` | The "Select all" row, with `data-mixed` when only some items are selected. |

### Component tokens

| Token | Description |
| --- | --- |
| `listbox.container, listbox.box` | Units: the spacing around the list box, and around and between its search box and list. |
| `listbox.check` | Unit: the check box of a row in a multi-select list (`checked`, `disabled`, `checked-disabled`). |
| `listbox.keys, listbox.idle` | Units: the ring around the row with keyboard focus (`selected`), and that row while the list is not in use. |
| `listbox.field, listbox.search, listbox.list` | Places: the field, search box and list inside a list box, which are the list and field units as they appear here. |
| `list.*` | The rows, as in DropDown: height, padding, highlight, selected item, headers and "Select all". |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| V[] \| null>` | `null` / `[]` | The selected value (single) or values (multiple). `x-model` binds it, and a change writes a new array. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server. A data source takes precedence. |
| `textField, valueField` | `Bind<ItemField<T>>` | `'text'`, `'value'` | A property name or a function `(item) => …`. Plain values serve as their own text and value. |
| `iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | An icon for each item, headers between groups (in-memory items), and items that cannot be selected. |
| `selectionMode` | `Bind<'single' \| 'multiple'>` | `'single'` | A single value, or an array of values. |
| `showCheckBoxes` | `Bind<boolean>` | `true` | In multiple selection, shows check boxes in front of the items. `false` draws a check mark instead, and a plain click selects only that item. |
| `selectAll` | `Bind<boolean>` | `false` | In multiple selection, adds a "Select all" row that can be checked, empty or indeterminate. |
| `selectionFollowsFocus` | `Bind<boolean>` | `true` | In single selection, the arrow keys select as they move. When off, they only move, and Space or Enter selects. |
| `searchEnabled` | `Bind<boolean>` | `false` | Adds a search box above the list. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How the search matches in-memory items. |
| `searchDelay` | `Bind<number>` | `0` / `250` | The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source). |
| `height` | `Bind<number \| string \| null>` | — | The height, in rows (`8`) or a CSS length (`"12rem"`). Without it, the list is as tall as its items, up to the `max-height` of the list (`list.container`). |
| `itemTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Customizes how an item is drawn. |
| `noItemsText` | `Bind<string>` | — | The text for an empty list, which replaces the `uiLocale` “No items” string. |
| `label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | Field props shared by all editors. |

A prop that accepts a function as its value (`textField`, a template) uses the function as is when it has parameters. A function without parameters is treated as a getter, as with every other prop.

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `selectedItems, selectedItem` | read-only, reactive | The known items for the selected values. With a data source, the others are requested by key and added. |
| `listItems` | read-only | The `DataItems` shown in the list, which are the results of the last search. |
| `searchBox` | read-only | The search `TextBox` while `searchEnabled` is on. |
| `isValid, validationMessage` | read-only, reactive | See TextBox. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `selectAllItems()` | `Promise<void>` | In multiple selection, selects every item the list shows (with a data source, after their values load). |
| `clear()` | `void` | Clears the selection. |
| `scrollToItem(item)` | `void` | Scrolls an item into view and highlights it. |
| `refresh()` | `void` | Your items can be plain or reactive, and the list reads them as they are. After changing them in place, call `refresh()`. It re-reads the items, their text and values, and the selection. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onValidated(e)` | See TextBox. |

## Example files

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A list bound with x-model, and lists created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const list = new ListBox<string, string>({ label: `Size ${++added}`, items: ['S', 'M', 'L', 'XL'], height: 4 });
    list.onValueChanged((e) => (form.result = `${list.label}: ${e.value}`));
    host?.controls.add(list);
    list.focus();
  };

  return (
    <>
      <ListBox label="&City" items={cities} x-model={() => form.city} />
      <Stack orientation="horizontal" wrap align="center">
        <output class="lb-city">{() => `city: ${form.city ?? '—'}`}</output>
        <Button text="Add a list programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="lb-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

`cities.ts`

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

`SeveralItems.tsx`

```tsx
import { reactive } from '@motifx/core';
import { ListBox, Stack, Switch } from '@motifx-community/ui';
import { cities } from './cities';

/** One list switched between one value and several, with check boxes, “Select all”, and a search box. */
export default function SeveralItems() {
  const s = reactive({ picked: ['Bursa', 'Konya'] as string[], multiple: true, checkBoxes: true, selectAll: true, follows: true, search: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Multiple" x-model={() => s.multiple} />
        <Switch label="Check boxes" x-model={() => s.checkBoxes} />
        <Switch label="Select all" x-model={() => s.selectAll} />
        <Switch label="Selection follows focus" x-model={() => s.follows} />
        <Switch label="Search" x-model={() => s.search} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <ListBox
          label="Cities"
          items={cities}
          selectionMode={() => (s.multiple ? 'multiple' : 'single')}
          showCheckBoxes={() => s.checkBoxes}
          selectAll={() => s.selectAll}
          selectionFollowsFocus={() => s.follows}
          searchEnabled={() => s.search}
          value={() => (s.multiple ? s.picked : (s.picked[0] ?? null))}
          onValueChanged={(e) => (s.picked = Array.isArray(e.value) ? (e.value as string[]) : e.value === null ? [] : [e.value as string])}
        />
        <output class="lb-picked">{() => `value: ${JSON.stringify(s.multiple ? s.picked : (s.picked[0] ?? null))}`}</output>
      </Stack>
    </>
  );
}
```

`Validation.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, Stack, ValidationGroup } from '@motifx-community/ui';
import { cities } from './cities';

/** A required list checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ sizes: [] as string[], result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a size.';
  };

  return (
    <>
      <ListBox
        label="Sizes"
        items={['S', 'M', 'L', 'XL']}
        selectionMode="multiple"
        required
        helpText="Pick one or more."
        validationGroup={group}
        x-model={() => s.sizes}
      />
      <ListBox label="Read-only" items={cities} value="Bursa" readOnly height={4} />
      <ListBox label="Disabled" items={cities} value="Bursa" enabled={false} height={4} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Check" variant="outline" onclick={check} />
        <output class="lb-check">{() => s.result}</output>
      </Stack>
    </>
  );
}
```
