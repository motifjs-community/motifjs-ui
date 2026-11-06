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
  ['value', '`Bind<number | null>`', '`null`', 'The progress. Use `null` or omit it when the progress is unknown: the bar shows continuous motion and a circle rotates.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The limits of `value`.'],
  ['label', '`Bind<string>`', "`''`", 'A label that names the bar. This is the same property as `text`.'],
  ['shape', "`Bind<'line' | 'circle'>`", "`'line'`", '`line` shows a bar along a track, and `circle` shows an arc around a ring from the top.'],
  ['labelPosition', "`Bind<'top' | 'bottom' | 'side'>`", "`'top'` (`'bottom'` for a circle)", '`top` places the label and value above the bar, `bottom` places them below it, and `side` places the label before it and the value after it.'],
  ['showValue', '`Bind<boolean>`', '`false`', 'Shows the percentage, rounded down to a whole number, or `valueText`.'],
  ['valueText', '`(value, fraction) => string`', '—', 'The text shown and announced for a value (`3 of 12 files`). Because it is a function, it is stored as is and not bound.'],
  ['locale', '`Bind<string>`', "The page `lang`", 'The locale of the percentage.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", '`accent`, `neutral`, `success`, `caution`, `danger`.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", 'The thickness, and the size of a circle: `sm`, `md` or `lg`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container.'],
  ['visible, enabled, …', 'see Control', '', 'Properties shared by all controls.'],
];

const SPINNER_PROPS = [
  ['label', '`Bind<string>`', "`''`", 'Text next to the ring. This is the same property as `text`.'],
  ['labelPosition', "`Bind<'side' | 'bottom'>`", "`'side'`", 'Places the label after the ring or below it.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`.'],
  ['tone', '`Bind<ProgressTone>`', "`'accent'`", 'The color of the rotating part.'],
  ['contained', '`Bind<boolean>`', '`false`', 'Places the spinner in its own container (a disc behind it), where the design language includes one.'],
  ['delay', '`Bind<number>`', '`0`', 'The delay in milliseconds before it appears, counted from when it is created or shown again. Quick operations then show nothing.'],
  ['visible, …', 'see Control', '', 'Showing it again with `visible` restarts the delay.'],
];

