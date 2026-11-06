# Tooltip

> Feedback · @motifx-community/ui 0.1.0-beta.3

A short description shown next to an element: after the pointer rests on it, when it gets keyboard focus, or programmatically. It can be hovered, Escape hides it, and one is open at a time on the page.

## Import

```tsx
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
```

## Declarative and programmatic

In JSX a tooltip is placed anywhere and pointed at its `target`; where it sits does not matter. Programmatically, `new Tooltip({ target, text })` needs nothing else: it puts itself into the page when it first shows, and goes when its target component does.

```tsx
import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip from JSX pointed at its target, and one created with `new` and opened programmatically. */
export default function Programmatic() {
  let save: Button | null = null;
  let target: Button | null = null;
  let tip: Tooltip | null = null;
  let opened = 0;

  const openProgrammatic = () => {
    if (!target) return;
    if (!tip) {
      tip = new Tooltip({ target });
      tip.placement = 'end';
    }
    tip.text = `Made programmatically, opened ${++opened} time(s)`;
    tip.open();
  };

  return (
    <>
      <Button ref={(b: Button) => (save = b)} text="Save" tone="accent" />
      <Tooltip target={() => save} text="Save the file (Ctrl+S)" />
      <Button ref={(b: Button) => (target = b)} text="Target" variant="outline" />
      <Button text="Open a tooltip programmatically" variant="outline" onclick={openProgrammatic} />
    </>
  );
}
```

## Icon-only buttons

A button with only an icon needs its own name (`aria-label`); the tooltip shows it to sighted users and adds the shortcut as a description. Moving from one button to the next shows the next tooltip at once.

```tsx
import { Button, Stack, Tooltip } from '@motifx-community/ui';

const BoldIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
);

const ItalicIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M7 2.5h5M4 13.5h5M9.5 2.5l-3 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

/** Icon-only buttons named with aria-label; the tooltips show the name and the shortcut. */
export default function IconButtons() {
  let bold: Button | null = null;
  let italic: Button | null = null;
  let link: Button | null = null;
  return (
    <Stack orientation="horizontal" wrap align="center" role="toolbar" aria-label="Text style">
      <Button ref={(b: Button) => (bold = b)} icon={() => <BoldIcon />} variant="ghost" aria-label="Bold" />
      <Button ref={(b: Button) => (italic = b)} icon={() => <ItalicIcon />} variant="ghost" aria-label="Italic" />
      <Button ref={(b: Button) => (link = b)} icon={() => <LinkIcon />} variant="ghost" aria-label="Link" />
      <Tooltip target={() => bold} text="Bold (Ctrl+B)" />
      <Tooltip target={() => italic} text="Italic (Ctrl+I)" />
      <Tooltip target={() => link} text="Insert a link (Ctrl+K)" />
    </Stack>
  );
}
```

## On a field

On a TextBox the whole field shows it on hover, and its input is described by it while it shows, also on keyboard focus.

```tsx
import { reactive } from '@motifx/core';
import { TextBox, Tooltip } from '@motifx-community/ui';

/** A tooltip on a TextBox: the field shows it on hover, its input is described by it. */
export default function OnField() {
  const s = reactive({ email: '' });
  let email: TextBox | null = null;
  return (
    <>
      <TextBox ref={(b: TextBox) => (email = b)} label="Email" type="email" x-model={() => s.email} />
      <Tooltip target={() => email} text="We send the receipt here." placement="end" />
    </>
  );
}
```

## Placement

`top` by default. It opens on the other side when there is no room, and `start` / `end` follow the reading direction (try the RTL switch at the top).

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Tooltip, type PopupPlacement } from '@motifx-community/ui';

const PLACEMENTS: PopupPlacement[] = ['top', 'bottom', 'start', 'end', 'top-start', 'bottom-end'];

/** The side the tooltip opens on, picked from the buttons. */
export default function Placement() {
  const s = reactive({ placement: 'top' as PopupPlacement });
  let target: Button | null = null;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">
        {PLACEMENTS.map((placement) => (
          <Button
            key={placement}
            text={placement}
            size="sm"
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}
            aria-pressed={() => s.placement === placement}
            onclick={() => (s.placement = placement)}
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button ref={(b: Button) => (target = b)} text="Hover or focus me" variant="outline" />
        <Tooltip target={() => target} text={() => `Opens at ${s.placement}`} placement={() => s.placement} />
      </Stack>
    </>
  );
}
```

## Delay

The pointer rests `delay` milliseconds on the target before it shows (500 by default); `hideDelay` keeps it a moment after the pointer leaves. Right after one closed, the next shows at once (`Tooltip.skipDelay`).

```tsx
import { Button, Tooltip } from '@motifx-community/ui';

const DELAYS = [0, 500, 1500];

/** Three tooltips that wait a different time before they show. */
export default function Delay() {
  const targets: Button[] = [];
  return (
    <>
      {DELAYS.map((delay, i) => (
        <span key={delay}>
          <Button ref={(b: Button) => (targets[i] = b)} text={`delay ${delay}`} variant="outline" />
          <Tooltip target={() => targets[i]} text={`Shown after ${delay} ms`} delay={delay} />
        </span>
      ))}
    </>
  );
}
```

## Rich content

JSX children or `content` (any component) come after the text. Keep it short and never put buttons or links in it: a tooltip cannot take focus.

```tsx
import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip with markup after its text, given as JSX children. */
export default function RichContent() {
  let target: Button | null = null;
  return (
    <>
      <Button ref={(b: Button) => (target = b)} text="Rich tooltip" variant="outline" />
      <Tooltip target={() => target}>
        <strong>Bold</strong> makes the selection stand out. <kbd>Ctrl</kbd>+<kbd>B</kbd>
      </Tooltip>
    </>
  );
}
```

## When it shows

`showOn` picks what shows it: `hover-focus` (default), `focus` (keyboard focus only) or `manual` (only `open()` / `opened`). `enabled` turns a tooltip off.

```tsx
import { reactive } from '@motifx/core';
import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip opened only programmatically, and one shown on keyboard focus while a toggle allows it. */
export default function ShowOn() {
  const s = reactive({ on: true });
  let help: Button | null = null;
  let tip: Tooltip | null = null;
  let keyboardOnly: Button | null = null;
  return (
    <>
      <Button ref={(b: Button) => (help = b)} text="Help" variant="outline" />
      <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => help} text="Shown programmatically" showOn="manual" placement="bottom" />
      <Button text={() => (tip?.opened ? 'Hide it' : 'Show it')} onclick={() => tip && (tip.opened = !tip.opened)} />
      <Button text={() => (s.on ? 'Tooltips on' : 'Tooltips off')} toggle x-model={() => s.on} variant="ghost" />
      <Button ref={(b: Button) => (keyboardOnly = b)} text="Keyboard only" variant="outline" />
      <Tooltip target={() => keyboardOnly} text="Shown on keyboard focus, while the toggle is on" enabled={() => s.on} showOn="focus" />
    </>
  );
}
```

## Many elements

`addTooltip(target, text)` gives an element a tooltip that is made only when it is first needed; every tooltip on the page shares one set of document listeners, so hundreds of them cost next to nothing. It returns the function that removes it.

```tsx
import { addTooltip, Button, Stack } from '@motifx-community/ui';

