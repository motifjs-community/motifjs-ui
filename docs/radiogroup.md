# RadioGroup

> Choice · @motifx-community/ui 0.1.0-beta.4

A set of mutually exclusive options. Options can come from plain values, custom objects or a live list, and can be arranged vertically, horizontally or in columns. Individual options can be disabled, hidden or given help text. The group is a single Tab stop, and the arrow keys move between options.

## Import

```tsx
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
```

## Declarative and programmatic

A plain value serves as its own text. `x-model` provides two-way binding for the selected value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

/** A group of plain values bound with x-model, and a group created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ size: 'M' as string | null, result: '' });
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const wrap = new RadioGroup<string>({ label: 'Gift wrap', orientation: 'horizontal', items: ['None', 'Paper', 'Box'], value: 'None' });
    wrap.onValueChanged((e) => (s.result = `Gift wrap: ${e.value}`));
    host?.controls.add(wrap);
    wrap.focus();
  };

  return (
    <>
      <RadioGroup label="&Size" items={['S', 'M', 'L', 'XL']} x-model={() => s.size} helpText={() => `Chosen: ${s.size ?? 'nothing'}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a group programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="rg-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Binding to data

Custom objects use `itemText` and `itemValue`, each a property name or a function. Items can be plain or reactive and are read as they are. After adding, removing or renaming items in place, call `refresh()` to update the display, which preserves focus and selection.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

interface Plan {
  id: number;
  name: string;
  price: number;
}

/** Options from a list of custom objects. After adding or changing some in place, `refresh()` shows them. */
export default function FromData() {
  const s = reactive({ plan: 2 as number | null });
  const plans = reactive<Plan[]>([
    { id: 1, name: 'Free', price: 0 },
    { id: 2, name: 'Pro', price: 12 },
    { id: 3, name: 'Team', price: 30 },
  ]);

  let group!: RadioGroup<number>;
  const addPlan = () => {
    plans.push({ id: plans.length + 1, name: `Plan ${plans.length + 1}`, price: plans.length * 20 });
    group.refresh();
  };
  const raisePrices = () => {
    for (const p of plans) p.price += 1;
    group.refresh();
  };

  return (
    <>
      <RadioGroup
        ref={(g: RadioGroup<number>) => (group = g)}
        label="&Plan"
        class="rg-plans"
        items={() => plans}
        itemText={(p) => `${(p as Plan).name} — ${(p as Plan).price} €`}
        itemValue="id"
        x-model={() => s.plan}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a plan" variant="outline" enabled={() => plans.length < 6} onclick={addPlan} />
        <Button text="Raise prices" variant="outline" onclick={raisePrices} />
        <output class="rg-plan">{() => `value: ${String(s.plan)}`}</output>
      </Stack>
    </>
  );
}
```

## Disabled options, help text and hints

A `RadioItem` has its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip options that cannot be selected.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, type RadioItem } from '@motifx-community/ui';

/** Options with their own help line and hint, and one that is enabled only while state allows it. */
export default function OptionDetails() {
  const s = reactive({ shipping: 'std' as string | null, expressOpen: false });
  const shipping: RadioItem<string>[] = [
    { value: 'std', text: 'Standard', helpText: '3–5 working days', hint: 'Free over 50 €' },
    { value: 'exp', text: 'Express', helpText: () => (s.expressOpen ? 'Tomorrow' : 'Not before the weekend'), enabled: () => s.expressOpen },
    { value: 'pick', text: 'Pick up in store', helpText: 'Ready in 2 hours' },
  ];

  return (
    <>
      <Button text={() => (s.expressOpen ? 'Close express' : 'Open express')} variant="outline" onclick={() => (s.expressOpen = !s.expressOpen)} />
      <RadioGroup label="S&hipping" class="rg-shipping" items={shipping} x-model={() => s.shipping} />
    </>
  );
}
```

## Orientation and columns

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, type RadioGroupOrientation } from '@motifx-community/ui';

const ORIENTATIONS: RadioGroupOrientation[] = ['vertical', 'horizontal'];
const COLUMNS = [0, 2, 4];
const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'violet'];

/** Options one under the other or side by side, and in columns. */
export default function Layout() {
  const s = reactive({ orientation: 'vertical' as RadioGroupOrientation, columns: 0, color: 'teal' as string | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Layout">
        {ORIENTATIONS.map((o) => (
          <Button
            key={o}
            text={o}
            size="sm"
            variant={() => (s.orientation === o ? 'solid' : 'ghost')}
            aria-pressed={() => s.orientation === o}
            onclick={() => (s.orientation = o)}
          />
        ))}
        {COLUMNS.map((n) => (
          <Button
            key={`c${n}`}
            text={n ? `${n} columns` : 'no grid'}
            size="sm"
            variant={() => (s.columns === n ? 'solid' : 'ghost')}
            aria-pressed={() => s.columns === n}
            onclick={() => (s.columns = n)}
          />
        ))}
      </Stack>
      <RadioGroup label="&Color" class="rg-colors" items={COLORS} orientation={() => s.orientation} columns={() => s.columns} x-model={() => s.color} />
    </>
  );
}
```

## Sizes

```tsx
import { RadioGroup, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A group in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <RadioGroup key={size} label={size} size={size} items={['One', 'Two']} value="Two" />
      ))}
    </>
  );
}
```

## Required, read-only, disabled

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, ValidationGroup } from '@motifx-community/ui';

/** A required choice validated with its group, and read-only and disabled groups that follow state. */
export default function States() {
  const s = reactive({ payment: null as string | null, editable: true, result: '' });
  const group = new ValidationGroup();

  const pay = async () => {
    s.result = (await group.validate()).valid ? 'Paid.' : 'Choose a payment.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup label="Pa&yment" orientation="horizontal" required validationGroup={group} items={['Card', 'Transfer', 'Cash']} x-model={() => s.payment} />
        <Button text="Pay" tone="accent" onclick={pay} />
        <output>{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
        <RadioGroup label="Read-only" readOnly={() => !s.editable} items={['Free', 'Pro']} value="Pro" />
        <RadioGroup label="Disabled" enabled={() => s.editable} items={['Free', 'Pro']} value="Pro" />
      </Stack>
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the group, on the selected option or the first available one. The next Tab leaves the group. |
| `↓ / →` | Moves to the next option and selects it, wrapping from last to first and skipping disabled and hidden options. |
| `↑ / ←` | Moves the same way, backward. On right-to-left pages, ← and → are swapped. |
| `Space` | Selects the focused option. |
| `Alt + key (`&Name`)` | Moves focus to the group (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Group` | `role="radiogroup"` named by the field label (`aria-labelledby`), with `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid`, and `aria-describedby` for the help text. |
| `Options` | Native `<input type="radio">` elements sharing a name, each inside its own `<label>` and drawn with `appearance: none`. |
| `Help text` | An option's `helpText` sits outside its label and is linked with `aria-describedby`, so it is not part of the option's name. |
| `Disabled options` | Native `disabled`: skipped by the keyboard and announced as unavailable. |
| `Focus` | One Tab stop, with the design system focus ring shown only during keyboard use. |