const MEMBERS = [
  ['ProgressBar: every prop', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['ProgressBar: fraction', 'read-only, reactive', 'The completed share from 0 to 1, or `null` while the progress is unknown.'],
  ['Spinner: every prop', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['Spinner: waiting', 'read-only', 'Indicates that it is still within its delay.'],
  ['Spinner.cover(target, props?)', '`() => void`', 'Covers a component or element with a spinner. Call the returned function to remove it. See Covering a panel.'],
];

const A11Y = [
  ['ProgressBar', '`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percentage or `valueText`). None of these are set while the progress is unknown.'],
  ['Spinner', '`role="progressbar"` without a value, which indicates unknown progress. It is not a `status` live region, because those interrupt the screen reader each time one appears, and a page with several would be noisy.'],
  ['Name', 'Named by the label (`aria-labelledby`), or by `uiLocale.strings.loading` if there is none.'],
  ['Cover', 'The container gets `aria-busy="true"`, and the content under the spinner is `inert`. Focus inside it moves to the spinner and returns when the spinner is removed.'],
  ['Motion', 'With reduced motion, the bar rests as a tinted track, new values appear immediately, the wave stops, and the arcs, ring and shape are static. A wave is drawn only while the bar is visible.'],
];

const HOOKS = [
  ['.mx-progress', 'The bar. `data-state="determinate | indeterminate"`, `data-complete`, `data-shape`, `data-wave` (a wave is drawn), `data-tone`, `data-size`, `data-label-position`, `data-stretch`, and `--_fraction` for the completed share from 0 to 1.'],
  ['.mx-progress__head, .mx-progress__label, .mx-progress__value', 'The label row.'],
  ['.mx-progress__track, .mx-progress__bar', 'The line: the track (`::before` for the remainder and `::after` for the stop dot) and the completed part (`::after` for the indeterminate runner).'],
  ['.mx-progress__wave', 'The wave drawn over the track in place of the bar.'],
  ['.mx-progress__circle, .mx-progress__ring, .mx-progress__arc', 'The circle: its drawing, the ring and the arc.'],
  ['.mx-spinner', 'The spinner. `data-size`, `data-tone`, `data-label-position`, `data-contained`, `data-waiting`, `data-cover`.'],
  ['.mx-spinner__box', 'The container of the rotating part.'],
  ['.mx-spinner__ring, .mx-spinner__shape, .mx-spinner__label', 'The ring, the shape (the design language shows one of them) and the label.'],
  ['[data-mx-covered]', 'A container under `Spinner.cover`.'],
];

const TOKENS = [
  ['progress.track, progress.bar, progress.rest, progress.stop, progress.runner, progress.wave', 'Units of the line, each with its box: the band, the completed part, the remainder of the track, the stop dot, the runner and the wave color. States: `indeterminate`, `complete` and the tones.'],
  ['progress.ring, progress.arc, progress.label, progress.value', 'Units of the circle and the label.'],
  ['progress.thickness.*, progress.rest-thickness.*, progress.active-gap, progress.dot-size, progress.stop-inset', 'The line per size, the gap after the completed part, and the dot.'],
  ['progress.wave-amplitude, wave-length, wave-speed, wave-direction, wave-start, wave-end, wave-grow-duration', 'The wave: its amplitude (0 for none), wavelength, speed and direction, the progress range where it animates, and how long it takes to appear.'],
  ['progress.ring-size.*, ring-thickness.*, ring-active-gap, ring-runner-length, ring-turn-duration, ring-wave-*', 'The circle per size, its gaps, its rotating arc and its wave.'],
  ['progress.width, progress.gap, progress.head-gap, progress.accent … danger-subtle', 'The width when not stretched, the label and the tones.'],
  ['spinner.size.*, spinner.ring-width.*, spinner.shape-size.*', 'The ring and the shape, per size.'],
  ['spinner.box, spinner.ring, spinner.shape', 'Units: the container (`contained`), the ring and the shape, each with its box.'],
  ['spinner.shape-1 … spinner.shape-7, spinner.morph-duration, spinner.morph-easing, spinner.spin-duration', 'The sequence of shapes (names from the kit shapes), the cycle duration, the transition to each shape, and one rotation.'],
  ['spinner.gap', 'The space between the ring and the label.'],
  ['spinner.cover-padding, spinner.cover-background', 'The layer over a covered container.'],
];

export default function ProgressPage() {
  return (
    <>
      <p class="lead">
        <Rich text={'ProgressBar shows how far an operation has progressed, as a line or a circle, or indicates activity when the progress is unknown. Spinner shows that the system is busy. It is a rotating ring that can stand alone or cover a panel while it loads, and it can wait for a delay so that quick operations do not cause a flash.'} />
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
          <Rich text="Every prop accepts a value or a function, and a function that reads a reactive object keeps the bar in sync with the operation. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="indeterminate" title="Indeterminate progress">
        <p>
          <Rich text="Without a value (`null`), the bar shows continuous motion. Set a number once the operation can report its progress." />
        </p>
        <Example files={code('NotKnown.tsx')} stack>
          <NotKnown />
        </Example>
      </Section>

      <Section anchor="shapes" title="Linear and circular">
        <p>
          <Rich text={'`shape="circle"` draws the progress as an arc that runs around a ring from the top, and without a value the arc rotates. The label can appear below it (`labelPosition="bottom"`, the default), above it or next to it, and `size` sets the size of the circle and its stroke. Where the design language includes a wave (Material), the line and arc animate as they grow, and they stay straight at the very beginning and end.'} />
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

      <Section anchor="sizes" title="Sizes, side labels and custom text">
        <p>
          <Rich text={'`size` sets the thickness. `labelPosition="side"` places the label before the bar and the value after it. `valueText` provides a custom value format.'} />
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
          <Rich text="A spinner with `delay` stays hidden for that long after it is created or shown again. Quick operations show nothing, and slow ones show the spinner." />
        </p>
        <Example files={code('Delay.tsx')} stack>
          <Delay />
        </Example>
      </Section>

      <Section anchor="cover" title="Covering a panel while it loads">
        <p>
          <Rich text="`Spinner.cover(target)` places a spinner over a component or element and returns a function that removes it. The content underneath cannot be clicked or focused. If focus was inside, it moves to the spinner and returns afterward." />
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
          <Rich text="A bar or spinner without a label is named `uiLocale.strings.loading`. The percentage uses `locale`, which defaults to the page `lang`." />
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
        <ApiTable head={['Member', 'Access / return value', 'Description']} rows={MEMBERS} />
      </Section>
    </>
  );
}
