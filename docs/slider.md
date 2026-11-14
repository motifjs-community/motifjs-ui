# Slider

> Editors · @motifx-community/ui 0.1.0-beta.10

Selects a value on a track by dragging a thumb or using the keyboard. It supports a single number or a range with two thumbs, steps, labeled tick marks, a value tooltip, a vertical orientation and number formatting, along with the label, help text and validation common to all fields.

## Import

```tsx
import { Slider, type SliderValue } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Slider, Stack } from '@motifx-community/ui';

/** A slider bound to state with x-model, and sliders created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ volume: 40, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
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
        <Button text="Add a slider programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="sl-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Range slider

With `range`, there are two thumbs and the value is `[start, end]`. The thumbs cannot cross, and `minDistance` keeps them apart. Clicking the track moves the nearest thumb.

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

## Centered slider

With `origin`, the active part of the track runs from that value to the thumb in either direction. Use it for values such as balance, offset or correction.

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

## Steps and tick marks

`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or divides the track into that many equal parts when set to a number. `tickLabels` shows the values under the marks.

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

## Value tooltip and format

`showValue` displays the value in a tooltip above the thumb, either while it moves (`drag`, which includes keyboard changes) or `always`. `format` formats it with `Intl.NumberFormat`, and `valueText` provides custom text for screen readers.

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

## Vertical orientation

`orientation="vertical"` makes the track vertical. Up is greater, and the Up arrow moves the thumb up.

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

## Update timing

By default, the value updates as the thumb is dragged. With `updateOn="change"`, it updates once when the thumb is released, which is useful for work that should not run on every movement, such as a search. Keyboard changes apply immediately in both cases.

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

## Sizes, read-only, disabled and validation

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

