# TabDocumentManager: Drag and drop

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.2

Tabs and whole groups dragged as in a code editor: along a strip, to another group, beside a group or along an edge of the layout, between two managers, and the same moves from the keyboard. Every drop goes through the methods and events of what it does.

## Dragging tabs and groups

A copy of the tab follows the pointer; a mark shows where it goes among tabs, and a translucent area which half of a group (or all of it) a drop would take. Resting on a tab of another group activates it; the strip scrolls near its ends. The content is moved, never made again.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a made-up project. */
export const FILES = [
  { path: 'src/index.ts', text: "export { App } from './app';\nexport { router } from './router';" },
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\n\nexport const App = Application.CreateBuilder().build();" },
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },
  { path: 'src/orders/index.ts', text: "export * from './orders';" },
  { path: 'src/orders/orders.ts', text: 'export interface Order {\n  id: number;\n  amount: number;\n}' },
  { path: 'README.md', text: '# Shop\n\nA small shop written with MotifJS.' },
  { path: 'package.json', text: '{\n  "name": "shop",\n  "private": true\n}' },
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\n\nexport default defineConfig({});" },
];

/** A file's text, as a document's content. */
export function source(text: string): ComponentBase {
  // The panel scrolls (and takes focus for it): the text itself does not.
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;
}

/** A document for a file: its name as the title, its folder as the description. */
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {
  const file = FILES.find((f) => f.path === path);
  const at = path.lastIndexOf('/');
  return new TabDocument({
    id: path,
    type: 'file',
    title: path.slice(at + 1),
    description: at > 0 ? path.slice(0, at) : '',
    icon: () => <FileIcon />,
    content: () => source(file?.text ?? ''),
    ...extra,
  });
}
```

| Dropped | What happens |
| --- | --- |
| `Along the strip` | Reorders. A tab dropped among the pinned ones is pinned, one dropped among the others unpinned (`pinOnDrag`). |
| `On another strip` | Moves the tab there, at the place under the pointer; on the empty part of a strip, at the end. |
| `The middle of a group` | Moves the tab into that group, after its active tab (`openPosition`). |
| `An edge of a group` | Splits that group: a new group on that side with the tab. The edge zones are `dropEdgeSize` deep. |
| `An edge of the layout` | A thin band along the manager's sides (`layoutEdgeSize`): a new group along that whole side (`layoutEdgeDrop`). |
| `Ctrl held (Option on a Mac)` | Opens a copy there instead, when the document may be open twice (`allowDuplicate`, `copyModifier`). |
| `A group, by the empty part of its bar or its handle` | Moves the group with all its tabs beside another group or along an edge of the layout; into another group (or its strip) its tabs join that group. |
| `Outside the manager` | Floats in a window of its own (see [Dock and floating windows](tabdocs-dock.md)); where it may not float (`allowFloat`), or over a manager outside its `dragGroup`, it is refused (`target: 'outside'`). |

## Settings

Each part of drag and drop is a setting and changes live; a document's own `allowDrag` and a group's own `allowDrop` and `dropSides` win over the manager's.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a made-up project. */
export const FILES = [
  { path: 'src/index.ts', text: "export { App } from './app';\nexport { router } from './router';" },
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\n\nexport const App = Application.CreateBuilder().build();" },
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },
  { path: 'src/orders/index.ts', text: "export * from './orders';" },
  { path: 'src/orders/orders.ts', text: 'export interface Order {\n  id: number;\n  amount: number;\n}' },
  { path: 'README.md', text: '# Shop\n\nA small shop written with MotifJS.' },
  { path: 'package.json', text: '{\n  "name": "shop",\n  "private": true\n}' },
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\n\nexport default defineConfig({});" },
];

/** A file's text, as a document's content. */
export function source(text: string): ComponentBase {
  // The panel scrolls (and takes focus for it): the text itself does not.
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;
}

/** A document for a file: its name as the title, its folder as the description. */
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {
  const file = FILES.find((f) => f.path === path);
  const at = path.lastIndexOf('/');
  return new TabDocument({
    id: path,
    type: 'file',
    title: path.slice(at + 1),
    description: at > 0 ? path.slice(0, at) : '',
    icon: () => <FileIcon />,
    content: () => source(file?.text ?? ''),
    ...extra,
  });
}
```

## Between two managers

