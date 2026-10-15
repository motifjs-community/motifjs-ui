import { Application, Component, reactive, type ComponentBase } from '@motifx/core';
import '@motifx-community/ui/styles.css';
import '../shared/docs.css';
import {
  Button,
  FormResult,
  MxForm,
  enStrings,
  trStrings,
  uiLocale,
  type FormClosingEventArgs,
} from '@motifx-community/ui';
import { Chrome } from '../shared/chrome';
import { ApiTable, Code, Rich, Toc } from '../shared/doc';

// ---- live examples ----------------------------------------------------------------------

const log = reactive({ lines: [] as { id: number; text: string }[] });
let seq = 0;
const write = (text: string) => {
  log.lines.unshift({ id: ++seq, text });
  if (log.lines.length > 8) log.lines.pop();
};

/**
 * A form written by subclassing: view() is the content, the frame comes from
 * MxForm. Its buttons become the form's default and cancel buttons (Enter/Escape).
 */
class CustomerForm extends MxForm {
  override view() {
    return (
      <>
        <p>
          <label>
            Name <input name="name" autofocus />
          </label>
        </p>
        <p>
          <Button onclick={() => openNested(this)}>Open another dialog from here…</Button>
        </p>
        <footer>
          <Button tone="accent" data-result="ok" ref={(b: ComponentBase) => (this.defaultButton = b)}>
            Save
          </Button>
          <Button data-result="cancel" ref={(b: ComponentBase) => (this.cancelButton = b)}>
            Cancel
          </Button>
        </footer>
      </>
    );
  }
}

async function openNested(owner: MxForm) {
  const result = await new MxForm({
    text: 'Nested dialog',
    content: () => (
      <>
        <p>This dialog was opened from inside another one; it blocks that one too.</p>
        <footer>
          <Button tone="accent" data-result="ok" autofocus>
            OK
          </Button>
        </footer>
      </>
    ),
  }).showDialog(owner);
  write(`nested dialog → ${result}`);
}

/** Closing is cancelled until the user confirms in a second dialog. Escape closes it (closeOnEscape). */
class NotesForm extends MxForm {
  private dirty = reactive({ value: false });

  override async onClosing(e: FormClosingEventArgs) {
    if (!this.dirty.value || e.result === 'ok' || e.reason === 'owner') return;
    const answer = await new MxForm({
      text: 'Unsaved changes',
      showClose: false,
      content: () => (
        <>
          <p>Discard your notes?</p>
          <footer>
            <Button tone="danger" data-result="yes">
              Discard
            </Button>
            <Button data-result="no" autofocus>
              Keep editing
            </Button>
          </footer>
        </>
      ),
    }).showDialog(this);
    if (answer !== 'yes') e.cancel = true;
  }

  override view() {
    return (
      <>
        <textarea rows={5} aria-label="Notes" oninput={() => (this.dirty.value = true)}></textarea>
        <footer>
          <Button tone="accent" data-result="ok">
            Save
          </Button>
        </footer>
      </>
    );
  }
}

/** Stands in for a page whose lifetime ends, e.g. a session timeout sending the user to login. */
class SessionPanel extends Component<HTMLDivElement> {
  override view() {
    return (
      <div class="demo">
        <Button
          onclick={() =>
            new MxForm({
              text: 'Owned by the panel',
              showMaximize: true,
              content: () => <p>Click "Session timeout" on the page: this window dies with the panel.</p>,
              onClosed: (e) => write(`owned window closed (reason: ${e.reason})`),
            }).show(Application.main!, this)
          }
        >
          Open window owned by this panel
        </Button>
        <Button tone="danger" onclick={() => void this.dispose().then(() => write('panel disposed'))}>
          Session timeout (dispose panel)
        </Button>
      </div>
    );
  }
}

/** A clickable row that opens a window inside itself: the window's events stop at its root. */
class ClickableRow extends Component<HTMLDivElement> {
  state = reactive({ rowClicks: 0 });
  override view() {
    return (
      <div class="demo docs-row" onclick={() => this.state.rowClicks++}>
        <span>
          Row clicks: <output class="row-clicks">{() => this.state.rowClicks}</output>
        </span>
        <Button
          onclick={() =>
            new MxForm({
              text: 'Window inside the row',
              closeOnEscape: true,
              content: () => (
                <>
                  <p>Clicks in here bubble up to this window and stop: the row counter does not move.</p>
                  <footer>
                    <Button tone="accent" data-result="ok" autofocus>
                      OK
                    </Button>
                  </footer>
                </>
              ),
            }).show(this)
          }
        >
          Open a window hosted in this row
        </Button>
      </div>
    );
  }
}

