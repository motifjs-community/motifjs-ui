# NumberBox

> Editors · @motifx-community/ui 0.1.0-beta.3

A numeric input with arrow key support, PageUp and PageDown, spin buttons that repeat while held, min and max limits, exact decimal stepping, display formats such as currency and percent, and locale-aware input.

## Import

```tsx
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
```

## Declarative and programmatic

`x-model` binds a number (`null` when empty). When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A field bound to a number with x-model, and fields created with `new` and stepped programmatically. */
export default function Programmatic() {
  const s = reactive({ quantity: 3 as number | null, log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const box = new NumberBox({ label: `Count ${++added}`, min: 0, max: 10, value: 5, locale: 'en' });
    box.onValueChanged((e) => (s.log = `${box.label}: ${show(e.value)}`));
    host?.controls.add(box);
    box.stepUp();
    box.focus();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="&Quantity" min={1} max={99} locale="en" x-model={() => s.quantity} />
        <output class="nb-quantity">{() => `value: ${show(s.quantity)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a field programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="nb-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Steps and keyboard input

Up and Down add `step`, PageUp and PageDown add `largeStep` (10 × `step` by default), and Home and End go to `min` and `max`. Steps are calculated on the decimal digits, so 0.1 + 0.2 equals 0.3. With `wheel`, the mouse wheel changes the value while the field has focus.

```tsx
import { reactive } from '@motifx/core';
import { NumberBox } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A step of 0.1 without float noise, and the mouse wheel stepping while the field has focus. */
export default function Steps() {
  const s = reactive({ rate: 0.1 as number | null });
  return (
    <>
      <NumberBox label="Rate" step={0.1} min={0} max={5} wheel locale="en" x-model={() => s.rate} />
      <output class="nb-rate">{() => `value: ${show(s.rate)}`}</output>
    </>
  );
}
```

## Spin buttons

Clicking a spin button changes the value by one step. Holding it repeats until the button is released or a limit is reached. The buttons can be `stacked`, `inline` or hidden.

```tsx
import { reactive } from '@motifx/core';
import { Button, NumberBox, Stack, type SpinLayout } from '@motifx-community/ui';

const LAYOUTS: SpinLayout[] = ['stacked', 'inline'];

/** Spin buttons on top of each other, side by side, or none. */
export default function SpinButtons() {
  const s = reactive({ seats: 2 as number | null, layout: 'stacked' as SpinLayout, spin: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Spin buttons">
        {LAYOUTS.map((layout) => (
          <Button
            key={layout}
            text={layout}
            size="sm"
            variant={() => (s.spin && s.layout === layout ? 'solid' : 'ghost')}
            aria-pressed={() => s.spin && s.layout === layout}
            onclick={() => {
              s.layout = layout;
              s.spin = true;
            }}
          />
        ))}
        <Button text="none" size="sm" variant={() => (s.spin ? 'ghost' : 'solid')} aria-pressed={() => !s.spin} onclick={() => (s.spin = false)} />
      </Stack>
      <NumberBox label="Seats" min={1} max={9} locale="en" spinLayout={() => s.layout} showSpinButtons={() => s.spin} x-model={() => s.seats} />
    </>
  );
}
```

## Format and locale

Without focus, the value is displayed through `Intl.NumberFormat` using `format` and `locale` (the page `lang` by default). With focus, it switches to a plain number for editing. Input is parsed in the same locale: `1.234,5` in Turkish and `1,234.5` in English. A `.` also works as the decimal point where it cannot be a group separator. A percent is edited as displayed, so 0.125 is entered as 12.5.

```tsx
import { reactive } from '@motifx/core';
import { NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A Turkish lira price, a percent edited as shown, and US dollars. */
export default function Format() {
  const s = reactive({ price: 1234.5 as number | null, share: 0.125 as number | null, dollars: 99.99 as number | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Price" locale="tr-TR" min={0} format={{ style: 'currency', currency: 'TRY' }} x-model={() => s.price} />
        <output class="nb-price">{() => `value: ${show(s.price)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Share" locale="en" min={0} max={1} step={0.01} format={{ style: 'percent', maximumFractionDigits: 1 }} x-model={() => s.share} />
        <output class="nb-share">{() => `value: ${show(s.share)}`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Amount" locale="en-US" format={{ style: 'currency', currency: 'USD' }} x-model={() => s.dollars} />
        <output>{() => `value: ${show(s.dollars)}`}</output>
      </Stack>
    </>
  );
}
```

## Min, max and clamping

A value outside `min` and `max` is brought into range when the field loses focus. With `clamp={false}`, it stays as typed and the range validation reports it.

```tsx
import { reactive } from '@motifx/core';
import { NumberBox } from '@motifx-community/ui';

/** A value brought inside its bounds, and one left as typed for the range check to report. */
export default function MinMaxClamp() {
  const s = reactive({ score: 50 as number | null, age: null as number | null });
  return (
    <>
      <NumberBox label="Score" min={0} max={100} locale="en" x-model={() => s.score} helpText="Try 250." />
      <NumberBox label="Age" min={18} max={120} clamp={false} locale="en" x-model={() => s.age} helpText="Try 12." />
    </>
  );
}
```

## Decimals and empty values

`decimals` rounds every value, whether set in code or entered by the user, and displays exactly that many digits while the field is not being edited (`72.50`). `format` can override how they are displayed. An empty field is `null`. With `allowEmpty={false}`, it receives `min` (or 0) when it loses focus.

```tsx
import { reactive } from '@motifx/core';
import { NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** Rounding to one decimal, and a field that cannot stay empty. */
export default function DecimalsAndEmpty() {
  const s = reactive({ weight: 72.456 as number | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <NumberBox label="Weight" decimals={1} step={0.1} suffix="kg" locale="en" x-model={() => s.weight} />
        <output class="nb-weight">{() => `value: ${show(s.weight)}`}</output>
      </Stack>
      <NumberBox label="Guests" min={1} allowEmpty={false} locale="en" value={2} />
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Up / Down arrow` | Adds or subtracts `step`. |
| `PageUp / PageDown` | Adds or subtracts `largeStep`. |
| `Home / End` | Goes to `min` or `max` when set. Otherwise, moves the caret. |
| `Enter` | Commits the typed text, rounded and within range, and raises `onEnter`. |
| `Mouse wheel` | With `wheel`, changes the value by one step while the field has focus. |
| `Alt + key (`&Name`)` | Moves focus to the field (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Role` | `spinbutton` on a text `<input inputmode="decimal">`, so phones show a numeric keyboard and any locale can be typed. |
| `Value` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`). |
| `Spin buttons` | Named “Increase” and “Decrease” from `uiLocale`. They are not Tab stops, because the arrow keys do the same thing. |
| `Errors` | `aria-invalid="true"`. The message is a polite live region. |

## Localization

The spin button names and range messages come from `uiLocale.strings`. Numbers follow `locale`.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the names of the spin buttons and the range messages. */
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
        The up button reads <output class="nb-increase">{() => kitTexts.strings.increase}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-field.mx-number-box` | The field. `data-spin` while spin buttons are shown, plus the field attributes. |
| `.mx-number-box__spin` | The spin buttons; `data-layout="stacked" \| "inline"`. |
| `.mx-number-box__step` | One spin button; `data-step="up" \| "down"`. |

### Component tokens

| Token | Description |
| --- | --- |
| `number-box.spin, number-box.step, number-box.glyph` | Units: the spin button group (`stacked`, `inline`, `disabled`), each step (`up`, `down`, `next`, `hover`, `pressed`, `disabled`) and its glyph. |
| `number-box.spin-layout, number-box.spin-order` | Where the steps are placed (stacked at the end, or one on each side) and their order. |
| `number-box.spin-inset` | The space around stacked spin buttons. |
| `field.*` | Everything else works as in TextBox. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The number, or `null` when empty. `x-model` provides two-way binding. |
| `min / max` | `Bind<number \| null>` | `null` | The limits. Steps stop there, Home and End go there, entered values are kept inside (see `clamp`), and the range is validated. |
| `step` | `Bind<number>` | `1` | The amount added by the arrow keys, the spin buttons and the wheel. |
| `largeStep` | `Bind<number>` | 10 × `step` | The amount added by PageUp and PageDown. |
| `showSpinButtons` | `Bind<boolean>` | `true` | Shows up and down buttons in the box. |
| `spinLayout` | `Bind<SpinLayout>` | `'stacked'` | `stacked` shows arrows on top of each other, and `inline` shows − and + side by side. |
| `wheel` | `Bind<boolean>` | `false` | The mouse wheel changes the value while the field has focus. |
| `format` | `Bind<Intl.NumberFormatOptions>` | `{}` | The display format without focus: `{ style: 'currency', currency: 'TRY' }`, `{ style: 'percent' }`, `{ minimumFractionDigits: 2 }`… |
| `locale` | `Bind<string>` | The page `lang` | The locale of the format and of the input. |
| `decimals` | `Bind<number \| null>` | `null` | The number of digits after the decimal point. Every value is rounded to this precision (half away from zero) regardless of its source, and displayed with exactly that many digits while the field is not being edited. |
| `clamp` | `Bind<boolean>` | `true` | Brings a value outside `min` and `max` into range when entered. `false` leaves it to the range validation. |
| `allowEmpty` | `Bind<boolean>` | `true` | An empty field is `null`. `false` replaces it with `min` (or 0) when the field loses focus. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | With `input`, the value updates as soon as the text is a complete number in range. With `change`, it updates when the field loses focus or the user presses Enter. |
| `placeholder` | `Bind<string>` | `''` | Displayed when the field is empty. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects all text when the field receives focus. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | `'start'` | Text alignment. |
| `label, labelMode, helpText, hint, prefix, suffix, icon, buttons` | see TextBox |  | Parts common to all fields. |
| `readOnly, required, size, variant, stretch` | see TextBox |  | States and appearance common to all fields. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation works the same way as for all fields. |
| `name, autocomplete` | `Bind<string>` | —, `'off'` | Passed to the `<input>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. `locale` returns the locale in use. |
| `formattedValue` | read-only, reactive | The value as displayed without focus, or `''` when empty. |
| `isValid, validationMessage, validating` | read-only, reactive | The validation result. |
| `inputElement` | read-only | The native `<input>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `stepUp(times = 1)` | `void` | Adds `step` × `times`, kept within `min` and `max`. |
| `stepDown(times = 1)` | `void` | Subtracts `step` × `times`. |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `focus()` | `boolean` | Sets focus on the input. |
| `select()` | `void` | Selects all text. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. A held spin button reports every step. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Occurs when the user presses Enter. `e`: `{ value, source, event }`. |
