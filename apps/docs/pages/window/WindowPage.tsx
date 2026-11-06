import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DefaultButtons from './examples/DefaultButtons';
import Events from './examples/Events';
import Frame from './examples/Frame';
import JsxAndCode from './examples/JsxAndCode';
import Localization from './examples/Localization';
import MessageBoxes from './examples/MessageBoxes';
import ModalAndModeless from './examples/ModalAndModeless';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

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
  ['window.scrim, window.surface', 'Units: behind a modal form; the surface (`active`, `dialog`: a modal one, `maximized`).'],
  ['window.bar, window.icon, window.title, window.tools', 'Units: the title bar (`active`, `dialog`), its icon, the title (`dialog`) and its buttons.'],
  ['window.body, window.footer, window.grip', 'Units: the content area, the buttons row, the resize grips (`corner`).'],
  ['window.bar-height, window.title-align, window.tools-order', 'The title bar’s height (from the design system’s `bar.*`), where the title sits, where its buttons sit.'],
  ['window.min-width, window.min-height, window.viewport-margin', 'The smallest size and the room kept around it.'],
  ['window.resize-edge, window.enter-offset', 'The resize handles; how far it slides in.'],
  ['window.message, window.message-icon, window.message-width', 'Message boxes: units for the content and its tone glyph (per tone), and their width.'],
];

export default function WindowPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A window or a dialog on a native `<dialog>`: one form, shown modeless or modal by whoever shows it. It has a title bar, moves, resizes, minimizes and maximizes; Enter and Escape press its buttons; forms open forms. `messageBox` and `confirm` cover the common questions." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { MxForm, messageBox, confirm, type FormResult } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it; it is hidden, not disposed, and lives with its parent. Programmatically, a form (often a class with a `view()`) is shown with `show(host)` or `showDialog(host)`; it is added to the host and disposed when it closes." />
        </p>
        <Example files={code('JsxAndCode.tsx', 'RenameForm.tsx')}>
          <JsxAndCode />
        </Example>
      </Section>

      <Section anchor="modal" title="Modal and modeless">
        <p>
          <Rich text="`show()` keeps the page usable: several modeless windows stack, a click brings one to the front. `showDialog()` blocks everything else until it closes; a modal form opened from a modal one blocks that one too." />
        </p>
        <Example files={code('ModalAndModeless.tsx')}>
          <ModalAndModeless />
        </Example>
      </Section>

      <Section anchor="frame" title="Title bar and frame">
        <p>
          <Rich text="The title bar shows the icon, the title and the buttons you switch on. The form moves by its title bar and stays inside the viewport; it resizes from its edges and corners down to the `window.min-*` tokens. Every part has its own switch." />
        </p>
        <Example files={code('Frame.tsx')} stack>
          <Frame />
        </Example>
      </Section>

      <Section anchor="buttons" title="Default and cancel buttons">
        <p>
          <Rich text="Enter in a one-line field clicks `acceptButton`; Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides: on for modal forms, off for modeless ones." />
        </p>
        <Example files={code('DefaultButtons.tsx', 'RenameForm.tsx')}>
          <DefaultButtons />
        </Example>
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="`onClosing` can keep the form open, here while it has changes; `reason` tells the user (close button, Escape) programmatically and from the owner going away." />
        </p>
        <Example files={code('Events.tsx')} stack>
          <Events />
        </Example>
      </Section>

      <Section anchor="message" title="Message boxes">
        <p>
          <Rich text="`messageBox` shows a modal message with buttons and resolves with the result of the one pressed; `confirm` asks OK or Cancel and resolves `true` or `false`. Caution and danger boxes are alert dialogs; a danger box starts on its safe button." />
        </p>
        <Example files={code('MessageBoxes.tsx')}>
          <MessageBoxes />
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
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
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
        <h3>
          <Rich text="Helpers" />
        </h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={HELPERS} />
      </Section>
    </>
  );
}