## Localization

The group has no strings of its own. The option text is yours, and functions of your language state work. The `required` message comes from `uiLocale.strings`.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-radio-group` | The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`. |
| `.mx-radio-group__list` | The `radiogroup` element. `columns` sets `--_columns` and `--_rows` on it. |
| `.mx-radio-group__item, .mx-radio-group__label` | An option, and the label that holds its radio and text. |
| `.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help` | The radio, its text and its help text. |

### Component tokens

| Token | Description |
| --- | --- |
| `radiogroup.circle, radiogroup.dot` | Units: the circle in every state (`checked`, `invalid`, `hover`, `pressed`, `focus` and their combinations, `disabled`), and the dot of the selected option (`checked`, `pressed`, `disabled`). |
| `radiogroup.row, radiogroup.text, radiogroup.help` | Units: an option's row (`hover`, `checked`, `disabled`), its text and its help text. |
| `radiogroup.halo, radiogroup.ring` | Units: a halo centered on the circle and a ring around an option during keyboard use, where the design language includes them. |
| `radiogroup.options, radiogroup.floating-label` | Units: the options as a group, and the group label when it floats. |
| `radiogroup.size.*, radiogroup.dot-size.*, radiogroup.dot-size-hover.*, radiogroup.dot-size-pressed.*` | The circle and the dot, per size and state. |
| `radiogroup.height.*, radiogroup.font-size.*` | Row height (density tokens) and text size. |
| `radiogroup.gap, radiogroup.column-gap, radiogroup.help-gap` | The space before the text, between side-by-side options, and above an option's help text. |
| `radiogroup.press-offset, radiogroup.focus-scope` | The distance the circle moves when pressed, and what the keyboard ring surrounds. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<T \| null>` | `null` | The value of the selected item, or `null` if none is selected. `x-model` provides two-way binding. |
| `items` | `Bind<readonly (RadioItem<T> \| T)[]>` | `[]` | The options. A function is tracked, so a new list appears immediately. Items changed in place appear after `refresh()`. |
| `itemText` | `string \| (item) => unknown` | `'text'` | Where a custom object stores its text. This is a reader, not a binding. |
| `itemValue` | `string \| (item) => T` | `'value'` | Where an item stores its value. An object without one serves as its own value. |
| `label` | `Bind<string>` | `''` | The group label. Writing `&Name` makes Alt+N move focus to the group. This is the same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side` (next to the options) or `hidden` (for screen readers only). |
| `orientation` | `Bind<RadioGroupOrientation>` | `'vertical'` | `vertical` stacks the options, and `horizontal` places them side by side and wraps. |
| `columns` | `Bind<number>` | `0` | Arranges the options in a grid with this many columns (down the columns when vertical, across when horizontal). |
| `helpText` | `Bind<string>` | `''` | Help text shown below the group. An error message replaces it. |
| `hint` | `Bind<string>` | `''` | A tooltip on the group. |
| `readOnly` | `Bind<boolean>` | `false` | The arrow keys move between options, but nothing can be selected. |
| `required` | `Bind<boolean>` | `false` | An option must be selected. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `name` | `Bind<string>` | Generated | The name the radios submit with the form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation works the same way as for all fields. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### RadioItem

| Field | Type | Description |
| --- | --- | --- |
| `value` | `T` | The value of `value` when this option is selected. |
| `text` | `Bind<string>` | Shown next to the circle. By default, this is the value as text. |
| `hint` | `Bind<string>` | The tooltip text. |
| `helpText` | `Bind<string>` | A smaller line below the text that describes the radio. |
| `enabled` | `Bind<boolean>` | `false` dims the option, and the arrow keys skip it. |
| `visible` | `Bind<boolean>` | `false` removes the option. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The result of the last validation. |
| `listElement` | read-only | The element with `role="radiogroup"`. |
| `inputs` | read-only | The native radios, in item order. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `focus()` | `boolean` | Sets focus on the selected option, or on the first available one. |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `refresh()` | `void` | Your items can be plain or reactive, and the group reads them as they are. After changing them in place, call `refresh()`. Their text, values and states are read again, and focus stays where it is. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onchange, onkeydown, onfocusin, onfocusout` | DOM events from the radios bubble up to the group. |

## Feedback

Loading issues…
