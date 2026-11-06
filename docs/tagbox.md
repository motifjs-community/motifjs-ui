# TagBox

> Data · @motifx-community/ui 0.1.0-beta.3

Picks several items. The chosen ones are tags in the field, followed by a text input that searches the list; items come from memory or from a data source, and typed text can become a tag of its own.

## Import

```tsx
import { TagBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
```

## Declarative and programmatic

`x-model` binds an array; every change writes a new one. Created with `new`, the same properties are set programmatically.

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

## The list

The list keeps open while you choose, shows the chosen items checked and can have a “Select all” row. Each switch is a prop you can bind.

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

With `dataSource` the typed text searches the data source (its `searchFields`). In `'blocks'` mode only the rows in view load; the tags of values on no loaded page are found by key. `maxTags` keeps the field short. This one holds 5,000 customers.

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

## Tags of your own

With `acceptCustomValue`, Enter adds text that matches no item as a tag; `customValue` shapes it or turns it down. `tagTemplate` draws a tag your way.

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

| Key | What it does |
| --- | --- |
| `Typing` | Searches and opens the list; the first match is highlighted. |
| `Down / Up, Alt + Down` | Open the list with every item; move in it. |
| `Enter` | Choose the highlighted item or let it go; the list stays open. With `acceptCustomValue`, text that matches no item becomes a tag. |
| `Backspace in an empty input` | Remove the last tag. |
| `Left at the start of the input` | Go to the last tag. |
| `On a tag: Left, Right, Home, End` | Move between the tags; Right on the last one and End go back to the input. |
| `On a tag: Delete, Backspace` | Remove it. |
| `Escape` | Close the list; closed, empty the text; then, with `clearButton`, remove every tag. |
| `Alt + Up, Tab` | Close the list. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pattern` | The APG combobox with a multi-select listbox: the input is `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`; the list is `aria-multiselectable`. |
| `Highlight` | `aria-activedescendant` names the highlighted option; focus stays in the input. |
| `Tags` | A `role="list"` of `role="listitem"`s; each has a remove button named “Remove …” from `uiLocale`, and the “+3” tag lists the rest in its title. |
| `Name` | The label names the input; help and errors describe it. |

## Localization

The remove buttons (`removeItem`, “Remove {text}”), the “+3” tag (`moreItems`), “Select all”, the buttons and the list texts come from `uiLocale.strings`.

```tsx
/** The skills the tag boxes of the examples pick from. */
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-tag-box` | Added to the field. `data-open`, `data-text` while text is typed; the field attributes of TextBox. |
| `.mx-tag-box__tags, .mx-tag-box__tag, .mx-tag-box__tag-text, .mx-tag-box__remove` | The tags, one tag (`data-loading` while its item is asked for), its text, its remove button. |
| `.mx-tag-box__more` | The “+3” tag. |
| `.mx-tag-box__input, .mx-tag-box__arrow, .mx-tag-box__clear` | The text input and the buttons. |
| `.mx-tag-box__popup, .mx-list…` | The popup and the shared list. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `tagbox.tag, tagbox.tag-text` | Units: a tag (`more`: the "+N" tag, `loading`, `focus`, `hover`, `fixed`, `disabled`) and its text. |
| `tagbox.remove, tagbox.remove-glyph` | Units: a tag's remove button (`hover`, `pressed`) and its glyph. |
| `tagbox.box, tagbox.tags, tagbox.arrow, tagbox.arrow-glyph` | Units: the box's space round the tags, the tags together, and the arrow that opens the list (`open`). |
| `tagbox.inset, tagbox.input-min-width` | The space between the tags and the field's edge; the narrowest the input gets before it goes to the next line. |
| `list.*, listbox.*, field.*` | The list, the list box and the field. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<V[]>` | `[]` | The values of the chosen items. `x-model` binds it; every change writes a new array. |
| `items / dataSource` | `Bind<readonly T[]>` / `Bind<DataSource \| null>` | — | Items in memory, searched here, or a data source of `@motifx-community/data`, searched where it lives. |
| `textField, valueField, iconField, groupField, enabledField` | `Bind<ItemField<T>>` | — | As for ListBox; groups for items in memory. |
| `placeholder` | `Bind<string>` | `''` | Shown while nothing is chosen. |
| `searchMode, minSearchLength, searchDelay` |  | `'contains'`, `0`, `0` / `250` | How and when the typed text searches, as for ComboBox. |
| `acceptCustomValue` | `Bind<boolean>` | `false` | Enter adds text that matches no item as a tag of its own. |
| `customValue` | `Bind<(text) => V \| null>` | the text | Makes the value of a typed text; `null` turns it down. |
| `autoHighlight` | `Bind<boolean>` | `true` (`false` with `acceptCustomValue`) | The first match is highlighted while typing, so Enter takes it. |
| `closeOnSelect` | `Bind<boolean>` | `false` | Choosing an item closes the list. |
| `maxTags` | `Bind<number>` | `0` | Tags shown; the rest are counted in one more tag, “+3”. `0` shows all. |
| `maxSelected` | `Bind<number>` | `0` | Items that can be chosen at most; at the limit the others cannot be chosen. `0`: no limit. |
| `selectAll` | `Bind<boolean>` | `false` | A "Select all" row before the items. |
| `hideSelected` | `Bind<boolean>` | `false` | Chosen items leave the list (items in memory). |
| `openOnFieldClick` | `Bind<boolean>` | `true` | A press on the field opens the list. |
| `showDropDownButton, clearButton` | `Bind<boolean>` | `true`, `false` | The arrow that opens every item; the button that removes every tag. |
| `itemTemplate, tagTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Draws an item of the list / a tag your way. |
| `matchWidth` | `Bind<boolean>` | `true` | The list is at least as wide as the field. |
| `label, labelMode, helpText, hint, prefix, icon, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup` | see TextBox |  | The field props every editor has. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `selectedItems` | read-only, reactive | The items of the chosen values that are known; with a data source the others are found by key. |
| `listItems` | read-only | The `DataItems` the list shows (what the last search matched). |
| `opened` | read/write, reactive | Whether the list is open; setting it opens or closes it. |
| `inputElement` | read-only | The text input. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(), close()` | `boolean`, `void` | Opens the list (`false` when disabled or read-only); closes it. |
| `clear()` | `void` | Removes every tag. |
| `selectAllItems()` | `Promise<void>` | Chooses every item the list shows, up to `maxSelected` (a data source: after their values load). |
| `refresh()` | `void` | Your items may be plain or reactive; the box reads them as they are. After changing them in place, call `refresh()`. The tags, the open list and `selectedItems` follow. |
| `validate(), resetValidation(), focus()` |  | See TextBox. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }` |
| `onOpened()` | The list opened. |
| `onClosed(reason)` | The list closed: `'escape'`, `'outside'`, `'focus'` or `'code'`. |
| `onValidated(e)` | See TextBox. |

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