Managers that share a `dragGroup` take each other's tabs and groups. The tab, its panel and its content go along; the other manager asks through its own `onOpening`, after `onMoving` in the first.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a made-up project. */
export const FILES = [
  { path: 'src/index.ts', text: "export { App } from './app';\nexport { router } from './router';" },
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\n\nexport const App = Application.CreateBuilder().build();" },
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },
  { path: 'src/orders/index.ts', text: "export * from './orders';" },
  { path: 'src/orders/orders.ts', text: 'export interface Order {\n  id: number;\n  amount: number;\n}' },
  { path: 'README.md', text: '# Shop\n\nA small shop written with MotifJS.' },
  { path: 'package.json', text: '{\n  "name": "shop",\n  "private": true\n}' },
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\n\nexport default defineConfig({});" },
];

/** A file's text, as a document's content. */
export function source(text: string): ComponentBase {
  // The panel scrolls (and takes focus for it): the text itself does not.
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;
}

/** A document for a file: its name as the title, its folder as the description. */
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {
  const file = FILES.find((f) => f.path === path);
  const at = path.lastIndexOf('/');
  return new TabDocument({
    id: path,
    type: 'file',
    title: path.slice(at + 1),
    description: at > 0 ? path.slice(0, at) : '',
    icon: () => <FileIcon />,
    content: () => source(file?.text ?? ''),
    ...extra,
  });
}
```

## From the keyboard

Keys move the active tab along its strip or to another group, and “Move to…” (the tab's menu, the strip's menu for a whole group, Ctrl+K M, or `showMoveTo`) reaches every place a drag does, with the same areas shown and each place announced.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a made-up project. */
export const FILES = [
  { path: 'src/index.ts', text: "export { App } from './app';\nexport { router } from './router';" },
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\n\nexport const App = Application.CreateBuilder().build();" },
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },
  { path: 'src/orders/index.ts', text: "export * from './orders';" },
  { path: 'src/orders/orders.ts', text: 'export interface Order {\n  id: number;\n  amount: number;\n}' },
  { path: 'README.md', text: '# Shop\n\nA small shop written with MotifJS.' },
  { path: 'package.json', text: '{\n  "name": "shop",\n  "private": true\n}' },
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\n\nexport default defineConfig({});" },
];

/** A file's text, as a document's content. */
export function source(text: string): ComponentBase {
  // The panel scrolls (and takes focus for it): the text itself does not.
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;
}

/** A document for a file: its name as the title, its folder as the description. */
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {
  const file = FILES.find((f) => f.path === path);
  const at = path.lastIndexOf('/');
  return new TabDocument({
    id: path,
    type: 'file',
    title: path.slice(at + 1),
    description: at > 0 ? path.slice(0, at) : '',
    icon: () => <FileIcon />,
    content: () => source(file?.text ?? ''),
    ...extra,
  });
}
```

| Browser | Installed app (desktop keys) | Does |
| --- | --- | --- |
| `Alt + Shift + Page Up / Page Down` | Ctrl + Shift + Page Up / Page Down | The active tab a place along its strip (`moveTabLeft`, `moveTabRight`). |
| `Ctrl + Alt + Right / Left` | the same | The active document to the next / previous group (`moveToNextGroup`, `moveToPreviousGroup`). |
| `Ctrl + K, then Shift + an arrow` | the same | To the group on that side, or into a new group there (`moveToGroupLeft`, `…Right`, `…Up`, `…Down`). |
| `Ctrl + K, then M` | the same | "Move to…" for the active document (`moveTo`); the tab's menu and the strip's menu have it too. |

### In “Move to…”

| Key | Does |
| --- | --- |
| `Arrows` | A side of the group; again towards that side, the next group that way, or the edge of the layout; the other way, back to the middle (`targetLeft`, `targetRight`, `targetUp`, `targetDown`). |
| `Tab, Shift + Tab` | The next / previous group, its middle (`targetNextGroup`, `targetPreviousGroup`). |
| `Enter` | Moves it there (`targetDrop`). |
| `Escape` | Leaves everything where it was (`targetCancel`); so does a press anywhere. |

## Changing or refusing a drop

`onDragOver` sees each place and may change it or refuse it; `onDropping` may still stop the drop. Then the events of what the drop does fire (`onMoved`, `onSplit`, …) and `onDropped`.

```tsx
docs.onDragOver((e) => {
  // Reports stay in their own group: no drop anywhere else.
  if (e.document?.type === 'report' && e.group !== e.from) e.cancel = true;
});
docs.onDropping((e) => {
  // A drop on the right edge of a group opens the new group below it instead.
  if (e.target === 'group' && e.side === 'right') e.side = 'down';
});
```

## Accessibility

