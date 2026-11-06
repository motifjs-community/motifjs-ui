# Card

> Display · @motifx-community/ui 0.1.0-beta.4

A surface for a single subject, with an optional image, a header with an avatar and titles, content and a row of actions. Empty parts are not rendered.

## Import

```tsx
import { Card } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Card, Stack } from '@motifx-community/ui';

/** A card in JSX tracks its functions, and one created with `new` accepts the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ following: false });
  const coded = new Card({ title: 'Made in code', subtitle: 'new Card({ … })', variant: 'outline' });

  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      <Card
        title="Ada Lovelace"
        subtitle={() => (s.following ? 'Following' : 'Mathematician')}
        avatar={{ name: 'Ada Lovelace' }}
        footer={<Button text={() => (s.following ? 'Unfollow' : 'Follow')} onclick={() => (s.following = !s.following)} />}
        style="inline-size: 18rem"
      >
        First to publish an algorithm meant to be carried out by a machine.
      </Card>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Appearance

```tsx
import { Button, Card, Stack, type CardVariant } from '@motifx-community/ui';

const VARIANTS: CardVariant[] = ['elevated', 'filled', 'outline'];

/** Each appearance with a header, content and actions. */
export default function Variants() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      {VARIANTS.map((variant) => (
        <Card
          key={variant}
          variant={variant}
          title={variant}
          subtitle="A card of this look"
          footer={
            <Stack orientation="horizontal" gap="sm">
              <Button text="Cancel" variant="ghost" />
              <Button text="Open" />
            </Stack>
          }
          style="inline-size: 16rem"
        >
          The same header, content and actions in each look.
        </Card>
      ))}
    </Stack>
  );
}
```

## Images

```tsx
import { Button, Card, Stack } from '@motifx-community/ui';
import { PICTURE } from './picture';

/** A picture above the rest, or at its start (`horizontal`); it runs to the card's edges and takes its corners. */
export default function Media() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      <Card media={PICTURE} mediaAlt="A sunset over a field" title="Sunset" subtitle="Above the rest" style="inline-size: 16rem">
        The picture runs to the edges.
      </Card>
      <Card
        media={PICTURE}
        orientation="horizontal"
        title="Sunset"
        subtitle="At the start"
        footer={<Button text="Save" variant="outline" />}
        style="inline-size: 24rem"
      >
        As tall as the card.
      </Card>
    </Stack>
  );
}
```

## Clickable cards

```tsx
import { reactive } from '@motifx/core';
import { Card, Stack } from '@motifx-community/ui';

const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];

/** The whole card can be pressed: with the mouse, Enter or Space. */
export default function Clickable() {
  const s = reactive({ chosen: '' });

  return (
    <Stack gap="lg">
      <Stack orientation="horizontal" wrap align="start">
        {PLACES.map((place) => (
          <Card key={place} title={place} subtitle="Press to choose" clickable onclick={() => (s.chosen = place)} style="inline-size: 12rem" />
        ))}
      </Stack>
      <span>{() => (s.chosen ? `Chosen: ${s.chosen}` : 'Nothing chosen yet')}</span>
    </Stack>
  );
}
```

## Links and selection

```tsx
import { reactive } from '@motifx/core';
import { Button, Card, Stack } from '@motifx-community/ui';

const PLACES = ['Istanbul', 'Lisbon', 'Kyoto'];

/**
 * A link card: its title is the link, and a click anywhere on the card follows it (`rel="router"` hands it to the router).
 * Its own button stays a button. A selectable card toggles with a click or with its check box.
 */
