import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FromCode from './examples/FromCode';
import Icons from './examples/Icons';
import Looks from './examples/Looks';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'The score, rounded to `step`; `null`: none. Two-way with `x-model`.'],
  ['max', '`Bind<number>`', '`5`', 'How many stars.'],
  ['step', '`Bind<1 | 0.5>`', '`1`', '`0.5` takes halves: a press on a star’s first half, or the arrow keys.'],
  ['allowClear', '`Bind<boolean>`', '`true`', 'A press on the value chosen, Delete or Backspace leave none.'],
  ['preview', '`Bind<boolean>`', '`true`', 'Under the pointer, the stars show what a press would give.'],
  ['tone', '`Bind<RatingTone>`', 'the language’s', '`accent`, `neutral`. Gold stars of your own: give `rating.fill.accent.bg` your colour.'],
  ['emptyIcon, filledIcon', '`Bind<string | null>`', 'the language’s', 'The shape of an empty and of a filled star: a name of the kit’s icon set, or an image address (drawn in the stars’ colours).'],
  ['label, helpText, readOnly, required, rules, size…', 'see Field', '', 'Everything a field has: a rating is one.'],
];

const KEYS = [
  ['Arrow keys', 'One step up or down (by halves with `step={0.5}`).'],
  ['Home, End', 'None (or the least, without `allowClear`), and every star.'],
  ['1 … 9', 'That many stars.'],
  ['Delete, Backspace', 'None (with `allowClear`).'],
];

const A11Y = [
  ['Role', 'A `slider` from 0 to `max`, named by its label; the value is said as “3 of 5”, or “Not rated”, in the kit language.'],
  ['Read-only', '`aria-readonly`; the stars only show the score.'],
];

const HOOKS = [
  ['.mx-rating', 'The field. `data-tone`, `data-size`, `data-readonly`, `data-disabled`.'],
  ['.mx-rating__stars', 'The row of stars: the slider, which takes the focus.'],
  ['.mx-rating__item, .mx-rating__star, .mx-rating__fill', 'One star, its empty shape and its filled part (`--_fill`: the share filled).'],
];

const TOKENS = [
  ['rating.stars, rating.item, rating.star, rating.fill', 'Units: the row (focus, disabled), a star growing under the pointer, the empty shape, the filled part in each tone.'],
  ['rating.size.*, rating.gap.*', 'A star and the space between stars, per size.'],
  ['rating.tone', 'The tone when none is given.'],
  ['rating.field.*', 'Place: the field under a rating, without a box.'],
];

export default function RatingPage() {
  return (
    <>
      <p class="lead">
        A row of stars to give a score or to show one, whole or by halves. It is a field: label, help text, rules and
        `x-model` work as in every field.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Rating } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the score two-way. Under the pointer the stars show what a press would give." />
        </p>
        <Example files={code('FromCode.tsx')}>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="looks" title="Halves, sizes, tones">
        <Example files={code('Looks.tsx')}>
          <Looks />
        </Example>
      </Section>

      <Section anchor="icons" title="Icons of your own">
        <Example files={code('Icons.tsx')}>
          <Icons />
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
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>
    </>
  );
}
