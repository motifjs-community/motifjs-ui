# BottomSheet

> Navigation · @motifx-community/ui 0.1.0-beta.10

A panel that slides up from the bottom of the page or a container and stops at set heights: peek, half, full, the height of its content, or custom values. Users can drag it by its handle and title, flick it, and swipe down to close it. It can be modal or non-modal, and the back button closes it on phones.

## Import

```tsx
import { BottomSheet, type BottomSheetDetent } from '@motifx-community/ui';
```

## Declarative and programmatic

In JSX, `x-model` opens and closes it based on state. Programmatically, `show(host)` adds it to a component and disposes it on close, and `open()` and `close()` work on a sheet that stays in place. Without a `container`, it opens over the whole page in the browser's top layer.

```tsx
import { reactive } from '@motifx/core';
import { BottomSheet, Button, Stack, TextBox } from '@motifx-community/ui';

/** A sheet declared in JSX and bound to state, and one created programmatically, both over the whole page. */
export default function JsxAndCode() {
  const s = reactive({ open: false, name: 'Ada', said: '' });

  const share = () => {
    const sheet = new BottomSheet({
      title: 'Share',
      detent: 'fit',
      detents: ['fit', 'full'],
      content: (
        <Stack gap="sm">
          <p>Anyone with the link can see the report.</p>
          <Button text="Copy the link" variant="outline" onclick={() => sheet.close()} />
        </Stack>
      ),
      onClosed: (e) => (s.said = `The code sheet closed (${e.reason}).`),
    });
    // show() puts it in the page and disposes it when it closes.
    sheet.show(host);
  };
  let host!: Stack;

  return (
    <Stack ref={(c: Stack) => (host = c)} gap="sm">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Edit the name" variant="outline" onclick={() => (s.open = true)} />
        <Button text="Share (programmatically)" variant="outline" onclick={share} />
        <output>{() => s.said || `Name: ${s.name}`}</output>
      </Stack>
      <BottomSheet title="Your name" showClose detents={['half', 'full']} x-model={() => s.open}>
        <TextBox label="Name" x-model={() => s.name} />
      </BottomSheet>
    </Stack>
  );
}
```

## Heights, dragging and options

`detents` lists the heights it stops at, and `detent` is the current one. The handle and title follow the finger or mouse, and scrolling content can drag the sheet from its top. This example opens over a frame (`container`) and is not modal, so the page underneath stays usable. Every behavior is a setting that can be changed live.

```tsx
import { reactive, type Component } from '@motifx/core';
import { BottomSheet, Button, RadioGroup, Stack, Switch, type BottomSheetDetent } from '@motifx-community/ui';

const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, text: `Place ${i + 1}` }));

/** A sheet over a frame, at peek, half or full height. Drag the handle or title, flick, or use the arrow keys on the handle. Every behavior is a setting. */
export default function Detents() {
  const s = reactive({
    open: true,
    detent: 'peek' as BottomSheetDetent,
    modal: false,
    handle: true,
    draggable: true,
    content: true,
    swipe: true,
    back: true,
  });
  let frame!: Component<HTMLDivElement>;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Modal" x-model={() => s.modal} />
        <Switch label="Handle" x-model={() => s.handle} />
        <Switch label="Draggable" x-model={() => s.draggable} />
        <Switch label="Content drags it" x-model={() => s.content} />
        <Switch label="Swipe down closes" x-model={() => s.swipe} />
        <Switch label="Back button closes" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="Height"
          orientation="horizontal"
          items={[
            { value: 'peek', text: 'Peek' },
            { value: 'half', text: 'Half' },
            { value: 'full', text: 'Full' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.detent}
        />
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sheet-frame" style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">
        <p style="padding: var(--mx-space-4)">The page under the sheet. Non-modal, it stays usable.</p>
      </div>
      <BottomSheet
        title="Nearby"
        label="Nearby places"
        container={() => frame}
        detents={['peek', 'half', 'full']}
        x-model={() => s.open}
        detent={() => s.detent}
        onDetentChanged={(e) => (s.detent = e.to)}
        modal={() => s.modal}
        showHandle={() => s.handle}
        draggable={() => s.draggable}
        dragContent={() => s.content}
        swipeToClose={() => s.swipe}
        closeOnBack={() => s.back}
      >
        <ul style="margin: 0; padding: 0; list-style: none">
          {ROWS.map((row) => (
            <li key={row.id} style="padding-block: var(--mx-space-2); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider)">
              {row.text}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}
```

## Events

Each open, close and height change raises an event before and after. `onClosing` provides the reason (`reason`) and can keep the sheet open, and `onDetentChanging` can reject a height or choose another one.

