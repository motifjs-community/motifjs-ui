# DropDown

> Choice · @motifx-community/ui 0.1.0-beta.11

Selects one item from a list. The field shows the selected item, and the list opens below it on click or from the keyboard. The list can be searched, grouped and customized, and it stays fast with thousands of items.

## Import

```tsx
import { DropDown, type DropDownItem } from '@motifx-community/ui';
```

## Declarative and programmatic

`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically.

```tsx
/** The cities the drop-downs of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Objects, groups, templates

Custom objects are read through `textField` and `valueField`, each a property name or a function. `groupField` places options under headers, `enabledField` disables specific options, and a template customizes how an option is drawn.

```tsx
import { reactive, type ComponentBase } from '@motifx/core';
import { DropDown } from '@motifx-community/ui';

interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  member?: boolean;
}

const countries: Country[] = [
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷', member: true },
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪', member: true },
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷', member: true },
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵', member: true },
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷', member: true },
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷', member: true },
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦', member: true },
];

/** Draws a country as its flag and its name, in the list and in the field. */
const drawCountry = (c: Country, host: ComponentBase) => {
  host.setText(`${c.flag}  ${c.name}`);
};

/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with templates. */
export default function Countries() {
  const form = reactive({ country: 'TR' as string | null });
  return (
    <>
      <DropDown
        label="Country"
        items={countries}
        textField="name"
        valueField="code"
        groupField="region"
        enabledField={(c: Country) => c.member !== false}
        itemTemplate={drawCountry}
        fieldTemplate={drawCountry}
        x-model={() => form.country}
      />
      <output class="dd-country">{() => `code: ${form.country ?? '—'}`}</output>
    </>
  );
}
```

## Search and long lists

`searchEnabled` adds a search box at the top of the list. A long list renders only the visible rows. This example has 5,000 orders.

```tsx
import { reactive } from '@motifx/core';
import { DropDown } from '@motifx-community/ui';

const orders = Array.from({ length: 5000 }, (_, i) => ({ value: i + 1, text: `Order #${String(i + 1).padStart(5, '0')}` }));

/** 5,000 orders with a search box; the list draws only the rows in view. */
export default function LongList() {
  const form = reactive({ order: 1200 as number | null });
  return (
    <>
      <DropDown label="Order" items={orders} searchEnabled x-model={() => form.order} />
      <output class="dd-order">{() => `order: ${form.order ?? '—'}`}</output>
    </>
  );
}
```

## Dynamic items

When `items` is a function, it is tracked and a new list appears immediately. Your items can be plain or reactive, and the drop-down reads them as they are. After changing them in place, call `refresh()` to update the open list and the field.

```tsx
import { reactive } from '@motifx/core';
import { Button, DropDown } from '@motifx-community/ui';

