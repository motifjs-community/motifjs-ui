# Slider

> Editors · @motifx-community/ui 0.1.0-beta.0

A value picked on a track by dragging a thumb or with the keys: one number, or a range with two thumbs. Steps, marks with labels, a value bubble, a vertical form and number formatting, with the label, help line and validation every field has.

## Import

```tsx
import { Slider, type SliderValue } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, Slider, Stack } from '@motifx-community/ui';

/** A slider bound to state with x-model, and sliders created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ volume: 40, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const slider = new Slider({ label: `Slider ${++added}`, showValue: 'drag' });
    slider.value = 50;
    slider.onValueChanged((e) => (s.result = `${slider.label}: ${String(e.value)}`));
    host?.controls.add(slider);
    slider.focus();
  };

  return (
    <>
      <Slider label="&Volume" x-model={() => s.volume} helpText={() => `Volume: ${s.volume}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a slider from code" variant="outline" onclick={addFromCode} />
        <output class="sl-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Range

With `range` there are two thumbs and the value is `[start, end]`. The thumbs cannot cross; `minDistance` keeps them apart. A press on the track moves the nearer thumb.

```tsx
import { reactive } from '@motifx/core';
import { Slider, type SliderValue } from '@motifx-community/ui';

const EURO: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };

/** Two thumbs that cannot cross, kept apart by minDistance. */
export default function Range() {
  const s = reactive({ price: [120, 380] as SliderValue });
  return (
    <>
      <Slider label="Price" range max={500} step={10} minDistance={50} format={EURO} showValue="drag" x-model={() => s.price} />
      <output class="sl-price">{() => `value: [${(s.price as number[]).join(', ')}]`}</output>
    </>
  );
}
```

## Centred

With `origin` the active part of the track runs from that value to the thumb, on either side of it: a balance, an offset, a correction.

```tsx
import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** A value on either side of a middle: the active part runs from the origin to the thumb. */
export default function Centred() {
  const s = reactive({ balance: -30 });
  return (
    <>
      <Slider label="Balance" min={-100} max={100} origin={0} showValue="drag" x-model={() => s.balance} />
      <output class="sl-balance">{() => `balance: ${s.balance}`}</output>
    </>
  );
}
```

## Steps and marks

`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or with a number that many equal parts; `tickLabels` writes the values under them.

```tsx
import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** Steps, a mark at every step or in equal parts, and formatted labels under them. */
export default function StepsAndMarks() {
  const s = reactive({ zoom: 100, rating: 6 });
  return (
    <>
      <Slider label="Zoom" min={25} max={200} step={25} ticks tickLabels format={{ style: 'unit', unit: 'percent' }} x-model={() => s.zoom} />
      <Slider label="Rating" max={10} ticks={5} tickLabels x-model={() => s.rating} />
      <Slider label="Opacity" max={1} step={0} value={0.5} tickLabels showValue="drag" format={{ style: 'percent' }} />
    </>
  );
}
```

## Value bubble and format

`showValue` puts the value in a bubble over the thumb while it is moved (`drag`, also while a key moves it) or `always`. `format` writes it with `Intl.NumberFormat`; `valueText` gives screen readers their own words.

```tsx
import { reactive } from '@motifx/core';
import { Button, Slider, Stack, type SliderShowValue } from '@motifx-community/ui';

const SHOW: SliderShowValue[] = ['never', 'drag', 'always'];

