# TabDocumentManager: Dock and floating windows

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.3

Documents and whole groups can float in their own windows within the page, and dock again into document groups or into dock areas around them, which can collapse to the edge of the manager. The mouse, the keyboard and the API all perform the same actions through the same events.

## Tool areas around the documents

A dock area holds its own groups beside the documents and resizes with its splitter. When collapsed (with the pin in its toolbar, the tab menu, Ctrl+K H or `autoHide`), only its titles stay at the edge. Clicking a title slides the area out over the documents, and clicking outside, pressing Escape or moving focus away slides it back. The close button next to the pin closes the active document, or hides it if it cannot be closed, as with these tools. "Show hidden" in the strip menu or the "…" menu, or `show`, returns it to its previous place.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a sample project. */
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
| `A guide of the cross over a group` | The middle places the tab, group or window into that group, and a side splits that group, as an edge zone does without guides. |
| `A guide at an edge of the manager` | Places it in the dock area on that side: a tab joins the area's group, and a group or window runs along the area. The area is created if necessary, at `dockAreaSize`. |
| `A strip` | Among its tabs, as before. A floating window dropped on a strip gives that group all its documents and closes. |
| `The titles of a folded area` | Into that area. |
| `Anywhere else (guides on), or outside every manager` | Floats in its own window at the pointer, the same size as its original group (`floatingWindowSize`). A floating window moved by its strip stays where it is released. |
| `Over a manager outside its `dragGroup`` | Refused. Nothing floats over another manager. |

## Floating windows

A window holds groups in the same way as the document area, split and resized the same way. It moves by the empty part of its strips, resizes from its edges and corners, comes to the front when clicked, and maximizes within the page. Double-clicking its strip docks it back. Its documents keep their content, and nothing is recreated.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a sample project. */
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

## Compact bars

The bars of dock areas and floating windows are compact, to leave more space for tabs. There are no scroll buttons (the wheel, touch and keys scroll the strip, and the "…" button shows how many tabs are out of view), tabs shrink before they scroll, a single document appears as a title with its close button, and an area shows only its pin and close button, or a window only its close button, as small buttons beside one "…" menu that holds the other buttons above the document list. Each of these is a setting: the manager's `compact…` props apply to every area and window, and an area's or window's own value (`area.scrollButtons = true`) takes precedence. The document bar keeps its full toolbar by default and has the same settings without the prefix. New browser windows use it too, because they fill their own window.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a sample project. */
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

