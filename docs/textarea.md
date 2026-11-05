# TextArea

> Editors · @motifx-community/ui 0.1.0-beta.2

A text field of several lines: a box that grows with the text or that the user drags bigger, a character counter, a clear button, Ctrl+Enter to send, and the label, help text and validation every field has.

## Import

```tsx
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
```

## From JSX and from code

Every prop takes a value or a function; `x-model` binds the text two-way. Created with `new`, the same properties are set from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextArea } from '@motifx-community/ui';

/** A textarea bound with x-model, and notes created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ comment: 'MotifJS keeps the DOM it builds.', log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const note = new TextArea({ label: `Note ${++added}`, rows: 2, autoGrow: true, maxRows: 5, clearButton: true });
    note.onValueChanged((e) => (s.log = `${note.label}: ${e.value.split('\n').length} line(s)`));
    host?.controls.add(note);
    note.focus();
  };

  return (
    <>
      <TextArea label="&Comment" x-model={() => s.comment} helpText={() => `${s.comment.length} characters`} stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a note from code" variant="outline" onclick={addFromCode} />
        <output class="ta-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Growing with the text

With `autoGrow` the box follows the text: never smaller than `minRows` lines, never taller than `maxRows`; past that it scrolls. A narrower box wraps into more lines and grows too.

```tsx
import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A box that grows with the text from two lines to six, then scrolls. */
export default function AutoGrow() {
  const s = reactive({ story: '' });
  return <TextArea label="Story" autoGrow minRows={2} maxRows={6} placeholder="Type a few lines…" x-model={() => s.story} stretch />;
}
```

## Resize

The grip at the corner of the box lets the user drag it taller (`vertical`, the default), in both directions (`both`), or not at all (`none`).

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextArea, type TextAreaResize } from '@motifx-community/ui';

const RESIZES: TextAreaResize[] = ['none', 'vertical', 'both'];

/** Which way the user can drag the box bigger. */
export default function Resize() {
  const s = reactive({ resize: 'vertical' as TextAreaResize });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Resize">
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
      </Stack>
      <TextArea label="Notes" resize={() => s.resize} rows={4} />
    </>
  );
}
```

## Counter and limits

`maxLength` stops typing at the limit, `minLength` is checked when the field is left; `showCounter` shows the count under the box.

```tsx
import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A limit while typing, a minimum checked on leaving, a counter and a clear button. */
export default function CounterAndLimits() {
  const s = reactive({ bio: '' });
  return <TextArea label="Bio" maxLength={160} minLength={10} showCounter clearButton x-model={() => s.bio} stretch />;
}
```

## Ctrl+Enter

Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) fires `onEnter` with the value: the usual way to send a message or save a note.

```tsx
import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A message box: Enter starts a new line, Ctrl+Enter sends. */
export default function CtrlEnter() {
  const s = reactive({ message: '', sent: [] as { id: number; text: string }[] });
  let sentCount = 0;

  const send = (text: string) => {
    if (!text.trim()) return;
    s.sent.push({ id: ++sentCount, text });
    s.message = '';
  };

  return (
    <>
      <ul class="ta-sent">
        {s.sent.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
      <TextArea label="Message" helpText="Ctrl+Enter sends." autoGrow rows={1} maxRows={4} x-model={() => s.message} onEnter={(e) => send(e.value)} stretch />
    </>
  );
}
```

## Label

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextArea, type FieldLabelMode } from '@motifx-community/ui';

const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];

/** The label above the box, next to it, floating inside it, or only for screen readers. */
export default function LabelModes() {
  const s = reactive({ labelMode: 'top' as FieldLabelMode });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Label mode">
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
      </Stack>
      <TextArea label="Address" labelMode={() => s.labelMode} rows={2} />
    </>
  );
}
```

## Read-only, disabled, required

```tsx
import { reactive } from '@motifx/core';
import { Button, TextArea } from '@motifx-community/ui';

const TERMS = 'Line one of the terms.\nLine two of the terms.';

