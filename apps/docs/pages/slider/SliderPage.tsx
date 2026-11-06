import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Centred from './examples/Centred';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import Range from './examples/Range';
import States from './examples/States';
import StepsAndMarks from './examples/StepsAndMarks';
import UpdateOn from './examples/UpdateOn';
import ValueBubble from './examples/ValueBubble';
import Vertical from './examples/Vertical';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<number | [number, number]>`', '`min` / `[min, max]`', 'The value; `[start, end]` with `range`. `x-model` binds it two-way. It is kept on the steps and inside the bounds.'],
  ['label', '`Bind<string>`', "`''`", 'The caption; `&Name` makes Alt+N focus the thumb. The same property as `text`.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The bounds. When they change the value follows and is written back.'],
  ['step', '`Bind<number>`', '`1`', 'The values a thumb stops at, counted from `min`; `0` for any number.'],
  ['largeStep', '`Bind<number>`', '`10 × step`', 'What Page Up and Page Down move by.'],
  ['range', '`Bind<boolean>`', '`false`', 'Two thumbs; the value is `[start, end]`. The thumbs cannot cross.'],
  ['minDistance', '`Bind<number>`', '`0`', 'The least distance between the two thumbs.'],
  ['origin', '`Bind<number | undefined>`', '`undefined`', 'A centred slider: the active part of the track runs from this value to the thumb, on either side. Not with `range`.'],
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", 'Vertical: up is more.'],
  ['ticks', '`Bind<boolean | number>`', '`false`', '`true`: a mark at every step (up to 1000); a number: that many equal parts.'],
  ['tickLabels', '`Bind<boolean>`', '`false`', 'The values under the marks, or at the two ends without marks.'],
  ['showValue', "`Bind<'never' | 'drag' | 'always'>`", "`'never'`", 'A bubble with the value over the thumb: never, while it is moved (by the pointer or the keys), or always.'],
  ['format', '`Bind<Intl.NumberFormatOptions | null>`', '`null`', 'How the bubble, the tick labels and screen readers write the value.'],
  ['locale', '`Bind<string>`', "the page's `lang`", 'The locale of `format`.'],
  ['valueText', '`(value: number) => string`', '—', 'What screen readers say for a value. A function, so it is stored as it is, not bound.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`change`: the value changes when the thumb is let go; the thumb still moves.'],
  ['name', '`Bind<string>`', "`''`", 'The name it is sent with in a form; a range sends two values.'],
  ['helpText, hint, prefix, suffix, icon', 'see TextBox', '', 'The parts every field has; `prefix` and `suffix` sit at the two ends of the track.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Can be focused and read, not moved.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`: the rail and the thumbs.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation, as in every field.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['thumbElements', 'read-only', 'The thumb elements, `[start, end]` (the end one is hidden without `range`).'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'As in every field.'],
];