```tsx
import { reactive, type Component } from '@motifx/core';
import { BottomSheet, Button, Stack, Switch } from '@motifx-community/ui';

/** The events in order. While "Keep it open" is on, onClosing refuses every closing but by code; "Not full" refuses the tallest height. */
export default function Events() {
  const s = reactive({ open: false, keep: false, notFull: false, log: [] as string[] });
  let frame!: Component<HTMLDivElement>;

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />
        <Switch label="Keep it open" x-model={() => s.keep} />
        <Switch label="Not full" x-model={() => s.notFull} />
      </Stack>
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)" />
      <BottomSheet
        title="Events"
        showClose
        container={() => frame}
        detents={['half', 'full']}
        x-model={() => s.open}
        onOpening={() => log('opening')}
        onOpened={() => log('opened')}
        onDetentChanging={(e) => {
          log(`detentChanging ${e.from} → ${e.to}`);
          if (s.notFull && e.to === 'full') e.cancel = true;
        }}
        onDetentChanged={(e) => log(`detentChanged ${e.to}`)}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.keep && e.reason !== 'code') e.cancel = true;
        }}
        onClosed={(e) => log(`closed (${e.reason})`)}
      >
        <p>Drag it, press Escape, the scrim, its close button or the browser's back.</p>
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />
      </BottomSheet>
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Escape` | Closes the sheet (`closeOnEscape`). |
| `Tab, Shift+Tab` | Moves through its controls. In a modal, focus cycles within it. |
| `Up, Right, Page Up (on the handle)` | Moves to the next taller height. |
| `Down, Left, Page Down (on the handle)` | Moves to the next shorter height without closing the sheet. |
| `Home, End (on the handle)` | Moves to the lowest or tallest height. |

## Touch and mouse

| Gesture | Description |
| --- | --- |
| `Drag the handle or the title` | The sheet follows the finger or mouse and settles at the nearest height on release. It stretches slightly beyond the tallest height. |
| `Flick` | Moving faster than `flickSpeed` jumps to the next height in that direction, regardless of distance. |
| `Drag or flick down past the lowest height` | The sheet closes (`swipeToClose`), with `reason: 'swipe'`. |
| `Drag the content` | Dragging down from the top, or up while the sheet is not at its tallest, moves the sheet. Otherwise, the content scrolls. A horizontal swipe goes to the content. |
| `Tap the handle` | Moves to the next height, wrapping to the lowest. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Dialog` | The panel has `role="dialog"`, is named by its title, `label` or "Sheet", and has `aria-modal` when modal. The surrounding content is `inert`, so screen readers and the keyboard stay inside. |
| `Handle` | A vertical `role="slider"` named "Sheet height". Its value is the share of the full height, announced as the name of the height ("Half height"). |
| `Focus` | Moves in when the sheet opens (modal by default) and returns to where it was when the sheet closes. |
| `Motion` | Slides in using the motion tokens. When the user prefers reduced motion, it appears without animation. |
| `Safe areas` | The panel stays clear of rounded screen corners and system bars (`env(safe-area-inset-*)`). |

## Localization

The handle and height names, the default name and the close button come from `uiLocale.strings` (`sheetHandle`, `sheetPeek`, `sheetHalf`, `sheetFull`, `sheetFit`, `sheetHeight`, `sheetLabel`, `close`).

```tsx
import { reactive } from '@motifx/core';
import { BottomSheet, Button, uiLocale } from '@motifx-community/ui';