/** A form bound to state with x-model: two-way, and it keeps its content between openings. */
class BoundDemo extends Component<HTMLDivElement> {
  state = reactive({ open: false });
  override view() {
    return (
      <div class="demo">
        <label>
          <input type="checkbox" class="bound-state" x-model={() => this.state.open} /> state.open
        </label>
        <Button onclick={() => (this.state.open = true)}>Open bound form</Button>
        <MxForm
          text="Bound with x-model"
          modal
          x-model={() => this.state.open}
          onClosed={(e) => write(`bound form closed → ${e.result}, state.open = ${this.state.open}`)}
        >
          <p>
            <label>
              Type something, close, reopen: it is still here <input name="kept" autofocus />
            </label>
          </p>
          <footer>
            <Button tone="accent" data-result="ok">
              Done
            </Button>
          </footer>
        </MxForm>
      </div>
    );
  }
}

// ---- reference content ------------------------------------------------------------------

const PROPS = [
  ['text', '`Bind<string>`', "`''`", 'Caption in the title bar; also the accessible name of the window. Settable from code: `form.text = …`.'],
  ['enabled, visible, tabStop', '`Bind<boolean>`', '`true`', 'The shared `Control` props (see the Control page). `enabled = false` disables the whole content; windows opened from it stay usable.'],
  ['showClose', '`Bind<boolean>`', '`true`', "Caption close button. Closes with `'cancel'`, reason `'user'`."],
  ['showMaximize', '`Bind<boolean>`', '`false`', 'Caption maximize/restore button; double-clicking the title bar does the same.'],
  ['showMinimize', '`Bind<boolean>`', '`false`', 'Caption minimize/restore button. Where the window goes: see `minimizeTarget`. Never on a modal form: the page behind it stays blocked.'],
  ['resizable', '`Bind<boolean>`', '`true`', 'A floating window can be resized from its four edges and four corners.'],
  ['minimizeTarget', '`Bind<ComponentBase | null>`', '—', 'A taskbar-like area: a minimized window moves into it as a title-bar chip. Without it the window collapses to its title bar in place.'],
  ['closeOnEscape', '`Bind<boolean>`', '`true` modal, `false` modeless', "Escape closes the form with `'cancel'` when no `cancelButton` is set, as a native modal `<dialog>` does. With a `cancelButton`, Escape always clicks that button instead."],
  ['modal', '`boolean`', '`false`', 'Only with JSX `x-model`: open as a modal dialog instead of a modeless window. Read once, when the form is first shown.'],
  ['content', 'JSX, component or factory', '—', 'Content when the form is not subclassed. JSX children work the same way. Ignored by a subclass, whose `view()` is the content.'],
  ['defaultButton', '`Bind<ComponentBase | null>`', '—', 'Clicked when Enter is pressed outside multi-line fields and buttons, like the default button of an HTML form. A subclass can assign the `defaultButton` property instead.'],
  ['cancelButton', '`Bind<ComponentBase | null>`', '—', 'Clicked when Escape is pressed. Assignable as a property too.'],
  ['onShown', '`(form) => void`', '—', 'After the window opened and took focus.'],
  ['onClosing', '`(e: FormClosingEventArgs) => void | Promise<void>`', '—', "Before closing. May be async (ask with another form) and may set `e.cancel = true`, except when the reason is `'owner'`."],
  ['onClosed', '`(e: FormClosedEventArgs) => void`', '—', 'After the form closed, before it is disposed (when it is).'],
  ['x-model', '`() => state.open`', '—', 'JSX directive: binds the shown state two-way. See "Three ways to use it".'],
];

