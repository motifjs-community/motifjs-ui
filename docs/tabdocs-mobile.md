# TabDocumentManager: Tablet and phone

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.11

On tablets and phones, a layout of groups, splits and dock areas does not fit as designed. The manager keeps the layout and changes how it is presented: the documents, groups, areas and saved JSON stay the same, and content is moved rather than recreated. The presentation depends on the manager's own width rather than the device, and on touch screens its tabs and buttons are larger.

## Import

```tsx
import { TabDocumentManager, type TabPresentation, type TabDockPresentation } from '@motifx-community/ui';
```

## Three presentations of one layout

| Presentation | Displayed content |
| --- | --- |
| `Desktop` | The full layout: groups side by side and one above the other, dock areas around them, floating windows and new browser windows. |
| `Tablet` | Up to two groups side by side, with the first branch of the layout on one side and the rest on the other, each showing its most recently used group. Groups that do not fit collapse as tabs into the strip of the adjacent group. Their tabs keep their own group, and tapping one activates that group there. Dock areas become drawers from their edge, with the bottom area as a sheet, and open from their titles along the edges or by swiping in from the edge. A floating window is a large sheet. |
| `Phone` | One document at full screen. The bar above it shows its title (swipe left or right to move to the adjacent document, or tap to open its commands in an action sheet), its close button, and the number of open documents, which opens the document list. Dock area tools are buttons in a bottom bar. Tapping one opens a sheet (peek, half or full with its handle, and swipe down to close), or a drawer for an area configured to use one. A floating window is a full-screen sheet. New browser windows are disabled, and the tab menu is an action sheet. |

Choose one, and the underlying layout does not change. Save the layout in each presentation, and the JSON is identical.

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocumentManager, type TabPresentation } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * One layout shown four ways: two groups (the second split again), the explorer and the outline on
 * the left, problems and output at the bottom, a floating window. Pick a presentation: the layout
 * stays the same (Save shows its JSON does not change), only where things show changes.
 */
export default function Presentations() {
  const s = reactive({ presentation: 'tablet' as TabPresentation, shown: '', saved: '' });
  const docs = new TabDocumentManager({ label: 'Editor shown as on a desktop, a tablet or a phone', presentation: () => s.presentation, minGroupWidth: 120 });
  docs.element.style.cssText = 'block-size: 32rem; inline-size: 100%; max-inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right', docs.findDocument('src/router.ts')!)!;
  right.open(fileDocument('README.md'));
  docs.split(right, 'down', docs.findDocument('README.md')!);
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  docs.float(docs.open(fileDocument('package.json'))!, { x: 80, y: 80, width: 360, height: 220 });
  docs.activate(docs.findDocument('src/index.ts')!);
  docs.onPresentationChanged((e) => (s.shown = `${e.from} → ${e.to} (${e.width} px wide)`));
  let first = '';
  const save = () => {
    const json = JSON.stringify(docs.saveLayout());
    first ||= json;
    s.saved = `Saved as ${docs.currentPresentation}: ${json.length} characters, ${json === first ? 'the same as the first save' : 'not the same as the first save'}.`;
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'By its width' },
            { value: 'desktop', text: 'Desktop' },
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <output class="td-state">{() => (s.shown ? `Shown: ${s.shown}` : `Shown as: ${docs.currentPresentation}`)}</output>
      </Stack>
      {docs}
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save the layout" variant="outline" onclick={save} />
        <output class="td-state">{() => s.saved || 'The layout saves the same in every presentation.'}</output>
      </Stack>
    </>
  );
}
```

## Based on its own width

With `presentation: 'auto'` (the default), the manager monitors its own width and the device's pointer type. Below `phoneWidth` (560), it uses the phone presentation regardless of the pointer. Phones are typically 360 to 430 pixels wide, so a manager of about 590 pixels next to a page's side column stays in the desktop presentation. Below `tabletWidth` (1024), it uses the tablet presentation on touch screens and stays in the desktop presentation with a mouse (`tabletWhen: 'width'` uses the width alone). An application can change both limits to fit its layout. Drag the corner of the frame in this example, and the text you typed in the note and the scroll position of a file are kept.

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument, source } from './files';
import { problems, toolDocument } from './tools';

/**
 * A manager that follows its own width (`presentation: 'auto'`): drag the frame's corner, or pick a
 * width. Under 560 pixels it shows as on a phone; under 1024 as on a tablet when the screen is a touch
 * screen (with a mouse it stays a desktop). A text and a scroll position are kept across every change:
 * the content moves and is never recreated.
 */
export default function FollowsWidth() {
  const s = reactive({ shown: '', typed: '' });
  let frame!: Component<HTMLDivElement>;
  const docs = new TabDocumentManager({ label: 'Editor that follows its width' });
  docs.element.style.cssText = 'block-size: 100%; inline-size: 100%';
  docs.open(
    { id: 'note', title: 'Note', content: () => <textarea aria-label="Note" style="display: block; box-sizing: border-box; inline-size: 100%; block-size: 100%; padding: var(--mx-space-3); font: inherit; border: 0; resize: none" x-model={() => s.typed} /> },
    { index: 99 },
  );
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  // A long one: a plain swipe over it scrolls it, on a phone too.
  docs.open({ id: 'log', title: 'Build log', content: () => source(Array.from({ length: 80 }, (_, i) => `${String(i + 1).padStart(3, ' ')}  step ${i + 1} done`).join('\n')) }, { index: 99 });
  docs.split(docs.activeGroup!, 'right', docs.findDocument('src/orders/index.ts')!);
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.activate(docs.findDocument('note')!);
  docs.onPresentationChanged((e) => (s.shown = `${e.to} at ${e.width} px`));
  const width = (px: string) => (frame.element.style.inlineSize = px);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />
        <Button text="720 px" variant="outline" onclick={() => width('720px')} />
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />
        <output class="td-state">{() => s.shown || `Shown as: ${docs.currentPresentation}`}</output>
      </Stack>
      <div
        ref={(c: Component<HTMLDivElement>) => (frame = c)}
        class="td-frame"
        style="box-sizing: border-box; inline-size: 100%; max-inline-size: 100%; min-inline-size: 18rem; block-size: 30rem; overflow: hidden; resize: horizontal; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)"
      >
        {docs}
      </div>
    </>
  );
}
```

