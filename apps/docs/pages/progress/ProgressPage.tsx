import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Cover from './examples/Cover';
import Delay from './examples/Delay';
import FromCode from './examples/FromCode';
import Localization from './examples/Localization';
import NotKnown from './examples/NotKnown';
import Sizes from './examples/Sizes';
import Spinners from './examples/Spinners';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BAR_PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'How far the work is. `null` (or no value) when that is not known: the bar runs to and fro.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The bounds of `value`.'],
  ['label', '`Bind<string>`', "`''`", 'A caption; it names the bar. The same property as `text`.'],
  ['labelPosition', "`Bind<'top' | 'side'>`", "`'top'`", '`top`: the label and the value above the bar; `side`: the label before it, the value after it.'],
  ['showValue', '`Bind<boolean>`', '`false`', 'Writes the percent (whole, rounded down) or `valueText`.'],
  ['valueText', '`(value, fraction) => string`', '—', 'The text for a value, shown and read out (`3 of 12 files`). A function, so it is stored as it is, not bound.'],
  ['locale', '`Bind<string>`', "the page's `lang`", 'The locale of the percent.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", '`accent`, `neutral`, `success`, `caution`, `danger`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The thickness: `sm`, `md`, `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['visible, enabled, …', 'see Control', '', 'The shared properties of every control.'],
];

const SPINNER_PROPS = [
  ['label', '`Bind<string>`', "`''`", 'Text next to the ring. The same property as `text`.'],
  ['labelPosition', "`Bind<'side' | 'bottom'>`", "`'side'`", 'After the ring or under it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", 'The color of the turning part.'],
  ['delay', '`Bind<number>`', '`0`', 'Milliseconds before it shows, from when it is created or shown again; quick work then shows nothing.'],
  ['visible, …', 'see Control', '', 'Showing it again (`visible`) starts the delay again.'],
];

const MEMBERS = [
  ['ProgressBar: every prop', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['ProgressBar: fraction', 'read-only, reactive', 'How much is done, from 0 to 1; `null` while it is not known.'],
  ['Spinner: every prop', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['Spinner: waiting', 'read-only', 'Still inside its delay.'],
  ['Spinner.cover(target, props?)', '`() => void`', 'Covers a component or an element with a spinner; call the returned function to take it away. See Cover.'],
];

const A11Y = [
  ['ProgressBar', '`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percent or `valueText`); none of them while the progress is not known.'],
  ['Spinner', '`role="progressbar"` without a value: an indicator of unknown progress, found and named like any widget. Not a `status` live region: those interrupt the reader each time one appears, and a page with many would be noisy.'],
  ['Name', 'The label (`aria-labelledby`), or `uiLocale.strings.loading` when there is none.'],
  ['Cover', 'The container gets `aria-busy="true"`; what is under the spinner is `inert`. Focus inside it moves to the spinner and comes back to where it was.'],
  ['Motion', 'With reduced motion the bar rests as a tinted track and the ring stands still.'],
];

const HOOKS = [
  ['.mx-progress', 'The bar. `data-state="determinate | indeterminate"`, `data-tone`, `data-size`, `data-label-position`, `data-stretch`.'],
  ['.mx-progress__head, .mx-progress__label, .mx-progress__value', 'The caption row.'],
  ['.mx-progress__track, .mx-progress__bar', 'The track and the filled part (`--_value`).'],
  ['.mx-spinner', 'The spinner. `data-size`, `data-tone`, `data-label-position`, `data-waiting`, `data-cover`.'],
  ['.mx-spinner__ring, .mx-spinner__label', 'The ring and the label.'],
  ['[data-mx-covered]', 'A container under `Spinner.cover`.'],
];

const TOKENS = [
  ['progress.thickness.*', 'The thickness per size.'],
  ['progress.width, progress.radius', 'The width when not stretched, the corners.'],
  ['progress.gap, progress.head-gap, progress.label-font-weight, progress.value-font-size', 'The caption.'],
  ['spinner.size.*, spinner.ring-width.*', 'The ring per size.'],
  ['spinner.gap', 'Between the ring and the label.'],
  ['spinner.cover-padding, spinner.cover-background', 'The layer over a covered container.'],
];

export default function ProgressPage() {
  return (
    <>
      <p class="lead">
        ProgressBar shows how far some work is, or that it runs when that is not known. Spinner says "busy, wait": a
        turning ring, alone or over a panel while it loads, shown only after a delay so quick work does not flash it.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; a function of a reactive object keeps the bar in step with the work. Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="indeterminate" title="Not known yet">
        <p>
          <Rich text="Without a value (`null`) the bar runs to and fro; give it a number once the work can tell how far it is." />
        </p>
        <Example files={code('NotKnown.tsx')} stack>
          <NotKnown />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <Example files={code('Tones.tsx')} stack>
          <Tones />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes, caption beside, your own text">
        <p>
          <Rich text={'`size` sets the thickness. `labelPosition="side"` puts the label before the bar and the value after it. `valueText` writes the value its own way.'} />
        </p>
        <Example files={code('Sizes.tsx')} stack>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="spinner" title="Spinner">
        <Example files={code('Spinners.tsx')}>
          <Spinners />
        </Example>
      </Section>

      <Section anchor="delay" title="Delay">
        <p>
          <Rich text="A spinner with `delay` stays unseen for that long, from when it is created or shown again. Quick work shows nothing; slow work shows the spinner." />
        </p>
        <Example files={code('Delay.tsx')} stack>
          <Delay />
        </Example>
      </Section>

      <Section anchor="cover" title="Cover a panel while it loads">
        <p>
          <Rich text="`Spinner.cover(target)` lays a spinner over a component or an element and returns the function that takes it away. What is under it cannot be pressed or focused; focus that was inside waits on the spinner and comes back afterwards." />
        </p>
        <Example files={code('Cover.tsx')} stack>
          <Cover />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="A bar or a spinner without a label is named `uiLocale.strings.loading`. The percent is written in `locale`, by default the page's `lang`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>ProgressBar props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BAR_PROPS} />
        <h3>Spinner props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={SPINNER_PROPS} />
        <h3>Properties and methods</h3>
        <ApiTable head={['Member', 'Access / returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
