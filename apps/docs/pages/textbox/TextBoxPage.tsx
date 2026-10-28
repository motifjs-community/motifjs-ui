import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import CheckPanel from './examples/CheckPanel';
import FromCode from './examples/FromCode';
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
  ['value', '`Bind<string>`', "`''`", 'The text. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption; `&Name` makes Alt+N focus the field. The same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side` (next to the box), `floating` (inside the box until there is a value), `hidden` (only for screen readers).'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while the field is empty.'],
  ['helpText', '`Bind<string>`', "`''`", 'A line under the box. An error message takes its place.'],
  ['hint', '`Bind<string>`', "`''`", 'A tooltip.'],
  ['type', '`Bind<TextBoxType>`', "`'text'`", '`text`, `password`, `email`, `search`, `tel`, `url`. `email` and `url` also check the format.'],
  ['prefix / suffix', '`Bind<string>`', "`''`", 'Fixed text before / after the value inside the box (`https://`, `kg`).'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon at the start of the box.'],
  ['buttons', '`Bind<readonly FieldButton[]>`', '`[]`', 'Buttons of your own inside the box, at the start or the end.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties the field; Escape does the same.'],
  ['passwordReveal', '`Bind<boolean>`', '`true`', 'With `type="password"`: a button that shows the password.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Limits; `minLength` is checked by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', '`12/50` under the box (`12` without `maxLength`).'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`change`: the value changes when the field is left or Enter is pressed.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects the whole text when the field gets focus.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", "`'start'`", 'Text alignment.'],
  ['readOnly', '`Bind<boolean>`', '`false`', 'Can be read, selected and copied, not changed.'],
  ['required', '`Bind<boolean>`', '`false`', 'A mark after the label, `aria-required`, and a `required` rule.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['variant', '`Bind<FieldVariant>`', "`'outline'`", '`outline`, `filled`, `underline`.'],
  ['stretch', '`Bind<boolean>`', '`false`', 'Fills the width of what it sits in.'],
  ['mask', '`Bind<string>`', "`''`", 'See Mask.'],
  ['maskChars', '`Bind<Record<string, MaskChar>>`', '`{}`', 'Mask characters of your own.'],
  ['maskPlaceholder', '`Bind<string>`', "`'_'`", 'Shown in the places not filled yet.'],
  ['maskValue', "`Bind<'raw' | 'formatted'>`", "`'raw'`", '`raw`: only the typed characters; `formatted`: with the fixed ones.'],
  ['showMask', "`Bind<'always' | 'focus'>`", "`'focus'`", '`focus`: an empty mask shows only while the field has focus.'],
  ['rules', '`Bind<readonly ValidationRule[]>`', '`[]`', 'See Validation.'],
  ['error', '`Bind<string | null>`', '—', 'An error from outside (the server); shown until cleared.'],
  ['validateOn', '`Bind<ValidateOn>`', "`'blur'`", '`blur`, `input`, `manual`.'],
  ['validationGroup', '`Bind<ValidationGroup | null>`', '—', 'The group it is checked with.'],
  ['inputMode, autocomplete, spellcheck, name', '`Bind<…>`', '—', 'Passed to the `<input>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop: `box.error = () => this.model.nameError` is followed.'],
  ['isValid', 'read-only, reactive', '`false` while an error shows.'],
  ['validationMessage', 'read-only, reactive', 'The error shown, `\'\'` without one.'],
  ['validating', 'read-only, reactive', 'An asynchronous rule is running.'],
  ['maskComplete', 'read-only', 'Every place of the mask is filled.'],
  ['inputElement', 'read-only', 'The native `<input>`.'],
];

const METHODS = [
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the input.'],
  ['select()', '`void`', 'Selects the whole text.'],
  ['clear()', '`void`', 'Empties the field as its clear button does.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`; `byUser` tells the user from code.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Enter was pressed. `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'The DOM events of the input reach the field.'],
];

const RULES = [
  ["{ type: 'required' }", 'Something must be entered.'],
  ["{ type: 'email' } / { type: 'url' }", 'An email address / a web address.'],
  ["{ type: 'pattern', pattern }", 'A `RegExp`, or a string that must match the whole value (like the HTML `pattern`).'],
  ["{ type: 'length', min?, max? }", 'The number of characters.'],
  ["{ type: 'range', min?, max? }", 'A number or a date between bounds.'],
  ["{ type: 'compare', with, not? }", 'Equal to another value (a repeated password), or different with `not`.'],
  ["{ type: 'custom', check, ignoreEmpty? }", '`check(value)` returns `true`, `false` or a message, or a promise of one (a server call).'],
  ['every rule', '`message` (a value or a function) and `enabled`. Empty values pass every rule but `required` and `compare`.'],
];

const MASK = [
  ['0', 'A digit.'],
  ['9', 'A digit that may stay empty.'],
  ['a', 'A letter.'],
  ['*', 'A letter or a digit.'],
  ['\\\\', 'The next character is fixed: `\\\\0` is a fixed zero.'],
  ['anything else', 'A fixed character, skipped while typing.'],
];

const KEYS = [
  ['Alt + key (`&Name`)', 'Focus the field (Control + Option + key on Apple platforms).'],
  ['Enter', 'Commits the value (with `updateOn="change"`) and fires `onEnter`.'],
  ['Escape', 'With `clearButton`, empties a field that has a value; otherwise it goes on to the window around it.'],
  ['Tab', 'The buttons you add and the password button are Tab stops; the clear button is not (Escape does its job).'],
];

const A11Y = [
  ['Element', 'A native `<input>`; its `<label>` is tied to it with `for`.'],
  ['Description', '`aria-describedby` names the prefix, the suffix and the line under the box.'],
  ['Errors', '`aria-invalid="true"`; the message line is a polite live region, so a new error is read out.'],
  ['Required', '`aria-required="true"`; the mark after the label is hidden from screen readers.'],
  ['Buttons', 'The clear and password buttons are named from `uiLocale`; the password button has `aria-pressed`.'],
];

const HOOKS = [
  ['.mx-field', 'The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`.'],
  ['.mx-text-box', 'Added by TextBox.'],
  ['.mx-field__label, .mx-field__box, .mx-field__input', 'The label, the box, the input.'],
  ['.mx-field__icon, .mx-field__prefix, .mx-field__suffix', 'The parts at the sides of the input.'],
  ['.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal', 'The buttons in the box.'],
  ['.mx-field__message, .mx-field__counter', 'The line under the box.'],
];

const TOKENS = [
  ['field.width', 'The width when not stretched.'],
  ['field.height.*, field.padding.*, field.font-size.*', 'Sizes, from the density tokens.'],
  ['field.box, field.layer, field.frame, field.indicator, field.ring', 'Units: the box, a state layer over its fill, the frame (with `frame-start`, `frame-notch`, `frame-end` around a notch), the line along its bottom and a ring under the keys, each with its box per state: per variant (`filled-…`, `underline-…`), status (`invalid`, `readonly`, `disabled`) and `hover`, `focus`, `pressed`.'],
  ['field.label, field.required, field.icon, field.prefix, field.suffix, field.placeholder', 'Units: the label (`focus`, `invalid`, `disabled`, `floating-…`), the required mark and the parts beside the text.'],
  ['field.slot, field.button, field.glyph, field.button-icon', 'Units: the groups of buttons in the box, the buttons (`hover`, `pressed`, `focus`, `disabled`) and what they show.'],
  ['field.foot, field.message, field.counter', 'Units: the line under the box (`shown`, `invalid`, `disabled`), the help or error text and the counter.'],
  ['field.border-width, field.gap, field.label-gap, field.label-width, field.label-font-weight, field.label-font-size', 'The frame’s width, spacing and the label.'],
  ['field.icon-size, field.button-inset', 'Icons, and how far the buttons sit from the box’s edges.'],
  ['field.floating-height, field.floating-font-size, field.floating-padding, field.notch-gap', 'The floating label and the notch cut for it.'],
];

export default function TextBoxPage() {
  return (
    <>
      <p class="lead">
        A one-line text field with its label, help text and error: placeholder, prefix and suffix, buttons in the box,
        a clear button, a password that can be shown, a character counter, an input mask and validation — alone, in a
        group, or every field in a panel.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; a function of a reactive object keeps the field in step with it. `x-model` binds the value two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example files={code('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="label" title="Label">
        <p>
          <Rich text="The label goes above the box, next to it (`side`), inside it until there is a value (`floating`), or only to screen readers (`hidden`). `&` marks its access key." />
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

      <Section anchor="content" title="Prefix, suffix, icon, buttons">
        <p>
          <Rich text="`prefix` and `suffix` are fixed text around the value; `icon` sits at the start; `buttons` adds your own, each with its own `enabled`, `visible` and `position`." />
        </p>
        <Example files={code('PrefixSuffix.tsx')} stack>
          <PrefixSuffix />
        </Example>
      </Section>

      <Section anchor="password" title="Password, counter">
        <Example files={code('PasswordCounter.tsx')} stack>
          <PasswordCounter />
        </Example>
      </Section>

      <Section anchor="mask" title="Mask">
        <p>
          <Rich text={'A mask keeps the text in shape while it is typed, deleted or pasted; the caret skips the fixed characters. The value is the typed characters only, or with `maskValue="formatted"` the text as shown. A mask that is not filled in fails validation.'} />
        </p>
        <ApiTable head={['Character', 'Means']} rows={MASK} />
        <Example files={code('Masks.tsx')} stack>
          <Masks />
        </Example>
      </Section>

      <Section anchor="validation" title="Validation">
        <p>
          <Rich text={'A field checks itself when it is left after a change, then on every change until the value passes. `required`, `minLength`, `type="email"` and a mask bring their own rules; `rules` adds yours, async ones too. `error` shows a message from outside, e.g. from the server.'} />
        </p>
        <Example files={code('Validation.tsx')} stack>
          <Validation />
        </Example>
        <p>
          <Rich text="Without a group, `validateFields(panel)` checks every field inside a component or an element: a panel, a dialog, a page." />
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
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The names of the clear and password buttons and every validation message come from `uiLocale.strings`; every field follows a change at once, errors already shown included." />
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
        <h3>Validation rules</h3>
        <ApiTable head={['Rule', 'Checks']} rows={RULES} />
        <p>
          <Rich text="The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for other components and your own." />
        </p>
      </Section>
    </>
  );
}