/** Read-only and disabled, both following state, and a required field. */
export default function States() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />
      <TextArea label="Terms" readOnly={() => !s.editing} value={TERMS} rows={2} />
      <TextArea label="Reason" required enabled={() => s.editing} rows={2} />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Enter` | A new line. |
| `Ctrl + Enter, Cmd + Enter` | Commits the value (with `updateOn="change"`) and fires `onEnter`: send, save. |
| `Escape` | With `clearButton`, empties a field that has a value; otherwise it goes on to the window around it. |
| `Alt + key (`&Name`)` | Focus the field (Control + Option + key on Apple platforms). |
| `Tab` | Leaves the field; the clear button is not a Tab stop (Escape does its job). |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<textarea>` (multi-line by nature); its `<label>` is tied to it with `for`. |
| `Description` | `aria-describedby` names the prefix, the suffix and the line under the box. |
| `Errors` | `aria-invalid="true"`; the message line is a polite live region. |
| `Required` | `aria-required="true"`; the mark after the label is hidden from screen readers. |
| `Ctrl + Enter` | Say it in the label or the help text when it sends something, as in the example above. |

## Localization

The name of the clear button and the validation messages come from `uiLocale.strings`.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of every field on the page, the clear button's name included. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        The clear button reads <output>{() => kitTexts.strings.clear}</output>
      </span>
    </>
  );
}
```

## Styling

TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own: the first line lines up with a one-line field of the same size.

| Hook | What it is |
| --- | --- |
| `.mx-field.mx-text-area` | The field. `data-resize`, `data-auto-grow`, and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`). |
| `.mx-field__box` | The box; it carries the resize grip. |
| `.mx-field__input.mx-text-area__input` | The textarea. |
| `.mx-text-area__clear` | The clear button. |
| `.mx-field__message, .mx-field__counter` | The line under the box. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The text, lines separated by `\n`. `x-model` binds it two-way. |
| `label` | `Bind<string>` | `''` | The caption; `&Name` makes Alt+N focus the field. The same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side`, `floating`, `hidden`. |
| `placeholder` | `Bind<string>` | `''` | Shown while the field is empty. |
| `rows` | `Bind<number>` | `3` | Visible lines. |
| `autoGrow` | `Bind<boolean>` | `false` | The box follows the text, from `minRows` to `maxRows` lines, then scrolls. |
| `minRows` | `Bind<number>` | `rows` | The smallest box with `autoGrow`. |
| `maxRows` | `Bind<number \| null>` | `null` | The largest box with `autoGrow`; without it the box grows without a limit. |
| `resize` | `Bind<TextAreaResize>` | `'vertical'` | `none`, `vertical`, `both`: which way the user can drag the box. `none` while `autoGrow` is on. |
| `maxLength / minLength` | `Bind<number>` | — | Limits; both are checked by validation. |
| `showCounter` | `Bind<boolean>` | `false` | `12/500` under the box (`12` without `maxLength`). |
| `clearButton` | `Bind<boolean>` | `false` | A button that empties the field; Escape does the same. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | `change`: the value changes when the field is left or Ctrl+Enter is pressed. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects the whole text when the field gets focus. |
| `wrap` | `Bind<'soft' \| 'hard' \| 'off'>` | `'soft'` | `off` keeps long lines on one line and scrolls sideways. |
| `helpText, hint, prefix, suffix, icon, buttons` | see TextBox |  | The parts every field has. |
| `readOnly, required, size, variant, stretch` | see TextBox |  | The states and the look every field has. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation, as for every field. |
| `spellcheck, name, autocomplete` | `Bind<…>` | — | Passed to the `<textarea>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The outcome of the checks. |
| `textAreaElement` | read-only | The native `<textarea>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `validate()` | `Promise<boolean>` | Checks the value and shows the outcome. |
| `resetValidation()` | `void` | Hides the outcome of earlier checks. |
| `focus()` | `boolean` | Focuses the textarea. |
| `select()` | `void` | Selects the whole text. |
| `clear()` | `void` | Empties the field as its clear button does. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | The value changed. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | A check ended. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Ctrl+Enter (Cmd+Enter) was pressed. `e`: `{ value, source, event }`. |
| `oninput, onchange, onkeydown, onfocusin, onfocusout` | The DOM events of the textarea reach the field. |
