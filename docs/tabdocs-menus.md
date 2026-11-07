# TabDocumentManager: Menus and keys

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.6

The commands around tabs: context menus on tabs and on the empty strip, a searchable list of a group's documents, application toolbar buttons, the recently used list, back and forward, reopening closed documents, locked groups, and keyboard shortcuts for all of them.

## Context menus

Each tab offers the commands for its document, and the empty strip offers the commands for its group. `menuItems` hides built-in items, and `onContextMenuOpening` changes the list for each document or cancels it. `newDocument` creates a document when the empty strip is double-clicked.

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

| Command | Item | Note |
| --- | --- | --- |
| `close` | Close | Closes the tab. Its key is shown next to it. |
| `closeOthers, closeRight, closeLeft, closeSaved, closeAll` | Close others / to the right / to the left / saved / all | Pinned tabs stay while `keepPinned` is on. |
| `copyTitle` | Copy the title | Copies it to the clipboard. |
| `keepOpen` | Keep open | Available only on a preview tab. |
| `pin, unpin` | Pin / Unpin | Shows whichever applies. |
| `splitUp, splitDown, splitLeft, splitRight` | Split up / down / left / right | Creates a new group on that side with the document, or a copy (see `splitCopies`). |
| `moveNext, movePrevious` | Move to the next / previous group | Splits if no group exists in that direction. |
| `moveTo` | Move to… | Chooses the destination with the keyboard ([Drag and drop](tabdocs-drag.md#keys)). |
| `moveGroupTo` | Move group to… (empty strip) | The same for the whole group. |
| `newDocument` | New document (empty strip) | Available only with `newDocument`. |
| `reopenClosed` | Reopen closed (empty strip) | Disabled when nothing can be reopened. |
| `lock, unlock` | Lock group / Unlock group (empty strip) |  |

## The open documents list and toolbar buttons

The “…” button (or Ctrl+K Ctrl+P) lists the group's documents, or the documents of every group with `openListScope: 'all'`. Type to search, and press Enter to open. `toolbarItems` adds application buttons to every group, and a document's `actions` appear while it is active.

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

## Recently used, back and forward, and reopen

The recently used list switches between documents in the same way as Ctrl+Tab in code editors. `goBack` and `goForward` follow the documents activated in every group, and `reopenClosed` opens the most recently closed document in its original place.

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

## Locked groups

`lock(group)` reserves a group for its current contents. `open` without a group uses another group, or a new group beside it when all are locked (a single group still accepts it). The lock is saved with the layout.

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

## Keyboard

A page in a browser tab never receives Ctrl+W, Ctrl+Tab, Ctrl+Shift+T, Ctrl+Page Up/Down and often Ctrl+1…9, because the browser reserves them. A manager therefore starts with keys that reach it, in the same way as the web version of a code editor (Ctrl+Alt in place of a reserved Ctrl, and Ctrl+E, the Quick Open key, for the recent list), and keeps the desktop key as a second option. An installed app (standalone display mode) receives every key, and there `keyPreset: 'auto'` uses `TabDocumentManager.desktopKeys`. `keys` changes any of them, and an empty list disables one.

| Browser tab | Installed app | Description |
| --- | --- | --- |
| `Ctrl + Alt + W` | Ctrl + W, Ctrl + F4 | Closes the active document (`closeTab`). |
| `Alt + Page Down / Page Up` | Ctrl + Page Down / Page Up | Moves to the next or previous tab (`nextTab`, `previousTab`). |
| `Ctrl + Alt + 1 … 9` | Ctrl + 1 … 9 | Sets focus on a group (`focusGroup`). |
| `Ctrl + E, Ctrl + Shift + E` | Ctrl + Tab, Ctrl + Shift + Tab | Opens the recently used list and moves through it while Ctrl is held. Releasing Ctrl opens the highlighted document (`recentNext`, `recentPrevious`). |
| `Alt + Left / Right` | Same | Moves back and forward (`goBack`, `goForward`). |
| `Ctrl + Alt + Shift + T` | Ctrl + Shift + T | Reopens the most recently closed document (`reopenClosed`). |
| `Ctrl + K, then W / U` | Same | Closes the group's documents, or its saved documents (`closeAllTabs`, `closeSavedTabs`). |
| `Ctrl + K, then Enter` | Same | Keeps a preview tab open (`keepOpen`). |
| `Ctrl + K, then Shift + Enter` | Same | Pins or unpins the active document (`togglePin`). |
| `Ctrl + K, then Ctrl + P` | Same | Opens the "…" list (`showOpenList`). |
| `Ctrl + \` | Same | Splits to the right (`splitRight`). |
| `Shift + F10, the Menu key` | Same | Opens the context menu of the focused tab. |

```tsx
// The desktop keys everywhere, and Ctrl+Q to close.
new TabDocumentManager({ keyPreset: 'desktop', keys: { closeTab: ['Ctrl+Q'] } });
```

## Accessibility

| Topic | Details |
| --- | --- |
| `Context menus` | The kit's `ContextMenu`: a `menu` opened by a right-click, Shift+F10 or the Menu key on a tab, and named after the document (or after the group, on the strip). Focus returns to the tab when it closes. |
| `The "…" list` | A single menu with a search field, the documents as a `menu` named “Open documents” (`menuitemradio` items with the displayed document checked, and each announcing its description, group and unsaved changes), and a `menu` of commands. Up and Down move from the search through the documents and commands, typing on a document returns to the search, Tab moves between parts, Enter opens, and Escape closes. |
| `The recently used list` | The same document menu, named “Recently used documents”, with focus on the highlighted document so that it is announced as it moves. It also works without holding a key: the arrow keys move, a letter jumps to a title, Enter opens, and Escape closes. |
| `Locked groups` | A locked group is named “Group 1, locked”, and its toolbar has an “Unlock group” button. |
| `Announcements` | Locked and unlocked are announced politely, like the other changes. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `contextMenu` | `Bind<boolean>` | `true` | The context menus of tabs and of the empty strip. |
| `menuItems` | `Bind<Partial<Record<TabMenuCommand, boolean>>>` | `{}` | `false` hides a built-in item: `{ copyTitle: false }`. |
| `openList` | `Bind<boolean>` | `true` | The "…" button in each group's toolbar. |
| `openListScope, recentListScope` | `Bind<'group' \| 'all'>` | `'group'` | Whether the "…" list and the recently used list show the group's documents or those of every group. |
| `toolbarItems` | `(group) => ToolbarItem[]` |  | Application buttons in every group's toolbar, created once per group (text, `icon`, `hint`, `tone`, `visible`, `enabled`, `click` …). |
| `newDocument` | `(group) => TabDocument \| TabDocumentOptions \| null` |  | Creates a new document when the empty strip is double-clicked, and for the strip menu. |
| `historySize` | `Bind<number>` | `50` | The number of activated documents `goBack` remembers. 0 disables the history. |
| `closedHistorySize` | `Bind<number>` | `10` | The number of closed documents `reopenClosed` remembers. 0 disables it. Only documents whose content can be recreated (a `content` function, the `factory` or a copy) are kept. |
| `keyPreset` | `Bind<'auto' \| 'browser' \| 'desktop'>` | `'auto'` | The default keys (see Keyboard). `auto` uses the desktop keys when the page runs as an installed app. |
| `groupActions` | `Bind<boolean>` | `true` | The split, maximize and "…" buttons. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `actions` | `Bind<readonly ToolbarItem[]>` | Buttons in the group's toolbar while this document is active, placed before the built-in buttons. |

### Methods and properties

| Member | Returns | Description |
| --- | --- | --- |
| `showOpenList(group?)` | `boolean` | Opens a group's "…" list, to search and open documents, close all, close saved, and lock or unlock. |
| `showRecentList(by?)` | `boolean` | Opens the recently used list, with the next document (or the last, with `-1`) highlighted. |
| `goBack(), goForward()` | `boolean` | Activates the previous or next document in the history, in any group. `canGoBack` and `canGoForward` indicate whether one exists (reactive). |
| `reopenClosed()` | `TabDocument \| null` | Reopens the most recently closed document, in its original group and position. `closedDocuments` lists them (reactive). |
| `lock(group), unlock(group)` | `boolean` | Also available as `group.lock()` and `group.unlock()`. `group.locked` reads the state. |
| `openNew(group?)` | `TabDocument \| null` | Creates a document with `newDocument` and opens it. |
| `moveToGroup(doc, which)` | `boolean` | `'next'`, `'previous'`, or the group on a side (`'left'`, `'right'`, `'up'`, `'down'`). Splits if no group exists in that direction. |
| `copyTitle(doc)` | `Promise<boolean>` | Writes the title to the clipboard. |
| `recentDocuments` | read-only, reactive | The open documents of every group, most recently activated first. |

### Events

| Event | Contents |
| --- | --- |
| `onContextMenuOpening(e)` | `{ document, group, items, byKeyboard }`, cancelable. `document` is `null` for the empty strip. Change `items` (each built-in item has its command in `data`) or add your own. |
| `onLocking(e), onLocked(e), onUnlocking(e), onUnlocked(e)` | `{ group, byUser }`. The `…ing` events are cancelable. |

See the [overview](tabdocs.md#api) for the rest of the API, and [Tabs](tabdocs-tabs.md) for preview and pinned tabs, sizes and copies.

## Feedback

Loading issues…

## Example files

`ContextMenus.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument, source } from './files';

/**
 * Right-click a tab (or press Shift+F10 on it) for its menu, and the empty strip for the group's.
 * `onContextMenuOpening` adds an item for files, and a double-click on the empty strip creates a new file.
 */
export default function ContextMenus() {
  const s = reactive({ menus: true, copy: true, split: true, made: 0, said: '' });
  const docs = new TabDocumentManager({
    label: 'Files with menus',
    contextMenu: () => s.menus,
    menuItems: () => ({ copyTitle: s.copy, splitUp: s.split, splitDown: s.split, splitLeft: s.split, splitRight: s.split }),
    newDocument: () => {
      const n = ++s.made;
      return { id: `untitled-${n}`, title: `Untitled-${n}`, content: () => source('') };
    },
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.onContextMenuOpening((e) => {
    const doc = e.document;
    if (doc?.type !== 'file') return;
    e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.said = String(doc.id)) });
  });
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Context menus" x-model={() => s.menus} />
        <Switch label="Copy the title" x-model={() => s.copy} />
        <Switch label="Split items" x-model={() => s.split} />
        <output class="td-state">{() => (s.said ? `path: ${s.said}` : 'Right-click a tab, or the strip after the tabs')}</output>
      </Stack>
      {docs}
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

`OpenList.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, TabDocumentManager, type TabListScope } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

const FormatIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 4h10M3 8h6M3 12h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
  </svg>
);

const RunIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5 3.5v9l7-4.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/**
 * The "…" button lists the group's documents to search and open, with close all, close saved and
 * lock under them. The app adds its own buttons: "Run" for every group, "Format" while a file of code is active.
 */
export default function OpenList() {
  const s = reactive({ scope: 'group' as TabListScope, runs: 0, formatted: '' });
  const docs = new TabDocumentManager({
    label: 'Open documents',
    openListScope: () => s.scope,
    toolbarItems: (group) => [{ icon: () => <RunIcon />, hint: () => `Run group ${group.index + 1}`, tone: 'accent', click: () => s.runs++ }],
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES) {
    const code = file.path.endsWith('.ts');
    const doc = fileDocument(file.path, code ? { actions: [{ icon: () => <FormatIcon />, hint: 'Format', click: () => (s.formatted = file.path) }] } : {});
    docs.open(doc, { index: 99, group: file.path.startsWith('src/') ? docs.groups[0] : (docs.groups[1] ?? docs.split(docs.groups[0], 'right')!) });
  }
  docs.findDocument('src/app.ts')!.dirty = true;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="The list shows"
          orientation="horizontal"
          items={[
            { value: 'group', text: "The group's documents" },
            { value: 'all', text: 'Every group' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.scope}
        />
        <output class="td-state">{() => `runs: ${s.runs}${s.formatted ? `; formatted ${s.formatted}` : ''}`}</output>
      </Stack>
      {docs}
    </>
  );
}
```

`Recent.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocumentManager, type TabKeyPreset, type TabListScope } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Hold Ctrl and press E (Ctrl+Tab in an installed app) for the documents used last: E again walks
 * the list, Shift walks back, letting go of Ctrl opens one. Back and forward go over the documents
 * activated in every group; a closed document opens again where it was.
 */
export default function Recent() {
  const s = reactive({ scope: 'group' as TabListScope, preset: 'auto' as TabKeyPreset });
  const docs = new TabDocumentManager({ label: 'Recently used', recentListScope: () => s.scope, keyPreset: () => s.preset });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });
  docs.split(docs.groups[0], 'right', docs.findDocument('README.md') ?? undefined);
  docs.open(fileDocument('package.json'), { group: docs.groups[1] });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Recent list"
          orientation="horizontal"
          items={[
            { value: 'group', text: 'This group' },
            { value: 'all', text: 'Every group' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.scope}
        />
        <RadioGroup
          label="Keys"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'Auto' },
            { value: 'browser', text: 'Browser tab' },
            { value: 'desktop', text: 'Installed app' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.preset}
        />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Recent list" variant="outline" onclick={() => docs.showRecentList()} />
        <Button text="Back" variant="outline" enabled={() => docs.canGoBack} onclick={() => docs.goBack()} />
        <Button text="Forward" variant="outline" enabled={() => docs.canGoForward} onclick={() => docs.goForward()} />
        <Button text="Reopen closed" variant="outline" enabled={() => docs.closedDocuments.length > 0} onclick={() => docs.reopenClosed()} />
        <output class="td-state">{() => `keys: ${docs.keys.recentNext.join(' or ')}, ${docs.keys.goBack[0]}, ${docs.keys.reopenClosed[0]}`}</output>
      </Stack>
      {docs}
    </>
  );
}
```

`Locked.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { notes } from './contents';

/** A locked group keeps what it has: documents opened without naming a group go elsewhere, into a new group when every one is locked. */
export default function Locked() {
  const s = reactive({ opened: 0, log: [] as { id: number; text: string }[] });
  const docs = new TabDocumentManager({ label: 'Notes and a terminal' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const write = (text: string) => s.log.unshift({ id: s.log.length, text });
  docs.onLocked((e) => write(`group ${e.group.index + 1} locked`));
  docs.onUnlocked((e) => write(`group ${e.group.index + 1} unlocked`));
  docs.onOpened((e) => write(`${e.document.title} opened in group ${e.group.index + 1}`));
  docs.open({ id: 'terminal', title: 'Terminal', content: () => notes('Terminal') });
  docs.lock(docs.groups[0]);
  docs.split(docs.groups[0], 'right');

  const open = () => {
    const n = ++s.opened;
    docs.open({ id: `note-${n}`, title: `Note ${n}`, content: () => notes(`Note ${n}`) });
  };
  const toggle = (index: number) => {
    const group = docs.groups[index];
    if (group) (group.locked ? docs.unlock(group) : docs.lock(group));
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open a note" variant="outline" onclick={open} />
        <Button text={() => (docs.groups[0]?.locked ? 'Unlock group 1' : 'Lock group 1')} variant="outline" onclick={() => toggle(0)} />
        <Button text={() => (docs.groups[1]?.locked ? 'Unlock group 2' : 'Lock group 2')} variant="outline" enabled={() => docs.groups.length > 1} onclick={() => toggle(1)} />
        <output class="td-state">{() => s.log.slice(0, 3).map((l) => l.text).join('; ')}</output>
      </Stack>
      {docs}
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
