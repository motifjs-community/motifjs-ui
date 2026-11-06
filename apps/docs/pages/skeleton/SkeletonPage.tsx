import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Animations from './examples/Animations';
import Loading from './examples/Loading';
import Shapes from './examples/Shapes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['shape', '`Bind<SkeletonShape>`', "`'text'`", '`text` (lines), `rect` (a block: a picture, a field), `circle` (an avatar).'],
  ['lines', '`Bind<number>`', '`1`', 'How many lines of text; the last of several is shorter.'],
  ['width', '`Bind<string | number | null>`', 'the room it is in', 'A CSS length, or pixels as a number; a circle’s size (default: the language’s).'],
  ['height', '`Bind<string | number | null>`', 'a line / the language’s', 'A CSS length, or pixels as a number.'],
  ['animation', '`Bind<SkeletonAnimation>`', 'Set by the design language', '`wave`, `pulse`, `none`. Tactile, Lounge and Fluent sweep a wave, Material and Lilac pulse.'],
  ['loading', '`Bind<boolean>`', '`true`', 'While `true` the skeleton shows; then its JSX children do.'],
  ['label', '`Bind<string>`', 'The kit string “Loading…”', 'What screen readers say while it loads.'],
  ['visible', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write', 'Accepts a value or a function, the same as the prop.'],
  ['content', 'read-only', 'The part holding what shows once loaded, for adding to it programmatically.'],
];

const A11Y = [
  ['Loading', 'A `progressbar` with `aria-busy` and a name (“Loading…” in the kit language); the shapes are hidden from screen readers.'],
  ['Loaded', 'The role and the busy state go; the content is read as it is.'],
  ['Motion', 'Reduced motion keeps the wave and the pulse still: their duration follows the motion durations.'],
];

const HOOKS = [
  ['.mx-skeleton', 'The skeleton. `data-shape`, `data-animation`, `data-loading`.'],
  ['.mx-skeleton__bone', 'One shape (a line, the block, the circle).'],
  ['.mx-skeleton__content', 'What shows once loaded.'],
];

const TOKENS = [
  ['skeleton.bone', 'Unit: a shape, in each of `text`, `rect`, `circle`; its `color` is what the wave and the pulse mix in.'],
  ['skeleton.line-height, skeleton.line-gap, skeleton.last-line', 'A line of text, the space between lines, the last line’s share of the width.'],
  ['skeleton.circle-size, skeleton.rect-height', 'A circle or a block given no size.'],
  ['skeleton.animation, skeleton.duration, skeleton.easing, skeleton.wave-mix, skeleton.pulse-dim', 'How it moves when not told, how long, at what pace, and how strongly.'],
];

export default function SkeletonPage() {
  return (
    <>
      <p class="lead">
        <Rich text="The shape of what is loading, so the page keeps its layout while data arrives. Given content, it shows the content in the same place once loading ends." />
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

      <Section anchor="loading" title="Until it loads">
        <p>
          <Rich text="`loading` takes a value or a function; when it turns `false` the JSX children show instead." />
        </p>
        <Example files={code('Loading.tsx')}>
          <Loading />
        </Example>
      </Section>

      <Section anchor="animations" title="Movement">
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
