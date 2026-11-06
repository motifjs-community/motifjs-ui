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
  ['title', '`Bind<string>`', "`''`", 'The title, which also provides the accessible name of the card.'],
  ['subtitle', '`Bind<string>`', "`''`", 'Text below the title.'],
  ['avatar', '`Bind<AvatarProps | null>`', '`null`', 'An avatar before the titles (its props).'],
  ['action', '`Bind<ComponentBase | null>`', '`null`', 'Content at the end of the header, such as a menu button or a badge.'],
  ['media', '`Bind<IconSource | null>`', '`null`', 'An image that extends to the card edges: an image address, an element or a component.'],
  ['mediaAlt', '`Bind<string>`', "`''`", 'Alternative text for the image when `media` is an image address. Without it, the image is decorative.'],
  ['content', '`Bind<ComponentBase | null>`', '`null`', 'The content, in addition to JSX children.'],
  ['footer', '`Bind<ComponentBase | null>`', '`null`', 'A row of actions below the content. A replaced component is removed from the card and stays under your control.'],
  ['variant', '`Bind<CardVariant>`', 'Set by the design language (`elevated`)', '`elevated`, `filled`, `outline`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The spacing inside and between the parts: `sm`, `md` or `lg`.'],
  ['orientation', '`Bind<CardOrientation>`', "`'vertical'`", '`horizontal` places the image at the start.'],
  ['clickable', '`Bind<boolean>`', '`false`', 'Makes the whole card pressable (`onclick`, Enter, Space).'],
  ['href', '`Bind<string | null>`', '`null`', 'Makes the whole card a link. The title is the link, and clicking anywhere on the card follows it.'],
  ['rel', '`Bind<string>`', "`''`", 'The `rel` of the link. `router` lets the MotifJS router handle it.'],
  ['selectable', '`Bind<boolean>`', '`false`', 'Adds a check box on the top end corner, and clicking the card toggles it.'],
  ['selected', '`Bind<boolean>`', '`false`', 'Indicates whether the card is selected.'],
  ['onSelectedChanged', '`CardSelectedChangedEventArgs`', '', 'Occurs when the selection changes (`selected`), either by the user or programmatically (`byUser`).'],
  ['enabled, visible, tabStop', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['contentPart', 'read-only', 'The part that holds the content, for adding to it programmatically.'],
  ['avatarControl', 'read-only', 'The avatar before the titles, if there is one.'],
];

const A11Y = [
  ['Name', 'A `group` named by its title (`aria-labelledby`).'],
  ['Picture', 'Decorative unless `mediaAlt` describes it.'],
  ['Clickable cards', 'A Tab stop that responds to Enter and Space. Buttons inside it remain independent.'],
  ['Link', 'The title is a real link, and the card shows its focus state. The card\'s own buttons stay above it.'],
  ['Selectable', 'A check box named “Select <title>” in the kit language. The card shows the selection with its frame.'],
];

const HOOKS = [
  ['.mx-card', 'The card. `data-variant`, `data-size`, `data-orientation`, `data-pressable`, `data-disabled`.'],
  ['.mx-card__media', 'The image.'],
  ['.mx-card__body', 'The header, content and actions.'],
  ['.mx-card__header, .mx-card__avatar, .mx-card__heading, .mx-card__title, .mx-card__subtitle, .mx-card__action', 'The header and its parts.'],
  ['.mx-card__content, .mx-card__footer', 'The content and the action row.'],
];

const TOKENS = [
  ['card.card', 'Unit: the card at rest, then `elevated`, `filled`, `outline`, `selected`, `hover`, `pressed`, `focus` and `disabled`.'],
  ['card.title, card.subtitle, card.content', 'Units: the title, the subtitle and the content text.'],
  ['card.padding.*, card.gap.*', 'The spacing around and between the parts, per size.'],
  ['card.header-gap, card.footer-gap, card.media-width', 'The spacing in the header and between actions, and the width of an image at the start.'],
  ['card.variant, card.footer-align', 'The default appearance, and the action alignment (start in Fluent, end in the other design languages).'],
];

export default function CardPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A surface for a single subject, with an optional image, a header with an avatar and titles, content and a row of actions. Empty parts are not rendered." />
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

      <Section anchor="media" title="Images">
        <Example files={code('Media.tsx')}>
          <Media />
        </Example>
      </Section>

      <Section anchor="clickable" title="Clickable cards">
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
