import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DurationAndUpdate from './examples/DurationAndUpdate';
import Programmatic from './examples/Programmatic';
import Localization from './examples/Localization';
import OwnToaster from './examples/OwnToaster';
import Positions from './examples/Positions';
import Tones from './examples/Tones';
import Undo from './examples/Undo';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const OPTIONS = [
  ['text', '`Bind<string>`', "`''`", 'The message.'],
  ['title', '`Bind<string>`', "`''`", 'A bold line above the message.'],
  ['tone', '`Bind<ToastTone>`', "`'info'`", '`info`, `success`, `caution` or `danger`, which set the glyph, its color and how screen readers announce the toast.'],
  ['icon', '`Bind<IconSource | null>`', 'The tone glyph', 'A custom icon, or `null` for none.'],
  ['duration', '`Bind<number>`', '`5000`', 'The time it stays, in milliseconds. `0` keeps it open until it is closed.'],
  ['action', '`Bind<ToastAction | null>`', '—', '`{ text, click }` adds a button to the toast, such as Undo. It runs `click(toast)` and then closes the toast.'],
  ['closeButton', '`Bind<boolean>`', '`true`', 'Shows a close button named from `uiLocale`.'],
  ['position', '`Bind<ToastPosition>`', "From the toaster", 'The stacking position: `top-start`, `top`, `top-end`, `bottom-start`, `bottom` or `bottom-end`.'],
  ['onClosed', '`(reason) => void`', '—', 'See Events.'],
];

const TOAST_API = [
  ['toast.show(options | Toast)', '`Toast`', 'Shows a toast on `Toaster.default`.'],
  ['toast.info / success / caution / danger(text, options?)', '`Toast`', 'Same as `show`, with the tone already set.'],
  ['toast.closeAll()', '`void`', 'Closes every toast on `Toaster.default`.'],
  ['t.close(reason?)', '`void`', 'Closes the toast. A closed toast is disposed.'],
  ['t.update(options)', '`void`', 'Changes any options, restarts the timer and announces the toast again.'],
  ['t.closed', '`Promise<ToastCloseReason>`', 'Resolves when the toast closes, with `timeout`, `button`, `escape`, `action` or `code`.'],
  ['t.onClosed(fn)', 'event', 'The same information as an event.'],
  ['t.text, t.tone, …', 'read/write, reactive', 'Every option is also a property that accepts a value or a function.'],
];

const TOASTER_PROPS = [
  ['position', '`Bind<ToastPosition>`', "`'bottom-end'`", 'The stacking position, unless a toast specifies its own.'],
  ['max', '`Bind<number>`', '`3`', 'The number of toasts shown at once in one position. The rest wait their turn.'],
  ['hotkey', '`Bind<string>`', "`'F8'`", 'Moves focus to the newest toast and back again. Use `\'\'` for none.'],
  ['pauseOnHover', '`Bind<boolean>`', '`true`', 'Pauses timers while the pointer is over the toasts. Timers always stop while focus is inside them or the page is hidden.'],
  ['text', '`Bind<string>`', '`uiLocale` strings', 'The name of the region.'],
];

const TOASTER_API = [
  ['Toaster.default', 'static, read/write', 'The toaster used by `toast`, created in `document.body` on first use, or the one you assign.'],
  ['show, info, success, caution, danger, closeAll', 'methods', 'Same as on `toast`, for this toaster.'],
  ['focusNewest()', '`boolean`', 'Moves focus to the newest toast.'],
  ['toasts', 'read-only', 'The toasts on screen, followed by the waiting ones.'],
  ['paused', 'read-only', 'Indicates whether the timers are currently paused.'],
];

const KEYS = [
  ['F8 (`hotkey`)', 'From anywhere on the page, moves focus to the newest toast. Inside a toast, returns focus to where it was.'],
  ['Tab', 'Moves through the toasts and their buttons. The default toaster is the last element on the page, so Tab reaches it after the page content.'],
  ['Escape', 'With focus in a toast, closes it. Focus moves to the next toast, or back to where it came from.'],
];