| Topic | How |
| --- | --- |
| `Every drag has keys` | "Move to…" reaches every place a pointer can: each side of each group, the edges of the layout, other managers of the same `dragGroup`. |
| `Announcements` | Each place "Move to…" points at is said ("New group to the right of group 2", or "cannot go here"), then moved, copied, split, or canceled. |
| `Touch and pen` | A long press starts the drag, so a swipe still scrolls the strip; held still and let go, it opens the tab's menu. |
| `Escape` | Cancels a pointer drag too, and puts back what resting on tabs activated and what the strips scrolled. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowDrag` | `Bind<boolean>` | `true` | Tabs can be dragged; a document's own `allowDrag` wins. |
| `allowDragGroups` | `Bind<boolean>` | `true` | Groups can be dragged by the empty part of their bar. |
| `groupDragHandle` | `Bind<boolean>` | `false` | A handle at the start of each group's toolbar to drag the group by, also when its tabs fill the bar; a click on it (or Enter) starts “Move group to…”. |
| `dropSides` | `Bind<readonly ('center' \| 'left' \| 'right' \| 'up' \| 'down')[]>` | all five | Where a drop on a group's content may go; a group's own `dropSides` wins. |
| `dropEdgeSize` | `Bind<number \| string>` | `'33%'` | How deep the edge zones of a group's content are: pixels, or a share. |
| `layoutEdgeDrop, layoutEdgeSize` | `Bind<boolean>`, `Bind<number>` | `true`, `16` | Drops along the edges of the whole layout, and how deep that band is, in pixels. |
| `dragThreshold` | `Bind<number>` | `5` | How far, in pixels, the pointer moves before a press becomes a drag. |
| `longPressDelay` | `Bind<number>` | `500` | How long, in milliseconds, a finger or a pen rests on a tab before it drags it; a swipe before that scrolls the strip. |
| `dragHoverActivate, dragHoverDelay` | `Bind<boolean>`, `Bind<number>` | `true`, `750` | Resting on a tab of another group while dragging activates it, after that many milliseconds. |
| `pinOnDrag` | `Bind<boolean>` | `true` | Dragging across the border between pinned and other tabs pins or unpins; `false` keeps each tab on its side. |
| `copyModifier` | `Bind<'auto' \| 'ctrl' \| 'alt' \| 'shift' \| 'meta' \| 'none'>` | `'auto'` | The key that makes a drop a copy: Ctrl, Option on Apple platforms. |
| `dragGroup` | `Bind<string \| null>` | `null` | Managers with the same name take each other's tabs and groups. |
| `dragGhost, dragAutoScroll` | `Bind<boolean>` | `true` | The copy of the tab under the pointer; the strip scrolling near its ends. |

### TabGroup

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `allowDrop` | `Bind<boolean>` | `true` | Drops into the group and beside it; `false` for a group that takes nothing. Saved with the layout. |
| `dropSides` | `Bind<readonly TabDropSide[] \| null>` | `null` | The group's own drop sides; `null` follows the manager. Saved with the layout. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowDrag` | `Bind<boolean \| undefined>` | This document's own setting; `undefined` follows the manager. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `move(doc, group, index?)` | `boolean` | What a drop on a strip or into a group does (milestone 1). |
| `split(group \| null, direction, doc?)` | `TabGroup \| null` | What a drop on an edge does; `null` splits the whole layout along that edge. |
| `moveGroup(group, target \| null, side)` | `boolean` | A whole group beside `target` (`'left'`, `'right'`, `'up'`, `'down'`), into it (`'center'`), or along an edge of the layout (`target` `null`). |
| `moveInGroup(doc, by)` | `boolean` | A place along the strip (`-1` towards the start), not past the pinned or the other tabs. |
| `moveToGroup(doc, which)` | `boolean` | `'next'`, `'previous'`, or the group on that side (`'left'`, `'right'`, `'up'`, `'down'`); a new group when there is none. |
| `showMoveTo(doc \| group)` | `boolean` | "Move to…" from the keyboard (see below). |
| `cancelDrag()` | `boolean` | Stops a drag or "Move to…"; everything goes back. |
| `addDropTarget(target, index?)` | `() => void` | A target of your own, asked before the built-in one: `placeAt(x, y, drag)`, `marks(place, drag)`, `drop(place, drag)`. Returns the function that removes it. |
| `dragging` | read-only, reactive | `{ document, group, manager, copy }` while something is dragged, else `null`. |
| `dropTargets` | read-only | The targets in the order they are asked. |

### Events

