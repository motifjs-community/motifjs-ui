# TabDocumentManager: Dock and floating windows

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.3

Documents and whole groups float in windows of their own in the page and dock again into the documents' groups or into dock areas around them, which fold to the manager's edge. The mouse, the keys and the code do the same, through the same events.

## Tool areas around the documents

A dock area holds groups of its own beside the documents and resizes by its splitter. Folded (the pin in its toolbar, the tab menu, Ctrl+K H, or `autoHide`), only its titles stay at the edge; one of them slides the area out over the documents, and a press outside, Escape or focus leaving slides it back. The close button next to the pin closes the active document, or hides it when it cannot close, as these tools: "Show hidden" in the strip's menu or the "…" menu, or `show`, puts it back where it was.

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

| Dropped on | What happens |
| --- | --- |
| `A guide of the cross over a group` | Its middle puts the tab (or the group, or the window) into that group; a side splits that group, as an edge zone does without guides. |
| `A guide at an edge of the manager` | Into the dock area of that side: a tab joins the area's group, a group or a window goes along the area. The area is made when there is none, at `dockAreaSize`. |
| `A strip` | Among its tabs, as before; a floating window dropped on a strip gives that group all its documents and closes. |
| `The titles of a folded area` | Into that area. |
| `Anywhere else (guides on), or outside every manager` | Floats: a window of its own at the pointer, as large as the group it came from (`floatingWindowSize`). A floating window moved by its strip stays where it is let go. |
| `Over a manager outside its `dragGroup`` | Refused: nothing floats over another manager. |

## Floating windows

A window holds groups as the documents' area does, split and resized the same way. It moves by the empty part of its strips, resizes from its edges and corners, comes to the front when pressed, maximizes within the page, and a double click on its strip docks it back. Its documents keep their content: nothing is made again.

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

## Compact bars

The bars of dock areas and floating windows are compact, so that the tabs keep the room: no scroll buttons (the wheel, touch and the keys scroll the strip, and the "…" button tells how many tabs are out of sight), tabs that shrink before they scroll, one document shown as a title with its close button, and only the pin and the close button of an area, or the close button of a window, beside one "…" menu, all of them small buttons, which holds the other buttons above the list of documents. Each part is a setting: the manager's `compact…` props for every area and window, the area's or the window's own (`area.scrollButtons = true`) over them. The documents' bar keeps its whole toolbar by default, and has the same settings without the prefix; new browser windows use it too, as they fill a window of their own.

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

