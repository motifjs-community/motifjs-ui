# ProgressBar and Spinner

> Feedback · @motifx-community/ui 0.1.0-beta.0

ProgressBar shows how far some work is, as a line or a circle, or that it runs when that is not known. Spinner says "busy, wait": a turning ring, alone or over a panel while it loads, shown only after a delay so quick work does not flash it.

## Import

```tsx
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; a function of a reactive object keeps the bar in step with the work. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, ProgressBar, Stack } from '@motifx-community/ui';

/** A bar that follows an upload, and bars created with `new` and added from code. */
export default function FromCode() {
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

  const addFromCode = () => {
    const bar = new ProgressBar({ label: `Task ${++added}`, showValue: true, tone: 'success' });
    bar.value = 25 * added;
    host?.controls.add(bar);
  };

  return (
    <>
      <ProgressBar label="Uploading" value={() => s.upload} showValue stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Upload" tone="accent" enabled={() => !s.uploading} onclick={upload} />
        <Button text="Add a bar from code" variant="outline" onclick={addFromCode} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Not known yet

Without a value (`null`) the bar runs to and fro; give it a number once the work can tell how far it is.

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

## Line or circle

`shape="circle"` draws the progress as an arc that goes round a ring from the top; without a value the arc turns. The caption goes under it (`labelPosition="bottom"`, its default), above it or beside it, and `size` sets the size of the circle and of its line. Where the design language gives it a wave (Material), the line and the arc swing while they grow, straight while little is done and again at the end.

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

## Sizes, caption beside, your own text

`size` sets the thickness. `labelPosition="side"` puts the label before the bar and the value after it. `valueText` writes the value its own way.

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

A spinner with `delay` stays unseen for that long, from when it is created or shown again. Quick work shows nothing; slow work shows the spinner.

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

## Cover a panel while it loads

`Spinner.cover(target)` lays a spinner over a component or an element and returns the function that takes it away. What is under it cannot be pressed or focused; focus that was inside waits on the spinner and comes back afterwards.

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Spinner, Stack, TextBox } from '@motifx-community/ui';

/** A spinner over a panel while its orders load; focus waits on it and comes back. */
export default function Cover() {
  const s = reactive({ result: '' });
  let panel: Panel | null = null;

  // Stands in for a call to the server.
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

| Topic | How |
| --- | --- |
| `ProgressBar` | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percent or `valueText`); none of them while the progress is not known. |
| `Spinner` | `role="progressbar"` without a value: an indicator of unknown progress, found and named like any widget. Not a `status` live region: those interrupt the reader each time one appears, and a page with many would be noisy. |
| `Name` | The label (`aria-labelledby`), or `uiLocale.strings.loading` when there is none. |
| `Cover` | The container gets `aria-busy="true"`; what is under the spinner is `inert`. Focus inside it moves to the spinner and comes back to where it was. |
| `Motion` | With reduced motion the bar rests as a tinted track, a new value is shown at once, a wave keeps still, and the arcs, the ring and the shape stand still. A wave is drawn only while the bar is in sight. |

## Localization

A bar or a spinner without a label is named `uiLocale.strings.loading`. The percent is written in `locale`, by default the page's `lang`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, ProgressBar, trStrings, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the name of unlabelled bars and spinners, and the language the percent is written in. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
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

| Hook | What it is |
| --- | --- |
| `.mx-progress` | The bar. `data-state="determinate \| indeterminate"`, `data-complete`, `data-shape`, `data-wave` (a wave is drawn), `data-tone`, `data-size`, `data-label-position`, `data-stretch`; `--_fraction`: how much is done, 0 to 1. |
| `.mx-progress__head, .mx-progress__label, .mx-progress__value` | The caption row. |
| `.mx-progress__track, .mx-progress__bar` | The line: the track (`::before`: the rest of it, `::after`: the stop dot) and the part done (`::after`: the runner). |
| `.mx-progress__wave` | The wave drawn over the track instead of the bar. |
| `.mx-progress__circle, .mx-progress__ring, .mx-progress__arc` | The circle: its drawing, the ring and the arc. |
| `.mx-spinner` | The spinner. `data-size`, `data-tone`, `data-label-position`, `data-contained`, `data-waiting`, `data-cover`. |
| `.mx-spinner__box` | The container of what turns. |
| `.mx-spinner__ring, .mx-spinner__shape, .mx-spinner__label` | The ring, the shape (the language shows one of them) and the label. |
| `[data-mx-covered]` | A container under `Spinner.cover`. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `progress.track, progress.bar, progress.rest, progress.stop, progress.runner, progress.wave` | Units of the line, each with its box: the band, the part done, the rest of the track, the stop dot, the runner, the wave (its colour). States: `indeterminate`, `complete`, the tones. |
| `progress.ring, progress.arc, progress.label, progress.value` | Units of the circle and of the caption. |
| `progress.thickness.*, progress.rest-thickness.*, progress.active-gap, progress.dot-size, progress.stop-inset` | The line per size, the gap after the part done, the dot. |
| `progress.wave-amplitude, wave-length, wave-speed, wave-direction, wave-start, wave-end, wave-grow-duration` | The wave: how far it swings (0: none), how long a wave is and how fast and which way it travels, between which shares of the work it swings, how long it takes to grow in. |
| `progress.ring-size.*, ring-thickness.*, ring-active-gap, ring-runner-length, ring-turn-duration, ring-wave-*` | The circle per size, its gaps, its turning arc and its wave. |
| `progress.width, progress.gap, progress.head-gap, progress.accent … danger-subtle` | The width when not stretched, the caption, the tones. |
| `spinner.size.*, spinner.ring-width.*, spinner.shape-size.*` | The ring and the shape per size. |
| `spinner.box, spinner.ring, spinner.shape` | Units: the container (`contained`), the ring and the shape, each with its box. |
| `spinner.shape-1 … spinner.shape-7, spinner.morph-duration, spinner.morph-easing, spinner.spin-duration` | The shapes the shape becomes in turn (names from the shapes of the kit), how long the round takes, how each is reached, and one turn. |
| `spinner.gap` | Between the ring and the label. |
| `spinner.cover-padding, spinner.cover-background` | The layer over a covered container. |

## API reference

### ProgressBar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | How far the work is. `null` (or no value) when that is not known: the bar runs to and fro, a circle turns. |
| `min / max` | `Bind<number>` | `0` / `100` | The bounds of `value`. |
| `label` | `Bind<string>` | `''` | A caption; it names the bar. The same property as `text`. |
| `shape` | `Bind<'line' \| 'circle'>` | `'line'` | `line`: a bar along a track; `circle`: an arc that goes round a ring from the top. |
| `labelPosition` | `Bind<'top' \| 'bottom' \| 'side'>` | `'top'` (`'bottom'` for a circle) | `top`: the label and the value above the bar; `bottom`: under it; `side`: the label before it, the value after it. |
| `showValue` | `Bind<boolean>` | `false` | Writes the percent (whole, rounded down) or `valueText`. |
| `valueText` | `(value, fraction) => string` | — | The text for a value, shown and read out (`3 of 12 files`). A function, so it is stored as it is, not bound. |
| `locale` | `Bind<string>` | the page's `lang` | The locale of the percent. |
| `tone` | `Bind<ProgressTone>` | `'accent'` | `accent`, `neutral`, `success`, `caution`, `danger`. |
| `size` | `Bind<ControlSize>` | `'md'` | The thickness, and the size of a circle: `sm`, `md`, `lg`. |
| `stretch` | `Bind<boolean>` | `false` | Fills the width of what it sits in. |
| `visible, enabled, …` | see Control |  | The shared properties of every control. |

### Spinner props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `Bind<string>` | `''` | Text next to the ring. The same property as `text`. |
| `labelPosition` | `Bind<'side' \| 'bottom'>` | `'side'` | After the ring or under it. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `tone` | `Bind<ProgressTone>` | `'accent'` | The color of the turning part. |
| `contained` | `Bind<boolean>` | `false` | Inside a container of its own (a disc behind it), where the design language draws one. |
| `delay` | `Bind<number>` | `0` | Milliseconds before it shows, from when it is created or shown again; quick work then shows nothing. |
| `visible, …` | see Control |  | Showing it again (`visible`) starts the delay again. |

### Properties and methods

| Member | Access / returns | Description |
| --- | --- | --- |
| `ProgressBar: every prop` | read/write, reactive | A value or a function, like the prop. |
| `ProgressBar: fraction` | read-only, reactive | How much is done, from 0 to 1; `null` while it is not known. |
| `Spinner: every prop` | read/write, reactive | A value or a function, like the prop. |
| `Spinner: waiting` | read-only | Still inside its delay. |
| `Spinner.cover(target, props?)` | `() => void` | Covers a component or an element with a spinner; call the returned function to take it away. See Cover. |
