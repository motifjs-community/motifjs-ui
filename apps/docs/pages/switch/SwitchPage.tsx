import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Caption from './examples/Caption';
import Programmatic from './examples/Programmatic';
import Sizes from './examples/Sizes';
import StateText from './examples/StateText';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'On or off. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption next to the track; `&Name` makes Alt+N flip it. The same property as `text`.'],
  ['labelPosition', "`Bind<'start' | 'end'>`", "`'end'`", 'The caption after the track (`end`) or before it (`start`), in the reading direction.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`hidden` keeps the caption for screen readers only; every other mode shows it next to the track.'],
  ['onText / offText', '`Bind<string>`', "`''`", 'A short text for each state, e.g. `On` / `Off`.'],
  ['showStateText', '`Bind<SwitchStateText>`', "`'inside'`", 'Where that text shows: `inside` the track, `beside` it, or `none`.'],
  ['helpText', '`Bind<string>`', "`''`", 'Help text shown below the label. An error message replaces it.'],
  ['hint', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Focusable and read out, but it does not flip.'],
  ['required', '`Bind<boolean>`', '`false`', 'It must be on.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width; with `labelPosition="start"` the track goes to the far end.'],
  ['name', '`Bind<string>`', "`''`", 'The name submitted with the form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation works the same way as for all fields.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The result of the last validation.'],
  ['inputElement', 'read-only', 'The native `<input type="checkbox" role="switch">`.'],
];

const METHODS = [
  ['toggle()', '`void`', 'Flips it as a click does.'],
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['focus()', '`boolean`', 'Focuses the switch.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onclick, onchange, onfocusin, onfocusout', 'DOM events from the input bubble up to the field.'],
];

const KEYS = [
  ['Space', 'Flips it (the native key).'],
  ['Enter', 'Flips it too, as on a button.'],
  ['Alt + key (`&Name`)', 'Focuses and flips it (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Element', 'A native `<input type="checkbox" role="switch">`: screen readers say "switch, on / off"; the browser gives it Space, the form value, `:checked` and `:disabled`, and its caption is a `<label for>`, so a click on the caption flips it.'],
  ['On / off text', 'Drawn for the eye only (`aria-hidden`): the state is read out from the switch itself.'],
  ['Read-only', '`aria-readonly="true"`. The field stays in the Tab order.'],
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
  ['switch.track, switch.thumb', 'Units: the track and the thumb, each with every state (`checked`, `invalid`, `hover`, `pressed`, `focus`, `disabled` and their pairs).'],
  ['switch.thumb-icon, switch.halo', 'Units: an icon in the thumb and a halo around it, where the language has them.'],
  ['switch.text, switch.side-text', 'Units: the on / off text in the track and beside it.'],
  ['switch.track-width.*, switch.track-height.*', 'The track, per size.'],
  ['switch.thumb-size.*, switch.thumb-size-checked.*, switch.thumb-size-hover.*, switch.thumb-size-pressed.*, switch.thumb-inset, switch.thumb-stretch', 'The thumb per size and state, the space around it, and how far it stretches while pressed.'],
  ['switch.height.*, switch.font-size.*', 'Row height (density tokens) and label size.'],
  ['switch.text-padding, switch.gap', 'The space of the on / off text, and before the caption.'],
];

export default function SwitchPage() {
  return (
    <>
      <p class="lead">
        <Rich text="An on / off switch with its caption: a track with a thumb that slides, an optional on / off text inside or next to it, read-only and required. A native checkbox with the switch role underneath." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Switch } from '@motifx-community/ui';
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

      <Section anchor="texts" title="On / off text">
        <p>
          <Rich text="`onText` and `offText` show in the track (the track grows to fit them) or next to it. The texts are for the eye; the switch says its state itself." />
        </p>
        <Example files={code('StateText.tsx')} stack>
          <StateText />
        </Example>
      </Section>

      <Section anchor="caption" title="Caption">
        <p>
          <Rich text={'The caption sits after the track, or before it with `labelPosition="start"`; with `stretch` the field takes the width and the track goes to the far end, as in a settings list.'} />
        </p>
        <Example files={code('Caption.tsx')} stack>
          <Caption />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example files={code('Sizes.tsx')}>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="states" title="Required, read-only, disabled">
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
          <Rich text="The switch writes no text of its own: `onText` and `offText` are yours, and can be functions of your own language state. The `required` message comes from `uiLocale.strings`." />
        </p>
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