/** The value bubble shown never, while moved or always, written with a format and read out with valueText. */
export default function ValueBubble() {
  const s = reactive({ show: 'drag' as SliderShowValue, temp: 21 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Show value">
        {SHOW.map((show) => (
          <Button
            key={show}
            text={show}
            size="sm"
            variant={() => (s.show === show ? 'solid' : 'ghost')}
            aria-pressed={() => s.show === show}
            onclick={() => (s.show = show)}
          />
        ))}
      </Stack>
      <Slider
        label="Temperature"
        min={16}
        max={28}
        step={0.5}
        showValue={() => s.show}
        format={{ style: 'unit', unit: 'celsius' }}
        valueText={(v) => `${v} degrees`}
        x-model={() => s.temp}
      />
    </>
  );
}
```

## Vertical

`orientation="vertical"` stands the track up; up is more, and the Up arrow moves it up.

```tsx
import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** Three vertical sliders, as in an equalizer: up is more. */
export default function Vertical() {
  const s = reactive({ bass: 4, mid: 0, treble: -2 });
  return (
    <>
      <Slider label="Bass" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.bass} />
      <Slider label="Mid" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.mid} />
      <Slider label="Treble" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.treble} />
    </>
  );
}
```

## When the value changes

By default the value follows the thumb while it is dragged. With `updateOn="change"` it changes once, when the thumb is let go — for work that should not run on every move, such as a search. The keys change it at once either way.

```tsx
import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** A value that follows the thumb, next to one that changes only when the thumb is let go. */
export default function UpdateOn() {
  const s = reactive({ live: 50, committed: 50 });
  return (
    <>
      <Slider label="Live" showValue="drag" x-model={() => s.live} />
      <output class="sl-live">{() => `live: ${s.live}`}</output>
      <Slider label="On release" updateOn="change" showValue="drag" x-model={() => s.committed} />
      <output class="sl-committed">{() => `on release: ${s.committed}`}</output>
    </>
  );
}
```

## Sizes, read-only, disabled, validation

```tsx
import { reactive } from '@motifx/core';
import { Button, Slider, Stack } from '@motifx-community/ui';

