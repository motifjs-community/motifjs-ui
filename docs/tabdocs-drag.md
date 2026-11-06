# TabDocumentManager: Drag and drop

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.3

Drag tabs and whole groups as you would in a code editor: along a strip, to another group, beside a group, along an edge of the layout, or between two managers. The same moves are available from the keyboard, and every drop goes through the methods and events of the action it performs.

## Dragging tabs and groups

A copy of the tab follows the pointer. A marker shows the position among tabs, and a translucent area shows which half of a group (or all of it) a drop would take. Pausing on a tab of another group activates it, and the strip scrolls near its ends. The content is moved, never recreated.

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

| Drop target | Result |
| --- | --- |
| `Along the strip` | Reorders the tab. A tab dropped among the pinned tabs becomes pinned, and a tab dropped among the others becomes unpinned (`pinOnDrag`). |
| `On another strip` | Moves the tab to the position under the pointer, or to the end when dropped on the empty part of a strip. |
| `The middle of a group` | Moves the tab into that group, after its active tab (`openPosition`). |
| `An edge of a group` | Splits that group and places the tab in a new group on that side. The edge zones are `dropEdgeSize` deep. |
| `An edge of the layout` | A thin band along the sides of the manager (`layoutEdgeSize`). Creates a new group along that whole side (`layoutEdgeDrop`). |
| `Ctrl held (Option on a Mac)` | Opens a copy there instead, if the document can be open twice (`allowDuplicate`, `copyModifier`). |
| `A group, by the empty part of its bar or its handle` | Moves the group with all its tabs beside another group or along an edge of the layout. When dropped into another group or its strip, its tabs join that group. |
| `Outside the manager` | Floats in its own window (see [Dock and floating windows](tabdocs-dock.md)). Where floating is not allowed (`allowFloat`), or over a manager outside its `dragGroup`, the drop is refused (`target: 'outside'`). |

## Settings

Every part of drag and drop is a setting that can change at runtime. A document's own `allowDrag`, and a group's own `allowDrop` and `dropSides`, take precedence over the manager's.

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

Managers that share a `dragGroup` accept each other's tabs and groups. The tab, its panel and its content all move, and the other manager raises its own `onOpening` after `onMoving` in the first.

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

Keys move the active tab along its strip or to another group. “Move to…” (in the tab menu, the strip menu for a whole group, Ctrl+K M or `showMoveTo`) reaches every position a drag can reach, shows the same areas and announces each position.

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

| Browser | Installed app (desktop keys) | Action |
| --- | --- | --- |
| `Alt + Shift + Page Up / Page Down` | Ctrl + Shift + Page Up / Page Down | Moves the active tab one position along its strip (`moveTabLeft`, `moveTabRight`). |
| `Ctrl + Alt + Right / Left` | Same | Moves the active document to the next or previous group (`moveToNextGroup`, `moveToPreviousGroup`). |
| `Ctrl + K, then Shift + an arrow` | Same | Moves to the group on that side, or to a new group there (`moveToGroupLeft`, `…Right`, `…Up`, `…Down`). |
| `Ctrl + K, then M` | Same | Opens "Move to…" for the active document (`moveTo`). It is also in the tab menu and the strip menu. |

### In “Move to…”

| Key | Action |
| --- | --- |
| `Arrows` | Chooses a side of the group. Pressing the same direction again moves to the next group in that direction or to the edge of the layout, and the opposite direction returns to the middle (`targetLeft`, `targetRight`, `targetUp`, `targetDown`). |
| `Tab, Shift + Tab` | Moves to the middle of the next or previous group (`targetNextGroup`, `targetPreviousGroup`). |
| `Enter` | Moves it there (`targetDrop`). |
| `Escape` | Cancels and leaves everything in place (`targetCancel`). Clicking anywhere does the same. |

## Changing or refusing a drop

`onDragOver` sees each position and can change or refuse it, and `onDropping` can still stop the drop. The events of the action then occur (`onMoved`, `onSplit` …), followed by `onDropped`.

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

