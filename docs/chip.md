# Chip and ChipGroup

> Display · @motifx-community/ui 0.1.0-beta.8

A compact element with short text and an optional leading icon or avatar. Use it as a filter, as a choice among a few options, or to represent a selected item that can be removed. A group handles single or multiple selection and arrow key navigation.

## Import

```tsx
import { Chip, ChipGroup } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Chip, Stack } from '@motifx-community/ui';

/** A chip in JSX tracks its functions, and one created with `new` accepts the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ vegan: false });
  const coded = new Chip({ text: 'Spicy', selectable: true });

  return (
    <Stack orientation="horizontal" wrap align="center">
      <Chip text="Vegan" selectable selected={() => s.vegan} onSelectedChanged={(e) => (s.vegan = e.selected)} />
      <span>{() => (s.vegan ? 'Vegan only' : 'Everything')}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Appearance and states

```tsx
import { Chip, Stack, type ChipVariant } from '@motifx-community/ui';

const VARIANTS: ChipVariant[] = ['filled', 'outline'];

// An inline star, so that the example needs no icon set.
const star = () => (
  <svg viewBox="0 0 16 16">
    <path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor" />
  </svg>
);

/** Each appearance: at rest, selected, with an icon, with an avatar, removable and disabled. */
export default function Looks() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          <Chip text="Rest" variant={variant} clickable />
          <Chip text="Selected" variant={variant} selectable selected />
          <Chip text="Icon" variant={variant} icon={star()} clickable />
          <Chip text="Ada Lovelace" variant={variant} avatar={{ name: 'Ada Lovelace' }} removable />
          <Chip text="Removable" variant={variant} removable />
          <Chip text="Disabled" variant={variant} selectable disabled />
        </Stack>
      ))}
    </Stack>
  );
}
```

## Tones

```tsx
import { Chip, Stack, type ChipTone, type ChipVariant } from '@motifx-community/ui';

const TONES: ChipTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const VARIANTS: ChipVariant[] = ['filled', 'outline'];

