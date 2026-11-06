import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Content from './examples/Content';
import Programmatic from './examples/Programmatic';
import Groups from './examples/Groups';
import Sizes from './examples/Sizes';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['src', '`Bind<string | null>`', '`null`', 'The picture. Until it loads, or when it cannot, the initials (else the person icon) show.'],
  ['name', '`Bind<string>`', "`''`", 'Whose avatar it is: the initials are made from it, and screen readers say it.'],
  ['initials', '`Bind<string>`', "`''`", 'Initials of your own instead of the ones made from `name`.'],
  ['label', '`Bind<string>`', "`''`", 'What screen readers say instead of the name.'],
  ['size', '`Bind<AvatarSize>`', "`'md'`", '`xs`, `sm`, `md`, `lg`, `xl`. In a group, the group’s.'],
  ['shape', '`Bind<AvatarShape>`', 'the language’s (`circle`)', '`circle`, `square` (with the language’s corners for its size).'],
  ['tone', '`Bind<AvatarTone>`', 'the language’s', '`standard`, `accent`, `info`, `success`, `caution`, `danger`, or `auto`: one taken from the name, the same for the same name everywhere. Material and Lilac take `accent`, the others `standard`.'],
  ['status', '`Bind<AvatarStatus | null>`', '`null`', '`online`, `away`, `busy`, `offline`: a presence dot on the lower end corner.'],
  ['visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'A value or a function, like the prop.'],
  ['shownInitials', 'read-only', 'The initials it shows: the ones given, else the ones made from the name.'],
  ['showsPicture', 'read-only', 'Whether the picture is what shows now (it loaded).'],
];

const GROUP_PROPS = [
  ['size', '`Bind<AvatarSize>`', "`'md'`", 'The size of every avatar in it.'],
  ['layout', '`Bind<AvatarGroupLayout>`', 'the language’s (`stack`)', '`stack`: each over the one before it; `spread`: side by side.'],
  ['max', '`Bind<number | null>`', '`null`', 'The most avatars shown; the others are counted in a `+N` after them.'],
  ['total', '`Bind<number | null>`', '`null`', 'How many there are in all, when only some are given; the rest are counted in the `+N`.'],
  ['label', '`Bind<string>`', "`''`", 'What screen readers call the group (“Members”).'],
];

const GROUP_PROPERTIES = [
  ['every prop above', 'read/write', 'A value or a function, like the prop.'],
  ['avatars', 'read-only', 'The elements of the avatars given, in order, from JSX lists too (the `+N` is not one of them).'],
  ['hiddenCount', 'read-only', 'How many are counted in the `+N`; 0 when it does not show.'],
];

const FUNCTIONS = [['initialsOf(name, locale)', '`string`', 'The initials an avatar makes of a name: the first letters of its first and last words, in the capitals of the language.']];

const A11Y = [
  ['Name', 'With a name or a label the avatar is an image with that name (`role="img"`); the presence is said after it (“Ada Lovelace, Away”).'],
  ['No name', 'An avatar with nothing to say (no name, no label, no presence) is hidden from screen readers.'],
  ['Picture', 'The picture has an empty `alt`: the avatar itself carries the name.'],
  ['Group', '`role="group"` with its label; the `+N` says how many are not shown (“8 more people”).'],
  ['Colour', 'The presence is not said by colour alone: it is in the name screen readers hear, and Fluent draws a mark in the dot.'],
];

const HOOKS = [
  ['.mx-avatar', 'The avatar. `data-size`, `data-shape`, `data-tone`.'],
  ['.mx-avatar__image', 'The picture. `data-pending` until it loads.'],
  ['.mx-avatar__initials, .mx-avatar__icon', 'The initials, and the person icon shown without them.'],
  ['.mx-avatar__status', 'The presence dot. `data-status`.'],
  ['.mx-avatar-group', 'The group. `data-size`, `data-layout`; an avatar it does not show has `data-beyond`.'],
  ['.mx-avatar-group__more', 'The `+N` avatar.'],
];

const TOKENS = [
  ['avatar.avatar', 'Unit: the avatar at rest (the standard tone) and in each tone.'],
  ['avatar.icon, avatar.status, avatar.status-icon', 'Units: the person icon; the presence dot (its ring, per presence); a mark inside the dot, per presence.'],
  ['avatar.size.*, avatar.font-size.*, avatar.icon-size.*, avatar.status-size.*, avatar.square-radius.*', 'The avatar, its initials, its icon, its dot and its square corners, per size.'],
  ['avatar.tone, avatar.shape', 'The tone and shape an avatar takes when none is given.'],
  ['avatar-group.stacked', 'Unit: the ring that parts a stacked avatar from the one it covers.'],
  ['avatar-group.overlap.*, avatar-group.gap.*, avatar-group.layout', 'How far stacked avatars go under each other, the space between spread ones, and the layout taken when none is given.'],
];

export default function AvatarPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Someone’s picture, or their initials, or a person icon, with their presence on its corner. A group stacks or spreads them and counts the ones it does not show." />
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
          <Rich text="Every prop takes a value or a function. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="content" title="Picture, initials, icon">
        <p>
          <Rich text="The picture shows once it has loaded; until then, and when it cannot load, the initials show. Without a name the person icon does." />
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
          <Rich text="`max` shows that many and counts the rest in a `+N`; `total` counts those not given as well. The group sets the size of all its avatars." />
        </p>
        <Example files={code('Groups.tsx')}>
          <Groups />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Initials are written in the capitals of the kit language (`uiLocale`): “ilgin” is “İ” in Turkish. The presence and the `+N` texts are kit texts (`presenceOnline` … `presenceOffline`, `avatarPresence`, `moreItems`, `avatarGroupMore`) and change with it." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
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
