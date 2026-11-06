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
  ['value', '`Bind<string>`', "`''`", 'The text, with lines separated by `\\n`. `x-model` provides two-way binding.'],
  ['label', '`Bind<string>`', "`''`", 'The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side`, `floating`, `hidden`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty.'],
  ['rows', '`Bind<number>`', '`3`', 'The number of visible lines.'],
  ['autoGrow', '`Bind<boolean>`', '`false`', 'The box adjusts to its content, from `minRows` to `maxRows` lines, and then scrolls.'],
  ['minRows', '`Bind<number>`', '`rows`', 'The minimum height with `autoGrow`.'],
  ['maxRows', '`Bind<number | null>`', '`null`', 'The maximum height with `autoGrow`. Without it, the box grows without limit.'],
  ['resize', '`Bind<TextAreaResize>`', "`'vertical'`", '`none`, `vertical` or `both`: the directions the user can resize the box. This is `none` while `autoGrow` is on.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Length limits. Both are enforced by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', 'Shows `12/500` below the box (`12` without `maxLength`).'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Shows a button that clears the field. Pressing Escape also clears it.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", 'With `change`, the value updates when the field loses focus or the user presses Ctrl+Enter.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects all text when the field receives focus.'],
  ['wrap', "`Bind<'soft' | 'hard' | 'off'>`", "`'soft'`", '`off` keeps long lines on one line and scrolls horizontally.'],
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
  ['focus()', '`boolean`', 'Sets focus on the textarea.'],
  ['select()', '`void`', 'Selects all text.'],
  ['clear()', '`void`', 'Clears the field, as the clear button does.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'Occurs when validation finishes. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Occurs when the user presses Ctrl+Enter (Cmd+Enter). `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'DOM events from the textarea bubble up to the field.'],
];

const KEYS = [
  ['Enter', 'Inserts a new line.'],
  ['Ctrl + Enter, Cmd + Enter', 'Commits the value (with `updateOn="change"`) and raises `onEnter`.'],
  ['Escape', 'With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window.'],
  ['Alt + key (`&Name`)', 'Moves focus to the field (Control + Option + key on Apple platforms).'],
  ['Tab', 'Moves focus out of the field. The clear button is not a Tab stop, because Escape does the same thing.'],
];

const A11Y = [
  ['Element', 'A native `<textarea>` associated with its `<label>` through `for`.'],
  ['Description', '`aria-describedby` references the prefix, the suffix and the help text.'],
  ['Errors', '`aria-invalid="true"`. The message is a polite live region.'],
  ['Required check boxes', '`aria-required="true"`. The indicator after the label is hidden from screen readers.'],
  ['Ctrl + Enter', 'If Ctrl+Enter sends something, mention it in the label or help text, as the example above does.'],
];

const HOOKS = [
  ['.mx-field.mx-text-area', 'The field. `data-resize`, `data-auto-grow` and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`).'],
  ['.mx-field__box', 'The box, which carries the resize grip.'],
  ['.mx-field__input.mx-text-area__input', 'The textarea.'],
  ['.mx-text-area__clear', 'The clear button.'],
  ['.mx-field__message, .mx-field__counter', 'Help text below the box.'],
];

export default function TextAreaPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A multi-line text input. The box can grow with its content or be resized by the user, and it supports a character counter, a clear button and Ctrl+Enter to submit, along with the label, help text and validation common to all fields." />
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
          <Rich text="Every prop accepts a value or a function, and `x-model` provides two-way binding for the text. When you create the component with `new`, set the same properties programmatically." />
        </p>
        <Example files={code('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="grow" title="Auto-grow">
        <p>
          <Rich text="With `autoGrow`, the box adjusts to its content. It stays between `minRows` and `maxRows` lines and scrolls beyond that. When the box gets narrower, text wraps onto more lines and the box grows accordingly." />
        </p>
        <Example files={code('AutoGrow.tsx')}>
          <AutoGrow />
        </Example>
      </Section>

      <Section anchor="resize" title="Resizing">
        <p>
          <Rich text="The grip in the corner of the box lets the user resize it vertically (`vertical`, the default) or in both directions (`both`). Set `none` to disable resizing." />
        </p>
        <Example files={code('Resize.tsx')} stack>
          <Resize />
        </Example>
      </Section>

      <Section anchor="counter" title="Character counter and limits">
        <p>
          <Rich text="`maxLength` stops input at the limit, and `minLength` is checked when the field loses focus. `showCounter` displays the count below the box." />
        </p>
        <Example files={code('CounterAndLimits.tsx')}>
          <CounterAndLimits />
        </Example>
      </Section>

      <Section anchor="enter" title="Ctrl+Enter">
        <p>
          <Rich text="Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) raises `onEnter` with the value, which is the usual way to send a message or save a note." />
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

      <Section anchor="states" title="Read-only, disabled and required">
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
          <Rich text="TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own, so its first line aligns with a single-line field of the same size." />
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
