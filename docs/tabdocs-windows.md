# TabDocumentManager: New windows

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.1

A document, a group or a floating window moves into a browser window of its own, and back. Its content moves with it, nothing is made again, and the new window is a part of the same manager: its tabs, menus, keys and drag work as they do here.

## Into a new window and back

Type in the form, choose a city, scroll the orders, then move the tab into a new window: the window opens at the size of the group, beside it, and shows the same component, in the same state. Its title is the active document's. Close the window and its documents come back to the group they came from.

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

| Way | What it does |
| --- | --- |
| `The tab menu, the strip menu` | "Move into new window" moves the document, or the whole group; on a floating window's strip, the whole window. In a new window, "Move back to main window" brings the document (or the group) back. |
| `The keys` | Ctrl + K, then Shift + O: the active document into a new window (`moveToNewWindow`); Ctrl + K, then Shift + D: back (`moveToMainWindow`). |
| `A drag past the edge of the browser window` | Let go outside the page, a new window opens there with what was dragged (`dragOutToNewWindow`). Dragged out of a new window, it goes back to the main window, or into the window under the pointer. |
| `"Move to…"` | Tab and Shift + Tab go through the groups of every window; past floating, the same arrow points at a new window. |
| `Code` | `moveToNewWindow(doc \| group \| floatingWindow, { rect, url })`, `moveToMainWindow(doc \| group \| window)`, and `move`, `split`, `dock`, `float` with a group of any window. |

## Closing, blocked windows, events

When a new window closes its documents come back, or close (`newWindowCloseAction`): each one asks through `onClosing` as usual, back in the main window, so a document with unsaved changes is asked about there. A browser opens windows for a page only on a click or a key, and may block them anyway: then `onError` tells, and a floating window opens instead (`newWindowFallback`). Here a switch plays the browser that blocks.

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

## Saving the layout with its windows

`saveLayout` writes each new window: its place on the screen, its layout and the group its documents came from. `loadLayout` puts them back as floating windows by default. To open them as windows again (`restoreWindows: 'reopen'`) the browser wants a click or a key: `loadLayout` called from one opens them right away, and a page that loads its layout on start shows them floating, with a button calling `reopenWindows()`.

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

```tsx
// On start: no click, so the windows wait as floating windows.
docs.restoreWindows = 'reopen';
docs.loadLayout(JSON.parse(localStorage.layout), restore);
reopenButton.onclick = () => docs.reopenWindows();
```

## What works in a new window

| Part | How |
| --- | --- |
| `Tabs and groups` | Everything a group does: pinning, previews, the "…" list, the recently used list, splitting, the splitters by the mouse and the keys, maximize is the main window's only. |
| `Menus, lists, tooltips` | They open in the new window's own top layer: the kit's `Popup`, `ContextMenu` and `Tooltip` go to the document of the element they open at. |
| `Keys` | The manager's keys, every control's shortcuts and access keys: the kit listens in every connected document (`connectDocument`). |
| `Content` | Any component: a form with a `DropDown`, a `DataGrid` with its filter popup and its keys, an `MxForm` dialog opened from it (in that window). |
| `Drag and drop` | Inside the window as in the page: strips, the zones or guides of a group, the edges of its layout. No dock areas and no floating there: those are the main window's. |
| `The look` | The page's style sheets (also constructed ones) and the attributes of `<html>` and `<body>` (`data-theme`, `data-identity`, density, `dir`, `lang`, classes) are copied and followed: change the theme here and every window follows. |

### Limits

| Topic | Why |
| --- | --- |
| `Frames` | An `<iframe>` in a document loads again when it moves into another window: browsers do that for every moved frame. |
| ``onMounted` of content made there` | Core waits for the page's own document (CORE-REPORTS R30): the manager lets content it makes in a new window arrive in the page for a moment first. A component an app builds later inside such content gets no `onMounted`. |
| `The window's place` | Browsers tell when a window is resized, not when it moves: `rect` is read when it is needed. |
| `A closed window` | It is gone before anything can ask: its documents come back (or close, each one asking in the main window). `onWindowClosing` cannot keep it. |

## Changing or refusing

```tsx
docs.onWindowOpening((e) => {
  // Reports open on the second screen, wide.
  if (e.document?.type === 'report') e.rect = { x: screen.width, y: 0, width: 1200, height: 800 };
});
docs.onWindowClosing((e) => {
  // Drafts close with their window, everything else comes back.
  if (e.kind === 'browser') e.then = e.window.documents.every((d) => d.type === 'draft') ? 'close' : 'back';
});
docs.onError((e) => {
  if (e.error === 'windowBlocked') toast('Allow pop-ups for this site to open documents in windows of their own.');
});
```

## Accessibility