| Prop (documents / compact) | Type | Default | Description |
| --- | --- | --- | --- |
| `scrollButtons / compactScrollButtons` | `Bind<boolean>` | `true` / `false` | Buttons that scroll a strip whose tabs do not fit. Without them, the wheel (plain scrolling moves sideways), touch and the keys scroll it, a thin scrollbar appears while the pointer is over it, and the "…" button shows how many tabs are not fully visible ("+2", also in its name). |
| `tabSize / compactTabSize` | `Bind<'fit' \| 'shrink' \| 'fixed'>` | `'fit'` / `'shrink'` | With shrinking, tabs narrow down to the minimum width and the title is truncated with an ellipsis (the tooltip and the accessible name keep it whole). Only then does the strip scroll. |
| `tabMinWidth / compactTabMinWidth` | `Bind<number>` | `80` / `64` | The minimum width of a tab, in pixels. A tab always keeps its icon, its close button and a few letters. |
| `singleTabTitle / compactSingleTabTitle` | `Bind<boolean>` | `false` / `true` | A strip with one document shows it as a title: the icon, title, unsaved mark, badge and close button (`closeButton`, and the document's `closable`). It remains a tab, with its menu, keys, drag, double-click and tooltip. A second document brings the tabs back. |
| `barButtons / compactBarButtons` | `Bind<readonly TabBarButton[] \| 'all' \| 'auto'>` | `'all'` / `'auto'` | The built-in buttons that stay in the toolbar (`'split'`, `'maximize'`, `'lock'`, `'autoHide'`, `'close'`, `'maximizeWindow'`, `'closeWindow'`). The others, application buttons (except those with `overflow: 'never'`), Dock back in a window, and the group commands go into one "…" menu, next to the documents and their search. With `'auto'`, an area keeps its pin and close button (`['autoHide', 'close']`), and a window keeps its close button (`['closeWindow']`). A list applies as it is to both. `'all'` keeps the full toolbar, which collapses into its own menu when narrow, with the document list separate. |
| `barButtonSize / compactBarButtonSize` | `Bind<'normal' \| 'small'>` | `'normal'` / `'small'` | The size of the toolbar buttons. Small buttons are 24-pixel squares (the minimum pointer target in WCAG 2.2) with a smaller icon and tighter gaps, and the "+2" count fits them. An area's or window's own `barButtonSize` takes precedence. |

## Settings

Every part is a setting that can change at runtime, and a document's own `allowFloat`, `allowDock`, `dockSides` and `allowAutoHide` take precedence over the manager's. In this example, package.json cannot float and README.md docks only at the bottom.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a sample project. */
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

## Saving the whole layout

`saveLayout` also writes the dock areas and floating windows, and `loadLayout` restores them. Layouts saved in the earlier format (version 1) still load.

```tsx
import type { ComponentBase } from '@motifx/core';
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';

/** A page with a folded corner: a file. */
export const FileIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A few files of a sample project. */
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

## Changing or canceling

```tsx
docs.onDocking((e) => {
  // Reports go to the bottom, whatever side they were dropped on.
  if (e.document?.type === 'report' && e.side) e.side = 'bottom';
});
docs.onFloating((e) => {
  // Windows open in the middle of the page.
  e.rect = { ...e.rect, x: (innerWidth - e.rect.width) / 2, y: 80 };
});
docs.onWindowClosing((e) => {
  if (e.window.documents.some((d) => d.dirty)) e.cancel = !confirm('Close the window?');
});
```

## From the keyboard

| Keys | Action |
| --- | --- |
| `Ctrl + K, then O` | Floats the active document (`float`). |
| `Ctrl + K, then D` | Docks it back in its previous place (`dock`). |
| `Ctrl + K, then Alt + an arrow` | Docks it in the area on that side (`dockLeft`, `dockRight`, `dockTop`, `dockBottom`). |
| `Ctrl + K, then H` | Collapses the active document's area to its edge, or restores it (`toggleAutoHide`). |
| `Ctrl + K, then X` | Hides the focused or active document (`hide`). "Show hidden" in the strip menu or the "…" menu restores it. |
| `F6, Shift + F6` | Moves to the next or previous part: the documents, each dock area and each floating window (`nextPart`, `previousPart`). |
| `Ctrl + K, then Space` | In a window, moves it with the arrow keys and resizes it with Shift + arrow. Enter keeps the change, and Escape reverts it (`moveWindow`, `windowLeft`…`windowTaller`, `windowDone`, `windowCancel`). |
| `Ctrl + K, then Shift + M; Ctrl + K, then Shift + W` | Maximizes or restores the window, or closes it (`maximizeWindow`, `closeWindow`). |
| `In a folded area's titles` | The arrow keys move along them (`autoHideNext`, `autoHidePrevious`), Home and End move to the ends, Enter or Space slides the area out, and Escape slides it back. |
| `"Move to…"` | Past the edge of the layout, the same arrow key continues to the dock area on that side, and then to a separate window. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Windows` | A non-modal `dialog` named "Floating window n". Each of its groups is a `group`, as in the document area. It comes to the front when clicked or focused. |
| `Dock areas` | A `region` named after its side ("Left dock area"). Its splitter is a `separator` with its size as a value, moved with the splitter keys. |
| `Folded areas` | The titles are a `toolbar` ("Hidden on the left") of buttons with `aria-expanded` and with `aria-controls` referencing the area. It is one Tab stop, and the arrow keys move inside it. |
| `Close buttons` | An area's close button is named after its action: "Close Notes", or "Hide Explorer" for a document that cannot be closed. A title in that bar has no close button of its own. |
| `Announcements` | Floated, docked (with the area), collapsed and shown, slid out, hidden and shown again, and window closed, maximized and restored are all announced politely. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowFloat` | `Bind<boolean>` | `true` | Allows documents and groups to float. A document's own `allowFloat` takes precedence. |
| `allowDock` | `Bind<boolean>` | `true` | Allows documents and groups to move to dock areas. A document's own `allowDock` takes precedence. |
| `dockSides` | `Bind<readonly ('left' \| 'right' \| 'top' \| 'bottom')[]>` | all four | The dock areas documents can move to. A document's own `dockSides` takes precedence. `left` is the start side (on the right in right-to-left layouts). |
| `allowAutoHide` | `Bind<boolean>` | `true` | Allows dock areas to collapse to the edge. A document with `allowAutoHide: false` keeps its area open. |
| `allowHide` | `Bind<boolean>` | `true` | Allows documents to be hidden (`hide`, "Hide", Ctrl+K X, or an area's close button for a document that cannot be closed) and shown again in their previous place. A document's own `allowHide` takes precedence. |
| `dockGuides` | `Bind<boolean>` | `false` | The guides shown while dragging. A drop away from them and from the strips floats. When disabled, a group's edge zones work as described on the [drag and drop page](tabdocs-drag.md), and a drop floats only outside the manager. |
| `dockGuideKinds` | `Bind<readonly ('group' \| 'edges')[]>` | both | The cross over the group under the pointer, and the four guides at the edges of the manager. |
| `floatingWindowSize` | `Bind<{ width, height } \| null>` | `null` | The initial size of a window. `null` uses the size of its original group. |
| `keepFloatingInView` | `Bind<boolean>` | `true` | Keeps windows inside the viewport when they are moved or resized, or when the page gets smaller. |
| `closeEmptyWindows` | `Bind<boolean>` | `true` | Closes a window when its last document closes. When disabled, the window stays with an empty group. |
| `dockOnDoubleClick` | `Bind<boolean>` | `true` | Double-clicking the empty part of a window's strip docks it back. |
| `dockAreaSize` | `Bind<Partial<Record<side, number \| string>>>` | `{ left: 240, right: 240, top: 160, bottom: 200 }` | The initial size of a new area on each side, in pixels or as a share such as `'25%'`. |
| `dockAreaMinSize` | `Bind<number>` | `120` | The minimum size of an area, in pixels. The documents keep `minGroupWidth` and `minGroupHeight`. |
| `autoHideHover, autoHideDelay` | `Bind<boolean>`, `Bind<number>` | `true`, `500` | Resting the pointer on a collapsed area's title slides it out after this many milliseconds, and moving away from it and the area slides it back. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowFloat, allowDock, allowAutoHide` | `Bind<boolean \| undefined>` | This document's own settings. `undefined` uses the manager's. |
| `dockSides` | `Bind<readonly TabDockSide[] \| undefined>` | The dock areas this document can move to. |
| `allowHide` | `Bind<boolean \| undefined>` | This document's own setting. `undefined` uses the manager's. Its `closable` determines whether an area's close button closes or hides it. |
| `isHidden` | read-only, reactive | A hidden document is in no group, and its content is kept according to its `contentLifetime`. `isOpen` stays `true`. `hide()` and `show(options?)` call the manager. |
| `window, dockArea` | read-only, reactive | The floating window or dock area containing it, otherwise `null` (also on `TabGroup`). |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `float(doc \| group, rect?)` | `TabWindow \| null` | Moves it into its own window. `rect` is `{ x, y, width, height }` in the viewport. |
| `dock(doc \| group \| window, side?, size?)` | `boolean` | Moves it into the dock area on `side`, created at `size` if necessary. Without a side, it returns to where it was docked before it floated. |
| `autoHide(area \| doc, on?)` | `boolean` | Collapses the area to the edge (`true`) or restores it. |
| `showAutoHidden(doc), hideAutoHidden()` | `boolean` | Slides a collapsed area out with that document shown, or back. |
| `moveWindow(w, x, y), resizeWindow(w, width, height)` | `boolean` | Programmatic control, raising `onLayoutChanging` first. `keepFloatingInView` keeps the window visible. |
| `maximizeWindow(w), restoreWindow(w)` | `boolean` | Fills the whole page, and returns to its place. |
| `closeWindow(w)` | `Promise<boolean>` | Closes its documents (each raising `onClosing`), and then the window. Its close button does the same, and hides documents that cannot be closed. |
| `hide(doc)` | `boolean` | Removes it from its group without closing it. Its content is kept according to its `contentLifetime`, and a group, area or window it leaves empty is removed. |
| `show(doc, { group?, side?, index?, active?, focus? })` | `boolean` | Returns it to where it was hidden from: its group, otherwise its dock area (recreated at its size, collapsed if it was), otherwise a window in the same position, otherwise the documents. `group` or `side` names another place. `open(doc)` does the same. |
| `hiddenDocuments` | read-only, reactive | The hidden documents, in the order they were hidden. `findDocument(id)` also finds them. |
| `focusWindow(w), focusPart(by?)` | `boolean` | Brings a window to the front with focus where it was, or moves to the next (or with `-1`, previous) part: the documents, each area and each window. |
| `resizeDockArea(area, size)` | `boolean` | In pixels, or as a share such as `'25%'`. |
| `floatingWindows, dockAreas` | read-only, reactive | The windows, with the one at the back first, and the areas, with the outermost first. `dockArea(side)` finds one. |
| `saveLayout(), loadLayout(layout, factory?)` | `TabLayout` (version 3) | Also includes the areas (`side`, `size`, `autoHide`, their layout), the windows (`rect`, `maximized`, where they dock back, their layout) and the hidden documents (`hidden`, with where they return to). Older layouts still load. |

### TabWindow

| Member | Type | Description |
| --- | --- | --- |
| `rect, isMaximized, isActive` | read-only, reactive | Its position and size (as restored), whether it is maximized, and whether it is the front window of the page. |
| `groups, documents, index` | read-only, reactive | Its groups (split in the same way as the document area), their documents, and its position in `floatingWindows`. |
| `move, resize, maximize, restore, close, dock(side?), focus` | methods | The manager's methods, scoped to this window. |
| `scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize` | `Bind<… \| null>`, reactive | Its strips' own settings, as a value or a function. `null` (the default) uses the manager's `compact…` props. Plain values are saved with the layout (`bar`). |

### TabDockArea

| Member | Type | Description |
| --- | --- | --- |
| `side, size, autoHidden, isOpen` | read-only, reactive | Its side, its size as set (in pixels or as a share), whether it is collapsed to the edge, and whether it is slid out. |
| `groups, documents, index, rect` | read-only | Its groups, their documents, its position in `dockAreas`, and its box on the screen. |
| `resize(size), autoHide(on?), show(doc?)` | methods | The manager's methods for this area. |
| `scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize` | `Bind<… \| null>`, reactive | Its strips' own settings (as on `TabWindow`). `null` uses the manager's `compact…` props. |

### Events

| Event | Contents |
| --- | --- |
| `onFloating(e) / onFloated(e)` | `{ document, group, rect }`, cancelable, and `rect` can be changed. Then `{ document, group, window }`. `document` is `null` for a group. |
| `onDocking(e) / onDocked(e)` | `{ document, group, window, side, size }`, cancelable, and `side` and `size` can be changed (`side: null` returns it to where it was docked). Then `{ document, group, area, side }`. |
| `onAutoHiding(e) / onAutoHidden(e)` | `{ area, on }`, cancelable, followed by the same. |
| `onHiding(e) / onHidden(e)` | `{ document, group }`, cancelable, followed by the same (`group` is the one it left). |
| `onShowing(e) / onShown(e)` | `{ document, group, side, index }`, cancelable, and `group` and `index` can be changed (`group: null` creates an area or window for it). Then `{ document, group, index }`. |
| `onSlideChanging(e) / onSlideChanged(e)` | `{ area, document, open }`, cancelable. A collapsed area slides out (with `document` shown) or back (`null`). |
| `onWindowClosing(e) / onWindowClosed(e)` | `{ window }`, cancelable. Then `{ window, reason }`, where `reason` is `'closed'`, `'docked'` or `'empty'`. |
| `onLayoutChanging / onLayoutChanged` | Also includes `'float'`, `'dock'`, `'autoHide'`, `'resizeArea'`, `'moveWindow'`, `'resizeWindow'`, `'maximizeWindow'`, `'restoreWindow'` and `'closeWindow'`, with `window` or `area`. `onLayoutChanged` also includes `'hide'` and `'show'`. |
| `onDragOver, onDropping, onDropped` | Additional `target` types: `'dock-guide'` (a guide of the cross, with `group` and `side`), `'dock-area'` (with `dockSide`) and `'float'` (with `rect`). |

### Styling hooks

| Selector or token | Item |
| --- | --- |
| `.mx-tabdocs__window` | A floating window, with `data-active`, `data-maximized`, `data-moving` and `data-resizing`. Its position and size are `--_x`, `--_y`, `--_w` and `--_h`. |
| `.mx-tabdocs__area` | A dock area, with `data-side`, `data-auto-hide` and `data-open` (slid out). `.mx-tabdocs__area-sash` is its splitter. |
| `.mx-tabdocs__autohide, .mx-tabdocs__autohide-tab` | The titles of a collapsed area. A title has `data-open` while its document is slid out. |
| `.mx-tabdocs__guide` | A dock guide, with `data-kind` (`cross`, `edge`), `data-side` and `data-pointed`. |
| `.mx-tabdocs__group[data-compact], [data-title], [data-scroll-buttons], [data-tab-size], [data-bar-close]` | A group's bar: compact, one document as a title, with scroll buttons, how its tabs are sized, and with its own close button (`.mx-tabdocs__bar-close`). |
| `.mx-tabdocs__scrollbar, .mx-tabdocs__thumb, .mx-tabdocs__count` | The thin scrollbar of a strip without scroll buttons, and the count on its "…" button. |
| `.mx-tabdocs__group[data-bar-size]` | The size of its toolbar buttons: `normal` or `small`. |
| `tabdocs.scrollbar, thumb, count; bar-button-*, bar-icon-size, title-min` | Their units, and the sizes of the small toolbar, whose ends leave space for the focus ring (`focus-width`, `focus-offset`). |
| `tabdocs.window, area, autohide, autohide-tab, autohide-indicator, guide, guide-icon` | Their units (a collapsed area: `folded`, `folded-left` …; a guide: `edge`, `pointed`). `floating-min-*`, `folded-tab-height`, `guide-room` and `guide-spacing` are sizes. |

See the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md), [Menus and keys](tabdocs-menus.md) and [Drag and drop](tabdocs-drag.md) for the rest of the API.

## Example files

`DockIde.tsx`

```tsx
import { reactive } from '@motifx/core';
import { TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * A code editor's layout: the files in the middle, the explorer and the outline folded at the left
 * edge (point at a title, or click it), problems and output docked at the bottom. Drag a tab or a
 * group: guides show over the group under the pointer and at the edges; let go away from them to
 * float it in a window of its own. The close button of an area hides its tool (a tool cannot
 * close): "Show hidden" in the strip's menu or the "…" menu brings it back where it was.
 */
export default function DockIde() {
  const s = reactive({ last: 'Drag a tab: the guides show where it can go.' });
  const docs = new TabDocumentManager({ label: 'Editor with tool areas', dockGuides: true, minGroupWidth: 120, dockAreaSize: { left: 220, bottom: 150 } });
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  docs.autoHide(docs.dockArea('left')!);
  docs.onFloated((e) => (s.last = `${e.document?.title ?? 'A group'} floats in a window.`));
  docs.onDocked((e) => (s.last = `${e.document?.title ?? 'A group'} docked ${e.side ? `on the ${e.side}` : 'among the documents'}.`));
  docs.onAutoHidden((e) => (s.last = `The ${e.area.side} area ${e.on ? 'is folded to its edge' : 'is shown'}.`));
  docs.onHidden((e) => (s.last = `${e.document.title} is hidden: "Show hidden" in the "…" menu brings it back.`));
  docs.onShown((e) => (s.last = `${e.document.title} is back${e.group.dockArea ? ` on the ${e.group.dockArea.side}` : ''}.`));

  return (
    <>
      {docs}
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
```

`tools.tsx`

```tsx
import type { ComponentBase } from '@motifx/core';
import { Button, TabDocument } from '@motifx-community/ui';
import { FILES } from './files';

const PROBLEMS = [
  { file: 'src/app.ts', line: 3, text: "'App' is declared but never read." },
  { file: 'src/router.ts', line: 1, text: 'The routes list is empty.' },
  { file: 'README.md', line: 3, text: 'A line longer than 80 characters.' },
];

/** A plain list inside a tool. */
const LIST = 'margin: 0; padding: var(--mx-space-2); list-style: none';
const ITEM = 'padding: var(--mx-space-1) var(--mx-space-2); white-space: nowrap';

const LOG = ['> shop@0.0.0 dev', '> vite', '', '  VITE ready in 312 ms', '  ➜  Local:   http://localhost:5173/', '  page reload src/app.ts', '  hmr update /src/router.ts'];

/** The project's files; choosing one opens it among the documents. */
export function explorer(open: (path: string) => void): ComponentBase {
  return (
    <ul style={LIST} aria-label="Project files">
      {FILES.map((file) => (
        <li key={file.path}>
          <Button text={file.path} variant="ghost" size="sm" onclick={() => open(file.path)} />
        </li>
      ))}
    </ul>
  );
}

/** The outline of a file: what it declares. */
export function outline(): ComponentBase {
  return (
    <ul style={LIST} aria-label="Outline">
      {['App', 'router', 'Order', 'routes'].map((name) => (
        <li key={name} style={ITEM}>
          {name}
        </li>
      ))}
    </ul>
  );
}

/** A list of problems found in the files. */
export function problems(): ComponentBase {
  return (
    <ul style={LIST} aria-label="Problems">
      {PROBLEMS.map((p) => (
        <li key={`${p.file}:${p.line}`} style={ITEM}>
          {`${p.file}:${p.line}  ${p.text}`}
        </li>
      ))}
    </ul>
  );
}

/** What the dev server wrote. */
export function output(): ComponentBase {
  return <pre style="margin: 0; padding: var(--mx-space-3); overflow: visible; font: var(--mx-font-size-caption) / var(--mx-font-line-caption) var(--mx-font-family-mono)">{LOG.join('\n')}</pre>;
}

/** A tool's document: it cannot be closed, only moved, docked, floated or folded away. */
export function toolDocument(id: string, title: string, content: () => ComponentBase): TabDocument {
  return new TabDocument({ id, type: 'tool', title, closable: false, content });
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

/** A few files of a sample project. */
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

`FloatProgrammatically.tsx`

```tsx
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** Floating windows by code: float a document, move, resize and maximize its window, dock it back or to a side, close it. */
export default function FloatProgrammatically() {
  const docs = new TabDocumentManager({ label: 'Files to float' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });
  const readme = () => docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;
  // The manager's own lists are reactive: the window shown is the one in front.
  const front = () => docs.floatingWindows.at(-1) ?? null;
  const rect = () => {
    const w = front();
    if (!w) return 'No floating window.';
    const r = w.rect;
    return `Window at ${r.x}, ${r.y}, ${r.width} × ${r.height}${w.isMaximized ? ', maximized' : ''}.`;
  };
  const on = () => !!front();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Float README.md" variant="outline" enabled={() => !front()} onclick={() => docs.float(readme(), { x: 80, y: 120, width: 420, height: 280 })} />
        <Button text="Move" variant="outline" enabled={on} onclick={() => front()?.move(front()!.rect.x + 40, front()!.rect.y + 20)} />
        <Button text="Wider" variant="outline" enabled={on} onclick={() => front()?.resize(front()!.rect.width + 60, front()!.rect.height)} />
        <Button text="Maximize or restore" variant="outline" enabled={on} onclick={() => (front()?.isMaximized ? front()?.restore() : front()?.maximize())} />
        <Button text="Dock back" variant="outline" enabled={on} onclick={() => front()?.dock()} />
        <Button text="Dock right" variant="outline" enabled={on} onclick={() => front()?.dock('right', '35%')} />
        <Button text="Close window" variant="outline" enabled={on} onclick={() => void front()?.close()} />
      </Stack>
      {docs}
      <output class="td-state">{() => rect()}</output>
    </>
  );
}
```

`CompactBars.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * The bars of dock areas and floating windows are compact: tabs shrink before the strip scrolls, a
 * single document shows as a title, and only the pin and the close button (a window's own close
 * button) stay beside one "…" menu. Each part is a setting for every area and window, and an area
 * may have its own.
 */
