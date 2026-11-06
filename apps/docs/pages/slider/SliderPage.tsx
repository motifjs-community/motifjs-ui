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
  ['value', '`Bind<number | [number, number]>`', '`min` / `[min, max]`', 'The value, or `[start, end]` with `range`. `x-model` provides two-way binding. The value is kept on a step and within the limits.'],
  ['label', '`Bind<string>`', "`''`", 'The label. Writing `&Name` makes Alt+N move focus to the thumb. This is the same property as `text`.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The limits. When they change, the value is adjusted and written back.'],
  ['step', '`Bind<number>`', '`1`', 'The values a thumb stops at, counted from `min`. Use `0` for continuous values.'],
  ['largeStep', '`Bind<number>`', '`10 × step`', 'The amount Page Up and Page Down move the thumb.'],
  ['range', '`Bind<boolean>`', '`false`', 'Shows two thumbs, and the value is `[start, end]`. The thumbs cannot cross.'],
  ['minDistance', '`Bind<number>`', '`0`', 'The minimum distance between the two thumbs.'],
  ['origin', '`Bind<number | undefined>`', '`undefined`', 'Creates a centered slider, where the active part of the track runs from this value to the thumb in either direction. It cannot be used with `range`.'],
  ['orientation', "`Bind<'horizontal' | 'vertical'>`", "`'horizontal'`", 'Makes the slider vertical, with higher values at the top.'],
  ['ticks', '`Bind<boolean | number>`', '`false`', '`true` adds a mark at every step (up to 1000), and a number adds that many equal parts.'],
  ['tickLabels', '`Bind<boolean>`', '`false`', 'Shows values under the marks, or at the two ends if there are no marks.'],
  ['showValue', "`Bind<'never' | 'drag' | 'always'>`", "`'never'`", 'Shows a value tooltip above the thumb: never, while it moves (with the pointer or keyboard), or always.'],
  ['format', '`Bind<Intl.NumberFormatOptions | null>`', '`null`', 'The format used by the tooltip, the tick labels and screen readers.'],
  ['locale', '`Bind<string>`', "The page `lang`", 'The locale of `format`.'],
  ['valueText', '`(value: number) => string`', '—', 'The text screen readers announce for a value. Because it is a function, it is stored as is and not bound.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", 'With `change`, the value updates when the thumb is released. The thumb still moves during the drag.'],
  ['name', '`Bind<string>`', "`''`", 'The name submitted with the form. A range submits two values.'],
  ['helpText, hint, prefix, suffix, icon', 'see TextBox', '', 'Parts common to all fields. `prefix` and `suffix` appear at the two ends of the track.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'The slider can receive focus and be read, but not moved.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md` or `lg`, which set the size of the rail and the thumbs.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation works the same way as for all fields.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['thumbElements', 'read-only', 'The thumb elements, `[start, end]`. The end thumb is hidden without `range`.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'These work the same way as on all fields.'],
];

const METHODS = [
  ['formatValue(value)', '`string`', 'Formats a value the same way as the tooltip.'],
  ['focus()', '`boolean`', 'Sets focus on the first thumb.'],
  ['validate() / resetValidation()', '`Promise<boolean>` / `void`', 'These work the same way as on all fields.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'Occurs when validation finishes.'],
];

const KEYS = [
  ['Right / Up arrow', 'Increases the value by one step. On right-to-left pages, Left increases the value on a horizontal slider.'],
  ['Left / Down arrow', 'Decreases the value by one step.'],
  ['Page Up / Page Down', 'Increases or decreases the value by `largeStep`.'],
  ['Home / End', 'Moves to the minimum or maximum. With two thumbs, the other thumb sets the limit.'],
  ['Tab', 'Each thumb is a Tab stop.'],
  ['Alt + key (`&Name`)', 'Sets focus on the first thumb.'],
];

const A11Y = [
  ['Thumb', '`role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-orientation`, and `aria-valuetext` when `format` or `valueText` is set.'],
  ['Name', 'A single thumb is named by the label. Two thumbs sit in a `role="group"` named by the label, and each thumb is named by the label and its end ("Minimum", "Maximum").'],
  ['Two thumbs', 'The `aria-valuemax` of the start thumb is the value of the end thumb, and vice versa, as the APG multi-thumb slider pattern specifies.'],
  ['States', '`aria-readonly`, `aria-invalid` and `aria-disabled` on the thumbs. The help text describes them.'],
  ['Pointer', 'The pointer is captured during a drag, and clicking the track moves the nearest thumb. The track is as tall as a touch target.'],
];

const HOOKS = [
  ['.mx-slider', 'The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`, `data-split`.'],
  ['.mx-slider__control', 'The pointer target: the track and the tick marks.'],
  ['.mx-slider__track, .mx-slider__rail', 'The track and the rail that holds its segments (`--_from`, `--_to`; `data-from="start | thumb | origin"`, `data-to="thumb | origin | end"`, `data-start-active`, `data-end-active`).'],
  ['.mx-slider__fill, .mx-slider__segment', 'The active segment and the inactive segments before and after it (`data-side`).'],
  ['.mx-slider__thumb', 'A thumb\'s pressable area (`data-thumb="start | end"`, `data-dragging`, `--_at`).'],
  ['.mx-slider__halo, .mx-slider__knob, .mx-slider__core', 'The visual parts of a thumb, centered on it: a halo, the knob and the inner part of the knob.'],
  ['.mx-slider__bubble', 'The value tooltip above a thumb.'],
  ['.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label', 'The tick marks (`data-mark`, `data-active`, `--_at`) and their labels.'],
];

const TOKENS = [
  ['slider.track, slider.active, slider.stop', 'Units: the inactive segments (`before`, `after`), the active segment (`from-start`, `to-end`) and the end dots (`active`), each with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`).'],
  ['slider.halo, slider.knob, slider.core', 'Units: the visual parts of a thumb, with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`).'],
  ['slider.bubble, slider.bubble-arrow, slider.tick, slider.tick-label, slider.ring', 'Units: the value tooltip and its arrow, the tick marks and labels, and a ring around the whole control during keyboard use.'],
  ['slider.track-thickness.*, slider.active-thickness.*', 'The inactive and active segments, per size.'],
  ['slider.thumb-width.*, slider.thumb-height.*, slider.thumb-core-size.*', 'The knob along and across the track, and its inner part, per size.'],
  ['slider.track-gap, slider.origin-gap, slider.stop-inset', 'A track split around the thumbs and the origin, and the position of its end dots.'],
  ['slider.hit-size', 'The height of the track for the pointer, and the touch target of a thumb.'],
  ['slider.vertical-length', 'The length of a vertical slider.'],
  ['slider.tick-length, slider.tick-width, slider.tick-offset, slider.tick-gap, slider.tick-line-height, slider.tick-label-width', 'The position of the tick marks and their labels.'],
  ['slider.bubble-gap, slider.bubble-arrow-size', 'The distance between the tooltip and its thumb, and the tooltip arrow.'],
  ['field.width', 'The width of a horizontal slider, the same as all fields.'],
];

export default function SliderPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Selects a value on a track by dragging a thumb or using the keyboard. It supports a single number or a range with two thumbs, steps, labeled tick marks, a value tooltip, a vertical orientation and number formatting, along with the label, help text and validation common to all fields." />
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
          <Rich text="Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="range" title="Range slider">
        <p>
          <Rich text="With `range`, there are two thumbs and the value is `[start, end]`. The thumbs cannot cross, and `minDistance` keeps them apart. Clicking the track moves the nearest thumb." />
        </p>
        <Example files={code('Range.tsx')} stack>
          <Range />
        </Example>
      </Section>

      <Section anchor="centred" title="Centered slider">
        <p>
          <Rich text="With `origin`, the active part of the track runs from that value to the thumb in either direction. Use it for values such as balance, offset or correction." />
        </p>
        <Example files={code('Centred.tsx')} stack>
          <Centred />
        </Example>
      </Section>

      <Section anchor="ticks" title="Steps and tick marks">
        <p>
          <Rich text="`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or divides the track into that many equal parts when set to a number. `tickLabels` shows the values under the marks." />
        </p>
        <Example files={code('StepsAndMarks.tsx')} stack>
          <StepsAndMarks />
        </Example>
      </Section>

      <Section anchor="bubble" title="Value tooltip and format">
        <p>
          <Rich text="`showValue` displays the value in a tooltip above the thumb, either while it moves (`drag`, which includes keyboard changes) or `always`. `format` formats it with `Intl.NumberFormat`, and `valueText` provides custom text for screen readers." />
        </p>
        <Example files={code('ValueBubble.tsx')} stack>
          <ValueBubble />
        </Example>
      </Section>

      <Section anchor="vertical" title="Vertical orientation">
        <p>
          <Rich text={'`orientation="vertical"` makes the track vertical. Up is greater, and the Up arrow moves the thumb up.'} />
        </p>
        <Example files={code('Vertical.tsx')}>
          <Vertical />
        </Example>
      </Section>

      <Section anchor="update-on" title="Update timing">
        <p>
          <Rich text={'By default, the value updates as the thumb is dragged. With `updateOn="change"`, it updates once when the thumb is released, which is useful for work that should not run on every movement, such as a search. Keyboard changes apply immediately in both cases.'} />
        </p>
        <Example files={code('UpdateOn.tsx')} stack>
          <UpdateOn />
        </Example>
      </Section>

      <Section anchor="states" title="Sizes, read-only, disabled and validation">
        <Example files={code('States.tsx')} stack>
          <States />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The names of the two thumbs in a range come from `uiLocale.strings` (`minimum`, `maximum`). Numbers use `locale`, which defaults to the page `lang`." />
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