| Event | What it carries |
| --- | --- |
| `onDragStarting(e)` | `{ document, group, pointerType, byKeyboard }`, cancelable; `document` is `null` for a group. |
| `onDragOver(e)` | `{ document, from, target, manager, group, index, side, copy, byKeyboard }`: change the place, or `cancel` to refuse it. `target` is `'strip'`, `'group'`, `'edge'`, `'float'`, `'dock-guide'`, `'dock-area'` or `'outside'` (refused). |
| `onDropping(e)` | The same, just before the drop; cancel keeps everything where it is. |
| `onDropped(e)` | Where it ended: `group` is the new group of a split, `document` the copy when one was opened. |
| `onDragEnded(e)` | `{ document, from, dropped, byKeyboard }`, dropped or not. |
| `onMoving / onMoved, onSplitting / onSplit, onOpening / onOpened, onPinning…` | Still fire for what the drop does, so there is one way the model changes. A tab from another manager arrives through `onOpening` there, after `onMoving` here. |

### Styling hooks

| Selector or token | What |
| --- | --- |
| `.mx-tabdocs[data-dragging]` | While dragging: `move`, `copy` or `none` (what a drop would do now); the cursor follows it. |
| `.mx-tabdocs__tab[data-dragging], .mx-tabdocs__group[data-dragging]` | The tab, or the group, being dragged. |
| `.mx-tabdocs__ghost` | The copy under the pointer; `data-kind` (`tab`, `group`), `data-target` (`move`, `copy`, `none`). |
| `.mx-tabdocs__drop` | The translucent area a drop would take; it glides between places (the motion tokens: none with reduced motion). |
| `.mx-tabdocs__insert` | The mark between two tabs. |
| `.mx-tabdocs__grip` | The group's handle (`groupDragHandle`), a button of the group's toolbar. |
| `tabdocs.drop, drop-fill, insert, ghost` | Their units (the ghost: `copy`, `refused`; a dragged tab: the `tab` unit's `dragging`). |

The rest of the API is on the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md) and [Menus and keys](tabdocs-menus.md).

## Example files

`DragDrop.tsx`

```tsx
import { reactive } from '@motifx/core';
import { TabDocumentManager, type TabDroppedEventArgs } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** What a drop did, in a few words. */
function describe(e: TabDroppedEventArgs): string {
  const what = e.document?.title ?? 'a group';
  const where = e.target === 'strip' ? `place ${e.index + 1} of a strip` : e.target === 'edge' ? `the ${e.side} edge` : e.side === 'center' ? 'a group' : `the ${e.side} of a group`;
  return `${what} ${e.copy ? 'copied' : 'moved'} to ${where}`;
}

/**
 * Drag a tab along its strip, onto another strip, into a group (the middle of its content) or
 * beside it (an edge), or along an edge of the whole layout. Drag a group by the empty part of its
 * bar or by its handle. Hold Ctrl (Option on a Mac) while dropping for a copy; Escape puts everything back.
 */
export default function DragDrop() {
  const s = reactive({ last: 'Drag a tab, or a group by its handle.' });
  // Narrow groups, for the narrow column of this page; a handle drags a group whose tabs fill its bar.
  const docs = new TabDocumentManager({ label: 'Files to drag', allowDuplicate: true, minGroupWidth: 100, groupDragHandle: true });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(4, 6)) right.open(fileDocument(file.path), { index: 99 });
  const below = docs.split(right, 'down')!;
  for (const file of FILES.slice(6)) below.open(fileDocument(file.path), { index: 99 });
  docs.onDropped((e) => (s.last = describe(e)));
  docs.onDragEnded((e) => {
    if (!e.dropped) s.last = 'Nothing moved.';
  });

  return (
    <>
      {docs}
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
```

`files.tsx`

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a made-up project. */
export const FILES = [
  { path: 'src/index.ts', text: "export { App } from './app';\nexport { router } from './router';" },
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\n\nexport const App = Application.CreateBuilder().build();" },
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },
  { path: 'src/orders/index.ts', text: "export * from './orders';" },
  { path: 'src/orders/orders.ts', text: 'export interface Order {\n  id: number;\n  amount: number;\n}' },
  { path: 'README.md', text: '# Shop\n\nA small shop written with MotifJS.' },
  { path: 'package.json', text: '{\n  "name": "shop",\n  "private": true\n}' },
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\n\nexport default defineConfig({});" },
];

/** A file's text, as a document's content. */
export function source(text: string): ComponentBase {
  // The panel scrolls (and takes focus for it): the text itself does not.
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;
}

/** A document for a file: its name as the title, its folder as the description. */
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {
  const file = FILES.find((f) => f.path === path);
  const at = path.lastIndexOf('/');
  return new TabDocument({
    id: path,
    type: 'file',
    title: path.slice(at + 1),
    description: at > 0 ? path.slice(0, at) : '',
    icon: () => <FileIcon />,
    content: () => source(file?.text ?? ''),
    ...extra,
  });
}
```

`DragOptions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDropSide } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

