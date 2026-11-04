# Skeleton

> Display · @motifx-community/ui 0.1.0-beta.0

The shape of what is loading, so the page keeps its layout while data arrives. Given content, it shows the content in the same place once loading ends.

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

## Until it loads

`loading` takes a value or a function; when it turns `false` the JSX children show instead.

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

## Movement

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

| Topic | How |
| --- | --- |
| `Loading` | A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language); the shapes are hidden from screen readers. |
| `Loaded` | The role and the busy state go; the content is read as it is. |
| `Motion` | Reduced motion keeps the wave and the pulse still: their duration follows the motion durations. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-skeleton` | The skeleton. `data-shape`, `data-animation`, `data-loading`. |
| `.mx-skeleton__bone` | One shape (a line, the block, the circle). |
| `.mx-skeleton__content` | What shows once loaded. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `skeleton.bone` | Unit: a shape, in each of `text`, `rect`, `circle`; its `color` is what the wave and the pulse mix in. |
| `skeleton.line-height, skeleton.line-gap, skeleton.last-line` | A line of text, the space between lines, the last line’s share of the width. |
| `skeleton.circle-size, skeleton.rect-height` | A circle or a block given no size. |
| `skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim` | How it moves when not told, how long, at what pace, and how strongly. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `shape` | `Bind<SkeletonShape>` | `'text'` | `text` (lines), `rect` (a block: a picture, a field), `circle` (an avatar). |
| `lines` | `Bind<number>` | `1` | How many lines of text; the last of several is shorter. |
| `width` | `Bind<string \| number \| null>` | the room it is in | A CSS length, or pixels as a number; a circle’s size (default: the language’s). |
| `height` | `Bind<string \| number \| null>` | a line / the language’s | A CSS length, or pixels as a number. |
| `animation` | `Bind<SkeletonAnimation>` | the language’s | `wave`, `pulse`, `none`. Fluent and the desktop languages sweep a wave, Material and Lilac pulse. |
| `loading` | `Bind<boolean>` | `true` | While `true` the skeleton shows; then its JSX children do. |
| `label` | `Bind<string>` | the kit’s “Loading…” | What screen readers say while it loads. |
| `visible` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `content` | read-only | The part holding what shows once loaded, for adding to it from code. |
