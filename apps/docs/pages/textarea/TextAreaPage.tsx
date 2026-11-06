import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AutoGrow from './examples/AutoGrow';
import CounterAndLimits from './examples/CounterAndLimits';
import CtrlEnter from './examples/CtrlEnter';
import Programmatic from './examples/Programmatic';
import LabelModes from './examples/LabelModes';
import Localization from './examples/Localization';
import Resize from './examples/Resize';
import States from './examples/States';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<string>`', "`''`", 'The text, lines separated by `\\n`. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side`, `floating`, `hidden`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty.'],
  ['rows', '`Bind<number>`', '`3`', 'Visible lines.'],
  ['autoGrow', '`Bind<boolean>`', '`false`', 'The box follows the text, from `minRows` to `maxRows` lines, then scrolls.'],
  ['minRows', '`Bind<number>`', '`rows`', 'The smallest box with `autoGrow`.'],
  ['maxRows', '`Bind<number | null>`', '`null`', 'The largest box with `autoGrow`; without it the box grows without a limit.'],
  ['resize', '`Bind<TextAreaResize>`', "`'vertical'`", '`none`, `vertical`, `both`: which way the user can drag the box. `none` while `autoGrow` is on.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Limits; both are checked by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', '`12/500` under the box (`12` without `maxLength`).'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Shows a button that clears the field. Pressing Escape also clears it.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`change`: the value changes when the field is left or Ctrl+Enter is pressed.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects all text when the field receives focus.'],
  ['wrap', "`Bind<'soft' | 'hard' | 'off'>`", "`'soft'`", '`off` keeps long lines on one line and scrolls sideways.'],
  ['helpText, hint, prefix, suffix, icon, buttons', 'see TextBox', '', 'Parts common to all fields.'],
  ['readOnly, required, size, variant, stretch', 'see TextBox', '', 'States and appearance common to all fields.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation works the same way as for all fields.'],
  ['spellcheck, name, autocomplete', '`Bind<…>`', '—', 'Passed to the `<textarea>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The validation result.'],
  ['textAreaElement', 'read-only', 'The native `<textarea>`.'],
];

const METHODS = [
  ['validate()', '`Promise<boolean>`', 'Validates the value and displays the result.'],
  ['resetValidation()', '`void`', 'Clears the results of previous validation.'],
  ['focus()', '`boolean`', 'Focuses the textarea.'],
  ['select()', '`void`', 'Selects all text.'],
  ['clear()', '`void`', 'Clears the field, as the clear button does.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Ctrl+Enter (Cmd+Enter) was pressed. `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'The DOM events of the textarea reach the field.'],
];

const KEYS = [
  ['Enter', 'A new line.'],
  ['Ctrl + Enter, Cmd + Enter', 'Commits the value (with `updateOn="change"`) and fires `onEnter`: send, save.'],
  ['Escape', 'With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window.'],
  ['Alt + key (`&Name`)', 'Moves focus to the field (Control + Option + key on Apple platforms).'],
  ['Tab', 'Leaves the field; the clear button is not a Tab stop (Escape does its job).'],
];

const A11Y = [
  ['Element', 'A native `<textarea>` (multi-line by nature); its `<label>` is tied to it with `for`.'],
  ['Description', '`aria-describedby` references the prefix, the suffix and the help text.'],
  ['Errors', '`aria-invalid="true"`. The message is a polite live region.'],
  ['Required', '`aria-required="true"`. The indicator after the label is hidden from screen readers.'],
  ['Ctrl + Enter', 'Say it in the label or the help text when it sends something, as in the example above.'],
];

const HOOKS = [
  ['.mx-field.mx-text-area', 'The field. `data-resize`, `data-auto-grow`, and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`).'],
  ['.mx-field__box', 'The box; it carries the resize grip.'],
  ['.mx-field__input.mx-text-area__input', 'The textarea.'],
  ['.mx-text-area__clear', 'The clear button.'],
  ['.mx-field__message, .mx-field__counter', 'Help text below the box.'],
];

export default function TextAreaPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A text field of several lines: a box that grows with the text or that the user drags bigger, a character counter, a clear button, Ctrl+Enter to send, and the label, help text and validation every field has." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the text two-way. Created with `new`, the same properties are set programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="grow" title="Growing with the text">
        <p>
          <Rich text="With `autoGrow` the box follows the text: never smaller than `minRows` lines, never taller than `maxRows`; past that it scrolls. A narrower box wraps into more lines and grows too." />
        </p>
        <Example files={code('AutoGrow.tsx')}>
          <AutoGrow />
        </Example>
      </Section>

      <Section anchor="resize" title="Resize">
        <p>
          <Rich text="The grip at the corner of the box lets the user drag it taller (`vertical`, the default), in both directions (`both`), or not at all (`none`)." />
        </p>
        <Example files={code('Resize.tsx')} stack>
          <Resize />
        </Example>
      </Section>

      <Section anchor="counter" title="Counter and limits">
        <p>
          <Rich text="`maxLength` stops typing at the limit, `minLength` is checked when the field is left; `showCounter` shows the count under the box." />
        </p>
        <Example files={code('CounterAndLimits.tsx')}>
          <CounterAndLimits />
        </Example>
      </Section>

      <Section anchor="enter" title="Ctrl+Enter">
        <p>
          <Rich text="Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) fires `onEnter` with the value: the usual way to send a message or save a note." />
        </p>
        <Example files={code('CtrlEnter.tsx')} stack>
          <CtrlEnter />
        </Example>
      </Section>

      <Section anchor="label" title="Label">
        <Example files={code('LabelModes.tsx')} stack>
          <LabelModes />
        </Example>
      </Section>

      <Section anchor="states" title="Read-only, disabled, required">
        <Example files={code('States.tsx')}>
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
          <Rich text="The name of the clear button and the validation messages come from `uiLocale.strings`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <p>
          <Rich text="TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own: the first line lines up with a one-line field of the same size." />
        </p>
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
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
