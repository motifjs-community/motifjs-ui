import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Overflow from './examples/Overflow';
import Sizes from './examples/Sizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly (BreadcrumbItem | string)[]>`', '`[]`', 'The steps, with the current page last: `BreadcrumbItem` objects (`text`, `href`, `icon`, `enabled`, `data`) or plain text. A step with `href` is a link, and one without is a button.'],
  ['rel', '`Bind<string>`', "`''`", 'The `rel` of the links. `router` lets the MotifJS router handle them, including from the menu.'],
  ['maxItems', '`Bind<number | null>`', 'As many as fit', 'The maximum number of steps shown. The first and last stay, and those in between move to the menu.'],
  ['lastIsCurrent', '`Bind<boolean>`', '`true`', 'Makes the last step the current page, which cannot be pressed and has `aria-current="page"`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['label', '`Bind<string>`', 'The kit string “Breadcrumb”', 'The accessible name.'],
];

const MEMBERS = [
  ['onItemClick', 'event', 'Occurs when a step is pressed, on the breadcrumb or in its menu (`item`, `index`). Set `cancel = true` to prevent following a link.'],
  ['collapsed', 'read-only', 'The indexes of the steps currently in the menu.'],
];

const A11Y = [
  ['Landmark', 'A `nav` named “Breadcrumb” in the kit language, containing an ordered list. If a page has several, give each one its own `label`.'],
  ['Current page', '`aria-current="page"`. The current page is not a link.'],
  ['Menu', 'Steps that do not fit go into a menu behind a button named “More pages”. Choosing one activates the step itself.'],
  ['Disabled state', '`aria-disabled`. A disabled link loses its address.'],
];

const HOOKS = [
  ['.mx-breadcrumb', 'The breadcrumb. `data-size`.'],
  ['.mx-breadcrumb__list, .mx-breadcrumb__item', 'The list and each step.'],
  ['.mx-breadcrumb__link, .mx-breadcrumb__current, .mx-breadcrumb__text', 'A pressable step, the current page and the step text.'],
  ['.mx-breadcrumb__divider, .mx-breadcrumb__more', 'The separator after a step, and the menu of overflow steps.'],
];

const TOKENS = [
  ['breadcrumb.link, .current, .divider', 'Units: a step (`hover`, `pressed`, `focus`, `disabled`), the current page, and the separator (its shape is a chevron, or a slash in Material).'],
  ['breadcrumb.height.*, .padding.*, .font-size.*', 'A step, per size.'],
  ['breadcrumb.gap, .divider-size', 'The spacing around a separator, and its size.'],
];

export default function BreadcrumbPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Shows the path to the current page. Each step is a link or button, and the current page comes last. Steps that do not fit move into a menu after the first step." />
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
          <Rich text="A step with `href` is a link, and `rel='router'` lets the MotifJS router handle it. A step without `href` is a button, and `onItemClick` reports the click." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="overflow" title="Overflow">
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
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
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
          <Rich text="Events and properties" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