const PROPERTIES = [
  ['text, enabled, visible, tabStop', 'see Control', 'read/write, reactive', 'Inherited from `Control`, together with `canFocus`, `focused`, `focusWithin`, `focus()` and `addShortcut()`.'],
  ['activeControl', '`Control | null`', 'read/write, reactive', 'From `FocusContainer`: the control inside that has (or last had) focus; setting it focuses it. `restoreFocus()` goes back there.'],
  ['result', '`FormResult`', 'read/write', 'The result the form closes with when `close()` gets none; after closing, the result it closed with.'],
  ['windowState', "`'normal' | 'maximized' | 'minimized'`", 'read/write, reactive', 'How the window is shown. Setting `minimized` moves it into `minimizeTarget` when there is one; a modal form stays `normal`.'],
  ['defaultButton', '`ComponentBase | null`', 'read/write', 'Overrides the `defaultButton` prop; assign it from a subclass view with `ref`.'],
  ['cancelButton', '`ComponentBase | null`', 'read/write', 'Overrides the `cancelButton` prop.'],
  ['isOpen', '`boolean`', 'read-only, reactive', 'The form is shown as a window right now.'],
  ['isActive', '`boolean`', 'read-only, reactive', 'This is the front-most (active) window of the page.'],
  ['isModal', '`boolean`', 'read-only', 'The current window is modal.'],
  ['hostKind', "`'embedded' | 'window'`", 'read-only, reactive', '`window` once shown as a window (or bound with `x-model`), `embedded` otherwise.'],
  ['titleId', '`string`', 'read-only', 'Id of the caption heading; the window is `aria-labelledby` it.'],
  ['value', '`boolean`', 'read/write', 'The `x-model` target. You normally never touch it: bind state with `x-model` instead.'],
];

const METHODS = [
  ['show(host, disposeRef?)', '`this`', 'Opens the form as a modeless window added to `host`. On an open form, brings it to the front.'],
  ['showDialog(host, disposeRef?)', '`Promise<FormResult>`', "Opens it modal; resolves with the result it closed with (`'none'` when an owner was disposed first). A second call returns the same promise."],
  ['close(result?, reason?)', '`Promise<boolean>`', "Runs `onClosing` (may cancel), then `onClosed`, then disposes the form (or hides it, with `x-model`). Resolves `false` when cancelled or already closed. `reason` defaults to `'code'`."],
  ['activate()', '`void`', 'Brings an open window to the front and makes it the active one.'],
  ['focusFirst()', '`void`', 'Moves focus into the form: `[autofocus]`, else the first focusable control of the content.'],
];

const HOOKS = [
  ['view()', 'The content of the form. The frame (title bar, caption buttons) stays; `view()` fills the content area.'],
  ['onShown()', 'Runs before the `onShown` prop.'],
  ['onClosing(e)', 'Runs before the `onClosing` prop; may be async and may cancel.'],
  ['onClosed(e)', 'Runs before the `onClosed` prop.'],
];

const LIFETIME = [
  ['form.show(host)', 'in `host`', '`host` is disposed', 'it closes, or `host` dies'],
  ['form.show(Application.main)', "in the app's root component", 'the app is disposed', 'it closes'],
  ['form.show(host, owner)', 'in `host`', '`host` or `owner` is disposed', 'it closes, or `host`/`owner` dies'],
  ['form.showDialog(…)', 'same as `show`', 'same as `show`', 'same as `show`; the promise resolves'],
  ['<MxForm x-model={…}>', 'next to where it is written', 'its parent is disposed', 'never on close: it hides and keeps its state'],
  ['<MxForm> (no x-model)', 'where it is written', 'its parent is disposed', 'its close button disposes it'],
];

const RESULTS = [
  ["`'none'`", 'No answer: the default, and what `showDialog` resolves with when an owner was disposed first.'],
  ["`'ok'`, `'cancel'`, `'yes'`, `'no'`", "The usual answers. The caption close button and Escape close with `'cancel'`."],
  ['any other string', 'Your own answers: `data-result="later"` closes with `\'later\'`, like `dialog.returnValue`.'],
];

const REASONS = [
  ["`'code'`", 'Code called `close()`; a `data-result` button and `x-model` set to `false` count as code.'],
  ["`'user'`", 'The caption close button, or Escape.'],
  ["`'owner'`", 'The host or `disposeRef` is being disposed while the form is open. Cannot be cancelled; `onClosing` is only notified.'],
];

