# Tooltip

> Feedback · @motifx-community/ui 0.1.0-beta.3

A short description shown next to an element when the pointer rests on it, when it receives keyboard focus, or programmatically. Users can hover over the tooltip, Escape dismisses it, and only one is open at a time on the page.

## Import

```tsx
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
```

## Declarative and programmatic

In JSX, place a tooltip anywhere and point it at its `target`. Its position in the markup does not matter. Programmatically, `new Tooltip({ target, text })` is all you need: it adds itself to the page the first time it appears and is removed along with its target component.

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

A button with only an icon needs its own accessible name (`aria-label`). The tooltip displays that information and adds the shortcut as a description. Moving from one button to the next shows the next tooltip immediately.

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

## Tooltips on fields

On a TextBox, the whole field shows the tooltip on hover, and the input is described by it while it is visible, including on keyboard focus.

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

The default is `top`. The tooltip opens on the opposite side if there is no room, and `start` and `end` follow the reading direction. Try the RTL switch at the top of the page.

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

The pointer must rest on the target for `delay` milliseconds (500 by default) before the tooltip appears, and `hideDelay` keeps it open briefly after the pointer leaves. Immediately after one closes, the next appears without a delay (`Tooltip.skipDelay`).

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

JSX children or `content` (any component) appear after the text. Keep it short and never include buttons or links, because a tooltip cannot receive focus.

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

## Display triggers

`showOn` sets what displays the tooltip: `hover-focus` (the default), `focus` (keyboard focus only) or `manual` (only `open()` and `opened`). `enabled` turns a tooltip off.

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

## Tooltips on many elements

`addTooltip(target, text)` gives an element a tooltip that is created only when first needed. All tooltips on the page share one set of document listeners, so hundreds of them have almost no cost. The function returns a remover.

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

| Key | Description |
| --- | --- |
| `Tab (focus on the target)` | Shows the tooltip immediately. Leaving the target hides it. |
| `Escape` | Hides the tooltip while focus stays in place. Only the tooltip closes, not the surrounding window. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Role` | `role="tooltip"`, with one element per tooltip. |
| `Description` | While it is visible, the target or its focusable part, such as the input of a TextBox, has `aria-describedby` pointing to the tooltip, along with its own descriptions. |
| `Focus` | A tooltip never receives focus and contains nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`). |
| `WCAG 1.4.13` | Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves). |
| `Pointer only?` | Tooltip content must also be available another way. An icon-only button still needs its own name (`aria-label`). |
| `Touch` | Touch does not show a tooltip, so provide the information another way for touch users. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-tooltip` | The tooltip. `data-side` reports the side it opened on (`top`, `bottom`, `start`, `end`). |
| `.mx-tooltip__text` | The text. |

### Component tokens

| Token | Description |
| --- | --- |
| `tooltip.offset, tooltip.enter-offset` | The gap to the target, and the distance it animates in from. |
| `tooltip.surface` | Unit: the tooltip and its box (`max-width` sets the width before wrapping, and `rich` applies with custom content). |
| `tooltip.arrow, tooltip.text` | Units: an optional arrow toward the target, and the text. |
| `tooltip.text-align` | The text alignment. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `Bind<Element \| ComponentBase \| null>` | — | The element it describes. A function works for a component that appears later in the view (`() => this.save`). |
| `text` | `Bind<string>` | `''` | The tooltip text. |
| `content` | `Bind<ComponentBase \| null>` | — | Any content after the text, created the first time the tooltip appears. JSX children work too. Do not include interactive content. |
| `placement` | `Bind<PopupPlacement>` | `'top'` | `top`, `bottom`, `start` or `end`, each with `-start` or `-end`. It opens on the opposite side if there is no room, and start and end follow the reading direction. |
| `delay` | `Bind<number>` | `500` | The time in milliseconds the pointer must rest on the target before the tooltip appears. Keyboard focus shows it immediately. |
| `hideDelay` | `Bind<number>` | `150` | The time in milliseconds it stays after the pointer leaves, so the pointer can move onto it. |
| `showOn` | `Bind<TooltipShowOn>` | `'hover-focus'` | `hover-focus`, `focus` (keyboard focus only) or `manual` (only `open()`). |
| `enabled` | `Bind<boolean>` | `true` | `false` keeps the tooltip from appearing and closes it if it is open. |
| `onOpened, onClosed` | `() => void` | — | See Events. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `opened` | read/write, reactive | Indicates whether it is visible. Set it to open or close the tooltip. |
| `Tooltip.skipDelay` | static, read/write | The time in milliseconds after a tooltip closes during which the next one appears immediately. The default is `300`, and `0` turns it off. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open()` | `boolean` | Shows the tooltip now, regardless of `showOn`. Returns `false` if there is no target on the page or the tooltip is disabled. |
| `close()` | `void` | Hides the tooltip. |
| `place()` | `void` | Repositions it relative to its target, for example after the target moves. |
| `addTooltip(target, text \| options)` | `() => void` | Adds a tooltip to one element, created on first use, and returns a function that removes it. For a component, it is removed along with the component. |

### Events

| Event | When |
| --- | --- |
| `onOpened` | Occurs after it is shown. |
| `onClosed` | Occurs after it is hidden. |
