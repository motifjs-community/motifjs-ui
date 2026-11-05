# Drawer

> Navigation · @motifx-community/ui 0.1.0-beta.2

A panel that slides in from an edge of the page or of a container, over the content or pushing it aside. A finger swipes it in from the edge and back again; Escape, the scrim and the browser's back close it.

## Import

```tsx
import { Drawer, type DrawerSide, type DrawerMode } from '@motifx-community/ui';
```

## A drawer over the page

Bound with `x-model`, or opened with `open()` and `show(host)` as a bottom sheet is. Over the page it opens in the top layer, modal, with a scrim.

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

## Edges, push and swipes

Over a frame (`container`), from any edge. `push` moves the frame's content aside (`pushTarget`) and is not modal unless asked. With `edgeSwipe` a finger on a touch screen opens it from the edge; every option is live.

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

## Finger and keys

| Gesture or key | What it does |
| --- | --- |
| `Swipe in from the edge (`edgeSwipe`)` | The drawer follows the finger; let go past half its size (or flicked), it stays open, else it goes back. |
| `Swipe it back towards its edge` | It follows; let go past half (or flicked), it closes. A swipe on something inside that scrolls sideways is that thing's. |
| `A press on the scrim, Escape, the back button` | It closes (each an option). |
| `Escape` | Closes it. |
| `Tab, Shift+Tab` | Through its controls; modal, it goes round inside. |

## Accessibility

| Topic | How |
| --- | --- |
| `Dialog` | The panel is `role="dialog"`, named by its title, else `label`, else "Side panel"; `aria-modal` when modal, and what is around it is `inert`. |
| `Focus` | Moves in when it opens modal, back where it was when it closes. |
| `Reading direction` | `start` is the left edge left to right and the right edge right to left; the slide follows. |
| `Motion` | It slides with the motion tokens; with reduced motion it just appears. |

## Localization

Its default name and the close button come from `uiLocale.strings` (`drawerLabel`, `close`).

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-drawer` | The layer. `data-side` (`start`, `end`, `top`, `bottom`), `data-mode`, `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`. |
| `.mx-drawer__panel` | The dialog. `--_size`, and `--_shift-x` / `--_shift-y` while a finger moves it. |
| `.mx-drawer__scrim, __header, __title, __tools, __close, __body, __footer` | Its parts. |
| `[data-mx-drawer-push]` | The element a push drawer moves aside, by `--_mx-push`. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `drawer.scrim, drawer.panel` | Units: the dimmed layer; the surface at each edge (`start`, `end`, `top`, `bottom`: its sides towards the content and the room differ) and pushing the content (`push`). |
| `drawer.header, drawer.title, drawer.tools, drawer.body, drawer.footer` | Units: inside (`body.focus`: a ring inside the content). |
| `drawer.size, drawer.max-size, drawer.inset, drawer.font-family` | The size it opens at, the most of the room it takes, the room around it; the type’s family. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Whether it is open. `x-model` binds it two-way. |
| `side` | `Bind<'start' \| 'end' \| 'left' \| 'right' \| 'top' \| 'bottom'>` | `'start'` | The edge it slides in from. `start` and `end` follow the reading direction; `left` and `right` do not. |
| `mode` | `Bind<'over' \| 'push'>` | `'over'` | Over the content, or moving `pushTarget` aside by its size. |
| `pushTarget` | `Bind<HTMLElement \| ComponentBase \| null>` | — | What `push` moves aside. Without it, `push` works as `over`. |
| `size` | `Bind<number \| string \| null>` | `null` | Its width (its height from the top or the bottom): pixels or a CSS length; `null` for `drawer.size`. Never more than 85% of the room. |
| `edgeSwipe` | `Bind<boolean>` | `false` | A finger swiping in from the edge of the container (or the page) opens it, following the finger. |
| `edgeSize` | `Bind<number>` | `24` | How far from the edge, in pixels, that swipe may start. |
| `swipeToClose` | `Bind<boolean>` | `true` | A finger swiping it back towards its edge closes it. |
| `flickSpeed` | `Bind<number>` | `0.4` | A flick faster than this, in pixels per millisecond, opens or closes it however far it went. |
| `modal` | `Bind<boolean>` | `true` over, `false` in push | Nothing around it can be used; Tab stays inside. |
| `title, label, container, content, footer, showClose, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, disposeOnClose` | see BottomSheet |  | The props every overlay panel shares, as on the [BottomSheet page](bottomsheet.md#api). |

### Members and events

| Member | Returns | Description |
| --- | --- | --- |
| `open(), close(reason?), toggle(), show(host)` | `boolean` | As on a bottom sheet. |
| `isOpen` | read-only, reactive | Whether it is open. |
| `onOpening / onOpened / onClosing / onClosed` | events | As on a bottom sheet; a swipe back closes with `reason: 'swipe'`. A swipe from the edge that `onOpening` refuses does not move it. |
