import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FromCode from './examples/FromCode';
import Overflow from './examples/Overflow';
import Sizes from './examples/Sizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly (BreadcrumbItem | string)[]>`', '`[]`', 'The steps, the current page last: `BreadcrumbItem`s (`text`, `href`, `icon`, `enabled`, `data`) or plain texts. A step with `href` is a link, one without a button.'],
  ['rel', '`Bind<string>`', "`''`", 'The links’ `rel`; `router` lets the MotifJS router take them (from the menu too).'],
  ['maxItems', '`Bind<number | null>`', 'as many as fit', 'The most steps shown; the first and the last stay, those between go into the menu.'],
  ['lastIsCurrent', '`Bind<boolean>`', '`true`', 'The last step is the current page: not pressable, `aria-current="page"`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['label', '`Bind<string>`', 'the kit’s “Breadcrumb”', 'What screen readers call it.'],
];

const MEMBERS = [
  ['onItemClick', 'event', 'A step was pressed, on the breadcrumb or in its menu (`item`, `index`); `cancel = true` keeps a link from being followed.'],
  ['collapsed', 'read-only', 'The indexes of the steps now in the menu.'],
];

const A11Y = [
  ['Landmark', 'A `nav` named “Breadcrumb” in the kit language, holding an ordered list. Several on one page: give each its own `label`.'],
  ['Current page', '`aria-current="page"`; it is not a link.'],
  ['Menu', 'The steps that do not fit are a menu behind a button named “More pages”; choosing one presses the step itself.'],
  ['Disabled', '`aria-disabled`; a disabled link loses its address.'],
];

const HOOKS = [
  ['.mx-breadcrumb', 'The breadcrumb. `data-size`.'],
  ['.mx-breadcrumb__list, .mx-breadcrumb__item', 'The list and each step.'],
  ['.mx-breadcrumb__link, .mx-breadcrumb__current, .mx-breadcrumb__text', 'A pressable step, the current page, a step’s text.'],
  ['.mx-breadcrumb__divider, .mx-breadcrumb__more', 'The divider after a step, and the menu of the steps that do not fit.'],
];

const TOKENS = [
  ['breadcrumb.link, .current, .divider', 'Units: a step (`hover`, `pressed`, `focus`, `disabled`), the current page, the divider (its shape: a chevron, a slash in Material).'],
  ['breadcrumb.height.*, .padding.*, .font-size.*', 'A step per size.'],
  ['breadcrumb.gap, .divider-size', 'The space around a divider, and its size.'],
];

export default function BreadcrumbPage() {
  return (
    <>
      <p class="lead">
        The way to the current page: each step a link or a button, the current page last. Steps that do not fit go
        into a menu after the first.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Breadcrumb } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Links and buttons">
        <p>
          <Rich text="A step with `href` is a link; `rel='router'` lets the MotifJS router take it. A step without one is a button: `onItemClick` tells it." />
        </p>
        <Example files={code('FromCode.tsx')}>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="overflow" title="When they do not fit">
        <Example files={code('Overflow.tsx')}>
          <Overflow />
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

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Events and properties</h3>
        <ApiTable head={['Member', 'Kind', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
