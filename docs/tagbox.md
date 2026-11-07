# TagBox

> Data · @motifx-community/ui 0.1.0-beta.6

Selects multiple items. Selected items appear as tags in the field, followed by a text input that searches the list. Items can come from memory or from a data source, and typed text can become a custom tag.

## Import

```tsx
import { TagBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## Declarative and programmatic

`x-model` binds an array, and every change writes a new one. When you create the component with `new`, set the same properties programmatically.

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

## List options

The list stays open during selection, shows selected items as checked, and can include a “Select all” row. Each option is a prop you can bind.

```tsx
import { reactive } from '@motifx/core';
import { Stack, Switch, TagBox } from '@motifx-community/ui';

interface Person {
  id: number;
  name: string;
  team: string;
  initials: string;
  away?: boolean;
}

const people: Person[] = [
  { id: 1, name: 'Ada Lovelace', team: 'Design', initials: 'AL' },
  { id: 2, name: 'Grace Hopper', team: 'Design', initials: 'GH' },
  { id: 3, name: 'Alan Turing', team: 'Engineering', initials: 'AT' },
  { id: 4, name: 'Barbara Liskov', team: 'Engineering', initials: 'BL', away: true },
  { id: 5, name: 'Edsger Dijkstra', team: 'Engineering', initials: 'ED' },
  { id: 6, name: 'Margaret Hamilton', team: 'Research', initials: 'MH' },
  { id: 7, name: 'Donald Knuth', team: 'Research', initials: 'DK' },
];

/** Draws a person as initials and a name. */
const drawPerson = (p: Person, el: HTMLElement) => {
  const badge = el.appendChild(document.createElement('span'));
  badge.style.color = 'var(--mx-color-accent-fg)';
  badge.style.fontWeight = 'var(--mx-font-weight-semibold)';
  badge.textContent = p.initials;
  el.append(` ${p.name}`);
};

