import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FromCode from './examples/FromCode';
import FromData from './examples/FromData';
import Layout from './examples/Layout';
import OptionDetails from './examples/OptionDetails';
import Sizes from './examples/Sizes';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<T | null>`', '`null`', 'The value of the chosen item; `null` when none is chosen. `x-model` binds it two-way.'],
  ['items', '`Bind<readonly (RadioItem<T> | T)[]>`', '`[]`', 'The options. A function of a reactive array is followed: items added, removed or changed show at once.'],
  ['itemText', '`string | (item) => unknown`', "`'text'`", 'Where an item keeps its text, for objects of your own shape. A reader, not a binding.'],
  ['itemValue', '`string | (item) => T`', "`'value'`", 'Where an item keeps its value. An object without one is its own value.'],
  ['label', '`Bind<string>`', "`''`", 'The caption of the group; `&Name` makes Alt+N focus it. The same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side` (next to the options) or `hidden` (for screen readers only).'],
  ['orientation', '`Bind<RadioGroupOrientation>`', "`'vertical'`", '`vertical`: one under the other; `horizontal`: side by side, wrapping.'],
  ['columns', '`Bind<number>`', '`0`', 'Lays the options out in a grid of this many columns (down the columns when vertical, across when horizontal).'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the group. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip on the group.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'The arrows move between the options, nothing can be chosen.'],
  ['required', '`Bind<boolean>`', '`false`', 'One option must be chosen.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`; the row height follows the density tokens.'],
  ['name', '`Bind<string>`', 'generated', 'The name the radios are sent with in a form.'],
  ['rules, error, validateOn, validationGroup', 'see Field', '', 'Validation, as in every field.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const ITEM = [
  ['value', '`T`', 'What `value` becomes when this option is chosen.'],
  ['text', '`Bind<string>`', 'Shown next to the circle. Default: the value as text.'],
  ['hint', '`Bind<string>`', 'A tooltip.'],
  ['helpText', '`Bind<string>`', 'A smaller line under the text; it describes the radio.'],
  ['enabled', '`Bind<boolean>`', '`false` greys it out; the arrow keys skip it.'],
  ['visible', '`Bind<boolean>`', '`false` leaves it out.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the last check.'],
  ['listElement', 'read-only', 'The element with `role="radiogroup"`.'],
  ['inputs', 'read-only', 'The native radios, in the order of the items.'],
];

const METHODS = [
  ['focus()', '`boolean`', 'Focuses the chosen option, or the first one that can be chosen.'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onchange, onkeydown, onfocusin, onfocusout', 'The DOM events of the radios reach the group.'],
];

const KEYS = [
  ['Tab', 'Into the group, onto the chosen option (or the first one that can be chosen); the next Tab leaves the group.'],
  ['↓ / →', 'Moves to the next option and chooses it, wrapping from the last to the first; skips disabled and hidden options.'],
  ['↑ / ←', 'The same, backwards. Right to left, ← and → swap.'],
  ['Space', 'Chooses the focused option.'],
  ['Alt + key (`&Name`)', 'Focuses the group (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Group', '`role="radiogroup"`, named by the field label (`aria-labelledby`); `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid` and `aria-describedby` for the line under it.'],
  ['Options', 'Native `<input type="radio">` sharing a name, each inside its own `<label>`, drawn with `appearance: none`.'],
  ['Help text', 'An option’s `helpText` sits outside its label and describes it with `aria-describedby`, so it is not part of its name.'],
  ['Disabled options', 'Native `disabled`: skipped by the keyboard and read out as unavailable.'],
  ['Focus', 'One Tab stop; the design system focus ring, for the keyboard only.'],
];

const HOOKS = [
  ['.mx-radio-group', 'The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`.'],
  ['.mx-radio-group__list', 'The `radiogroup` element; `--_columns` and `--_rows` are set on it with `columns`.'],
  ['.mx-radio-group__item, .mx-radio-group__label', 'One option, and the label that holds its radio and text.'],
  ['.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help', 'The radio, its text, its help line.'],
];

const TOKENS = [
  ['radiogroup.size.*, radiogroup.dot-size.*', 'The circle and the dot of the chosen one, per size.'],
  ['radiogroup.height.*, radiogroup.font-size.*', 'The row height (density tokens) and the text size.'],
  ['radiogroup.gap, radiogroup.column-gap', 'The space before the text, and between options side by side.'],
  ['radiogroup.help-font-size, radiogroup.help-line', 'The help line of an option.'],
  ['radiogroup.border-width', 'The circle border.'],
];

export default function RadioGroupPage() {
  return (
    <>
      <p class="lead">
        A set of options of which one is chosen: from plain values, from your own objects or from a live list; one under
        the other, side by side or in columns; options that are disabled, hidden or carry a help line; one Tab stop and
        the arrow keys.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="A plain value is its own text. `x-model` binds the chosen value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="data" title="Items from data">
        <p>
          <Rich text="Objects of your own shape take `itemText` and `itemValue` (a property name or a function). Given as a function of a reactive array, the list is followed: add, remove or rename and the options change at once, focus and choice kept." />
        </p>
        <Example files={code('FromData.tsx')} stack>
          <FromData />
        </Example>
      </Section>

      <Section anchor="items" title="Disabled options, help lines, hints">
        <p>
          <Rich text="A `RadioItem` brings its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip what cannot be chosen." />
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
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The group writes no text of its own: the option texts are yours (functions of your language state work). The `required` message comes from `uiLocale.strings`." />
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
        <h3>RadioItem</h3>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
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