export default function Links() {
  const s = reactive({ picked: [] as string[] });
  const toggle = (place: string, on: boolean) => {
    s.picked = on ? [...s.picked, place] : s.picked.filter((p) => p !== place);
  };

  return (
    <Stack gap="lg">
      <Stack orientation="horizontal" wrap align="start">
        <Card title="Tokens" subtitle="A link to the tokens page" href="/tokens" rel="router" footer={<Button text="Later" variant="ghost" />} style="inline-size: 14rem" />
        <Card title="Keyboard" subtitle="A link to the keyboard page" href="/keyboard" rel="router" style="inline-size: 14rem" />
      </Stack>
      <Stack orientation="horizontal" wrap align="start">
        {PLACES.map((place) => (
          <Card
            key={place}
            title={place}
            subtitle="Press to pick"
            selectable
            selected={() => s.picked.includes(place)}
            onSelectedChanged={(e) => e.byUser && toggle(place, e.selected)}
            style="inline-size: 12rem"
          />
        ))}
      </Stack>
      <span>{() => `Picked: ${s.picked.join(', ') || 'none'}`}</span>
    </Stack>
  );
}
```

## Sizes

```tsx
import { Card, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The space in and between the parts, per size. */
export default function Sizes() {
  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      {SIZES.map((size) => (
        <Card key={size} size={size} title={`Size ${size}`} subtitle="Grace Hopper" avatar={{ name: 'Grace Hopper' }} style="inline-size: 15rem">
          Content of the card.
        </Card>
      ))}
    </Stack>
  );
}
```

## Accessibility

| Topic | Details |
| --- | --- |
| `Name` | A `group` named by its title (`aria-labelledby`). |
| `Picture` | Decorative unless `mediaAlt` describes it. |
| `Clickable cards` | A Tab stop that responds to Enter and Space. Buttons inside it remain independent. |
| `Link` | The title is a real link, and the card shows its focus state. The card's own buttons stay above it. |
| `Selectable` | A check box named “Select <title>” in the kit language. The card shows the selection with its frame. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-card` | The card. `data-variant`, `data-size`, `data-orientation`, `data-pressable`, `data-disabled`. |
| `.mx-card__media` | The image. |
| `.mx-card__body` | The header, content and actions. |
| `.mx-card__header, .mx-card__avatar, .mx-card__heading, .mx-card__title, .mx-card__subtitle, .mx-card__action` | The header and its parts. |
| `.mx-card__content, .mx-card__footer` | The content and the action row. |

### Component tokens

| Token | Description |
| --- | --- |
| `card.card` | Unit: the card at rest, then `elevated`, `filled`, `outline`, `selected`, `hover`, `pressed`, `focus` and `disabled`. |
| `card.title, card.subtitle, card.content` | Units: the title, the subtitle and the content text. |
| `card.padding.*, card.gap.*` | The spacing around and between the parts, per size. |
| `card.header-gap, card.footer-gap, card.media-width` | The spacing in the header and between actions, and the width of an image at the start. |
| `card.variant, card.footer-align` | The default appearance, and the action alignment (start in Fluent, end in the other design languages). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The title, which also provides the accessible name of the card. |
| `subtitle` | `Bind<string>` | `''` | Text below the title. |
| `avatar` | `Bind<AvatarProps \| null>` | `null` | An avatar before the titles (its props). |
| `action` | `Bind<ComponentBase \| null>` | `null` | Content at the end of the header, such as a menu button or a badge. |
| `media` | `Bind<IconSource \| null>` | `null` | An image that extends to the card edges: an image address, an element or a component. |
| `mediaAlt` | `Bind<string>` | `''` | Alternative text for the image when `media` is an image address. Without it, the image is decorative. |
| `content` | `Bind<ComponentBase \| null>` | `null` | The content, in addition to JSX children. |
| `footer` | `Bind<ComponentBase \| null>` | `null` | A row of actions below the content. A replaced component is removed from the card and stays under your control. |
| `variant` | `Bind<CardVariant>` | Set by the design language (`elevated`) | `elevated`, `filled`, `outline`. |
| `size` | `Bind<ControlSize>` | `'md'` | The spacing inside and between the parts: `sm`, `md` or `lg`. |
| `orientation` | `Bind<CardOrientation>` | `'vertical'` | `horizontal` places the image at the start. |
| `clickable` | `Bind<boolean>` | `false` | Makes the whole card pressable (`onclick`, Enter, Space). |
| `href` | `Bind<string \| null>` | `null` | Makes the whole card a link. The title is the link, and clicking anywhere on the card follows it. |
| `rel` | `Bind<string>` | `''` | The `rel` of the link. `router` lets the MotifJS router handle it. |
| `selectable` | `Bind<boolean>` | `false` | Adds a check box on the top end corner, and clicking the card toggles it. |
| `selected` | `Bind<boolean>` | `false` | Indicates whether the card is selected. |
| `onSelectedChanged` | `CardSelectedChangedEventArgs` |  | Occurs when the selection changes (`selected`), either by the user or programmatically (`byUser`). |
| `enabled, visible, tabStop` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `contentPart` | read-only | The part that holds the content, for adding to it programmatically. |
| `avatarControl` | read-only | The avatar before the titles, if there is one. |

## Feedback

Loading issues…
