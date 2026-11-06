import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Animations from './examples/Animations';
import Loading from './examples/Loading';
import Shapes from './examples/Shapes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['shape', '`Bind<SkeletonShape>`', "`'text'`", '`text` for lines, `rect` for a block such as an image or field, or `circle` for an avatar.'],
  ['lines', '`Bind<number>`', '`1`', 'The number of text lines. The last of several lines is shorter.'],
  ['width', '`Bind<string | number | null>`', 'The available space', 'A CSS length, or a number in pixels. Also sets the size of a circle (the default comes from the design language).'],
  ['height', '`Bind<string | number | null>`', 'One line, or set by the design language', 'A CSS length, or a number in pixels.'],
  ['animation', '`Bind<SkeletonAnimation>`', 'Set by the design language', '`wave`, `pulse` or `none`. Tactile, Lounge and Fluent use a wave, and Material and Lilac use a pulse.'],
  ['loading', '`Bind<boolean>`', '`true`', 'Shows the skeleton while `true`, and then the JSX children.'],
  ['label', '`Bind<string>`', 'The kit string “Loading…”', 'The text announced by screen readers while loading.'],
  ['visible', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['content', 'read-only', 'The part that holds the loaded content, for adding to it programmatically.'],
];

const A11Y = [
  ['Loading', 'A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language). The shapes are hidden from screen readers.'],
  ['Loaded', 'The role and busy state are removed, and the content is read normally.'],
  ['Motion', 'With reduced motion, the wave and pulse stay still, because their duration follows the motion tokens.'],
];

const HOOKS = [
  ['.mx-skeleton', 'The skeleton. `data-shape`, `data-animation`, `data-loading`.'],
  ['.mx-skeleton__bone', 'A shape (a line, a block or a circle).'],
  ['.mx-skeleton__content', 'The content shown after loading.'],
];

const TOKENS = [
  ['skeleton.bone', 'Unit: a shape in `text`, `rect` and `circle`. `color` is the color the wave and pulse blend in.'],
  ['skeleton.line-height, skeleton.line-gap, skeleton.last-line', 'A line of text, the space between lines, and the width of the last line.'],
  ['skeleton.circle-size, skeleton.rect-height', 'The default size of a circle or block.'],
  ['skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim', 'The default animation, its duration, easing and intensity.'],
];

export default function SkeletonPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A placeholder that matches the shape of content that is loading, so the page keeps its layout while data arrives. If you provide content, it replaces the placeholder in the same place when loading ends." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Skeleton } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="shapes" title="Shapes">
        <Example files={code('Shapes.tsx')}>
          <Shapes />
        </Example>
      </Section>

      <Section anchor="loading" title="Showing content after loading">
        <p>
          <Rich text="`loading` accepts a value or a function. When it becomes `false`, the JSX children appear instead." />
        </p>
        <Example files={code('Loading.tsx')}>
          <Loading />
        </Example>
      </Section>

      <Section anchor="animations" title="Animation">
        <Example files={code('Animations.tsx')}>
          <Animations />
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