/** Every tone in each appearance. */
export default function Tones() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Chip key={tone} text={tone} tone={tone} variant={variant} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
```

## Sizes

```tsx
import { Chip, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** Each size, plain, with an avatar and removable. */
export default function Sizes() {
  return (
    <Stack>
      {SIZES.map((size) => (
        <Stack key={size} orientation="horizontal" wrap align="center">
          <Chip text={size} size={size} selectable />
          <Chip text="Grace Hopper" size={size} avatar={{ name: 'Grace Hopper' }} removable />
        </Stack>
      ))}
    </Stack>
  );
}
```

## Selection in a group

`selection` turns chips into selectable options. `value` holds their values, and `onValueChanged` reports changes.

```tsx
import { reactive } from '@motifx/core';
import { Chip, ChipGroup, Stack } from '@motifx-community/ui';

const DIETS = ['Vegan', 'Vegetarian', 'Gluten free', 'Dairy free'];
const SIZES = ['Small', 'Medium', 'Large'];

/** Several chosen (filters, bound with `x-model`) and one chosen (`value` and `onValueChanged`); the value is the chips' values. */
export default function Groups() {
  const s = reactive({ diets: ['Vegan'] as unknown, size: 'Medium' as unknown });

  return (
    <Stack gap="lg">
      <ChipGroup selection="multiple" label="Diet" x-model={() => s.diets}>
        {DIETS.map((diet) => (
          <Chip key={diet} text={diet} />
        ))}
      </ChipGroup>
      <span>{() => `Diet: ${(s.diets as string[]).join(', ') || 'any'}`}</span>
      <ChipGroup selection="single" label="Size" value={() => s.size} onValueChanged={(e) => (s.size = e.value)}>
        {SIZES.map((size) => (
          <Chip key={size} text={size} />
        ))}
      </ChipGroup>
      <span>{() => `Size: ${s.size ?? 'none'}`}</span>
    </Stack>
  );
}
```

## Removing chips

A removable chip only sends a request. Remove the item from your list in `onRemove`, and the group updates to match.

```tsx
import { reactive } from '@motifx/core';
import { Button, Chip, ChipGroup, Stack } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra'];

/** Your code performs the removal: `onRemove` removes the person from the list, and the group updates to match. */
export default function Removing() {
  const s = reactive({ people: PEOPLE.map((name) => ({ name })) });

  return (
    <Stack>
      <ChipGroup label="Invited">
        {s.people.map((person) => (
          <Chip
            key={person.name}
            text={person.name}
            avatar={{ name: person.name }}
            removable
            onRemove={() => s.people.splice(s.people.indexOf(person), 1)}
          />
        ))}
      </ChipGroup>
      <Button text="Invite everyone again" variant="outline" onclick={() => s.people.splice(0, s.people.length, ...PEOPLE.map((name) => ({ name })))} />
    </Stack>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Enter, Space` | Presses the chip, which toggles a selectable chip or selects one in a group. |
| `Delete, Backspace` | Requests removal of a removable chip. |
| `Arrow keys, Home, End` | In a group, moves between the chips. The group has one Tab stop, on the chip focused last. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Selectable` | A button with `aria-pressed`. |
| `In a group that selects` | The group is a `listbox` (`aria-multiselectable` for multiple selection), and each chip is an `option` with `aria-selected`. |
| `Remove` | The remove button is named “Remove Ada” in the kit language. Keyboard users reach it with Delete on the chip. |
| `Disabled state` | Removed from the Tab order and marked with `aria-disabled`. |

## Localization

The remove button's name is the `removeItem` kit string (“Remove {text}”) and changes with the kit language (`uiLocale`).

## Styling

| Hook | Description |
| --- | --- |
| `.mx-chip` | The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`. |
| `.mx-chip__check, .mx-chip__icon, .mx-chip__avatar` | The content before the text. |
| `.mx-chip__text, .mx-chip__remove` | The text and the remove button. |
| `.mx-chip-group` | The group. `data-wrap`. |

### Component tokens

| Token | Description |
| --- | --- |
| `chip.chip` | Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), and `selected`, `hover`, `pressed`, `focus` and `disabled`. |
| `chip.icon, chip.remove` | Units: the icon or check mark, and the remove button (`hover`, `pressed`). |
| `chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*` | The chip, its text and its spacing, per size. |
| `chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*` | The content before and after the text, per size. An avatar and the remove button have the same inset from the edge as from the top and bottom. |
| `chip.variant, chip.check` | The default appearance, and whether a selected chip shows a check mark (Material). |
| `chip-group.gap` | The space between chips. |

## API reference

### Chip props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The text. |
| `value` | `Bind<unknown>` | Its text | The value it represents in a group. |
| `icon` | `Bind<IconSource \| null>` | `null` | An icon before the text: an image address or a component. |
| `avatar` | `Bind<AvatarProps \| null>` | `null` | An avatar before the text (its props; the chip sets the size). |
| `selectable` | `Bind<boolean>` | `false` | Pressing the chip toggles it, as a filter. In a group with selection, the group controls it. |
| `selected` | `Bind<boolean>` | `false` | Indicates whether the chip is on. |
| `clickable` | `Bind<boolean>` | `false` | Lets the chip be pressed like a button (`onclick`). |
| `removable` | `Bind<boolean>` | `false` | Adds a remove button after the text. The button, Delete and Backspace raise `onRemove`. |
| `variant` | `Bind<ChipVariant>` | Set by the design language | `filled` or `outline`. Material draws chips outlined, and the other design languages draw them filled. |
| `tone` | `Bind<ChipTone>` | `'standard'` | `standard`, `accent`, `info`, `success`, `caution` or `danger`. A selected chip shows the selection color instead. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `enabled, visible, tabStop` | see Control |  | Properties shared by all controls. |

### Chip events

| Event | Arguments | Description |
| --- | --- | --- |
| `onRemove` | `ChipRemoveEventArgs` | Occurs when the user requests removal (`byKeyboard`). Your code performs the removal. |
| `onSelectedChanged` | `ChipSelectedChangedEventArgs` | Occurs when the chip is turned on or off (`selected`), either by the user or programmatically (`byUser`). |

### Chip properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `avatarControl` | read-only | The avatar before the text, if there is one. |

### Chip methods

| Method | Returns | Description |
| --- | --- | --- |
| `remove()` | `void` | Requests removal, as the remove button does (raises `onRemove`). |

### ChipGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selection` | `Bind<ChipGroupSelection>` | `'none'` | `none`, `single`, `multiple`. |
| `value` | `Bind<unknown>` | `null` / `[]` | The value of the selected chip (`single`), or an array of selected values (`multiple`). A change produces a new array. `x-model` provides two-way binding. |
| `wrap` | `Bind<boolean>` | `true` | `false` keeps the chips on one line that scrolls. |
| `label` | `Bind<string>` | `''` | The accessible name of the group (“Diet”). |

### ChipGroup events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `onValueChanged` | event | Occurs when the value changes (`value`), either through user input or programmatically (`byUser`). |
| `chips` | read-only | The chips in order, including those from JSX lists. |
| `isSelected(value)` | `boolean` | Indicates whether the chip for `value` is selected. |

## Feedback

Loading issues…