| Topic | How |
| --- | --- |
| `The window` | Its content is a `main` landmark named after the manager; its groups, strips and tabs are what they are in the page, with the roving tab stop. |
| `Focus` | Moving into a new window by the user focuses the document there; moving back focuses it in the main window. |
| `Announcements` | Politely, in the window that has focus: moved into a new window, back in the main window, window closed, the browser did not open the window. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowNewWindow` | `Bind<boolean>` | `true` | Documents, groups and floating windows may move into new windows; a document's own `allowNewWindow` wins. |
| `newWindowUrl` | `Bind<string>` | `'about:blank'` | The page a new window opens, on the page's own origin (one of the app's, with nothing in it); it is waited for before the move. |
| `newWindowTitle` | `Bind<string \| ((doc, window) => string)>` | `'{title} – {page}'` | The window's title: `{title}` is its active document's title, `{page}` the page's title; it follows them. |
| `newWindowSize` | `Bind<{ width, height } \| null>` | `null` | The size a new window opens at; `null`: the size of what moves into it. |
| `newWindowFallback` | `Bind<'float' \| 'none'>` | `'float'` | When the browser opens no window: a floating window in the page instead, or nothing. |
| `newWindowCloseAction` | `Bind<'back' \| 'close'>` | `'back'` | When a new window closes, its documents go back to the main window (into the group they came from), or close; `onWindowClosing` may change it each time. |
| `restoreWindows` | `Bind<'float' \| 'reopen' \| 'main'>` | `'float'` | What `loadLayout` does with saved new windows: floating windows, windows again (see below), or groups at the right of the main window. |
| `openWindow` | `(request) => Window \| null` | `window.open` | Opens the window: an application shell, a host page with its own frame, a test. `request` is `{ url, name, features, rect }`. |
| `dragOutToNewWindow` | `Bind<boolean>` | `true` | A drag let go past the edge of the browser window opens a new window there; past the edge of a new window it goes back. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `moveToNewWindow(target, options?)` | `TabBrowserWindow \| null` | `target`: a document, a group or a floating window; `options`: `{ rect, url }` (`rect` on the screen). `null` when it may not move, `onWindowOpening` cancels, or the browser opens none (then `onError`). |
| `moveToMainWindow(target)` | `boolean` | A document, a group or a `TabBrowserWindow`: back into the group it came from, else the main window's active one. A window left empty closes. |
| `closeWindow(window), focusWindow(window)` | `Promise<boolean>`, `boolean` | Also for a new window: closing does what `newWindowCloseAction` says. |
| `reopenWindows()` | `number` | Opens again the saved windows the browser blocked (`restoreWindows: 'reopen'`); call it from a click or a key. |
| `browserWindows` | read-only, reactive | The new windows, the one used last at the end. |
| `saveLayout(), loadLayout(layout, factory?)` | `TabLayout` (version 3) | Also `browserWindows`: `rect` on the screen, the layout, the group they came from (`home`). Versions 1 and 2 still load. |

### TabBrowserWindow

| Member | Kind | Description |
| --- | --- | --- |
| `window` | `Window` | The browser window. |
| `element` | `HTMLDivElement` | The manager's part in that window (`.mx-tabdocs.mx-tabdocs__page`), filling it. |
| `rect` | read-only | Its place on the screen and the size of its page, in pixels. |
| `groups, documents, activeGroup, activeDocument, index` | read-only, reactive | What it holds; its title follows `activeDocument`. |
| `moveToMainWindow(), close(), focus()` | methods | The manager's methods for this window. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowNewWindow` | `Bind<boolean \| undefined>` | This document's own setting; `undefined` follows the manager. |
| `browserWindow` | read-only, reactive | The new window it is in, `null` in the main window (also on `TabGroup`). |

### Events

| Event | What it carries |
| --- | --- |
| `onWindowOpening(e) / onWindowOpened(e)` | `{ document, group, window, rect, url }`, cancelable, `rect` and `url` may be changed (`window`: the floating window that moves); then `{ window, document, group }`. |
| `onWindowClosing(e) / onWindowClosed(e)` | Also for new windows, with `kind: 'floating' \| 'browser'` and `then: 'back' \| 'close'` (may be changed). Then `reason`: `'closed'`, `'docked'` (brought back), `'empty'` or `'moved'` (a floating window that went into a new window). |
| `onError(e)` | `{ error, document, group, fallback }`: `'windowBlocked'` (no window came) or `'windowNotUsable'` (a page of another origin); `fallback` may be changed. |
| `onClosing` | A document of a closed window closes (`newWindowCloseAction: 'close'`) back in the main window, so a dirty one is asked about there. |
| `onLayoutChanging / onLayoutChanged` | Also `'newWindow'` and `'mainWindow'`, with `window`. |
| `onDragOver, onDropping, onDropped` | New `target` kinds: `'new-window'` (with `rect` on the screen) and `'main-window'`; an `'edge'` place in a new window has `browserWindow`. |

### For other windows in the kit

| Export | What |
| --- | --- |
| `connectDocument(doc), disconnectDocument(doc), pageDocuments()` | The kit's document-wide listeners (keys, access keys, tooltips, the focus guard) work in another same-origin document too; it is disconnected when its window closes. |
| `mirrorPage(source, target)` | Copies the page's style sheets and the attributes of `<html>` and `<body>` into another document and keeps them in step; returns the function that stops. |
| `ResizeWatch` | A `ResizeObserver` that follows its elements into another window (a browser's observer only reports elements of its own window). |

The rest of the API is on the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md), [Menus and keys](tabdocs-menus.md), [Drag and drop](tabdocs-drag.md) and [Dock and floating windows](tabdocs-dock.md).

