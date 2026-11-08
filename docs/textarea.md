# TextArea

> Editors · @motifx-community/ui 0.1.0-beta.8

A multi-line text input. The box can grow with its content or be resized by the user, and it supports a character counter, a clear button and Ctrl+Enter to submit, along with the label, help text and validation common to all fields.

## Import

```tsx
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
```

## Declarative and programmatic

Every prop accepts a value or a function, and `x-model` provides two-way binding for the text. When you create the component with `new`, set the same properties programmatically.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TextArea } from '@motifx-community/ui';

/** A textarea bound with x-model, and notes created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ comment: 'MotifJS keeps the DOM it builds.', log: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const note = new TextArea({ label: `Note ${++added}`, rows: 2, autoGrow: true, maxRows: 5, clearButton: true });
    note.onValueChanged((e) => (s.log = `${note.label}: ${e.value.split('\n').length} line(s)`));
    host?.controls.add(note);
    note.focus();
  };

  return (
    <>
      <TextArea label="&Comment" x-model={() => s.comment} helpText={() => `${s.comment.length} characters`} stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a note programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="ta-log">{() => s.log}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Auto-grow

With `autoGrow`, the box adjusts to its content. It stays between `minRows` and `maxRows` lines and scrolls beyond that. When the box gets narrower, text wraps onto more lines and the box grows accordingly.

```tsx
import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A box that grows with the text from two lines to six, then scrolls. */
export default function AutoGrow() {
  const s = reactive({ story: '' });
  return <TextArea label="Story" autoGrow minRows={2} maxRows={6} placeholder="Type a few lines…" x-model={() => s.story} stretch />;
}
```

## Resizing

The grip in the corner of the box lets the user resize it vertically (`vertical`, the default) or in both directions (`both`). Set `none` to disable resizing.

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

## Character counter and limits

`maxLength` stops input at the limit, and `minLength` is checked when the field loses focus. `showCounter` displays the count below the box.

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

Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) raises `onEnter` with the value, which is the usual way to send a message or save a note.

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

## Read-only, disabled and required

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

| Key | Description |
| --- | --- |
| `Enter` | Inserts a new line. |
| `Ctrl + Enter, Cmd + Enter` | Commits the value (with `updateOn="change"`) and raises `onEnter`. |
| `Escape` | With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window. |
| `Alt + key (`&Name`)` | Moves focus to the field (Control + Option + key on Apple platforms). |
| `Tab` | Moves focus out of the field. The clear button is not a Tab stop, because Escape does the same thing. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Element` | A native `<textarea>` associated with its `<label>` through `for`. |
| `Description` | `aria-describedby` references the prefix, the suffix and the help text. |
| `Errors` | `aria-invalid="true"`. The message is a polite live region. |
| `Required check boxes` | `aria-required="true"`. The indicator after the label is hidden from screen readers. |
| `Ctrl + Enter` | If Ctrl+Enter sends something, mention it in the label or help text, as the example above does. |

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

TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own, so its first line aligns with a single-line field of the same size.

| Hook | Description |
| --- | --- |
| `.mx-field.mx-text-area` | The field. `data-resize`, `data-auto-grow` and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`). |
| `.mx-field__box` | The box, which carries the resize grip. |
| `.mx-field__input.mx-text-area__input` | The textarea. |
| `.mx-text-area__clear` | The clear button. |
| `.mx-field__message, .mx-field__counter` | Help text below the box. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<string>` | `''` | The text, with lines separated by `\n`. `x-model` provides two-way binding. |
| `label` | `Bind<string>` | `''` | The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`. |
| `labelMode` | `Bind<FieldLabelMode>` | `'top'` | `top`, `side`, `floating`, `hidden`. |
| `placeholder` | `Bind<string>` | `''` | Displayed when the field is empty. |
| `rows` | `Bind<number>` | `3` | The number of visible lines. |
| `autoGrow` | `Bind<boolean>` | `false` | The box adjusts to its content, from `minRows` to `maxRows` lines, and then scrolls. |
| `minRows` | `Bind<number>` | `rows` | The minimum height with `autoGrow`. |
| `maxRows` | `Bind<number \| null>` | `null` | The maximum height with `autoGrow`. Without it, the box grows without limit. |
| `resize` | `Bind<TextAreaResize>` | `'vertical'` | `none`, `vertical` or `both`: the directions the user can resize the box. This is `none` while `autoGrow` is on. |
| `maxLength / minLength` | `Bind<number>` | — | Length limits. Both are enforced by validation. |
| `showCounter` | `Bind<boolean>` | `false` | Shows `12/500` below the box (`12` without `maxLength`). |
| `clearButton` | `Bind<boolean>` | `false` | Shows a button that clears the field. Pressing Escape also clears it. |
| `updateOn` | `Bind<'input' \| 'change'>` | `'input'` | With `change`, the value updates when the field loses focus or the user presses Ctrl+Enter. |
| `selectOnFocus` | `Bind<boolean>` | `false` | Selects all text when the field receives focus. |
| `wrap` | `Bind<'soft' \| 'hard' \| 'off'>` | `'soft'` | `off` keeps long lines on one line and scrolls horizontally. |
| `helpText, hint, prefix, suffix, icon, buttons` | see TextBox |  | Parts common to all fields. |
| `readOnly, required, size, variant, stretch` | see TextBox |  | States and appearance common to all fields. |
| `rules, error, validateOn, validationGroup` | see TextBox |  | Validation works the same way as for all fields. |
| `spellcheck, name, autocomplete` | `Bind<…>` | — | Passed to the `<textarea>`. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `isValid, validationMessage, validating` | read-only, reactive | The validation result. |
| `textAreaElement` | read-only | The native `<textarea>`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `validate()` | `Promise<boolean>` | Validates the value and displays the result. |
| `resetValidation()` | `void` | Clears the results of previous validation. |
| `focus()` | `boolean` | Sets focus on the textarea. |
| `select()` | `void` | Selects all text. |
| `clear()` | `void` | Clears the field, as the clear button does. |

### Events

| Event | When |
| --- | --- |
| `onValueChanged(e)` | Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. |
| `onValidated(e)` | Occurs when validation finishes. `e`: `{ valid, message, source }`. |
| `onEnter(e)` | Occurs when the user presses Ctrl+Enter (Cmd+Enter). `e`: `{ value, source, event }`. |
| `oninput, onchange, onkeydown, onfocusin, onfocusout` | DOM events from the textarea bubble up to the field. |

## Feedback

Loading issues…
