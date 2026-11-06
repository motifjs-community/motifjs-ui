# Avatar and AvatarGroup

> Display · @motifx-community/ui 0.1.0-beta.3

Someone’s picture, or their initials, or a person icon, with their presence on its corner. A group stacks or spreads them and counts the ones it does not show.

## Import

```tsx
import { Avatar, AvatarGroup } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop takes a value or a function. Created with `new`, the same properties are set programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Avatar, Button, Stack, type AvatarStatus } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** An avatar from JSX follows its functions; one made with `new` takes the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ person: 0, status: 0 });
  const coded = new Avatar({ name: 'Edsger Dijkstra', tone: 'success', shape: 'square' });

  return (
    <Stack orientation="horizontal" wrap align="center">
      <Avatar name={() => PEOPLE[s.person]} status={() => STATUSES[s.status]} />
      <Button text="Next person" variant="outline" onclick={() => (s.person = (s.person + 1) % PEOPLE.length)} />
      <Button text="Next presence" variant="outline" onclick={() => (s.status = (s.status + 1) % STATUSES.length)} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
```

## Picture, initials, icon

The picture shows once it has loaded; until then, and when it cannot load, the initials show. Without a name the person icon does.

```tsx
import { Avatar, Stack } from '@motifx-community/ui';

// A picture of our own, so the example needs no network: a sunset as an SVG.
const PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="sky" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#3b5bdb"/><stop offset="1" stop-color="#f08c00"/></linearGradient></defs>' +
    '<rect width="64" height="64" fill="url(#sky)"/><circle cx="32" cy="40" r="12" fill="#ffd43b"/>' +
    '<path d="M0 46h64v18H0z" fill="#2b8a3e"/></svg>',
)}`;

/** A picture; initials when there is none or it cannot load; a person icon without a name. */
export default function Content() {
  return (
    <Stack orientation="horizontal" wrap align="center">
      <Avatar name="Ada Lovelace" src={PICTURE} />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Alan Turing" src="does-not-exist.png" />
      <Avatar initials="QA" label="Quality team" />
      <Avatar />
    </Stack>
  );
}
```

## Tones and shapes

```tsx
import { Avatar, Stack, type AvatarShape, type AvatarTone } from '@motifx-community/ui';

const TONES: AvatarTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const SHAPES: AvatarShape[] = ['circle', 'square'];
const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds'];

