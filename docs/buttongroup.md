# ButtonGroup

> Buttons · @motifx-community/ui 0.1.0-beta.3

A set of related buttons, used as a segmented selection of one or more options or as a row of actions. The buttons are standard kit buttons and are attached by default.

## Import

```tsx
import { ButtonGroup } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Stack } from '@motifx-community/ui';

/** One choice bound with `x-model`; a group made with `new` takes the same properties programmatically. */
export default function Programmatic() {
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

## Multiple selection and action groups

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

| Key | Description |
| --- | --- |
| `Tab` | One Tab stop: the button focused last, otherwise the selected one, otherwise the first. |
| `Arrow keys, Home, End` | Moves between the buttons, skipping disabled ones. |
| `Space, Enter` | Presses the button, which selects it, toggles it or runs its action. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Group` | `role="group"` with its label. |
| `Buttons` | Kit buttons. With a selection, each one reports whether it is on (`aria-pressed`). An icon-only button is named by its `hint`. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-button-group` | The group. `data-attached`, `data-stretch`. |
| `.mx-button-group__item` | Each button (a `.mx-button`). |

### Component tokens

| Token | Description |
| --- | --- |
| `button-group.item.*` | Place: the appearance of each button in a group (`variant`) and of the selected one (`face.*-toggled.*`). |
| `button-group.inner-start.*, button-group.inner-end.*` | Places: the corners where two buttons meet. |
| `button-group.attached, button-group.gap` | Whether buttons are attached by default, and the gap between them when they are not. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly (ButtonGroupItem<T> \| T)[]>` | `[]` | The buttons: `ButtonGroupItem` objects (`value`, `text`, `icon`, `hint`, `enabled`, `visible`), plain values that serve as their own text, or objects of any shape. |
| `itemText, itemValue` | `ItemField` | `'text'`, `'value'` | The location of the text and value in a custom object: a property name or a function. |
| `selection` | `Bind<ButtonGroupSelection>` | `'single'` | `single` selects one button, `multiple` toggles each button, and `none` makes them actions only. |
| `value` | `Bind<T \| readonly T[] \| null>` | `null` / `[]` | The selected value, or an array of the values that are on. `x-model` provides two-way binding, and each change produces a new array. |
| `allowEmpty` | `Bind<boolean>` | `false` | With `single`, pressing the selected button again clears the selection. |
| `attached` | `Bind<boolean>` | Set by the design language (`true`) | The buttons are attached and share their edges. |
| `variant` | `Bind<ButtonVariant>` | Set by the design language (`outline`) | The appearance of every button. |
| `size` | `Bind<ButtonSize>` | `'md'` | `sm`, `md`, `lg`. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width, with the buttons sharing it evenly. |
| `label` | `Bind<string>` | `''` | The accessible name of the group (“Text alignment”). |
| `enabled, visible` | see Control |  | Properties shared by all controls. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onValueChanged` | event | Occurs when the value changes (`value`), either through user input or programmatically (`byUser`). |
| `onItemClick` | event | Occurs when a button is pressed (`item`, `value`), with any selection mode. |
| `buttons` | read-only | The kit buttons in the group, in item order. |
| `isSelected(value)` | `boolean` | Indicates whether the button for `value` is selected or on. |
| `refresh()` | `void` | Re-reads the items after they have been changed in place. |