const KEYS = [
  ['Enter', 'Clicks `defaultButton`, unless focus is in a textarea, button, link, select, checkbox, radio or contenteditable (where Enter already means something).'],
  ['Escape', "Clicks `cancelButton` if set; otherwise closes with `'cancel'` when `closeOnEscape` is on (the default for a modal form); otherwise nothing."],
  ['Tab / Shift+Tab', 'Moves through the form in `tabIndex` order. In a modal window it wraps around inside (nothing else can be used); from a modeless window or an embedded form, Tab moves on to the page, as with the web\'s non-modal dialogs.'],
  ['Access keys', 'Only the access keys (`&Save`) of the modal form while one is open, else of the window holding focus.'],
  ['Shortcuts', '`form.addShortcut("Ctrl+S", …)` runs while focus is in the form. While a modal form is open, app-wide shortcuts are silent.'],
  ['Activating', 'Clicking the title bar of a window (it takes no focus itself) puts focus back on the control that was active in it (`activeControl`, `restoreFocus()`).'],
  ['Opening', 'Focus goes to the first `[autofocus]` element of the content, else its first focusable control, else the caption buttons.'],
  ['Closing', 'Focus returns to the element that had it when the form opened. If that is gone, it goes back to where it was in the window that is now active. It never falls back to `<body>`.'],
];

const STYLING = [
  ['.mx-form', 'The form. `data-host="embedded|window"`, `data-window-state="normal|maximized|minimized"`.'],
  ['.mx-form__titlebar', 'Title bar (`data-part="titlebar"`): the bar color (`color.bg.bar`), drag handle of a window.'],
  ['.mx-form__title', 'The caption heading (`<h2>`).'],
  ['.mx-form__caption-button', 'Caption buttons; `data-action="minimize|maximize|restore|close"`.'],
  ['.mx-form__body', 'Content area (`data-part="body"`). A direct `<footer>` child becomes the command area.'],
  ['.mx-form-window', 'The floating window (`<dialog>`). `data-modal`, `data-active`, `data-window-state`, `data-placed` (moved/resized), `data-minimized-in` (minimized into a target).'],
  ['.mx-form-window__resize', 'Resize handles; `data-edge="n|s|e|w|ne|nw|se|sw"`.'],
];

const TOKENS = [
  ['form.radius', 'Window and embedded corner radius (`radius.lg`).'],
  ['form.padding', 'Content padding (`space.6`, 24px).'],
  ['form.width / min-width / min-height', 'Initial width of a window and the smallest it can be resized to.'],
  ['form.titlebar.*', '`bg` (`color.bg.bar`), `height` (`bar.height`, follows the density), `gap`, `padding-inline`, `font-size` (12px caption).'],
  ['form.caption-button.*', '`width` (46px), `icon`, `close-hover-bg`, `close-hover-fg`.'],
  ['form.body-bg / footer-bg', 'Content and command-area backgrounds.'],
  ['form.border / shadow / shadow-modal / shadow-minimized', 'Window stroke and elevation.'],
  ['form.backdrop', 'The smoke behind a modal window.'],
  ['form.minimized-width / resize-handle', 'Width of a window minimized into a target; thickness of the resize edges.'],
];

const STRINGS = [
  ['close', "`'Close'`", "`'Kapat'`"],
  ['minimize', "`'Minimize'`", "`'Simge durumuna küçült'`"],
  ['maximize', "`'Maximize'`", "`'Ekranı kapla'`"],
  ['restore', "`'Restore'`", "`'Önceki boyutuna getir'`"],
];

// ---- the page -----------------------------------------------------------------------------

