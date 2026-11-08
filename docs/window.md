# Window and dialog

> Navigation · @motifx-community/ui 0.1.0-beta.7

A window or dialog built on the native `<dialog>` element. A single form can be shown as modeless or modal, depending on how you open it. It has a title bar, can be moved, resized, minimized and maximized, and Enter and Escape activate its buttons. Forms can open other forms, and `messageBox` and `confirm` cover common prompts.

## Import

```tsx
import { MxForm, messageBox, confirm, type FormResult } from '@motifx-community/ui';
```

## Declarative and programmatic

In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it. The form is hidden rather than disposed, and it lives with its parent. Programmatically, a form, usually a class with a `view()` method, opens with `show(host)` or `showDialog(host)`. It is added to the host and disposed when it closes.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, and its buttons from the footer. */
export class RenameForm extends MxForm {
  private readonly data = reactive({ name: 'Report.docx' });

  constructor() {
    super({ title: 'Rename', width: '24rem' });
    const ok = new Button({ text: 'Rename', tone: 'accent' });
    ok.element.addEventListener('click', () => this.close('ok'));
    const cancel = new Button({ text: 'Cancel' });
    cancel.element.addEventListener('click', () => this.close('cancel'));
    const buttons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
    buttons.controls.add(ok, cancel);
    this.footer = buttons;
    this.acceptButton = ok;
    this.cancelButton = cancel;
  }

  get name(): string {
    return this.data.name;
  }

  override view() {
    return <TextBox label="&New name" x-model={() => this.data.name} stretch />;
  }
}
```

## Modal and modeless

`show()` keeps the page usable. Several modeless windows can stack, and clicking one brings it to the front. `showDialog()` blocks everything else until it closes, and a modal form opened from another modal form blocks that form too.

```tsx
import type { Component } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

