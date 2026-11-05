# ButtonGroup

> Buttons · @motifx-community/ui 0.1.0-beta.2

Buttons that belong together: a segmented choice of one or several, or a row of actions. The buttons are the kit’s own, touching by default.

## Import

```tsx
import { ButtonGroup } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Stack } from '@motifx-community/ui';

/** One choice bound with `x-model`; a group made with `new` takes the same properties from code. */
export default function FromCode() {
  const s = reactive({ view: 'Week' as unknown });
  const coded = new ButtonGroup({ label: 'Density', items: ['Compact', 'Comfortable'], value: 'Compact' });

  return (
    <Stack gap="lg">
      <ButtonGroup label="View" items={['Day', 'Week', 'Month']} x-model={() => s.view} />
      <span>{() => `View: ${s.view}`}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Several, or only actions

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Stack } from '@motifx-community/ui';

const MARKS = [
  { value: 'bold', text: 'Bold' },
  { value: 'italic', text: 'Italic' },
  { value: 'underline', text: 'Underline' },
];

/** Several on and off (`multiple`), and plain actions (`none`, `onItemClick`). */
export default function Selections() {
  const s = reactive({ marks: ['bold'] as unknown, last: '' });

  return (
    <Stack gap="lg">
      <ButtonGroup label="Text marks" selection="multiple" items={MARKS} x-model={() => s.marks} />
      <span>{() => `Marks: ${(s.marks as string[]).join(', ') || 'none'}`}</span>
      <ButtonGroup label="Clipboard" selection="none" items={['Cut', 'Copy', 'Paste']} onItemClick={(e) => (s.last = String(e.value))} />
      <span>{() => (s.last ? `Pressed: ${s.last}` : 'Nothing pressed yet')}</span>
    </Stack>
  );
}
```

## Sizes and layout

```tsx
import { ButtonGroup, Stack, type ButtonSize } from '@motifx-community/ui';

const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const ITEMS = ['One', 'Two', { value: 'Three', enabled: false }, 'Four'];

/** Each size; apart instead of touching; filling the width; and one button disabled. */
export default function Looks() {
  return (
    <Stack gap="lg">
      {SIZES.map((size) => (
        <ButtonGroup key={size} label={`Size ${size}`} size={size} items={ITEMS} value="Two" />
      ))}
      <ButtonGroup label="Apart" attached={false} items={ITEMS} value="One" />
      <ButtonGroup label="Stretched" stretch items={['Left', 'Center', 'Right']} value="Center" />
    </Stack>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | One stop: the button focused last, else the chosen one, else the first. |
| `Arrow keys, Home, End` | Move between the buttons (disabled ones are skipped). |
| `Space, Enter` | Press the button: choose it, turn it on or off, or do its action. |

## Accessibility

| Topic | How |
| --- | --- |
| `Group` | `role="group"` with its label. |
| `Buttons` | Kit buttons; with a selection each says whether it is on (`aria-pressed`). A button with only an icon is named by its `hint`. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-button-group` | The group. `data-attached`, `data-stretch`. |
| `.mx-button-group__item` | Each button (a `.mx-button`). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `button-group.item.*` | Place: each button’s look in a group (`variant`) and the look of the chosen one (`face.*-toggled.*`). |
| `button-group.inner-start.*, button-group.inner-end.*` | Places: the corners where two buttons touch. |
| `button-group.attached, button-group.gap` | Whether buttons touch when not told, and the space between them when they do not. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (ButtonGroupItem<T> \| T)[]>` | `[]` | The buttons: `ButtonGroupItem`s (`value`, `text`, `icon`, `hint`, `enabled`, `visible`), plain values (each its own text), or objects of your own shape. |
| `itemText, itemValue` | `ItemField` | `'text'`, `'value'` | Where an item of your own shape keeps its text and its value: a property name or a function. |
| `selection` | `Bind<ButtonGroupSelection>` | `'single'` | `single`: one of them; `multiple`: each on and off; `none`: only actions. |
| `value` | `Bind<T \| readonly T[] \| null>` | `null` / `[]` | The chosen value, or an array of the values turned on. Two-way with `x-model`; a change gives a new array. |
| `allowEmpty` | `Bind<boolean>` | `false` | `single`: pressing the chosen button again leaves none chosen. |
| `attached` | `Bind<boolean>` | the language’s (`true`) | The buttons touch, sharing their edges. |
| `variant` | `Bind<ButtonVariant>` | the language’s (`outline`) | The look of every button. |
| `size` | `Bind<ButtonSize>` | `'md'` | `sm`, `md`, `lg`. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width, the buttons sharing it. |
| `label` | `Bind<string>` | `''` | What screen readers call the group (“Text alignment”). |
| `enabled, visible` | see Control |  | The shared properties of every control. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onValueChanged` | event | The value changed (`value`), by the user or by code (`byUser`). |
| `onItemClick` | event | A button was pressed (`item`, `value`), with any selection. |
| `buttons` | read-only | The kit buttons of the group, in the order of the items. |
| `isSelected(value)` | `boolean` | Whether the button of `value` is chosen or on. |
| `refresh()` | `void` | Reads the items again after they were changed in place. |
