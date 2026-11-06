# TabDocumentManager: New windows

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.4

A document, a group or a floating window can move into its own browser window and back. Its content moves with it without being recreated, and the new window is part of the same manager, so its tabs, menus, keys and dragging work the same way.

## Moving to a new window and back

Type in the form, choose a city and scroll the orders, then move the tab into a new window. The window opens beside the group at the same size, and shows the same component in the same state. Its title is that of the active document. When you close the window, its documents return to their original group.

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

| Method | Description |
| --- | --- |
| `The tab menu, the strip menu` | "Move into new window" moves the document or the whole group, or on a floating window's strip, the whole window. In a new window, "Move back to main window" returns the document or group. |
| `The keys` | Ctrl + K, then Shift + O moves the active document into a new window (`moveToNewWindow`). Ctrl + K, then Shift + D moves it back (`moveToMainWindow`). |
| `A drag past the edge of the browser window` | Releasing outside the page opens a new window there with the dragged item (`dragOutToNewWindow`). Dragging out of a new window returns the item to the main window, or to the window under the pointer. |
| `"Move to…"` | Tab and Shift + Tab move through the groups of every window, and past a floating window, the same arrow key selects a new window. |
| `Code` | `moveToNewWindow(doc \| group \| floatingWindow, { rect, url })`, `moveToMainWindow(doc \| group \| window)`, and `move`, `split`, `dock` and `float` with a group in any window. |

## Closing, blocked windows and events

When a new window closes, its documents either return or close (`newWindowCloseAction`). Each one raises `onClosing` as usual in the main window, so the prompt for unsaved changes appears there. Browsers open windows for a page only in response to a click or a key press, and may still block them. In that case, `onError` reports it and a floating window opens instead (`newWindowFallback`). In this example, a switch simulates a browser that blocks the window.

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

## Saving the layout with its windows

`saveLayout` writes each new window with its position on the screen, its layout and the original group of its documents. By default, `loadLayout` restores them as floating windows. To open them as windows again (`restoreWindows: 'reopen'`), the browser requires a click or a key press. If `loadLayout` is called from one, they open immediately. A page that loads its layout on startup shows them as floating windows, with a button that calls `reopenWindows()`.

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

```tsx
// On start: no click, so the windows wait as floating windows.
docs.restoreWindows = 'reopen';
docs.loadLayout(JSON.parse(localStorage.layout), restore);
reopenButton.onclick = () => docs.reopenWindows();
```

## What works in a new window

| Part | Details |
| --- | --- |
| `Tabs and groups` | Everything a group does: pinning, previews, the "…" list, the recently used list, splitting, and resizing with the mouse and keyboard. Maximize is available only in the main window. |
| `Menus, lists, tooltips` | They open in the new window's own top layer, because the kit's `Popup`, `ContextMenu` and `Tooltip` use the document of the element they open at. |
| `Keys` | The manager's keys, control shortcuts and access keys all work, because the kit listens in every connected document (`connectDocument`). |
| `Content` | Any component, such as a form with a `DropDown`, a `DataGrid` with its filter popup and keys, or an `MxForm` dialog opened from it in that window. |
| `Drag and drop` | Inside the window, the same as in the page: strips, the zones or guides of a group, and the edges of its layout. Dock areas and floating are available only in the main window. |
| `The look` | The page's style sheets (including constructed ones) and the attributes of `<html>` and `<body>` (`data-theme`, `data-identity`, density, `dir`, `lang`, classes) are copied and kept in sync, so a theme change applies to every window. |

### Limits

| Topic | Reason |
| --- | --- |
| `Frames` | An `<iframe>` in a document reloads when it moves to another window, as browsers do with every moved frame. |
| ``onMounted` of content made there` | The MotifJS core waits for the page's own document, so the manager lets content it creates in a new window attach to the page briefly first. A component that an application creates later inside such content does not receive `onMounted`. |
| `The window's place` | Browsers report when a window is resized, but not when it moves, so `rect` is read when it is needed. |
| `A closed window` | The window is already gone before anything can prevent it. Its documents return or close, each raising its event in the main window, and `onWindowClosing` cannot keep it open. |

## Changing or canceling

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

