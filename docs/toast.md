# Toast

> Feedback · @motifx-community/ui 0.1.0-beta.5

Brief notifications at the edge of the window, with four tones, an optional action such as Undo, a custom duration or none, six positions and a limit on how many appear at once. Show them programmatically, or place a custom region in JSX.

## Import

```tsx
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
```

## Programmatic and declarative use

`toast.show()` and its tone shortcuts return a `Toast` object that you can `close()`, `update()` or await. They use `Toaster.default`, which is created in `document.body` on first use. An application can place its own `Toaster` anywhere in JSX and make it the default.

```tsx
import { reactive } from '@motifx/core';
import { Button, toast, type Toast } from '@motifx-community/ui';

/** Toasts shown programmatically. The returned Toast can be closed and awaited. */
export default function Programmatic() {
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

`tone` sets the glyph, its color, and how screen readers announce the toast: politely for `info` and `success`, and immediately for `caution` and `danger`.

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

`action` adds a button that runs `click` and then closes the toast. Offering Undo is usually better than asking for confirmation first.

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

## Duration and updates

`duration` is 5 seconds by default, and `0` keeps the toast open until it is closed. Every option also accepts a function, and `update()` changes a visible toast and restarts its timer.

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

There are six positions, and start and end follow the reading direction. The newest toast is closest to the edge. A toast's `position` takes precedence over the toaster's.

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

## Custom toaster and max

A `Toaster` is the region toasts appear in. `max` limits how many appear at once in one position, and the rest wait until others close. This one is placed directly in the page, so Tab reaches its toasts after these buttons.

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

| Key | Description |
| --- | --- |
| `F8 (`hotkey`)` | From anywhere on the page, moves focus to the newest toast. Inside a toast, returns focus to where it was. |
| `Tab` | Moves through the toasts and their buttons. The default toaster is the last element on the page, so Tab reaches it after the page content. |
| `Escape` | With focus in a toast, closes it. Focus moves to the next toast, or back to where it came from. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Region` | `<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey. |
| `Read out` | Info and success toasts are announced politely (`role="status"`), and caution and danger toasts immediately (`role="alert"`). `update()` announces the toast again. A live `text` function does not, so a progress number is not read on every change. |
| `Focus` | A toast never takes focus. Each one is a group named by its title and text, and has its own Tab stop, so toasts without buttons can also be reached. |
| `Time` | Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on. |
| `Motion` | It slides in and fades out using the motion tokens. When the user prefers reduced motion, it appears without animation. |

## Localization

The names of the region and the close button come from `uiLocale.strings` (`notifications`, `close`) and update immediately.

```tsx
import { reactive } from '@motifx/core';
import { Button, toast, uiLocale } from '@motifx-community/ui';

/** Switches the names of the region and the close button. */
export default function Localization() {
  const s = reactive({ lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
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

| Hook | Description |
| --- | --- |
| `.mx-toaster` | The region. |
| `.mx-toaster__stack` | A stack at one position. `data-position`. |
| `.mx-toast` | A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`). |
| `.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text` | The parts of the component. |
| `.mx-toast__action, .mx-toast__close` | Its buttons (Button, `sm`). |

### Component tokens

| Token | Description |
| --- | --- |
| `toast.width` | The width of a toast, which never exceeds the window. |
| `toast.inset, toast.slide, toast.slide-inline` | The distance to the window edge, and how far the toast slides in from it (at a corner, also from the side). |
| `toast.buttons-align` | The alignment of the action and close buttons. |
| `toast.stack, toast.surface` | Units: the space between toasts, and the toast with its box per tone (`success`, `caution`, `danger`) and for keyboard focus (`focus`). |
| `toast.stripe, toast.timer` | Optional units: a stripe along the start edge, and a line that shrinks with the remaining time, per tone. |
| `toast.icon, toast.plate, toast.mark` | Units: the tone glyph and a plate behind it, per tone, and the tone's own mark. |
| `toast.title, toast.message, toast.action-room, toast.close-room` | Units: the title, the message and the spacing around the buttons. Their appearance comes from the `action` and `close` places. |

## API reference

### Toast options and props

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Bind<string>` | `''` | The message. |
| `title` | `Bind<string>` | `''` | A bold line above the message. |
| `tone` | `Bind<ToastTone>` | `'info'` | `info`, `success`, `caution` or `danger`, which set the glyph, its color and how screen readers announce the toast. |
| `icon` | `Bind<IconSource \| null>` | The tone glyph | A custom icon, or `null` for none. |
| `duration` | `Bind<number>` | `5000` | The time it stays, in milliseconds. `0` keeps it open until it is closed. |
| `action` | `Bind<ToastAction \| null>` | — | `{ text, click }` adds a button to the toast, such as Undo. It runs `click(toast)` and then closes the toast. |
| `closeButton` | `Bind<boolean>` | `true` | Shows a close button named from `uiLocale`. |
| `position` | `Bind<ToastPosition>` | From the toaster | The stacking position: `top-start`, `top`, `top-end`, `bottom-start`, `bottom` or `bottom-end`. |
| `onClosed` | `(reason) => void` | — | See Events. |

### toast and Toast

| Member | Returns | Description |
| --- | --- | --- |
| `toast.show(options \| Toast)` | `Toast` | Shows a toast on `Toaster.default`. |
| `toast.info / success / caution / danger(text, options?)` | `Toast` | Same as `show`, with the tone already set. |
| `toast.closeAll()` | `void` | Closes every toast on `Toaster.default`. |
| `t.close(reason?)` | `void` | Closes the toast. A closed toast is disposed. |
| `t.update(options)` | `void` | Changes any options, restarts the timer and announces the toast again. |
| `t.closed` | `Promise<ToastCloseReason>` | Resolves when the toast closes, with `timeout`, `button`, `escape`, `action` or `code`. |
| `t.onClosed(fn)` | event | The same information as an event. |
| `t.text, t.tone, …` | read/write, reactive | Every option is also a property that accepts a value or a function. |

### Toaster props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `Bind<ToastPosition>` | `'bottom-end'` | The stacking position, unless a toast specifies its own. |
| `max` | `Bind<number>` | `3` | The number of toasts shown at once in one position. The rest wait their turn. |
| `hotkey` | `Bind<string>` | `'F8'` | Moves focus to the newest toast and back again. Use `''` for none. |
| `pauseOnHover` | `Bind<boolean>` | `true` | Pauses timers while the pointer is over the toasts. Timers always stop while focus is inside them or the page is hidden. |
| `text` | `Bind<string>` | `uiLocale` strings | The name of the region. |

### Toaster members

| Member | Returns | Description |
| --- | --- | --- |
| `Toaster.default` | static, read/write | The toaster used by `toast`, created in `document.body` on first use, or the one you assign. |
| `show, info, success, caution, danger, closeAll` | methods | Same as on `toast`, for this toaster. |
| `focusNewest()` | `boolean` | Moves focus to the newest toast. |
| `toasts` | read-only | The toasts on screen, followed by the waiting ones. |
| `paused` | read-only | Indicates whether the timers are currently paused. |

`enabled`, `visible` and the other shared control properties work on both.

## Feedback

Loading issues…
