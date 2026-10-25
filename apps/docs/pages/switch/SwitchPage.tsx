import { reactive, type Component } from '@motifx/core';
import { Button, Switch, ValidationGroup, type ControlSize, type SwitchStateText } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const PLACES: SwitchStateText[] = ['inside', 'beside', 'none'];

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'On or off. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption next to the track; `&Name` makes Alt+N flip it. The same property as `text`.'],
  ['labelPosition', "`Bind<'start' | 'end'>`", "`'end'`", 'The caption after the track (`end`) or before it (`start`), in the reading direction.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`hidden` keeps the caption for screen readers only; every other mode shows it next to the track.'],
  ['onText / offText', '`Bind<string>`', "`''`", 'A short text for each state, e.g. `On` / `Off`.'],
  ['showStateText', '`Bind<SwitchStateText>`', "`'inside'`", 'Where that text shows: `inside` the track, `beside` it, or `none`.'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the caption. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Focusable and read out, but it does not flip.'],
  ['required', '`Bind<boolean>`', '`false`', 'It must be on.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width; with `labelPosition="start"` the track goes to the far end.'],
  ['name', '`Bind<string>`', "`''`", 'The name it is sent with in a form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation, as in every field.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the last check.'],
  ['inputElement', 'read-only', 'The native `<input type="checkbox" role="switch">`.'],
];

const METHODS = [
  ['toggle()', '`void`', 'Flips it as a click does.'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the switch.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onclick, onchange, onfocusin, onfocusout', 'The DOM events of the input reach the field.'],
];

const KEYS = [
  ['Space', 'Flips it (the native key).'],
  ['Enter', 'Flips it too, as on a button.'],
  ['Alt + key (`&Name`)', 'Focuses and flips it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Element', 'A native `<input type="checkbox" role="switch">`: screen readers say "switch, on / off"; the browser gives it Space, the form value, `:checked` and `:disabled`, and its caption is a `<label for>`, so a click on the caption flips it.'],
  ['On / off text', 'Drawn for the eye only (`aria-hidden`): the state is read out from the switch itself.'],
  ['Read-only', '`aria-readonly="true"`; it keeps its place in the Tab order.'],
  ['Motion', 'The thumb slides with the motion tokens; it stops sliding when the user asks for reduced motion.'],
  ['Focus', 'The design system focus ring around the track, for the keyboard only.'],
];

const HOOKS = [
  ['.mx-switch', 'The field. `data-state` (`checked`, `unchecked`), `data-state-text`, `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`.'],
  ['.mx-toggle-field', 'The layout CheckBox and Switch share.'],
  ['.mx-switch__input', 'The native checkbox: the track itself.'],
  ['.mx-switch__thumb', 'The thumb drawn over the track.'],
  ['.mx-switch__text, .mx-switch__on, .mx-switch__off', 'The on / off texts.'],
];

const TOKENS = [
  ['switch.track-width.*, switch.track-height.*', 'The track, per size.'],
  ['switch.thumb-inset', 'The space around the thumb; the thumb fills the rest of the track height.'],
  ['switch.height.*, switch.font-size.*', 'The row height (density tokens) and the caption size.'],
  ['switch.text-font-size, switch.text-padding', 'The on / off text.'],
  ['switch.border-width, switch.gap', 'The track border, and the space before the caption.'],
];

export default function SwitchPage() {
  const s = reactive({
    wifi: true,
    place: 'inside' as SwitchStateText,
    sync: false,
    dark: false,
    updates: true,
    terms: false,
    editable: true,
    result: '',
  });
  const group = new ValidationGroup();
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;

  const addFromCode = () => {
    const sw = new Switch({ label: `Feature ${++added}`, onText: 'On', offText: 'Off' });
    sw.onValueChanged((e) => (s.result = `${sw.label}: ${e.value ? 'on' : 'off'}`));
    host?.controls.add(sw);
    sw.focus();
  };

  return (
    <>
      <p class="lead">
        An on / off switch with its caption: a track with a thumb that slides, an optional on / off text inside or next
        to it, read-only and required. A native checkbox with the switch role underneath.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Switch } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<Switch label="&Wi-Fi" x-model={() => this.settings.wifi} />

const sw = new Switch({ label: 'Feature 1', onText: 'On', offText: 'Off' });
sw.onValueChanged((e) => console.log(e.value, e.byUser));
this.panel.controls.add(sw);
`}
          stack
        >
          <Switch label="&Wi-Fi" x-model={() => s.wifi} helpText={() => (s.wifi ? 'Connected to Home.' : 'Not connected.')} />
          <div class="docs-flow">
            <Button text="Add a switch from code" variant="outline" onclick={addFromCode} />
            <output class="sw-result">{() => s.result}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="texts" title="On / off text">
        <p>
          <Rich text="`onText` and `offText` show in the track (the track grows to fit them) or next to it. The texts are for the eye; the switch says its state itself." />
        </p>
        <Example
          code={`
<Switch label="Sync" onText="On" offText="Off" showStateText="beside" x-model={() => this.sync} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Text position">
            {PLACES.map((place) => (
              <Button
                key={place}
                text={place}
                size="sm"
                variant={() => (s.place === place ? 'solid' : 'ghost')}
                aria-pressed={() => s.place === place}
                onclick={() => (s.place = place)}
              />
            ))}
          </div>
          <Switch label="&Sync" class="sw-sync" onText="On" offText="Off" showStateText={() => s.place} x-model={() => s.sync} />
          <Switch label="Dark mode" onText="Dark" offText="Light" showStateText={() => s.place} x-model={() => s.dark} />
        </Example>
      </Section>

      <Section anchor="caption" title="Caption">
        <p>
          <Rich text={'The caption sits after the track, or before it with `labelPosition="start"`; with `stretch` the field takes the width and the track goes to the far end, as in a settings list.'} />
        </p>
        <Example
          code={`
<Switch label="Automatic updates" labelPosition="start" stretch x-model={() => this.updates} />
`}
          stack
        >
          <div style="inline-size: 22rem">
            <Switch label="Automatic updates" labelPosition="start" stretch x-model={() => s.updates} />
            <Switch label="Send usage data" labelPosition="start" stretch helpText="Anonymous, once a week." />
          </div>
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example
          code={`
<Switch label="Small" size="sm" />
<Switch label="Large" size="lg" onText="On" offText="Off" />
`}
        >
          {SIZES.map((size) => (
            <Switch key={size} label={size} size={size} value={size === 'md'} onText="On" offText="Off" />
          ))}
        </Example>
      </Section>

      <Section anchor="states" title="Required, read-only, disabled">
        <Example
          code={`
<Switch label="I agree" required validationGroup={group} />
<Switch label="Locked" readOnly value={true} />
<Switch label="Disabled" enabled={false} />
`}
          stack
        >
          <div class="docs-flow">
            <Switch label="I &agree to the terms" required validationGroup={group} x-model={() => s.terms} />
            <Button
              text="Continue"
              tone="accent"
              onclick={async () => (s.result = (await group.validate()).valid ? 'Thanks.' : 'Please agree first.')}
            />
          </div>
          <div class="docs-flow">
            <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
            <Switch label="Read-only" readOnly={() => !s.editable} value={true} />
            <Switch label="Disabled on" enabled={() => s.editable} value={true} />
            <Switch label="Disabled off" enabled={() => s.editable} />
          </div>
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
          <Rich text="The switch writes no text of its own: `onText` and `offText` are yours, and can be functions of your own language state. The `required` message comes from `uiLocale.strings`." />
        </p>
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