/** Objects in groups, items that cannot be chosen, a template, and the switches of the list. */
export default function TeamList() {
  const s = reactive({ team: [1, 3] as number[], closeOnSelect: false, hideSelected: false, selectAll: false, limit: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Close on select" x-model={() => s.closeOnSelect} />
        <Switch label="Hide chosen" x-model={() => s.hideSelected} />
        <Switch label="Select all" x-model={() => s.selectAll} />
        <Switch label="At most 3" x-model={() => s.limit} />
      </Stack>
      <TagBox
        label="Team"
        items={people}
        textField="name"
        valueField="id"
        groupField="team"
        enabledField={(p: Person) => !p.away}
        itemTemplate={drawPerson}
        closeOnSelect={() => s.closeOnSelect}
        hideSelected={() => s.hideSelected}
        selectAll={() => s.selectAll}
        maxSelected={() => (s.limit ? 3 : 0)}
        placeholder="Add people"
        stretch
        x-model={() => s.team}
      />
      <output class="tg-team">{() => `ids: ${JSON.stringify(s.team)}`}</output>
    </>
  );
}
```

## From a data source

With `dataSource`, typed text searches the data source (using its `searchFields`). In `'blocks'` mode, only the visible rows load, and tags for values on unloaded pages are looked up by key. `maxTags` keeps the field compact. This example has 5,000 customers.

```tsx
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { TagBox } from '@motifx-community/ui';

interface Customer {
  id: number;
  name: string;
}

const rows: Customer[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Customer ${String(i + 1).padStart(4, '0')}` }));

/** 5,000 customers from a data source, loaded in blocks while the list scrolls; the tags of values not loaded yet are found by key. */
export default function Customers() {
  const mail = reactive({ to: [12, 4321] as number[] });
  const customers = new data.DataSource<Customer, number>({
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <TagBox label="Customers" dataSource={customers} textField="name" valueField="id" maxTags={3} selectAll clearButton stretch x-model={() => mail.to} />
      <output class="tg-customers">{() => `${mail.to.length} chosen${mail.to.length && mail.to.length < 6 ? `: ${mail.to.join(', ')}` : ''}`}</output>
    </>
  );
}
```

## Custom tags

With `acceptCustomValue`, pressing Enter adds text that matches no item as a tag. `customValue` transforms or rejects it, and `tagTemplate` customizes how a tag is drawn.

```tsx
import { reactive } from '@motifx/core';
import { TagBox } from '@motifx-community/ui';

/** Typed text that matches no item becomes a tag; `customValue` shapes it or turns it down. */
export default function CustomTags() {
  const issue = reactive({ labels: ['bug'] as string[] });
  return (
    <>
      <TagBox
        label="Labels"
        items={['bug', 'docs', 'feature', 'question']}
        acceptCustomValue
        customValue={(text: string) => (text.length > 1 ? text.toLowerCase() : null)}
        helpText="Type a new label and press Enter."
        x-model={() => issue.labels}
      />
      <output class="tg-labels">{() => `labels: ${JSON.stringify(issue.labels)}`}</output>
    </>
  );
}
```

## Validation and states

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

## Keyboard

| Key | Description |
| --- | --- |
| `Typing` | Searches and opens the list, highlighting the first match. |
| `Down / Up, Alt + Down` | Opens the list with all items, or moves the highlight within it. |
| `Enter` | Selects or deselects the highlighted item and keeps the list open. With `acceptCustomValue`, text that matches no item becomes a tag. |
| `Backspace in an empty input` | Removes the last tag. |
| `Left at the start of the input` | Moves to the last tag. |
| `On a tag: Left, Right, Home, End` | Moves between the tags. Right on the last tag, or End, returns to the input. |
| `On a tag: Delete, Backspace` | Removes the tag. |
| `Escape` | Closes the list. When closed, it clears the text, and then removes all tags with `clearButton`. |
| `Alt + Up, Tab` | Closes the list. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pattern` | The APG combobox with a multi-select listbox. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`, and the list has `aria-multiselectable`. |
| `Highlight` | `aria-activedescendant` identifies the highlighted option while focus stays in the input. |
| `Tags` | A `role="list"` of `role="listitem"` elements. Each has a remove button named “Remove …” from `uiLocale`, and the “+3” tag lists the rest in its title. |
| `Name` | The label names the input, and help and error text describe it. |

## Localization

The remove buttons (`removeItem`, “Remove {text}”), the “+3” tag (`moreItems`), “Select all”, the buttons and the list text come from `uiLocale.strings`.

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-tag-box` | Added to the field. `data-open`, and `data-text` while text is typed, plus the TextBox field attributes. |
| `.mx-tag-box__tags, .mx-tag-box__tag, .mx-tag-box__tag-text, .mx-tag-box__remove` | The tags, a tag (`data-loading` while its item is requested), its text and its remove button. |
| `.mx-tag-box__more` | The “+3” tag. |
| `.mx-tag-box__input, .mx-tag-box__arrow, .mx-tag-box__clear` | The text input and the buttons. |
| `.mx-tag-box__popup, .mx-list…` | The popup and the shared list. |

### Component tokens

| Token | Description |
| --- | --- |
| `tagbox.tag, tagbox.tag-text` | Units: a tag (`more`: the "+N" tag, `loading`, `focus`, `hover`, `fixed`, `disabled`) and its text. |
| `tagbox.remove, tagbox.remove-glyph` | Units: a tag's remove button (`hover`, `pressed`) and its glyph. |
| `tagbox.box, tagbox.tags, tagbox.arrow, tagbox.arrow-glyph` | Units: the spacing around the tags in the box, the tag group, and the arrow that opens the list (`open`). |
| `tagbox.inset, tagbox.input-min-width` | The space between the tags and the field edge, and the minimum width of the input before it wraps to the next line. |
| `list.*, listbox.*, field.*` | The list, the list box and the field. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V[]>` | `[]` | The values of the selected items. `x-model` binds them, and every change writes a new array. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server. |
| `textField, valueField, iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | Same as ListBox. Groups apply to in-memory items. |
| `placeholder` | `Bind<string>` | `''` | Displayed when no item is selected. |
| `searchMode, minSearchLength, searchDelay` |  | `'contains'`, `0`, `0` / `250` | How and when typed text searches, as in ComboBox. |
| `acceptCustomValue` | `Bind<boolean>` | `false` | Pressing Enter adds text that matches no item as a custom tag. |
| `customValue` | `Bind<(text) => V \| null>` | The text | Creates the value for typed text. Returning `null` rejects it. |
| `autoHighlight` | `Bind<boolean>` | `true` (`false` with `acceptCustomValue`) | Highlights the first match while typing, so Enter accepts it. |
| `closeOnSelect` | `Bind<boolean>` | `false` | Closes the list when an item is selected. |
| `maxTags` | `Bind<number>` | `0` | The number of tags shown. The rest are counted in a “+3” tag. `0` shows all. |
| `maxSelected` | `Bind<number>` | `0` | The maximum number of selectable items. At the limit, the others cannot be selected. `0` means no limit. |
| `selectAll` | `Bind<boolean>` | `false` | Adds a "Select all" row before the items. |
| `hideSelected` | `Bind<boolean>` | `false` | Removes selected items from the list (in-memory items only). |
| `openOnFieldClick` | `Bind<boolean>` | `true` | Clicking the field opens the list. |
| `showDropDownButton, clearButton` | `Bind<boolean>` | `true`, `false` | The arrow that opens all items, and the button that removes all tags. |
| `itemTemplate, tagTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Customizes how a list item or a tag is drawn. |
| `matchWidth` | `Bind<boolean>` | `true` | The list is at least as wide as the field. |
| `label, labelMode, helpText, hint, prefix, icon, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | Field props shared by all editors. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `selectedItems` | read-only, reactive | The known items for the selected values. With a data source, the others are looked up by key. |
| `listItems` | read-only | The `DataItems` shown in the list, which are the results of the last search. |
| `opened` | read/write, reactive | Indicates whether the list is open. Set it to open or close the list. |
| `inputElement` | read-only | The text input. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(), close()` | `boolean`, `void` | Opens the list (returns `false` when disabled or read-only), or closes it. |
| `clear()` | `void` | Removes all tags. |
| `selectAllItems()` | `Promise<void>` | Selects every item the list shows, up to `maxSelected` (with a data source, after their values load). |
| `refresh()` | `void` | Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The tags, the open list and `selectedItems` update. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onOpened()` | Occurs when the list opens. |
| `onClosed(reason)` | Occurs when the list closes. The reason is `'escape'`, `'outside'`, `'focus'` or `'code'`. |
| `onValidated(e)` | See TextBox. |

## Feedback

Loading issues…

## Example files

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TagBox } from '@motifx-community/ui';
import { skills } from './skills';

/** A tag box bound to an array with x-model, and tag boxes created with `new` and added programmatically. */
export default function Programmatic() {
  const form = reactive({ skills: ['TypeScript', 'CSS'] as string[], result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const tags = new TagBox<string, string>({ label: `Skills ${++added}`, items: skills, placeholder: 'Pick some' });
    tags.onValueChanged((e) => (form.result = `${tags.label}: ${e.value.join(', ')}`));
    host?.controls.add(tags);
    tags.focus();
  };

  return (
    <>
      <TagBox label="&Skills" items={skills} x-model={() => form.skills} stretch />
      <Stack orientation="horizontal" wrap align="center">
        <output class="tg-skills">{() => `skills: ${JSON.stringify(form.skills)}`}</output>
        <Button text="Add a tag box programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="tg-made">{() => form.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

`skills.ts`

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

`Validation.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TagBox, ValidationGroup } from '@motifx-community/ui';
import { skills } from './skills';

/** A required tag box checked in a group, and the read-only and disabled states. */
export default function Validation() {
  const s = reactive({ reviewers: [] as string[], result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Fine.' : 'Pick a reviewer.';
  };

  return (
    <>
      <TagBox label="Reviewers" items={skills} required validationGroup={group} x-model={() => s.reviewers} />
      <TagBox label="Read-only" items={skills} value={['Go', 'Rust']} readOnly />
      <TagBox label="Disabled" items={skills} value={['Go', 'Rust']} enabled={false} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Check" variant="outline" onclick={check} />
        <output class="tg-check">{() => s.result}</output>
      </Stack>
    </>
  );
}
```

`Localization.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, TagBox, uiLocale } from '@motifx-community/ui';
import { skills } from './skills';

/** Switches the texts of every tag box on the page: remove buttons, “+3”, “Select all”. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <TagBox label="Skills" items={skills} value={['CSS', 'Go', 'HTML', 'Rust']} maxTags={2} selectAll clearButton />
    </>
  );
}
```
