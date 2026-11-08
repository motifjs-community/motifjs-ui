# Drawer

> Navigation · @motifx-community/ui 0.1.0-beta.8

A panel that slides in from an edge of the page or a container, either over the content or pushing it aside. Users can swipe it in from the edge and back out, and Escape, the scrim and the browser's back action close it.

## Import

```tsx
import { Drawer, type DrawerSide, type DrawerMode } from '@motifx-community/ui';
```

## Page-level drawer

Bind it with `x-model`, or open it with `open()` and `show(host)` as with a bottom sheet. Over the page, it opens in the top layer as a modal with a scrim.

```tsx
import { reactive } from '@motifx/core';
import { Button, Drawer, ListBox } from '@motifx-community/ui';

const PLACES = [
  { id: 'inbox', text: 'Inbox' },
  { id: 'starred', text: 'Starred' },
  { id: 'sent', text: 'Sent' },
  { id: 'drafts', text: 'Drafts' },
];

/** A drawer over the whole page from the start edge, bound with x-model; a finger can swipe it back to close it. */
export default function Navigation() {
  const s = reactive({ open: false, place: 'inbox' });

  return (
    <>
      <Button text="Menu" variant="outline" onclick={() => (s.open = true)} />
      <output>{() => `Showing: ${PLACES.find((p) => p.id === s.place)?.text}`}</output>
      <Drawer title="Mail" showClose x-model={() => s.open}>
        <ListBox label="Folders" items={PLACES} itemText="text" itemValue="id" x-model={() => s.place} onclick={() => (s.open = false)} />
      </Drawer>
    </>
  );
}
```

## Edges, push mode and swipe gestures

This example opens over a frame (`container`) from any edge. `push` moves the frame's content aside (`pushTarget`) and is not modal unless requested. With `edgeSwipe`, a finger on a touch screen opens it from the edge. Every option can be changed live.

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, Drawer, RadioGroup, Stack, Switch, type DrawerMode, type DrawerSide } from '@motifx-community/ui';

/** A drawer over a frame: its edge, over or pushing the content, a swipe in from the edge, modal or not. Every option is live. */
export default function Options() {
  const s = reactive({ open: false, side: 'start' as DrawerSide, mode: 'over' as DrawerMode, edge: true, modal: true, swipe: true, back: true });
  let frame!: Component<HTMLDivElement>;
  let content!: Component<HTMLDivElement>;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Swipe in from the edge" x-model={() => s.edge} />
        <Switch label="Modal" x-model={() => s.modal} />
        <Switch label="Swipe back closes" x-model={() => s.swipe} />
        <Switch label="Back button closes" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Edge"
          orientation="horizontal"
          items={[
            { value: 'start', text: 'Start' },
            { value: 'end', text: 'End' },
            { value: 'top', text: 'Top' },
            { value: 'bottom', text: 'Bottom' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.side}
        />
        <RadioGroup
          label="Mode"
          orientation="horizontal"
          items={[
            { value: 'over', text: 'Over' },
            { value: 'push', text: 'Push' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.mode}
        />
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">
        <div ref={(c: Component<HTMLDivElement>) => (content = c)} style="block-size: 100%; padding: var(--mx-space-4); box-sizing: border-box">
          <p>The content of the frame. On a touch screen, swipe in from its edge.</p>
        </div>
      </div>
      <Drawer
        title="Filters"
        showClose
        container={() => frame}
        side={() => s.side}
        mode={() => s.mode}
        pushTarget={() => content}
        edgeSwipe={() => s.edge}
        modal={() => s.modal}
        swipeToClose={() => s.swipe}
        closeOnBack={() => s.back}
        size={() => (s.side === 'top' || s.side === 'bottom' ? '12rem' : null)}
        x-model={() => s.open}
      >
        <Stack gap="sm">
          <Switch label="Only unread" />
          <Switch label="With attachments" />
          <Button text="Apply" onclick={() => (s.open = false)} />
        </Stack>
      </Drawer>
    </>
  );
}
```

## Events

```tsx
import { reactive } from '@motifx/core';
import { Button, Drawer, Stack, Switch } from '@motifx-community/ui';

/** The events of a drawer in order; "Keep it open" refuses every closing but by code. */
export default function Events() {
  const s = reactive({ open: false, keep: false, log: [] as string[] });

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
        <Switch label="Keep it open" x-model={() => s.keep} />
      </Stack>
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>
      <Drawer
        side="end"
        title="Events"
        showClose
        x-model={() => s.open}
        onOpening={() => log('opening')}
        onOpened={() => log('opened')}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.keep && e.reason !== 'code') e.cancel = true;
        }}
        onClosed={(e) => log(`closed (${e.reason})`)}
      >
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />
      </Drawer>
    </>
  );
}
```

## Touch and keyboard

| Gesture or key | Description |
| --- | --- |
| `Swipe in from the edge (`edgeSwipe`)` | The drawer follows the finger. Releasing past half its size, or flicking it, leaves it open. Otherwise, it slides back. |
| `Swipe it back towards its edge` | It follows the finger. Releasing past halfway, or flicking it, closes it. A swipe on content that scrolls horizontally goes to that content. |
| `A press on the scrim, Escape, the back button` | It closes, and each of these has an option. |
| `Escape` | Closes it. |
| `Tab, Shift+Tab` | Moves through its controls. In a modal, focus cycles within it. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Dialog` | The panel has `role="dialog"` and is named by its title, `label` or "Side panel". It has `aria-modal` when modal, and the surrounding content is `inert`. |
| `Focus` | Moves in when it opens as a modal, and returns to where it was when it closes. |
| `Reading direction` | `start` is the left edge in left-to-right pages and the right edge in right-to-left pages, and the animation follows. |
| `Motion` | Slides in using the motion tokens. When the user prefers reduced motion, it appears without animation. |

