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
  ['title', '`Bind<string>`', "`''`", 'A bold line above it.'],
  ['tone', '`Bind<ToastTone>`', "`'info'`", '`info`, `success`, `caution`, `danger`: the glyph, its color, and how a screen reader reads it.'],
  ['icon', '`Bind<IconSource | null>`', 'the tone glyph', 'An icon of your own; `null` for none.'],
  ['duration', '`Bind<number>`', '`5000`', 'Milliseconds it stays; `0` keeps it until it is closed.'],
  ['action', '`Bind<ToastAction | null>`', '—', '`{ text, click }`: a button in the toast, such as Undo. It runs `click(toast)`, then closes the toast.'],
  ['closeButton', '`Bind<boolean>`', '`true`', 'A close button, named from `uiLocale`.'],
  ['position', '`Bind<ToastPosition>`', "the toaster's", 'Where it stacks: `top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`.'],
  ['onClosed', '`(reason) => void`', '—', 'See the events.'],
];

const TOAST_API = [
  ['toast.show(options | Toast)', '`Toast`', 'Shows a toast on `Toaster.default`.'],
  ['toast.info / success / caution / danger(text, options?)', '`Toast`', 'The same with the tone set.'],
  ['toast.closeAll()', '`void`', 'Closes every toast of `Toaster.default`.'],
  ['t.close(reason?)', '`void`', 'Closes it; a closed toast is disposed.'],
  ['t.update(options)', '`void`', 'Changes any of the options, starts its time again and reads it out again.'],
  ['t.closed', '`Promise<ToastCloseReason>`', 'Settles when it closes: `timeout`, `button`, `escape`, `action` or `code`.'],
  ['t.onClosed(fn)', 'event', 'The same as an event.'],
  ['t.text, t.tone, …', 'read/write, reactive', 'Every option is a property too, taking a value or a function.'],
];

const TOASTER_PROPS = [
  ['position', '`Bind<ToastPosition>`', "`'bottom-end'`", 'Where its toasts stack unless a toast says otherwise.'],
  ['max', '`Bind<number>`', '`3`', 'How many show at once at one position; the rest wait their turn.'],
  ['hotkey', '`Bind<string>`', "`'F8'`", 'Moves focus to the newest toast, and back again; `\'\'` for none.'],
  ['pauseOnHover', '`Bind<boolean>`', '`true`', 'Timers stop while the pointer is over the toasts. They always stop while focus is in them or the page is hidden.'],
  ['text', '`Bind<string>`', '`uiLocale` notifications', 'The name of the region.'],
];

const TOASTER_API = [
  ['Toaster.default', 'static, read/write', 'The toaster `toast` uses: made in `document.body` on first use, or the one you assign.'],
  ['show, info, success, caution, danger, closeAll', 'methods', 'As on `toast`, for this toaster.'],
  ['focusNewest()', '`boolean`', 'Moves focus to the newest toast.'],
  ['toasts', 'read-only', 'The toasts on the screen, then the waiting ones.'],
  ['paused', 'read-only', 'Whether the timers are stopped now.'],
];

const KEYS = [
  ['F8 (`hotkey`)', 'From anywhere on the page: to the newest toast. In a toast: back to where focus was.'],
  ['Tab', 'Through the toasts and their buttons. The default toaster is the last thing in the page, so Tab reaches it after the page content.'],
  ['Escape', 'With focus in a toast: closes it. Focus goes to the next toast, or back to where it came from.'],
];

const A11Y = [
  ['Region', '`<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey.'],
  ['Read out', 'Info and success toasts are read politely (`role="status"`), caution and danger at once (`role="alert"`). `update()` reads it again; a live `text` function does not, so a progress number is not read on every change.'],
  ['Focus', 'A toast never takes focus. Each toast is a group named by its title and text, and a Tab stop of its own, so one without buttons can be reached too.'],
  ['Time', 'Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on.'],
  ['Motion', 'It slides in and fades out with the motion tokens; with reduced motion it just appears.'],
];

const HOOKS = [
  ['.mx-toaster', 'The region.'],
  ['.mx-toaster__stack', 'A stack at one position. `data-position`.'],
  ['.mx-toast', 'A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`).'],
  ['.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text', 'The parts of the component.'],
  ['.mx-toast__action, .mx-toast__close', 'Its buttons (Buttons, `sm`).'],
];

const TOKENS = [
  ['toast.width', 'The width of a toast (never wider than the window).'],
  ['toast.inset, toast.slide, toast.slide-inline', 'The distance to the window edge; how far it slides in from its edge (at a corner, also from its side).'],
  ['toast.buttons-align', 'Where the action and close buttons sit across the toast.'],
  ['toast.stack, toast.surface', 'Units: the space between toasts; the toast with its box per tone (`success`, `caution`, `danger`) and under the keys (`focus`).'],
  ['toast.stripe, toast.timer', 'Units a design may show: a stripe along the start edge, and a line that runs out with the time the toast stays; per tone.'],
  ['toast.icon, toast.plate, toast.mark', 'Units: the tone glyph and a plate behind it, per tone; the tone’s own mark.'],
  ['toast.title, toast.message, toast.action-room, toast.close-room', 'Units: the title, the message and the room around the buttons (their look is the `action` and `close` places’).'],
];

export default function ToastPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Short notifications at an edge of the window: four tones, an action such as Undo, a time of their own or none, six positions and a limit on how many show at once. Called programmatically; a region of your own can sit in JSX." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Programmatic and declarative">
        <p>
          <Rich text="`toast.show()` and its tone shortcuts return the `Toast`, an object you can `close()`, `update()` or await. They use `Toaster.default`, made in `document.body` the first time; an app can put a `Toaster` of its own where it wants it in JSX and make it the default." />
        </p>
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <p>
          <Rich text="`tone` sets the glyph, its color, and how a screen reader reads the toast: politely for `info` and `success`, at once for `caution` and `danger`." />
        </p>
        <Example files={code('Tones.tsx')}>
          <Tones />
        </Example>
      </Section>

      <Section anchor="action" title="Action and Undo">
        <p>
          <Rich text="`action` adds a button; it runs `click`, then closes the toast. Make the undone thing come back, rather than asking first." />
        </p>
        <Example files={code('Undo.tsx')} stack>
          <Undo />
        </Example>
      </Section>

      <Section anchor="duration" title="Duration and update">
        <p>
          <Rich text="`duration` is 5 seconds by default; `0` keeps the toast until it is closed. Every option takes a function too, and `update()` changes a shown toast and starts its time again." />
        </p>
        <Example files={code('DurationAndUpdate.tsx')}>
          <DurationAndUpdate />
        </Example>
      </Section>

      <Section anchor="positions" title="Positions">
        <p>
          <Rich text="Six positions; start and end follow the reading direction. The newest toast is nearest the edge. A toast's `position` beats its toaster's." />
        </p>
        <Example files={code('Positions.tsx')}>
          <Positions />
        </Example>
      </Section>

      <Section anchor="toaster" title="A toaster of your own, and max">
        <p>
          <Rich text="A `Toaster` is the region the toasts show in. `max` limits how many show at once at one position; the rest wait and come in as others close. This one sits right here in the page, so Tab reaches its toasts after these buttons." />
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
          <Rich text="The name of the region and of the close button come from `uiLocale.strings` (`notifications`, `close`) and follow a change at once." />
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
          <Rich text="`enabled`, `visible` and the other shared properties of every control work on both." />
        </p>
      </Section>
    </>
  );
}
