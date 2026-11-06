# Avatar and AvatarGroup

> Display · @motifx-community/ui 0.1.0-beta.4

Represents a person with a picture, initials or an icon, with an optional presence indicator on its corner. A group stacks or spreads avatars and counts the ones it does not show.

## Import

```tsx
import { Avatar, AvatarGroup } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Avatar, Button, Stack, type AvatarStatus } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** An avatar in JSX tracks its functions, and one created with `new` accepts the same properties programmatically. */
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

## Picture, initials and icon

The picture appears once it has loaded. Until then, or if it fails to load, the initials appear. Without a name, the person icon appears.

```tsx
import { Avatar, Stack } from '@motifx-community/ui';

// An inline SVG sunset, so that the example needs no network access.
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

`max` sets how many avatars are shown, and the rest are counted in a `+N`. `total` also counts people who are not provided. The group sets the size of all its avatars.

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

| Topic | Details |
| --- | --- |
| `Name` | With a name or label, the avatar is an image with that name (`role="img"`), and the presence follows it (“Ada Lovelace, Away”). |
| `No name` | An avatar with no name, label or presence is hidden from screen readers. |
| `Picture` | The picture has an empty `alt`, because the avatar carries the name. |
| `Group` | `role="group"` with its label. The `+N` states how many people are not shown (“8 more people”). |
| `Colour` | Presence is not conveyed by color alone. It is included in the name screen readers announce, and Fluent draws a mark in the dot. |

## Localization

Initials use the capitalization rules of the kit language (`uiLocale`), so “ilgin” becomes “İ” in Turkish. The presence and `+N` strings are kit strings (`presenceOnline` … `presenceOffline`, `avatarPresence`, `moreItems`, `avatarGroupMore`) and change with the language.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-avatar` | The avatar. `data-size`, `data-shape`, `data-tone`. |
| `.mx-avatar__image` | The picture. `data-pending` until it loads. |
| `.mx-avatar__initials, .mx-avatar__icon` | The initials, and the person icon shown without them. |
| `.mx-avatar__status` | The presence dot. `data-status`. |
| `.mx-avatar-group` | The group. `data-size`, `data-layout`. An avatar that is not shown has `data-beyond`. |
| `.mx-avatar-group__more` | The `+N` avatar. |

### Component tokens

| Token | Description |
| --- | --- |
| `avatar.avatar` | Unit: the avatar at rest (the standard tone) and in each tone. |
| `avatar.icon, avatar.status, avatar.status-icon` | Units: the person icon, the presence dot and its ring per status, and a mark inside the dot per status. |
| `avatar.size.*, avatar.font-size.*, avatar.icon-size.*, avatar.status-size.*, avatar.square-radius.*` | The avatar, its initials, its icon, its dot and its square corners, per size. |
| `avatar.tone, avatar.shape` | The default tone and shape. |
| `avatar-group.stacked` | Unit: the ring that separates a stacked avatar from the one it overlaps. |
| `avatar-group.overlap.*, avatar-group.gap.*, avatar-group.layout` | The overlap of stacked avatars, the gap between spread avatars, and the default layout. |

## API reference

### Avatar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `Bind<string \| null>` | `null` | The picture. Until it loads, or if it fails, the initials appear, or the person icon if there are none. |
| `name` | `Bind<string>` | `''` | The person's name. It is used to create the initials and is announced by screen readers. |
| `initials` | `Bind<string>` | `''` | Custom initials that replace the ones created from `name`. |
| `label` | `Bind<string>` | `''` | The text screen readers announce instead of the name. |
| `size` | `Bind<AvatarSize>` | `'md'` | `xs`, `sm`, `md`, `lg` or `xl`. In a group, the group's size applies. |
| `shape` | `Bind<AvatarShape>` | Set by the design language (`circle`) | `circle` or `square` (using the design language's corner radius for the size). |
| `tone` | `Bind<AvatarTone>` | Set by the design language | `standard`, `accent`, `info`, `success`, `caution`, `danger`, or `auto`, which derives a tone from the name so the same name always has the same tone. Material and Lilac use `accent`, and the others use `standard`. |
| `status` | `Bind<AvatarStatus \| null>` | `null` | `online`, `away`, `busy` or `offline`: a presence dot on the lower end corner. |
| `visible, tabStop` | see Control |  | Properties shared by all controls. |

### Avatar properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `shownInitials` | read-only | The displayed initials: the ones provided, otherwise the ones created from the name. |
| `showsPicture` | read-only | Indicates whether the picture has loaded and is currently shown. |

### AvatarGroup props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `Bind<AvatarSize>` | `'md'` | The size of every avatar in the group. |
| `layout` | `Bind<AvatarGroupLayout>` | Set by the design language (`stack`) | `stack` overlaps each avatar on the previous one, and `spread` places them side by side. |
| `max` | `Bind<number \| null>` | `null` | The maximum number of avatars shown. The others are counted in a `+N` after them. |
| `total` | `Bind<number \| null>` | `null` | The total number of people when only some are provided. The rest are counted in the `+N`. |
| `label` | `Bind<string>` | `''` | The accessible name of the group (“Members”). |

### AvatarGroup properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write | Accepts a value or a function, the same as the prop. |
| `avatars` | read-only | The elements of the provided avatars in order, including those from JSX lists. The `+N` is not included. |
| `hiddenCount` | read-only | The number of people counted in the `+N`, or 0 when it is not shown. |

### Functions

| Function | Returns | Description |
| --- | --- | --- |
| `initialsOf(name, locale)` | `string` | Creates initials from a name: the first letters of the first and last words, using the capitalization rules of the language. |

## Feedback

Loading issues…
