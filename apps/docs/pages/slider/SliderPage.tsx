import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, Slider, trStrings, uiLocale, type SliderShowValue, type SliderValue } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const SHOW: SliderShowValue[] = ['never', 'drag', 'always'];

const PROPS = [
  ['value', '`Bind<number | [number, number]>`', '`min` / `[min, max]`', 'The value; `[start, end]` with `range`. `x-model` binds it two-way. It is kept on the steps and inside the bounds.'],
  ['label', '`Bind<string>`', "`''`", 'The caption; `&Name` makes Alt+N focus the thumb. The same property as `text`.'],
  ['min / max', '`Bind<number>`', '`0` / `100`', 'The bounds. When they change the value follows and is written back.'],
  ['step', '`Bind<number>`', '`1`', 'The values a thumb stops at, counted from `min`; `0` for any number.'],
  ['largeStep', '`Bind<number>`', '`10 × step`', 'What Page Up and Page Down move by.'],
  ['range', '`Bind<boolean>`', '`false`', 'Two thumbs; the value is `[start, end]`. The thumbs cannot cross.'],
  ['minDistance', '`Bind<number>`', '`0`', 'The least distance between the two thumbs.'],
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
  ['.mx-slider', 'The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`.'],
  ['.mx-slider__control', 'What the pointer is pressed on: the track and the marks.'],
  ['.mx-slider__track, .mx-slider__rail, .mx-slider__fill', 'The track, the rail, and its filled part (`--_from`, `--_to`).'],
  ['.mx-slider__thumb', 'A thumb (`data-thumb="start | end"`, `data-dragging`, `--_at`).'],
  ['.mx-slider__bubble', 'The value over a thumb.'],
  ['.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label', 'The marks (`data-mark`, `--_at`) and their labels.'],
];

const TOKENS = [
  ['slider.rail-thickness.*, slider.thumb-size.*, slider.dot-size.*', 'The rail, the thumbs and the dot in them, per size.'],
  ['slider.hit-size', 'How tall the track is for the pointer, and the touch target of a thumb.'],
  ['slider.vertical-length', 'The length of a vertical slider.'],
  ['slider.rail-radius, slider.thumb-border-width, slider.thumb-edge-width', 'Corners, the thumb\'s border and bottom edge.'],
  ['slider.tick-length, slider.tick-width, slider.tick-gap, slider.tick-font-size, slider.tick-label-width', 'The marks and their labels.'],
  ['slider.bubble-*', 'The value bubble: gap, padding, radius, font size, shadow.'],
  ['field.width', 'The width of a horizontal slider, as for every field.'],
];

const EURO: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };

export default function SliderPage() {
  const s = reactive({
    volume: 40,
    price: [120, 380] as SliderValue,
    zoom: 100,
    rating: 6,
    temp: 21,
    show: 'drag' as SliderShowValue,
    bass: 4,
    mid: 0,
    treble: -2,
    live: 50,
    committed: 50,
    age: 16,
    editable: true,
    lang: 'en',
    result: '',
  });
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;

  const addFromCode = () => {
    const slider = new Slider({ label: `Slider ${++added}`, value: 50, showValue: 'drag' });
    slider.onValueChanged((e) => (s.result = `${slider.label}: ${String(e.value)}`));
    host?.controls.add(slider);
    slider.focus();
  };

  return (
    <>
      <p class="lead">
        A value picked on a track by dragging a thumb or with the keys: one number, or a range with two thumbs. Steps,
        marks with labels, a value bubble, a vertical form and number formatting, with the label, help line and
        validation every field has.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Slider, type SliderValue } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<Slider label="&Volume" x-model={() => this.settings.volume} />

const zoom = new Slider({ label: 'Zoom', min: 25, max: 400, step: 25 });
zoom.onValueChanged((e) => console.log(e.value, e.byUser));
this.panel.controls.add(zoom);
zoom.value = 100;
`}
          stack
        >
          <Slider label="&Volume" x-model={() => s.volume} helpText={() => `Volume: ${s.volume}`} />
          <div class="docs-flow">
            <Button text="Add a slider from code" variant="outline" onclick={addFromCode} />
            <output class="sl-result">{() => s.result}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="range" title="Range">
        <p>
          <Rich text="With `range` there are two thumbs and the value is `[start, end]`. The thumbs cannot cross; `minDistance` keeps them apart. A press on the track moves the nearer thumb." />
        </p>
        <Example
          code={`
<Slider
  label="Price"
  range
  max={500}
  step={10}
  minDistance={50}
  format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
  showValue="drag"
  x-model={() => this.filter.price}
/>
`}
          stack
        >
          <Slider label="Price" range max={500} step={10} minDistance={50} format={EURO} showValue="drag" x-model={() => s.price} />
          <output class="sl-price">{() => `value: [${(s.price as number[]).join(', ')}]`}</output>
        </Example>
      </Section>

      <Section anchor="ticks" title="Steps and marks">
        <p>
          <Rich text="`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or with a number that many equal parts; `tickLabels` writes the values under them." />
        </p>
        <Example
          code={`
<Slider label="Zoom" min={25} max={200} step={25} ticks tickLabels format={{ style: 'unit', unit: 'percent' }} />
<Slider label="Rating" max={10} ticks={5} tickLabels />
<Slider label="Opacity" max={1} step={0} tickLabels format={{ style: 'percent' }} />
`}
          stack
        >
          <Slider label="Zoom" min={25} max={200} step={25} ticks tickLabels format={{ style: 'unit', unit: 'percent' }} x-model={() => s.zoom} />
          <Slider label="Rating" max={10} ticks={5} tickLabels x-model={() => s.rating} />
          <Slider label="Opacity" max={1} step={0} value={0.5} tickLabels showValue="drag" format={{ style: 'percent' }} />
        </Example>
      </Section>

      <Section anchor="bubble" title="Value bubble and format">
        <p>
          <Rich text="`showValue` puts the value in a bubble over the thumb while it is moved (`drag`, also while a key moves it) or `always`. `format` writes it with `Intl.NumberFormat`; `valueText` gives screen readers their own words." />
        </p>
        <Example
          code={`
<Slider
  label="Temperature"
  min={16}
  max={28}
  step={0.5}
  showValue="always"
  format={{ style: 'unit', unit: 'celsius' }}
  valueText={(v) => \`\${v} degrees\`}
/>
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Show value">
            {SHOW.map((show) => (
              <Button
                key={show}
                text={show}
                size="sm"
                variant={() => (s.show === show ? 'solid' : 'ghost')}
                aria-pressed={() => s.show === show}
                onclick={() => (s.show = show)}
              />
            ))}
          </div>
          <Slider
            label="Temperature"
            min={16}
            max={28}
            step={0.5}
            showValue={() => s.show}
            format={{ style: 'unit', unit: 'celsius' }}
            valueText={(v) => `${v} degrees`}
            x-model={() => s.temp}
          />
        </Example>
      </Section>

      <Section anchor="vertical" title="Vertical">
        <p>
          <Rich text={'`orientation="vertical"` stands the track up; up is more, and the Up arrow moves it up.'} />
        </p>
        <Example
          code={`
<Slider label="Bass" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" />
`}
        >
          <Slider label="Bass" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.bass} />
          <Slider label="Mid" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.mid} />
          <Slider label="Treble" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.treble} />
        </Example>
      </Section>

      <Section anchor="update-on" title="When the value changes">
        <p>
          <Rich text={'By default the value follows the thumb while it is dragged. With `updateOn="change"` it changes once, when the thumb is let go — for work that should not run on every move, such as a search. The keys change it at once either way.'} />
        </p>
        <Example
          code={`
<Slider label="Live" x-model={() => this.live} />
<Slider label="On release" updateOn="change" x-model={() => this.committed} />
`}
          stack
        >
          <Slider label="Live" showValue="drag" x-model={() => s.live} />
          <output class="sl-live">{() => `live: ${s.live}`}</output>
          <Slider label="On release" updateOn="change" showValue="drag" x-model={() => s.committed} />
          <output class="sl-committed">{() => `on release: ${s.committed}`}</output>
        </Example>
      </Section>

      <Section anchor="states" title="Sizes, read-only, disabled, validation">
        <Example
          code={`
<Slider label="Small" size="sm" />
<Slider label="Read-only" value={30} readOnly={() => !this.editing} />
<Slider label="Disabled" value={30} enabled={() => this.editing} />
<Slider label="Age" max={99} validateOn="input"
  rules={[{ type: 'range', min: 18, message: 'You must be 18 or older.' }]} />
`}
          stack
        >
          <div class="docs-flow">
            <Slider label="Small" size="sm" value={30} />
            <Slider label="Medium" value={50} />
            <Slider label="Large" size="lg" value={70} />
          </div>
          <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
          <div class="docs-flow">
            <Slider label="Read-only" value={30} readOnly={() => !s.editable} />
            <Slider label="Disabled" range value={[20, 60]} enabled={() => s.editable} />
          </div>
          <Slider label="Age" max={99} validateOn="input" rules={[{ type: 'range', min: 18, message: 'You must be 18 or older.' }]} x-model={() => s.age} />
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
        <Example
          code={`
uiLocale.strings = trStrings;
<Slider label="Fiyat" range locale="tr" format={{ style: 'currency', currency: 'TRY' }} />
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            The start thumb is named <output class="sl-minimum">{() => uiLocale.strings.minimum}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
