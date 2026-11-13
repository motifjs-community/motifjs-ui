import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import LazySections from './examples/LazySections';
import OneOrSeveral from './examples/OneOrSeveral';
import VariantsAndSizes from './examples/VariantsAndSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<(string | number)[]>`', '`[]`', 'The keys of the open items (an item without a key uses its index). `x-model` provides two-way binding.'],
  ['multiple', '`Bind<boolean>`', '`false`', 'Allows several items to be open. Otherwise, opening one closes the other.'],
  ['collapsible', '`Bind<boolean>`', '`true`', 'With `false`, one item stays open, and its header has `aria-disabled` while it cannot close.'],
  ['headingLevel', '`Bind<number>`', '`3`', 'The `aria-level` of the headers (1 to 6). Match it to the surrounding headings.'],
  ['arrowKeys', '`Bind<boolean>`', '`true`', 'Up, Down, Home and End move between headers.'],
  ['regions', "`Bind<boolean | 'auto'>`", "`'auto'`", 'Makes sections `role=\"region\"` landmarks. `auto` applies when there are six items or fewer.'],
  ['variant', '`Bind<AccordionVariant>`', "`'list'`", '`list` (one bordered box), `separated` (a card per item) or `flush` (dividers only).'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['chevron', '`Bind<AccordionChevron>`', "`'end'`", 'The position of the chevron: `end`, `start` or `none`.'],
  ['lazy', '`Bind<boolean>`', '`true`', 'Creates a section when first opened and then keeps it. An item\'s own `lazy` takes precedence.'],
  ['keepAlive', '`Bind<boolean>`', '`true`', 'With `false`, content created by an item\'s `content` is disposed when it closes and recreated when it opens. An item\'s own `keepAlive` takes precedence.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const ITEM_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The header text. `&Shipping` makes Alt+S toggle the item. This is the same property as `text`.'],
  ['key', '`Bind<string>`', "`''`", 'Identifies the item in `value`. The JSX `key` also works.'],
  ['expanded', '`Bind<boolean>`', '`false`', 'Indicates whether the section is open.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon before the title.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip on the header.'],
  ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'From Accordion', 'This item\'s own setting.'],
  ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Creates the section content when it is created, either instead of or after the JSX children.'],
  ['enabled, visible', '`Bind<boolean>`', '`true`', 'A disabled item cannot be opened or closed, and a hidden item is removed.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['items', 'read-only, reactive', 'The items in order.'],
  ['expandedItems', 'read-only, reactive', 'The open items.'],
  ['AccordionItem.contentBuilt', 'read-only', 'Indicates whether its section has been created.'],
  ['AccordionItem.owner, headerPart, regionPart', 'read-only', 'Its `Accordion`, its header button and its region.'],
];

const METHODS = [
  ['add(item), insert(index, item)', '`AccordionItem`', 'Adds an item. An item from another `Accordion` moves here.'],
  ['remove(item)', '`boolean`', 'Removes the item and disposes it. Focus inside moves to an adjacent item.'],
  ['expandAll(), collapseAll()', '`void`', 'Programmatic control. `expandAll` requires `multiple`, and with `collapsible` off one item stays open.'],
  ['AccordionItem.expand(), collapse()', '`boolean`', 'Toggles as a click would, so the cancelable events run. `item.expanded = true` sets the state programmatically.'],
  ['focus()', '`boolean`', 'Sets focus on the item\'s header.'],
];

const EVENTS = [
  ['onExpanding(e), onCollapsing(e)', 'Occurs before the user opens or closes an item. `e`: `{ item, index, cancel, source, event? }`. Set `e.cancel = true` to keep the current state.'],
  ['onExpanded(e), onCollapsed(e)', 'Occurs after an item opens or closes. `e`: `{ item, index, byUser, source }`.'],
];

const KEYS = [
  ['Tab', 'Moves from header to header, and into an open section.'],
  ['Enter / Space', 'Expands or collapses the focused item.'],
  ['Down / Up', 'Moves to the next or previous header, wrapping at the ends (with `arrowKeys`).'],
  ['Home / End', 'Moves to the first or last header (with `arrowKeys`).'],
  ['Alt + key (`&Shipping`)', 'Moves focus to that header and toggles it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Header', 'A `<button>` with `aria-expanded` and `aria-controls`, inside an element with `role="heading"` and `aria-level` (`headingLevel`).'],
  ['Section', '`role="region"` named by its header (`aria-labelledby`) when there are six items or fewer, as the APG recommends. `regions` controls this.'],
  ['Closed sections', '`visibility: hidden` once closed, which removes it from the Tab order and the accessibility tree.'],
  ['Kept open', 'With `collapsible` off, the header of an item that cannot close has `aria-disabled="true"`.'],
  ['Motion', 'The height animates using the motion tokens, and reduced motion turns it off.'],
];

const HOOKS = [
  ['.mx-accordion', 'The root. `data-variant`, `data-size`, `data-chevron`, `data-disabled`.'],
  ['.mx-accordion__item', 'An item: `data-expanded`, `data-disabled`.'],
  ['.mx-accordion__heading, .mx-accordion__header', 'The heading and its button.'],
  ['.mx-accordion__icon, .mx-accordion__label, .mx-accordion__chevron', 'The parts of a header.'],
  ['.mx-accordion__region, .mx-accordion__body', 'The section (animated) and its content.'],
];

const TOKENS = [
  ['accordion.height.*, accordion.padding.*, accordion.font-size.*', 'Header sizes, from the density tokens.'],
  ['accordion.container, accordion.item', 'Units: the accordion and its items per variant (`list`, `list-next`, `separated`, `flush`; `expanded`).'],
  ['accordion.header, accordion.icon, accordion.chevron, accordion.plate, accordion.body', 'Units: a header (`expanded`, `hover`, `pressed`, `disabled`, `focus`), its icon, the chevron (`open`) and the plate behind it, and the open section.'],
  ['accordion.chevron-size, accordion.chevron-plate-size, accordion.content-padding', 'The sizes of the chevron and plate, and the spacing above and below the section content.'],
];

export default function AccordionPage() {
  return (
    <>
      <p class="lead">
        <Rich text="An accordion expands and collapses sections under their headers. It supports one or several open sections, sections that stay open, icons, three appearances and sections that are created when first opened." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Accordion, AccordionItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="The children of an `<AccordionItem>` are its section. `value` lists the keys of the open items, and `x-model` provides two-way binding. When you create the component with `new`, add and remove items programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="multiple" title="Single and multiple expansion">
        <p>
          <Rich text="By default, one item is open at a time. With `multiple`, several can be open. `collapsible={false}` keeps one open, so its header cannot close it." />
        </p>
        <Example files={code('OneOrSeveral.tsx')} stack>
          <OneOrSeveral />
        </Example>
      </Section>

      <Section anchor="lazy" title="Lazy sections">
        <p>
          <Rich text="A section is created when first opened and then kept (`lazy`, on by default). An item with a `content` factory and `keepAlive={false}` has its content disposed when it closes and recreated when it opens." />
        </p>
        <Example files={code('LazySections.tsx')} stack>
          <LazySections />
        </Example>
      </Section>

      <Section anchor="look" title="Variants and sizes">
        <Example files={code('VariantsAndSizes.tsx')} stack>
          <VariantsAndSizes />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
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
          <Rich text="Accordion props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="AccordionItem props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={ITEM_PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
        <p>
          <Rich text="The accordion has no strings of its own, so it adds nothing to `uiLocale`." />
        </p>
      </Section>
    </>
  );
}