## Example files

`NewWindow.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerCard, notes, ordersGrid } from './contents';

/** A document moves into a browser window of its own and back; what was typed, chosen and scrolled stays as it was. */
export default function NewWindow() {
  const customer = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  const docs = new TabDocumentManager({ label: 'Documents in new windows' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'customer', title: 'Customer', tooltip: () => `Customer: ${customer.name}`, content: () => customerCard(customer) }));
  docs.open(new TabDocument({ id: 'orders', title: 'Orders', content: () => ordersGrid(60) }));
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));

  const active = () => docs.activeDocument;
  const windows = () => {
    const list = docs.browserWindows;
    if (!list.length) return 'Every document is in this window.';
    return list.map((w, i) => `Window ${i + 1}: ${w.documents.map((d) => d.title).join(', ')}`).join('. ') + '.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move the active document into a new window" variant="outline" enabled={() => !!active() && !active()!.browserWindow} onclick={() => docs.moveToNewWindow(active()!)} />
        <Button text="Move its group" variant="outline" enabled={() => !!docs.activeGroup && !docs.activeGroup.browserWindow} onclick={() => docs.moveToNewWindow(docs.activeGroup!)} />
        <Button text="Bring everything back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />
      </Stack>
      {docs}
      <output class="td-state">{() => `${windows()} Customer: ${customer.name}, ${customer.city}.`}</output>
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

`WindowOptions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { confirm, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, notes } from './contents';

/** Closing a new window brings its documents back or closes them; a browser that blocks the window gets a floating one. Every event is logged. */
export default function WindowOptions() {
  const s = reactive({ back: true, blocked: false, fallback: true, log: [] as { id: number; text: string }[] });
  let next = 0;
  const note = (text: string) => {
    s.log.unshift({ id: ++next, text });
    if (s.log.length > 6) s.log.pop();
  };
  const draft = reactive({ name: 'Draft customer', email: '', city: '' });
  const docs = new TabDocumentManager({
    label: 'New window settings',
    newWindowCloseAction: () => (s.back ? 'back' : 'close'),
    newWindowFallback: () => (s.fallback ? 'float' : 'none'),
    // A browser that blocks windows hands back none: here a switch plays that browser.
    openWindow: (r) => (s.blocked ? null : window.open(r.url, r.name, r.features)),
    onWindowOpening: (e) => note(`windowOpening: ${e.document?.title ?? 'a group'}`),
    onWindowOpened: (e) => note(`windowOpened: window ${e.window.index + 1}`),
    onWindowClosing: (e) => note(`windowClosing (${e.kind}): then ${e.then}`),
    onWindowClosed: (e) => note(`windowClosed (${e.kind}): ${e.reason}`),
    onError: (e) => note(`error: ${e.error}, fallback ${e.fallback}`),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'draft', title: 'Draft', dirty: () => draft.email === '', content: () => customerForm(draft) }));
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));
  // A document with unsaved changes asks before it closes, in the main window.
  docs.onClosing((e) => {
    if (e.document.dirty) e.promise = confirm(`${e.document.title} has unsaved changes. Close it anyway?`, { title: 'Close', tone: 'caution' });
  });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Documents come back when the window closes" x-model={() => s.back} />
        <Switch label="The browser blocks new windows" x-model={() => s.blocked} />
        <Switch label="Float when blocked" x-model={() => s.fallback} />
      </Stack>
      {docs}
      <ol class="td-log" aria-label="Events">
        {s.log.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ol>
    </>
  );
}
```

`WindowLayout.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument, type TabRestoreWindows } from '@motifx-community/ui';
import { notes, ordersGrid } from './contents';

/** Makes a saved document again by its type. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid(40) });
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/**
 * The layout saves its new windows too (place on the screen, layout). Loading puts them back as
 * floating windows, among the documents, or as windows again: a browser opens windows only on a
 * click, so the restore button, a click, may open them, and "Reopen windows" opens what was blocked.
 */
export default function WindowLayout() {
  const s = reactive({ json: '', saved: null as TabLayout | null, mode: 'float' as TabRestoreWindows });
  const docs = new TabDocumentManager({ label: 'Saved layout with new windows', restoreWindows: () => s.mode });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders' }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));

  const save = () => {
    s.saved = docs.saveLayout();
    s.json = JSON.stringify(s.saved, null, 2);
  };
  save();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move To do into a new window" variant="outline" onclick={() => docs.moveToNewWindow(docs.findDocument('todo')!)} />
        <Button text="Save layout" variant="outline" onclick={save} />
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={() => s.saved && docs.loadLayout(s.saved, restore)} />
        <Button text="Reopen windows" variant="outline" onclick={() => docs.reopenWindows()} />
      </Stack>
      <RadioGroup
        label="Saved windows come back"
        orientation="horizontal"
        items={[
          { value: 'float', text: 'As floating windows' },
          { value: 'reopen', text: 'As windows again' },
          { value: 'main', text: 'In this window' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.mode}
      />
      {docs}
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
```
