import { Component, reactive, type ComponentBase } from '@motifx/core';
import { Button, confirm, enStrings, messageBox, MxForm, TextBox, trStrings, uiLocale, type FormResult } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const NoteIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A div holding the given controls: a buttons row, a small content. */
function row(...controls: ComponentBase[]): Component<HTMLDivElement> {
  const holder = new Component<HTMLDivElement>('div');
  holder.element.className = 'docs-flow';
  holder.controls.add(...controls);
  return holder;
}

/** A button made from code, with what its click does. */
function action(text: string, click: () => void, tone: 'accent' | 'standard' = 'standard'): Button {
  const button = new Button({ text, tone });
  button.element.addEventListener('click', click);
  return button;
}

/** A form written as a class: its content comes from `view()`, its buttons from the footer. */
class RenameForm extends MxForm {
  private readonly data = reactive({ name: 'Report.docx' });

  constructor() {
    super({ title: 'Rename', width: '24rem' });
    const ok = action('Rename', () => this.close('ok'), 'accent');
    const cancel = action('Cancel', () => this.close('cancel'));
    this.footer = row(ok, cancel);
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

const PROPS = [
  ['value', '`Bind<boolean>`', '`false`', 'Whether it is open. `x-model` binds it two-way: the user closing it writes `false`.'],
  ['modal', '`Bind<boolean>`', '`false`', 'Opened through `value`, it is modal.'],
  ['title', '`Bind<string>`', "`''`", 'The title in the title bar; it names the form. The same property as `text`.'],
  ['content', '`Bind<ComponentBase | null>`', '—', 'What fills the content area, next to JSX children and `view()`.'],
  ['footer', '`Bind<ComponentBase | null>`', '—', 'A row under the content that does not scroll, for the buttons.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon at the start of the title bar.'],
  ['showClose', '`Bind<boolean>`', '`true`', 'The close button.'],
  ['showMinimize', '`Bind<boolean>`', '`false`', 'The minimize button; modeless forms only.'],
  ['showMaximize', '`Bind<boolean>`', '`false`', 'The maximize button; a double click on the title bar does the same.'],
  ['resizable', '`Bind<boolean>`', '`true`', 'Resized from its edges and corners.'],
  ['movable', '`Bind<boolean>`', '`true`', 'Moved by dragging the title bar; it stays inside the viewport.'],
  ['closeOnEscape', '`Bind<boolean>`', 'modal: `true`, modeless: `false`', 'Escape closes it with `cancel` when there is no `cancelButton`.'],
  ['acceptButton', '`Bind<Control | null>`', '—', 'The button Enter clicks from a one-line field.'],
  ['cancelButton', '`Bind<Control | null>`', '—', 'The button Escape clicks.'],
  ['minimizeTarget', '`Bind<HTMLElement | ComponentBase | null>`', '—', 'Where a minimized form leaves a chip that brings it back. Without it the form folds to its title bar.'],
  ['windowState', '`Bind<FormWindowState>`', "`'normal'`", '`normal`, `minimized`, `maximized`.'],
  ['startPosition', '`Bind<FormStartPosition>`', "`'center'`", '`center`, or `manual` at `left` and `top`.'],
  ['left / top', '`Bind<number | string>`', '—', 'With `manual`: the place, from the start edge (the right one in RTL) and the top. A number is pixels.'],
  ['width / height', '`Bind<number | string>`', 'content size', 'A CSS length; a number is pixels.'],
  ['alert', '`Bind<boolean>`', '`false`', '`role="alertdialog"`: something urgent.'],
  ['disposeOnClose', '`Bind<boolean>`', 'see text', 'Default: disposed when `show` / `showDialog` added it to the host; a JSX form is hidden.'],
  ['enabled / disabled, visible', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop. `left`, `top`, `width` and `height` follow the user moving and resizing it.'],
  ['result', 'read/write, reactive', 'How it closed, or will: `close()` without an argument uses it. `cancel` when it opens.'],
  ['isOpen, isModal, isActive', 'read-only, reactive', 'Open; shown modal; the front window of the page.'],
  ['activeControl', 'read-only, reactive', 'The control inside that has focus or had it last.'],
  ['contentElement', 'read-only', 'The content area element.'],
];

const METHODS = [
  ['show(host, disposeRef?)', '`void`', 'Shows it modeless in `host` (a component or the application); it dies with `disposeRef`, else the host.'],
  ['showDialog(host, disposeRef?)', '`Promise<FormResult>`', 'Shows it modal; resolves with the result when it closes.'],
  ['close(result?)', '`boolean`', 'Closes it; `false` when `onClosing` kept it open.'],
  ['activate()', '`void`', 'Brings it to the front with focus on its last active control.'],
  ['minimize(), maximize(), restore()', '`void`', 'Set `windowState`.'],
  ['center()', '`void`', 'Puts it back in the middle of the viewport.'],
  ['restoreFocus()', '`boolean`', 'Focus back to its last active control.'],
];

const EVENTS = [
  ['onLoaded(e)', 'Before it is shown the first time: the place to fill it.'],
  ['onShown(e)', 'It was shown.'],
  ['onActivate(e) / onDeactivate(e)', 'It became the front window / another one did.'],
  ['onClosing(e)', 'It is about to close. `e`: `{ result, reason, source, cancel }`; `cancel = true` keeps it open (not when its owner is going away).'],
  ['onClosed(e)', 'It closed. `e`: `{ result, reason, source }`; `reason` is `user` (close button, Escape), `code` or `owner`.'],
];

const HELPERS = [
  ['messageBox(options)', '`Promise<FormResult>`', 'A modal message: `title`, `text`, `buttons` (`ok`, `cancel`, `yes`, `no` or `{ text, result, tone }`), `tone` (`info`, `success`, `caution`, `danger`), `defaultButton`, `host`.'],
  ['confirm(text, options?)', '`Promise<boolean>`', 'OK and Cancel; `true` for OK.'],
];

const KEYS = [
  ['Tab / Shift + Tab', 'Inside a modal form Tab goes round; from a modeless one it goes on to the page.'],
  ['Escape', 'Clicks `cancelButton`; else closes it when `closeOnEscape` (on for modal forms).'],
  ['Enter', 'In a one-line field: clicks `acceptButton` (not in a text area, not on a button).'],
  ['Alt + key (`&Name`)', 'Access keys work inside the front window; while a modal form is open, only inside it.'],
  ['Moving, resizing', 'With the pointer. There are no keys of its own; an app can add them with `form.addShortcut(...)` and the `left` / `top` / `width` / `height` properties.'],
];

const A11Y = [
  ['Element', 'A native `<dialog>`: `showModal()` for a modal form (the browser makes the page inert), `show()` for a modeless one.'],
  ['Role and name', '`role="dialog"` (`alertdialog` with `alert`), `aria-modal="true"` when modal, named by its title through `aria-labelledby`.'],
  ['Description', 'A message box is described by its text (`aria-describedby`).'],
  ['Focus', 'On open: `[autofocus]`, the first field, the accept button, the first control. On close: back where it was. Never on `<body>`.'],
  ['Title bar buttons', 'Named from `uiLocale` (Minimize, Maximize, Restore, Close).'],
  ['Motion', 'A short fade with the motion tokens; none under reduced motion.'],
];

const HOOKS = [
  ['.mx-form', 'The `<dialog>`. `data-state` (`normal`, `minimized`, `maximized`), `data-modal`, `data-active`, `data-placed`, `data-docked`, `data-resizable`, `data-movable`, `data-dragging`.'],
  ['.mx-form__bar, .mx-form__icon, .mx-form__title, .mx-form__tools', 'The title bar and its parts.'],
  ['.mx-form__content, .mx-form__footer', 'The content area and the buttons row.'],
  ['.mx-form__frame, .mx-form__resize[data-edge]', 'The resize handles.'],
  ['.mx-form-chip', 'The chip a minimized form leaves in its `minimizeTarget`.'],
  ['.mx-message-box, .mx-message-box__icon, .mx-message-box__text', 'A message box’s content; `data-tone`.'],
  ['--_mx-w, --_mx-h, --_mx-x, --_mx-y', 'The size and place the form writes on itself.'],
];

const TOKENS = [
  ['window.background, window.border-color, window.border-width, window.radius', 'The surface.'],
  ['window.shadow, window.shadow-inactive, window.shadow-modal', 'Active, inactive and modal elevation.'],
  ['window.backdrop', 'Behind a modal form.'],
  ['window.bar-background, window.bar-height, window.bar-padding, window.bar-gap, window.bar-border-color', 'The title bar (from the design system’s `bar.*`).'],
  ['window.title-font-size, window.title-font-weight, window.icon-size', 'The title and its icon.'],
  ['window.padding, window.footer-padding, window.footer-gap', 'The content area and the buttons row.'],
  ['window.min-width, window.min-height, window.viewport-margin', 'The smallest size and the room kept around it.'],
  ['window.resize-edge, window.enter-offset', 'The resize handles; how far it slides in.'],
  ['window.message-width, window.message-gap, window.message-icon-size', 'Message boxes.'],
];

export default function WindowPage() {
  const s = reactive({
    find: false,
    query: '',
    renamed: '',
    notes: false,
    showMinimize: true,
    showMaximize: true,
    resizable: true,
    movable: true,
    useDock: true,
    log: [] as string[],
    dirty: false,
    events: false,
    answer: '',
    lang: 'en',
  });
  let host: Component<HTMLDivElement> | null = null;
  let dock: Component<HTMLDivElement> | null = null;
  let windows = 0;

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  const rename = async () => {
    const form = new RenameForm();
    const result: FormResult = await form.showDialog(host!);
    s.renamed = result === 'ok' ? `Renamed to “${form.name}”.` : 'Kept the old name.';
  };

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
    const deeper = action('Open level 2', () => {
      const inner = new MxForm({ title: 'Level 2', content: <p>The form below is blocked until this one closes.</p> });
      void inner.showDialog(outer);
    });
    outer.content = row(<p>A modal form.</p>, deeper);
    void outer.showDialog(host!);
  };

  const ask = async (kind: 'info' | 'caution' | 'danger' | 'custom') => {
    let result: FormResult | boolean;
    if (kind === 'info') result = await messageBox({ title: 'Saved', text: 'The file was saved.', tone: 'success' });
    else if (kind === 'caution')
      result = await messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });
    else if (kind === 'danger') result = await confirm('Delete “Report.docx”? This cannot be undone.', { title: 'Delete file', tone: 'danger' });
    else
      result = await messageBox({
        title: 'Update',
        text: 'A new version is ready.',
        buttons: [
          { text: 'Restart now', result: 'restart' },
          { text: 'Later', result: 'later' },
        ],
        tone: 'info',
      });
    s.answer = `Answer: ${String(result)}`;
  };

