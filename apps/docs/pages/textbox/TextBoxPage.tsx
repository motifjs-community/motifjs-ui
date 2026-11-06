import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CheckPanel from './examples/CheckPanel';
import Programmatic from './examples/Programmatic';
import LabelModes from './examples/LabelModes';
import Localization from './examples/Localization';
import Masks from './examples/Masks';
import PasswordCounter from './examples/PasswordCounter';
import PrefixSuffix from './examples/PrefixSuffix';
import ReadOnly from './examples/ReadOnly';
import Validation from './examples/Validation';
import VariantsAndSizes from './examples/VariantsAndSizes';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<string>`', "`''`", 'The text. `x-model` provides two-way binding.'],
  ['label', '`Bind<string>`', "`''`", 'The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side` (next to the box), `floating` (inside the box until there is a value) or `hidden` (for screen readers only).'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty.'],
  ['helpText', '`Bind<string>`', "`''`", 'Help text shown below the box. An error message replaces it.'],
  ['hint', '`Bind<string>`', "`''`", 'The tooltip text.'],
  ['type', '`Bind<TextBoxType>`', "`'text'`", '`text`, `password`, `email`, `search`, `tel` or `url`. `email` and `url` also validate the format.'],
  ['prefix / suffix', '`Bind<string>`', "`''`", 'Fixed text before or after the value inside the box (`https://`, `kg`).'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon at the start of the box.'],
  ['buttons', '`Bind<readonly FieldButton[]>`', '`[]`', 'Custom buttons inside the box, at the start or end.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Shows a button that clears the field. Pressing Escape also clears it.'],
  ['passwordReveal', '`Bind<boolean>`', '`true`', 'With `type="password"`, shows a button that reveals the password.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Length limits. `minLength` is enforced by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', 'Shows `12/50` below the box (`12` without `maxLength`).'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", 'With `change`, the value updates when the field loses focus or the user presses Enter.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects all text when the field receives focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'The value can be read, selected and copied, but not changed.'],
  ['required', '`Bind<boolean>`', '`false`', 'Adds an indicator after the label, `aria-required` and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['variant', '`Bind<FieldVariant>`', "`'outline'`", '`outline`, `filled`, `underline`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Stretches to the full width of its container.'],
  ['mask', '`Bind<string>`', "`''`", 'See Input mask.'],
  ['maskChars', '`Bind<Record<string, MaskChar>>`', '`{}`', 'Custom mask characters.'],
  ['maskPlaceholder', '`Bind<string>`', "`'_'`", 'Shown in positions that are not filled yet.'],
  ['maskValue', "`Bind<'raw' | 'formatted'>`", "`'raw'`", '`raw` returns only the typed characters, and `formatted` includes the fixed ones.'],
  ['showMask', "`Bind<'always' | 'focus'>`", "`'focus'`", 'With `focus`, an empty mask appears only while the field has focus.'],
  ['rules', '`Bind<readonly ValidationRule[]>`', '`[]`', 'See Validation.'],
  ['error', '`Bind<string | null>`', '—', 'An error from an external source, such as the server. It stays until cleared.'],
  ['validateOn', '`Bind<ValidateOn>`', "`'blur'`", '`blur`, `input`, `manual`.'],
  ['validationGroup', '`Bind<ValidationGroup | null>`', '—', 'The group the field is validated with.'],
  ['inputMode, autocomplete, spellcheck, name', '`Bind<…>`', '—', 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop: `box.error = () => this.model.nameError` is tracked.'],
  ['isValid', 'read-only, reactive', '`false` while an error is displayed.'],
  ['validationMessage', 'read-only, reactive', 'The error being displayed, or `\'\'` if there is none.'],
  ['validating', 'read-only, reactive', 'Indicates that an asynchronous rule is running.'],
  ['maskComplete', 'read-only', 'Indicates that every position of the mask is filled.'],
  ['inputElement', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['focus()', '`boolean`', 'Sets focus on the input.'],
  ['select()', '`void`', 'Selects all text.'],
  ['clear()', '`void`', 'Clears the field, as the clear button does.'],
  ['refresh()', '`void`', 'Your `buttons` can be plain or reactive, and the field reads them as they are. After changing them in place, call `refresh()`. Every editor has this method, and list editors also re-read their items.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `byUser` distinguishes user input from programmatic changes.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Occurs when the user presses Enter. `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'DOM events from the input bubble up to the field.'],
];

const RULES = [
  ["{ type: 'required' }", 'A value is required.'],
  ["{ type: 'email' } / { type: 'url' }", 'An email address or a web address.'],
  ["{ type: 'pattern', pattern }", 'A `RegExp`, or a string that must match the whole value, like the HTML `pattern` attribute.'],
  ["{ type: 'length', min?, max? }", 'The number of characters.'],
  ["{ type: 'range', min?, max? }", 'A number or date within a range.'],
  ["{ type: 'compare', with, not? }", 'Equal to another value, such as a repeated password, or different from it with `not`.'],
  ["{ type: 'custom', check, ignoreEmpty? }", '`check(value)` returns `true`, `false`, a message, or a promise of one of these, such as a server call.'],
  ['every rule', '`message` (a value or a function) and `enabled`. Empty values pass every rule except `required` and `compare`.'],
];

const MASK = [
  ['0', 'A digit.'],
  ['9', 'An optional digit.'],
  ['a', 'A letter.'],
  ['*', 'A letter or a digit.'],
  ['\\\\', 'Treats the next character as fixed: `\\\\0` is a fixed zero.'],
  ['anything else', 'A fixed character, skipped during typing.'],
];

const KEYS = [
  ['Alt + key (`&Name`)', 'Moves focus to the field (Control + Option + key on Apple platforms).'],
  ['Enter', 'Commits the value (with `updateOn="change"`) and raises `onEnter`.'],
  ['Escape', 'With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window.'],
  ['Tab', 'Custom buttons and the password button are Tab stops. The clear button is not, because Escape does the same thing.'],
];

const A11Y = [
  ['Element', 'A native `<input>` associated with its `<label>` through `for`.'],
  ['Description', '`aria-describedby` references the prefix, the suffix and the help text.'],
  ['Errors', '`aria-invalid="true"`. The message is a polite live region, so new errors are announced.'],
  ['Required check boxes', '`aria-required="true"`. The indicator after the label is hidden from screen readers.'],
  ['Buttons', 'The clear and password buttons get their names from `uiLocale`, and the password button has `aria-pressed`.'],
];

const HOOKS = [
  ['.mx-field', 'The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`.'],
  ['.mx-text-box', 'Added by TextBox.'],
  ['.mx-field__label, .mx-field__box, .mx-field__input', 'The label, the box and the input.'],
  ['.mx-field__icon, .mx-field__prefix, .mx-field__suffix', 'The parts on either side of the input.'],
  ['.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal', 'Buttons inside the box.'],
  ['.mx-field__message, .mx-field__counter', 'Help text below the box.'],
];

const TOKENS = [
  ['field.width', 'The width when the field is not stretched.'],
  ['field.height.*, field.padding.*, field.font-size.*', 'Sizes are defined by the density tokens.'],
  ['field.box, field.layer, field.frame, field.indicator, field.ring', 'Units: the box, a state layer over its fill, the frame (with `frame-start`, `frame-notch` and `frame-end` around a notch), the line along the bottom, and a ring for keyboard focus. Each has a box per state: by variant (`filled-…`, `underline-…`), by status (`invalid`, `readonly`, `disabled`), and for `hover`, `focus` and `pressed`.'],
  ['field.label, field.required, field.icon, field.prefix, field.suffix, field.placeholder', 'Units: the label (`focus`, `invalid`, `disabled`, `floating-…`), the required indicator and the parts next to the text.'],
  ['field.slot, field.button, field.glyph, field.button-icon', 'Units: button groups in the box, the buttons (`hover`, `pressed`, `focus`, `disabled`) and their contents.'],
  ['field.foot, field.message, field.counter', 'Units: the line below the box (`shown`, `invalid`, `disabled`), the help or error text, and the counter.'],
  ['field.border-width, field.gap, field.label-gap, field.label-width, field.label-font-weight, field.label-font-size', 'Frame width, spacing and the label.'],
  ['field.icon-size, field.button-inset', 'Icons, and the distance between the buttons and the edges of the box.'],
  ['field.floating-height, field.floating-font-size, field.floating-padding, field.notch-gap', 'The floating label and the notch cut for it.'],
];

export default function TextBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A single-line text input with a label, help text and error display. It supports a placeholder, a prefix and suffix, buttons inside the box, a clear button, a password reveal button, a character counter, an input mask and validation, either on its own, in a group, or across all fields in a panel." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop accepts a value or a function, and a function that reads a reactive object keeps the field in sync with it. `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="label" title="Label">
        <p>
          <Rich text={'The label can appear above the box, next to it (`side`), inside it until there is a value (`floating`), or only for screen readers (`hidden`). `&` marks its access key.'} />
        </p>
        <Example files={code('LabelModes.tsx')} stack>
          <LabelModes />
        </Example>
      </Section>

      <Section anchor="look" title="Variants and sizes">
        <Example files={code('VariantsAndSizes.tsx')} stack>
          <VariantsAndSizes />
        </Example>
      </Section>

      <Section anchor="content" title="Prefix, suffix, icon and buttons">
        <p>
          <Rich text="`prefix` and `suffix` add fixed text around the value, and `icon` appears at the start. `buttons` adds custom buttons, each with its own `enabled`, `visible` and `position`." />
        </p>
        <Example files={code('PrefixSuffix.tsx')} stack>
          <PrefixSuffix />
        </Example>
      </Section>

      <Section anchor="password" title="Password and character counter">
        <Example files={code('PasswordCounter.tsx')} stack>
          <PasswordCounter />
        </Example>
      </Section>

      <Section anchor="mask" title="Input mask">
        <p>
          <Rich text={'A mask keeps the text in the required format as the user types, deletes or pastes, and the caret skips fixed characters. The value contains only the typed characters, or the displayed text with `maskValue="formatted"`. An incomplete mask fails validation.'} />
        </p>
        <ApiTable head={['Character', 'Meaning']} rows={MASK} />
        <Example files={code('Masks.tsx')} stack>
          <Masks />
        </Example>
      </Section>

      <Section anchor="validation" title="Validation">
        <p>
          <Rich text={'A field validates itself when it loses focus after a change, and then on every change until the value is valid. `required`, `minLength`, `type="email"` and a mask bring their own rules, and `rules` adds your own, including asynchronous ones. `error` displays a message from an external source, such as the server.'} />
        </p>
        <Example files={code('Validation.tsx')} stack>
          <Validation />
        </Example>
        <p>
          <Rich text="Without a group, `validateFields(panel)` validates every field inside a component or element, such as a panel, a dialog or a page." />
        </p>
        <Example files={code('CheckPanel.tsx')}>
          <CheckPanel />
        </Example>
      </Section>

      <Section anchor="states" title="Read-only and disabled">
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
          <Rich text="The names of the clear and password buttons and all validation messages come from `uiLocale.strings`. Every field updates immediately when they change, including errors already on screen." />
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
        <h3>
          <Rich text="Validation rules" />
        </h3>
        <ApiTable head={['Rule', 'Validators']} rows={RULES} />
        <p>
          <Rich text="The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for use in other components and your own code." />
        </p>
      </Section>
    </>
  );
}
