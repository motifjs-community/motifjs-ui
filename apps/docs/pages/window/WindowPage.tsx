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
  ['value', '`Bind<boolean>`', '`false`', 'Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it.'],
  ['modal', '`Bind<boolean>`', '`false`', 'Opened through `value`, the form is modal.'],
  ['title', '`Bind<string>`', "`''`", 'The title in the title bar, which also names the form. This is the same property as `text`.'],
  ['content', '`Bind<ComponentBase | null>`', '—', 'Content for the content area, in addition to JSX children and `view()`.'],
  ['footer', '`Bind<ComponentBase | null>`', '—', 'A non-scrolling row below the content, for buttons.'],
  ['icon', '`Bind<IconSource | null>`', '—', 'An icon at the start of the title bar.'],
  ['showClose', '`Bind<boolean>`', '`true`', 'Shows the close button.'],
  ['showMinimize', '`Bind<boolean>`', '`false`', 'Shows the minimize button, on modeless forms only.'],
  ['showMaximize', '`Bind<boolean>`', '`false`', 'Shows the maximize button. Double-clicking the title bar does the same.'],
  ['resizable', '`Bind<boolean>`', '`true`', 'Allows resizing from the edges and corners.'],
  ['movable', '`Bind<boolean>`', '`true`', 'Allows moving by dragging the title bar, within the viewport.'],
  ['closeOnEscape', '`Bind<boolean>`', '`true` for modal forms, `false` for modeless forms', 'Closes the form with `cancel` on Escape when there is no `cancelButton`.'],
  ['acceptButton', '`Bind<Control | null>`', '—', 'The button Enter clicks from a single-line field.'],
  ['cancelButton', '`Bind<Control | null>`', '—', 'The button Escape clicks.'],
  ['minimizeTarget', '`Bind<HTMLElement | ComponentBase | null>`', '—', 'Where a minimized form leaves a chip that restores it. Without it, the form collapses to its title bar.'],
  ['windowState', '`Bind<FormWindowState>`', "`'normal'`", '`normal`, `minimized`, `maximized`.'],
  ['startPosition', '`Bind<FormStartPosition>`', "`'center'`", '`center`, or `manual` at `left` and `top`.'],
  ['left / top', '`Bind<number | string>`', '—', 'With `manual`, the position from the start edge (the right edge in RTL) and the top. A number is in pixels.'],
  ['width / height', '`Bind<number | string>`', 'Content size', 'A CSS length. A number is in pixels.'],
  ['alert', '`Bind<boolean>`', '`false`', '`role="alertdialog"`, for urgent content.'],
  ['disposeOnClose', '`Bind<boolean>`', 'see text', 'By default, a form added to the host by `show` or `showDialog` is disposed, and a JSX form is hidden.'],
  ['enabled / disabled, visible', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop. `left`, `top`, `width` and `height` track moving and resizing by the user.'],
  ['result', 'read/write, reactive', 'How the form closed, or will close. `close()` without an argument uses this value. It is `cancel` on open.'],
  ['isOpen, isModal, isActive', 'read-only, reactive', 'Indicate whether the form is open, whether it is modal, and whether it is the front window of the page.'],
  ['activeControl', 'read-only, reactive', 'The child control that has focus, or last had it.'],
  ['contentElement', 'read-only', 'The content area element.'],
];

const METHODS = [
  ['show(host, disposeRef?)', '`void`', 'Shows the form as modeless in `host` (a component or the application). It is disposed with `disposeRef`, or with the host.'],
  ['showDialog(host, disposeRef?)', '`Promise<FormResult>`', 'Shows the form as modal and resolves with the result when it closes.'],
  ['close(result?)', '`boolean`', 'Closes it. Returns `false` if `onClosing` canceled the close.'],
  ['activate()', '`void`', 'Brings it to the front with focus on its last active control.'],
  ['minimize(), maximize(), restore()', '`void`', 'These set `windowState`.'],
  ['center()', '`void`', 'Centers it in the viewport.'],
  ['restoreFocus()', '`boolean`', 'Returns focus to its last active control.'],
];

const EVENTS = [
  ['onLoaded(e)', 'Runs before the first show, and is where to populate the form.'],
  ['onShown(e)', 'Occurs after it is shown.'],
  ['onActivate(e) / onDeactivate(e)', 'Occur when it becomes the front window and when another window takes over.'],
  ['onClosing(e)', 'Occurs before it closes. `e`: `{ result, reason, source, cancel }`. Set `cancel = true` to keep it open, unless its owner is being disposed.'],
  ['onClosed(e)', 'Occurs after it closes. `e`: `{ result, reason, source }`, where `reason` is `user` (close button, Escape), `code` or `owner`.'],
];

const HELPERS = [
  ['messageBox(options)', '`Promise<FormResult>`', 'Shows a modal message: `title`, `text`, `buttons` (`ok`, `cancel`, `yes`, `no` or `{ text, result, tone }`), `tone` (`info`, `success`, `caution`, `danger`), `defaultButton` and `host`.'],
  ['confirm(text, options?)', '`Promise<boolean>`', 'Shows OK and Cancel, and resolves to `true` for OK.'],
];

const KEYS = [
  ['Tab / Shift + Tab', 'Inside a modal form, Tab cycles within it. From a modeless form, it continues to the page.'],
  ['Escape', 'Clicks `cancelButton`. Otherwise, it closes the form when `closeOnEscape` is on, which is the default for modal forms.'],
  ['Enter', 'In a single-line field, clicks `acceptButton`. This does not apply in a text area or on a button.'],
  ['Alt + key (`&Name`)', 'Access keys work inside the front window. While a modal form is open, they work only inside it.'],
  ['Moving, resizing', 'Moved and resized with the pointer. There are no built-in keys, but an application can add them with `form.addShortcut(...)` and the `left`, `top`, `width` and `height` properties.'],
];