| Topic | Details |
| --- | --- |
| `The window` | Its content is a `main` landmark named after the manager. Its groups, strips and tabs work as they do in the page, with the same roving Tab stop. |
| `Focus` | When the user moves a document to a new window, focus moves to it there. When it moves back, focus returns to it in the main window. |
| `Announcements` | Announced politely in the window that has focus: moved to a new window, returned to the main window, window closed, and browser did not open the window. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowNewWindow` | `Bind<boolean>` | `true` | Allows documents, groups and floating windows to move into new windows. A document's own `allowNewWindow` takes precedence. |
| `newWindowUrl` | `Bind<string>` | `'about:blank'` | The page a new window opens, on the page's own origin (an empty page of the application). The move waits for it to load. |
| `newWindowTitle` | `Bind<string \| ((doc, window) => string)>` | `'{title} – {page}'` | The window's title. `{title}` is the title of the active document and `{page}` is the page title, and it stays up to date. |
| `newWindowSize` | `Bind<{ width, height } \| null>` | `null` | The initial size of a new window. `null` uses the size of what moves into it. |
| `newWindowFallback` | `Bind<'float' \| 'none'>` | `'float'` | What happens when the browser does not open a window: a floating window in the page, or nothing. |
| `newWindowCloseAction` | `Bind<'back' \| 'close'>` | `'back'` | Whether a new window's documents return to the main window (into their original group) or close when it closes. `onWindowClosing` can change this each time. |
| `restoreWindows` | `Bind<'float' \| 'reopen' \| 'main'>` | `'float'` | How `loadLayout` restores saved new windows: as floating windows, as windows again (see below), or as groups at the right of the main window. |
| `openWindow` | `(request) => Window \| null` | `window.open` | Opens the window, for an application shell, a host page with its own frame, or a test. `request` is `{ url, name, features, rect }`. |
| `dragOutToNewWindow` | `Bind<boolean>` | `true` | Dragging past the edge of the browser window opens a new window there, and dragging past the edge of a new window returns the item. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `moveToNewWindow(target, options?)` | `TabBrowserWindow \| null` | `target` is a document, a group or a floating window, and `options` is `{ rect, url }` (`rect` on the screen). Returns `null` when the move is not allowed, `onWindowOpening` cancels it, or the browser opens no window (which also raises `onError`). |
| `moveToMainWindow(target)` | `boolean` | Returns a document, a group or a `TabBrowserWindow` to its original group, otherwise to the active group of the main window. A window left empty closes. |
| `closeWindow(window), focusWindow(window)` | `Promise<boolean>`, `boolean` | Also applies to a new window, where closing follows `newWindowCloseAction`. |
| `reopenWindows()` | `number` | Reopens saved windows that the browser blocked (`restoreWindows: 'reopen'`). Call it from a click or a key press. |
| `browserWindows` | read-only, reactive | The new windows, with the most recently used last. |
| `saveLayout(), loadLayout(layout, factory?)` | `TabLayout` (version 3) | Also includes `browserWindows`: `rect` on the screen, the layout, and the original group (`home`). Versions 1 and 2 still load. |

### TabBrowserWindow

| Member | Type | Description |
| --- | --- | --- |
| `window` | `Window` | The browser window. |
| `element` | `HTMLDivElement` | The manager's part in that window (`.mx-tabdocs.mx-tabdocs__page`), which fills it. |
| `rect` | read-only | Its position on the screen and the size of its page, in pixels. |
| `groups, documents, activeGroup, activeDocument, index` | read-only, reactive | Its contents. The title follows `activeDocument`. |
| `moveToMainWindow(), close(), focus()` | methods | The manager's methods, scoped to this window. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `allowNewWindow` | `Bind<boolean \| undefined>` | Overrides the manager's setting for this document. `undefined` inherits the manager's value. |
| `browserWindow` | read-only, reactive | The new window containing it, or `null` in the main window (also on `TabGroup`). |

### Events

| Event | Contents |
| --- | --- |
| `onWindowOpening(e) / onWindowOpened(e)` | `{ document, group, window, rect, url }`, cancelable, and `rect` and `url` can be changed (`window` is the floating window being moved). Then `{ window, document, group }`. |
| `onWindowClosing(e) / onWindowClosed(e)` | Also applies to new windows, with `kind: 'floating' \| 'browser'` and `then: 'back' \| 'close'` (which can be changed). `reason` then is `'closed'`, `'docked'` (returned), `'empty'` or `'moved'` (a floating window that moved into a new window). |
| `onError(e)` | `{ error, document, group, fallback }`, where `error` is `'windowBlocked'` (no window opened) or `'windowNotUsable'` (a page from another origin). `fallback` can be changed. |
| `onClosing` | A document in a closed window closes in the main window (`newWindowCloseAction: 'close'`), so the prompt for a dirty document appears there. |
| `onLayoutChanging / onLayoutChanged` | Also includes `'newWindow'` and `'mainWindow'`, with `window`. |
| `onDragOver, onDropping, onDropped` | Additional `target` types: `'new-window'` (with `rect` on the screen) and `'main-window'`. An `'edge'` position in a new window has `browserWindow`. |

### For other windows in the kit

| Export | Item |
| --- | --- |
| `connectDocument(doc), disconnectDocument(doc), pageDocuments()` | The kit's document-level listeners (keys, access keys, tooltips, the focus guard) also work in another same-origin document, and are disconnected when its window closes. |
| `mirrorPage(source, target)` | Copies the page's style sheets and the attributes of `<html>` and `<body>` into another document and keeps them in sync. Returns a function that stops this. |
| `ResizeWatch` | A `ResizeObserver` that follows its elements into another window, because a browser's observer only reports elements of its own window. |

See the [overview](tabdocs.md#api), [Tabs](tabdocs-tabs.md), [Menus and keys](tabdocs-menus.md), [Drag and drop](tabdocs-drag.md) and [Dock and floating windows](tabdocs-dock.md) for the rest of the API.

## Feedback

Loading issues…

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
  // A document with unsaved changes prompts before closing, in the main window.
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

/** Recreates a saved document by its type. */
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