export default function CompactBars() {
  const s = reactive({ compact: true, small: true, scroll: false, title: true, shrink: true, leftScroll: false });
  const docs = new TabDocumentManager({
    label: 'Files with compact tool bars',
    minGroupWidth: 120,
    dockAreaSize: { left: 230, bottom: 130 },
    compactBarButtons: () => (s.compact ? 'auto' : 'all'),
    compactBarButtonSize: () => (s.small ? 'small' : 'normal'),
    compactScrollButtons: () => s.scroll,
    compactSingleTabTitle: () => s.title,
    compactTabSize: () => (s.shrink ? 'shrink' : 'fit'),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'left');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  // This area's own setting takes precedence over the manager's (null returns to the manager's).
  docs.dockArea('left')!.scrollButtons = () => (s.leftScroll ? true : null);
  const float = () => {
    const doc = docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;
    const box = docs.element.getBoundingClientRect();
    docs.float(doc, { x: box.right - 340, y: box.top + 60, width: 300, height: 200 });
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Compact bars" x-model={() => s.compact} />
        <Switch label="Small buttons" x-model={() => s.small} />
        <Switch label="Scroll buttons" x-model={() => s.scroll} />
        <Switch label="One document as a title" x-model={() => s.title} />
        <Switch label="Tabs shrink" x-model={() => s.shrink} />
        <Switch label="Left area: scroll buttons" x-model={() => s.leftScroll} />
        <Button text="Float README.md" variant="outline" onclick={float} />
      </Stack>
      {docs}
    </>
  );
}
```

`DockOptions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockSide } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { problems, toolDocument } from './tools';