/** Every tone in each shape; `auto` takes a tone from the name, the same for the same name. */
export default function Tones() {
  return (
    <Stack>
      {SHAPES.map((shape) => (
        <Stack key={shape} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Avatar key={tone} name={tone} tone={tone} shape={shape} label={`${tone}, ${shape}`} />
          ))}
        </Stack>
      ))}
      <Stack orientation="horizontal" wrap align="center">
        {PEOPLE.map((name) => (
          <Avatar key={name} name={name} tone="auto" />
        ))}
      </Stack>
    </Stack>
  );
}
```

## Sizes and presence

```tsx
import { Avatar, Stack, type AvatarSize, type AvatarStatus } from '@motifx-community/ui';

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** Each size, with each presence. */
export default function Sizes() {
  return (
    <Stack>
      {STATUSES.map((status) => (
        <Stack key={status} orientation="horizontal" wrap align="center">
          {SIZES.map((size) => (
            <Avatar key={size} name="Grace Hopper" size={size} status={status} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
```

## Groups

`max` shows that many and counts the rest in a `+N`; `total` counts those not given as well. The group sets the size of all its avatars.

```tsx
import { Avatar, AvatarGroup, Stack } from '@motifx-community/ui';

const TEAM = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov'];

/** Stacked with the rest counted, side by side, and a total larger than the avatars given. */
export default function Groups() {
  return (
    <Stack gap="lg">
      <AvatarGroup max={3} label="Team">
        {TEAM.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup layout="spread" size="sm" label="Team">
        {TEAM.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup size="lg" total={42} label="Followers">
        {TEAM.slice(0, 3).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </Stack>
  );
}
```

## Accessibility

| Topic | How |
| --- | --- |
| `Name` | With a name or a label the avatar is an image with that name (`role="img"`); the presence is said after it (“Ada Lovelace, Away”). |
| `No name` | An avatar with nothing to say (no name, no label, no presence) is hidden from screen readers. |
| `Picture` | The picture has an empty `alt`: the avatar itself carries the name. |
| `Group` | `role="group"` with its label; the `+N` says how many are not shown (“8 more people”). |
| `Colour` | The presence is not said by colour alone: it is in the name screen readers hear, and Fluent draws a mark in the dot. |

## Localization

Initials are written in the capitals of the kit language (`uiLocale`): “ilgin” is “İ” in Turkish. The presence and the `+N` texts are kit texts (`presenceOnline` … `presenceOffline`, `avatarPresence`, `moreItems`, `avatarGroupMore`) and change with it.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-avatar` | The avatar. `data-size`, `data-shape`, `data-tone`. |
| `.mx-avatar__image` | The picture. `data-pending` until it loads. |
| `.mx-avatar__initials, .mx-avatar__icon` | The initials, and the person icon shown without them. |
| `.mx-avatar__status` | The presence dot. `data-status`. |
| `.mx-avatar-group` | The group. `data-size`, `data-layout`; an avatar it does not show has `data-beyond`. |
| `.mx-avatar-group__more` | The `+N` avatar. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `avatar.avatar` | Unit: the avatar at rest (the standard tone) and in each tone. |
| `avatar.icon, avatar.status, avatar.status-icon` | Units: the person icon; the presence dot (its ring, per presence); a mark inside the dot, per presence. |
| `avatar.size.*, avatar.font-size.*, avatar.icon-size.*, avatar.status-size.*, avatar.square-radius.*` | The avatar, its initials, its icon, its dot and its square corners, per size. |
| `avatar.tone, avatar.shape` | The tone and shape an avatar takes when none is given. |
| `avatar-group.stacked` | Unit: the ring that parts a stacked avatar from the one it covers. |
| `avatar-group.overlap.*, avatar-group.gap.*, avatar-group.layout` | How far stacked avatars go under each other, the space between spread ones, and the layout taken when none is given. |

## API reference

### Avatar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `Bind<string \| null>` | `null` | The picture. Until it loads, or when it cannot, the initials (else the person icon) show. |
| `name` | `Bind<string>` | `''` | Whose avatar it is: the initials are made from it, and screen readers say it. |
| `initials` | `Bind<string>` | `''` | Initials of your own instead of the ones made from `name`. |
| `label` | `Bind<string>` | `''` | What screen readers say instead of the name. |
| `size` | `Bind<AvatarSize>` | `'md'` | `xs`, `sm`, `md`, `lg`, `xl`. In a group, the group’s. |
| `shape` | `Bind<AvatarShape>` | the language’s (`circle`) | `circle`, `square` (with the language’s corners for its size). |
| `tone` | `Bind<AvatarTone>` | the language’s | `standard`, `accent`, `info`, `success`, `caution`, `danger`, or `auto`: one taken from the name, the same for the same name everywhere. Material and Lilac take `accent`, the others `standard`. |
| `status` | `Bind<AvatarStatus \| null>` | `null` | `online`, `away`, `busy`, `offline`: a presence dot on the lower end corner. |
| `visible, tabStop` | see Control |  | The shared properties of every control. |

### Avatar properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `shownInitials` | read-only | The initials it shows: the ones given, else the ones made from the name. |
| `showsPicture` | read-only | Whether the picture is what shows now (it loaded). |

### AvatarGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `Bind<AvatarSize>` | `'md'` | The size of every avatar in it. |
| `layout` | `Bind<AvatarGroupLayout>` | the language’s (`stack`) | `stack`: each over the one before it; `spread`: side by side. |
| `max` | `Bind<number \| null>` | `null` | The most avatars shown; the others are counted in a `+N` after them. |
| `total` | `Bind<number \| null>` | `null` | How many there are in all, when only some are given; the rest are counted in the `+N`. |
| `label` | `Bind<string>` | `''` | What screen readers call the group (“Members”). |

### AvatarGroup properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | A value or a function, like the prop. |
| `avatars` | read-only | The elements of the avatars given, in order, from JSX lists too (the `+N` is not one of them). |
| `hiddenCount` | read-only | How many are counted in the `+N`; 0 when it does not show. |

### Functions

| Function | Returns | Description |
| --- | --- | --- |
| `initialsOf(name, locale)` | `string` | The initials an avatar makes of a name: the first letters of its first and last words, in the capitals of the language. |
