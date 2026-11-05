# CheckBox

> Choice · @motifx-community/ui 0.1.0-beta.2

A checkbox with its caption: checked, unchecked or indeterminate, three states on request, read-only, required and checked with its group. A native checkbox underneath, drawn from the design tokens.

## Import

```tsx
import { CheckBox } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack } from '@motifx-community/ui';

/** A checkbox bound to state with x-model, and checkboxes created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ remember: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const box = new CheckBox({ label: `Option ${++added}`, threeState: true });
    box.onValueChanged((e) => (s.result = `${box.label}: ${String(e.value)}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <CheckBox label="&Remember me" x-model={() => s.remember} helpText={() => (s.remember ? 'You stay signed in.' : 'You sign in every time.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a checkbox from code" variant="outline" onclick={addFromCode} />
        <output class="cb-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Checked, unchecked, indeterminate

`null` shows the indeterminate dash. A click on it checks the box; with `threeState` the user goes through all three: unchecked → checked → indeterminate.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox } from '@motifx-community/ui';

/** Unchecked, checked and indeterminate, and a box the user takes through all three. */
export default function States() {
  const s = reactive({ mixed: null as boolean | null, three: false as boolean | null });
  return (
    <>
      <CheckBox label="Unchecked" value={false} />
      <CheckBox label="Checked" value={true} />
      <CheckBox label="Indeterminate" x-model={() => s.mixed} />
      <CheckBox label="Three st&ates" threeState x-model={() => s.three} />
      <output class="cb-three">{() => `value: ${String(s.three)}`}</output>
    </>
  );
}
```

A box over a list is indeterminate while only some items are checked. Its value is a function of the list; a click on it checks or unchecks them all.

```tsx
import { reactive } from '@motifx/core';
import { CheckBox, Stack } from '@motifx-community/ui';

interface Topping {
  id: number;
  name: string;
  on: boolean;
}

/** A box over a list: indeterminate while only some are checked, and a click checks or unchecks them all. */
export default function SelectAll() {
  const toppings = reactive<Topping[]>([
    { id: 1, name: 'Cheese', on: true },
    { id: 2, name: 'Olives', on: false },
    { id: 3, name: 'Peppers', on: true },
  ]);

  const allToppings = (): boolean | null => {
    const on = toppings.filter((t) => t.on).length;
    return on === 0 ? false : on === toppings.length ? true : null;
  };

  return (
    <>
      <CheckBox
        label="All toppings"
        class="cb-all"
        value={allToppings}
        onValueChanged={(e) => {
          if (e.byUser) for (const t of toppings) t.on = e.value === true;
        }}
      />
      <Stack orientation="horizontal" wrap align="center" style="padding-inline-start: var(--mx-space-6)">
        {toppings.map((t) => (
          <CheckBox key={t.id} label={t.name} x-model={() => t.on} />
        ))}
      </Stack>
    </>
  );
}
```

## Caption

The caption sits after the box, or before it with `labelPosition="start"`. With `stretch` the field takes the width, so a box after its caption goes to the far end, as in a settings list. `labelMode="hidden"` keeps the caption for screen readers only.

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack, type LabelPosition } from '@motifx-community/ui';

const POSITIONS: LabelPosition[] = ['end', 'start'];

/** The caption after or before the box, stretched to the far end, or kept for screen readers only. */
export default function Caption() {
  const s = reactive({ position: 'end' as LabelPosition });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Caption position">
        {POSITIONS.map((position) => (
          <Button
            key={position}
            text={position}
            size="sm"
            variant={() => (s.position === position ? 'solid' : 'ghost')}
            aria-pressed={() => s.position === position}
            onclick={() => (s.position = position)}
          />
        ))}
      </Stack>
      <CheckBox label="Show hidden files" labelPosition={() => s.position} />
      <div style="inline-size: 20rem">
        <CheckBox label="Wrap long lines" labelPosition={() => s.position} stretch value={true} />
      </div>
      <CheckBox label="Select row 3" labelMode="hidden" />
    </>
  );
}
```

## Sizes

```tsx
import { CheckBox, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A checkbox in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <CheckBox key={size} label={size} size={size} value={size !== 'sm'} />
      ))}
    </>
  );
}
```

## Required

`required` means the box must be checked. It is checked with its group, like any field: the first box left unchecked gets focus.

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack, ValidationGroup } from '@motifx-community/ui';

