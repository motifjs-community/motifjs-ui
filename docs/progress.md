# ProgressBar and Spinner

> Feedback · @motifx-community/ui 0.1.0-beta.7

ProgressBar shows how far an operation has progressed, as a line or a circle, or indicates activity when the progress is unknown. Spinner shows that the system is busy. It is a rotating ring that can stand alone or cover a panel while it loads, and it can wait for a delay so that quick operations do not cause a flash.

## Import

```tsx
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and a function that reads a reactive object keeps the bar in sync with the operation. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar, Stack } from '@motifx-community/ui';

/** A bar that follows an upload, and bars created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ upload: 0, uploading: false });
  let added = 0;
  let host: Stack | null = null;

  const upload = () => {
    if (s.uploading) return;
    s.uploading = true;
    s.upload = 0;
    const timer = setInterval(() => {
      s.upload = Math.min(100, s.upload + 7);
      if (s.upload < 100) return;
      clearInterval(timer);
      s.uploading = false;
    }, 120);
  };

  const addProgrammatic = () => {
    const bar = new ProgressBar({ label: `Task ${++added}`, showValue: true, tone: 'success' });
    bar.value = 25 * added;
    host?.controls.add(bar);
  };

  return (
    <>
      <ProgressBar label="Uploading" value={() => s.upload} showValue stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Upload" tone="accent" enabled={() => !s.uploading} onclick={upload} />
        <Button text="Add a bar programmatically" variant="outline" onclick={addProgrammatic} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Indeterminate progress

Without a value (`null`), the bar shows continuous motion. Set a number once the operation can report its progress.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar } from '@motifx-community/ui';

/** A bar without a value, and one that runs until the work knows how much there is to do. */
export default function NotKnown() {
  const copy = reactive({ done: 0, total: 12, running: false });

  const start = () => {
    copy.running = true;
    copy.done = 0;
    copy.total = 0;
    // The files are counted first; until then there is no total.
    setTimeout(() => {
      copy.total = 12;
      const timer = setInterval(() => {
        copy.done++;
        if (copy.done < copy.total) return;
        clearInterval(timer);
        copy.running = false;
      }, 150);
    }, 1000);
  };

  return (
    <>
      <ProgressBar label="Preparing" value={null} />
      <ProgressBar label="Copying" value={() => (copy.total ? copy.done : null)} max={() => copy.total} />
      <Button text="Copy" variant="outline" enabled={() => !copy.running} onclick={start} />
    </>
  );
}
```

## Linear and circular

`shape="circle"` draws the progress as an arc that runs around a ring from the top, and without a value the arc rotates. The label can appear below it (`labelPosition="bottom"`, the default), above it or next to it, and `size` sets the size of the circle and its stroke. Where the design language includes a wave (Material), the line and arc animate as they grow, and they stay straight at the very beginning and end.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar, Stack, type ControlSize } from '@motifx-community/ui';