## Localization

Its default name and the close button come from `uiLocale.strings` (`drawerLabel`, `close`).

## Styling

| Hook | Description |
| --- | --- |
| `.mx-drawer` | The layer. `data-side` (`start`, `end`, `top`, `bottom`), `data-mode`, `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`. |
| `.mx-drawer__panel` | The dialog. `--_size`, plus `--_shift-x` and `--_shift-y` during a drag. |
| `.mx-drawer__scrim, __header, __title, __tools, __close, __body, __footer` | The parts of the component. |
| `[data-mx-drawer-push]` | The element a push drawer moves aside, using `--_mx-push`. |

### Component tokens

| Token | Description |
| --- | --- |
| `drawer.scrim, drawer.panel` | Units: the dimmed layer, the surface at each edge (`start`, `end`, `top`, `bottom`, which differ in the sides facing the content and the available space), and the surface when pushing content (`push`). |
| `drawer.header, drawer.title, drawer.tools, drawer.body, drawer.footer` | Units: the content area (`body.focus`: a focus ring inside the content). |
| `drawer.size, drawer.max-size, drawer.inset, drawer.font-family` | The opening size, the maximum share of the available space, the margin around it, and the font family. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Indicates whether it is open. `x-model` provides two-way binding. |
| `side` | `Bind<'start' \| 'end' \| 'left' \| 'right' \| 'top' \| 'bottom'>` | `'start'` | The edge it slides in from. `start` and `end` follow the reading direction, and `left` and `right` do not. |
| `mode` | `Bind<'over' \| 'push'>` | `'over'` | Over the content, or pushing `pushTarget` aside by its size. |
| `pushTarget` | `Bind<HTMLElement \| ComponentBase \| null>` | — | The element `push` moves aside. Without it, `push` behaves like `over`. |
| `size` | `Bind<number \| string \| null>` | `null` | Its width, or its height from the top or bottom, in pixels or as a CSS length. `null` uses `drawer.size`. It never exceeds 85% of the available space. |
| `edgeSwipe` | `Bind<boolean>` | `false` | A finger swiping in from the edge of the container or page opens it, and it follows the finger. |
| `edgeSize` | `Bind<number>` | `24` | The distance from the edge, in pixels, where that swipe can start. |
| `swipeToClose` | `Bind<boolean>` | `true` | A finger swiping it back toward its edge closes it. |
| `flickSpeed` | `Bind<number>` | `0.4` | A flick faster than this, in pixels per millisecond, opens or closes it regardless of distance. |
| `modal` | `Bind<boolean>` | `true` for over, `false` for push | Blocks everything around it, and Tab stays inside. |
| `title, label, container, content, footer, showClose, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, disposeOnClose` | see BottomSheet |  | Props shared by all overlay panels, as listed on the [BottomSheet page](bottomsheet.md#api). |

### Members and events

| Member | Returns | Description |
| --- | --- | --- |
| `open(), close(reason?), toggle(), show(host)` | `boolean` | Same as on a bottom sheet. |
| `isOpen` | read-only, reactive | Indicates whether it is open. |
| `onOpening / onOpened / onClosing / onClosed` | events | Same as on a bottom sheet. A swipe back closes it with `reason: 'swipe'`, and an edge swipe canceled by `onOpening` does not move it. |

## Feedback

Loading issues…
