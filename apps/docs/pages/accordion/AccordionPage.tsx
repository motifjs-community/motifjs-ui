import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import LazySections from './examples/LazySections';
import OneOrSeveral from './examples/OneOrSeveral';
import VariantsAndSizes from './examples/VariantsAndSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<(string | number)[]>`', '`[]`', 'The open items\' keys (an item without a key: its index). `x-model` binds it two-way.'],
  ['multiple', '`Bind<boolean>`', '`false`', 'Several items can be open; otherwise opening one closes the other.'],
  ['collapsible', '`Bind<boolean>`', '`true`', '`false`: one item stays open; its header has `aria-disabled` while it may not close.'],
  ['headingLevel', '`Bind<number>`', '`3`', 'The `aria-level` of the headers (1 to 6): fit it to the headings around.'],
  ['arrowKeys', '`Bind<boolean>`', '`true`', 'Up, Down, Home and End move between the headers.'],
  ['regions', "`Bind<boolean | 'auto'>`", "`'auto'`", 'Sections are `role=\"region\"` landmarks; `auto` while there are six items or fewer.'],
  ['variant', '`Bind<AccordionVariant>`', "`'list'`", '`list` (one bordered box), `separated` (a card per item), `flush` (lines only).'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['chevron', '`Bind<AccordionChevron>`', "`'end'`", 'Where the open/closed arrow sits: `end`, `start`, `none`.'],
  ['lazy', '`Bind<boolean>`', '`true`', 'A section is built when first opened, then kept. An item\'s own `lazy` wins.'],
  ['keepAlive', '`Bind<boolean>`', '`true`', '`false`: what an item\'s `content` made is disposed when it closes and made again when it opens. An item\'s own `keepAlive` wins.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const ITEM_PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The header text; `&Shipping` makes Alt+S open or close it. The same property as `text`.'],
  ['key', '`Bind<string>`', "`''`", 'Names the item in `value`. The JSX `key` works too.'],
  ['expanded', '`Bind<boolean>`', '`false`', 'Whether the section is open.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon before the title.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip on the header.'],
  ['lazy, keepAlive', '`Bind<boolean | undefined>`', 'the Accordion', 'This item\'s own setting.'],
  ['content', '`() => ComponentBase | ComponentBase[]`', '—', 'Makes the section content when it is built: instead of, or after, the JSX children.'],
  ['enabled, visible', '`Bind<boolean>`', '`true`', 'A disabled item cannot be opened or closed; a hidden one is left out.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['items', 'read-only, reactive', 'The items, in order.'],
  ['expandedItems', 'read-only, reactive', 'The open items.'],
  ['AccordionItem.contentBuilt', 'read-only', 'Whether its section has been built.'],
  ['AccordionItem.owner, headerElement, regionElement', 'read-only', 'Its `Accordion`, its header button, its region.'],
];

const METHODS = [
  ['add(item), insert(index, item)', '`AccordionItem`', 'Adds an item. An item of another `Accordion` moves here.'],
  ['remove(item)', '`boolean`', 'Removes the item and disposes it; focus inside moves to a neighbour.'],
  ['expandAll(), collapseAll()', '`void`', 'Programmatically. `expandAll` needs `multiple`; with `collapsible` off one item stays open.'],
  ['AccordionItem.expand(), collapse()', '`boolean`', 'As a click would: the cancelable events run. `item.expanded = true` sets it programmatically.'],
  ['focus()', '`boolean`', 'An item focuses its header.'],
];

const EVENTS = [
  ['onExpanding(e), onCollapsing(e)', 'The user is about to open / close an item. `e`: `{ item, index, cancel, source, event? }`; `e.cancel = true` leaves it.'],
  ['onExpanded(e), onCollapsed(e)', 'An item opened / closed. `e`: `{ item, index, byUser, source }`.'],
];

const KEYS = [
  ['Tab', 'From header to header, and into an open section.'],
  ['Enter / Space', 'Opens or closes the focused item.'],
  ['Down / Up', 'The next / previous header, wrapping around (with `arrowKeys`).'],
  ['Home / End', 'The first / last header (with `arrowKeys`).'],
  ['Alt + key (`&Shipping`)', 'Focuses that header and opens or closes it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Header', 'A `<button>` with `aria-expanded` and `aria-controls`, inside an element with `role="heading"` and `aria-level` (`headingLevel`).'],
  ['Section', '`role="region"` named by its header (`aria-labelledby`) while there are six items or fewer, as the APG suggests; `regions` decides.'],
  ['Closed sections', '`visibility: hidden` once closed: out of the Tab order and the accessibility tree.'],
  ['Kept open', 'With `collapsible` off, the header of the item that may not close has `aria-disabled="true"`.'],
  ['Motion', 'The height animates with the motion tokens; reduced motion turns it off.'],
];

const HOOKS = [
  ['.mx-accordion', 'The root. `data-variant`, `data-size`, `data-chevron`, `data-disabled`.'],
  ['.mx-accordion__item', 'An item: `data-expanded`, `data-disabled`.'],
  ['.mx-accordion__heading, .mx-accordion__header', 'The heading and the button in it.'],
  ['.mx-accordion__icon, .mx-accordion__label, .mx-accordion__chevron', 'The parts of a header.'],
  ['.mx-accordion__region, .mx-accordion__body', 'The section (animated) and its content.'],
];

const TOKENS = [
  ['accordion.height.*, accordion.padding.*, accordion.font-size.*', 'Header sizes, from the density tokens.'],
  ['accordion.container, accordion.item', 'Units: the accordion and its items per variant (`list`, `list-next`, `separated`, `flush`; `expanded`).'],
  ['accordion.header, accordion.icon, accordion.chevron, accordion.plate, accordion.body', 'Units: a header (`expanded`, `hover`, `pressed`, `disabled`, `focus`), its icon, the chevron (`open`) and a plate behind it, the open section.'],
  ['accordion.chevron-size, accordion.chevron-plate-size, accordion.content-padding', 'The chevron’s and the plate’s sizes; the space above and below a section\'s content.'],
];

export default function AccordionPage() {
  return (
    <>
      <p class="lead">
        An accordion opens and closes sections under their headers: one at a time or several, kept open, with icons,
        three looks and sections built when they are first opened.
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
          <Rich text="An `<AccordionItem>`'s children are its section. `value` lists the open items' keys and `x-model` binds it two-way. Created with `new`, items are added and removed programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="multiple" title="One or several open">
        <p>
          <Rich text="One item is open at a time; with `multiple` several can be. `collapsible={false}` keeps one open: its header cannot close it." />
        </p>
        <Example files={code('OneOrSeveral.tsx')} stack>
          <OneOrSeveral />
        </Example>
      </Section>

      <Section anchor="lazy" title="Lazy sections">
        <p>
          <Rich text="A section is built when it is first opened and kept afterwards (`lazy`, on by default). An item with a `content` factory and `keepAlive={false}` has its content disposed when it closes and made again when it opens." />
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
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
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
        <h3>Accordion props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>AccordionItem props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={ITEM_PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
        <p>
          <Rich text="The accordion writes no text of its own, so it has nothing in `uiLocale`." />
        </p>
      </Section>
    </>
  );
}