## Settings and events

Every part is a setting that can change at runtime, including how dock areas appear in each presentation (an area can set its own), swiping from an edge, the Back button, and how tab menus appear. `onPresentationChanging` can refuse a change.

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockPresentation, type TabPresentation } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { outline, problems, toolDocument } from './tools';

/**
 * Every part is a setting: how dock areas show on a phone and a tablet (the outline area says its
 * own), the swipe from an edge, the back button. onPresentationChanging can refuse a change: with
 * "Stay a phone" on, the phone does not go back to a tablet.
 */
export default function PresentationEvents() {
  const s = reactive({
    presentation: 'phone' as TabPresentation,
    phoneDock: 'sheet' as TabDockPresentation,
    tabletDock: 'auto' as TabDockPresentation,
    edge: true,
    back: true,
    stay: false,
    log: [] as string[],
  });
  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 5) s.log.shift();
  };
  const docs = new TabDocumentManager({
    label: 'Editor with presentation settings',
    presentation: () => s.presentation,
    phoneDockMode: () => s.phoneDock,
    tabletDockMode: () => s.tabletDock,
    edgeSwipe: () => s.edge,
    backButton: () => s.back,
    onPresentationChanging: (e) => {
      log(`changing ${e.from} → ${e.to}`);
      if (s.stay && e.from === 'phone') e.cancel = true;
    },
    onPresentationChanged: (e) => log(`changed to ${e.to}`),
  });
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('outline', 'Outline', outline), 'right');
  // The outline's area chooses a drawer for itself on a phone.
  docs.dockArea('right')!.phoneDockMode = 'drawer';
  const modes = [
    { value: 'auto', text: 'Auto' },
    { value: 'sheet', text: 'Sheet' },
    { value: 'drawer', text: 'Drawer' },
    { value: 'hidden', text: 'Hidden' },
  ];

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <Switch label="Stay a phone" x-model={() => s.stay} />
        <Switch label="Swipe from an edge" x-model={() => s.edge} />
        <Switch label="Back goes back" x-model={() => s.back} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup label="Dock areas on a phone" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.phoneDock} />
        <RadioGroup label="On a tablet" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.tabletDock} />
      </Stack>
      <output class="td-state">{() => s.log.join(' · ') || 'No changes yet.'}</output>
      {docs}
    </>
  );
}
```

## The document list on phones

| Gesture or key | Description |
| --- | --- |
| `Tap a row` | Shows that document and closes the list. |
| `Swipe a row sideways` | Closes the document, as determined by `onClosing`. A document that can only be hidden is hidden. Releasing early returns it to its place. |
| `Long press, then drag` | Lifts the row. Drag it up or down within its group, or into the section of another group, and release to move the document there (`onMoving`, `onMoved`). |
| `Long press, let go` | Opens the document's commands in an action sheet. |
| `Search` | Filters by title and description. |
| `Up, Down, Home, End; Enter` | Moves between rows, and Enter shows the document. |
| `Delete; Alt+Up, Alt+Down; the Menu key` | Closes it, moves it one position up or down (past an end, into the previous or next group), or opens its commands. |

## The Back button

Android's Back button and the browser's back gesture use the session history. Each sheet, drawer and list holds one entry while it is open and removes it when it closes another way, so no entries are left behind. The manager holds one entry while it can go back through its documents.

| When | Back |
| --- | --- |
| `A sheet or a drawer is open (a tool, a window, the list, an action sheet)` | The Back button closes the topmost one. |
| `Nothing is open, and the manager has gone through documents` | Goes back to the previous document (`goBack`), as long as there is one. |
| `Nothing to go back to` | The browser handles it, and the page goes back. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `presentation` | `Bind<'auto' \| 'desktop' \| 'tablet' \| 'phone'>` | `'auto'` | How the layout is presented: based on the manager's own width, or always the same way. |
| `phoneWidth` | `Bind<number>` | `560` | Below this width (of the manager, not the screen, in pixels), `auto` uses the phone presentation regardless of the pointer type. |
| `tabletWidth` | `Bind<number>` | `1024` | Below this width, `auto` uses the tablet presentation on touch screens (see `tabletWhen`). |
| `tabletWhen` | `Bind<'touch' \| 'width'>` | `'touch'` | With `'touch'`, the tablet presentation applies only when the device's pointer is a finger (`(pointer: coarse)`, tracked live). With a mouse, a narrow manager stays in the desktop presentation until it is below `phoneWidth`. With `'width'`, only the width is considered. |
| `narrowBars` | `Bind<'compact' \| 'documents'>` | `'compact'` | The appearance of the document group bars on a tablet or phone. By default, they use the `compact…` settings (no scroll buttons, shrinking tabs, small buttons, and a single document as a title), like the dock areas. `'documents'` keeps the desktop bar. Change the `compact…` props to adjust this appearance. |
| `phoneDockMode` | `Bind<'auto' \| 'sheet' \| 'drawer' \| 'hidden'>` | `'sheet'` | How dock areas appear on a phone. An area's own `phoneDockMode` takes precedence. |
| `tabletDockMode` | `Bind<'auto' \| 'sheet' \| 'drawer' \| 'hidden'>` | `'auto'` | How dock areas appear on a tablet. `auto` uses a drawer for the sides and top, and a sheet for the bottom. An area's own `tabletDockMode` takes precedence. |
| `edgeSwipe` | `Bind<boolean>` | `true` | On a tablet or phone, swiping in from an edge opens the dock area there as a drawer. |
| `backButton` | `Bind<boolean>` | `true` | On a phone, the browser's back action goes back through the documents once nothing is open on top. |
| `menuPresentation` | `Bind<'menu' \| 'sheet' \| 'auto' \| null>` | `null` | How tab menus appear. `null` uses an action sheet on a phone, a sheet for touch on a tablet, and a menu in the desktop presentation. |
| `onPresentationChanging` | `(e: PresentationChangingEventArgs) => void` | — | `{ from, to, width, cancel }`. If canceled, the presentation stays the same until the width or the setting changes again. |
| `onPresentationChanged` | `(e: PresentationChangedEventArgs) => void` | — | `{ from, to, width }`. |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `currentPresentation` | read-only, reactive | The current presentation: `'desktop'`, `'tablet'` or `'phone'`. |
| `showDocumentList(), hideDocumentList()` | `boolean` | On a phone, opens or closes the list of open documents. `documentListOpen` is reactive. |
| `showTool(doc), hideTool(area)` | `boolean` | On a tablet or phone, opens a dock area's drawer or sheet with that document shown, or closes it. `activate(doc)` on a tool, or on a document in a floating window, also opens its drawer or sheet. |
| `TabDockArea.phoneDockMode, tabletDockMode` | read/write, reactive | The area's own setting. `null` uses the manager's setting. |
| `split, move, float, dock, saveLayout…` | unchanged | These work as in the desktop presentation and change the layout, which appears as the current presentation allows. `moveToNewWindow` returns `null` on a phone. |

The drawers and sheets are the kit's [Drawer](drawer.md) and [BottomSheet](bottomsheet.md), and the action sheet is its [ActionSheet](actionsheet.md).

## Feedback

Loading issues…