function Page() {
  let root!: Component;
  let taskbar!: Component;
  const s = reactive({ lang: 'en' });
  let windowCount = 0;

  return (
    <div ref={(c: Component) => (root = c)}>
      <Chrome root="../" active="form" />
      <main class="docs-main">
        <h1>MxForm</h1>
        <p class="lead">
          A form: title bar, caption buttons and a content area. You create it when you need it and
          put it anywhere — a modeless window, a modal dialog that answers with a <code>FormResult</code>, a window
          that follows a state, or a part of the page. It dies when it closes, or with whatever owns it.
        </p>

        <Toc
          items={[
            ['import', 'Import'],
            ['ways', 'Three ways to use it'],
            ['writing', 'Writing a form'],
            ['lifetime', 'Showing and lifetime'],
            ['closing', 'Closing and results'],
            ['window', 'Window behaviour'],
            ['keyboard', 'Keyboard and focus'],
            ['a11y', 'Accessibility'],
            ['i18n', 'Localization'],
            ['api', 'API reference'],
            ['styling', 'Styling and tokens'],
            ['limits', 'Not yet'],
          ]}
        />

        <h2 id="import">Import</h2>
        <Code
          code={`
import '@motifx-community/ui/styles.css';
import { MxForm, type FormResult, type CloseReason } from '@motifx-community/ui';
`}
        />

        <h2 id="ways">Three ways to use it</h2>
        <p>
          The developer using the form picks the way; every form supports all three.
        </p>

        <h3>1. Create it and show it — <code>show</code> / <code>showDialog</code></h3>
        <p>
          Nothing is declared ahead of time: no template entry, no "is open" state. The form is an object; you create
          it on a click, show it, and read the answer. <code>showDialog</code> is modal (nothing else on the page can
          be used until it closes) and resolves with the result; <code>show</code> opens a modeless window and returns
          the form.
        </p>
        <Code
          code={`
async onDeleteClick() {
  const result = await new ConfirmForm({ text: 'Delete record?' }).showDialog(this);
  if (result === 'yes') this.model.delete();
}

openInspector() {
  new InspectorForm({ text: 'Inspector', showMaximize: true }).show(Application.main!, this);
}
`}
        />
        <div class="demo">
          <Button
            tone="accent"
            onclick={async () =>
              write(`customer dialog → ${await new CustomerForm({ text: 'New customer' }).showDialog(root)}`)
            }
          >
            New customer…
          </Button>
          <Button onclick={() => void new NotesForm({ text: 'Notes', closeOnEscape: true }).showDialog(root)}>
            Notes (asks before discarding)…
          </Button>
        </div>

        <h3>2. Bind it to state — <code>x-model</code></h3>
        <p>
          Written in JSX with <code>x-model</code>, the form opens when the state turns <code>true</code> and closes
          when it turns <code>false</code>. It is two-way: when the user closes the form (a result button, the close
          button, Escape), the form writes <code>false</code> back, so the state never claims a closed form is open. A
          form bound this way is not disposed on close; it hides, keeps what was typed into it, and lives as long as its
          parent. <code>modal</code> picks a modal dialog instead of a modeless window.
        </p>
        <Code
          code={`
class CustomersPage extends Component<HTMLDivElement> {
  state = reactive({ editing: false });
  view() {
    return (
      <div>
        <Button onclick={() => (this.state.editing = true)}>Edit…</Button>
        <CustomerForm text="Customer" modal x-model={() => this.state.editing} />
      </div>
    );
  }
}
`}
        />
        <div class="note docs-note">
          <Rich text="Why `x-model` and not a `show={() => …}` prop: a plain prop reaches the component as a getter only, so the form could not write `false` back. `x-model` is MotifJS's two-way binding: core writes the state into the form and keeps the setter, which the form calls on close." />
        </div>
        <BoundDemo />

        <h3>3. Embed it — plain JSX</h3>
        <p>
          Without <code>x-model</code>, a form written in JSX is simply part of the page: the same frame, as a labelled
          region. Its close button disposes it.
        </p>
        <MxForm text="Embedded form" showClose={false}>
          <p>Written in JSX without x-model, the form is part of the page: a labelled region with the same frame.</p>
        </MxForm>

        <h2 id="writing">Writing a form</h2>
        <p>
          Subclass it and write <code>view()</code>: it fills the content area, the frame stays. Or, without a
          subclass, pass the content as JSX children or as the <code>content</code> prop.
        </p>
        <Code
          code={`
class CustomerForm extends MxForm {
  view() {
    return (
      <>
        <label>Name <input name="name" autofocus /></label>
        <footer>
          <Button tone="accent" data-result="ok" ref={(b) => (this.defaultButton = b)}>Save</Button>
          <Button data-result="cancel" ref={(b) => (this.cancelButton = b)}>Cancel</Button>
        </footer>
      </>
    );
  }
}

// no subclass:
new MxForm({ text: 'About', content: () => <p>Version 1.0</p> }).showDialog(this);
<MxForm text="Filters"><FilterFields /></MxForm>
`}
        />
        <ul class="docs-list">
          <li>
            <Rich
              text={
                'Any element with `data-result="ok"` (`cancel`, `yes`, …) closes the form with that result when clicked. A disabled one does nothing; one inside a nested form closes only that form.'
              }
            />
          </li>
          <li>
            <Rich text="A `<footer>` placed directly in the content becomes the command area: its own background, a divider, trailing buttons." />
          </li>
          <li>
            <Rich text="`defaultButton` / `cancelButton` are the buttons Enter and Escape click. Assign them in the subclass view with `ref`, or pass them as props." />
          </li>
        </ul>

        <h2 id="lifetime">Showing and lifetime</h2>
        <p>
          <code>host</code> is where the window is added: any component, or the <code>Application</code> (then its
          root component). The form dies when it closes. It also dies when the component its lifetime is bound to is
          disposed while it is still open — the session times out, the app navigates to the login page, and the open
          window goes with the page. <code>disposeRef</code> binds the lifetime to another component than the one it
          is added to.
        </p>
        <ApiTable head={['Call', 'Added to', 'Dies early when', 'Dies at the latest when']} rows={LIFETIME} />
        <div class="note docs-note">
          <Rich text="Pass a container as `host` (a page, a panel, the `Application`), not a button: the window becomes a DOM child of its host." />
        </div>
        <SessionPanel />

        <h2 id="closing">Closing and results</h2>
        <p>
          Every close goes the same way: <code>onClosing</code> (the subclass hook first, then the prop) →{' '}
          <code>onClosed</code> → dispose (or hide, with <code>x-model</code>). <code>onClosing</code> may be
          async and may cancel, which is how "save changes?" works: ask with another form, set{' '}
          <code>e.cancel</code> when the answer is no. Try the Notes example above: type, press Escape.
        </p>
        <Code
          code={`
class NotesForm extends MxForm {
  async onClosing(e: FormClosingEventArgs) {
    if (!this.dirty || e.result === 'ok' || e.reason === 'owner') return;
    const answer = await new ConfirmForm({ text: 'Discard your notes?' }).showDialog(this);
    if (answer !== 'yes') e.cancel = true;
  }
}
`}
        />
        <h3>FormResult</h3>
        <ApiTable head={['Value', 'Notes']} rows={RESULTS} />
        <h3>CloseReason</h3>
        <ApiTable head={['Value', 'When']} rows={REASONS} />

        <h2 id="window">Window behaviour</h2>
        <ul class="docs-list">
          <li>
            <Rich text="Modal (`showDialog`, or `modal` with `x-model`): the browser's native modal dialog — top layer, the rest of the page inert, Tab kept inside, Escape closes it — plus a scroll lock. A modal opened from a modal blocks the one below." />
          </li>
          <li>
            <Rich text="Modeless (`show`): windows keep a page-wide order. Clicking or focusing a window brings it to the front and makes it active; inactive windows dim their title. Tab moves on from a modeless window to the page." />
          </li>
          <li>
            <Rich text="Move by dragging the title bar; resize from any edge or corner (`resizable`). A window cannot be pushed out of reach: part of it always stays on screen." />
          </li>
          <li>
            <Rich text="Maximize with the caption button or a double-click on the title bar (`showMaximize`)." />
          </li>
          <li>
            <Rich text="Minimize (`showMinimize`, modeless windows only): with a `minimizeTarget`, the window moves into that area as a title-bar chip and comes back where it was on restore; without one, it collapses to its title bar in place." />
          </li>
          <li>
            <Rich text="Events stop at the window: inside a window they bubble as usual up to its root, never further. A click in a window opened from a list row does not trigger the row. Capture-phase listeners above (app-wide shortcuts) still see them." />
          </li>
        </ul>
        <div class="demo">
          <Button
            onclick={() =>
              new MxForm({
                text: `Window ${++windowCount}`,
                showMinimize: true,
                showMaximize: true,
                minimizeTarget: taskbar,
                content: () => (
                  <p>
                    Drag the title bar, resize from any edge, double-click the title to maximize. Minimize sends it to
                    the taskbar below.
                  </p>
                ),
              }).show(Application.main!)
            }
          >
            Open a window on the app root
          </Button>
          <div class="docs-taskbar" role="group" aria-label="Minimized windows" ref={(c: Component) => (taskbar = c)}></div>
        </div>
        <ClickableRow />

        <h2 id="keyboard">Keyboard and focus</h2>
        <ApiTable head={['Key / moment', 'Behaviour']} rows={KEYS} />

        <h2 id="a11y">Accessibility</h2>
        <ul class="docs-list">
          <li>
            <Rich text="A window is a native `<dialog>` (role `dialog`, `aria-modal` when modal), named by its caption through `aria-labelledby`. Keep `text` meaningful." />
          </li>
          <li>
            <Rich text="An embedded form is a `region` labelled by its caption." />
          </li>
          <li>
            <Rich text="Caption buttons are real buttons with labels from `UiLocale` (Close, Minimize, Maximize, Restore); resize handles are hidden from assistive tech." />
          </li>
          <li>
            <Rich text="Focus is managed on open and close (see above); the focus ring is the design system's double ring from the `focus.ring` tokens and shows for keyboard use only." />
          </li>
        </ul>

        <h2 id="i18n">Localization</h2>
        <p>
          The texts the form writes itself come from <code>UiLocale</code>. It is reactive: switching the language
          relabels every form already on screen. English and Turkish ship; anything else is a{' '}
          <code>set(&#123;…&#125;)</code> away.
        </p>
        <Code
          code={`
import { uiLocale, trStrings, UiLocale } from '@motifx-community/ui';

uiLocale.set(trStrings);                              // the shared default
uiLocale.set({ close: 'Schließen' });                 // single texts
builder.services.addSingleton(UiLocale, () => new UiLocale(trStrings)); // per app, through DI
`}
        />
        <ApiTable head={['Key', 'enStrings', 'trStrings']} rows={STRINGS} />
        <div class="demo">
          <Button
            size="sm"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.set(s.lang === 'tr' ? trStrings : enStrings);
            }}
          >
            {() => `Caption button labels: ${s.lang}`}
          </Button>
        </div>

        <h2 id="api">API reference</h2>
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Type', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Subclass hooks</h3>
        <ApiTable head={['Member', 'Description']} rows={HOOKS} />
        <h3>Event arguments</h3>
        <Code
          code={`
interface FormClosingEventArgs {
  readonly form: MxForm;
  readonly reason: CloseReason;
  result: FormResult; // a handler may change it
  cancel: boolean;    // ignored when reason is 'owner'
}

interface FormClosedEventArgs {
  readonly form: MxForm;
  readonly reason: CloseReason;
  readonly result: FormResult;
}
`}
        />
        <h3>Errors</h3>
        <ul class="docs-list">
          <li>
            <Rich text="`show`/`showDialog` on a form that already closed: a closed form is disposed; create a new one." />
          </li>
          <li>
            <Rich text="`showDialog` on a form that is open modeless." />
          </li>
          <li>
            <Rich text="`show`/`showDialog` on a form bound with `x-model`: set the bound state instead." />
          </li>
        </ul>

        <h2 id="styling">Styling and tokens</h2>
        <p>
          Classes are stable hooks; state lives in <code>data-*</code> attributes; every value comes from a token, so a
          theme or a single <code>--mx-form-*</code> override restyles all forms.
        </p>
        <ApiTable head={['Hook', 'What it is']} rows={STYLING} />
        <ApiTable head={['Token', 'Use']} rows={TOKENS} />

        <h2 id="limits">Not yet</h2>
        <ul class="docs-list">
          <li>Moving and resizing a window from the keyboard.</li>
          <li>
            <Rich text="Document hosts (tabbed documents, windows inside an area) that decide minimize/maximize inside them." />
          </li>
          <li>
            <Rich text="`show()` without a host: core does not yet know which component a handler runs for, so `host` is required." />
          </li>
        </ul>

        <h2>Log</h2>
        <ul class="docs-list" aria-live="polite">
          {log.lines.map((l) => (
            <li key={l.id}>{l.text}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

Application.CreateBuilder().build().run('#app', <Page />);