const METHODS = [
  ['formatValue(value)', '`string`', 'A value written the way the bubble writes it.'],
  ['focus()', '`boolean`', 'Focuses the (first) thumb.'],
  ['validate() / resetValidation()', '`Promise<boolean>` / `void`', 'As in every field.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'A check ended.'],
];

const KEYS = [
  ['Right / Up arrow', 'One step more. In a right-to-left page, Left is more on a horizontal slider.'],
  ['Left / Down arrow', 'One step less.'],
  ['Page Up / Page Down', '`largeStep` more / less.'],
  ['Home / End', 'The least / the most; with two thumbs, as far as the other thumb lets.'],
  ['Tab', 'Each thumb is a Tab stop.'],
  ['Alt + key (`&Name`)', 'Focuses the (first) thumb.'],
];

const A11Y = [
  ['Thumb', '`role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-orientation`, and `aria-valuetext` when there is a `format` or a `valueText`.'],
  ['Name', 'One thumb is named by the label. Two thumbs sit in a `role="group"` named by the label; each is named by the label and its end ("Minimum", "Maximum").'],
  ['Two thumbs', 'The start thumb\'s `aria-valuemax` is the end thumb\'s value, and the other way round, as the APG multi-thumb slider says.'],
  ['States', '`aria-readonly`, `aria-invalid` and `aria-disabled` on the thumbs; the line under the track describes them.'],
  ['Pointer', 'The pointer is captured while it drags; a press on the track moves the nearest thumb there. The track is as tall as a touch target.'],
];

const HOOKS = [
  ['.mx-slider', 'The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`, `data-split`.'],
  ['.mx-slider__control', 'What the pointer is pressed on: the track and the marks.'],
  ['.mx-slider__track, .mx-slider__rail', 'The track, and the rail that holds its segments (`--_from`, `--_to`; `data-from="start | thumb | origin"`, `data-to="thumb | origin | end"`, `data-start-active`, `data-end-active`).'],
  ['.mx-slider__fill, .mx-slider__segment', 'The active segment, and the inactive ones before and after it (`data-side`).'],
  ['.mx-slider__thumb', 'A thumb: the pressable area (`data-thumb="start | end"`, `data-dragging`, `--_at`).'],
  ['.mx-slider__halo, .mx-slider__knob, .mx-slider__core', 'What a thumb shows, centred on it: a halo, the knob and the part inside the knob.'],
  ['.mx-slider__bubble', 'The value over a thumb.'],
  ['.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label', 'The marks (`data-mark`, `data-active`, `--_at`) and their labels.'],
];

const TOKENS = [
  ['slider.track, slider.active, slider.stop', 'Units: the inactive segments (`before`, `after`), the active one (`from-start`, `to-end`) and the dots at the ends (`active`), each with its box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`).'],
  ['slider.halo, slider.knob, slider.core', 'Units: what a thumb shows, with its box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`).'],
  ['slider.bubble, slider.bubble-arrow, slider.tick, slider.tick-label, slider.ring', 'Units: the value bubble and its arrow, the marks, their labels, and a ring around the whole control under the keys.'],
  ['slider.track-thickness.*, slider.active-thickness.*', 'The inactive and the active segments, per size.'],
  ['slider.thumb-width.*, slider.thumb-height.*, slider.thumb-core-size.*', 'The knob along and across the track, and the part inside it, per size.'],
  ['slider.track-gap, slider.origin-gap, slider.stop-inset', 'A track split around the thumbs and the origin, and where the dots at its ends sit.'],
  ['slider.hit-size', 'How tall the track is for the pointer, and the touch target of a thumb.'],
  ['slider.vertical-length', 'The length of a vertical slider.'],
  ['slider.tick-length, slider.tick-width, slider.tick-offset, slider.tick-gap, slider.tick-line-height, slider.tick-label-width', 'Where the marks and their labels sit.'],
  ['slider.bubble-gap, slider.bubble-arrow-size', 'How far the bubble is from its thumb, and its arrow.'],
  ['field.width', 'The width of a horizontal slider, as for every field.'],
];

export default function SliderPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A value picked on a track by dragging a thumb or with the keys: one number, or a range with two thumbs. Steps, marks with labels, a value bubble, a vertical form and number formatting, with the label, help line and validation every field has." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Slider, type SliderValue } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="range" title="Range">
        <p>
          <Rich text="With `range` there are two thumbs and the value is `[start, end]`. The thumbs cannot cross; `minDistance` keeps them apart. A press on the track moves the nearer thumb." />
        </p>
        <Example files={code('Range.tsx')} stack>
          <Range />
        </Example>
      </Section>

      <Section anchor="centred" title="Centred">
        <p>
          <Rich text="With `origin` the active part of the track runs from that value to the thumb, on either side of it: a balance, an offset, a correction." />
        </p>
        <Example files={code('Centred.tsx')} stack>
          <Centred />
        </Example>
      </Section>

      <Section anchor="ticks" title="Steps and marks">
        <p>
          <Rich text="`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or with a number that many equal parts; `tickLabels` writes the values under them." />
        </p>
        <Example files={code('StepsAndMarks.tsx')} stack>
          <StepsAndMarks />
        </Example>
      </Section>

      <Section anchor="bubble" title="Value bubble and format">
        <p>
          <Rich text="`showValue` puts the value in a bubble over the thumb while it is moved (`drag`, also while a key moves it) or `always`. `format` writes it with `Intl.NumberFormat`; `valueText` gives screen readers their own words." />
        </p>
        <Example files={code('ValueBubble.tsx')} stack>
          <ValueBubble />
        </Example>
      </Section>

      <Section anchor="vertical" title="Vertical">
        <p>
          <Rich text={'`orientation="vertical"` stands the track up; up is more, and the Up arrow moves it up.'} />
        </p>
        <Example files={code('Vertical.tsx')}>
          <Vertical />
        </Example>
      </Section>

      <Section anchor="update-on" title="When the value changes">
        <p>
          <Rich text={'By default the value follows the thumb while it is dragged. With `updateOn="change"` it changes once, when the thumb is let go — for work that should not run on every move, such as a search. The keys change it at once either way.'} />
        </p>
        <Example files={code('UpdateOn.tsx')} stack>
          <UpdateOn />
        </Example>
      </Section>

      <Section anchor="states" title="Sizes, read-only, disabled, validation">
        <Example files={code('States.tsx')} stack>
          <States />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The names of the two thumbs of a range come from `uiLocale.strings` (`minimum`, `maximum`); numbers are written in `locale`, by default the page's `lang`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
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
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
