import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Counts from './examples/Counts';
import Programmatic from './examples/Programmatic';
import OnCorner from './examples/OnCorner';
import Sizes from './examples/Sizes';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'Short text, shown when there is no `count`.'],
  ['count', '`Bind<number | null>`', '`null`', 'A count formatted in the kit language. Above `max`, it shows `max+`.'],
  ['max', '`Bind<number>`', '`99`', 'The highest count shown in full.'],
  ['showZero', '`Bind<boolean>`', '`false`', 'Shows a count of 0. Without it, the badge hides at 0.'],
  ['dot', '`Bind<boolean>`', '`false`', 'Shows a dot only, indicating that something is present.'],
  ['tone', '`Bind<BadgeTone>`', 'Set by the design language', '`standard`, `accent`, `info`, `success`, `caution` or `danger`. Material uses `danger` for counts, and the other design languages use `accent`.'],
  ['variant', '`Bind<BadgeVariant>`', 'Set by the design language (`solid`)', '`solid`, `subtle`, `outline`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['position', '`Bind<BadgePosition | null>`', '`null`', '`top-end`, `top-start`, `bottom-end` or `bottom-start`: the corner of the container, which becomes its anchor. `start` and `end` follow the writing direction.'],
  ['label', '`Bind<string>`', "`''`", 'The text announced by screen readers (“3 unread messages”). Without it, they read the badge text.'],
  ['visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['shownText', 'read-only', 'The current display text: the formatted count (`99+`), otherwise the text, or `\'\'` for a dot.'],
];

const METHODS = [
  [
    'Badge.attach(target, props?)',
    '`Badge`',
    'Places a badge on a corner of a component (`top-end` unless `props` specifies otherwise). The badge becomes a child of the component and is disposed with it.',
  ],
];

const A11Y = [
  ['Text', 'A badge is read in place, as part of its container.'],
  ['label', 'With a label, the badge is an image with that name (`role="img"`), so a count can describe what it counts.'],
  ['Dot', 'Without a label, a dot is hidden from screen readers (`aria-hidden`). Give it a label when it conveys information.'],
  ['Colour', 'Do not rely on tone alone to convey meaning. Pair it with text or a label.'],
];

const HOOKS = [
  ['.mx-badge', 'The badge. `data-tone`, `data-variant`, `data-size`, `data-position`, `data-dot`, `data-empty`.'],
  ['.mx-badge-anchor', 'The element a corner badge is attached to (`position: relative`).'],
];

const TOKENS = [
  ['badge.badge', 'Unit: the badge at rest (solid, standard), in each appearance and tone (`accent` … `danger`, `subtle-*`, `outline-*`) and as a `dot`.'],
  ['badge.height.*, badge.dot-size.*, badge.font-size.*, badge.padding.*', 'The badge and the dot, per size.'],
  ['badge.offset', 'The offset of a corner badge from the corner.'],
  ['badge.tone, badge.variant', 'The default tone and appearance.'],
];

export default function BadgePage() {
  return (
    <>
      <p class="lead">
        <Rich text="A short text, count or dot, shown inline or on the corner of a button, avatar or icon. A count above its maximum displays as “99+”, and a count of zero is hidden." />
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
          <Rich text="Every prop accepts a value or a function. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones and appearance">
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="counts" title="Counts and dots">
        <Example files={code('Counts.tsx')}>
          <Counts />
        </Example>
      </Section>

      <Section anchor="corner" title="Corner placement">
        <p>
          <Rich text="`position` places the badge on a corner of its container. `Badge.attach` does the same programmatically on any component." />
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
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="A count is formatted in the kit language (`uiLocale`) and updates when the language changes: “1,234” in English and “1.234” in Turkish." />
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
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
