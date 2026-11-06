# Rating

> Editors · @motifx-community/ui 0.1.0-beta.3

A row of stars for entering or displaying a score, in whole or half steps. Rating is a field, so the label, help text, rules and `x-model` work the same way as on any other field.

## Import

```tsx
import { Rating } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the score. On hover, the stars preview the score a click would set.

```tsx
import { reactive } from '@motifx/core';
import { Rating, Stack } from '@motifx-community/ui';

/** A rating bound with `x-model`, with a label and help text like any field, and one created with `new` programmatically. */
export default function Programmatic() {
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

## Half stars, sizes and tones

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

## Custom icons

```tsx
import { Rating } from '@motifx-community/ui';

// A custom heart as image addresses: an outline and a filled version, drawn in the star colors.
const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`)}`;
const HEART = 'M8 13.5S2 10 2 5.75A2.75 2.75 0 0 1 8 4.5a2.75 2.75 0 0 1 6 1.25C14 10 8 13.5 8 13.5z';
const EMPTY = svg(`<path d="${HEART}" fill="none" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>`);
const FILLED = svg(`<path d="${HEART}" fill="black"/>`);

/** Custom icons: a name from the kit's set, or an image address. */
export default function Icons() {
  return <Rating label="How much do you like it?" emptyIcon={EMPTY} filledIcon={FILLED} value={3} />;
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Arrow keys` | Increases or decreases the score by one step (by half with `step={0.5}`). |
| `Home, End` | Sets no stars (the minimum, without `allowClear`), or all stars. |
| `1 … 9` | Sets that number of stars. |
| `Delete, Backspace` | Clears the score (with `allowClear`). |

## Accessibility

| Topic | Details |
| --- | --- |
| `Role` | A `slider` from 0 to `max`, named by its label. The value is announced as “3 of 5” or “Not rated” in the kit language. |
| `Read-only` | `aria-readonly`. The stars only display the score. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-rating` | The field. `data-tone`, `data-size`, `data-readonly`, `data-disabled`. |
| `.mx-rating__stars` | The row of stars, which is the slider and receives focus. |
| `.mx-rating__item, .mx-rating__star, .mx-rating__fill` | One star, its empty shape and its filled part (`--_fill`: the filled share). |

### Component tokens

| Token | Description |
| --- | --- |
| `rating.stars, rating.item, rating.star, rating.fill` | Units: the row (focus, disabled), a star growing on hover, the empty shape, and the filled part in each tone. |
| `rating.size.*, rating.gap.*` | A star and the space between stars, per size. |
| `rating.tone` | The default tone. |
| `rating.field.*` | Place: the field below a rating, without a box. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The score, rounded to `step`. `null` means no score. `x-model` provides two-way binding. |
| `max` | `Bind<number>` | `5` | The number of stars. |
| `step` | `Bind<1 \| 0.5>` | `1` | `0.5` allows half stars, using the first half of a star or the arrow keys. |
| `allowClear` | `Bind<boolean>` | `true` | Clicking the selected value, or pressing Delete or Backspace, clears the score. |
| `preview` | `Bind<boolean>` | `true` | On hover, the stars preview the score a click would set. |
| `tone` | `Bind<RatingTone>` | Set by the design language | `accent` or `neutral`. For custom gold stars, set the color in `rating.fill.accent.bg`. |
| `emptyIcon, filledIcon` | `Bind<string \| null>` | Set by the design language | The shape of an empty and a filled star: a name from the kit's icon set, or an image address (drawn in the star colors). |
| `label, helpText, readOnly, required, rules, size…` | see Field |  | All standard field props, because a rating is a field. |