const SEATS = ['1', '2', '3', '4', '5', '6'].flatMap((row) =>
  ['A', 'B', 'C', 'D'].map((letter) => ({
    id: `${row}${letter}`,
    note: `Row ${row}, seat ${letter}: ${letter === 'A' || letter === 'D' ? 'window' : 'aisle'}${row === '1' ? ', extra legroom' : ''}`,
  })),
);

/** A tooltip on each of 24 seats, made only when first needed, and one that is removed programmatically. */
export default function ManyElements() {
  let removeGuideTip = () => {};
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Seats">
        {SEATS.map((seat) => (
          <Button
            key={seat.id}
            ref={(b: Button) => {
              addTooltip(b, seat.note);
            }}
            text={seat.id}
            size="sm"
            variant="outline"
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button
          ref={(b: Button) => (removeGuideTip = addTooltip(b, { text: 'Opens the guide', placement: 'end' }))}
          text="Guide"
          variant="outline"
        />
        <Button text="Remove the guide's tooltip" variant="ghost" onclick={() => removeGuideTip()} />
      </Stack>
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab (focus on the target)` | Shows it at once; leaving the target hides it. |
| `Escape` | Hides it; focus stays where it is. Only the tooltip closes, not the window around it. |

## Accessibility

| Topic | How |
| --- | --- |
| `Role` | `role="tooltip"`, one element per tooltip. |
| `Description` | While it is shown the target (its focusable part, e.g. the input of a TextBox) has `aria-describedby` pointing to it, next to its own descriptions. |
| `Focus` | It never takes focus and holds nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`). |
| `WCAG 1.4.13` | Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves). |
| `Pointer only?` | Never: whatever it says must also be reachable without it. An icon-only button still needs its own name (`aria-label`). |
| `Touch` | A touch does not show it; give touch users the information another way. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-tooltip` | The tooltip. `data-side` tells the side it opened on (`top`, `bottom`, `start`, `end`). |
| `.mx-tooltip__text` | The text. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `tooltip.offset, tooltip.enter-offset` | The gap to its target, and how far it comes in from it. |
| `tooltip.surface` | Unit: the tooltip with its box (`max-width`: the widest it gets before it wraps; `rich`: with content of its own). |
| `tooltip.arrow, tooltip.text` | Units: an arrow towards the target a design may show, and the text. |
| `tooltip.text-align` | How its text lines up. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<Element \| ComponentBase \| null>` | — | What it describes. A function is fine for a component that comes later in the view (`() => this.save`). |
| `text` | `Bind<string>` | `''` | What it says. |
| `content` | `Bind<ComponentBase \| null>` | — | Any content after the text, made the first time it shows. JSX children work too. Nothing interactive. |
| `placement` | `Bind<PopupPlacement>` | `'top'` | `top`, `bottom`, `start`, `end`, each with `-start` / `-end`. It opens on the other side when there is no room; start and end follow the reading direction. |
| `delay` | `Bind<number>` | `500` | Milliseconds the pointer rests on the target before it shows. Keyboard focus shows it at once. |
| `hideDelay` | `Bind<number>` | `150` | Milliseconds it stays after the pointer leaves, so the pointer can move onto it. |
| `showOn` | `Bind<TooltipShowOn>` | `'hover-focus'` | `hover-focus`, `focus` (keyboard focus only), `manual` (only `open()`). |
| `enabled` | `Bind<boolean>` | `true` | `false`: it never shows, and closes if it is open. |
| `onOpened, onClosed` | `() => void` | — | See Events. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `opened` | read/write, reactive | Whether it is shown; setting it opens or closes it. |
| `Tooltip.skipDelay` | static, read/write | Milliseconds after a tooltip closes during which the next one shows at once (default `300`; `0` turns it off). |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open()` | `boolean` | Shows it now, whatever `showOn` says; `false` without a target on the page, or when disabled. |
| `close()` | `void` | Hides it. |
| `place()` | `void` | Lines it up with its target again, e.g. after the target moved. |
| `addTooltip(target, text \| options)` | `() => void` | A tooltip for one element, made on first use; returns the function that removes it. For a component it goes with the component. |

### Events

| Event | When |
| --- | --- |
| `onOpened` | It was shown. |
| `onClosed` | It was hidden. |