| Key | Description |
| --- | --- |
| `Right / Up arrow` | Increases the value by one step. On right-to-left pages, Left increases the value on a horizontal slider. |
| `Left / Down arrow` | Decreases the value by one step. |
| `Page Up / Page Down` | Increases or decreases the value by `largeStep`. |
| `Home / End` | Moves to the minimum or maximum. With two thumbs, the other thumb sets the limit. |
| `Tab` | Each thumb is a Tab stop. |
| `Alt + key (`&Name`)` | Sets focus on the first thumb. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Thumb` | `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-orientation`, and `aria-valuetext` when `format` or `valueText` is set. |
| `Name` | A single thumb is named by the label. Two thumbs sit in a `role="group"` named by the label, and each thumb is named by the label and its end ("Minimum", "Maximum"). |
| `Two thumbs` | The `aria-valuemax` of the start thumb is the value of the end thumb, and vice versa, as the APG multi-thumb slider pattern specifies. |
| `States` | `aria-readonly`, `aria-invalid` and `aria-disabled` on the thumbs. The help text describes them. |
| `Pointer` | The pointer is captured during a drag, and clicking the track moves the nearest thumb. The track is as tall as a touch target. |

## Localization

The names of the two thumbs in a range come from `uiLocale.strings` (`minimum`, `maximum`). Numbers use `locale`, which defaults to the page `lang`.

```tsx
import { reactive } from '@motifx/core';
import { Button, Slider, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the names of the thumbs; the price slider writes its numbers in the chosen language. */
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

| Hook | Description |
| --- | --- |
| `.mx-slider` | The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`, `data-split`. |
| `.mx-slider__control` | The pointer target: the track and the tick marks. |
| `.mx-slider__track, .mx-slider__rail` | The track and the rail that holds its segments (`--_from`, `--_to`; `data-from="start \| thumb \| origin"`, `data-to="thumb \| origin \| end"`, `data-start-active`, `data-end-active`). |
| `.mx-slider__fill, .mx-slider__segment` | The active segment and the inactive segments before and after it (`data-side`). |
| `.mx-slider__thumb` | A thumb's pressable area (`data-thumb="start \| end"`, `data-dragging`, `--_at`). |
| `.mx-slider__halo, .mx-slider__knob, .mx-slider__core` | The visual parts of a thumb, centered on it: a halo, the knob and the inner part of the knob. |
| `.mx-slider__bubble` | The value tooltip above a thumb. |
| `.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label` | The tick marks (`data-mark`, `data-active`, `--_at`) and their labels. |

### Component tokens

| Token | Description |
| --- | --- |
| `slider.track, slider.active, slider.stop` | Units: the inactive segments (`before`, `after`), the active segment (`from-start`, `to-end`) and the end dots (`active`), each with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`). |
| `slider.halo, slider.knob, slider.core` | Units: the visual parts of a thumb, with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`). |
| `slider.bubble, slider.bubble-arrow, slider.tick, slider.tick-label, slider.ring` | Units: the value tooltip and its arrow, the tick marks and labels, and a ring around the whole control during keyboard use. |
| `slider.track-thickness.*, slider.active-thickness.*` | The inactive and active segments, per size. |
| `slider.thumb-width.*, slider.thumb-height.*, slider.thumb-core-size.*` | The knob along and across the track, and its inner part, per size. |
| `slider.track-gap, slider.origin-gap, slider.stop-inset` | A track split around the thumbs and the origin, and the position of its end dots. |
| `slider.hit-size` | The height of the track for the pointer, and the touch target of a thumb. |
| `slider.vertical-length` | The length of a vertical slider. |
| `slider.tick-length, slider.tick-width, slider.tick-offset, slider.tick-gap, slider.tick-line-height, slider.tick-label-width` | The position of the tick marks and their labels. |
| `slider.bubble-gap, slider.bubble-arrow-size` | The distance between the tooltip and its thumb, and the tooltip arrow. |
| `field.width` | The width of a horizontal slider, the same as all fields. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| [number, number]>` | `min` / `[min, max]` | The value, or `[start, end]` with `range`. `x-model` provides two-way binding. The value is kept on a step and within the limits. |
| `label` | `Bind<string>` | `''` | The label. Writing `&Name` makes Alt+N move focus to the thumb. This is the same property as `text`. |
| `min / max` | `Bind<number>` | `0` / `100` | The limits. When they change, the value is adjusted and written back. |
| `step` | `Bind<number>` | `1` | The values a thumb stops at, counted from `min`. Use `0` for continuous values. |
| `largeStep` | `Bind<number>` | `10 × step` | The amount Page Up and Page Down move the thumb. |
| `range` | `Bind<boolean>` | `false` | Shows two thumbs, and the value is `[start, end]`. The thumbs cannot cross. |
| `minDistance` | `Bind<number>` | `0` | The minimum distance between the two thumbs. |
| `origin` | `Bind<number \| undefined>` | `undefined` | Creates a centered slider, where the active part of the track runs from this value to the thumb in either direction. It cannot be used with `range`. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | Makes the slider vertical, with higher values at the top. |
| `ticks` | `Bind<boolean \| number>` | `false` | `true` adds a mark at every step (up to 1000), and a number adds that many equal parts. |
| `tickLabels` | `Bind<boolean>` | `false` | Shows values under the marks, or at the two ends if there are no marks. |
| `showValue` | `Bind<'never' \| 'drag' \| 'always'>` | `'never'` | Shows a value tooltip above the thumb: never, while it moves (with the pointer or keyboard), or always. |
| `format` | `Bind<Intl.NumberFormatOptions \| null>` | `null` | The format used by the tooltip, the tick labels and screen readers. |
| `locale` | `Bind<string>` | The page `lang` | The locale of `format`. |
| `valueText` | `(value: number) => string` | — | The text screen readers announce for a value. Because it is a function, it is stored as is and not bound. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | With `change`, the value updates when the thumb is released. The thumb still moves during the drag. |
| `name` | `Bind<string>` | `''` | The name submitted with the form. A range submits two values. |
| `helpText, hint, prefix, suffix, icon` | see TextBox |  | Parts common to all fields. `prefix` and `suffix` appear at the two ends of the track. |
| `readOnly` | `Bind<boolean>` | `false` | The slider can receive focus and be read, but not moved. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md` or `lg`, which set the size of the rail and the thumbs. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width of its container. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation works the same way as for all fields. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `thumbParts` | read-only | The thumbs as components, `[start, end]`. The end thumb is hidden without `range`. |
| `isValid, validationMessage, validating` | read-only, reactive | These work the same way as on all fields. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `formatValue(value)` | `string` | Formats a value the same way as the tooltip. |
| `focus()` | `boolean` | Sets focus on the first thumb. |
| `validate() / resetValidation()` | `Promise<boolean>` / `void` | These work the same way as on all fields. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | Occurs when validation finishes. |

## Feedback

Loading issues…
