# RadioGroup

> Choice · @motifx-community/ui 0.1.0-beta.2

A set of options of which one is chosen: from plain values, from your own objects or from a live list; one under the other, side by side or in columns; options that are disabled, hidden or carry a help line; one Tab stop and the arrow keys.

## Import

```tsx
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
```

## From JSX and from code

A plain value is its own text. `x-model` binds the chosen value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

/** A group of plain values bound with x-model, and a group created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ size: 'M' as string | null, result: '' });
  let host: Stack | null = null;

  const addFromCode = () => {
    const wrap = new RadioGroup<string>({ label: 'Gift wrap', orientation: 'horizontal', items: ['None', 'Paper', 'Box'], value: 'None' });
    wrap.onValueChanged((e) => (s.result = `Gift wrap: ${e.value}`));
    host?.controls.add(wrap);
    wrap.focus();
  };

  return (
    <>
      <RadioGroup label="&Size" items={['S', 'M', 'L', 'XL']} x-model={() => s.size} helpText={() => `Chosen: ${s.size ?? 'nothing'}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a group from code" variant="outline" onclick={addFromCode} />
        <output class="rg-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Items from data

Objects of your own shape take `itemText` and `itemValue` (a property name or a function). Plain or reactive, the items are read as they are: after adding, removing or renaming some in place, `refresh()` shows them, focus and choice kept.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

interface Plan {
  id: number;
  name: string;
  price: number;
}

/** Options from a list of your own objects: after adding or changing some in place, `refresh()` shows them. */
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

## Disabled options, help lines, hints

A `RadioItem` brings its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip what cannot be chosen.

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

/** A choice that must be made, checked with its group, and read-only and disabled groups following state. */
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

| Key | What it does |
| --- | --- |
| `Tab` | Into the group, onto the chosen option (or the first one that can be chosen); the next Tab leaves the group. |
| `↓ / →` | Moves to the next option and chooses it, wrapping from the last to the first; skips disabled and hidden options. |
| `↑ / ←` | The same, backwards. Right to left, ← and → swap. |
| `Space` | Chooses the focused option. |
| `Alt + key (`&Name`)` | Focuses the group (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | How |
| --- | --- |
| `Group` | `role="radiogroup"`, named by the field label (`aria-labelledby`); `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid` and `aria-describedby` for the line under it. |
| `Options` | Native `<input type="radio">` sharing a name, each inside its own `<label>`, drawn with `appearance: none`. |
| `Help text` | An option’s `helpText` sits outside its label and describes it with `aria-describedby`, so it is not part of its name. |
| `Disabled options` | Native `disabled`: skipped by the keyboard and read out as unavailable. |
| `Focus` | One Tab stop; the design system focus ring, for the keyboard only. |

## Localization

The group writes no text of its own: the option texts are yours (functions of your language state work). The `required` message comes from `uiLocale.strings`.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-radio-group` | The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`. |
| `.mx-radio-group__list` | The `radiogroup` element; `--_columns` and `--_rows` are set on it with `columns`. |
| `.mx-radio-group__item, .mx-radio-group__label` | One option, and the label that holds its radio and text. |
| `.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help` | The radio, its text, its help line. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `radiogroup.circle, radiogroup.dot` | Units: the circle, with every state (`checked`, `invalid`, `hover`, `pressed`, `focus` and their pairs, `disabled`), and the dot of the chosen one (`checked`, `pressed`, `disabled`). |
| `radiogroup.row, radiogroup.text, radiogroup.help` | Units: an option's row (`hover`, `checked`, `disabled`), its text and its help line. |
| `radiogroup.halo, radiogroup.ring` | Units: a halo centred on the circle and a ring round an option under the keys, where the language has them. |
| `radiogroup.options, radiogroup.floating-label` | Units: the options together, and the group's label where it floats. |
| `radiogroup.size.*, radiogroup.dot-size.*, radiogroup.dot-size-hover.*, radiogroup.dot-size-pressed.*` | The circle and the dot, per size and state. |
| `radiogroup.height.*, radiogroup.font-size.*` | The row height (density tokens) and the text size. |
| `radiogroup.gap, radiogroup.column-gap, radiogroup.help-gap` | The space before the text, between options side by side, and above an option's help line. |
| `radiogroup.press-offset, radiogroup.focus-scope` | How far a press moves the circle, and what the ring under the keys goes round. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<T \| null>` | `null` | The value of the chosen item; `null` when none is chosen. `x-model` binds it two-way. |
| `items` | `Bind<readonly (RadioItem<T> \| T)[]>` | `[]` | The options. A function is followed: a new list shows at once; items changed in place show after `refresh()`. |
| `itemText` | `string \| (item) => unknown` | `'text'` | Where an item keeps its text, for objects of your own shape. A reader, not a binding. |
| `itemValue` | `string \| (item) => T` | `'value'` | Where an item keeps its value. An object without one is its own value. |
| `label` | `Bind<string>` | `''` | The caption of the group; `&Name` makes Alt+N focus it. The same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side` (next to the options) or `hidden` (for screen readers only). |
| `orientation` | `Bind<RadioGroupOrientation>` | `'vertical'` | `vertical`: one under the other; `horizontal`: side by side, wrapping. |
| `columns` | `Bind<number>` | `0` | Lays the options out in a grid of this many columns (down the columns when vertical, across when horizontal). |
| `helpText` | `Bind<string>` | `''` | A line under the group. An error message takes its place. |
| `hint` | `Bind<string>` | `''` | A tooltip on the group. |
| `readOnly` | `Bind<boolean>` | `false` | The arrows move between the options, nothing can be chosen. |
| `required` | `Bind<boolean>` | `false` | One option must be chosen. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `name` | `Bind<string>` | generated | The name the radios are sent with in a form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation, as in every field. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### RadioItem

| Field | Type | Description |
| --- | --- | --- |
| `value` | `T` | What `value` becomes when this option is chosen. |
| `text` | `Bind<string>` | Shown next to the circle. Default: the value as text. |
| `hint` | `Bind<string>` | A tooltip. |
| `helpText` | `Bind<string>` | A smaller line under the text; it describes the radio. |
| `enabled` | `Bind<boolean>` | `false` greys it out; the arrow keys skip it. |
| `visible` | `Bind<boolean>` | `false` leaves it out. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The outcome of the last check. |
| `listElement` | read-only | The element with `role="radiogroup"`. |
| `inputs` | read-only | The native radios, in the order of the items. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `focus()` | `boolean` | Focuses the chosen option, or the first one that can be chosen. |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `refresh()` | `void` | Your items may be plain or reactive; the group reads them as they are. After changing them in place, call `refresh()`. Their texts, values and states are read again; focus stays where it is. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onchange, onkeydown, onfocusin, onfocusout` | The DOM events of the radios reach the group. |
