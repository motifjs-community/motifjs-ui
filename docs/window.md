# Window and dialog

> Navigation · @motifx-community/ui 0.1.0-beta.1

A window or a dialog on a native `<dialog>`: one form, shown modeless or modal by whoever shows it. It has a title bar, moves, resizes, minimizes and maximizes; Enter and Escape press its buttons; forms open forms. `messageBox` and `confirm` cover the common questions.

## Import

```tsx
import { MxForm, messageBox, confirm, type FormResult } from '@motifx-community/ui';
```

## From JSX and from code

In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it; it is hidden, not disposed, and lives with its parent. From code, a form (often a class with a `view()`) is shown with `show(host)` or `showDialog(host)`; it is added to the host and disposed when it closes.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, its buttons from the footer. */
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

`show()` keeps the page usable: several modeless windows stack, a click brings one to the front. `showDialog()` blocks everything else until it closes; a modal form opened from a modal one blocks that one too.

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

The title bar shows the icon, the title and the buttons you switch on. The form moves by its title bar and stays inside the viewport; it resizes from its edges and corners down to the `window.min-*` tokens. Every part has its own switch.

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

Enter in a one-line field clicks `acceptButton`; Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides: on for modal forms, off for modeless ones.

```tsx
import { reactive } from '@motifx/core';
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';

/** A form written as a class: its content comes from `view()`, its buttons from the footer. */
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

`onClosing` can keep the form open, here while it has changes; `reason` tells the user (close button, Escape) from code and from the owner going away.

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

`messageBox` shows a modal message with buttons and resolves with the result of the one pressed; `confirm` asks OK or Cancel and resolves `true` or `false`. Caution and danger boxes are alert dialogs; a danger box starts on its safe button.

```tsx
import { reactive } from '@motifx/core';
import { Button, confirm, messageBox } from '@motifx-community/ui';

/** A message, a question with three answers, a confirmation, and buttons of your own. */
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

| Key | What it does |
| --- | --- |
| `Tab / Shift + Tab` | Inside a modal form Tab goes round; from a modeless one it goes on to the page. |
| `Escape` | Clicks `cancelButton`; else closes it when `closeOnEscape` (on for modal forms). |
| `Enter` | In a one-line field: clicks `acceptButton` (not in a text area, not on a button). |
| `Alt + key (`&Name`)` | Access keys work inside the front window; while a modal form is open, only inside it. |
| `Moving, resizing` | With the pointer. There are no keys of its own; an app can add them with `form.addShortcut(...)` and the `left` / `top` / `width` / `height` properties. |

## Accessibility

| Topic | How |
| --- | --- |
| `Element` | A native `<dialog>`: `showModal()` for a modal form (the browser makes the page inert), `show()` for a modeless one. |
| `Role and name` | `role="dialog"` (`alertdialog` with `alert`), `aria-modal="true"` when modal, named by its title through `aria-labelledby`. |
| `Description` | A message box is described by its text (`aria-describedby`). |
| `Focus` | On open: `[autofocus]`, the first field, the accept button, the first control. On close: back where it was. Never on `<body>`. |
| `Title bar buttons` | Named from `uiLocale` (Minimize, Maximize, Restore, Close). |
| `Motion` | A short fade with the motion tokens; none under reduced motion. |

## Localization

The title bar buttons and the `ok`, `cancel`, `yes`, `no` buttons of a message box are named from `uiLocale.strings`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, messageBox, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the names of the title bar buttons and of the message box buttons. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
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

