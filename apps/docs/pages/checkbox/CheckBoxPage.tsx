import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Caption from './examples/Caption';
import FromCode from './examples/FromCode';
import Localization from './examples/Localization';
import ReadOnly from './examples/ReadOnly';
import Required from './examples/Required';
import SelectAll from './examples/SelectAll';
import Sizes from './examples/Sizes';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean | null>`', '`false`', '`true` checked, `false` unchecked, `null` indeterminate. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption next to the box; `&Name` makes Alt+N toggle it. The same property as `text`.'],
  ['labelPosition', "`Bind<'start' | 'end'>`", "`'end'`", 'The caption after the box (`end`) or before it (`start`), in the reading direction.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`hidden` keeps the caption for screen readers only; every other mode shows it next to the box.'],
  ['threeState', '`Bind<boolean>`', '`false`', 'A click goes unchecked → checked → indeterminate. Without it a click only checks and unchecks; code can still set `null`.'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the caption. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Focusable and read out, but a click or Space changes nothing.'],
  ['required', '`Bind<boolean>`', '`false`', 'It must be checked: a mark after the caption, `aria-required` and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in; with `labelPosition="start"` the box goes to the far end.'],
  ['name', '`Bind<string>`', "`''`", 'The name it is sent with in a form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation, as in every field.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the last check.'],
  ['inputElement', 'read-only', 'The native `<input type="checkbox">`.'],
];

const METHODS = [
  ['toggle()', '`void`', 'Changes the value as a click does (with `threeState`, to the next of the three).'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the box.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `null` stays `null`.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onclick, onchange, onfocusin, onfocusout', 'The DOM events of the input reach the field.'],
];

const KEYS = [
  ['Space', 'Toggles it (the native checkbox key).'],
  ['Alt + key (`&Name`)', 'Focuses and toggles it (Control + Option + key on Apple platforms).'],
  ['Tab', 'One stop per checkbox.'],
];

const A11Y = [
  ['Element', 'A native `<input type="checkbox">` drawn with `appearance: none`; its caption is a `<label for>`, so a click on the caption toggles it.'],
  ['Indeterminate', 'The native `indeterminate` state: read out as "mixed".'],
  ['Read-only', '`aria-readonly="true"`; it keeps its place in the Tab order.'],
  ['Errors', '`aria-invalid="true"`; the line under the caption is a polite live region and describes the box.'],
  ['Focus', 'The design system focus ring, for the keyboard only.'],
];

const HOOKS = [
  ['.mx-check-box', 'The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`.'],
  ['.mx-toggle-field', 'The layout CheckBox and Switch share: the box and its caption side by side.'],
  ['.mx-check-box__input', 'The native checkbox: the box itself.'],
  ['.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash', 'The mark drawn over the box.'],
  ['.mx-field__label, .mx-field__message', 'The caption and the line under it.'],
];

const TOKENS = [
  ['checkbox.box', 'Unit: the box, with every state (`checked`, `mixed`, `invalid`, each with `-hover`, `-pressed`, `-focus`; `disabled`, `checked-disabled`).'],
  ['checkbox.mark, checkbox.dash, checkbox.overlay', 'Units: the check mark, the dash of a mixed box, and a layer over the box (`pressed`, `disabled`).'],
  ['checkbox.halo, checkbox.ring', 'Units: a halo centred on the box (`checked`, `hover`, `focus`, `pressed`) and a ring round the box and its caption under the keys, where the language has them.'],
  ['checkbox.label, checkbox.control', 'Units: the caption (`disabled`) and the row it sits in.'],
  ['checkbox.size.*, checkbox.mark-size.*', 'The box and its mark, per size.'],
  ['checkbox.height.*, checkbox.font-size.*', 'The row height (density tokens) and the caption size.'],
  ['checkbox.gap, checkbox.press-offset, checkbox.focus-scope', 'The space before the caption, how far a press moves the box, and what the ring under the keys goes round (`box` or `item`).'],
];

export default function CheckBoxPage() {
  return (
    <>
      <p class="lead">
        A checkbox with its caption: checked, unchecked or indeterminate, three states on request, read-only, required
        and checked with its group. A native checkbox underneath, drawn from the design tokens.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { CheckBox } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="states" title="Checked, unchecked, indeterminate">
        <p>
          <Rich text="`null` shows the indeterminate dash. A click on it checks the box; with `threeState` the user goes through all three: unchecked → checked → indeterminate." />
        </p>
        <Example files={code('States.tsx')}>
          <States />
        </Example>
        <p>
          <Rich text="A box over a list is indeterminate while only some items are checked. Its value is a function of the list; a click on it checks or unchecks them all." />
        </p>
        <Example files={code('SelectAll.tsx')} stack>
          <SelectAll />
        </Example>
      </Section>

      <Section anchor="caption" title="Caption">
        <p>
          <Rich text={'The caption sits after the box, or before it with `labelPosition="start"`. With `stretch` the field takes the width, so a box after its caption goes to the far end, as in a settings list. `labelMode="hidden"` keeps the caption for screen readers only.'} />
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

      <Section anchor="validation" title="Required">
        <p>
          <Rich text="`required` means the box must be checked. It is checked with its group, like any field: the first box left unchecked gets focus." />
        </p>
        <Example files={code('Required.tsx')} stack>
          <Required />
        </Example>
      </Section>

      <Section anchor="states-ro" title="Read-only and disabled">
        <Example files={code('ReadOnly.tsx')}>
          <ReadOnly />
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
          <Rich text="The checkbox writes no text of its own; the `required` message comes from `uiLocale.strings`, and a message already shown follows a change at once." />
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
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
        <p>
          <Rich text="`ToggleField`, the base CheckBox and Switch share (the caption next to a native checkbox, read-only, the access key), is exported for controls of your own." />
        </p>
      </Section>
    </>
  );
}
