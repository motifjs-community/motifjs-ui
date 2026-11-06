import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Content from './examples/Content';
import Programmatic from './examples/Programmatic';
import Groups from './examples/Groups';
import Sizes from './examples/Sizes';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['src', '`Bind<string | null>`', '`null`', 'The picture. Until it loads, or if it fails, the initials appear, or the person icon if there are none.'],
  ['name', '`Bind<string>`', "`''`", 'The person\'s name. It is used to create the initials and is announced by screen readers.'],
  ['initials', '`Bind<string>`', "`''`", 'Custom initials that replace the ones created from `name`.'],
  ['label', '`Bind<string>`', "`''`", 'The text screen readers announce instead of the name.'],
  ['size', '`Bind<AvatarSize>`', "`'md'`", '`xs`, `sm`, `md`, `lg` or `xl`. In a group, the group\'s size applies.'],
  ['shape', '`Bind<AvatarShape>`', 'Set by the design language (`circle`)', '`circle` or `square` (using the design language\'s corner radius for the size).'],
  ['tone', '`Bind<AvatarTone>`', 'Set by the design language', '`standard`, `accent`, `info`, `success`, `caution`, `danger`, or `auto`, which derives a tone from the name so the same name always has the same tone. Material and Lilac use `accent`, and the others use `standard`.'],
  ['status', '`Bind<AvatarStatus | null>`', '`null`', '`online`, `away`, `busy` or `offline`: a presence dot on the lower end corner.'],
  ['visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['shownInitials', 'read-only', 'The displayed initials: the ones provided, otherwise the ones created from the name.'],
  ['showsPicture', 'read-only', 'Indicates whether the picture has loaded and is currently shown.'],
];

const GROUP_PROPS = [
  ['size', '`Bind<AvatarSize>`', "`'md'`", 'The size of every avatar in the group.'],
  ['layout', '`Bind<AvatarGroupLayout>`', 'Set by the design language (`stack`)', '`stack` overlaps each avatar on the previous one, and `spread` places them side by side.'],
  ['max', '`Bind<number | null>`', '`null`', 'The maximum number of avatars shown. The others are counted in a `+N` after them.'],
  ['total', '`Bind<number | null>`', '`null`', 'The total number of people when only some are provided. The rest are counted in the `+N`.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the group (“Members”).'],
];

const GROUP_PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['avatars', 'read-only', 'The elements of the provided avatars in order, including those from JSX lists. The `+N` is not included.'],
  ['hiddenCount', 'read-only', 'The number of people counted in the `+N`, or 0 when it is not shown.'],
];

const FUNCTIONS = [['initialsOf(name, locale)', '`string`', 'Creates initials from a name: the first letters of the first and last words, using the capitalization rules of the language.']];

const A11Y = [
  ['Name', 'With a name or label, the avatar is an image with that name (`role="img"`), and the presence follows it (“Ada Lovelace, Away”).'],
  ['No name', 'An avatar with no name, label or presence is hidden from screen readers.'],
  ['Picture', 'The picture has an empty `alt`, because the avatar carries the name.'],
  ['Group', '`role="group"` with its label. The `+N` states how many people are not shown (“8 more people”).'],
  ['Colour', 'Presence is not conveyed by color alone. It is included in the name screen readers announce, and Fluent draws a mark in the dot.'],
];

const HOOKS = [
  ['.mx-avatar', 'The avatar. `data-size`, `data-shape`, `data-tone`.'],
  ['.mx-avatar__image', 'The picture. `data-pending` until it loads.'],
  ['.mx-avatar__initials, .mx-avatar__icon', 'The initials, and the person icon shown without them.'],
  ['.mx-avatar__status', 'The presence dot. `data-status`.'],
  ['.mx-avatar-group', 'The group. `data-size`, `data-layout`. An avatar that is not shown has `data-beyond`.'],
  ['.mx-avatar-group__more', 'The `+N` avatar.'],
];

const TOKENS = [
  ['avatar.avatar', 'Unit: the avatar at rest (the standard tone) and in each tone.'],
  ['avatar.icon, avatar.status, avatar.status-icon', 'Units: the person icon, the presence dot and its ring per status, and a mark inside the dot per status.'],
  ['avatar.size.*, avatar.font-size.*, avatar.icon-size.*, avatar.status-size.*, avatar.square-radius.*', 'The avatar, its initials, its icon, its dot and its square corners, per size.'],
  ['avatar.tone, avatar.shape', 'The default tone and shape.'],
  ['avatar-group.stacked', 'Unit: the ring that separates a stacked avatar from the one it overlaps.'],
  ['avatar-group.overlap.*, avatar-group.gap.*, avatar-group.layout', 'The overlap of stacked avatars, the gap between spread avatars, and the default layout.'],
];

export default function AvatarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Represents a person with a picture, initials or an icon, with an optional presence indicator on its corner. A group stacks or spreads avatars and counts the ones it does not show." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Avatar, AvatarGroup } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="content" title="Picture, initials and icon">
        <p>
          <Rich text="The picture appears once it has loaded. Until then, or if it fails to load, the initials appear. Without a name, the person icon appears." />
        </p>
        <Example files={code('Content.tsx')}>
          <Content />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones and shapes">
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes and presence">
        <Example files={code('Sizes.tsx')}>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="groups" title="Groups">
        <p>
          <Rich text="`max` sets how many avatars are shown, and the rest are counted in a `+N`. `total` also counts people who are not provided. The group sets the size of all its avatars." />
        </p>
        <Example files={code('Groups.tsx')}>
          <Groups />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Initials use the capitalization rules of the kit language (`uiLocale`), so “ilgin” becomes “İ” in Turkish. The presence and `+N` strings are kit strings (`presenceOnline` … `presenceOffline`, `avatarPresence`, `moreItems`, `avatarGroupMore`) and change with the language." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Avatar props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Avatar properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="AvatarGroup props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={GROUP_PROPS} />
        <h3>
          <Rich text="AvatarGroup properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={GROUP_PROPERTIES} />
        <h3>
          <Rich text="Functions" />
        </h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={FUNCTIONS} />
      </Section>
    </>
  );
}