| Prop (documents / compact) | Type | Default | Description |
| --- | --- | --- | --- |
| `scrollButtons / compactScrollButtons` | `Bind<boolean>` | `true` / `false` | Buttons that scroll a strip whose tabs do not fit. Without them the wheel (a plain one scrolls sideways), touch and the keys scroll it, a thin scrollbar shows while the pointer is over it, and the "…" button shows how many tabs are not fully in sight ("+2", also in its name). |
| `tabSize / compactTabSize` | `Bind<'fit' \| 'shrink' \| 'fixed'>` | `'fit'` / `'shrink'` | Shrinking, tabs narrow down to the smallest width, the title cut by an ellipsis (the tooltip and the name keep it whole); only then does the strip scroll. |
| `tabMinWidth / compactTabMinWidth` | `Bind<number>` | `80` / `64` | The smallest width of a tab, in pixels; a tab keeps its icon, its close button and a few letters whatever it is. |
| `singleTabTitle / compactSingleTabTitle` | `Bind<boolean>` | `false` / `true` | A strip with one document shows it as a title: icon, title, unsaved mark, badge and its close button (`closeButton`, the document's `closable`). It is still the tab: its menu, keys, drag, double click and tooltip stay. A second document makes tabs again. |
| `barButtons / compactBarButtons` | `Bind<readonly TabBarButton[] \| 'all' \| 'auto'>` | `'all'` / `'auto'` | The built-in buttons that stay in the toolbar (`'split'`, `'maximize'`, `'lock'`, `'autoHide'`, `'close'`, `'maximizeWindow'`, `'closeWindow'`). The others, the app's buttons (but those with `overflow: 'never'`), Dock back in a window and the group's commands go into one "…" menu, next to its documents and their search. `'auto'`: an area keeps its pin and its close button (`['autoHide', 'close']`), a window its own close button (`['closeWindow']`); a list is followed as it is in both. `'all'`: the whole toolbar, which folds into a menu of its own when narrow, and the list apart. |
| `barButtonSize / compactBarButtonSize` | `Bind<'normal' \| 'small'>` | `'normal'` / `'small'` | How large the toolbar's buttons are: small ones are squares of 24 pixels (the smallest pointer target WCAG 2.2 asks for) with a smaller mark and tight gaps; the "+2" count fits them. An area's or a window's own `barButtonSize` wins. |

## Settings

Each part is a setting and changes live; a document's own `allowFloat`, `allowDock`, `dockSides` and `allowAutoHide` win over the manager's. Here package.json may not float and README.md docks only at the bottom.

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

## Saving the whole layout

`saveLayout` writes the dock areas and the floating windows too; `loadLayout` puts them back, and still loads a layout saved before them (version 1).

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

## Changing or refusing

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

| Keys | Does |
| --- | --- |
| `Ctrl + K, then O` | Floats the active document (`float`). |
| `Ctrl + K, then D` | Docks it back where it was (`dock`). |
| `Ctrl + K, then Alt + an arrow` | Into the dock area on that side (`dockLeft`, `dockRight`, `dockTop`, `dockBottom`). |
| `Ctrl + K, then H` | Folds the active document's area to its edge, or brings it back (`toggleAutoHide`). |
| `Ctrl + K, then X` | Hides the focused or active document (`hide`); "Show hidden" in the strip's menu or the "…" menu brings it back. |
| `F6, Shift + F6` | The next / previous part: the documents, each dock area, each floating window (`nextPart`, `previousPart`). |
| `Ctrl + K, then Space` | In a window: moves it with the arrows, resizes it with Shift and an arrow; Enter keeps it, Escape puts it back (`moveWindow`, `windowLeft`…`windowTaller`, `windowDone`, `windowCancel`). |
| `Ctrl + K, then Shift + M; Ctrl + K, then Shift + W` | Maximizes or restores the window; closes it (`maximizeWindow`, `closeWindow`). |
| `In a folded area's titles` | The arrows go along them (`autoHideNext`, `autoHidePrevious`), Home and End to the ends, Enter or Space slides the area out, Escape back. |
| `"Move to…"` | Past the edge of the layout, the same arrow goes on to the dock area of that side, then to a window of its own. |

## Accessibility

| Topic | How |
| --- | --- |
| `Windows` | A non-modal `dialog` named "Floating window n"; each of its groups is a `group` as in the documents' area. It comes to the front on a press or on focus. |
| `Dock areas` | A `region` named after its side ("Left dock area"); its splitter is a `separator` with its size as a value, moved by the splitter keys. |
| `Folded areas` | Their titles are a `toolbar` ("Hidden on the left") of buttons with `aria-expanded` and `aria-controls` the area; one tab stop, the arrows inside. |
| `Close buttons` | The close button of an area is named after what it does: "Close Notes", or "Hide Explorer" for a document that cannot close. A title in that bar shows no close button of its own. |
| `Announcements` | Floated, docked (with the area), folded and shown, slid out, hidden and shown again, window closed, maximized and restored, politely. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowFloat` | `Bind<boolean>` | `true` | Documents and groups can float; a document's own `allowFloat` wins. |
| `allowDock` | `Bind<boolean>` | `true` | Documents and groups can go to the dock areas; a document's own `allowDock` wins. |
| `dockSides` | `Bind<readonly ('left' \| 'right' \| 'top' \| 'bottom')[]>` | all four | Which dock areas documents may go to; a document's own `dockSides` wins. `left` is the start side (the right one right to left). |
| `allowAutoHide` | `Bind<boolean>` | `true` | Dock areas can fold to the edge; a document with `allowAutoHide: false` keeps its area open. |
| `allowHide` | `Bind<boolean>` | `true` | Documents can be hidden (`hide`, "Hide", Ctrl+K X, the close button of an area for a document that cannot close) and shown again where they were; a document's own `allowHide` wins. |
| `dockGuides` | `Bind<boolean>` | `false` | The guides while dragging; a drop away from them and from the strips floats. Off, a group's edge zones work as on the [drag and drop page](tabdocs-drag.md), and only outside the manager a drop floats. |
| `dockGuideKinds` | `Bind<readonly ('group' \| 'edges')[]>` | both | The cross over the group under the pointer, the four guides at the manager's edges. |
| `floatingWindowSize` | `Bind<{ width, height } \| null>` | `null` | The size a window opens at; `null`: the size of the group it comes from. |
| `keepFloatingInView` | `Bind<boolean>` | `true` | Windows stay inside the viewport when moved, resized, or the page gets smaller. |
| `closeEmptyWindows` | `Bind<boolean>` | `true` | A window whose last document closes closes too; off, it stays with an empty group. |
| `dockOnDoubleClick` | `Bind<boolean>` | `true` | A double click on the empty part of a window's strip docks it back. |
| `dockAreaSize` | `Bind<Partial<Record<side, number \| string>>>` | `{ left: 240, right: 240, top: 160, bottom: 200 }` | The size a new area of each side starts with: pixels, or a share such as `'25%'`. |
| `dockAreaMinSize` | `Bind<number>` | `120` | The smallest size of an area, in pixels; the documents keep `minGroupWidth` / `minGroupHeight`. |
| `autoHideHover, autoHideDelay` | `Bind<boolean>`, `Bind<number>` | `true`, `500` | Resting the pointer on a folded area's title slides it out after that many milliseconds, and away from it and the area slides it back. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowFloat, allowDock, allowAutoHide` | `Bind<boolean \| undefined>` | This document's own settings; `undefined` follows the manager. |
| `dockSides` | `Bind<readonly TabDockSide[] \| undefined>` | The dock areas this document may go to. |
| `allowHide` | `Bind<boolean \| undefined>` | This document's own setting; `undefined` follows the manager. Its `closable` decides what a close button of an area does: close it, or hide it. |
| `isHidden` | read-only, reactive | Hidden: in no group, its content kept as its `contentLifetime` says; `isOpen` stays `true`. `hide()` and `show(options?)` call the manager. |
| `window, dockArea` | read-only, reactive | The floating window or the dock area it is in, `null` elsewhere (also on `TabGroup`). |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `float(doc \| group, rect?)` | `TabWindow \| null` | Into a window of its own; `rect` is `{ x, y, width, height }` in the viewport. |
| `dock(doc \| group \| window, side?, size?)` | `boolean` | Into the dock area of `side`, made at `size` when there is none; without a side, back where it was docked before it floated. |
| `autoHide(area \| doc, on?)` | `boolean` | Folds the area to the edge (`true`) or brings it back. |
| `showAutoHidden(doc), hideAutoHidden()` | `boolean` | Slides a folded area out with that document shown, or back. |
| `moveWindow(w, x, y), resizeWindow(w, width, height)` | `boolean` | By code, asking `onLayoutChanging` first; kept in view by `keepFloatingInView`. |
| `maximizeWindow(w), restoreWindow(w)` | `boolean` | The whole page, and back to its place. |
| `closeWindow(w)` | `Promise<boolean>` | Closes its documents (each asks through `onClosing`), then the window. Its close button does the same, and hides the documents that cannot close. |
| `hide(doc)` | `boolean` | Out of its group, not closed: its content is kept as its `contentLifetime` says, and a group, an area or a window it leaves empty goes. |
| `show(doc, { group?, side?, index?, active?, focus? })` | `boolean` | Back where it was hidden from: its group, else its dock area (made again at its size, folded if it was), else a window where its window was, else among the documents; `group` or `side` name another place. `open(doc)` does the same. |
| `hiddenDocuments` | read-only, reactive | The hidden documents, in the order they were hidden; `findDocument(id)` finds them too. |
| `focusWindow(w), focusPart(by?)` | `boolean` | Brings a window to the front with focus where it was; the next (`-1`: previous) part: the documents, each area, each window. |
| `resizeDockArea(area, size)` | `boolean` | Pixels, or a share such as `'25%'`. |
| `floatingWindows, dockAreas` | read-only, reactive | The windows, the one at the back first; the areas, the outermost first. `dockArea(side)` finds one. |
| `saveLayout(), loadLayout(layout, factory?)` | `TabLayout` (version 3) | Also the areas (`side`, `size`, `autoHide`, their layout), the windows (`rect`, `maximized`, where they dock back, their layout) and the hidden documents (`hidden`, with where they go back). Older layouts still load. |

### TabWindow

| Member | Kind | Description |
| --- | --- | --- |
| `rect, isMaximized, isActive` | read-only, reactive | Where it is and how big (as it is restored), maximized, the front window of the page. |
| `groups, documents, index` | read-only, reactive | Its groups (split as the documents' are), their documents, its place in `floatingWindows`. |
| `move, resize, maximize, restore, close, dock(side?), focus` | methods | The manager's methods for this window. |
| `scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize` | `Bind<… \| null>`, reactive | Its strips' own settings, a value or a function; `null` (the default) follows the manager's `compact…` props. Plain values are saved with the layout (`bar`). |

### TabDockArea

| Member | Kind | Description |
| --- | --- | --- |
| `side, size, autoHidden, isOpen` | read-only, reactive | Its side; its size as set (pixels or a share); folded to the edge; slid out now. |
| `groups, documents, index, rect` | read-only | Its groups, their documents, its place in `dockAreas`, its box on the screen. |
| `resize(size), autoHide(on?), show(doc?)` | methods | The manager's methods for this area. |
| `scrollButtons, tabSize, tabMinWidth, singleTabTitle, barButtons, barButtonSize` | `Bind<… \| null>`, reactive | Its strips' own settings (as on `TabWindow`); `null` follows the manager's `compact…` props. |

### Events

| Event | What it carries |
| --- | --- |
| `onFloating(e) / onFloated(e)` | `{ document, group, rect }`, cancelable, `rect` may be changed; then `{ document, group, window }`. `document` is `null` for a group. |
| `onDocking(e) / onDocked(e)` | `{ document, group, window, side, size }`, cancelable, `side` and `size` may be changed (`side: null`: back where it was docked); then `{ document, group, area, side }`. |
| `onAutoHiding(e) / onAutoHidden(e)` | `{ area, on }`, cancelable; then the same. |
| `onHiding(e) / onHidden(e)` | `{ document, group }`, cancelable; then the same (`group`: the one it left). |
| `onShowing(e) / onShown(e)` | `{ document, group, side, index }`, cancelable, `group` and `index` may be changed (`group: null`: an area or a window is made for it); then `{ document, group, index }`. |
| `onSlideChanging(e) / onSlideChanged(e)` | `{ area, document, open }`: a folded area slides out (`document` shown) or back (`null`); cancelable. |
| `onWindowClosing(e) / onWindowClosed(e)` | `{ window }`, cancelable; then `{ window, reason }`: `'closed'`, `'docked'` or `'empty'`. |
| `onLayoutChanging / onLayoutChanged` | Also `'float'`, `'dock'`, `'autoHide'`, `'resizeArea'`, `'moveWindow'`, `'resizeWindow'`, `'maximizeWindow'`, `'restoreWindow'`, `'closeWindow'`, with `window` or `area`; `onLayoutChanged` also `'hide'` and `'show'`. |
| `onDragOver, onDropping, onDropped` | New `target` kinds: `'dock-guide'` (a guide of the cross, with `group` and `side`), `'dock-area'` (with `dockSide`), `'float'` (with `rect`). |

### Styling hooks

| Selector or token | What |
| --- | --- |
| `.mx-tabdocs__window` | A floating window; `data-active`, `data-maximized`, `data-moving`, `data-resizing`. Its place and size are `--_x`, `--_y`, `--_w`, `--_h`. |
| `.mx-tabdocs__area` | A dock area; `data-side`, `data-auto-hide`, `data-open` (slid out). `.mx-tabdocs__area-sash` is its splitter. |
| `.mx-tabdocs__autohide, .mx-tabdocs__autohide-tab` | The titles of a folded area; a title has `data-open` while its document is slid out. |
| `.mx-tabdocs__guide` | A dock guide: `data-kind` (`cross`, `edge`), `data-side`, `data-pointed`. |
| `.mx-tabdocs__group[data-compact], [data-title], [data-scroll-buttons], [data-tab-size], [data-bar-close]` | A group's bar: compact, one document as a title, with scroll buttons, how its tabs are sized, with a close button of its own (`.mx-tabdocs__bar-close`). |
| `.mx-tabdocs__scrollbar, .mx-tabdocs__thumb, .mx-tabdocs__count` | The thin scrollbar of a strip without scroll buttons, and the count on its "…" button. |
| `.mx-tabdocs__group[data-bar-size]` | The size of its toolbar's buttons: `normal` or `small`. |
| `tabdocs.scrollbar, thumb, count; bar-button-*, bar-icon-size, title-min` | Their units, and the small toolbar's sizes; its ends leave room for the focus ring (`focus-width`, `focus-offset`). |
| `tabdocs.window, area, autohide, autohide-tab, autohide-indicator, guide, guide-icon` | Their units (a folded area: `folded`, `folded-left` …; a guide: `edge`, `pointed`); `floating-min-*`, `folded-tab-height`, `guide-room`, `guide-spacing` are sizes. |

The rest of the API is on the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md), [Menus and keys](tabdocs-menus.md) and [Drag and drop](tabdocs-drag.md).

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
  // This area's own setting wins over the manager's (null follows it again).
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

/** Makes a saved document again by its type. */
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

/** A customer card: text fields and a drop-down list of cities over a reactive customer, and a button that asks in a dialog. */
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
