# DropDown

> Choice · @motifx-community/ui 0.1.0-beta.3

Picks one item from a list. The field shows the chosen item; the list opens below it with the keyboard or a press, can be searched, grouped and drawn your way, and stays fast with thousands of items.

## Import

```tsx
import { DropDown, type DropDownItem } from '@motifx-community/ui';
```

## Declarative and programmatic

`items` can be plain values; `x-model` binds the value. Created with `new`, the same properties are set programmatically.

```tsx
/** The cities the drop-downs of the examples show. */
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
```

## Objects, groups, templates

Objects of your own are read through `textField` and `valueField` (a name or a function); `groupField` puts options under headers, `enabledField` keeps some from being chosen, and a template draws an option your way.

```tsx
import { reactive } from '@motifx/core';
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
const drawCountry = (c: Country, host: HTMLElement) => {
  host.textContent = `${c.flag}  ${c.name}`;
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

`searchEnabled` puts a search box at the top of the list. A long list draws only the rows in view: this one has 5,000 orders.

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

## Items that change

`items` given as a function is followed: a new list shows at once. Your items may be plain or reactive; the drop-down reads them as they are, so after changing them in place, call `refresh()`: the open list and the field show the change.

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

| Key | What it does |
| --- | --- |
| `Down, Up, Enter, Space, Alt + Down` | Open the list on the chosen option (Home / End: on the first / last). |
| `A letter` | Open the list on the next option starting with it; letters typed quickly search together. |
| `In the list: Up, Down, Home, End, Page Up, Page Down` | Move the highlight; options that cannot be chosen are skipped. |
| `In the list: Enter, Space, Alt + Up` | Choose the highlighted option and close. |
| `In the list: Tab` | Choose the highlighted option and go on to the next field. |
| `Escape` | Close without choosing; with `clearButton` and the list closed, empty the value. |
| `Alt + key (`&City`)` | Focus the field. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pattern` | The APG select-only combobox: the field is `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`; focus stays on it. |
| `Highlight` | `aria-activedescendant` names the highlighted option; options are `role="option"` with `aria-selected`, disabled ones `aria-disabled`. |
| `Groups` | Each group is `role="group"` named by its header. |
| `Long lists` | Only the rows in view are drawn; each option says where it is with `aria-posinset` and `aria-setsize`. |
| `Search` | The search box controls the list and names the highlighted option the same way. |
| `Waiting` | While the value's item is asked for, the combobox is `aria-busy` and its text says "Loading…" to screen readers; a key the source does not have carries the reason as its title. |

## Localization

The search box, the clear button, the empty list text, the wait (`loading`) and the reason a key is marked (`notInList`, `loadFailed`) come from `uiLocale.strings`.

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

| Hook | What it is |
| --- | --- |
| `.mx-drop-down` | Added to the field. `data-open` while the list is open, `data-loading` while the value's item is asked for; the field attributes of TextBox. |
| `.mx-drop-down__display, .mx-drop-down__text, .mx-drop-down__chevron` | The combobox, the chosen text (`data-placeholder` when empty, `data-missing` for a key the source does not have), the arrow. |
| `.mx-drop-down__spinner` | The spinner in the arrow's place while the value's item is asked for. |
| `.mx-drop-down__popup, .mx-drop-down__search` | The popup and its search box. |
| `.mx-list, .mx-list__item, .mx-list__header` | The list (shared), its options (`data-active`, `data-selected`) and group headers. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `field.*` | The field, as for TextBox. |
| `drop-down.value, drop-down.chevron, drop-down.spinner, drop-down.spinner-shape` | Units: the chosen text (`placeholder`, `missing`, `disabled`), the arrow (`open`, `disabled`), the ring that turns while the value's item is asked for and the shape a language may draw instead (with the spinner's shapes and timing). |
| `list.item-height, list.item` | The options: their row height, and the item unit in each state (`hover`, `pressed`, `active`, `selected`, `selected-hover`, `selected-pressed`, `disabled`, `next`, `select-all`). |
| `list.indicator, list.check, list.mark, list.icon, list.text` | Units: the bar on the chosen option (`multiple`), the check of a list of several choices and its mark, an icon, the text. |
| `list.container, list.group, list.header, list.select-all-divider, list.empty` | Units: the list (its space and most height), a group, group headers, the line under "Select all", the empty text. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V \| null>` | `null` | The value of the chosen item. `x-model` binds it two-way. |
| `items` | `Bind<readonly T[]>` | `[]` | Plain values, `DropDownItem`s (`{ value, text, icon?, group?, enabled? }`) or objects of your own. A function is followed; items changed in place show after `refresh()`. |
| `dataSource` | `Bind<DataSource<T> \| null>` | `null` | Items from the data layer, loaded where the list is scrolled to and searched on its `searchFields`. Wins over `items`. A value on no loaded page is asked for by key; meanwhile the field waits (see Lookup). |
| `valueText` | `Bind<string>` | `''` | The value's text while its item is asked for from `dataSource`, shown at once instead of waiting (a record that carries the name: `valueText={() => order.customerName}`). |
| `searchDelay` | `Bind<number>` | `250` with a data source, else `0` | Milliseconds between the last key in the search box and the search. |
| `textField / valueField` | `Bind<ItemField<T>>` | `'text'` / `'value'` | A property name or a function `(item) => …`. Without `valueField` an object with a `value` gives that, anything else is its own value. |
| `iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | An icon per option; options with the same group follow each other under its name; options that cannot be chosen. |
| `placeholder` | `Bind<string>` | `''` | Shown while nothing is chosen. |
| `searchEnabled` | `Bind<boolean>` | `false` | A search box at the top of the list. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How the search matches the option text. |
| `clearButton` | `Bind<boolean>` | `false` | A button that empties the value; Escape does the same while the list is closed. |
| `itemTemplate / fieldTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Draws an option / the chosen item yourself. |
| `matchWidth` | `Bind<boolean>` | `true` | The list is at least as wide as the field. |
| `label, labelMode, helpText, hint, prefix, icon, buttons, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | The field props every editor has. |

A prop whose value is a function of its own (`textField`, a template) takes the function itself when it has parameters; a function without parameters is a getter, as for every other prop.

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `selectedItem` | read-only, reactive | The item whose value is the value. |
| `opened` | read/write, reactive | Whether the list is open; setting it opens or closes it. |
| `isValid, validationMessage` | read-only, reactive | See TextBox. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(search?)` | `boolean` | Opens the list; `search` starts the search box with that text. `false` when disabled, read-only, or while the value's item is asked for. |
| `close()` | `void` | Closes it; focus goes back to the field. |
| `clear()` | `void` | Empties the value. |
| `refresh()` | `void` | Your items may be plain or reactive; the drop-down reads them as they are. After changing them in place, call `refresh()`. The field's text and the open list follow. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onOpened()` | The list opened. |
| `onClosed(reason)` | The list closed: `'escape'`, `'outside'`, `'focus'` or `'code'` (also after a choice). |
| `onValidated(e)` | See TextBox. |

The list is a shared part, `OptionList`, exported for combo boxes, list boxes and your own controls.

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
