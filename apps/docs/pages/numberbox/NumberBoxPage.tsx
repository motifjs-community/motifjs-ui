import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DecimalsAndEmpty from './examples/DecimalsAndEmpty';
import Format from './examples/Format';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import MinMaxClamp from './examples/MinMaxClamp';
import SpinButtons from './examples/SpinButtons';
import Steps from './examples/Steps';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<number | null>`', '`null`', 'The number, or `null` when empty. `x-model` provides two-way binding.'],
  ['min / max', '`Bind<number | null>`', '`null`', 'The limits. Steps stop there, Home and End go there, entered values are kept inside (see `clamp`), and the range is validated.'],
  ['step', '`Bind<number>`', '`1`', 'The amount added by the arrow keys, the spin buttons and the wheel.'],
  ['largeStep', '`Bind<number>`', '10 × `step`', 'The amount added by PageUp and PageDown.'],
  ['showSpinButtons', '`Bind<boolean>`', '`true`', 'Shows up and down buttons in the box.'],
  ['spinLayout', '`Bind<SpinLayout>`', "`'stacked'`", '`stacked` shows arrows on top of each other, and `inline` shows − and + side by side.'],
  ['wheel', '`Bind<boolean>`', '`false`', 'The mouse wheel changes the value while the field has focus.'],
  ['format', '`Bind<Intl.NumberFormatOptions>`', '`{}`', 'The display format without focus: `{ style: \'currency\', currency: \'TRY\' }`, `{ style: \'percent\' }`, `{ minimumFractionDigits: 2 }`…'],
  ['locale', '`Bind<string>`', 'The page `lang`', 'The locale of the format and of the input.'],
  ['decimals', '`Bind<number | null>`', '`null`', 'The number of digits after the decimal point. Every value is rounded to this precision (half away from zero) regardless of its source, and displayed with exactly that many digits while the field is not being edited.'],
  ['clamp', '`Bind<boolean>`', '`true`', 'Brings a value outside `min` and `max` into range when entered. `false` leaves it to the range validation.'],
  ['allowEmpty', '`Bind<boolean>`', '`true`', 'An empty field is `null`. `false` replaces it with `min` (or 0) when the field loses focus.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", 'With `input`, the value updates as soon as the text is a complete number in range. With `change`, it updates when the field loses focus or the user presses Enter.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects all text when the field receives focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['label, labelMode, helpText, hint, prefix, suffix, icon, buttons', 'see TextBox', '', 'Parts common to all fields.'],
  ['readOnly, required, size, variant, stretch', 'see TextBox', '', 'States and appearance common to all fields.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation works the same way as for all fields.'],
  ['name, autocomplete', '`Bind<string>`', "—, `'off'`", 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop. `locale` returns the locale in use.'],
  ['formattedValue', 'read-only, reactive', 'The value as displayed without focus, or `\'\'` when empty.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The validation result.'],
  ['inputPart', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['stepUp(times = 1)', '`void`', 'Adds `step` × `times`, kept within `min` and `max`.'],
  ['stepDown(times = 1)', '`void`', 'Subtracts `step` × `times`.'],
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['focus()', '`boolean`', 'Sets focus on the input.'],
  ['select()', '`void`', 'Selects all text.'],
  ['typeText(text)', '`void`', 'Puts `text` in the field as if the user typed it; characters a number is not written with are not taken.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. A held spin button reports every step.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Occurs when the user presses Enter. `e`: `{ value, source, event }`.'],
];

const KEYS = [
  ['Up / Down arrow', 'Adds or subtracts `step`.'],
  ['PageUp / PageDown', 'Adds or subtracts `largeStep`.'],
  ['Home / End', 'Goes to `min` or `max` when set. Otherwise, moves the caret.'],
  ['Enter', 'Commits the typed text, rounded and within range, and raises `onEnter`.'],
  ['Mouse wheel', 'With `wheel`, changes the value by one step while the field has focus.'],
  ['Alt + key (`&Name`)', 'Moves focus to the field (Control + Option + key on Apple platforms).'],
];

const A11Y = [
  ['Role', '`spinbutton` on a text `<input inputmode="decimal">`, so phones show a numeric keyboard and any locale can be typed.'],
  ['Value', '`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`).'],
  ['Spin buttons', 'Named “Increase” and “Decrease” from `uiLocale`. They are not Tab stops, because the arrow keys do the same thing.'],
  ['Errors', '`aria-invalid="true"`. The message is a polite live region.'],
];

const HOOKS = [
  ['.mx-field.mx-number-box', 'The field. `data-spin` while spin buttons are shown, plus the field attributes.'],
  ['.mx-number-box__spin', 'The spin buttons; `data-layout="stacked" | "inline"`.'],
  ['.mx-number-box__step', 'One spin button; `data-step="up" | "down"`.'],
];

const TOKENS = [
  ['number-box.spin, number-box.step, number-box.glyph', 'Units: the spin button group (`stacked`, `inline`, `disabled`), each step (`up`, `down`, `next`, `hover`, `pressed`, `disabled`) and its glyph.'],
  ['number-box.spin-layout, number-box.spin-order', 'Where the steps are placed (stacked at the end, or one on each side) and their order.'],
  ['number-box.spin-inset', 'The space around stacked spin buttons.'],
  ['field.*', 'Everything else works as in TextBox.'],
];

export default function NumberBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A numeric input with arrow key support, PageUp and PageDown, spin buttons that repeat while held, min and max limits, exact decimal stepping, display formats such as currency and percent, and locale-aware input." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="`x-model` binds a number (`null` when empty). When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="steps" title="Steps and keyboard input">
        <p>
          <Rich text="Up and Down add `step`, PageUp and PageDown add `largeStep` (10 × `step` by default), and Home and End go to `min` and `max`. Steps are calculated on the decimal digits, so 0.1 + 0.2 equals 0.3. With `wheel`, the mouse wheel changes the value while the field has focus." />
        </p>
        <Example files={code('Steps.tsx')}>
          <Steps />
        </Example>
      </Section>

      <Section anchor="spin" title="Spin buttons">
        <p>
          <Rich text="Clicking a spin button changes the value by one step. Holding it repeats until the button is released or a limit is reached. The buttons can be `stacked`, `inline` or hidden." />
        </p>
        <Example files={code('SpinButtons.tsx')} stack>
          <SpinButtons />
        </Example>
      </Section>

      <Section anchor="format" title="Format and locale">
        <p>
          <Rich text="Without focus, the value is displayed through `Intl.NumberFormat` using `format` and `locale` (the page `lang` by default). With focus, it switches to a plain number for editing. Input is parsed in the same locale: `1.234,5` in Turkish and `1,234.5` in English. A `.` also works as the decimal point where it cannot be a group separator. A percent is edited as displayed, so 0.125 is entered as 12.5." />
        </p>
        <Example files={code('Format.tsx')} stack>
          <Format />
        </Example>
      </Section>

      <Section anchor="range" title="Min, max and clamping">
        <p>
          <Rich text="A value outside `min` and `max` is brought into range when the field loses focus. With `clamp={false}`, it stays as typed and the range validation reports it." />
        </p>
        <Example files={code('MinMaxClamp.tsx')}>
          <MinMaxClamp />
        </Example>
      </Section>

      <Section anchor="decimals" title="Decimals and empty values">
        <p>
          <Rich text="`decimals` rounds every value, whether set in code or entered by the user, and displays exactly that many digits while the field is not being edited (`72.50`). `format` can override how they are displayed. An empty field is `null`. With `allowEmpty={false}`, it receives `min` (or 0) when it loses focus." />
        </p>
        <Example files={code('DecimalsAndEmpty.tsx')}>
          <DecimalsAndEmpty />
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
          <Rich text="The spin button names and range messages come from `uiLocale.strings`. Numbers follow `locale`." />
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