| Topic | Details |
| --- | --- |
| `Every drag has keys` | "Move to…" reaches every position a pointer can: each side of each group, the edges of the layout, and other managers in the same `dragGroup`. |
| `Announcements` | Each position "Move to…" highlights is announced ("New group to the right of group 2", or "cannot go here"), followed by the result: moved, copied, split or canceled. |
| `Touch and pen` | A long press starts the drag, so a swipe still scrolls the strip. Holding still and releasing opens the tab menu. |
| `Escape` | Also cancels a pointer drag, and restores anything activated by pausing on tabs and any strip scrolling. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowDrag` | `Bind<boolean>` | `true` | Allows tabs to be dragged. A document's own `allowDrag` takes precedence. |
| `allowDragGroups` | `Bind<boolean>` | `true` | Allows groups to be dragged by the empty part of their bar. |
| `groupDragHandle` | `Bind<boolean>` | `false` | Adds a handle at the start of each group's toolbar for dragging the group, even when its tabs fill the bar. Clicking it, or pressing Enter, starts “Move group to…”. |
| `dropSides` | `Bind<readonly ('center' \| 'left' \| 'right' \| 'up' \| 'down')[]>` | all five | The positions a drop on a group's content can take. A group's own `dropSides` takes precedence. |
| `dropEdgeSize` | `Bind<number \| string>` | `'33%'` | The depth of the edge zones of a group's content, in pixels or as a share. |
| `layoutEdgeDrop, layoutEdgeSize` | `Bind<boolean>`, `Bind<number>` | `true`, `16` | Allows drops along the edges of the whole layout, and sets the depth of that band in pixels. |
| `dragThreshold` | `Bind<number>` | `5` | The distance in pixels the pointer must move before a press becomes a drag. |
| `longPressDelay` | `Bind<number>` | `500` | How long, in milliseconds, a finger or pen must rest on a tab before dragging it. A swipe before that scrolls the strip. |
| `dragHoverActivate, dragHoverDelay` | `Bind<boolean>`, `Bind<number>` | `true`, `750` | Pausing on a tab of another group while dragging activates it after this many milliseconds. |
| `pinOnDrag` | `Bind<boolean>` | `true` | Dragging across the boundary between pinned and other tabs pins or unpins them. `false` keeps each tab on its side. |
| `copyModifier` | `Bind<'auto' \| 'ctrl' \| 'alt' \| 'shift' \| 'meta' \| 'none'>` | `'auto'` | The key that makes a drop a copy: Ctrl, or Option on Apple platforms. |
| `dragGroup` | `Bind<string \| null>` | `null` | Managers with the same name accept each other's tabs and groups. |
| `dragGhost, dragAutoScroll` | `Bind<boolean>` | `true` | The copy of the tab under the pointer, and the strip scrolling near its ends. |

### TabGroup

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `allowDrop` | `Bind<boolean>` | `true` | Allows drops into and beside the group. Use `false` for a group that accepts nothing. Saved with the layout. |
| `dropSides` | `Bind<readonly TabDropSide[] \| null>` | `null` | The group's own drop sides. `null` uses the manager's setting. Saved with the layout. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowDrag` | `Bind<boolean \| undefined>` | Overrides the manager's setting for this document. `undefined` inherits the manager's value. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `move(doc, group, index?)` | `boolean` | What a drop on a strip or into a group performs. |
| `split(group \| null, direction, doc?)` | `TabGroup \| null` | What a drop on an edge performs. `null` splits the whole layout along that edge. |
| `moveGroup(group, target \| null, side)` | `boolean` | Moves a whole group beside `target` (`'left'`, `'right'`, `'up'`, `'down'`), into it (`'center'`), or along an edge of the layout (`target` is `null`). |
| `moveInGroup(doc, by)` | `boolean` | Moves one position along the strip (`-1` toward the start), without passing the boundary between pinned and other tabs. |
| `moveToGroup(doc, which)` | `boolean` | `'next'`, `'previous'`, or the group on that side (`'left'`, `'right'`, `'up'`, `'down'`). Creates a new group if there is none. |
| `showMoveTo(doc \| group)` | `boolean` | Starts "Move to…" from the keyboard (see below). |
| `cancelDrag()` | `boolean` | Stops a drag or "Move to…" and restores everything. |
| `addDropTarget(target, index?)` | `() => void` | A custom target, checked before the built-in one: `placeAt(x, y, drag)`, `marks(place, drag)`, `drop(place, drag)`. Returns a function that removes it. |
| `dragging` | read-only, reactive | `{ document, group, manager, copy }` during a drag, otherwise `null`. |
| `dropTargets` | read-only | The targets in the order they are checked. |

### Events

| Event | Contents |
| --- | --- |
| `onDragStarting(e)` | `{ document, group, pointerType, byKeyboard }`, cancelable. `document` is `null` for a group. |
| `onDragOver(e)` | `{ document, from, target, manager, group, index, side, copy, byKeyboard }`. Change the position, or set `cancel` to refuse it. `target` is `'strip'`, `'group'`, `'edge'`, `'float'`, `'dock-guide'`, `'dock-area'` or `'outside'` (refused). |
| `onDropping(e)` | The same, raised just before the drop. Canceling leaves everything in place. |
| `onDropped(e)` | The result: `group` is the new group of a split, and `document` is the copy when one was opened. |
| `onDragEnded(e)` | `{ document, from, dropped, byKeyboard }`, raised whether or not it was dropped. |
| `onMoving / onMoved, onSplitting / onSplit, onOpening / onOpened, onPinning…` | Still occur for the action the drop performs, so the model changes in only one way. A tab from another manager arrives through `onOpening` there, after `onMoving` here. |

### Styling hooks

| Selector or token | Item |
| --- | --- |
| `.mx-tabdocs[data-dragging]` | During a drag: `move`, `copy` or `none`, which is what a drop would do now. The cursor follows it. |
| `.mx-tabdocs__tab[data-dragging], .mx-tabdocs__group[data-dragging]` | The tab or group being dragged. |
| `.mx-tabdocs__ghost` | The copy under the pointer, with `data-kind` (`tab`, `group`) and `data-target` (`move`, `copy`, `none`). |
| `.mx-tabdocs__drop` | The translucent area a drop would take. It glides between positions, using the motion tokens (no motion with reduced motion). |
| `.mx-tabdocs__insert` | The marker between two tabs. |
| `.mx-tabdocs__grip` | The group's handle (`groupDragHandle`), a button in the group's toolbar. |
| `tabdocs.drop, drop-fill, insert, ghost` | Their units (the drag image: `copy`, `refused`; a dragged tab: the `dragging` state of the `tab` unit). |

See the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md) and [Menus and keys](tabdocs-menus.md) for the rest of the API.

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
