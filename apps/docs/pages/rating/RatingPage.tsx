import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Icons from './examples/Icons';
import Looks from './examples/Looks';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'The score, rounded to `step`. `null` means no score. `x-model` provides two-way binding.'],
  ['max', '`Bind<number>`', '`5`', 'The number of stars.'],
  ['step', '`Bind<1 | 0.5>`', '`1`', '`0.5` allows half stars, using the first half of a star or the arrow keys.'],
  ['allowClear', '`Bind<boolean>`', '`true`', 'Clicking the selected value, or pressing Delete or Backspace, clears the score.'],
  ['preview', '`Bind<boolean>`', '`true`', 'On hover, the stars preview the score a click would set.'],
  ['tone', '`Bind<RatingTone>`', 'Set by the design language', '`accent` or `neutral`. For custom gold stars, set the color in `rating.fill.accent.bg`.'],
  ['emptyIcon, filledIcon', '`Bind<string | null>`', 'Set by the design language', 'The shape of an empty and a filled star: a name from the kit\'s icon set, or an image address (drawn in the star colors).'],
  ['label, helpText, readOnly, required, rules, size…', 'see Field', '', 'All standard field props, because a rating is a field.'],
];

const KEYS = [
  ['Arrow keys', 'Increases or decreases the score by one step (by half with `step={0.5}`).'],
  ['Home, End', 'Sets no stars (the minimum, without `allowClear`), or all stars.'],
  ['1 … 9', 'Sets that number of stars.'],
  ['Delete, Backspace', 'Clears the score (with `allowClear`).'],
];

const A11Y = [
  ['Role', 'A `slider` from 0 to `max`, named by its label. The value is announced as “3 of 5” or “Not rated” in the kit language.'],
  ['Read-only', '`aria-readonly`. The stars only display the score.'],
];

const HOOKS = [
  ['.mx-rating', 'The field. `data-tone`, `data-size`, `data-readonly`, `data-disabled`.'],
  ['.mx-rating__stars', 'The row of stars, which is the slider and receives focus.'],
  ['.mx-rating__item, .mx-rating__star, .mx-rating__fill', 'One star, its empty shape and its filled part (`--_fill`: the filled share).'],
];

const TOKENS = [
  ['rating.stars, rating.item, rating.star, rating.fill', 'Units: the row (focus, disabled), a star growing on hover, the empty shape, and the filled part in each tone.'],
  ['rating.size.*, rating.gap.*', 'A star and the space between stars, per size.'],
  ['rating.tone', 'The default tone.'],
  ['rating.field.*', 'Place: the field below a rating, without a box.'],
];

export default function RatingPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A row of stars for entering or displaying a score, in whole or half steps. Rating is a field, so the label, help text, rules and `x-model` work the same way as on any other field." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Rating } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop accepts a value or a function, and `x-model` provides two-way binding for the score. On hover, the stars preview the score a click would set." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="looks" title="Half stars, sizes and tones">
        <Example files={code('Looks.tsx')}>
          <Looks />
        </Example>
      </Section>

      <Section anchor="icons" title="Custom icons">
        <Example files={code('Icons.tsx')}>
          <Icons />
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
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>
    </>
  );
}
