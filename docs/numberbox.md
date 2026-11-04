# NumberBox

> Editors · @motifx-community/ui 0.1.0-beta.1

A number field: arrow keys, PageUp / PageDown and spin buttons that repeat while held, bounds, a step without float noise, a format for display (currency, percent) and typing in the locale’s own way.

## Import

```tsx
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
```

## From JSX and from code

`x-model` binds a number (`null` when empty). Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, NumberBox, Stack } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A field bound to a number with x-model, and fields created with `new` and stepped from code. */
export default function FromCode() {
  const s = reactive({ quantity: 3 as number | null, log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
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
        <Button text="Add a field from code" variant="outline" onclick={addFromCode} />
        <output class="nb-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Steps and keys

Up / Down add `step`, PageUp / PageDown add `largeStep` (10 × `step` by default), Home / End go to `min` / `max`. Steps are added on the decimal digits, so 0.1 + 0.2 is 0.3. With `wheel`, the mouse wheel steps while the field has focus.

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

Pressing a spin button steps once; holding it repeats until it is let go or a bound is reached. They sit on top of each other (`stacked`) or side by side (`inline`), or not at all.

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

Without focus the value shows through `Intl.NumberFormat` with `format` and `locale` (the page `lang` by default); with focus it turns into the plain number to edit. What is typed is read in that locale: `1.234,5` in Turkish, `1,234.5` in English; a `.` also works as the decimal point where it cannot be a group separator. A percent is edited as shown: 12.5 for 0.125.

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

## Min, max and clamp

An entered value outside `min` / `max` is brought inside when the field is left. With `clamp={false}` it stays as typed and the range check reports it.

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

## Decimals and empty

`decimals` rounds every value, the one given as well as the one entered, and shows exactly that many digits while the field is not edited (`72.50`); `format` can show them otherwise. An empty field is `null`; with `allowEmpty={false}` it gets `min` (or 0) when the field is left.

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

| Key | What it does |
| --- | --- |
| `Up / Down arrow` | Adds / takes away `step`. |
| `PageUp / PageDown` | Adds / takes away `largeStep`. |
| `Home / End` | Goes to `min` / `max` when they are set; otherwise moves the caret. |
| `Enter` | Enters the typed text (rounded, kept in range) and fires `onEnter`. |
| `Mouse wheel` | With `wheel`, steps while the field has focus. |
| `Alt + key (`&Name`)` | Focus the field (Control + Option + key on Apple platforms). |

## Accessibility

| Topic | How |
| --- | --- |
| `Role` | `spinbutton` on a text `<input inputmode="decimal">`, so phones show a number keyboard and any locale can be typed. |
| `Value` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`). |
| `Spin buttons` | Named “Increase” / “Decrease” from `uiLocale`; not Tab stops (the arrow keys do their job). |
| `Errors` | `aria-invalid="true"`; the message line is a polite live region. |

## Localization

The names of the spin buttons and the range messages come from `uiLocale.strings`; numbers follow `locale`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the names of the spin buttons and the range messages. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
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

| Hook | What it is |
| --- | --- |
| `.mx-field.mx-number-box` | The field. `data-spin` while the spin buttons show, and the field attributes. |
| `.mx-number-box__spin` | The spin buttons; `data-layout="stacked" \| "inline"`. |
| `.mx-number-box__step` | One spin button; `data-step="up" \| "down"`. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `number-box.spin, number-box.step, number-box.glyph` | Units: the spin buttons together (`stacked`, `inline`, `disabled`), each step (`up`, `down`, `next`, `hover`, `pressed`, `disabled`) and its glyph. |
| `number-box.spin-layout, number-box.spin-order` | Where the steps stand (stacked at the end, or one on each side) and in which order. |
| `number-box.spin-inset` | The space around the stacked spin buttons. |
| `field.*` | Everything else, as for TextBox. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The number; `null` when empty. `x-model` binds it two-way. |
| `min / max` | `Bind<number \| null>` | `null` | Bounds: steps stop there, Home / End go there, entered values are kept inside (see `clamp`), the range is checked. |
| `step` | `Bind<number>` | `1` | What the arrow keys, the spin buttons and the wheel add. |
| `largeStep` | `Bind<number>` | 10 × `step` | What PageUp / PageDown add. |
| `showSpinButtons` | `Bind<boolean>` | `true` | The up and down buttons in the box. |
| `spinLayout` | `Bind<SpinLayout>` | `'stacked'` | `stacked`: arrows on top of each other; `inline`: − and + side by side. |
| `wheel` | `Bind<boolean>` | `false` | The mouse wheel changes the value while the field has focus. |
| `format` | `Bind<Intl.NumberFormatOptions>` | `{}` | How the value shows without focus: `{ style: 'currency', currency: 'TRY' }`, `{ style: 'percent' }`, `{ minimumFractionDigits: 2 }`… |
| `locale` | `Bind<string>` | the page `lang` | The locale of the format and of what is typed. |
| `decimals` | `Bind<number \| null>` | `null` | Digits after the point: every value is rounded to them (half away from zero), wherever it comes from, and shown with exactly that many while the field is not edited. |
| `clamp` | `Bind<boolean>` | `true` | A value outside `min` / `max` is brought inside when entered; `false` leaves it to the range check. |
| `allowEmpty` | `Bind<boolean>` | `true` | An empty field is `null`; `false` puts `min` (or 0) in its place when the field is left. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | `input`: the value changes as soon as the text is a whole number in range; `change`: when the field is left or Enter is pressed. |
| `placeholder` | `Bind<string>` | `''` | Shown while the field is empty. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects the whole text when the field gets focus. |
| `align` | `Bind<'start' \| 'center' \| 'end'>` | `'start'` | Text alignment. |
| `label, labelMode, helpText, hint, prefix, suffix, icon, buttons` | see TextBox |  | The parts every field has. |
| `readOnly, required, size, variant, stretch` | see TextBox |  | The states and the look every field has. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation, as for every field. |
| `name, autocomplete` | `Bind<string>` | —, `'off'` | Passed to the `<input>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. `locale` reads back the locale in use. |
| `formattedValue` | read-only, reactive | The value as it shows without focus, `''` when empty. |
| `isValid, validationMessage, validating` | read-only, reactive | The outcome of the checks. |
| `inputElement` | read-only | The native `<input>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `stepUp(times = 1)` | `void` | Adds `step` × `times`, kept within `min` / `max`. |
| `stepDown(times = 1)` | `void` | Takes `step` × `times` away. |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `focus()` | `boolean` | Focuses the input. |
| `select()` | `void` | Selects the whole text. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; a held spin button reports every step. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Enter was pressed. `e`: `{ value, source, event }`. |
