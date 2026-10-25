import { reactive, type Component } from '@motifx/core';
import { Button, enStrings, TextArea, trStrings, uiLocale, type FieldLabelMode, type TextAreaResize } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const RESIZES: TextAreaResize[] = ['none', 'vertical', 'both'];
const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];

const PROPS = [
  ['value', '`Bind<string>`', "`''`", 'The text, lines separated by `\\n`. `x-model` binds it two-way.'],
  ['label', '`Bind<string>`', "`''`", 'The caption; `&Name` makes Alt+N focus the field. The same property as `text`.'],
  ['labelMode', '`Bind<FieldLabelMode>`', "`'top'`", '`top`, `side`, `floating`, `hidden`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while the field is empty.'],
  ['rows', '`Bind<number>`', '`3`', 'Visible lines.'],
  ['autoGrow', '`Bind<boolean>`', '`false`', 'The box follows the text, from `minRows` to `maxRows` lines, then scrolls.'],
  ['minRows', '`Bind<number>`', '`rows`', 'The smallest box with `autoGrow`.'],
  ['maxRows', '`Bind<number | null>`', '`null`', 'The largest box with `autoGrow`; without it the box grows without a limit.'],
  ['resize', '`Bind<TextAreaResize>`', "`'vertical'`", '`none`, `vertical`, `both`: which way the user can drag the box. `none` while `autoGrow` is on.'],
  ['maxLength / minLength', '`Bind<number>`', '—', 'Limits; both are checked by validation.'],
  ['showCounter', '`Bind<boolean>`', '`false`', '`12/500` under the box (`12` without `maxLength`).'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'A button that empties the field; Escape does the same.'],
  ['updateOn', "`Bind<'input' | 'change'>`", "`'input'`", '`change`: the value changes when the field is left or Ctrl+Enter is pressed.'],
  ['selectOnFocus', '`Bind<boolean>`', '`false`', 'Selects the whole text when the field gets focus.'],
  ['wrap', "`Bind<'soft' | 'hard' | 'off'>`", "`'soft'`", '`off` keeps long lines on one line and scrolls sideways.'],
  ['helpText, hint, prefix, suffix, icon, buttons', 'see TextBox', '', 'The parts every field has.'],
  ['readOnly, required, size, variant, stretch', 'see TextBox', '', 'The states and the look every field has.'],
  ['rules, error, validateOn, validationGroup', 'see TextBox', '', 'Validation, as for every field.'],
  ['spellcheck, name, autocomplete', '`Bind<…>`', '—', 'Passed to the `<textarea>`.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['isValid, validationMessage, validating', 'read-only, reactive', 'The outcome of the checks.'],
  ['textAreaElement', 'read-only', 'The native `<textarea>`.'],
];

const METHODS = [
  ['validate()', '`Promise<boolean>`', 'Checks the value and shows the outcome.'],
  ['resetValidation()', '`void`', 'Hides the outcome of earlier checks.'],
  ['focus()', '`boolean`', 'Focuses the textarea.'],
  ['select()', '`void`', 'Selects the whole text.'],
  ['clear()', '`void`', 'Empties the field as its clear button does.'],
];

const EVENTS = [
  ['onValueChanged(e)', 'The value changed. `e`: `{ value, previousValue, byUser, source, event? }`.'],
  ['onValidated(e)', 'A check ended. `e`: `{ valid, message, source }`.'],
  ['onEnter(e)', 'Ctrl+Enter (Cmd+Enter) was pressed. `e`: `{ value, source, event }`.'],
  ['oninput, onchange, onkeydown, onfocusin, onfocusout', 'The DOM events of the textarea reach the field.'],
];

const KEYS = [
  ['Enter', 'A new line.'],
  ['Ctrl + Enter, Cmd + Enter', 'Commits the value (with `updateOn="change"`) and fires `onEnter`: send, save.'],
  ['Escape', 'With `clearButton`, empties a field that has a value; otherwise it goes on to the window around it.'],
  ['Alt + key (`&Name`)', 'Focus the field (Control + Option + key on Apple platforms).'],
  ['Tab', 'Leaves the field; the clear button is not a Tab stop (Escape does its job).'],
];

const A11Y = [
  ['Element', 'A native `<textarea>` (multi-line by nature); its `<label>` is tied to it with `for`.'],
  ['Description', '`aria-describedby` names the prefix, the suffix and the line under the box.'],
  ['Errors', '`aria-invalid="true"`; the message line is a polite live region.'],
  ['Required', '`aria-required="true"`; the mark after the label is hidden from screen readers.'],
  ['Ctrl + Enter', 'Say it in the label or the help text when it sends something, as in the example above.'],
];

const HOOKS = [
  ['.mx-field.mx-text-area', 'The field. `data-resize`, `data-auto-grow`, and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`).'],
  ['.mx-field__box', 'The box; it carries the resize grip.'],
  ['.mx-field__input.mx-text-area__input', 'The textarea.'],
  ['.mx-text-area__clear', 'The clear button.'],
  ['.mx-field__message, .mx-field__counter', 'The line under the box.'],
];

export default function TextAreaPage() {
  const s = reactive({
    comment: 'MotifJS keeps the DOM it builds.',
    story: '',
    resize: 'vertical' as TextAreaResize,
    labelMode: 'top' as FieldLabelMode,
    bio: '',
    message: '',
    sent: [] as { id: number; text: string }[],
    log: '',
    editable: true,
    lang: 'en',
  });
  let added = 0;
  let host: Component<HTMLDivElement> | null = null;
  let sentCount = 0;

  const addFromCode = () => {
    const area = new TextArea({ label: `Note ${++added}`, rows: 2, autoGrow: true, maxRows: 5, clearButton: true });
    area.onValueChanged((e) => (s.log = `${area.label}: ${e.value.split('\n').length} line(s)`));
    host?.controls.add(area);
    area.focus();
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    s.sent.push({ id: ++sentCount, text });
    s.message = '';
  };

  return (
    <>
      <p class="lead">
        A text field of several lines: a box that grows with the text or that the user drags bigger, a character counter, a
        clear button, Ctrl+Enter to send, and the label, help text and validation every field has.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Every prop takes a value or a function; `x-model` binds the text two-way. Created with `new`, the same properties are set from code." />
        </p>
        <Example
          code={`
<TextArea label="&Comment" x-model={() => this.form.comment} />

const note = new TextArea({ label: 'Note', rows: 2, autoGrow: true, maxRows: 5 });
note.onValueChanged((e) => console.log(e.value));
this.panel.controls.add(note);
`}
          stack
        >
          <TextArea label="&Comment" x-model={() => s.comment} helpText={() => `${s.comment.length} characters`} stretch />
          <div class="docs-flow">
            <Button text="Add a note from code" variant="outline" onclick={addFromCode} />
            <output class="ta-log">{() => s.log}</output>
          </div>
          <div class="docs-flow" ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="grow" title="Growing with the text">
        <p>
          <Rich text="With `autoGrow` the box follows the text: never smaller than `minRows` lines, never taller than `maxRows`; past that it scrolls. A narrower box wraps into more lines and grows too." />
        </p>
        <Example
          code={`
<TextArea label="Story" autoGrow minRows={2} maxRows={6} x-model={() => this.form.story} />
`}
        >
          <TextArea label="Story" autoGrow minRows={2} maxRows={6} placeholder="Type a few lines…" x-model={() => s.story} stretch />
        </Example>
      </Section>

      <Section anchor="resize" title="Resize">
        <p>
          <Rich text="The grip at the corner of the box lets the user drag it taller (`vertical`, the default), in both directions (`both`), or not at all (`none`)." />
        </p>
        <Example
          code={`
<TextArea label="Notes" resize="both" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Resize">
            {RESIZES.map((resize) => (
              <Button
                key={resize}
                text={resize}
                size="sm"
                variant={() => (s.resize === resize ? 'solid' : 'ghost')}
                aria-pressed={() => s.resize === resize}
                onclick={() => (s.resize = resize)}
              />
            ))}
          </div>
          <TextArea label="Notes" resize={() => s.resize} rows={4} />
        </Example>
      </Section>

      <Section anchor="counter" title="Counter and limits">
        <p>
          <Rich text="`maxLength` stops typing at the limit, `minLength` is checked when the field is left; `showCounter` shows the count under the box." />
        </p>
        <Example
          code={`
<TextArea label="Bio" maxLength={160} minLength={10} showCounter clearButton />
`}
        >
          <TextArea label="Bio" maxLength={160} minLength={10} showCounter clearButton x-model={() => s.bio} stretch />
        </Example>
      </Section>

      <Section anchor="enter" title="Ctrl+Enter">
        <p>
          <Rich text="Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) fires `onEnter` with the value: the usual way to send a message or save a note." />
        </p>
        <Example
          code={`
<TextArea
  label="Message"
  helpText="Ctrl+Enter sends."
  autoGrow
  maxRows={4}
  x-model={() => this.chat.draft}
  onEnter={(e) => this.chat.send(e.value)}
/>
`}
          stack
        >
          <ul class="ta-sent">
            {s.sent.map((m) => (
              <li key={m.id}>{m.text}</li>
            ))}
          </ul>
          <TextArea label="Message" helpText="Ctrl+Enter sends." autoGrow rows={1} maxRows={4} x-model={() => s.message} onEnter={(e) => send(e.value)} stretch />
        </Example>
      </Section>

      <Section anchor="label" title="Label">
        <Example
          code={`
<TextArea label="Address" labelMode="floating" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Label mode">
            {MODES.map((mode) => (
              <Button
                key={mode}
                text={mode}
                size="sm"
                variant={() => (s.labelMode === mode ? 'solid' : 'ghost')}
                aria-pressed={() => s.labelMode === mode}
                onclick={() => (s.labelMode = mode)}
              />
            ))}
          </div>
          <TextArea label="Address" labelMode={() => s.labelMode} rows={2} />
        </Example>
      </Section>

      <Section anchor="states" title="Read-only, disabled, required">
        <Example
          code={`
<TextArea label="Terms" readOnly value={terms} />
<TextArea label="Reason" required enabled={() => this.editing} />
`}
        >
          <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />
          <TextArea label="Terms" readOnly={() => !s.editable} value={'Line one of the terms.\nLine two of the terms.'} rows={2} />
          <TextArea label="Reason" required enabled={() => s.editable} rows={2} />
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
          <Rich text="The name of the clear button and the validation messages come from `uiLocale.strings`." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            The clear button reads <output>{() => uiLocale.strings.clear}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <p>
          <Rich text="TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own: the first line lines up with a one-line field of the same size." />
        </p>
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
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