  let findForm: MxForm | null = null;
  const findOk = action('Find', () => findForm?.close('ok'), 'accent');
  const findClose = action('Close', () => (s.find = false));

  return (
    <>
      <p class="lead">
        A window or a dialog on a native <code>&lt;dialog&gt;</code>: one form, shown modeless or modal by whoever shows
        it. It has a title bar, moves, resizes, minimizes and maximizes; Enter and Escape press its buttons; forms open
        forms. <code>messageBox</code> and <code>confirm</code> cover the common questions.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { MxForm, messageBox, confirm, type FormResult } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it; it is hidden, not disposed, and lives with its parent. From code, a form (often a class with a `view()`) is shown with `show(host)` or `showDialog(host)`; it is added to the host and disposed when it closes." />
        </p>
        <Example
          code={`
<Button text="Find…" onclick={() => (this.state.find = true)} />
<MxForm title="Find" x-model={() => this.state.find} footer={buttons} acceptButton={find}>
  <TextBox label="&Find what" x-model={() => this.state.query} />
</MxForm>

class RenameForm extends MxForm {
  constructor() { super({ title: 'Rename', width: '24rem' }); /* footer, acceptButton… */ }
  view() { return <TextBox label="&New name" x-model={() => this.data.name} />; }
}
const result = await new RenameForm().showDialog(this);   // 'ok' | 'cancel'
`}
        >
          <Button text="Find…" variant="outline" onclick={() => (s.find = true)} />
          <MxForm
            class="win-find"
            title="Find"
            x-model={() => s.find}
            footer={row(findOk, findClose)}
            acceptButton={findOk}
            cancelButton={findClose}
            ref={(f: MxForm) => (findForm = f)}
            onClosed={(e) => e.result === 'ok' && (s.answer = `Searched for “${s.query}”.`)}
          >
            <TextBox label="&Find what" x-model={() => s.query} />
          </MxForm>
          <Button text="Rename… (class, modal)" variant="outline" onclick={rename} />
          <output class="win-renamed">{() => s.renamed}</output>
          <div ref={(c: Component<HTMLDivElement>) => (host = c)} />
        </Example>
      </Section>

      <Section anchor="modal" title="Modal and modeless">
        <p>
          <Rich text="`show()` keeps the page usable: several modeless windows stack, a click brings one to the front. `showDialog()` blocks everything else until it closes; a modal form opened from a modal one blocks that one too." />
        </p>
        <Example
          code={`
form.show(this);                        // modeless
const result = await form.showDialog(this);   // modal

// a form opened from a form
new MxForm({ title: 'Level 2' }).showDialog(outerForm);
`}
        >
          <Button text="Open a window" variant="outline" onclick={openWindow} />
          <Button text="Open nested modal forms" variant="outline" onclick={openNested} />
        </Example>
      </Section>

      <Section anchor="frame" title="Title bar and frame">
        <p>
          <Rich text="The title bar shows the icon, the title and the buttons you switch on. The form moves by its title bar and stays inside the viewport; it resizes from its edges and corners down to the `window.min-*` tokens. Every part has its own switch." />
        </p>
        <Example
          code={`
<MxForm
  title="Notes"
  icon={() => <NoteIcon />}
  showMinimize
  showMaximize
  resizable={() => this.state.resizable}
  movable={() => this.state.movable}
  minimizeTarget={this.dock}
  x-model={() => this.state.notes}
/>
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Frame switches">
            {(['showMinimize', 'showMaximize', 'resizable', 'movable', 'useDock'] as const).map((key) => (
              <Button key={key} text={key === 'useDock' ? 'minimize to the strip' : key} size="sm" toggle x-model={() => s[key]} />
            ))}
          </div>
          <div class="docs-flow">
            <Button text="Open notes" variant="outline" onclick={() => (s.notes = true)} />
          </div>
          <div
            class="docs-flow win-dock"
            ref={(c: Component<HTMLDivElement>) => (dock = c)}
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
        </Example>
      </Section>

      <Section anchor="buttons" title="Default and cancel buttons">
        <p>
          <Rich text="Enter in a one-line field clicks `acceptButton`; Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides: on for modal forms, off for modeless ones." />
        </p>
        <Example
          code={`
const ok = new Button({ text: 'Rename', tone: 'accent' });
ok.element.addEventListener('click', () => form.close('ok'));
const cancel = new Button({ text: 'Cancel' });
cancel.element.addEventListener('click', () => form.close('cancel'));
form.footer = row(ok, cancel);   // a div holding both
form.acceptButton = ok;
form.cancelButton = cancel;
`}
        >
          <Button text="Rename…" variant="outline" onclick={rename} />
        </Example>
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="`onClosing` can keep the form open, here while it has changes; `reason` tells the user (close button, Escape) from code and from the owner going away." />
        </p>
        <Example
          code={`
form.onClosing(async (e) => {
  if (this.dirty && e.reason === 'user') e.cancel = true;
});
form.onClosed((e) => console.log(e.result, e.reason));
`}
          stack
        >
          <div class="docs-flow">
            <Button text="Open" variant="outline" onclick={() => (s.events = true)} />
            <output class="win-log">{() => s.log.join(' · ')}</output>
          </div>
          <MxForm
            class="win-events"
            title="Events"
            x-model={() => s.events}
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
        </Example>
      </Section>

      <Section anchor="message" title="Message boxes">
        <p>
          <Rich text="`messageBox` shows a modal message with buttons and resolves with the result of the one pressed; `confirm` asks OK or Cancel and resolves `true` or `false`. Caution and danger boxes are alert dialogs; a danger box starts on its safe button." />
        </p>
        <Example
          code={`
await messageBox({ title: 'Saved', text: 'The file was saved.', tone: 'success' });
const answer = await messageBox({ text: 'Save the changes?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });
if (await confirm('Delete “Report.docx”?', { tone: 'danger' })) this.remove();
await messageBox({ text: 'A new version is ready.', buttons: [{ text: 'Restart now', result: 'restart' }, { text: 'Later', result: 'later' }] });
`}
        >
          <Button text="Info" variant="outline" onclick={() => ask('info')} />
          <Button text="Yes / No / Cancel" variant="outline" onclick={() => ask('caution')} />
          <Button text="Confirm delete" variant="outline" onclick={() => ask('danger')} />
          <Button text="Own buttons" variant="outline" onclick={() => ask('custom')} />
          <output class="win-answer">{() => s.answer}</output>
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
          <Rich text="The title bar buttons and the `ok`, `cancel`, `yes`, `no` buttons of a message box are named from `uiLocale.strings`." />
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
          <Button text="Ask" variant="outline" onclick={() => ask('caution')} />
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
        <h3>Helpers</h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={HELPERS} />
      </Section>
    </>
  );
}