const VALUES = [5, 30, 70, 100, null];

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The same values as a line and as a circle, a circle in each size, and one of each that follows some work. */
export default function Shapes() {
  const s = reactive({ done: 0, running: false });

  const run = () => {
    if (s.running) return;
    s.running = true;
    s.done = 0;
    const timer = setInterval(() => {
      s.done = Math.min(100, s.done + 4);
      if (s.done < 100) return;
      clearInterval(timer);
      s.running = false;
    }, 160);
  };

  return (
    <>
      {VALUES.map((value) => (
        <ProgressBar key={String(value)} label={value === null ? 'Not known' : 'Line'} value={value} showValue stretch />
      ))}
      <Stack orientation="horizontal" wrap align="start">
        {VALUES.map((value) => (
          <ProgressBar key={String(value)} shape="circle" label={value === null ? 'Not known' : 'Circle'} value={value} showValue />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        {SIZES.map((size) => (
          <ProgressBar key={size} shape="circle" size={size} label={`Size ${size}`} labelPosition="side" value={60} />
        ))}
      </Stack>
      <ProgressBar label="Importing" value={() => s.done} showValue stretch />
      <Stack orientation="horizontal" wrap align="center">
        <ProgressBar shape="circle" label="Importing" labelPosition="side" value={() => s.done} showValue />
        <Button text="Import" variant="outline" enabled={() => !s.running} onclick={run} />
      </Stack>
    </>
  );
}
```

## Tones

```tsx
import { ProgressBar, type ProgressTone } from '@motifx-community/ui';

const TONES: ProgressTone[] = ['accent', 'neutral', 'success', 'caution', 'danger'];

/** A bar in every tone. */
export default function Tones() {
  return (
    <>
      {TONES.map((tone, i) => (
        <ProgressBar key={tone} label={tone} value={20 + i * 18} tone={tone} showValue />
      ))}
    </>
  );
}
```

## Sizes, side labels and custom text

`size` sets the thickness. `labelPosition="side"` places the label before the bar and the value after it. `valueText` provides a custom value format.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The three thicknesses, and a bar with its label beside it and the value in its own words. */
export default function Sizes() {
  const s = reactive({ files: 3 });
  return (
    <>
      {SIZES.map((size) => (
        <ProgressBar key={size} label={`Size ${size}`} size={size} value={60} />
      ))}
      <ProgressBar label="Files" labelPosition="side" max={12} value={() => s.files} showValue valueText={(v) => `${v} of 12`} stretch />
      <Button text="One more file" size="sm" variant="outline" onclick={() => (s.files = s.files >= 12 ? 0 : s.files + 1)} />
    </>
  );
}
```

## Spinner

```tsx
import { Spinner, type ControlSize, type ProgressTone } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const TONES: ProgressTone[] = ['neutral', 'success', 'caution', 'danger'];

/** Spinners in every size, with a label beside or under them, in a container of their own, and in the tones. */
export default function Spinners() {
  return (
    <>
      {SIZES.map((size) => (
        <Spinner key={size} size={size} />
      ))}
      <Spinner label="Loading orders" />
      <Spinner label="Saving" labelPosition="bottom" size="lg" />
      <Spinner label="Syncing" labelPosition="bottom" size="lg" contained />
      {TONES.map((tone) => (
        <Spinner key={tone} tone={tone} size="sm" label={tone} />
      ))}
    </>
  );
}
```

## Delay

A spinner with `delay` stays hidden for that long after it is created or shown again. Quick operations show nothing, and slow ones show the spinner.

```tsx
import { reactive } from '@motifx/core';
import { Button, Spinner, Stack } from '@motifx-community/ui';

/** A spinner with a delay: quick work shows nothing, slow work shows it. */
export default function Delay() {
  const s = reactive({ busy: false, result: '' });

  const work = (ms: number) => {
    s.busy = true;
    s.result = '';
    setTimeout(() => {
      s.busy = false;
      s.result = `Done after ${ms} ms.`;
    }, ms);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Quick work (200 ms)" variant="outline" onclick={() => work(200)} />
        <Button text="Slow work (2 s)" variant="outline" onclick={() => work(2000)} />
        <Spinner label="Working" delay={400} visible={() => s.busy} />
      </Stack>
      <output class="pr-result">{() => s.result}</output>
    </>
  );
}
```

## Covering a panel while it loads

`Spinner.cover(target)` places a spinner over a component or element and returns a function that removes it. The content underneath cannot be clicked or focused. If focus was inside, it moves to the spinner and returns afterward.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Spinner, Stack, TextBox } from '@motifx-community/ui';

/** A spinner over a panel while its orders load. Focus waits on it and then returns. */
export default function Cover() {
  const s = reactive({ result: '' });
  let panel: Panel | null = null;

  // Simulates a server call.
  const loadOrders = () => new Promise((resolve) => setTimeout(resolve, 1500));

  const load = async () => {
    if (!panel) return;
    const done = Spinner.cover(panel, { label: 'Loading orders' });
    try {
      await loadOrders();
    } finally {
      done();
    }
    s.result = 'Orders loaded.';
  };

  return (
    <>
      <Panel class="pr-panel" variant="outline" padding="md" ref={(c: Panel) => (panel = c)}>
        <Stack orientation="horizontal" wrap align="center">
          <TextBox label="Customer" value="Ada" />
          <Button text="Load orders" tone="accent" onclick={load} />
        </Stack>
      </Panel>
      <output>{() => s.result}</output>
    </>
  );
}
```

## Accessibility

| Topic | Details |
| --- | --- |
| `ProgressBar` | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percentage or `valueText`). None of these are set while the progress is unknown. |
| `Spinner` | `role="progressbar"` without a value, which indicates unknown progress. It is not a `status` live region, because those interrupt the screen reader each time one appears, and a page with several would be noisy. |
| `Name` | Named by the label (`aria-labelledby`), or by `uiLocale.strings.loading` if there is none. |
| `Cover` | The container gets `aria-busy="true"`, and the content under the spinner is `inert`. Focus inside it moves to the spinner and returns when the spinner is removed. |
| `Motion` | With reduced motion, the bar rests as a tinted track, new values appear immediately, the wave stops, and the arcs, ring and shape are static. A wave is drawn only while the bar is visible. |

## Localization

A bar or spinner without a label is named `uiLocale.strings.loading`. The percentage uses `locale`, which defaults to the page `lang`.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the name of unlabelled bars and spinners, and the language the percent is written in. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <ProgressBar value={40} showValue locale={() => s.lang} />
      <span>
        Unlabelled ones are named <output class="pr-loading">{() => kitTexts.strings.loading}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-progress` | The bar. `data-state="determinate \| indeterminate"`, `data-complete`, `data-shape`, `data-wave` (a wave is drawn), `data-tone`, `data-size`, `data-label-position`, `data-stretch`, and `--_fraction` for the completed share from 0 to 1. |
| `.mx-progress__head, .mx-progress__label, .mx-progress__value` | The label row. |
| `.mx-progress__track, .mx-progress__bar` | The line: the track (`::before` for the remainder and `::after` for the stop dot) and the completed part (`::after` for the indeterminate runner). |
| `.mx-progress__wave` | The wave drawn over the track in place of the bar. |
| `.mx-progress__circle, .mx-progress__ring, .mx-progress__arc` | The circle: its drawing, the ring and the arc. |
| `.mx-spinner` | The spinner. `data-size`, `data-tone`, `data-label-position`, `data-contained`, `data-waiting`, `data-cover`. |
| `.mx-spinner__box` | The container of the rotating part. |
| `.mx-spinner__ring, .mx-spinner__shape, .mx-spinner__label` | The ring, the shape (the design language shows one of them) and the label. |
| `[data-mx-covered]` | A container under `Spinner.cover`. |

### Component tokens

| Token | Description |
| --- | --- |
| `progress.track, progress.bar, progress.rest, progress.stop, progress.runner, progress.wave` | Units of the line, each with its box: the band, the completed part, the remainder of the track, the stop dot, the runner and the wave color. States: `indeterminate`, `complete` and the tones. |
| `progress.ring, progress.arc, progress.label, progress.value` | Units of the circle and the label. |
| `progress.thickness.*, progress.rest-thickness.*, progress.active-gap, progress.dot-size, progress.stop-inset` | The line per size, the gap after the completed part, and the dot. |
| `progress.wave-amplitude, wave-length, wave-speed, wave-direction, wave-start, wave-end, wave-grow-duration` | The wave: its amplitude (0 for none), wavelength, speed and direction, the progress range where it animates, and how long it takes to appear. |
| `progress.ring-size.*, ring-thickness.*, ring-active-gap, ring-runner-length, ring-turn-duration, ring-wave-*` | The circle per size, its gaps, its rotating arc and its wave. |
| `progress.width, progress.gap, progress.head-gap, progress.accent … danger-subtle` | The width when not stretched, the label and the tones. |
| `spinner.size.*, spinner.ring-width.*, spinner.shape-size.*` | The ring and the shape, per size. |
| `spinner.box, spinner.ring, spinner.shape` | Units: the container (`contained`), the ring and the shape, each with its box. |
| `spinner.shape-1 … spinner.shape-7, spinner.morph-duration, spinner.morph-easing, spinner.spin-duration` | The sequence of shapes (names from the kit shapes), the cycle duration, the transition to each shape, and one rotation. |
| `spinner.gap` | The space between the ring and the label. |
| `spinner.cover-padding, spinner.cover-background` | The layer over a covered container. |

## API reference

### ProgressBar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The progress. Use `null` or omit it when the progress is unknown: the bar shows continuous motion and a circle rotates. |
| `min / max` | `Bind<number>` | `0` / `100` | The limits of `value`. |
| `label` | `Bind<string>` | `''` | A label that names the bar. This is the same property as `text`. |
| `shape` | `Bind<'line' \| 'circle'>` | `'line'` | `line` shows a bar along a track, and `circle` shows an arc around a ring from the top. |
| `labelPosition` | `Bind<'top' \| 'bottom' \| 'side'>` | `'top'` (`'bottom'` for a circle) | `top` places the label and value above the bar, `bottom` places them below it, and `side` places the label before it and the value after it. |
| `showValue` | `Bind<boolean>` | `false` | Shows the percentage, rounded down to a whole number, or `valueText`. |
| `valueText` | `(value, fraction) => string` | — | The text shown and announced for a value (`3 of 12 files`). Because it is a function, it is stored as is and not bound. |
| `locale` | `Bind<string>` | The page `lang` | The locale of the percentage. |
| `tone` | `Bind<ProgressTone>` | `'accent'` | `accent`, `neutral`, `success`, `caution`, `danger`. |
| `size` | `Bind<ControlSize>` | `'md'` | The thickness, and the size of a circle: `sm`, `md` or `lg`. |
| `stretch` | `Bind<boolean>` | `false` | Stretches to the full width of its container. |
| `visible, enabled, …` | see Control |  | Properties shared by all controls. |

### Spinner props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `Bind<string>` | `''` | Text next to the ring. This is the same property as `text`. |
| `labelPosition` | `Bind<'side' \| 'bottom'>` | `'side'` | Places the label after the ring or below it. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `tone` | `Bind<ProgressTone>` | `'accent'` | The color of the rotating part. |
| `contained` | `Bind<boolean>` | `false` | Places the spinner in its own container (a disc behind it), where the design language includes one. |
| `delay` | `Bind<number>` | `0` | The delay in milliseconds before it appears, counted from when it is created or shown again. Quick operations then show nothing. |
| `visible, …` | see Control |  | Showing it again with `visible` restarts the delay. |

### Properties and methods

| Member | Access / return value | Description |
| --- | --- | --- |
| `ProgressBar: every prop` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `ProgressBar: fraction` | read-only, reactive | The completed share from 0 to 1, or `null` while the progress is unknown. |
| `Spinner: every prop` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `Spinner: waiting` | read-only | Indicates that it is still within its delay. |
| `Spinner.cover(target, props?)` | `() => void` | Covers a component or element with a spinner. Call the returned function to remove it. See Covering a panel. |

## Feedback

Loading issues…