/** Modeless windows that stack and minimize to a strip, and a modal form that opens another. */
export default function ModalAndModeless() {
  let host: Component<HTMLDivElement> | null = null;
  let dock: Stack | null = null;
  let windows = 0;

  const openWindow = () => {
    const n = ++windows;
    const form = new MxForm({
      title: `Window ${n}`,
      showMinimize: true,
      showMaximize: true,
      startPosition: 'manual',
      left: 80 + n * 28,
      top: 120 + n * 28,
      width: '18rem',
      minimizeTarget: dock,
      content: <p>{`A modeless window, number ${n}.`}</p>,
    });
    form.show(host!);
  };

  const openNested = () => {
    const outer = new MxForm({ title: 'Level 1', width: '22rem' });
    const openInner = () => {
      const inner = new MxForm({ title: 'Level 2', content: <p>The form below is blocked until this one closes.</p> });
      void inner.showDialog(outer);
    };
    outer.content = (
      <Stack orientation="horizontal" wrap align="center">
        <p>A modal form.</p>
        <Button text="Open level 2" onclick={openInner} />
      </Stack>
    );
    void outer.showDialog(host!);
  };

  return (
    <>
      <Button text="Open a window" variant="outline" onclick={openWindow} />
      <Button text="Open nested modal forms" variant="outline" onclick={openNested} />
      <Stack
        orientation="horizontal"
        wrap
        align="center"
        ref={(c: Stack) => (dock = c)}
        aria-label="Minimized windows"
        role="group"
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"
      />
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
```

## Title bar and frame

The title bar shows the icon, the title and the buttons you enable. The form moves by its title bar and stays inside the viewport. It resizes from its edges and corners, down to the `window.min-*` tokens. Each of these features has its own setting.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

const NoteIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

const SWITCHES = ['showMinimize', 'showMaximize', 'resizable', 'movable', 'useDock'] as const;

/** A form with an icon, minimize and maximize, that moves and resizes; every part has its switch. */
export default function Frame() {
  const s = reactive({ notes: false, showMinimize: true, showMaximize: true, resizable: true, movable: true, useDock: true });
  let dock: Stack | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Frame switches">
        {SWITCHES.map((key) => (
          <Button key={key} text={key === 'useDock' ? 'minimize to the strip' : key} size="sm" toggle x-model={() => s[key]} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open notes" variant="outline" onclick={() => (s.notes = true)} />
      </Stack>
      <Stack
        class="win-dock"
        orientation="horizontal"
        wrap
        align="center"
        ref={(c: Stack) => (dock = c)}
        aria-label="Minimized windows"
        role="group"
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"
      />
      <MxForm
        class="win-notes"
        title="Notes"
        icon={() => <NoteIcon />}
        width="22rem"
        showMinimize={() => s.showMinimize}
        showMaximize={() => s.showMaximize}
        resizable={() => s.resizable}
        movable={() => s.movable}
        x-model={() => s.notes}
        onLoaded={(e) => (e.source.minimizeTarget = () => (s.useDock ? dock : null))}
      >
        <p>Drag the title bar, pull an edge, double-click the title bar.</p>
      </MxForm>
    </>
  );
}
```

## Default and cancel buttons

Enter in a single-line field clicks `acceptButton`, and Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides. It is on for modal forms and off for modeless ones.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, and its buttons from the footer. */
export class RenameForm extends MxForm {
  private readonly data = reactive({ name: 'Report.docx' });

  constructor() {
    super({ title: 'Rename', width: '24rem' });
    const ok = new Button({ text: 'Rename', tone: 'accent' });
    ok.element.addEventListener('click', () => this.close('ok'));
    const cancel = new Button({ text: 'Cancel' });
    cancel.element.addEventListener('click', () => this.close('cancel'));
    const buttons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
    buttons.controls.add(ok, cancel);
    this.footer = buttons;
    this.acceptButton = ok;
    this.cancelButton = cancel;
  }

  get name(): string {
    return this.data.name;
  }

  override view() {
    return <TextBox label="&New name" x-model={() => this.data.name} stretch />;
  }
}
```

## Events

`onClosing` can keep the form open, in this case while it has unsaved changes. `reason` distinguishes a user action (close button, Escape) from a programmatic close and from the owner being disposed.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

/** The events of a form in order; onClosing keeps it open while it has changes. */
export default function Events() {
  const s = reactive({ open: false, dirty: false, log: [] as string[] });

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
        <output class="win-log">{() => s.log.join(' · ')}</output>
      </Stack>
      <MxForm
        class="win-events"
        title="Events"
        x-model={() => s.open}
        onLoaded={() => log('loaded')}
        onShown={() => log('shown')}
        onActivate={() => log('activate')}
        onDeactivate={() => log('deactivate')}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.dirty && e.reason === 'user') e.cancel = true;
        }}
        onClosed={(e) => log(`closed: ${e.result}`)}
      >
        <Button text={() => (s.dirty ? 'Has changes: close is kept' : 'No changes')} toggle x-model={() => s.dirty} />
      </MxForm>
    </>
  );
}
```

## Message boxes

`messageBox` shows a modal message with buttons and resolves with the result of the button pressed. `confirm` asks OK or Cancel and resolves to `true` or `false`. Caution and danger boxes are alert dialogs, and a danger box starts on its safe button.

```tsx
import { reactive } from '@motifx/core';
import { Button, confirm, messageBox } from '@motifx-community/ui';

/** A message, a question with three answers, a confirmation, and custom buttons. */
export default function MessageBoxes() {
  const answer = reactive({ text: '' });

  const info = async () => {
    const result = await messageBox({ title: 'Saved', text: 'The file was saved.', tone: 'success' });
    answer.text = `Answer: ${result}`;
  };

  const yesNoCancel = async () => {
    const result = await messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });
    answer.text = `Answer: ${result}`;
  };

  const confirmDelete = async () => {
    const ok = await confirm('Delete “Report.docx”? This cannot be undone.', { title: 'Delete file', tone: 'danger' });
    answer.text = `Answer: ${ok}`;
  };

  const ownButtons = async () => {
    const result = await messageBox({
      title: 'Update',
      text: 'A new version is ready.',
      buttons: [
        { text: 'Restart now', result: 'restart' },
        { text: 'Later', result: 'later' },
      ],
      tone: 'info',
    });
    answer.text = `Answer: ${result}`;
  };

  return (
    <>
      <Button text="Info" variant="outline" onclick={info} />
      <Button text="Yes / No / Cancel" variant="outline" onclick={yesNoCancel} />
      <Button text="Confirm delete" variant="outline" onclick={confirmDelete} />
      <Button text="Own buttons" variant="outline" onclick={ownButtons} />
      <output class="win-answer">{() => answer.text}</output>
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab / Shift + Tab` | Inside a modal form, Tab cycles within it. From a modeless form, it continues to the page. |
| `Escape` | Clicks `cancelButton`. Otherwise, it closes the form when `closeOnEscape` is on, which is the default for modal forms. |
| `Enter` | In a single-line field, clicks `acceptButton`. This does not apply in a text area or on a button. |
| `Alt + key (`&Name`)` | Access keys work inside the front window. While a modal form is open, they work only inside it. |
| `Moving, resizing` | Moved and resized with the pointer. There are no built-in keys, but an application can add them with `form.addShortcut(...)` and the `left`, `top`, `width` and `height` properties. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Element` | A native `<dialog>`, using `showModal()` for a modal form, which makes the page inert, and `show()` for a modeless one. |
| `Role and name` | `role="dialog"` (`alertdialog` with `alert`), `aria-modal="true"` when modal, and named by its title through `aria-labelledby`. |
| `Description` | A message box is described by its text (`aria-describedby`). |
| `Focus` | On open, focus goes to `[autofocus]`, the first field, the accept button or the first control. On close, it returns to where it was. It never falls to `<body>`. |
| `Title bar buttons` | Named from `uiLocale` (Minimize, Maximize, Restore, Close). |
| `Motion` | A short fade using the motion tokens, removed when the user prefers reduced motion. |

## Localization

The title bar buttons and the `ok`, `cancel`, `yes` and `no` buttons of a message box get their names from `uiLocale.strings`.

```tsx
import { reactive } from '@motifx/core';
import { Button, messageBox, uiLocale } from '@motifx-community/ui';

/** Switches the names of the title bar buttons and of the message box buttons. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };

  const ask = () =>
    messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Ask" variant="outline" onclick={ask} />
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-form` | The `<dialog>`. `data-state` (`normal`, `minimized`, `maximized`), `data-modal`, `data-active`, `data-placed`, `data-docked`, `data-resizable`, `data-movable`, `data-dragging`. |
| `.mx-form__bar, .mx-form__icon, .mx-form__title, .mx-form__tools` | The title bar and its parts. |
| `.mx-form__content, .mx-form__footer` | The content area and the button row. |
| `.mx-form__frame, .mx-form__resize[data-edge]` | The resize handles. |
| `.mx-form-chip` | The chip a minimized form leaves in its `minimizeTarget`. |
| `.mx-message-box, .mx-message-box__icon, .mx-message-box__text` | The content of a message box, with `data-tone`. |
| `--_mx-w, --_mx-h, --_mx-x, --_mx-y` | The size and position the form sets on itself. |

### Component tokens

| Token | Description |
| --- | --- |
| `window.scrim, window.surface` | Units: the backdrop of a modal form, and the surface (`active`, `dialog` for a modal form, `maximized`). |
| `window.bar, window.icon, window.title, window.tools` | Units: the title bar (`active`, `dialog`), its icon, the title (`dialog`) and its buttons. |
| `window.body, window.footer, window.grip` | Units: the content area, the button row and the resize grips (`corner`). |
| `window.bar-height, window.title-align, window.tools-order` | The title bar height (from the design system `bar.*` tokens), and the position of the title and its buttons. |
| `window.min-width, window.min-height, window.viewport-margin` | The minimum size and the margin kept around the form. |
| `window.resize-edge, window.enter-offset` | The resize handles, and the distance it animates in from. |
| `window.message, window.message-icon, window.message-width` | Message boxes: units for the content and its tone glyph (per tone), and their width. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it. |
| `modal` | `Bind<boolean>` | `false` | Opened through `value`, the form is modal. |
| `title` | `Bind<string>` | `''` | The title in the title bar, which also names the form. This is the same property as `text`. |
| `content` | `Bind<ComponentBase \| null>` | — | Content for the content area, in addition to JSX children and `view()`. |
| `footer` | `Bind<ComponentBase \| null>` | — | A non-scrolling row below the content, for buttons. |
| `icon` | `Bind<IconSource \| null>` | — | An icon at the start of the title bar. |
| `showClose` | `Bind<boolean>` | `true` | Shows the close button. |
| `showMinimize` | `Bind<boolean>` | `false` | Shows the minimize button, on modeless forms only. |
| `showMaximize` | `Bind<boolean>` | `false` | Shows the maximize button. Double-clicking the title bar does the same. |
| `resizable` | `Bind<boolean>` | `true` | Allows resizing from the edges and corners. |
| `movable` | `Bind<boolean>` | `true` | Allows moving by dragging the title bar, within the viewport. |
| `closeOnEscape` | `Bind<boolean>` | `true` for modal forms, `false` for modeless forms | Closes the form with `cancel` on Escape when there is no `cancelButton`. |
| `acceptButton` | `Bind<Control \| null>` | — | The button Enter clicks from a single-line field. |
| `cancelButton` | `Bind<Control \| null>` | — | The button Escape clicks. |
| `minimizeTarget` | `Bind<HTMLElement \| ComponentBase \| null>` | — | Where a minimized form leaves a chip that restores it. Without it, the form collapses to its title bar. |
| `windowState` | `Bind<FormWindowState>` | `'normal'` | `normal`, `minimized`, `maximized`. |
| `startPosition` | `Bind<FormStartPosition>` | `'center'` | `center`, or `manual` at `left` and `top`. |
| `left / top` | `Bind<number \| string>` | — | With `manual`, the position from the start edge (the right edge in RTL) and the top. A number is in pixels. |
| `width / height` | `Bind<number \| string>` | Content size | A CSS length. A number is in pixels. |
| `alert` | `Bind<boolean>` | `false` | `role="alertdialog"`, for urgent content. |
| `disposeOnClose` | `Bind<boolean>` | see text | By default, a form added to the host by `show` or `showDialog` is disposed, and a JSX form is hidden. |
| `enabled / disabled, visible` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. `left`, `top`, `width` and `height` track moving and resizing by the user. |
| `result` | read/write, reactive | How the form closed, or will close. `close()` without an argument uses this value. It is `cancel` on open. |
| `isOpen, isModal, isActive` | read-only, reactive | Indicate whether the form is open, whether it is modal, and whether it is the front window of the page. |
| `activeControl` | read-only, reactive | The child control that has focus, or last had it. |
| `contentElement` | read-only | The content area element. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `show(host, disposeRef?)` | `void` | Shows the form as modeless in `host` (a component or the application). It is disposed with `disposeRef`, or with the host. |
| `showDialog(host, disposeRef?)` | `Promise<FormResult>` | Shows the form as modal and resolves with the result when it closes. |
| `close(result?)` | `boolean` | Closes it. Returns `false` if `onClosing` canceled the close. |
| `activate()` | `void` | Brings it to the front with focus on its last active control. |
| `minimize(), maximize(), restore()` | `void` | These set `windowState`. |
| `center()` | `void` | Centers it in the viewport. |
| `restoreFocus()` | `boolean` | Returns focus to its last active control. |

### Events

| Event | When |
| --- | --- |
| `onLoaded(e)` | Runs before the first show, and is where to populate the form. |
| `onShown(e)` | Occurs after it is shown. |
| `onActivate(e) / onDeactivate(e)` | Occur when it becomes the front window and when another window takes over. |
| `onClosing(e)` | Occurs before it closes. `e`: `{ result, reason, source, cancel }`. Set `cancel = true` to keep it open, unless its owner is being disposed. |
| `onClosed(e)` | Occurs after it closes. `e`: `{ result, reason, source }`, where `reason` is `user` (close button, Escape), `code` or `owner`. |

### Helper functions

| Function | Returns | Description |
| --- | --- | --- |
| `messageBox(options)` | `Promise<FormResult>` | Shows a modal message: `title`, `text`, `buttons` (`ok`, `cancel`, `yes`, `no` or `{ text, result, tone }`), `tone` (`info`, `success`, `caution`, `danger`), `defaultButton` and `host`. |
| `confirm(text, options?)` | `Promise<boolean>` | Shows OK and Cancel, and resolves to `true` for OK. |

## Feedback

Loading issues…

## Example files

`JsxAndCode.tsx`

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, MxForm, Stack, TextBox, type FormResult } from '@motifx-community/ui';
import { RenameForm } from './RenameForm';

/** A modeless form in JSX shown through x-model, and a form class shown modal programmatically. */
export default function JsxAndCode() {
  const s = reactive({ find: false, query: '', found: '', renamed: '' });
  let host: Component<HTMLDivElement> | null = null;
  let findForm: MxForm | null = null;

  const findOk = new Button({ text: 'Find', tone: 'accent' });
  findOk.element.addEventListener('click', () => findForm?.close('ok'));
  const findClose = new Button({ text: 'Close' });
  findClose.element.addEventListener('click', () => (s.find = false));
  const findButtons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
  findButtons.controls.add(findOk, findClose);

  const rename = async () => {
    const form = new RenameForm();
    const result: FormResult = await form.showDialog(host!);
    s.renamed = result === 'ok' ? `Renamed to “${form.name}”.` : 'Kept the old name.';
  };

  return (
    <>
      <Button text="Find…" variant="outline" onclick={() => (s.find = true)} />
      <MxForm
        class="win-find"
        title="Find"
        x-model={() => s.find}
        footer={findButtons}
        acceptButton={findOk}
        cancelButton={findClose}
        ref={(f: MxForm) => (findForm = f)}
        onClosed={(e) => e.result === 'ok' && (s.found = `Searched for “${s.query}”.`)}
      >
        <TextBox label="&Find what" x-model={() => s.query} />
      </MxForm>
      <output class="win-found">{() => s.found}</output>
      <Button text="Rename… (class, modal)" variant="outline" onclick={rename} />
      <output class="win-renamed">{() => s.renamed}</output>
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
```

`RenameForm.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, and its buttons from the footer. */
export class RenameForm extends MxForm {
  private readonly data = reactive({ name: 'Report.docx' });

  constructor() {
    super({ title: 'Rename', width: '24rem' });
    const ok = new Button({ text: 'Rename', tone: 'accent' });
    ok.element.addEventListener('click', () => this.close('ok'));
    const cancel = new Button({ text: 'Cancel' });
    cancel.element.addEventListener('click', () => this.close('cancel'));
    const buttons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });
    buttons.controls.add(ok, cancel);
    this.footer = buttons;
    this.acceptButton = ok;
    this.cancelButton = cancel;
  }

  get name(): string {
    return this.data.name;
  }

  override view() {
    return <TextBox label="&New name" x-model={() => this.data.name} stretch />;
  }
}
```

`DefaultButtons.tsx`

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button } from '@motifx-community/ui';
import { RenameForm } from './RenameForm';

/** Enter clicks the form's accept button, Escape its cancel button; see RenameForm.tsx. */
export default function DefaultButtons() {
  const s = reactive({ renamed: '' });
  let host: Component<HTMLDivElement> | null = null;

  const rename = async () => {
    const form = new RenameForm();
    const result = await form.showDialog(host!);
    s.renamed = result === 'ok' ? `Renamed to “${form.name}”.` : 'Kept the old name.';
  };

  return (
    <>
      <Button text="Rename…" variant="outline" onclick={rename} />
      <output>{() => s.renamed}</output>
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
    </>
  );
}
```
