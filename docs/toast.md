# Toast

> Feedback · @motifx-community/ui 0.1.0-beta.0

Short notifications at an edge of the window: four tones, an action such as Undo, a time of their own or none, six positions and a limit on how many show at once. Called from code; a region of your own can sit in JSX.

## Import

```tsx
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
```

## From code and from JSX

`toast.show()` and its tone shortcuts return the `Toast`, an object you can `close()`, `update()` or await. They use `Toaster.default`, made in `document.body` the first time; an app can put a `Toaster` of its own where it wants it in JSX and make it the default.

```tsx
import { reactive } from '@motifx/core';
import { Button, toast, type Toast } from '@motifx-community/ui';

/** Toasts shown from code: the Toast that comes back can be closed and awaited. */
export default function FromCode() {
  const s = reactive({ reason: '' });

  const exportFile = () => {
    const t = toast.show({ title: 'Export', text: 'Preparing the file…', duration: 0 });
    setTimeout(() => t.close(), 2000);
  };

  const watch = async () => {
    s.reason = 'waiting…';
    const t: Toast = toast.show({ text: 'Close me any way you like.', duration: 3000, action: { text: 'Done' } });
    s.reason = `closed by: ${await t.closed}`;
  };

  return (
    <>
      <Button text="Show a toast" tone="accent" onclick={() => toast.success('Your changes are saved.', { title: 'Saved' })} />
      <Button text="Export" variant="outline" onclick={exportFile} />
      <Button text="Watch how it closes" variant="outline" onclick={watch} />
      <output class="toast-reason">{() => s.reason}</output>
    </>
  );
}
```

## Tones

`tone` sets the glyph, its color, and how a screen reader reads the toast: politely for `info` and `success`, at once for `caution` and `danger`.

```tsx
import { Button, toast, type ToastTone } from '@motifx-community/ui';

const TONES: { tone: ToastTone; text: string }[] = [
  { tone: 'info', text: 'A new version is ready.' },
  { tone: 'success', text: 'Your changes are saved.' },
  { tone: 'caution', text: 'Your session ends in 5 minutes.' },
  { tone: 'danger', text: 'The server did not answer.' },
];

/** A toast in each of the four tones. */
export default function Tones() {
  return (
    <>
      {TONES.map(({ tone, text }) => (
        <Button key={tone} text={tone} variant="outline" onclick={() => toast.show({ tone, text })} />
      ))}
    </>
  );
}
```

## Action and Undo

`action` adds a button; it runs `click`, then closes the toast. Make the undone thing come back, rather than asking first.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, toast } from '@motifx-community/ui';

/** Archiving a mail at once, with an Undo button in the toast that brings it back. */
export default function Undo() {
  const s = reactive({ mails: ['Invoice #1042', 'Team lunch on Friday', 'Your order shipped'] });

  const archive = () => {
    const mail = s.mails.shift();
    if (!mail) return;
    toast.info(`“${mail}” archived.`, { action: { text: 'Undo', click: () => s.mails.unshift(mail) } });
  };

  return (
    <>
      <p class="toast-mails">{() => (s.mails.length ? `Inbox: ${s.mails.join(' · ')}` : 'The inbox is empty.')}</p>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Archive the first" variant="outline" enabled={() => s.mails.length > 0} onclick={archive} />
      </Stack>
    </>
  );
}
```

## Duration and update

`duration` is 5 seconds by default; `0` keeps the toast until it is closed. Every option takes a function too, and `update()` changes a shown toast and starts its time again.

```tsx
import { reactive } from '@motifx/core';
import { Button, toast } from '@motifx-community/ui';

/** A toast with a live text that stays until the upload ends, then turns into a success; one that stays. */
export default function DurationAndUpdate() {
  const s = reactive({ progress: 0, uploading: false });

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

  return (
    <>
      <Button text="Upload a file" variant="outline" enabled={() => !s.uploading} onclick={upload} />
      <Button text="A toast that stays" variant="outline" onclick={() => toast.caution('This one stays until you close it.', { duration: 0 })} />
      <Button text="Close all" variant="ghost" onclick={() => toast.closeAll()} />
    </>
  );
}
```

## Positions

Six positions; start and end follow the reading direction. The newest toast is nearest the edge. A toast's `position` beats its toaster's.

```tsx
import { Button, toast, type ToastPosition } from '@motifx-community/ui';

const POSITIONS: ToastPosition[] = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];

