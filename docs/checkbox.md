# CheckBox

> Choice · @motifx-community/ui 0.1.0-beta.11

A check box with a label that can be checked, unchecked or indeterminate. It supports an optional three-state cycle, read-only and required states, and validation with its group. It is a native check box styled with design tokens.

## Import

```tsx
import { CheckBox } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack } from '@motifx-community/ui';

/** A checkbox bound to state with x-model, and checkboxes created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ remember: true, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const box = new CheckBox({ label: `Option ${++added}`, threeState: true });
    box.onValueChanged((e) => (s.result = `${box.label}: ${String(e.value)}`));
    host?.controls.add(box);
    box.focus();
  };

  return (
    <>
      <CheckBox label="&Remember me" x-model={() => s.remember} helpText={() => (s.remember ? 'You stay signed in.' : 'You sign in every time.')} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a checkbox programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="cb-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Checked, unchecked and indeterminate

`null` shows the indeterminate dash. Clicking it checks the box. With `threeState`, the user cycles through all three states: unchecked, checked and indeterminate.

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

A box above a list is indeterminate while only some items are checked. Its value is a function of the list, and clicking it checks or unchecks all items.

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

The label appears after the box, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width, so a box after its label moves to the far end, as in a settings list. `labelMode="hidden"` keeps the label for screen readers only.

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

## Required check boxes

`required` means the box must be checked. It is validated with its group like any other field, and the first unchecked box receives focus.

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

| Key | Description |
| --- | --- |
| `Space` | Toggles the check box, using the native key. |
| `Alt + key (`&Name`)` | Moves focus to the check box and toggles it (Control + Option + key on Apple platforms). |
| `Tab` | Each check box is one Tab stop. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Element` | A native `<input type="checkbox">` drawn with `appearance: none`. Its label is a `<label for>`, so clicking the label toggles the box. |
| `Indeterminate` | The native `indeterminate` state, announced as "mixed". |
| `Read-only` | `aria-readonly="true"`. The field stays in the Tab order. |
| `Errors` | `aria-invalid="true"`. The text below the label is a polite live region and describes the box. |
| `Focus` | The design system focus ring, shown only during keyboard use. |

## Localization

A check box has no strings of its own. The `required` message comes from `uiLocale.strings`, and a message already on screen updates immediately.

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

| Hook | Description |
| --- | --- |
| `.mx-check-box` | The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`. |
| `.mx-toggle-field` | The layout shared by CheckBox and Switch: the box and its label side by side. |
| `.mx-check-box__input` | The native check box, which is the box itself. |
| `.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash` | The mark drawn over the box. |
| `.mx-field__label, .mx-field__message` | The label and the text below it. |

### Component tokens

| Token | Description |
| --- | --- |
| `checkbox.box` | Unit: the box, with every state (`checked`, `mixed` and `invalid`, each with `-hover`, `-pressed` and `-focus`, plus `disabled` and `checked-disabled`). |
| `checkbox.mark, checkbox.dash, checkbox.overlay` | Units: the check mark, the dash of a mixed box, and a layer over the box (`pressed`, `disabled`). |
| `checkbox.halo, checkbox.ring` | Units: a halo centered on the box (`checked`, `hover`, `focus`, `pressed`) and a ring around the box and label during keyboard use, where the design language includes them. |
| `checkbox.label, checkbox.control` | Units: the label (`disabled`) and the row it sits in. |
| `checkbox.size.*, checkbox.mark-size.*` | The box and its mark, per size. |
| `checkbox.height.*, checkbox.font-size.*` | Row height (density tokens) and label size. |
| `checkbox.gap, checkbox.press-offset, checkbox.focus-scope` | The space before the label, the distance the box moves when pressed, and what the keyboard ring surrounds (`box` or `item`). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean \| null>` | `false` | `true` is checked, `false` is unchecked, and `null` is indeterminate. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | `''` | The label next to the box. Writing `&Name` makes Alt+N toggle it. This is the same property as `text`. |
| `labelPosition` | `Bind<'start' \| 'end'>` | `'end'` | Places the label after the box (`end`) or before it (`start`), following the reading direction. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `hidden` keeps the label for screen readers only. Every other mode shows it next to the box. |
| `threeState` | `Bind<boolean>` | `false` | A click cycles through unchecked, checked and indeterminate. Without this prop, a click only checks and unchecks, although code can still set `null`. |
| `helpText` | `Bind<string>` | `''` | Help text shown below the label. An error message replaces it. |
| `hint` | `Bind<string>` | `''` | The tooltip text. |
| `readOnly` | `Bind<boolean>` | `false` | The box can receive focus and is announced, but a click or Space changes nothing. |
| `required` | `Bind<boolean>` | `false` | The box must be checked. Adds an indicator after the label, `aria-required` and a `required` rule. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`; the row height follows the density tokens. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width of its container. With `labelPosition="start"`, the box moves to the far end. |
| `name` | `Bind<string>` | `''` | The name submitted with the form. |
| `rules, error, validateOn, validationGroup` | see Field |  | Validation works the same way as for all fields. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The result of the last validation. |
| `inputPart` | read-only | The native `<input type="checkbox">`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `toggle()` | `void` | Changes the value as a click does (with `threeState`, to the next of the three states). |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `focus()` | `boolean` | Sets focus on the box. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `null` stays `null`. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onclick, onchange, onfocusin, onfocusout` | DOM events from the input bubble up to the field. |

`ToggleField`, the base class shared by CheckBox and Switch, provides a label next to a native check box, read-only behavior and the access key. It is exported for use in your own controls.

## Feedback

Loading issues…