/** The handle name, height names and close button name come from uiLocale. */
export default function Localization() {
  const s = reactive({ open: false, lang: 'en' });

  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };

  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
      <BottomSheet showClose detents={['peek', 'half', 'full']} detent="half" x-model={() => s.open}>
        <p>Focus the handle: a screen reader reads its name and the height it is at.</p>
      </BottomSheet>
    </>
  );
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-bottom-sheet` | The layer over the page or container. `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`. |
| `.mx-bottom-sheet__scrim` | The dimmed layer. |
| `.mx-bottom-sheet__panel` | The dialog. `--_size` is its height, and `--_drop` is how far it is pulled below its lowest height. |
| `.mx-bottom-sheet__handle, .mx-bottom-sheet__grip` | The handle (the slider) and the line drawn in it. |
| `.mx-bottom-sheet__header, __title, __tools, __close` | The title row and its close button. |
| `.mx-bottom-sheet__body, .mx-bottom-sheet__footer` | The scrolling content and the row below it. |

### Component tokens

| Token | Description |
| --- | --- |
| `sheet.scrim, sheet.panel` | Units: the dimmed layer, and the surface (`max-width` limits its width on large screens, and `full` sets its top corners when it reaches the top). |
| `sheet.handle, sheet.grip` | Units: the handle (`focus` for keyboard use) and its grip. |
| `sheet.header, sheet.title, sheet.tools, sheet.body, sheet.footer` | Units: the content area (`body.focus`: a focus ring inside the content). |
| `sheet.top-gap, sheet.peek-height, sheet.inset` | The gap at the top at full height, the peek height, and the margin around the panel. |
| `sheet.handle-area, sheet.font-family` | The grab area of the handle, and the font family. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<boolean>` | `false` | Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it. |
| `title` | `Bind<string>` | `''` | A title at the top, which also names the dialog. This is the same property as `text`. |
| `label` | `Bind<string>` | `''` | The accessible name when there is no title. The default is "Sheet", from `uiLocale`. |
| `detents` | `Bind<readonly BottomSheetDetent[]>` | `['half', 'full']` | The heights it stops at: `'peek'` (`sheet.peek-height`), `'half'`, `'full'` (the available space minus `sheet.top-gap`), `'fit'` (the height of its content), pixels, or a percentage such as `'40%'`. |
| `detent` | `Bind<BottomSheetDetent>` | The first of `detents` | The height it opens at and its current height. User changes write to it, and setting it moves the sheet. |
| `modal` | `Bind<boolean>` | `true` | Blocks everything around it, within its container or on the whole page. Tab stays inside. |
| `scrim` | `Bind<boolean>` | When modal | Shows a dimmed layer behind it. |
| `container` | `Bind<ComponentBase \| null>` | `null` | Opens over this component, which is made `relative` while open if it is static. `null` opens over the page, in the top layer. |
| `content, footer` | `Bind<ComponentBase \| null>` | — | Content in addition to JSX children, and a non-scrolling row below it. |
| `showClose` | `Bind<boolean>` | `false` | Shows a close button next to the title. |
| `showHandle` | `Bind<boolean>` | `true` | Shows the handle at the top, which is a grip for touch and mouse, and a slider for the keyboard. |
| `draggable` | `Bind<boolean>` | `true` | Lets touch and mouse move the sheet between heights using the handle and title. |
| `dragContent` | `Bind<boolean>` | `true` | Lets a finger on the content drag the sheet when the content cannot scroll in that direction: down from its top, or up while the sheet is not at its tallest. |
| `swipeToClose` | `Bind<boolean>` | `true` | Closes the sheet when it is dragged or flicked below its lowest height. |
| `flickSpeed` | `Bind<number>` | `0.4` | The speed at which a flick moves to the next height, in pixels per millisecond. |
| `closeOnEscape, closeOnScrim` | `Bind<boolean>` | `true` | Closes the sheet on Escape and on a click on the scrim. |
| `closeOnBack` | `Bind<boolean>` | `true` | Closes the sheet with the browser's back action (the Android back button or back gesture). It adds one history entry while open and removes it when closed another way, so no entry is left behind. |
| `focusOnOpen` | `Bind<boolean>` | When modal | Moves focus in on open: to `[autofocus]`, the first field, the first control, or the panel. |
| `returnFocus` | `Bind<boolean>` | `true` | Returns focus to where it was on close. |
| `disposeOnClose` | `Bind<boolean>` | see text | Disposes the sheet on close. By default, this applies when `show` added it to its host. |
| `enabled, visible` | see Control |  | Properties shared by all controls. |

### Members and events

| Member | Returns | Description |
| --- | --- | --- |
| `open()` | `boolean` | Opens at `detent`. Returns `false` if `onOpening` canceled it. If it is not in the page, it opens from the end of the page or in its container. |
| `close(reason?)` | `boolean` | Closes it. Returns `false` if `onClosing` canceled the close. |
| `toggle()` | `boolean` | Opens or closes the sheet. |
| `show(host, disposeRef?)` | `boolean` | Adds it to `host` (a component or the application) if needed and opens it. It is disposed on close. |
| `snapTo(detent)` | `boolean` | Moves it to a height, and opens it there if closed. |
| `expand(), collapse()` | `boolean` | Moves to the next taller or shorter height. Returns `false` at the end. |
| `isOpen, height` | read-only | Indicates whether it is open (reactive), and its current height in pixels. |
| `panelPart, contentPart` | read-only | The surface with `role="dialog"`, and the scrolling area. |
| `onOpening / onOpened` | events | `{ cancel, source }` and `{ source }`. `opened` occurs after the slide-in animation. |
| `onClosing / onClosed` | events | `{ cancel, reason, source }` and `{ reason, source }`, with `'code'`, `'escape'`, `'scrim'`, `'swipe'`, `'back'`, `'button'` or `'owner'`. A close caused by the owner being disposed cannot be canceled. |
| `onDetentChanging / onDetentChanged` | events | `{ from, to, byUser, cancel, source }`. `to` can be changed, and if canceled the sheet returns to where it was. |

Every prop is also a property that accepts a value or a function. The shared parts (the panel, scrim, modality, focus handling and back button) come from `OverlayPanel`, which `Drawer` and `ActionSheet` also use.

## Feedback

Loading issues…
