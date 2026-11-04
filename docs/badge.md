# Badge

> Display · @motifx-community/ui 0.1.0-beta.0

A short text, a count or a dot: in a line of text, or on a corner of a button, an avatar or an icon. A count over its maximum shows “99+”, a count of zero hides.

## Import

```tsx
import { Badge } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Badge, Button } from '@motifx-community/ui';

/** A badge from JSX follows its functions; one made with `new` takes the same properties from code. */
export default function FromCode() {
  const s = reactive({ unread: 4 });
  const coded = new Badge({ text: 'Beta', tone: 'info', variant: 'subtle' });

  return (
    <>
      <span>
        Inbox <Badge count={() => s.unread} label={() => `${s.unread} unread`} />
      </span>
      <Button text="Add one" variant="outline" onclick={() => s.unread++} />
      <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />
      <span onConfig={(c) => c.controls.add(coded)}>Search </span>
    </>
  );
}
```

## Tones and looks

```tsx
import { Badge, Stack, type BadgeTone, type BadgeVariant } from '@motifx-community/ui';

const TONES: BadgeTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const VARIANTS: BadgeVariant[] = ['solid', 'subtle', 'outline'];

/** Every tone in each look. */
export default function Tones() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Badge key={tone} text={tone} tone={tone} variant={variant} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
```

## Counts and dots

```tsx
import { reactive } from '@motifx/core';
import { Badge, NumberBox, Stack, Switch } from '@motifx-community/ui';

/** A count up to `max` and `max+` beyond it; at 0 it hides unless `showZero`; a dot says only that there is something. */
export default function Counts() {
  const s = reactive({ count: 120, max: 99, showZero: false });

  return (
    <>
      <NumberBox label="Count" min={0} x-model={() => s.count} />
      <NumberBox label="Max" min={1} x-model={() => s.max} />
      <Switch label="Show zero" x-model={() => s.showZero} />
      <Stack orientation="horizontal" align="center">
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} />
        <Badge count={() => s.count} max={() => s.max} showZero={() => s.showZero} variant="subtle" />
        <Badge count={() => s.count} dot label="Something new" />
      </Stack>
    </>
  );
}
```

## On a corner

`position` puts the badge on a corner of what it is in. `Badge.attach` does it from code, on any component.

```tsx
import { Badge, Button, Stack, type BadgePosition } from '@motifx-community/ui';

const CORNERS: BadgePosition[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start'];

/** On a corner of what it is in: `position` inside a button, or `Badge.attach` on any component (here a `<span>`). */
export default function OnCorner() {
  return (
    <Stack orientation="horizontal" wrap align="center" gap="xl">
      {CORNERS.map((corner) => (
        <Button key={corner} text={corner} variant="outline">
          <Badge count={7} position={corner} />
        </Button>
      ))}
      <span ref={(bell) => Badge.attach(bell, { dot: true, tone: 'danger', label: 'New notifications' })}>Notifications</span>
    </Stack>
  );
}
```

## Sizes

```tsx
import { Badge, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A badge and a dot in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <Stack key={size} orientation="horizontal" align="center">
          <Badge text={size} size={size} />
          <Badge count={42} size={size} variant="subtle" />
          <Badge dot size={size} />
        </Stack>
      ))}
    </>
  );
}
```

## Accessibility

| Topic | How |
| --- | --- |
| `Text` | Read where it stands, as part of what it is in. |
| `label` | With a label the badge is an image with that name (`role="img"`), so a count can say what it counts. |
| `Dot` | Without a label a dot is hidden from screen readers (`aria-hidden`): give it one when it says something. |
| `Colour` | The tone is never the only way something is said: pair a tone with a text or a label. |

## Localization

A count is written in the kit language (`uiLocale`), again when it changes: “1,234” in English, “1.234” in Turkish.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-badge` | The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`. |
| `.mx-badge-anchor` | What a badge on a corner sits on (`position: relative`). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `badge.badge` | Unit: the badge, at rest (solid, standard), in each look and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`. |
| `badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*` | The badge and the dot per size. |
| `badge.offset` | How far a badge on a corner sits in from it. |
| `badge.tone, badge.variant` | The tone and look a badge takes when none is given. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | A short text; shown while there is no `count`. |
| `count` | `Bind<number \| null>` | `null` | A count, written in the kit language; over `max` it shows `max+`. |
| `max` | `Bind<number>` | `99` | The highest count written as it is. |
| `showZero` | `Bind<boolean>` | `false` | A count of 0 shows; without it the badge hides at 0. |
| `dot` | `Bind<boolean>` | `false` | A dot only: there is something, without saying what. |
| `tone` | `Bind<BadgeTone>` | the language’s | `standard`, `accent`, `info`, `success`, `caution`, `danger`. Material marks counts in `danger`, the other languages in `accent`. |
| `variant` | `Bind<BadgeVariant>` | the language’s (`solid`) | `solid`, `subtle`, `outline`. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `position` | `Bind<BadgePosition \| null>` | `null` | `top-end`, `top-start`, `bottom-end`, `bottom-start`: on that corner of what it is in, which becomes its anchor. `start` and `end` follow the writing direction. |
| `label` | `Bind<string>` | `''` | What screen readers say (“3 unread messages”); without it they read the text. |
| `visible, tabStop` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `shownText` | read-only | What it shows now: the count as written (`99+`), else the text; `''` for a dot. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `Badge.attach(target, props?)` | `Badge` | Puts a badge on a corner of a component (`top-end` unless `props` says otherwise). It becomes one of its children and goes with it. |