/** Items changed in place: the drop-down reads them again on `refresh()`. */
export default function LiveItems() {
  const model = reactive({ statuses: ['Draft', 'Review'], status: 'Draft' as string | null });
  let field!: DropDown<string, string>;
  const add = () => {
    model.statuses.push('Published');
    field.refresh();
  };
  return (
    <>
      <DropDown ref={(d: DropDown<string, string>) => (field = d)} label="Status" items={() => model.statuses} x-model={() => model.status} />
      <Button text="Add “Published”" variant="outline" enabled={() => !model.statuses.includes('Published')} onclick={add} />
    </>
  );
}
```

## Validation and states

```tsx
/** The cities the drop-downs of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Keyboard

| Key | Description |
| --- | --- |
| `Down, Up, Enter, Space, Alt + Down` | Opens the list on the selected option (Home and End open it on the first and last option). |
| `A letter` | Opens the list on the next option that starts with that letter. Letters typed quickly are combined into one search. |
| `In the list: Up, Down, Home, End, Page Up, Page Down` | Moves the highlight and skips options that cannot be selected. |
| `In the list: Enter, Space, Alt + Up` | Selects the highlighted option and closes the list. |
| `In the list: Tab` | Selects the highlighted option and moves to the next field. |
| `Escape` | Closes the list without selecting. With `clearButton` and the list closed, clears the value. |
| `Alt + key (`&City`)` | Moves focus to the field. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pattern` | The APG select-only combobox. The field has `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`, and focus stays on it. |
| `Highlight` | `aria-activedescendant` identifies the highlighted option. Options have `role="option"` with `aria-selected`, and disabled options have `aria-disabled`. |
| `Groups` | Each group has `role="group"` and is labeled by its header. |
| `Long lists` | Only visible rows are rendered, and each option reports its position with `aria-posinset` and `aria-setsize`. |
| `Search` | The search box controls the list and identifies the highlighted option the same way. |
| `Waiting` | While the item for the value is being requested, the combobox has `aria-busy` and its text announces "Loading…". A key the data source does not have shows the reason in its title. |

## Localization

The search box, clear button, empty list text, loading text (`loading`) and missing key reasons (`notInList`, `loadFailed`) come from `uiLocale.strings`.

```tsx
import { reactive } from '@motifx/core';
import { Button, DropDown, uiLocale } from '@motifx-community/ui';

/** Switches the texts of every drop-down on the page: the search box, the clear button, the empty list. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <DropDown label="Empty" items={[]} placeholder="Open me" />
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-drop-down` | Added to the field. `data-open` while the list is open and `data-loading` while the item for the value is requested, plus the TextBox field attributes. |
| `.mx-drop-down__display, .mx-drop-down__text, .mx-drop-down__chevron` | The combobox, the selected text (`data-placeholder` when empty, `data-missing` for a key the data source does not have), and the arrow. |
| `.mx-drop-down__spinner` | The spinner that replaces the arrow while the item for the value is requested. |
| `.mx-drop-down__popup, .mx-drop-down__search` | The popup and its search box. |
| `.mx-list, .mx-list__item, .mx-list__header` | The shared list, its options (`data-active`, `data-selected`) and group headers. |

### Component tokens

| Token | Description |
| --- | --- |
| `field.*` | The field, as in TextBox. |
| `drop-down.value, drop-down.chevron, drop-down.spinner, drop-down.spinner-shape` | Units: the selected text (`placeholder`, `missing`, `disabled`), the arrow (`open`, `disabled`), the loading ring and the shape a design language can draw instead (with the spinner's shapes and timing). |
| `list.item-height, list.item` | The options: row height and the item unit in each state (`hover`, `pressed`, `active`, `selected`, `selected-hover`, `selected-pressed`, `disabled`, `next`, `select-all`). |
| `list.indicator, list.check, list.mark, list.icon, list.text` | Units: the bar on the selected option (`multiple`), the check box and mark in a multi-select list, an icon and the text. |
| `list.container, list.group, list.header, list.select-all-divider, list.empty` | Units: the list (spacing and maximum height), a group, group headers, the separator below "Select all", and the empty text. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| null>` | `null` | The value of the selected item. `x-model` provides two-way binding. |
| `items` | `Bind<readonly T[]>` | `[]` | Plain values, `DropDownItem` objects (`{ value, text, icon?, group?, enabled? }`) or custom objects. A function is tracked, and items changed in place appear after `refresh()`. |
| `dataSource` | `Bind<DataSource<T> \| null>` | `null` | Items from the data layer, loaded as the list scrolls and searched using its `searchFields`. This takes precedence over `items`. A value that is not on a loaded page is requested by key, and the field waits in the meantime (see Lookup). |
| `valueText` | `Bind<string>` | `''` | The display text for the value while its item is requested from `dataSource`, shown immediately instead of waiting. Use it when a record already has the name: `valueText={() => order.customerName}`. |
| `searchDelay` | `Bind<number>` | `250` with a data source, otherwise `0` | The delay, in milliseconds, between the last keystroke in the search box and the search. |
| `textField / valueField` | `Bind<ItemField<T>>` | `'text'` / `'value'` | A property name or a function `(item) => …`. Without `valueField`, an object with a `value` property uses that value, and anything else is its own value. |
| `iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | An icon for each option. Options in the same group appear together under its name. `enabled` marks options that cannot be selected. |
| `placeholder` | `Bind<string>` | `''` | Displayed when no item is selected. |
| `searchEnabled` | `Bind<boolean>` | `false` | Adds a search box at the top of the list. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How the search matches option text. |
| `clearButton` | `Bind<boolean>` | `false` | Shows a button that clears the value. Escape does the same while the list is closed. |
| `itemTemplate / fieldTemplate` | `Bind<(item, host: ComponentBase) => cleanup \| void>` | — | Customizes how an option or the selected item is drawn. |
| `matchWidth` | `Bind<boolean>` | `true` | The list is at least as wide as the field. |
| `label, labelMode, helpText, hint, prefix, icon, buttons, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | Field props shared by all editors. |

A prop that accepts a function as its value (`textField`, a template) uses the function as is when it has parameters. A function without parameters is treated as a getter, as with every other prop.

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `selectedItem` | read-only, reactive | The item whose value matches `value`. |
| `opened` | read/write, reactive | Indicates whether the list is open. Set it to open or close the list. |
| `isValid, validationMessage` | read-only, reactive | See TextBox. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(search?)` | `boolean` | Opens the list, and `search` starts the search box with that text. Returns `false` when the control is disabled, read-only or waiting for the item of its value. |
| `close()` | `void` | Closes the list and returns focus to the field. |
| `clear()` | `void` | Clears the value. |
| `refresh()` | `void` | Your items can be plain or reactive, and the drop-down reads them as they are. After changing them in place, call `refresh()`. The field text and the open list update. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onOpened()` | Occurs when the list opens. |
| `onClosed(reason)` | Occurs when the list closes. The reason is `'escape'`, `'outside'`, `'focus'` or `'code'` (also after a selection). |
| `onValidated(e)` | See TextBox. |

The list is a shared part, `OptionList`, exported for use in combo boxes, list boxes and your own controls.

## Feedback

Loading issues…

## Example files

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DropDown, Stack } from '@motifx-community/ui';
import { cities } from './cities';

/** Drop-downs bound with x-model, and drop-downs created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ city: 'İzmir' as string | null, size: null as string | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const size = new DropDown<string, string>({ label: `Size ${++added}`, items: ['S', 'M', 'L'], placeholder: 'Pick one' });
    size.onValueChanged((e) => (form.result = `${size.label}: ${e.value}`));
    host?.controls.add(size);
    size.focus();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <DropDown label="&City" items={cities} x-model={() => form.city} />
        <output class="dd-city">{() => `city: ${form.city ?? '—'}`}</output>
      </Stack>
      <DropDown label="Size" items={['S', 'M', 'L', 'XL']} placeholder="Pick one" x-model={() => form.size} clearButton />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a drop-down programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="dd-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

`cities.ts`

```tsx
/** The cities the drop-downs of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

`Validation.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, DropDown, ValidationGroup } from '@motifx-community/ui';
import { cities } from './cities';

/** A required drop-down checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ priority: 'normal' as string | null, result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a priority.';
  };

  return (
    <>
      <DropDown label="Priority" items={['low', 'normal', 'high']} required clearButton validationGroup={group} x-model={() => s.priority} />
      <DropDown label="Read-only" items={cities} value="Bursa" readOnly />
      <DropDown label="Disabled" items={cities} value="Bursa" enabled={false} />
      <Button text="Check" variant="outline" onclick={check} />
      <output class="dd-check">{() => s.result}</output>
    </>
  );
}
```
