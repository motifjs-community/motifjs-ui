# Chip and ChipGroup

> Display · @motifx-community/ui 0.1.0-beta.1

A short text with an icon or an avatar before it: a filter to turn on, a choice among a few, or something picked that can be removed. A group selects one or several and moves between them with the arrow keys.

## Import

```tsx
import { Chip, ChipGroup } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Chip, Stack } from '@motifx-community/ui';

/** A chip from JSX follows its functions; one made with `new` takes the same properties from code. */
export default function FromCode() {
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

## Looks and states

```tsx
import { Chip, Stack, type ChipVariant } from '@motifx-community/ui';

const VARIANTS: ChipVariant[] = ['filled', 'outline'];

// A small star of our own, so the example needs no icon set.
const star = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.innerHTML = '<path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor"/>';
  return svg;
};

/** Each look: at rest, selected, with an icon, with an avatar, removable, disabled. */
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

/** Every tone in each look. */
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

## Choosing in a group

`selection` makes the chips choices; `value` holds their values and `onValueChanged` tells a change.

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

## Removing

A removable chip only asks: `onRemove` is where your list loses the item, and the group follows the list.

```tsx
import { reactive } from '@motifx/core';
import { Button, Chip, ChipGroup, Stack } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra'];

/** Removing is yours to do: `onRemove` takes the person out of the list, and the group follows the list. */
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

| Key | What it does |
| --- | --- |
| `Enter, Space` | Presses the chip: turns a selectable one on or off, selects one in a group. |
| `Delete, Backspace` | Asks to remove a removable chip. |
| `Arrow keys, Home, End` | In a group: move between the chips. Tab stops once on the group, at the chip focused last. |

## Accessibility

| Topic | How |
| --- | --- |
| `Selectable` | A button with `aria-pressed`. |
| `In a group that selects` | The group is a `listbox` (`aria-multiselectable` for several), each chip an `option` with `aria-selected`. |
| `Remove` | The remove button is named “Remove Ada” in the kit language; the keyboard reaches it through Delete on the chip. |
| `Disabled` | Out of the Tab order and marked `aria-disabled`. |

## Localization

The remove button’s name is the kit text `removeItem` (“Remove {text}”) and changes with the kit language (`uiLocale`).

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-chip` | The chip. `data-size`, `data-variant`, `data-selected`, `data-pressable`, `data-removable`, `data-lead`, `data-check`, `data-disabled`. |
| `.mx-chip__check, .mx-chip__icon, .mx-chip__avatar` | What stands before the text. |
| `.mx-chip__text, .mx-chip__remove` | The text, and the remove button. |
| `.mx-chip-group` | The group. `data-wrap`. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `chip.chip` | Unit: the chip, filled at rest, then `outline`, each tone filled and outlined (`accent` … `danger`, `outline-*`), `selected`, `hover`, `pressed`, `focus`, `disabled`. |
| `chip.icon, chip.remove` | Units: the icon or check mark; the remove button (`hover`, `pressed`). |
| `chip.height.*, chip.font-size.*, chip.padding.*, chip.icon-inset.*, chip.gap.*` | The chip, its text and its spaces, per size. |
| `chip.icon-size.*, chip.avatar-size.*, chip.remove-size.*` | What stands before and after the text, per size. An avatar and the remove button sit as far in from the edge as from the top and bottom. |
| `chip.variant, chip.check` | The look a chip takes when none is given; whether a selected chip shows a check mark (Material). |
| `chip-group.gap` | The space between chips. |

## API reference

### Chip props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The text. |
| `value` | `Bind<unknown>` | its text | What it stands for in a group’s value. |
| `icon` | `Bind<IconSource \| null>` | `null` | An icon before the text: an image address, an element or a component. |
| `avatar` | `Bind<AvatarProps \| null>` | `null` | An avatar before the text (its props; the chip sets its size). |
| `selectable` | `Bind<boolean>` | `false` | Pressed, it turns on and off (a filter). In a group that selects, the group decides. |
| `selected` | `Bind<boolean>` | `false` | Whether it is on. |
| `clickable` | `Bind<boolean>` | `false` | It can be pressed like a button (`onclick`). |
| `removable` | `Bind<boolean>` | `false` | A remove button after the text; it and Delete / Backspace raise `onRemove`. |
| `variant` | `Bind<ChipVariant>` | the language’s | `filled`, `outline`. Material draws chips outlined, the other languages filled. |
| `tone` | `Bind<ChipTone>` | `'standard'` | `standard`, `accent`, `info`, `success`, `caution`, `danger`; a selected chip shows the selection instead. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `enabled, visible, tabStop` | see Control |  | The shared properties of every control. |

### Chip events

| Event | Arguments | Description |
| --- | --- | --- |
| `onRemove` | `ChipRemoveEventArgs` | The user asked to remove it (`byKeyboard`); removing it is yours to do. |
| `onSelectedChanged` | `ChipSelectedChangedEventArgs` | It was turned on or off (`selected`), by the user or by code (`byUser`). |

### Chip properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `avatarControl` | read-only | The avatar before the text, when it has one. |

### Chip methods

| Method | Returns | Description |
| --- | --- | --- |
| `remove()` | `void` | Asks for it to be removed, as its remove button does (raises `onRemove`). |

### ChipGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selection` | `Bind<ChipGroupSelection>` | `'none'` | `none`, `single`, `multiple`. |
| `value` | `Bind<unknown>` | `null` / `[]` | The selected chip’s value (`single`), or an array of the selected ones’ values (`multiple`). A change gives a new array. Two-way with `x-model`. |
| `wrap` | `Bind<boolean>` | `true` | `false` keeps the chips on one line that scrolls. |
| `label` | `Bind<string>` | `''` | What screen readers call the group (“Diet”). |

### ChipGroup events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `onValueChanged` | event | The value changed (`value`), by the user or by code (`byUser`). |
| `chips` | read-only | The chips in it, in order, from JSX lists too. |
| `isSelected(value)` | `boolean` | Whether the chip of `value` is selected. |
