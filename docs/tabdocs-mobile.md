# TabDocumentManager: Tablet and phone

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.1

On a tablet and a phone a layout of groups, splits and dock areas does not fit as it is. The manager keeps the layout and shows it another way: the same documents, groups and areas, the same saved JSON, the content moved and never made again. It goes by its own width, not by the device; on a touch screen its tabs and buttons get larger.

## Import

```tsx
import { TabDocumentManager, type TabPresentation, type TabDockPresentation } from '@motifx-community/ui';
```

## Three ways to show one layout

| Presentation | What shows |
| --- | --- |
| `Desktop` | The layout as it is: groups side by side and one under the other, dock areas around them, floating windows, new browser windows. |
| `Tablet` | At most two groups side by side: the first branch of the layout on one side, the rest on the other, each showing the group used last; the groups that do not fit fold as tabs into the strip of the group beside them (their tabs keep their own group: a tap activates that group there). Dock areas become drawers from their edge, the bottom one a sheet, opened from their titles along the edges or by a finger swiping in from the edge. A floating window is a large sheet. |
| `Phone` | One document, full screen. Above it a bar: its title (a swipe left or right goes to the document beside it, a tap opens its commands in an action sheet), its close button and the number of open documents, which opens the list of them. Tools of the dock areas are buttons in a bar at the bottom: a tap opens a sheet (peek, half, full by its handle; swipe down closes it), or a drawer for an area that asks for one. A floating window is a full-screen sheet. New browser windows are off; the tab menu is an action sheet. |

Pick one: the layout under it does not change. Save the layout in each presentation: the JSON is the same.

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

## By its own width

With `presentation: 'auto'` (the default) the manager watches its own width and the screen's pointer. Under `phoneWidth` (560) it shows as on a phone, whatever the pointer: phones are 360 to 430 pixels wide, while a manager of about 590 beside a desktop page's side column stays a desktop. Under `tabletWidth` (1024) it shows as on a tablet when the screen is a touch screen; with a mouse it stays a desktop (`tabletWhen: 'width'` lets the width alone decide). An app changes both limits to fit its layout. Drag the frame's corner: what you type in the note and how far a file is scrolled stay.

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument, source } from './files';
import { problems, toolDocument } from './tools';

/**
 * A manager that follows its own width (`presentation: 'auto'`): drag the frame's corner, or pick a
 * width. Under 560 pixels it shows as on a phone; under 1024 as on a tablet when the screen is a touch
 * screen (with a mouse it stays a desktop). A text and a scroll position are kept across every change:
 * the content moves, it is never made again.
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

Every part is a setting, live: how dock areas show on each (an area may say its own), the swipe from an edge, the back button, how the tab menus show. `onPresentationChanging` can refuse a change.

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

## The phone's list of documents

| Gesture or key | What it does |
| --- | --- |
| `Tap a row` | Shows that document and closes the list. |
| `Swipe a row sideways` | Closes the document (asking as `onClosing` says; a document that may only be hidden is hidden). Let go early, it goes back. |
| `Long press, then drag` | Lifts the row: drag it up or down its group, or into another group's section; let go to move the document there (`onMoving` / `onMoved`). |
| `Long press, let go` | Opens the document's commands in an action sheet. |
| `Search` | Filters by title and description. |
| `Up, Down, Home, End; Enter` | Between the rows; Enter shows the document. |
| `Delete; Alt+Up, Alt+Down; the Menu key` | Closes it; moves it a place up or down (past an end, into the group before or after); opens its commands. |

## The back button

Android's back button and the browser's back gesture go through the session history. Each sheet, drawer and list holds one entry while it is open and takes it back when it closes otherwise, so no entry is left behind; the manager holds one while it can go back through its documents.

| When | Back |
| --- | --- |
| `A sheet or a drawer is open (a tool, a window, the list, an action sheet)` | The back button closes the one on top. |
| `Nothing is open, and the manager has gone through documents` | It goes back to the document before (`goBack`), as long as there is one. |
| `Nothing to go back to` | It is the browser's again: the page goes back. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `presentation` | `Bind<'auto' \| 'desktop' \| 'tablet' \| 'phone'>` | `'auto'` | How the layout shows: by the manager's own width, or always one way. |
| `phoneWidth` | `Bind<number>` | `560` | Under this width (in pixels of the manager, not of the screen) `auto` shows it as on a phone, whatever the pointer. |
| `tabletWidth` | `Bind<number>` | `1024` | Under this width `auto` shows it as on a tablet, on a touch screen (see `tabletWhen`). |
| `tabletWhen` | `Bind<'touch' \| 'width'>` | `'touch'` | `'touch'`: the tablet layout only when the screen's pointer is a finger (`(pointer: coarse)`, followed live); with a mouse a narrow manager stays a desktop until it is under `phoneWidth`. `'width'`: the width alone. |
| `narrowBars` | `Bind<'compact' \| 'documents'>` | `'compact'` | How the documents' groups' bars look on a tablet or a phone: with the `compact…` settings (no scroll buttons, shrinking tabs, small buttons, a single document as a title), as in the dock areas; `'documents'` keeps the desktop bar. Change the `compact…` props to change that look. |
| `phoneDockMode` | `Bind<'auto' \| 'sheet' \| 'drawer' \| 'hidden'>` | `'sheet'` | How dock areas show on a phone; an area's own `phoneDockMode` wins. |
| `tabletDockMode` | `Bind<'auto' \| 'sheet' \| 'drawer' \| 'hidden'>` | `'auto'` | How dock areas show on a tablet: `auto` is a drawer for the sides and the top, a sheet for the bottom. An area's own `tabletDockMode` wins. |
| `edgeSwipe` | `Bind<boolean>` | `true` | On a tablet or a phone a finger swiping in from an edge opens the dock area there, as a drawer. |
| `backButton` | `Bind<boolean>` | `true` | On a phone the browser's back goes back through the documents once nothing is open on top. |
| `menuPresentation` | `Bind<'menu' \| 'sheet' \| 'auto' \| null>` | `null` | How the tab menus show; `null`: an action sheet on a phone, a sheet for a finger on a tablet, a menu on a desktop. |
| `onPresentationChanging` | `(e: PresentationChangingEventArgs) => void` | — | `{ from, to, width, cancel }`: refused, the layout keeps showing as it does until the width or the setting changes again. |
| `onPresentationChanged` | `(e: PresentationChangedEventArgs) => void` | — | `{ from, to, width }`. |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `currentPresentation` | read-only, reactive | How it shows now: `'desktop'`, `'tablet'` or `'phone'`. |
| `showDocumentList(), hideDocumentList()` | `boolean` | On a phone: opens or closes the list of open documents. `documentListOpen` is reactive. |
| `showTool(doc), hideTool(area)` | `boolean` | On a tablet or a phone: opens a dock area's drawer or sheet with that document shown, or closes it. `activate(doc)` of a tool or of a document in a floating window opens its drawer or sheet too. |
| `TabDockArea.phoneDockMode, tabletDockMode` | read/write, reactive | The area's own setting; `null` follows the manager. |
| `split, move, float, dock, saveLayout…` | unchanged | Work as on a desktop and change the layout; it is shown the way the presentation allows. `moveToNewWindow` returns `null` on a phone. |

The drawers and sheets are the kit's [Drawer](drawer.md) and [BottomSheet](bottomsheet.md), the action sheet its [ActionSheet](actionsheet.md).
