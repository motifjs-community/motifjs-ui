import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Cover from './examples/Cover';
import Delay from './examples/Delay';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import NotKnown from './examples/NotKnown';
import Shapes from './examples/Shapes';
import Sizes from './examples/Sizes';
import Spinners from './examples/Spinners';
import Tones from './examples/Tones';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BAR_PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'How far the work is. `null` (or no value) when that is not known: the bar runs to and fro, a circle turns.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The bounds of `value`.'],
  ['label', '`Bind<string>`', "`''`", 'A caption; it names the bar. The same property as `text`.'],
  ['shape', "`Bind<'line' | 'circle'>`", "`'line'`", '`line`: a bar along a track; `circle`: an arc that goes round a ring from the top.'],
  ['labelPosition', "`Bind<'top' | 'bottom' | 'side'>`", "`'top'` (`'bottom'` for a circle)", '`top`: the label and the value above the bar; `bottom`: under it; `side`: the label before it, the value after it.'],
  ['showValue', '`Bind<boolean>`', '`false`', 'Writes the percent (whole, rounded down) or `valueText`.'],
  ['valueText', '`(value, fraction) => string`', '—', 'The text for a value, shown and read out (`3 of 12 files`). A function, so it is stored as it is, not bound.'],
  ['locale', '`Bind<string>`', "The page `lang`", 'The locale of the percent.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", '`accent`, `neutral`, `success`, `caution`, `danger`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The thickness, and the size of a circle: `sm`, `md`, `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container.'],
  ['visible, enabled, …', 'see Control', '', 'Properties shared by all controls.'],
];

const SPINNER_PROPS = [
  ['label', '`Bind<string>`', "`''`", 'Text next to the ring. The same property as `text`.'],
  ['labelPosition', "`Bind<'side' | 'bottom'>`", "`'side'`", 'After the ring or under it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", 'The color of the turning part.'],
  ['contained', '`Bind<boolean>`', '`false`', 'Inside a container of its own (a disc behind it), where the design language draws one.'],
  ['delay', '`Bind<number>`', '`0`', 'Milliseconds before it shows, from when it is created or shown again; quick work then shows nothing.'],
  ['visible, …', 'see Control', '', 'Showing it again (`visible`) starts the delay again.'],
];

const MEMBERS = [
  ['ProgressBar: every prop', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['ProgressBar: fraction', 'read-only, reactive', 'How much is done, from 0 to 1; `null` while it is not known.'],
  ['Spinner: every prop', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['Spinner: waiting', 'read-only', 'Still inside its delay.'],
  ['Spinner.cover(target, props?)', '`() => void`', 'Covers a component or an element with a spinner; call the returned function to take it away. See Cover.'],
];

const A11Y = [
  ['ProgressBar', '`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percent or `valueText`); none of them while the progress is not known.'],
  ['Spinner', '`role="progressbar"` without a value: an indicator of unknown progress, found and named like any widget. Not a `status` live region: those interrupt the reader each time one appears, and a page with many would be noisy.'],
  ['Name', 'The label (`aria-labelledby`), or `uiLocale.strings.loading` when there is none.'],
  ['Cover', 'The container gets `aria-busy="true"`; what is under the spinner is `inert`. Focus inside it moves to the spinner and comes back to where it was.'],
  ['Motion', 'With reduced motion the bar rests as a tinted track, a new value is shown at once, a wave keeps still, and the arcs, the ring and the shape stand still. A wave is drawn only while the bar is in sight.'],
];

const HOOKS = [
  ['.mx-progress', 'The bar. `data-state="determinate | indeterminate"`, `data-complete`, `data-shape`, `data-wave` (a wave is drawn), `data-tone`, `data-size`, `data-label-position`, `data-stretch`; `--_fraction`: how much is done, 0 to 1.'],
  ['.mx-progress__head, .mx-progress__label, .mx-progress__value', 'The caption row.'],
  ['.mx-progress__track, .mx-progress__bar', 'The line: the track (`::before`: the rest of it, `::after`: the stop dot) and the part done (`::after`: the runner).'],
  ['.mx-progress__wave', 'The wave drawn over the track instead of the bar.'],
  ['.mx-progress__circle, .mx-progress__ring, .mx-progress__arc', 'The circle: its drawing, the ring and the arc.'],
  ['.mx-spinner', 'The spinner. `data-size`, `data-tone`, `data-label-position`, `data-contained`, `data-waiting`, `data-cover`.'],
  ['.mx-spinner__box', 'The container of what turns.'],
  ['.mx-spinner__ring, .mx-spinner__shape, .mx-spinner__label', 'The ring, the shape (the language shows one of them) and the label.'],
  ['[data-mx-covered]', 'A container under `Spinner.cover`.'],
];

const TOKENS = [
  ['progress.track, progress.bar, progress.rest, progress.stop, progress.runner, progress.wave', 'Units of the line, each with its box: the band, the part done, the rest of the track, the stop dot, the runner, the wave (its colour). States: `indeterminate`, `complete`, the tones.'],
  ['progress.ring, progress.arc, progress.label, progress.value', 'Units of the circle and of the caption.'],
  ['progress.thickness.*, progress.rest-thickness.*, progress.active-gap, progress.dot-size, progress.stop-inset', 'The line per size, the gap after the part done, the dot.'],
  ['progress.wave-amplitude, wave-length, wave-speed, wave-direction, wave-start, wave-end, wave-grow-duration', 'The wave: how far it swings (0: none), how long a wave is and how fast and which way it travels, between which shares of the work it swings, how long it takes to grow in.'],
  ['progress.ring-size.*, ring-thickness.*, ring-active-gap, ring-runner-length, ring-turn-duration, ring-wave-*', 'The circle per size, its gaps, its turning arc and its wave.'],
  ['progress.width, progress.gap, progress.head-gap, progress.accent … danger-subtle', 'The width when not stretched, the caption, the tones.'],
  ['spinner.size.*, spinner.ring-width.*, spinner.shape-size.*', 'The ring and the shape per size.'],
  ['spinner.box, spinner.ring, spinner.shape', 'Units: the container (`contained`), the ring and the shape, each with its box.'],
  ['spinner.shape-1 … spinner.shape-7, spinner.morph-duration, spinner.morph-easing, spinner.spin-duration', 'The shapes the shape becomes in turn (names from the shapes of the kit), how long the round takes, how each is reached, and one turn.'],
  ['spinner.gap', 'Between the ring and the label.'],
  ['spinner.cover-padding, spinner.cover-background', 'The layer over a covered container.'],
];

export default function ProgressPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'ProgressBar shows how far some work is, as a line or a circle, or that it runs when that is not known. Spinner says "busy, wait": a turning ring, alone or over a panel while it loads, shown only after a delay so quick work does not flash it.'} />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop takes a value or a function; a function of a reactive object keeps the bar in step with the work. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
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

      <Section anchor="shapes" title="Line or circle">
        <p>
          <Rich text={'`shape="circle"` draws the progress as an arc that goes round a ring from the top; without a value the arc turns. The caption goes under it (`labelPosition="bottom"`, its default), above it or beside it, and `size` sets the size of the circle and of its line. Where the design language gives it a wave (Material), the line and the arc swing while they grow, straight while little is done and again at the end.'} />
        </p>
        <Example files={code('Shapes.tsx')} stack>
          <Shapes />
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
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
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
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="ProgressBar props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BAR_PROPS} />
        <h3>
          <Rich text="Spinner props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={SPINNER_PROPS} />
        <h3>
          <Rich text="Properties and methods" />
        </h3>
        <ApiTable head={['Member', 'Access / returns', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
