# Card

> Display · @motifx-community/ui 0.1.0-beta.3

A surface holding one thing: a picture, a header with an avatar and titles, content and a row of actions. Parts with nothing in them are left out.

## Import

```tsx
import { Card } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop takes a value or a function. Created with `new`, the same properties are set programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Card, Stack } from '@motifx-community/ui';

/** A card from JSX follows its functions; one made with `new` takes the same properties programmatically. */
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

## Looks

```tsx
import { Button, Card, Stack, type CardVariant } from '@motifx-community/ui';

const VARIANTS: CardVariant[] = ['elevated', 'filled', 'outline'];

/** Each look with a header, content and actions. */
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

## Pictures

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

## Clickable

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
 * A link card: its title is the link and a press anywhere on it follows it (`rel="router"` hands it to the router);
 * its own button stays a button. A selectable card turns on and off with a press or its check box.
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

| Topic | How |
| --- | --- |
| `Name` | A `group` named by its title (`aria-labelledby`). |
| `Picture` | Adorns unless `mediaAlt` says what it shows. |
| `Clickable` | A Tab stop; Enter and Space press it. Buttons inside it stay buttons of their own. |
| `Link` | The title is a real link (read and followed as one); the card shows its focus. The card’s own buttons stay above it. |
| `Selectable` | A check box named “Select <title>” in the kit language; the card shows the selection with its frame. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-card` | The card. `data-variant`, `data-size`, `data-orientation`, `data-pressable`, `data-disabled`. |
| `.mx-card__media` | The picture. |
| `.mx-card__body` | Header, content and actions. |
| `.mx-card__header, .mx-card__avatar, .mx-card__heading, .mx-card__title, .mx-card__subtitle, .mx-card__action` | The header and its parts. |
| `.mx-card__content, .mx-card__footer` | The content, and the row of actions. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `card.card` | Unit: the card at rest, then `elevated`, `filled`, `outline`, `selected`, `hover`, `pressed`, `focus`, `disabled`. |
| `card.title, card.subtitle, card.content` | Units: the title, the line under it, the content’s text. |
| `card.padding.*, card.gap.*` | The space around and between the parts, per size. |
| `card.header-gap, card.footer-gap, card.media-width` | The space in the header and between actions; the picture’s width at the start. |
| `card.variant, card.footer-align` | The look a card takes when none is given; where the actions sit (Fluent: at the start, the others: at the end). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Bind<string>` | `''` | The title; it names the card for screen readers. |
| `subtitle` | `Bind<string>` | `''` | The line under the title. |
| `avatar` | `Bind<AvatarProps \| null>` | `null` | An avatar before the titles (its props). |
| `action` | `Bind<ComponentBase \| null>` | `null` | Something at the end of the header: a menu button, a badge. |
| `media` | `Bind<IconSource \| null>` | `null` | A picture running to the card’s edges: an image address, an element or a component. |
| `mediaAlt` | `Bind<string>` | `''` | What the picture shows, for screen readers, when `media` is an image address. Without it the picture only adorns. |
| `content` | `Bind<ComponentBase \| null>` | `null` | What fills the content, besides JSX children. |
| `footer` | `Bind<ComponentBase \| null>` | `null` | A row of actions under the content. A component replaced leaves the card and stays yours. |
| `variant` | `Bind<CardVariant>` | the language’s (`elevated`) | `elevated`, `filled`, `outline`. |
| `size` | `Bind<ControlSize>` | `'md'` | The space in and between the parts: `sm`, `md`, `lg`. |
| `orientation` | `Bind<CardOrientation>` | `'vertical'` | `horizontal` puts the picture at the start. |
| `clickable` | `Bind<boolean>` | `false` | The whole card can be pressed (`onclick`, Enter, Space). |
| `href` | `Bind<string \| null>` | `null` | The whole card is a link there: its title is the link, and a press anywhere on the card follows it. |
| `rel` | `Bind<string>` | `''` | The link’s `rel`; `router` lets the MotifJS router take it. |
| `selectable` | `Bind<boolean>` | `false` | A check box on its top end corner; a press on the card turns it on and off. |
| `selected` | `Bind<boolean>` | `false` | Whether it is selected. |
| `onSelectedChanged` | `CardSelectedChangedEventArgs` |  | It was selected or not any more (`selected`), by the user or by code (`byUser`). |
| `enabled, visible, tabStop` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `contentPart` | read-only | The part holding the content, for adding to it programmatically. |
| `avatarControl` | read-only | The avatar before the titles, when it has one. |