/** Boxes that must be checked, checked with their group; the first one left unchecked gets focus. */
export default function Required() {
  const s = reactive({ terms: false, privacy: false, result: '' });
  const group = new ValidationGroup();

  const signUp = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Signed up.' : `${result.invalid.length} box(es) to check.`;
  };

  return (
    <>
      <CheckBox label="I accept the &terms" required validationGroup={group} x-model={() => s.terms} />
      <CheckBox label="I read the privacy notice" required validationGroup={group} x-model={() => s.privacy} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Sign up" tone="accent" onclick={signUp} />
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />
        <output class="cb-save">{() => s.result}</output>
      </Stack>
    </>
  );
}
```

## Read-only and disabled

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox } from '@motifx-community/ui';

/** Read-only and disabled, both following state. */
export default function ReadOnly() {
  const s = reactive({ editable: true, paid: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
      <CheckBox label="Read-only" readOnly={() => !s.editable} x-model={() => s.paid} />
      <CheckBox label="Disabled" enabled={() => s.editable} x-model={() => s.paid} />
      <CheckBox label="Disabled, unchecked" enabled={() => s.editable} value={false} />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Space` | Toggles it (the native checkbox key). |
| `Alt + key (`&Name`)` | Focuses and toggles it (Control + Option + key on Apple platforms). |
| `Tab` | One stop per checkbox. |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<input type="checkbox">` drawn with `appearance: none`; its caption is a `<label for>`, so a click on the caption toggles it. |
| `Indeterminate` | The native `indeterminate` state: read out as "mixed". |
| `Read-only` | `aria-readonly="true"`; it keeps its place in the Tab order. |
| `Errors` | `aria-invalid="true"`; the line under the caption is a polite live region and describes the box. |
| `Focus` | The design system focus ring, for the keyboard only. |

## Localization

The checkbox writes no text of its own; the `required` message comes from `uiLocale.strings`, and a message already shown follows a change at once.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every field on the page; a required message already shown follows too. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        Required reads <output>{() => kitTexts.strings.required}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-check-box` | The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`. |
| `.mx-toggle-field` | The layout CheckBox and Switch share: the box and its caption side by side. |
| `.mx-check-box__input` | The native checkbox: the box itself. |
| `.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash` | The mark drawn over the box. |
| `.mx-field__label, .mx-field__message` | The caption and the line under it. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `checkbox.box` | Unit: the box, with every state (`checked`, `mixed`, `invalid`, each with `-hover`, `-pressed`, `-focus`; `disabled`, `checked-disabled`). |
| `checkbox.mark, checkbox.dash, checkbox.overlay` | Units: the check mark, the dash of a mixed box, and a layer over the box (`pressed`, `disabled`). |
| `checkbox.halo, checkbox.ring` | Units: a halo centred on the box (`checked`, `hover`, `focus`, `pressed`) and a ring round the box and its caption under the keys, where the language has them. |
| `checkbox.label, checkbox.control` | Units: the caption (`disabled`) and the row it sits in. |
| `checkbox.size.*, checkbox.mark-size.*` | The box and its mark, per size. |
| `checkbox.height.*, checkbox.font-size.*` | The row height (density tokens) and the caption size. |
| `checkbox.gap, checkbox.press-offset, checkbox.focus-scope` | The space before the caption, how far a press moves the box, and what the ring under the keys goes round (`box` or `item`). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean \| null>` | `false` | `true` checked, `false` unchecked, `null` indeterminate. `x-model` binds it two-way. |
| `label` | `Bind<string>` | `''` | The caption next to the box; `&Name` makes Alt+N toggle it. The same property as `text`. |
| `labelPosition` | `Bind<'start' \| 'end'>` | `'end'` | The caption after the box (`end`) or before it (`start`), in the reading direction. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `hidden` keeps the caption for screen readers only; every other mode shows it next to the box. |
| `threeState` | `Bind<boolean>` | `false` | A click goes unchecked → checked → indeterminate. Without it a click only checks and unchecks; code can still set `null`. |
| `helpText` | `Bind<string>` | `''` | A line under the caption. An error message takes its place. |
| `hint` | `Bind<string>` | `''` | A tooltip. |
| `readOnly` | `Bind<boolean>` | `false` | Focusable and read out, but a click or Space changes nothing. |
| `required` | `Bind<boolean>` | `false` | It must be checked: a mark after the caption, `aria-required` and a `required` rule. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width of what it sits in; with `labelPosition="start"` the box goes to the far end. |
| `name` | `Bind<string>` | `''` | The name it is sent with in a form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation, as in every field. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The outcome of the last check. |
| `inputElement` | read-only | The native `<input type="checkbox">`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `toggle()` | `void` | Changes the value as a click does (with `threeState`, to the next of the three). |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `focus()` | `boolean` | Focuses the box. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `null` stays `null`. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onclick, onchange, onfocusin, onfocusout` | The DOM events of the input reach the field. |

`ToggleField`, the base CheckBox and Switch share (the caption next to a native checkbox, read-only, the access key), is exported for controls of your own.