const SIDES: Record<string, readonly TabDockSide[]> = {
  all: ['left', 'right', 'top', 'bottom'],
  sides: ['left', 'right'],
  bottom: ['bottom'],
};

/** Every part of docking and floating is a setting, live; package.json may not float, README.md docks only at the bottom. */
export default function DockOptions() {
  const s = reactive({ guides: true, float: true, dock: true, autoHide: true, inView: true, emptyWindows: true, hover: true, sides: 'all' });
  const docs = new TabDocumentManager({
    label: 'Files with dock settings',
    dockGuides: () => s.guides,
    allowFloat: () => s.float,
    allowDock: () => s.dock,
    allowAutoHide: () => s.autoHide,
    keepFloatingInView: () => s.inView,
    closeEmptyWindows: () => s.emptyWindows,
    autoHideHover: () => s.hover,
    dockSides: () => SIDES[s.sides],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(4)) {
    const extra = file.path === 'package.json' ? { allowFloat: false } : file.path === 'README.md' ? { dockSides: ['bottom'] as TabDockSide[] } : {};
    docs.open(fileDocument(file.path, extra), { index: 99 });
  }
  docs.dock(toolDocument('problems', 'Problems', problems), 'right', 200);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Dock guides" x-model={() => s.guides} />
        <Switch label="Float" x-model={() => s.float} />
        <Switch label="Dock" x-model={() => s.dock} />
        <Switch label="Auto hide" x-model={() => s.autoHide} />
        <Switch label="Windows stay in view" x-model={() => s.inView} />
        <Switch label="Close empty windows" x-model={() => s.emptyWindows} />
        <Switch label="Slide out on hover" x-model={() => s.hover} />
      </Stack>
      <RadioGroup
        label="Dock areas"
        orientation="horizontal"
        items={[
          { value: 'all', text: 'All four sides' },
          { value: 'sides', text: 'Left and right' },
          { value: 'bottom', text: 'Bottom only' },
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

`DockSaveRestore.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';
import { notes } from './contents';
import { fileDocument } from './files';
import { output, problems, toolDocument } from './tools';

/** Recreates a saved document by its type. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'file') return fileDocument(saved.id);
  if (saved.type === 'tool') return toolDocument(saved.id, saved.title, saved.id === 'output' ? output : problems);
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/** The whole layout as JSON: the documents, the dock areas (size, order, folded) and the floating windows (place, order, inside). */
export default function DockSaveRestore() {
  const s = reactive({ json: '', saved: null as TabLayout | null });
  const docs = new TabDocumentManager({ label: 'Saved layout with windows and areas', dockGuides: true });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'src/app.ts', type: 'file', title: 'app.ts' }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.dock(restore({ id: 'problems', type: 'tool', title: 'Problems' }), 'bottom', 140);
  docs.dock(restore({ id: 'output', type: 'tool', title: 'Output' }), 'right', '30%');

  const save = () => {
    s.saved = docs.saveLayout();
    s.json = JSON.stringify(s.saved, null, 2);
  };
  const load = () => {
    if (s.saved) docs.loadLayout(s.saved, restore);
  };
  save();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save layout" variant="outline" onclick={save} />
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />
        <Button text="Float Notes" variant="outline" onclick={() => docs.float(docs.findDocument('notes')!, { x: 120, y: 140, width: 380, height: 260 })} />
      </Stack>
      {docs}
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
```

`contents.tsx`

```tsx
import type { ComponentBase } from '@motifx/core';
import { Button, confirm, DataGrid, FormLayout, type FormItem, type GridColumn } from '@motifx-community/ui';
import { makeOrders, type Order } from './orders';

const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  { field: 'customer', title: 'Customer', width: 160 },
  { field: 'city', title: 'City', width: 110 },
  { field: 'amount', title: 'Amount', type: 'number', width: 100 },
];

/** A grid of orders that fills its tab. */
export function ordersGrid(count = 60): ComponentBase {
  return <DataGrid rows={makeOrders(count)} rowKey="id" columns={columns} label="Orders" style="block-size: 100%" />;
}

/** The fields a customer is edited with. */
export interface Customer {
  name: string;
  email: string;
  city: string;
}

/** The forms open over each customer: a copy of a document has a form of its own over the same object. */
const formsOf = new WeakMap<Customer, Set<FormLayout<Customer>>>();

/**
 * A form over a customer: what is typed goes straight into it. The form reads the object as it is, so the other forms
 * over the same customer are told to read the field again.
 */
export function customerForm(customer: Customer): ComponentBase {
  const items: FormItem[] = [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', editor: 'email' },
    { field: 'city', label: 'City' },
  ];
  const forms = formsOf.get(customer) ?? new Set<FormLayout<Customer>>();
  formsOf.set(customer, forms);
  return (
    <div style="padding: var(--mx-space-4); max-inline-size: 32rem">
      <FormLayout<Customer>
        data={customer}
        items={items}
        ref={(form: FormLayout<Customer>) => {
          forms.add(form);
          form.motif.setDisposable(() => forms.delete(form));
        }}
        onFieldChanged={(e) => {
          for (const other of forms) if (other.data === e.data && !other.isDisposed) other.refreshField(e.field);
        }}
      />
    </div>
  );
}

/** A few paragraphs of plain text. */
export function notes(title: string): ComponentBase {
  return (
    <div style="padding: var(--mx-space-4); max-inline-size: 40rem">
      <h3 style="margin-block-start: 0">{title}</h3>
      <p>Any component can be a document: a form, a grid, a chart or plain text like this.</p>
      <p>Drag the line between two groups, or focus it with Tab and use the arrow keys. A double click on it gives the groups the same size.</p>
    </div>
  );
}

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'London', 'New York'];

/** A customer card: text fields and a city drop-down over a reactive customer, and a button that opens a dialog. */
export function customerCard(customer: Customer): ComponentBase {
  const items: FormItem[] = [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', editor: 'email' },
    { field: 'city', label: 'City', editor: 'dropdown', editorProps: { items: CITIES } },
  ];
  let card: ComponentBase | null = null;
  // The dialog opens where the card is: in a new window, there.
  const clear = async () => {
    if (await confirm('Clear the customer card?', { title: 'Clear', host: card! })) Object.assign(customer, { name: '', email: '', city: '' });
  };
  return (
    <div ref={(c: ComponentBase) => (card = c)} style="padding: var(--mx-space-4); max-inline-size: 32rem">
      <FormLayout data={customer} items={items} />
      <Button text="Clear…" variant="outline" onclick={clear} />
    </div>
  );
}
```