const A11Y = [
  ['Element', 'A native `<dialog>`, using `showModal()` for a modal form, which makes the page inert, and `show()` for a modeless one.'],
  ['Role and name', '`role="dialog"` (`alertdialog` with `alert`), `aria-modal="true"` when modal, and named by its title through `aria-labelledby`.'],
  ['Description', 'A message box is described by its text (`aria-describedby`).'],
  ['Focus', 'On open, focus goes to `[autofocus]`, the first field, the accept button or the first control. On close, it returns to where it was. It never falls to `<body>`.'],
  ['Title bar buttons', 'Named from `uiLocale` (Minimize, Maximize, Restore, Close).'],
  ['Motion', 'A short fade using the motion tokens, removed when the user prefers reduced motion.'],
];

const HOOKS = [
  ['.mx-form', 'The `<dialog>`. `data-state` (`normal`, `minimized`, `maximized`), `data-modal`, `data-active`, `data-placed`, `data-docked`, `data-resizable`, `data-movable`, `data-dragging`.'],
  ['.mx-form__bar, .mx-form__icon, .mx-form__title, .mx-form__tools', 'The title bar and its parts.'],
  ['.mx-form__content, .mx-form__footer', 'The content area and the button row.'],
  ['.mx-form__frame, .mx-form__resize[data-edge]', 'The resize handles.'],
  ['.mx-form-chip', 'The chip a minimized form leaves in its `minimizeTarget`.'],
  ['.mx-message-box, .mx-message-box__icon, .mx-message-box__text', 'The content of a message box, with `data-tone`.'],
  ['--_mx-w, --_mx-h, --_mx-x, --_mx-y', 'The size and position the form sets on itself.'],
];

const TOKENS = [
  ['window.scrim, window.surface', 'Units: the backdrop of a modal form, and the surface (`active`, `dialog` for a modal form, `maximized`).'],
  ['window.bar, window.icon, window.title, window.tools', 'Units: the title bar (`active`, `dialog`), its icon, the title (`dialog`) and its buttons.'],
  ['window.body, window.footer, window.grip', 'Units: the content area, the button row and the resize grips (`corner`).'],
  ['window.bar-height, window.title-align, window.tools-order', 'The title bar height (from the design system `bar.*` tokens), and the position of the title and its buttons.'],
  ['window.min-width, window.min-height, window.viewport-margin', 'The minimum size and the margin kept around the form.'],
  ['window.resize-edge, window.enter-offset', 'The resize handles, and the distance it animates in from.'],
  ['window.message, window.message-icon, window.message-width', 'Message boxes: units for the content and its tone glyph (per tone), and their width.'],
];

export default function WindowPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A window or dialog built on the native `<dialog>` element. A single form can be shown as modeless or modal, depending on how you open it. It has a title bar, can be moved, resized, minimized and maximized, and Enter and Escape activate its buttons. Forms can open other forms, and `messageBox` and `confirm` cover common prompts." />
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
          <Rich text="In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it. The form is hidden rather than disposed, and it lives with its parent. Programmatically, a form, usually a class with a `view()` method, opens with `show(host)` or `showDialog(host)`. It is added to the host and disposed when it closes." />
        </p>
        <Example files={code('JsxAndCode.tsx', 'RenameForm.tsx')}>
          <JsxAndCode />
        </Example>
      </Section>

      <Section anchor="modal" title="Modal and modeless">
        <p>
          <Rich text="`show()` keeps the page usable. Several modeless windows can stack, and clicking one brings it to the front. `showDialog()` blocks everything else until it closes, and a modal form opened from another modal form blocks that form too." />
        </p>
        <Example files={code('ModalAndModeless.tsx')}>
          <ModalAndModeless />
        </Example>
      </Section>

      <Section anchor="frame" title="Title bar and frame">
        <p>
          <Rich text="The title bar shows the icon, the title and the buttons you enable. The form moves by its title bar and stays inside the viewport. It resizes from its edges and corners, down to the `window.min-*` tokens. Each of these features has its own setting." />
        </p>
        <Example files={code('Frame.tsx')} stack>
          <Frame />
        </Example>
      </Section>

      <Section anchor="buttons" title="Default and cancel buttons">
        <p>
          <Rich text="Enter in a single-line field clicks `acceptButton`, and Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides. It is on for modal forms and off for modeless ones." />
        </p>
        <Example files={code('DefaultButtons.tsx', 'RenameForm.tsx')}>
          <DefaultButtons />
        </Example>
      </Section>

      <Section anchor="events" title="Events">
        <p>
          <Rich text="`onClosing` can keep the form open, in this case while it has unsaved changes. `reason` distinguishes a user action (close button, Escape) from a programmatic close and from the owner being disposed." />
        </p>
        <Example files={code('Events.tsx')} stack>
          <Events />
        </Example>
      </Section>

      <Section anchor="message" title="Message boxes">
        <p>
          <Rich text="`messageBox` shows a modal message with buttons and resolves with the result of the button pressed. `confirm` asks OK or Cancel and resolves to `true` or `false`. Caution and danger boxes are alert dialogs, and a danger box starts on its safe button." />
        </p>
        <Example files={code('MessageBoxes.tsx')}>
          <MessageBoxes />
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
          <Rich text="The title bar buttons and the `ok`, `cancel`, `yes` and `no` buttons of a message box get their names from `uiLocale.strings`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
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
          <Rich text="Helper functions" />
        </h3>
        <ApiTable head={['Function', 'Returns', 'Description']} rows={HELPERS} />
      </Section>
    </>
  );
}