const A11Y = [
  ['Region', '`<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey.'],
  ['Read out', 'Info and success toasts are announced politely (`role="status"`), and caution and danger toasts immediately (`role="alert"`). `update()` announces the toast again. A live `text` function does not, so a progress number is not read on every change.'],
  ['Focus', 'A toast never takes focus. Each one is a group named by its title and text, and has its own Tab stop, so toasts without buttons can also be reached.'],
  ['Time', 'Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on.'],
  ['Motion', 'It slides in and fades out using the motion tokens. When the user prefers reduced motion, it appears without animation.'],
];

const HOOKS = [
  ['.mx-toaster', 'The region.'],
  ['.mx-toaster__stack', 'A stack at one position. `data-position`.'],
  ['.mx-toast', 'A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`).'],
  ['.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text', 'The parts of the component.'],
  ['.mx-toast__action, .mx-toast__close', 'Its buttons (Button, `sm`).'],
];

const TOKENS = [
  ['toast.width', 'The width of a toast, which never exceeds the window.'],
  ['toast.inset, toast.slide, toast.slide-inline', 'The distance to the window edge, and how far the toast slides in from it (at a corner, also from the side).'],
  ['toast.buttons-align', 'The alignment of the action and close buttons.'],
  ['toast.stack, toast.surface', 'Units: the space between toasts, and the toast with its box per tone (`success`, `caution`, `danger`) and for keyboard focus (`focus`).'],
  ['toast.stripe, toast.timer', 'Optional units: a stripe along the start edge, and a line that shrinks with the remaining time, per tone.'],
  ['toast.icon, toast.plate, toast.mark', 'Units: the tone glyph and a plate behind it, per tone, and the tone\'s own mark.'],
  ['toast.title, toast.message, toast.action-room, toast.close-room', 'Units: the title, the message and the spacing around the buttons. Their appearance comes from the `action` and `close` places.'],
];

export default function ToastPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Brief notifications at the edge of the window, with four tones, an optional action such as Undo, a custom duration or none, six positions and a limit on how many appear at once. Show them programmatically, or place a custom region in JSX." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Programmatic and declarative use">
        <p>
          <Rich text="`toast.show()` and its tone shortcuts return a `Toast` object that you can `close()`, `update()` or await. They use `Toaster.default`, which is created in `document.body` on first use. An application can place its own `Toaster` anywhere in JSX and make it the default." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <p>
          <Rich text="`tone` sets the glyph, its color, and how screen readers announce the toast: politely for `info` and `success`, and immediately for `caution` and `danger`." />
        </p>
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="action" title="Action and Undo">
        <p>
          <Rich text="`action` adds a button that runs `click` and then closes the toast. Offering Undo is usually better than asking for confirmation first." />
        </p>
        <Example files={code('Undo.tsx')} stack>
          <Undo />
        </Example>
      </Section>

      <Section anchor="duration" title="Duration and updates">
        <p>
          <Rich text="`duration` is 5 seconds by default, and `0` keeps the toast open until it is closed. Every option also accepts a function, and `update()` changes a visible toast and restarts its timer." />
        </p>
        <Example files={code('DurationAndUpdate.tsx')}>
          <DurationAndUpdate />
        </Example>
      </Section>

      <Section anchor="positions" title="Positions">
        <p>
          <Rich text="There are six positions, and start and end follow the reading direction. The newest toast is closest to the edge. A toast's `position` takes precedence over the toaster's." />
        </p>
        <Example files={code('Positions.tsx')}>
          <Positions />
        </Example>
      </Section>

      <Section anchor="toaster" title="Custom toaster and max">
        <p>
          <Rich text="A `Toaster` is the region toasts appear in. `max` limits how many appear at once in one position, and the rest wait until others close. This one is placed directly in the page, so Tab reaches its toasts after these buttons." />
        </p>
        <Example files={code('OwnToaster.tsx')}>
          <OwnToaster />
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
          <Rich text="The names of the region and the close button come from `uiLocale.strings` (`notifications`, `close`) and update immediately." />
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
          <Rich text="Toast options and props" />
        </h3>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={OPTIONS} />
        <h3>
          <Rich text="toast and Toast" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={TOAST_API} />
        <h3>
          <Rich text="Toaster props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TOASTER_PROPS} />
        <h3>
          <Rich text="Toaster members" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={TOASTER_API} />
        <p>
          <Rich text="`enabled`, `visible` and the other shared control properties work on both." />
        </p>
      </Section>
    </>
  );
}
