# ListBox

> Data · @motifx-community/ui 0.1.0-beta.1

A list that stays on the page. One item or several are chosen with the keys or the pointer; items come from memory or from a data source, can be searched and grouped, and long lists draw only the rows in view.

## Import

```tsx
import { ListBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## From JSX and from code

`items` can be plain values; `x-model` binds the value. Created with `new`, the same properties are set from code.

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Several items

With `selectionMode` set to `'multiple'` the value is an array, and every change writes a new one. Each switch below is a prop you can bind.

```tsx
/** The cities the lists of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Objects, groups, templates

Objects of your own are read through `textField` and `valueField`; `groupField` puts items under headers, `enabledField` keeps some from being chosen, and `itemTemplate` draws an item your way.

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

With `dataSource` the list reads a `DataSource` of the data layer, and the search goes to it (its `searchFields`). In `'blocks'` mode only the rows in view load while the list scrolls; chosen values on rows not loaded yet stay chosen, and “Select all” loads the values of every matching row. This one holds 5,000 orders.

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

| Key | What it does |
| --- | --- |
| `Tab` | The list is one Tab stop; the search box, when on, is another. |
| `Down, Up, Home, End, Page Down, Page Up` | Move the highlight; items that cannot be chosen are skipped. Single: the item is chosen too. |
| `A letter` | The next item starting with it; letters typed quickly search together. |
| `Space, Enter` | Single: choose the highlighted item. Multiple: choose it or let it go. |
| `Shift + Down / Up` | Multiple: move and choose or let go of the next item. |
| `Shift + Space` | Multiple: choose every item from the last one chosen to the highlighted one. |
| `Control + Shift + Home / End` | Multiple: choose every item from the highlighted one to the first / last. |
| `Control + A` | Multiple: choose every item, or none when all are chosen. |
| `Down in the search box` | Go to the list. |
| `Control + click, Shift + click` | Multiple: add or take away one item; choose the items between. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pattern` | The APG listbox: the list is `role="listbox"`, focused itself; `aria-activedescendant` names the highlighted option. |
| `Options` | `role="option"` with `aria-selected`; disabled ones `aria-disabled`. Multiple lists are `aria-multiselectable`. |
| `Name` | The label names the list (`aria-labelledby`); help and errors describe it, `aria-invalid` and `aria-required` tell its state. |
| `Groups` | Each group is `role="group"` named by its header. |
| `Long lists` | Only the rows in view are drawn; each option says where it is with `aria-posinset` and `aria-setsize`; rows still loading are `aria-busy`. |
| `Focus` | The highlight shows while the list is in use; with the keys it also gets the focus ring. |

## Localization

“Select all”, the search box, “No items” and “Loading…” come from `uiLocale.strings` (`selectAll`, `search`, `noItems`, `loading`).

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every list on the page: “Select all”, the search box, “No items”. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
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

| Hook | What it is |
| --- | --- |
| `.mx-list-box` | Added to the field. `data-selection-mode`, `data-check-boxes`; the field attributes of TextBox. |
| `.mx-list-box__search` | The search box. |
| `.mx-list, .mx-list__item, .mx-list__header, .mx-list__check` | The list (shared), its options (`data-active`, `data-selected`), group headers and check boxes. |
| `.mx-list__item[data-select-all]` | The "Select all" row; `data-mixed` when some items are chosen. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `listbox.container, listbox.box` | Units: the space around the list box, and around and between its search box and list. |
| `listbox.check` | Unit: the check box of a row in a list of several choices (`checked`, `disabled`, `checked-disabled`). |
| `listbox.keys, listbox.idle` | Units: the ring round the row the keys are on (`selected`), and that row while the list is not in use. |
| `listbox.field, listbox.search, listbox.list` | Places: the field, the search box and the list inside a list box (the list's and the field's own units, as they look here). |
| `list.*` | The rows, as for DropDown: height, padding, highlight, chosen item, headers, "Select all". |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| V[] \| null>` | `null` / `[]` | The chosen value (single) or values (multiple). `x-model` binds it; a change writes a new array. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives. A data source wins. |
| `textField, valueField` | `Bind<ItemField<T>>` | `'text'`, `'value'` | A property name or a function `(item) => …`. Plain values are their own text and value. |
| `iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | An icon per item; headers between groups (items in memory); items that cannot be chosen. |
| `selectionMode` | `Bind<'single' \| 'multiple'>` | `'single'` | One value, or an array of them. |
| `showCheckBoxes` | `Bind<boolean>` | `true` | Multiple: check boxes in front of the items; `false` draws a check mark, and a plain click chooses only that item. |
| `selectAll` | `Bind<boolean>` | `false` | Multiple: a "Select all" row that is checked, empty or shows a dash. |
| `selectionFollowsFocus` | `Bind<boolean>` | `true` | Single: the arrow keys choose as they move. Off: they only move, Space or Enter chooses. |
| `searchEnabled` | `Bind<boolean>` | `false` | A search box above the list. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How items in memory match the search. |
| `searchDelay` | `Bind<number>` | `0` / `250` | Milliseconds after the last key before searching (in memory / a data source). |
| `height` | `Bind<number \| string \| null>` | — | Rows (`8`) or a CSS length (`"12rem"`). Without it the list is as high as its items, up to the list’s `max-height` (`list.container`). |
| `itemTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Draws an item your way. |
| `noItemsText` | `Bind<string>` | — | What an empty list says instead of `uiLocale`’s “No items”. |
| `label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | The field props every editor has. |

A prop whose value is a function of its own (`textField`, a template) takes the function itself when it has parameters; a function without parameters is a getter, as for every other prop.

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `selectedItems, selectedItem` | read-only, reactive | The items of the chosen values that are known; with a data source the others are asked by key and follow. |
| `listItems` | read-only | The `DataItems` the list shows (what the last search matched). |
| `searchBox` | read-only | The search `TextBox` while `searchEnabled` is on. |
| `isValid, validationMessage` | read-only, reactive | See TextBox. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `selectAllItems()` | `Promise<void>` | Multiple: chooses every item the list shows (a data source: after their values load). |
| `clear()` | `void` | Chooses nothing. |
| `scrollToItem(item)` | `void` | Brings an item into view and highlights it. |
| `refresh()` | `void` | Your items may be plain or reactive; the list reads them as they are. After changing them in place, call `refresh()`. It reads which items there are, their texts and values, and the chosen ones again. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onValidated(e)` | See TextBox. |

## Example files

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** A list bound with x-model, and lists created with `new` and added from code. */
export default function FromCode() {
  const form = reactive({ city: 'İzmir' as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
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
        <Button text="Add a list from code" variant="outline" onclick={addFromCode} />
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
