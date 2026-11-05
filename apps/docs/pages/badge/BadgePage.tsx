import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Counts from './examples/Counts';
import Programmatic from './examples/Programmatic';
import OnCorner from './examples/OnCorner';
import Sizes from './examples/Sizes';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'A short text; shown while there is no `count`.'],
  ['count', '`Bind<number | null>`', '`null`', 'A count, written in the kit language; over `max` it shows `max+`.'],
  ['max', '`Bind<number>`', '`99`', 'The highest count written as it is.'],
  ['showZero', '`Bind<boolean>`', '`false`', 'A count of 0 shows; without it the badge hides at 0.'],
  ['dot', '`Bind<boolean>`', '`false`', 'A dot only: there is something, without saying what.'],
  ['tone', '`Bind<BadgeTone>`', 'the language’s', '`standard`, `accent`, `info`, `success`, `caution`, `danger`. Material marks counts in `danger`, the other languages in `accent`.'],
  ['variant', '`Bind<BadgeVariant>`', 'the language’s (`solid`)', '`solid`, `subtle`, `outline`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['position', '`Bind<BadgePosition | null>`', '`null`', '`top-end`, `top-start`, `bottom-end`, `bottom-start`: on that corner of what it is in, which becomes its anchor. `start` and `end` follow the writing direction.'],
  ['label', '`Bind<string>`', "`''`", 'What screen readers say (“3 unread messages”); without it they read the text.'],
  ['visible, tabStop', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'A value or a function, like the prop.'],
  ['shownText', 'read-only', 'What it shows now: the count as written (`99+`), else the text; `\'\'` for a dot.'],
];

const METHODS = [
  [
    'Badge.attach(target, props?)',
    '`Badge`',
    'Puts a badge on a corner of a component (`top-end` unless `props` says otherwise). It becomes one of its children and goes with it.',
  ],
];

const A11Y = [
  ['Text', 'Read where it stands, as part of what it is in.'],
  ['label', 'With a label the badge is an image with that name (`role="img"`), so a count can say what it counts.'],
  ['Dot', 'Without a label a dot is hidden from screen readers (`aria-hidden`): give it one when it says something.'],
  ['Colour', 'The tone is never the only way something is said: pair a tone with a text or a label.'],
];

const HOOKS = [
  ['.mx-badge', 'The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`.'],
  ['.mx-badge-anchor', 'What a badge on a corner sits on (`position: relative`).'],
];

const TOKENS = [
  ['badge.badge', 'Unit: the badge, at rest (solid, standard), in each look and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`.'],
  ['badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*', 'The badge and the dot per size.'],
  ['badge.offset', 'How far a badge on a corner sits in from it.'],
  ['badge.tone, badge.variant', 'The tone and look a badge takes when none is given.'],
];

export default function BadgePage() {
  return (
    <>
      <p class="lead">
        A short text, a count or a dot: in a line of text, or on a corner of a button, an avatar or an icon. A count
        over its maximum shows “99+”, a count of zero hides.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Badge } from '@motifx-community/ui';
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

      <Section anchor="tones" title="Tones and looks">
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="counts" title="Counts and dots">
        <Example files={code('Counts.tsx')}>
          <Counts />
        </Example>
      </Section>

      <Section anchor="corner" title="On a corner">
        <p>
          <Rich text="`position` puts the badge on a corner of what it is in. `Badge.attach` does it programmatically, on any component." />
        </p>
        <Example files={code('OnCorner.tsx')}>
          <OnCorner />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example files={code('Sizes.tsx')}>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="A count is written in the kit language (`uiLocale`), again when it changes: “1,234” in English, “1.234” in Turkish." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