/** A toast at each of the six positions. */
export default function Positions() {
  return (
    <>
      {POSITIONS.map((position) => (
        <Button key={position} text={position} size="sm" variant="outline" onclick={() => toast.info(`At ${position}.`, { position })} />
      ))}
    </>
  );
}
```

## A toaster of your own, and max

A `Toaster` is the region the toasts show in. `max` limits how many show at once at one position; the rest wait and come in as others close. This one sits right here in the page, so Tab reaches its toasts after these buttons.

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Toaster } from '@motifx-community/ui';

/** A toaster placed in the page, showing at most `max` toasts at once. */
export default function OwnToaster() {
  const s = reactive({ max: 2, count: 0 });
  let uploads: Toaster | null = null;

  const addFive = () => {
    for (let i = 0; i < 5; i++) uploads?.success(`photo-${++s.count}.jpg is uploaded.`, { duration: 3000 });
  };

  return (
    <>
      <Toaster ref={(t: Toaster) => (uploads = t)} position="top-start" max={() => s.max} text="Demo notifications" />
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Max">
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
      </Stack>
      <Button text="Add five" variant="outline" onclick={addFive} />
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `F8 (`hotkey`)` | From anywhere on the page: to the newest toast. In a toast: back to where focus was. |
| `Tab` | Through the toasts and their buttons. The default toaster is the last thing in the page, so Tab reaches it after the page content. |
| `Escape` | With focus in a toast: closes it. Focus goes to the next toast, or back to where it came from. |

## Accessibility

| Topic | How |
| --- | --- |
| `Region` | `<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey. |
| `Read out` | Info and success toasts are read politely (`role="status"`), caution and danger at once (`role="alert"`). `update()` reads it again; a live `text` function does not, so a progress number is not read on every change. |
| `Focus` | A toast never takes focus. Each toast is a group named by its title and text, and a Tab stop of its own, so one without buttons can be reached too. |
| `Time` | Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on. |
| `Motion` | It slides in and fades out with the motion tokens; with reduced motion it just appears. |

## Localization

The name of the region and of the close button come from `uiLocale.strings` (`notifications`, `close`) and follow a change at once.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, toast, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the names of the region and the close button. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Show a toast" variant="outline" onclick={() => toast.info(s.lang === 'en' ? 'Hello.' : 'Merhaba.')} />
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-toaster` | The region. |
| `.mx-toaster__stack` | A stack at one position. `data-position`. |
| `.mx-toast` | A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`). |
| `.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text` | Its parts. |
| `.mx-toast__action, .mx-toast__close` | Its buttons (Buttons, `sm`). |

### Component tokens

| Token | What it sets |
| --- | --- |
| `toast.width` | The width of a toast (never wider than the window). |
| `toast.inset, toast.slide, toast.slide-inline` | The distance to the window edge; how far it slides in from its edge (at a corner, also from its side). |
| `toast.buttons-align` | Where the action and close buttons sit across the toast. |
| `toast.stack, toast.surface` | Units: the space between toasts; the toast with its box per tone (`success`, `caution`, `danger`) and under the keys (`focus`). |
| `toast.stripe, toast.timer` | Units a design may show: a stripe along the start edge, and a line that runs out with the time the toast stays; per tone. |
| `toast.icon, toast.plate, toast.mark` | Units: the tone glyph and a plate behind it, per tone; the tone’s own mark. |
| `toast.title, toast.message, toast.action-room, toast.close-room` | Units: the title, the message and the room around the buttons (their look is the `action` and `close` places’). |

## API reference

### Toast options and props

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The message. |
| `title` | `Bind<string>` | `''` | A bold line above it. |
| `tone` | `Bind<ToastTone>` | `'info'` | `info`, `success`, `caution`, `danger`: the glyph, its color, and how a screen reader reads it. |
| `icon` | `Bind<IconSource \| null>` | the tone glyph | An icon of your own; `null` for none. |
| `duration` | `Bind<number>` | `5000` | Milliseconds it stays; `0` keeps it until it is closed. |
| `action` | `Bind<ToastAction \| null>` | — | `{ text, click }`: a button in the toast, such as Undo. It runs `click(toast)`, then closes the toast. |
| `closeButton` | `Bind<boolean>` | `true` | A close button, named from `uiLocale`. |
| `position` | `Bind<ToastPosition>` | the toaster's | Where it stacks: `top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`. |
| `onClosed` | `(reason) => void` | — | See the events. |

### toast and Toast

| Member | Returns | Description |
| --- | --- | --- |
| `toast.show(options \| Toast)` | `Toast` | Shows a toast on `Toaster.default`. |
| `toast.info / success / caution / danger(text, options?)` | `Toast` | The same with the tone set. |
| `toast.closeAll()` | `void` | Closes every toast of `Toaster.default`. |
| `t.close(reason?)` | `void` | Closes it; a closed toast is disposed. |
| `t.update(options)` | `void` | Changes any of the options, starts its time again and reads it out again. |
| `t.closed` | `Promise<ToastCloseReason>` | Settles when it closes: `timeout`, `button`, `escape`, `action` or `code`. |
| `t.onClosed(fn)` | event | The same as an event. |
| `t.text, t.tone, …` | read/write, reactive | Every option is a property too, taking a value or a function. |

### Toaster props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `Bind<ToastPosition>` | `'bottom-end'` | Where its toasts stack unless a toast says otherwise. |
| `max` | `Bind<number>` | `3` | How many show at once at one position; the rest wait their turn. |
| `hotkey` | `Bind<string>` | `'F8'` | Moves focus to the newest toast, and back again; `''` for none. |
| `pauseOnHover` | `Bind<boolean>` | `true` | Timers stop while the pointer is over the toasts. They always stop while focus is in them or the page is hidden. |
| `text` | `Bind<string>` | `uiLocale` notifications | The name of the region. |

### Toaster members

| Member | Returns | Description |
| --- | --- | --- |
| `Toaster.default` | static, read/write | The toaster `toast` uses: made in `document.body` on first use, or the one you assign. |
| `show, info, success, caution, danger, closeAll` | methods | As on `toast`, for this toaster. |
| `focusNewest()` | `boolean` | Moves focus to the newest toast. |
| `toasts` | read-only | The toasts on the screen, then the waiting ones. |
| `paused` | read-only | Whether the timers are stopped now. |

`enabled`, `visible` and the other shared properties of every control work on both.