/** The three sizes, read-only and disabled following state, and a range rule checked while it moves. */
export default function States() {
  const s = reactive({ editable: true, age: 16 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Slider label="Small" size="sm" value={30} />
        <Slider label="Medium" value={50} />
        <Slider label="Large" size="lg" value={70} />
      </Stack>
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
      <Stack orientation="horizontal" wrap align="center">
        <Slider label="Read-only" value={30} readOnly={() => !s.editable} />
        <Slider label="Disabled" range value={[20, 60]} enabled={() => s.editable} />
      </Stack>
      <Slider label="Age" max={99} validateOn="input" rules={[{ type: 'range', min: 18, message: 'You must be 18 or older.' }]} x-model={() => s.age} />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Right / Up arrow` | One step more. In a right-to-left page, Left is more on a horizontal slider. |
| `Left / Down arrow` | One step less. |
| `Page Up / Page Down` | `largeStep` more / less. |
| `Home / End` | The least / the most; with two thumbs, as far as the other thumb lets. |
| `Tab` | Each thumb is a Tab stop. |
| `Alt + key (`&Name`)` | Focuses the (first) thumb. |

## Accessibility

| Topic | How |
| --- | --- |
| `Thumb` | `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-orientation`, and `aria-valuetext` when there is a `format` or a `valueText`. |
| `Name` | One thumb is named by the label. Two thumbs sit in a `role="group"` named by the label; each is named by the label and its end ("Minimum", "Maximum"). |
| `Two thumbs` | The start thumb's `aria-valuemax` is the end thumb's value, and the other way round, as the APG multi-thumb slider says. |
| `States` | `aria-readonly`, `aria-invalid` and `aria-disabled` on the thumbs; the line under the track describes them. |
| `Pointer` | The pointer is captured while it drags; a press on the track moves the nearest thumb there. The track is as tall as a touch target. |

## Localization

The names of the two thumbs of a range come from `uiLocale.strings` (`minimum`, `maximum`); numbers are written in `locale`, by default the page's `lang`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, Slider, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the names of the thumbs; the price slider writes its numbers in the chosen language. */
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
        The start thumb is named <output class="sl-minimum">{() => kitTexts.strings.minimum}</output>
      </span>
      <Slider
        label={() => (s.lang === 'en' ? 'Price' : 'Fiyat')}
        range
        max={1000}
        step={50}
        value={[200, 800]}
        showValue="drag"
        locale={() => s.lang}
        format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }}
      />
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-slider` | The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`, `data-split`. |
| `.mx-slider__control` | What the pointer is pressed on: the track and the marks. |
| `.mx-slider__track, .mx-slider__rail` | The track, and the rail that holds its segments (`--_from`, `--_to`; `data-from="start \| thumb \| origin"`, `data-to="thumb \| origin \| end"`, `data-start-active`, `data-end-active`). |
| `.mx-slider__fill, .mx-slider__segment` | The active segment, and the inactive ones before and after it (`data-side`). |
| `.mx-slider__thumb` | A thumb: the pressable area (`data-thumb="start \| end"`, `data-dragging`, `--_at`). |
| `.mx-slider__halo, .mx-slider__knob, .mx-slider__core` | What a thumb shows, centred on it: a halo, the knob and the part inside the knob. |
| `.mx-slider__bubble` | The value over a thumb. |
| `.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label` | The marks (`data-mark`, `data-active`, `--_at`) and their labels. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `slider.track, slider.active, slider.stop` | Units: the inactive segments (`before`, `after`), the active one (`from-start`, `to-end`) and the dots at the ends (`active`), each with its box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`). |
| `slider.halo, slider.knob, slider.core` | Units: what a thumb shows, with its box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`). |
| `slider.bubble, slider.bubble-arrow, slider.tick, slider.tick-label, slider.ring` | Units: the value bubble and its arrow, the marks, their labels, and a ring around the whole control under the keys. |
| `slider.track-thickness.*, slider.active-thickness.*` | The inactive and the active segments, per size. |
| `slider.thumb-width.*, slider.thumb-height.*, slider.thumb-core-size.*` | The knob along and across the track, and the part inside it, per size. |
| `slider.track-gap, slider.origin-gap, slider.stop-inset` | A track split around the thumbs and the origin, and where the dots at its ends sit. |
| `slider.hit-size` | How tall the track is for the pointer, and the touch target of a thumb. |
| `slider.vertical-length` | The length of a vertical slider. |
| `slider.tick-length, slider.tick-width, slider.tick-offset, slider.tick-gap, slider.tick-line-height, slider.tick-label-width` | Where the marks and their labels sit. |
| `slider.bubble-gap, slider.bubble-arrow-size` | How far the bubble is from its thumb, and its arrow. |
| `field.width` | The width of a horizontal slider, as for every field. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| [number, number]>` | `min` / `[min, max]` | The value; `[start, end]` with `range`. `x-model` binds it two-way. It is kept on the steps and inside the bounds. |
| `label` | `Bind<string>` | `''` | The caption; `&Name` makes Alt+N focus the thumb. The same property as `text`. |
| `min / max` | `Bind<number>` | `0` / `100` | The bounds. When they change the value follows and is written back. |
| `step` | `Bind<number>` | `1` | The values a thumb stops at, counted from `min`; `0` for any number. |
| `largeStep` | `Bind<number>` | `10 × step` | What Page Up and Page Down move by. |
| `range` | `Bind<boolean>` | `false` | Two thumbs; the value is `[start, end]`. The thumbs cannot cross. |
| `minDistance` | `Bind<number>` | `0` | The least distance between the two thumbs. |
| `origin` | `Bind<number \| undefined>` | `undefined` | A centred slider: the active part of the track runs from this value to the thumb, on either side. Not with `range`. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | Vertical: up is more. |
| `ticks` | `Bind<boolean \| number>` | `false` | `true`: a mark at every step (up to 1000); a number: that many equal parts. |
| `tickLabels` | `Bind<boolean>` | `false` | The values under the marks, or at the two ends without marks. |
| `showValue` | `Bind<'never' \| 'drag' \| 'always'>` | `'never'` | A bubble with the value over the thumb: never, while it is moved (by the pointer or the keys), or always. |
| `format` | `Bind<Intl.NumberFormatOptions \| null>` | `null` | How the bubble, the tick labels and screen readers write the value. |
| `locale` | `Bind<string>` | the page's `lang` | The locale of `format`. |
| `valueText` | `(value: number) => string` | — | What screen readers say for a value. A function, so it is stored as it is, not bound. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | `change`: the value changes when the thumb is let go; the thumb still moves. |
| `name` | `Bind<string>` | `''` | The name it is sent with in a form; a range sends two values. |
| `helpText, hint, prefix, suffix, icon` | see TextBox |  | The parts every field has; `prefix` and `suffix` sit at the two ends of the track. |
| `readOnly` | `Bind<boolean>` | `false` | Can be focused and read, not moved. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`: the rail and the thumbs. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width of what it sits in. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation, as in every field. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `thumbElements` | read-only | The thumb elements, `[start, end]` (the end one is hidden without `range`). |
| `isValid, validationMessage, validating` | read-only, reactive | As in every field. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `formatValue(value)` | `string` | A value written the way the bubble writes it. |
| `focus()` | `boolean` | Focuses the (first) thumb. |
| `validate() / resetValidation()` | `Promise<boolean>` / `void` | As in every field. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | A check ended. |
