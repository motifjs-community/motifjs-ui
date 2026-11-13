import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Caption from './examples/Caption';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import ReadOnly from './examples/ReadOnly';
import Required from './examples/Required';
import SelectAll from './examples/SelectAll';
import Sizes from './examples/Sizes';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<boolean | null>`', '`false`', '`true` is checked, `false` is unchecked, and `null` is indeterminate. `x-model` provides two-way binding.'],
  ['label', '`Bind<string>`', "`''`", 'The label next to the box. Writing `&Name` makes Alt+N toggle it. This is the same property as `text`.'],
  ['labelPosition', "`Bind<'start' | 'end'>`", "`'end'`", 'Places the label after the box (`end`) or before it (`start`), following the reading direction.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`hidden` keeps the label for screen readers only. Every other mode shows it next to the box.'],
  ['threeState', '`Bind<boolean>`', '`false`', 'A click cycles through unchecked, checked and indeterminate. Without this prop, a click only checks and unchecks, although code can still set `null`.'],
  ['helpText', '`Bind<string>`', "`''`", 'Help text shown below the label. An error message replaces it.'],
  ['hint', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'The box can receive focus and is announced, but a click or Space changes nothing.'],
  ['required', '`Bind<boolean>`', '`false`', 'The box must be checked. Adds an indicator after the label, `aria-required` and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container. With `labelPosition="start"`, the box moves to the far end.'],
  ['name', '`Bind<string>`', "`''`", 'The name submitted with the form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation works the same way as for all fields.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The result of the last validation.'],
  ['inputPart', 'read-only', 'The native `<input type="checkbox">`.'],
];

const METHODS = [
  ['toggle()', '`void`', 'Changes the value as a click does (with `threeState`, to the next of the three states).'],
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['focus()', '`boolean`', 'Sets focus on the box.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `null` stays `null`.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onclick, onchange, onfocusin, onfocusout', 'DOM events from the input bubble up to the field.'],
];

const KEYS = [
  ['Space', 'Toggles the check box, using the native key.'],
  ['Alt + key (`&Name`)', 'Moves focus to the check box and toggles it (Control + Option + key on Apple platforms).'],
  ['Tab', 'Each check box is one Tab stop.'],
];

const A11Y = [
  ['Element', 'A native `<input type="checkbox">` drawn with `appearance: none`. Its label is a `<label for>`, so clicking the label toggles the box.'],
  ['Indeterminate', 'The native `indeterminate` state, announced as "mixed".'],
  ['Read-only', '`aria-readonly="true"`. The field stays in the Tab order.'],
  ['Errors', '`aria-invalid="true"`. The text below the label is a polite live region and describes the box.'],
  ['Focus', 'The design system focus ring, shown only during keyboard use.'],
];

const HOOKS = [
  ['.mx-check-box', 'The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`.'],
  ['.mx-toggle-field', 'The layout shared by CheckBox and Switch: the box and its label side by side.'],
  ['.mx-check-box__input', 'The native check box, which is the box itself.'],
  ['.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash', 'The mark drawn over the box.'],
  ['.mx-field__label, .mx-field__message', 'The label and the text below it.'],
];

const TOKENS = [
  ['checkbox.box', 'Unit: the box, with every state (`checked`, `mixed` and `invalid`, each with `-hover`, `-pressed` and `-focus`, plus `disabled` and `checked-disabled`).'],
  ['checkbox.mark, checkbox.dash, checkbox.overlay', 'Units: the check mark, the dash of a mixed box, and a layer over the box (`pressed`, `disabled`).'],
  ['checkbox.halo, checkbox.ring', 'Units: a halo centered on the box (`checked`, `hover`, `focus`, `pressed`) and a ring around the box and label during keyboard use, where the design language includes them.'],
  ['checkbox.label, checkbox.control', 'Units: the label (`disabled`) and the row it sits in.'],
  ['checkbox.size.*, checkbox.mark-size.*', 'The box and its mark, per size.'],
  ['checkbox.height.*, checkbox.font-size.*', 'Row height (density tokens) and label size.'],
  ['checkbox.gap, checkbox.press-offset, checkbox.focus-scope', 'The space before the label, the distance the box moves when pressed, and what the keyboard ring surrounds (`box` or `item`).'],
];

export default function CheckBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A check box with a label that can be checked, unchecked or indeterminate. It supports an optional three-state cycle, read-only and required states, and validation with its group. It is a native check box styled with design tokens." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { CheckBox } from '@motifx-community/ui';
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

      <Section anchor="states" title="Checked, unchecked and indeterminate">
        <p>
          <Rich text="`null` shows the indeterminate dash. Clicking it checks the box. With `threeState`, the user cycles through all three states: unchecked, checked and indeterminate." />
        </p>
        <Example files={code('States.tsx')}>
          <States />
        </Example>
        <p>
          <Rich text="A box above a list is indeterminate while only some items are checked. Its value is a function of the list, and clicking it checks or unchecks all items." />
        </p>
        <Example files={code('SelectAll.tsx')} stack>
          <SelectAll />
        </Example>
      </Section>

      <Section anchor="caption" title="Caption">
        <p>
          <Rich text={'The label appears after the box, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width, so a box after its label moves to the far end, as in a settings list. `labelMode="hidden"` keeps the label for screen readers only.'} />
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

      <Section anchor="validation" title="Required check boxes">
        <p>
          <Rich text="`required` means the box must be checked. It is validated with its group like any other field, and the first unchecked box receives focus." />
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
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="A check box has no strings of its own. The `required` message comes from `uiLocale.strings`, and a message already on screen updates immediately." />
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
        <p>
          <Rich text="`ToggleField`, the base class shared by CheckBox and Switch, provides a label next to a native check box, read-only behavior and the access key. It is exported for use in your own controls." />
        </p>
      </Section>
    </>
  );
}
