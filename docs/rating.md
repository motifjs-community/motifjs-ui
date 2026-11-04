# Rating

> Editors · @motifx-community/ui 0.1.0-beta.0

A row of stars to give a score or to show one, whole or by halves. It is a field: label, help text, rules and `x-model` work as in every field.

## Import

```tsx
import { Rating } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the score two-way. Under the pointer the stars show what a press would give.

```tsx
import { reactive } from '@motifx/core';
import { Rating, Stack } from '@motifx-community/ui';

/** A rating bound with `x-model`, with a label and a help line like any field; one made with `new` from code. */
export default function FromCode() {
  const s = reactive({ stars: 3 as number | null });
  const coded = new Rating({ label: 'Made in code', max: 10, value: 7 });

  return (
    <Stack gap="lg">
      <Rating label="Your rating" x-model={() => s.stars} helpText={() => (s.stars ? `You gave ${s.stars}` : 'Not rated yet')} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Halves, sizes, tones

```tsx
import { Rating, Stack, type ControlSize, type RatingTone } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const TONES: RatingTone[] = ['accent', 'neutral'];

/** Halves, each size and tone, and a score only shown (`readOnly`). */
export default function Looks() {
  return (
    <Stack gap="lg">
      <Rating label="By halves" step={0.5} value={3.5} />
      {SIZES.map((size) => (
        <Rating key={size} label={`Size ${size}`} size={size} value={4} />
      ))}
      {TONES.map((tone) => (
        <Rating key={tone} label={`Tone ${tone}`} tone={tone} value={2} />
      ))}
      <Rating label="Shown only" readOnly step={0.5} value={4.5} />
      <Rating label="Disabled" disabled value={3} />
    </Stack>
  );
}
```

## Icons of your own

```tsx
import { Rating } from '@motifx-community/ui';

// A heart of our own, as image addresses: an outline and a filled one, drawn in the stars' colours.
const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`)}`;
const HEART = 'M8 13.5S2 10 2 5.75A2.75 2.75 0 0 1 8 4.5a2.75 2.75 0 0 1 6 1.25C14 10 8 13.5 8 13.5z';
const EMPTY = svg(`<path d="${HEART}" fill="none" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>`);
const FILLED = svg(`<path d="${HEART}" fill="black"/>`);

/** Icons of your own: a name of the kit's set, or an image address. */
export default function Icons() {
  return <Rating label="How much do you like it?" emptyIcon={EMPTY} filledIcon={FILLED} value={3} />;
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Arrow keys` | One step up or down (by halves with `step={0.5}`). |
| `Home, End` | None (or the least, without `allowClear`), and every star. |
| `1 … 9` | That many stars. |
| `Delete, Backspace` | None (with `allowClear`). |

## Accessibility

| Topic | How |
| --- | --- |
| `Role` | A `slider` from 0 to `max`, named by its label; the value is said as “3 of 5”, or “Not rated”, in the kit language. |
| `Read-only` | `aria-readonly`; the stars only show the score. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-rating` | The field. `data-tone`, `data-size`, `data-readonly`, `data-disabled`. |
| `.mx-rating__stars` | The row of stars: the slider, which takes the focus. |
| `.mx-rating__item, .mx-rating__star, .mx-rating__fill` | One star, its empty shape and its filled part (`--_fill`: the share filled). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `rating.stars, rating.item, rating.star, rating.fill` | Units: the row (focus, disabled), a star growing under the pointer, the empty shape, the filled part in each tone. |
| `rating.size.*, rating.gap.*` | A star and the space between stars, per size. |
| `rating.tone` | The tone when none is given. |
| `rating.field.*` | Place: the field under a rating, without a box. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The score, rounded to `step`; `null`: none. Two-way with `x-model`. |
| `max` | `Bind<number>` | `5` | How many stars. |
| `step` | `Bind<1 \| 0.5>` | `1` | `0.5` takes halves: a press on a star’s first half, or the arrow keys. |
| `allowClear` | `Bind<boolean>` | `true` | A press on the value chosen, Delete or Backspace leave none. |
| `preview` | `Bind<boolean>` | `true` | Under the pointer, the stars show what a press would give. |
| `tone` | `Bind<RatingTone>` | the language’s | `accent`, `neutral`. Gold stars of your own: give `rating.fill.accent.bg` your colour. |
| `emptyIcon, filledIcon` | `Bind<string \| null>` | the language’s | The shape of an empty and of a filled star: a name of the kit’s icon set, or an image address (drawn in the stars’ colours). |
| `label, helpText, readOnly, required, rules, size…` | see Field |  | Everything a field has: a rating is one. |
