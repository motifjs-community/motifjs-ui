# Badge

> Display · @motifx-community/ui 0.1.0-beta.3

A short text, count or dot, shown inline or on the corner of a button, avatar or icon. A count above its maximum displays as “99+”, and a count of zero is hidden.

## Import

```tsx
import { Badge } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Badge, Button } from '@motifx-community/ui';

/** A badge from JSX follows its functions; one made with `new` takes the same properties programmatically. */
export default function Programmatic() {
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

## Tones and appearance

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

## Corner placement

`position` places the badge on a corner of its container. `Badge.attach` does the same programmatically on any component.

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

| Topic | Details |
| --- | --- |
| `Text` | A badge is read in place, as part of its container. |
| `label` | With a label, the badge is an image with that name (`role="img"`), so a count can describe what it counts. |
| `Dot` | Without a label, a dot is hidden from screen readers (`aria-hidden`). Give it a label when it conveys information. |
| `Colour` | Do not rely on tone alone to convey meaning. Pair it with text or a label. |

## Localization

A count is formatted in the kit language (`uiLocale`) and updates when the language changes: “1,234” in English and “1.234” in Turkish.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-badge` | The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`. |
| `.mx-badge-anchor` | The element a corner badge is attached to (`position: relative`). |

### Component tokens

| Token | Description |
| --- | --- |
| `badge.badge` | Unit: the badge at rest (solid, standard), in each appearance and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`. |
| `badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*` | The badge and the dot, per size. |
| `badge.offset` | The offset of a corner badge from the corner. |
| `badge.tone, badge.variant` | The default tone and appearance. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | Short text, shown when there is no `count`. |
| `count` | `Bind<number \| null>` | `null` | A count formatted in the kit language. Above `max`, it shows `max+`. |
| `max` | `Bind<number>` | `99` | The highest count shown in full. |
| `showZero` | `Bind<boolean>` | `false` | Shows a count of 0. Without it, the badge hides at 0. |
| `dot` | `Bind<boolean>` | `false` | Shows a dot only, indicating that something is present. |
| `tone` | `Bind<BadgeTone>` | Set by the design language | `standard`, `accent`, `info`, `success`, `caution` or `danger`. Material uses `danger` for counts, and the other design languages use `accent`. |
| `variant` | `Bind<BadgeVariant>` | Set by the design language (`solid`) | `solid`, `subtle`, `outline`. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`. |
| `position` | `Bind<BadgePosition \| null>` | `null` | `top-end`, `top-start`, `bottom-end` or `bottom-start`: the corner of the container, which becomes its anchor. `start` and `end` follow the writing direction. |
| `label` | `Bind<string>` | `''` | The text announced by screen readers (“3 unread messages”). Without it, they read the badge text. |
| `visible, tabStop` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `shownText` | read-only | The current display text: the formatted count (`99+`), otherwise the text, or `''` for a dot. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `Badge.attach(target, props?)` | `Badge` | Places a badge on a corner of a component (`top-end` unless `props` specifies otherwise). The badge becomes a child of the component and is disposed with it. |
