import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Clickable from './examples/Clickable';
import Programmatic from './examples/Programmatic';
import Links from './examples/Links';
import Media from './examples/Media';
import Sizes from './examples/Sizes';
import Variants from './examples/Variants';

const code = sources(import.meta.glob('./examples/*.tsx', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['title', '`Bind<string>`', "`''`", 'The title; it names the card for screen readers.'],
  ['subtitle', '`Bind<string>`', "`''`", 'Text below the title.'],
  ['avatar', '`Bind<AvatarProps | null>`', '`null`', 'An avatar before the titles (its props).'],
  ['action', '`Bind<ComponentBase | null>`', '`null`', 'Something at the end of the header: a menu button, a badge.'],
  ['media', '`Bind<IconSource | null>`', '`null`', 'A picture running to the card’s edges: an image address, an element or a component.'],
  ['mediaAlt', '`Bind<string>`', "`''`", 'What the picture shows, for screen readers, when `media` is an image address. Without it the picture only adorns.'],
  ['content', '`Bind<ComponentBase | null>`', '`null`', 'What fills the content, besides JSX children.'],
  ['footer', '`Bind<ComponentBase | null>`', '`null`', 'A row of actions under the content. A component replaced leaves the card and stays yours.'],
  ['variant', '`Bind<CardVariant>`', 'the language’s (`elevated`)', '`elevated`, `filled`, `outline`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The space in and between the parts: `sm`, `md`, `lg`.'],
  ['orientation', '`Bind<CardOrientation>`', "`'vertical'`", '`horizontal` puts the picture at the start.'],
  ['clickable', '`Bind<boolean>`', '`false`', 'The whole card can be pressed (`onclick`, Enter, Space).'],
  ['href', '`Bind<string | null>`', '`null`', 'The whole card is a link there: its title is the link, and a press anywhere on the card follows it.'],
  ['rel', '`Bind<string>`', "`''`", 'The link’s `rel`; `router` lets the MotifJS router take it.'],
  ['selectable', '`Bind<boolean>`', '`false`', 'A check box on its top end corner; a press on the card turns it on and off.'],
  ['selected', '`Bind<boolean>`', '`false`', 'Whether it is selected.'],
  ['onSelectedChanged', '`CardSelectedChangedEventArgs`', '', 'It was selected or not any more (`selected`), by the user or by code (`byUser`).'],
  ['enabled, visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['contentPart', 'read-only', 'The part holding the content, for adding to it programmatically.'],
  ['avatarControl', 'read-only', 'The avatar before the titles, when it has one.'],
];

const A11Y = [
  ['Name', 'A `group` named by its title (`aria-labelledby`).'],
  ['Picture', 'Adorns unless `mediaAlt` says what it shows.'],
  ['Clickable', 'A Tab stop; Enter and Space press it. Buttons inside it stay buttons of their own.'],
  ['Link', 'The title is a real link (read and followed as one); the card shows its focus. The card’s own buttons stay above it.'],
  ['Selectable', 'A check box named “Select <title>” in the kit language; the card shows the selection with its frame.'],
];

const HOOKS = [
  ['.mx-card', 'The card. `data-variant`, `data-size`, `data-orientation`, `data-pressable`, `data-disabled`.'],
  ['.mx-card__media', 'The picture.'],
  ['.mx-card__body', 'Header, content and actions.'],
  ['.mx-card__header, .mx-card__avatar, .mx-card__heading, .mx-card__title, .mx-card__subtitle, .mx-card__action', 'The header and its parts.'],
  ['.mx-card__content, .mx-card__footer', 'The content, and the row of actions.'],
];

const TOKENS = [
  ['card.card', 'Unit: the card at rest, then `elevated`, `filled`, `outline`, `selected`, `hover`, `pressed`, `focus`, `disabled`.'],
  ['card.title, card.subtitle, card.content', 'Units: the title, the line under it, the content’s text.'],
  ['card.padding.*, card.gap.*', 'The space around and between the parts, per size.'],
  ['card.header-gap, card.footer-gap, card.media-width', 'The space in the header and between actions; the picture’s width at the start.'],
  ['card.variant, card.footer-align', 'The look a card takes when none is given; where the actions sit (Fluent: at the start, the others: at the end).'],
];

export default function CardPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A surface holding one thing: a picture, a header with an avatar and titles, content and a row of actions. Parts with nothing in them are left out." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Card } from '@motifx-community/ui';
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

      <Section anchor="variants" title="Appearance">
        <Example files={code('Variants.tsx')}>
          <Variants />
        </Example>
      </Section>

      <Section anchor="media" title="Pictures">
        <Example files={code('Media.tsx')}>
          <Media />
        </Example>
      </Section>

      <Section anchor="clickable" title="Clickable">
        <Example files={code('Clickable.tsx')}>
          <Clickable />
        </Example>
      </Section>

      <Section anchor="links" title="Links and selection">
        <Example files={code('Links.tsx')}>
          <Links />
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
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
      </Section>
    </>
  );
}
