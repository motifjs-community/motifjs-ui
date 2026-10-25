import { reactive } from '@motifx/core';
import { Button, enStrings, toast, Toaster, trStrings, uiLocale, type Toast, type ToastPosition, type ToastTone } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const TONES: { tone: ToastTone; text: string }[] = [
  { tone: 'info', text: 'A new version is ready.' },
  { tone: 'success', text: 'Your changes are saved.' },
  { tone: 'caution', text: 'Your session ends in 5 minutes.' },
  { tone: 'danger', text: 'The server did not answer.' },
];

const POSITIONS: ToastPosition[] = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];

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
  ['.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text', 'Its parts.'],
  ['.mx-toast__action, .mx-toast__close', 'Its buttons (Buttons, `sm`).'],
];

const TOKENS = [
  ['toast.width', 'The width of a toast (never wider than the window).'],
  ['toast.inset, toast.gap', 'The distance to the window edge, and between toasts.'],
  ['toast.padding, toast.content-gap, toast.icon-size, toast.title-font-weight', 'Inside a toast.'],
  ['toast.background, toast.border-color, toast.border-width, toast.radius, toast.shadow', 'Its surface.'],
  ['toast.slide', 'How far it slides in from its edge.'],
];

export default function ToastPage() {
  const s = reactive({
    mails: ['Invoice #1042', 'Team lunch on Friday', 'Your order shipped'],
    progress: 0,
    uploading: false,
    max: 2,
    count: 0,
    reason: '',
    lang: 'en',
  });
  let demo: Toaster | null = null;

  const archive = () => {
    const mail = s.mails.shift();
    if (!mail) return;
    toast.info(`“${mail}” archived.`, { action: { text: 'Undo', click: () => s.mails.unshift(mail) } });
  };

  const upload = () => {
    if (s.uploading) return;
    s.uploading = true;
    s.progress = 0;
    const t = toast.show({ title: 'report.pdf', text: () => `Uploading… ${s.progress}%`, duration: 0, closeButton: false });
    const timer = setInterval(() => {
      s.progress = Math.min(100, s.progress + 10);
      if (s.progress < 100) return;
      clearInterval(timer);
      s.uploading = false;
      t.update({ text: 'Uploaded.', tone: 'success', duration: 4000, closeButton: true });
    }, 300);
    void t.closed.then(() => clearInterval(timer));
  };

  const watch = async () => {
    s.reason = 'waiting…';
    const t: Toast = toast.show({ text: 'Close me any way you like.', duration: 3000, action: { text: 'Done' } });
    s.reason = `closed by: ${await t.closed}`;
  };

  return (
    <>
      <p class="lead">
        Short notifications at an edge of the window: four tones, an action such as Undo, a time of their own or none,
        six positions and a limit on how many show at once. Called from code; a region of your own can sit in JSX.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From code and from JSX">
        <p>
          <Rich text="`toast.show()` and its tone shortcuts return the `Toast`, an object you can `close()`, `update()` or await. They use `Toaster.default`, made in `document.body` the first time; an app can put a `Toaster` of its own where it wants it in JSX and make it the default." />
        </p>
        <Example
          code={`
toast.success('Your changes are saved.');
const t = toast.show({ title: 'Export', text: 'Preparing the file…', duration: 0 });
t.close();

// In the app's layout: the region where it belongs in the Tab order.
<Toaster position="top" ref={(t) => (Toaster.default = t)} />
`}
        >
          <Button text="Show a toast" tone="accent" onclick={() => toast.success('Your changes are saved.', { title: 'Saved' })} />
          <Button text="Watch how it closes" variant="outline" onclick={watch} />
          <output class="toast-reason">{() => s.reason}</output>
        </Example>
      </Section>

      <Section anchor="tones" title="Tones">
        <p>
          <Rich text="`tone` sets the glyph, its color, and how a screen reader reads the toast: politely for `info` and `success`, at once for `caution` and `danger`." />
        </p>
        <Example
          code={`
toast.info('A new version is ready.');
toast.success('Your changes are saved.');
toast.caution('Your session ends in 5 minutes.');
toast.danger('The server did not answer.', { title: 'Not sent' });
`}
        >
          {TONES.map(({ tone, text }) => (
            <Button key={tone} text={tone} variant="outline" onclick={() => toast.show({ tone, text })} />
          ))}
        </Example>
      </Section>

      <Section anchor="action" title="Action and Undo">
        <p>
          <Rich text="`action` adds a button; it runs `click`, then closes the toast. Make the undone thing come back, rather than asking first." />
        </p>
        <Example
          code={`
const mail = this.mails.shift();
toast.info(\`“\${mail}” archived.\`, {
  action: { text: 'Undo', click: () => this.mails.unshift(mail) },
});
`}
          stack
        >
          <p class="toast-mails">{() => (s.mails.length ? `Inbox: ${s.mails.join(' · ')}` : 'The inbox is empty.')}</p>
          <div class="docs-flow">
            <Button text="Archive the first" variant="outline" enabled={() => s.mails.length > 0} onclick={archive} />
          </div>
        </Example>
      </Section>

      <Section anchor="duration" title="Duration and update">
        <p>
          <Rich text="`duration` is 5 seconds by default; `0` keeps the toast until it is closed. Every option takes a function too, and `update()` changes a shown toast and starts its time again." />
        </p>
        <Example
          code={`
const t = toast.show({ text: () => \`Uploading… \${this.progress}%\`, duration: 0, closeButton: false });
// … when it is done:
t.update({ text: 'Uploaded.', tone: 'success', duration: 4000, closeButton: true });
`}
        >
          <Button text="Upload a file" variant="outline" enabled={() => !s.uploading} onclick={upload} />
          <Button text="A toast that stays" variant="outline" onclick={() => toast.caution('This one stays until you close it.', { duration: 0 })} />
          <Button text="Close all" variant="ghost" onclick={() => toast.closeAll()} />
        </Example>
      </Section>

      <Section anchor="positions" title="Positions">
        <p>
          <Rich text="Six positions; start and end follow the reading direction. The newest toast is nearest the edge. A toast's `position` beats its toaster's." />
        </p>
        <Example
          code={`
toast.info('Up here', { position: 'top' });
`}
        >
          {POSITIONS.map((position) => (
            <Button key={position} text={position} size="sm" variant="outline" onclick={() => toast.info(`At ${position}.`, { position })} />
          ))}
        </Example>
      </Section>

      <Section anchor="toaster" title="A toaster of your own, and max">
        <p>
          <Rich text="A `Toaster` is the region the toasts show in. `max` limits how many show at once at one position; the rest wait and come in as others close. This one sits right here in the page, so Tab reaches its toasts after these buttons." />
        </p>
        <Example
          code={`
<Toaster ref={(t) => (this.uploads = t)} position="top-start" max={() => this.max} text="Upload notifications" />

this.uploads.show({ text: 'photo.jpg is uploaded.', tone: 'success' });
`}
        >
          <Toaster ref={(t: Toaster) => (demo = t)} position="top-start" max={() => s.max} text="Demo notifications" />
          <div class="docs-flow" role="group" aria-label="Max">
            {[1, 2, 3].map((max) => (
              <Button
                key={max}
                text={`max ${max}`}
                size="sm"
                variant={() => (s.max === max ? 'solid' : 'ghost')}
                aria-pressed={() => s.max === max}
                onclick={() => (s.max = max)}
              />
            ))}
          </div>
          <Button
            text="Add five"
            variant="outline"
            onclick={() => {
              for (let i = 0; i < 5; i++) demo?.success(`photo-${++s.count}.jpg is uploaded.`, { duration: 3000 });
            }}
          />
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
          <Rich text="The name of the region and of the close button come from `uiLocale.strings` (`notifications`, `close`) and follow a change at once." />
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
          <Button text="Show a toast" variant="outline" onclick={() => toast.info(s.lang === 'en' ? 'Hello.' : 'Merhaba.')} />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Toast options and props</h3>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={OPTIONS} />
        <h3>toast and Toast</h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={TOAST_API} />
        <h3>Toaster props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={TOASTER_PROPS} />
        <h3>Toaster members</h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={TOASTER_API} />
        <p>
          <Rich text="`enabled`, `visible` and the other shared properties of every control work on both." />
        </p>
      </Section>
    </>
  );
}
