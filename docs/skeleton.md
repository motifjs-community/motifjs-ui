# Skeleton

> Display · @motifx-community/ui 0.1.0-beta.7

A placeholder that matches the shape of content that is loading, so the page keeps its layout while data arrives. If you provide content, it replaces the placeholder in the same place when loading ends.

## Import

```tsx
import { Skeleton } from '@motifx-community/ui';
```

## Shapes

```tsx
import { Skeleton, Stack } from '@motifx-community/ui';

/** Lines of text (the last of several is shorter), a block, and a circle. Lines and blocks take the width they are given. */
export default function Shapes() {
  return (
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">
      <Skeleton lines={3} />
      <Skeleton shape="rect" height={96} />
      <Stack orientation="horizontal" align="center">
        <Skeleton shape="circle" />
        <Skeleton shape="circle" width={24} />
      </Stack>
    </Stack>
  );
}
```

## Showing content after loading

`loading` accepts a value or a function. When it becomes `false`, the JSX children appear instead.

```tsx
import { reactive } from '@motifx/core';
import { Avatar, Button, Card, Skeleton, Stack } from '@motifx-community/ui';

/** While `loading`, the shape of the card shows; then the card itself, in the same place. */
export default function Loading() {
  const s = reactive({ loading: true });

  return (
    <Stack gap="lg" style="inline-size: 22rem; max-inline-size: 100%">
      <Button text={() => (s.loading ? 'Finish loading' : 'Load again')} variant="outline" onclick={() => (s.loading = !s.loading)} />
      <Card>
        <Stack orientation="horizontal" align="center">
          <Skeleton shape="circle" loading={() => s.loading}>
            <Avatar name="Grace Hopper" />
          </Skeleton>
          <Skeleton lines={2} loading={() => s.loading} grow>
            <strong>Grace Hopper</strong>
            <div>Wrote the first compiler.</div>
          </Skeleton>
        </Stack>
      </Card>
    </Stack>
  );
}
```

## Animation

```tsx
import { Skeleton, Stack, type SkeletonAnimation } from '@motifx-community/ui';

const ANIMATIONS: SkeletonAnimation[] = ['wave', 'pulse', 'none'];

/** Each way it moves; reduced motion keeps them all still. */
export default function Animations() {
  return (
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">
      {ANIMATIONS.map((animation) => (
        <Stack key={animation} gap="sm">
          <span>{animation}</span>
          <Skeleton lines={2} animation={animation} />
        </Stack>
      ))}
    </Stack>
  );
}
```

## Accessibility

| Topic | Details |
| --- | --- |
| `Loading` | A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language). The shapes are hidden from screen readers. |
| `Loaded` | The role and busy state are removed, and the content is read normally. |
| `Motion` | With reduced motion, the wave and pulse stay still, because their duration follows the motion tokens. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-skeleton` | The skeleton. `data-shape`, `data-animation`, `data-loading`. |
| `.mx-skeleton__bone` | A shape (a line, a block or a circle). |
| `.mx-skeleton__content` | The content shown after loading. |

### Component tokens

| Token | Description |
| --- | --- |
| `skeleton.bone` | Unit: a shape in `text`, `rect` and `circle`. `color` is the color the wave and pulse blend in. |
| `skeleton.line-height, skeleton.line-gap, skeleton.last-line` | A line of text, the space between lines, and the width of the last line. |
| `skeleton.circle-size, skeleton.rect-height` | The default size of a circle or block. |
| `skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim` | The default animation, its duration, easing and intensity. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `shape` | `Bind<SkeletonShape>` | `'text'` | `text` for lines, `rect` for a block such as an image or field, or `circle` for an avatar. |
| `lines` | `Bind<number>` | `1` | The number of text lines. The last of several lines is shorter. |
| `width` | `Bind<string \| number \| null>` | The available space | A CSS length, or a number in pixels. Also sets the size of a circle (the default comes from the design language). |
| `height` | `Bind<string \| number \| null>` | One line, or set by the design language | A CSS length, or a number in pixels. |
| `animation` | `Bind<SkeletonAnimation>` | Set by the design language | `wave`, `pulse` or `none`. Tactile, Lounge and Fluent use a wave, and Material and Lilac use a pulse. |
| `loading` | `Bind<boolean>` | `true` | Shows the skeleton while `true`, and then the JSX children. |
| `label` | `Bind<string>` | The kit string “Loading…” | The text announced by screen readers while loading. |
| `visible` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `content` | read-only | The part that holds the loaded content, for adding to it programmatically. |

## Feedback

Loading issues…