| Hook | What it is |
| --- | --- |
| `.mx-form` | The `<dialog>`. `data-state` (`normal`, `minimized`, `maximized`), `data-modal`, `data-active`, `data-placed`, `data-docked`, `data-resizable`, `data-movable`, `data-dragging`. |
| `.mx-form__bar, .mx-form__icon, .mx-form__title, .mx-form__tools` | The title bar and its parts. |
| `.mx-form__content, .mx-form__footer` | The content area and the buttons row. |
| `.mx-form__frame, .mx-form__resize[data-edge]` | The resize handles. |
| `.mx-form-chip` | The chip a minimized form leaves in its `minimizeTarget`. |
| `.mx-message-box, .mx-message-box__icon, .mx-message-box__text` | A message box’s content; `data-tone`. |
| `--_mx-w, --_mx-h, --_mx-x, --_mx-y` | The size and place the form writes on itself. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `window.scrim, window.surface` | Units: behind a modal form; the surface (`active`, `dialog`: a modal one, `maximized`). |
| `window.bar, window.icon, window.title, window.tools` | Units: the title bar (`active`, `dialog`), its icon, the title (`dialog`) and its buttons. |
| `window.body, window.footer, window.grip` | Units: the content area, the buttons row, the resize grips (`corner`). |
| `window.bar-height, window.title-align, window.tools-order` | The title bar’s height (from the design system’s `bar.*`), where the title sits, where its buttons sit. |
| `window.min-width, window.min-height, window.viewport-margin` | The smallest size and the room kept around it. |
| `window.resize-edge, window.enter-offset` | The resize handles; how far it slides in. |
| `window.message, window.message-icon, window.message-width` | Message boxes: units for the content and its tone glyph (per tone), and their width. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Whether it is open. `x-model` binds it two-way: the user closing it writes `false`. |
| `modal` | `Bind<boolean>` | `false` | Opened through `value`, it is modal. |
| `title` | `Bind<string>` | `''` | The title in the title bar; it names the form. The same property as `text`. |
| `content` | `Bind<ComponentBase \| null>` | — | What fills the content area, next to JSX children and `view()`. |
| `footer` | `Bind<ComponentBase \| null>` | — | A row under the content that does not scroll, for the buttons. |
| `icon` | `Bind<IconSource \| null>` | — | An icon at the start of the title bar. |
| `showClose` | `Bind<boolean>` | `true` | The close button. |
| `showMinimize` | `Bind<boolean>` | `false` | The minimize button; modeless forms only. |
| `showMaximize` | `Bind<boolean>` | `false` | The maximize button; a double click on the title bar does the same. |
| `resizable` | `Bind<boolean>` | `true` | Resized from its edges and corners. |
| `movable` | `Bind<boolean>` | `true` | Moved by dragging the title bar; it stays inside the viewport. |
| `closeOnEscape` | `Bind<boolean>` | modal: `true`, modeless: `false` | Escape closes it with `cancel` when there is no `cancelButton`. |
| `acceptButton` | `Bind<Control \| null>` | — | The button Enter clicks from a one-line field. |
| `cancelButton` | `Bind<Control \| null>` | — | The button Escape clicks. |
| `minimizeTarget` | `Bind<HTMLElement \| ComponentBase \| null>` | — | Where a minimized form leaves a chip that brings it back. Without it the form folds to its title bar. |
| `windowState` | `Bind<FormWindowState>` | `'normal'` | `normal`, `minimized`, `maximized`. |
| `startPosition` | `Bind<FormStartPosition>` | `'center'` | `center`, or `manual` at `left` and `top`. |
| `left / top` | `Bind<number \| string>` | — | With `manual`: the place, from the start edge (the right one in RTL) and the top. A number is pixels. |
| `width / height` | `Bind<number \| string>` | content size | A CSS length; a number is pixels. |
| `alert` | `Bind<boolean>` | `false` | `role="alertdialog"`: something urgent. |
| `disposeOnClose` | `Bind<boolean>` | see text | Default: disposed when `show` / `showDialog` added it to the host; a JSX form is hidden. |
| `enabled / disabled, visible` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. `left`, `top`, `width` and `height` follow the user moving and resizing it. |
| `result` | read/write, reactive | How it closed, or will: `close()` without an argument uses it. `cancel` when it opens. |
| `isOpen, isModal, isActive` | read-only, reactive | Open; shown modal; the front window of the page. |
| `activeControl` | read-only, reactive | The control inside that has focus or had it last. |
| `contentElement` | read-only | The content area element. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `show(host, disposeRef?)` | `void` | Shows it modeless in `host` (a component or the application); it dies with `disposeRef`, else the host. |
| `showDialog(host, disposeRef?)` | `Promise<FormResult>` | Shows it modal; resolves with the result when it closes. |
| `close(result?)` | `boolean` | Closes it; `false` when `onClosing` kept it open. |
| `activate()` | `void` | Brings it to the front with focus on its last active control. |
| `minimize(), maximize(), restore()` | `void` | Set `windowState`. |
| `center()` | `void` | Puts it back in the middle of the viewport. |
| `restoreFocus()` | `boolean` | Focus back to its last active control. |

### Events

| Event | When |
| --- | --- |
| `onLoaded(e)` | Before it is shown the first time: the place to fill it. |
| `onShown(e)` | It was shown. |
| `onActivate(e) / onDeactivate(e)` | It became the front window / another one did. |
| `onClosing(e)` | It is about to close. `e`: `{ result, reason, source, cancel }`; `cancel = true` keeps it open (not when its owner is going away). |
| `onClosed(e)` | It closed. `e`: `{ result, reason, source }`; `reason` is `user` (close button, Escape), `code` or `owner`. |

### Helpers

| Function | Returns | Description |
| --- | --- | --- |
| `messageBox(options)` | `Promise<FormResult>` | A modal message: `title`, `text`, `buttons` (`ok`, `cancel`, `yes`, `no` or `{ text, result, tone }`), `tone` (`info`, `success`, `caution`, `danger`), `defaultButton`, `host`. |
| `confirm(text, options?)` | `Promise<boolean>` | OK and Cancel; `true` for OK. |

## Example files

`JsxAndCode.tsx`

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, MxForm, Stack, TextBox, type FormResult } from '@motifx-community/ui';
import { RenameForm } from './RenameForm';

/** A modeless form in JSX shown through x-model, and a form class shown modal from code. */
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

/** A form written as a class: its content comes from `view()`, its buttons from the footer. */
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