const SIDES: Record<string, readonly TabDropSide[]> = {
  all: ['center', 'left', 'right', 'up', 'down'],
  sides: ['left', 'right'],
  center: ['center'],
};

/** Every part of drag and drop is a setting, live; a group can take no drops at all. */
export default function DragOptions() {
  const s = reactive({ allowDrag: true, allowDragGroups: true, pinOnDrag: true, layoutEdgeDrop: true, hover: true, ghost: true, sides: 'all', closed: false });
  const docs = new TabDocumentManager({
    label: 'Files with drag settings',
    allowDrag: () => s.allowDrag,
    allowDragGroups: () => s.allowDragGroups,
    pinOnDrag: () => s.pinOnDrag,
    layoutEdgeDrop: () => s.layoutEdgeDrop,
    dragHoverActivate: () => s.hover,
    dragGhost: () => s.ghost,
    dropSides: () => SIDES[s.sides],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  FILES.slice(0, 5).forEach((file, i) => docs.open(fileDocument(file.path), { index: 99, pinned: i < 2 }));
  const second = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(5)) second.open(fileDocument(file.path), { index: 99 });
  second.allowDrop = () => !s.closed;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Drag tabs" x-model={() => s.allowDrag} />
        <Switch label="Drag groups" x-model={() => s.allowDragGroups} />
        <Switch label="Pin across the border" x-model={() => s.pinOnDrag} />
        <Switch label="Layout edges" x-model={() => s.layoutEdgeDrop} />
        <Switch label="Activate on hover" x-model={() => s.hover} />
        <Switch label="Copy under the pointer" x-model={() => s.ghost} />
        <Switch label="Group 2 takes nothing" x-model={() => s.closed} />
      </Stack>
      <RadioGroup
        label="Drops on a group"
        orientation="horizontal"
        items={[
          { value: 'all', text: 'Centre and edges' },
          { value: 'sides', text: 'Left and right only' },
          { value: 'center', text: 'Centre only' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.sides}
      />
      {docs}
    </>
  );
}
```

`BetweenManagers.tsx`

```tsx
import { reactive } from '@motifx/core';
import { TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Two managers with the same `dragGroup` take each other's tabs and groups. The content moves with
 * its tab, it is not made again: an edit in a moved tab is still there.
 */
export default function BetweenManagers() {
  const s = reactive({ last: 'Drag a tab from one manager to the other.' });
  const style = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';
  // Narrow side by side, they still show as on a desktop (see the Tablet and phone page).
  const left = new TabDocumentManager({ label: 'Project files', dragGroup: 'files', presentation: 'desktop' });
  const right = new TabDocumentManager({ label: 'Pinned files', dragGroup: 'files', presentation: 'desktop' });
  left.element.style.cssText = style;
  right.element.style.cssText = style;
  for (const file of FILES.slice(0, 5)) left.open(fileDocument(file.path), { index: 99 });
  for (const file of FILES.slice(5)) right.open(fileDocument(file.path), { index: 99 });
  for (const docs of [left, right]) {
    docs.onOpened((e) => {
      if (e.byUser) s.last = `${e.document.title} came into ${docs.label}`;
    });
  }

  return (
    <>
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">
        {left}
        {right}
      </div>
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
```

`MoveWithKeys.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * "Move to…" (the tab's menu, Ctrl+K M, or these buttons): the arrow keys choose a side of a group,
 * an arrow towards it again goes on to the next group, Tab picks the next group, Enter moves,
 * Escape leaves it. The same areas as a drag show where it goes.
 */
export default function MoveWithKeys() {
  const s = reactive({ place: 'Press a button, or Ctrl+K M on a tab.' });
  const docs = new TabDocumentManager({ label: 'Files to move with keys' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(4)) right.open(fileDocument(file.path), { index: 99 });
  docs.onDragOver((e) => {
    if (e.byKeyboard) s.place = e.target === 'edge' ? `the ${e.side} edge of the layout` : `group ${(e.group?.index ?? 0) + 1}, ${e.side}`;
  });
  docs.onDragEnded((e) => (s.place = e.dropped ? 'Moved.' : 'Left where it was.'));

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move to…" variant="outline" enabled={() => !!docs.activeDocument} onclick={() => docs.showMoveTo(docs.activeDocument!)} />
        <Button text="Move group to…" variant="outline" enabled={() => docs.groups.length > 1} onclick={() => docs.showMoveTo(docs.activeGroup!)} />
        <output class="td-state">{() => s.place}</output>
      </Stack>
      {docs}
    </>
  );
}
```
