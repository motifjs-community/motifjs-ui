import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import FromData from './examples/FromData';
import Layout from './examples/Layout';
import OptionDetails from './examples/OptionDetails';
import Sizes from './examples/Sizes';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<T | null>`', '`null`', 'The value of the selected item, or `null` if none is selected. `x-model` provides two-way binding.'],
  ['items', '`Bind<readonly (RadioItem<T> | T)[]>`', '`[]`', 'The options. A function is tracked, so a new list appears immediately. Items changed in place appear after `refresh()`.'],
  ['itemText', '`string | (item) => unknown`', "`'text'`", 'Where a custom object stores its text. This is a reader, not a binding.'],
  ['itemValue', '`string | (item) => T`', "`'value'`", 'Where an item stores its value. An object without one serves as its own value.'],
  ['label', '`Bind<string>`', "`''`", 'The group label. Writing `&Name` makes Alt+N move focus to the group. This is the same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side` (next to the options) or `hidden` (for screen readers only).'],
  ['orientation', '`Bind<RadioGroupOrientation>`', "`'vertical'`", '`vertical` stacks the options, and `horizontal` places them side by side and wraps.'],
  ['columns', '`Bind<number>`', '`0`', 'Arranges the options in a grid with this many columns (down the columns when vertical, across when horizontal).'],
  ['helpText', '`Bind<string>`', "`''`", 'Help text shown below the group. An error message replaces it.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip on the group.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'The arrow keys move between options, but nothing can be selected.'],
  ['required', '`Bind<boolean>`', '`false`', 'An option must be selected.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['name', '`Bind<string>`', 'Generated', 'The name the radios submit with the form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation works the same way as for all fields.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const ITEM = [
  ['value', '`T`', 'The value of `value` when this option is selected.'],
  ['text', '`Bind<string>`', 'Shown next to the circle. By default, this is the value as text.'],
  ['hint', '`Bind<string>`', 'The tooltip text.'],
  ['helpText', '`Bind<string>`', 'A smaller line below the text that describes the radio.'],
  ['enabled', '`Bind<boolean>`', '`false` dims the option, and the arrow keys skip it.'],
  ['visible', '`Bind<boolean>`', '`false` removes the option.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The result of the last validation.'],
  ['listPart', 'read-only', 'The part with `role="radiogroup"`.'],
  ['inputParts', 'read-only', 'The native radios as components, in item order.'],
];

const METHODS = [
  ['focus()', '`boolean`', 'Sets focus on the selected option, or on the first available one.'],
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the group reads them as they are. After changing them in place, call `refresh()`. Their text, values and states are read again, and focus stays where it is.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onchange, onkeydown, onfocusin, onfocusout', 'DOM events from the radios bubble up to the group.'],
];

const KEYS = [
  ['Tab', 'Moves focus into the group, on the selected option or the first available one. The next Tab leaves the group.'],
  ['↓ / →', 'Moves to the next option and selects it, wrapping from last to first and skipping disabled and hidden options.'],
  ['↑ / ←', 'Moves the same way, backward. On right-to-left pages, ← and → are swapped.'],
  ['Space', 'Selects the focused option.'],
  ['Alt + key (`&Name`)', 'Moves focus to the group (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Group', '`role="radiogroup"` named by the field label (`aria-labelledby`), with `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid`, and `aria-describedby` for the help text.'],
  ['Options', 'Native `<input type="radio">` elements sharing a name, each inside its own `<label>` and drawn with `appearance: none`.'],
  ['Help text', 'An option\'s `helpText` sits outside its label and is linked with `aria-describedby`, so it is not part of the option\'s name.'],
  ['Disabled options', 'Native `disabled`: skipped by the keyboard and announced as unavailable.'],
  ['Focus', 'One Tab stop, with the design system focus ring shown only during keyboard use.'],
];

const HOOKS = [
  ['.mx-radio-group', 'The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`.'],
  ['.mx-radio-group__list', 'The `radiogroup` element. `columns` sets `--_columns` and `--_rows` on it.'],
  ['.mx-radio-group__item, .mx-radio-group__label', 'An option, and the label that holds its radio and text.'],
  ['.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help', 'The radio, its text and its help text.'],
];

const TOKENS = [
  ['radiogroup.circle, radiogroup.dot', 'Units: the circle in every state (`checked`, `invalid`, `hover`, `pressed`, `focus` and their combinations, `disabled`), and the dot of the selected option (`checked`, `pressed`, `disabled`).'],
  ['radiogroup.row, radiogroup.text, radiogroup.help', 'Units: an option\'s row (`hover`, `checked`, `disabled`), its text and its help text.'],
  ['radiogroup.halo, radiogroup.ring', 'Units: a halo centered on the circle and a ring around an option during keyboard use, where the design language includes them.'],
  ['radiogroup.options, radiogroup.floating-label', 'Units: the options as a group, and the group label when it floats.'],
  ['radiogroup.size.*, radiogroup.dot-size.*, radiogroup.dot-size-hover.*, radiogroup.dot-size-pressed.*', 'The circle and the dot, per size and state.'],
  ['radiogroup.height.*, radiogroup.font-size.*', 'Row height (density tokens) and text size.'],
  ['radiogroup.gap, radiogroup.column-gap, radiogroup.help-gap', 'The space before the text, between side-by-side options, and above an option\'s help text.'],
  ['radiogroup.press-offset, radiogroup.focus-scope', 'The distance the circle moves when pressed, and what the keyboard ring surrounds.'],
];

export default function RadioGroupPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A set of mutually exclusive options. Options can come from plain values, custom objects or a live list, and can be arranged vertically, horizontally or in columns. Individual options can be disabled, hidden or given help text. The group is a single Tab stop, and the arrow keys move between options." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="A plain value serves as its own text. `x-model` provides two-way binding for the selected value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="data" title="Binding to data">
        <p>
          <Rich text="Custom objects use `itemText` and `itemValue`, each a property name or a function. Items can be plain or reactive and are read as they are. After adding, removing or renaming items in place, call `refresh()` to update the display, which preserves focus and selection." />
        </p>
        <Example files={code('FromData.tsx')} stack>
          <FromData />
        </Example>
      </Section>

      <Section anchor="items" title="Disabled options, help text and hints">
        <p>
          <Rich text="A `RadioItem` has its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip options that cannot be selected." />
        </p>
        <Example files={code('OptionDetails.tsx')} stack>
          <OptionDetails />
        </Example>
      </Section>

      <Section anchor="layout" title="Orientation and columns">
        <Example files={code('Layout.tsx')} stack>
          <Layout />
        </Example>
      </Section>

      <Section anchor="sizes" title="Sizes">
        <Example files={code('Sizes.tsx')}>
          <Sizes />
        </Example>
      </Section>

      <Section anchor="validation" title="Required, read-only, disabled">
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
          <Rich text="The group has no strings of its own. The option text is yours, and functions of your language state work. The `required` message comes from `uiLocale.strings`." />
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
          <Rich text="RadioItem" />
        </h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
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
