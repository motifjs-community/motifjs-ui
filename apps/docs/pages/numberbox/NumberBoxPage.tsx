import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DecimalsAndEmpty from './examples/DecimalsAndEmpty';
import Format from './examples/Format';
import FromCode from './examples/FromCode';
import Localization from './examples/Localization';
import MinMaxClamp from './examples/MinMaxClamp';
import SpinButtons from './examples/SpinButtons';
import Steps from './examples/Steps';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'The number; `null` when empty. `x-model` binds it two-way.'],
  ['min / max', '`Bind<number | null>`', '`null`', 'Bounds: steps stop there, Home / End go there, entered values are kept inside (see `clamp`), the range is checked.'],
  ['step', '`Bind<number>`', '`1`', 'What the arrow keys, the spin buttons and the wheel add.'],
  ['largeStep', '`Bind<number>`', '10 × `step`', 'What PageUp / PageDown add.'],
  ['showSpinButtons', '`Bind<boolean>`', '`true`', 'The up and down buttons in the box.'],
  ['spinLayout', '`Bind<SpinLayout>`', "`'stacked'`", '`stacked`: arrows on top of each other; `inline`: − and + side by side.'],
  ['wheel', '`Bind<boolean>`', '`false`', 'The mouse wheel changes the value while the field has focus.'],
  ['format', '`Bind<Intl.NumberFormatOptions>`', '`{}`', 'How the value shows without focus: `{ style: \'currency\', currency: \'TRY\' }`, `{ style: \'percent\' }`, `{ minimumFractionDigits: 2 }`…'],
  ['locale', '`Bind<string>`', 'the page `lang`', 'The locale of the format and of what is typed.'],
  ['decimals', '`Bind<number | null>`', '`null`', 'Digits after the point: every value is rounded to them (half away from zero), wherever it comes from, and shown with exactly that many while the field is not edited.'],
  ['clamp', '`Bind<boolean>`', '`true`', 'A value outside `min` / `max` is brought inside when entered; `false` leaves it to the range check.'],
  ['allowEmpty', '`Bind<boolean>`', '`true`', 'An empty field is `null`; `false` puts `min` (or 0) in its place when the field is left.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`input`: the value changes as soon as the text is a whole number in range; `change`: when the field is left or Enter is pressed.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while the field is empty.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects the whole text when the field gets focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['label, labelMode, helpText, hint, prefix, suffix, icon, buttons', 'see TextBox', '', 'The parts every field has.'],
  ['readOnly, required, size, variant, stretch', 'see TextBox', '', 'The states and the look every field has.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation, as for every field.'],
  ['name, autocomplete', '`Bind<string>`', "—, `'off'`", 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop. `locale` reads back the locale in use.'],
  ['formattedValue', 'read-only, reactive', 'The value as it shows without focus, `\'\'` when empty.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the checks.'],
  ['inputElement', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['stepUp(times = 1)', '`void`', 'Adds `step` × `times`, kept within `min` / `max`.'],
  ['stepDown(times = 1)', '`void`', 'Takes `step` × `times` away.'],
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the input.'],
  ['select()', '`void`', 'Selects the whole text.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; a held spin button reports every step.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Enter was pressed. `e`: `{ value, source, event }`.'],
];

const KEYS = [
  ['Up / Down arrow', 'Adds / takes away `step`.'],
  ['PageUp / PageDown', 'Adds / takes away `largeStep`.'],
  ['Home / End', 'Goes to `min` / `max` when they are set; otherwise moves the caret.'],
  ['Enter', 'Enters the typed text (rounded, kept in range) and fires `onEnter`.'],
  ['Mouse wheel', 'With `wheel`, steps while the field has focus.'],
  ['Alt + key (`&Name`)', 'Focus the field (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Role', '`spinbutton` on a text `<input inputmode="decimal">`, so phones show a number keyboard and any locale can be typed.'],
  ['Value', '`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`).'],
  ['Spin buttons', 'Named “Increase” / “Decrease” from `uiLocale`; not Tab stops (the arrow keys do their job).'],
  ['Errors', '`aria-invalid="true"`; the message line is a polite live region.'],
];

const HOOKS = [
  ['.mx-field.mx-number-box', 'The field. `data-spin` while the spin buttons show, and the field attributes.'],
  ['.mx-number-box__spin', 'The spin buttons; `data-layout="stacked" | "inline"`.'],
  ['.mx-number-box__step', 'One spin button; `data-step="up" | "down"`.'],
];

const TOKENS = [
  ['number-box.spin, number-box.step, number-box.glyph', 'Units: the spin buttons together (`stacked`, `inline`, `disabled`), each step (`up`, `down`, `next`, `hover`, `pressed`, `disabled`) and its glyph.'],
  ['number-box.spin-layout, number-box.spin-order', 'Where the steps stand (stacked at the end, or one on each side) and in which order.'],
  ['number-box.spin-inset', 'The space around the stacked spin buttons.'],
  ['field.*', 'Everything else, as for TextBox.'],
];

export default function NumberBoxPage() {
  return (
    <>
      <p class="lead">
        A number field: arrow keys, PageUp / PageDown and spin buttons that repeat while held, bounds, a step without float
        noise, a format for display (currency, percent) and typing in the locale’s own way.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="`x-model` binds a number (`null` when empty). Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="steps" title="Steps and keys">
        <p>
          <Rich text="Up / Down add `step`, PageUp / PageDown add `largeStep` (10 × `step` by default), Home / End go to `min` / `max`. Steps are added on the decimal digits, so 0.1 + 0.2 is 0.3. With `wheel`, the mouse wheel steps while the field has focus." />
        </p>
        <Example files={code('Steps.tsx')}>
          <Steps />
        </Example>
      </Section>

      <Section anchor="spin" title="Spin buttons">
        <p>
          <Rich text="Pressing a spin button steps once; holding it repeats until it is let go or a bound is reached. They sit on top of each other (`stacked`) or side by side (`inline`), or not at all." />
        </p>
        <Example files={code('SpinButtons.tsx')} stack>
          <SpinButtons />
        </Example>
      </Section>

      <Section anchor="format" title="Format and locale">
        <p>
          <Rich text="Without focus the value shows through `Intl.NumberFormat` with `format` and `locale` (the page `lang` by default); with focus it turns into the plain number to edit. What is typed is read in that locale: `1.234,5` in Turkish, `1,234.5` in English; a `.` also works as the decimal point where it cannot be a group separator. A percent is edited as shown: 12.5 for 0.125." />
        </p>
        <Example files={code('Format.tsx')} stack>
          <Format />
        </Example>
      </Section>

      <Section anchor="range" title="Min, max and clamp">
        <p>
          <Rich text="An entered value outside `min` / `max` is brought inside when the field is left. With `clamp={false}` it stays as typed and the range check reports it." />
        </p>
        <Example files={code('MinMaxClamp.tsx')}>
          <MinMaxClamp />
        </Example>
      </Section>

      <Section anchor="decimals" title="Decimals and empty">
        <p>
          <Rich text="`decimals` rounds every value, the one given as well as the one entered, and shows exactly that many digits while the field is not edited (`72.50`); `format` can show them otherwise. An empty field is `null`; with `allowEmpty={false}` it gets `min` (or 0) when the field is left." />
        </p>
        <Example files={code('DecimalsAndEmpty.tsx')}>
          <DecimalsAndEmpty />
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
          <Rich text="The names of the spin buttons and the range messages come from `uiLocale.strings`; numbers follow `locale`." />
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
      </Section>
    </>
  );
}
