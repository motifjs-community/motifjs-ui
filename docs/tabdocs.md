# TabDocumentManager

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.1

A document manager in the way code editors arrange files: documents in tabs, tabs in groups, groups split side by side and one under the other. A document's content is any component, a form, a grid or plain text, and it is moved, never made again, when its tab goes to another group. Everything the user does is a method too, asks first and reports after; the whole layout saves to JSON and comes back. Preview and pinned tabs, sizes and copies are on [Tabs](tabdocs-tabs.md); context menus, lists and keys on [Menus and keys](tabdocs-menus.md).

## Import

```tsx
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';
```

## Documents, groups and splits

Make a manager, give it a size, and `open` documents in it. `split` opens a new group beside one; drag the line between two groups (or focus it and use the arrows), double click it to even the sizes, double click a tab to give its group all the room. The buttons at the end of each strip split and maximize.

```tsx
/** An order of the examples. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  amount: number;
}

const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

/** `count` made-up orders, the same every time. */
export function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1001 + i,
    customer: customers[i % customers.length],
    city: cities[(i * 7) % cities.length],
    amount: Math.round(((i * 37) % 900) + 100),
  }));
}
```

## Options

Every behaviour is a prop that takes a value or a function, followed live; a document's own `closable` and `contentLifetime` win over the manager's. Here Alpha cannot be closed and Gamma has unsaved changes.

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

## From code, and the events

Each thing the user does is also a method (`open`, `close`, `activate`, `split`, `move`, `closeGroup`, `focusGroup`, `maximizeGroup`, `restoreGroups`, `evenSizes`, `resizeGroup`), asks first through a cancelable `on…ing` event and reports through `on…ed`, with `byUser` telling the two apart.

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

## Unsaved changes

`dirty` follows a function of the form's data: the tab shows a dot in place of its close button. `onClosing` sets `e.promise` to ask; the document closes when the promise says `true`.

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

## Saving and restoring the layout

`saveLayout()` writes plain JSON: the tree of splits with each child's share, the groups with their documents (`id`, `type`, `title`, `state`, `pinned`, `preview`), the active and recently used tabs, the active and maximized group. `loadLayout(json, factory)` builds it again; the factory makes each document by its `type`.

```tsx
/** An order of the examples. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  amount: number;
}

const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

/** `count` made-up orders, the same every time. */
export function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1001 + i,
    customer: customers[i % customers.length],
    city: cities[(i * 7) % cities.length],
    amount: Math.round(((i * 37) % 900) + 100),
  }));
}
```

## Content lifetime

`contentLifetime` decides when a document's content is built and how long it lives. Whatever it is, moving a tab or splitting a group never builds the content again: the same component goes along.

| Lifetime | What happens |
| --- | --- |
| `keep (default)` | Built when the document opens; lives, with its state, until it closes. |
| `lazy` | Built the first time it is shown; then kept. |
| `dispose` | Built when shown, disposed when hidden; made again from `content` (or the manager's `factory`) the next time, with the document's `state`. A component given as it is cannot be made again, so it is kept. |

## Keyboard

The keys work while focus is inside the manager; each is a list of chords in `keys`, so any of them can be changed or turned off. A browser tab keeps Ctrl+W, Ctrl+Tab, Ctrl+Page Up / Down and often Ctrl+1…9 for itself, so the keys a manager starts with are ones a browser tab lets through, and the desktop key in brackets works too where it can (an installed app takes the desktop keys, `keyPreset`). The recently used list, back and forward, reopening and the other keys are on [Menus and keys](tabdocs-menus.md#keyboard).

| Key | What it does |
| --- | --- |
| `Alt + Page Down / Page Up (Ctrl + Page Down / Up)` | The next / previous tab of the active group, around the ends (`nextTab`, `previousTab`). |
| `Ctrl + Alt + W (Ctrl + W)` | Closes the active document (`closeTab`). |
| `Ctrl + Alt + 1 … 9 (Ctrl + 1 … 9)` | Focuses group 1 to 9 (`focusGroup`, written `Ctrl+Alt+{n}`). |
| `Ctrl + \` | Splits the active group to the right; the active document goes along when it is not the only one, or a copy of it (`splitRight`). |
| `Right / Left, Home / End (on a tab)` | The next / previous, first / last tab; it is activated too unless `activation` is manual (`stripNext`, `stripPrevious`, `stripFirst`, `stripLast`). |
| `Enter, Space (on a tab)` | Activates it. |
| `Delete (on a tab)` | Closes it (`closeFocusedTab`). |
| `Arrows, Home / End (on a splitter)` | Make the group before it smaller or larger by `resizeStep`, as small or as large as it can be (`resizeSmaller`, `resizeLarger`, `resizeMin`, `resizeMax`). |
| `Tab` | From the strip (one stop: the active tab) to the group buttons, the content, the splitter, the next group. |

## Accessibility

| Topic | How |
| --- | --- |
| `Groups` | Each group is a `group` named “Group 1”, “Group 2”…; with `label` the manager is a `region`. |
| `Tabs` | A `tablist` per group (“Documents in group 1”) of `tab`s, each controlling its `tabpanel`; a roving `tabindex` keeps one Tab stop per strip. A tab says “unsaved changes” while its document is dirty; `aria-keyshortcuts` names the key that closes it. |
| `Splitters` | `separator`s with `aria-orientation`, `aria-valuenow` (the share of the group before it, 0 to 100) and `aria-controls`. |
| `Announcements` | A polite live region says what was opened, closed, moved, split, maximized or restored (`announce`). |
| `Focus` | A group remembers what had focus in it; closing the focused tab moves focus to the tab that takes its place. |

## Localization

Every text comes from `uiLocale.strings` (`tabDocs…`: the group and strip names, “No open documents”, “unsaved changes”, the buttons, the announcements), in English and Turkish; `texts` changes some for one manager.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-tabdocs` | The root; `data-maximized` while a group is maximized, `data-resizing` while a splitter is dragged; `data-tab-size`, `data-pinned-size`, `data-pinned-row`, `data-wrap`, `data-scroll-buttons` from the props. |
| `.mx-tabdocs__split` | A split; `data-orientation`. |
| `.mx-tabdocs__sash` | A splitter (`role="separator"`). |
| `.mx-tabdocs__group` | A group; `data-active`, `data-empty`, `data-maximized`, `data-locked`. |
| `.mx-tabdocs__bar, __strip, __tabs, __pinned, __row, __scroll, __actions` | The strip row; the tab list with its scroll buttons; the `tablist`, its pinned row and the row of the others; the kit Toolbar with the group buttons. |
| `.mx-tabdocs__tab` | A tab; `aria-selected`, `data-dirty`, `data-close` (`always`, `active`), `data-pinned`, `data-preview`, `data-tone`, `data-icon`. |
| `.mx-tabdocs__icon, __letter, __title, __description, __badge, __pin, __close, __dirty` | The parts of a tab; a badge that is a dot has `data-dot`. |
| `.mx-tabdocs__popup, __list-title, __list-note, __list-dirty` | The "…" and recently used lists. |
| `.mx-tabdocs__panels, __panel, __empty` | The content area, a document's `tabpanel`, the empty group's text. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `tabdocs.manager, group, bar, pinned, panel, empty` | Units: behind the groups, a group, its strip and the line under it, the pinned tabs' row, a panel, an empty group's text. |
| `tabdocs.tab, indicator, title, letter, pin, description, icon, badge, close, dirty` | Units: a tab (`hover`, `selected`, `before-selected`, `focus`, `dragging`, `title` …; its end side is the line between tabs), the bar on it (`selected`, `active` in the active group), its parts in their tones. |
| `tabdocs.scroll, scroll-icon, scrollbar, thumb, count, sash, sash-line` | Units: the scroll buttons, the thin scrollbar, the count on "…", a splitter and its line (`across`, `active`). |
| `tabdocs.tabs-height, tab-inset, tab-spacing, title-max, title-min, icon-room, close-room, pin-room, sash-thickness` | Sizes the layout counts with (a shrinking tab keeps its icon, its close button and a few letters). |
| `tabdocs.indicator-inset, indicator-inset-start, indicator-inset-end` | Where the bar on a tab stands. |
| `tabdocs.focus-width, focus-offset, touch-*` | The ring's room at a small toolbar's ends; the sizes for a finger. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `Bind<string>` | `''` | Names the manager: it becomes a `region` landmark. The same property as `text`. |
| `closeButton` | `Bind<'always' \| 'active' \| 'never'>` | `'always'` | Where tabs show a close button: every tab, the active one and the one under the pointer, none. A document with `closable: false` shows none. |
| `contentLifetime` | `Bind<'keep' \| 'lazy' \| 'dispose'>` | `'keep'` | When content is built and how long it lives (see below). A document's own value wins. |
| `closeEmptyGroups` | `Bind<boolean>` | `true` | A group left without documents closes; the last group never does. |
| `openPosition` | `Bind<'afterActive' \| 'end' \| 'start'>` | `'afterActive'` | Where `open` puts a tab when no `index` is given. |
| `afterClose` | `Bind<'recent' \| 'left' \| 'right'>` | `'recent'` | Which tab becomes active when the active one closes: the one used last, or a neighbour. |
| `activation` | `Bind<'auto' \| 'manual'>` | `'auto'` | `auto`: the arrow keys in a strip activate the tab they reach. `manual`: Enter or Space does. |
| `minGroupWidth, minGroupHeight` | `Bind<number>` | `160`, `100` | The smallest size of a group, in pixels; a splitter stops there. |
| `resizeStep` | `Bind<number>` | `10` | How far a splitter key moves a splitter, in pixels. |
| `groupActions` | `Bind<boolean>` | `true` | The split, maximize and "…" buttons at the end of each strip. |
| `maximizeOnDoubleClick` | `Bind<boolean>` | `true` | A double click on a tab maximizes its group, or restores the groups (a preview tab is kept open instead). |
| `keyPreset` | `Bind<'auto' \| 'browser' \| 'desktop'>` | `'auto'` | The keys a manager starts with: keys a browser tab lets through, or a desktop editor's; `auto` takes the desktop keys in an installed app. |
| `keys` | `Bind<Partial<TabDocumentKeys>>` | see Keyboard | Changes some keys; the others keep the preset's. An empty list turns a key off. |
| `factory` | `Bind<(doc) => ComponentBase \| null>` | `null` | Makes the content of a document that brings none, usually by its `type`. |
| `texts` | `Bind<Partial<UiStrings>>` | `{}` | Texts for this manager only, over `uiLocale.strings`. |
| `announce` | `Bind<boolean>` | `true` | Opened, closed, moved, split, maximized: said politely to screen readers. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stays the same for the document's life; made up when left out. `findDocument(id)` finds it. |
| `type` | `string` | The key a layout is restored by: the `loadLayout` factory and the manager's `factory` read it. |
| `title, description` | `Bind<string>` | The tab's text; the description follows it, quieter, and tells two documents of the same title apart. |
| `icon, badge` | `Bind<IconSource \| null>`, `Bind<string \| number \| null>` | An icon before the title; a short text or count after it. |
| `tooltip` | `Bind<string>` | Shown when the pointer rests on the tab or the tab has focus. Default: the title and the description. |
| `dirty` | `Bind<boolean>` | Unsaved changes: a dot takes the close button's place (the button comes back under the pointer), and screen readers hear “unsaved changes”. |
| `closable` | `Bind<boolean>` | Default `true`. `false`: no close button, and the user cannot close it (code still can). |
| `pinned, preview` | `Bind<boolean>` | A pinned tab stays at the start; a preview tab gives its place to the next preview. Saved with the layout. See [Tabs](tabdocs-tabs.md). |
| `badge, tone, actions, clone, allowDuplicate` |  | A count or a dot, a colour, toolbar buttons while active, a copy's content. See [Tabs](tabdocs-tabs.md) and [Menus and keys](tabdocs-menus.md). |
| `contentLifetime` | `Bind<ContentLifetime \| undefined>` | This document's own lifetime; `undefined` follows the manager. |
| `content` | `ComponentBase \| (doc) => ComponentBase` | The content: a component, or a function that makes it (and makes it again after `dispose`). |
| `state` | `Bind<unknown>` | The app's own data for the document, saved with the layout. |
| `manager, group, isOpen, isActive, contentComponent` | read-only, reactive | Where it is open, and the content made for it. |
| `activate(focus?), close()` | `boolean`, `Promise<boolean>` | The same as the manager's methods. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `groups` | read-only, reactive | The groups in layout order: left to right, top to bottom. |
| `documents` | read-only, reactive | Every open document, group by group. |
| `activeGroup, activeDocument` | read-only, reactive | The group that has focus or had it last, and its active document. |
| `maximizedGroup` | read-only, reactive | The maximized group, `null` when none is. |
| `recentDocuments, closedDocuments, canGoBack, canGoForward` | read-only, reactive | The documents used last, the ones `reopenClosed` can open, and the history. See [Menus and keys](tabdocs-menus.md). |
| `TabDocumentManager.browserKeys, TabDocumentManager.desktopKeys` | static | The two key presets. |

### TabGroup

| Member | Access | Description |
| --- | --- | --- |
| `documents, activeDocument, recentDocuments` | read-only, reactive | In strip order; the active one; the one used last first. |
| `index, isActive, isMaximized, isEmpty` | read-only, reactive | Its place in `groups`, from 0, and its state. |
| `locked` | read/write, reactive | A locked group takes no document opened without naming the group. `lock()` and `unlock()` ask first and announce it. |
| `previewDocument` | read-only, reactive | The group's preview tab's document, if it has one. |
| `open(doc, options?), activate(doc), closeAll(), close(), split(direction, doc?), maximize(), lock(), unlock(), focus()` |  | The manager's methods for this group. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(doc, { group?, index?, active?, focus? })` | `TabDocument \| null` | Opens a `TabDocument` (or one made from options) in a group, the active one by default; a document already open is activated. `null` when `onOpening` cancels. |
| `close(doc)` | `Promise<boolean>` | Closes as the close button does; `false` when `onClosing` keeps it. |
| `closeAll(group?)` | `Promise<boolean>` | Closes the documents of a group, or of all of them; `false` when some stay. |
| `activate(doc, focus?)` | `boolean` | Makes it its group's active tab and its group the active group; `focus` moves focus into the content. |
| `activateNext(group?, focus?), activatePrevious(group?, focus?)` | `boolean` | The next or previous tab, around the ends (Ctrl + Page Down / Up). |
| `move(doc, group, index?)` | `boolean` | To another place in its group, or to another group. The content goes along as it is. |
| `split(group, direction, doc?)` | `TabGroup \| null` | A new group on the `'left'`, `'right'`, `'up'` or `'down'` side; `doc` moves into it. `group` `null`: along that edge of the whole layout. |
| `closeGroup(group)` | `Promise<boolean>` | Closes its documents, then the group. The last group stays, empty. |
| `focusGroup(group \| index)` | `boolean` | Makes it active and focuses what had focus in it last. |
| `maximizeGroup(group), restoreGroups()` | `boolean` | One group takes all the room; the others wait, out of sight, as they were. |
| `evenSizes()` | `boolean` | Every group of every split the same size. |
| `resizeGroup(group, size)` | `boolean` | A group's size along its split: pixels or a share (`'30%'`); the neighbour after it gives or takes the room. |
| `findDocument(id), contentOf(doc)` | `TabDocument \| null`, `ComponentBase \| null` |  |
| `saveLayout()` | `TabLayout` | The layout as plain JSON (see below). |
| `loadLayout(layout, factory?)` | `boolean` | Puts a saved layout in place of the current one, whose documents close without asking. `factory(saved)` returns the document, its options or its content. |

### Events

| Event | What it carries |
| --- | --- |
| `onOpening(e), onOpened(e)` | `{ document, group, index, active, byUser }`; `opening` is cancelable and may change `group` and `index`. |
| `onClosing(e), onClosed(e)` | `{ document, group, index, byUser }`; `closing` is cancelable, or sets `e.promise` (`Promise<boolean>`) to ask first. |
| `onDocumentActivating(e), onDocumentActivated(e)` | `{ document, previous, group, byUser }`; `activating` (a tab is selected) is cancelable; `activated` also runs when another group becomes active. |
| `onMoving(e), onMoved(e)` | `{ document, from, fromIndex, to, toIndex, byUser }`; `moving` is cancelable. |
| `onSplitting(e), onSplit(e)` | `{ group, direction, document, byUser }` (and `newGroup` after); `splitting` is cancelable. `group` is `null` when the new group goes along an edge of the whole layout. |
| `onLayoutChanging(e), onLayoutChanged(e)` | `{ change, group, byUser }`, `change` one of `'split'`, `'closeGroup'`, `'resize'`, `'evenSizes'`, `'maximize'`, `'restore'`, `'move'` (a whole group moved or merged), `'load'`; `changing` is cancelable (a split asks through `onSplitting`). |

## Example files

`Overview.tsx`

```tsx
import { reactive } from '@motifx/core';
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, notes, ordersGrid } from './contents';

/** Three kinds of content in two groups: a form, a grid and plain text. */
export default function Overview() {
  const docs = new TabDocumentManager({ label: 'Workspace' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';

  const ada = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  docs.open(new TabDocument({ id: 'ada', type: 'customer', title: () => ada.name || 'New customer', description: 'Customers', content: () => customerForm(ada) }));
  docs.open(new TabDocument({ id: 'orders', type: 'orders', title: 'Orders', badge: 60, content: () => ordersGrid() }));
  const readme = docs.open(new TabDocument({ id: 'readme', type: 'notes', title: 'Read me', content: () => notes('Read me') }))!;
  docs.split(docs.groups[0], 'right', readme);
  docs.activate(docs.findDocument('orders')!);

  return <>{docs}</>;
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

`orders.ts`

```tsx
/** An order of the examples. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  amount: number;
}

const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];

/** `count` made-up orders, the same every time. */
export function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1001 + i,
    customer: customers[i % customers.length],
    city: cities[(i * 7) % cities.length],
    amount: Math.round(((i * 37) % 900) + 100),
  }));
}
```

`Options.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocument, TabDocumentManager, type ContentLifetime, type TabCloseButton } from '@motifx-community/ui';
import { notes } from './contents';

/** Every behaviour is a prop, followed live: here bound to the switches above the manager. */
export default function Options() {
  const s = reactive({
    closeButton: 'always' as TabCloseButton,
    lifetime: 'keep' as ContentLifetime,
    closeEmptyGroups: true,
    groupActions: true,
    manual: false,
    built: 0,
  });

  const docs = new TabDocumentManager({
    label: 'Live options',
    closeButton: () => s.closeButton,
    contentLifetime: () => s.lifetime,
    closeEmptyGroups: () => s.closeEmptyGroups,
    groupActions: () => s.groupActions,
    activation: () => (s.manual ? 'manual' : 'auto'),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const name of ['Alpha', 'Beta', 'Gamma', 'Delta']) {
    docs.open(
      new TabDocument({
        id: name.toLowerCase(),
        title: name,
        dirty: name === 'Gamma',
        closable: name !== 'Alpha',
        content: () => {
          s.built++;
          return notes(name);
        },
      }),
    );
  }

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Close button"
          orientation="horizontal"
          items={[
            { value: 'always', text: 'Always' },
            { value: 'active', text: 'Active and hover' },
            { value: 'never', text: 'Never' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.closeButton}
        />
        <RadioGroup
          label="Content lifetime"
          orientation="horizontal"
          items={[
            { value: 'keep', text: 'Keep' },
            { value: 'lazy', text: 'Lazy' },
            { value: 'dispose', text: 'Dispose' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.lifetime}
        />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Close empty groups" x-model={() => s.closeEmptyGroups} />
        <Switch label="Group buttons" x-model={() => s.groupActions} />
        <Switch label="Manual activation" x-model={() => s.manual} />
        <output class="td-built">{() => `contents built: ${s.built}`}</output>
      </Stack>
      {docs}
    </>
  );
}
```

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager, type SplitDirection } from '@motifx-community/ui';
import { notes } from './contents';

/** Everything the user does is a method too; the events report each change, by the user or by code. */
export default function FromCode() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0, opened: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };

  const docs = new TabDocumentManager({ label: 'Driven from code' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.onOpened((e) => write(`opened ${e.document.title} in group ${e.group.index + 1}`));
  docs.onClosed((e) => write(`closed ${e.document.title}${e.byUser ? ' (user)' : ''}`));
  docs.onDocumentActivated((e) => write(`active: ${e.document?.title ?? 'none'}${e.byUser ? ' (user)' : ''}`));
  docs.onMoved((e) => write(`moved ${e.document.title} to group ${e.to.index + 1}`));
  docs.onLayoutChanged((e) => write(`layout: ${e.change}${e.byUser ? ' (user)' : ''}`));

  const open = () => {
    const n = ++log.opened;
    docs.open({ id: `page-${n}`, type: 'page', title: `Page ${n}`, content: () => notes(`Page ${n}`) });
  };
  const split = (direction: SplitDirection) => {
    const group = docs.activeGroup;
    if (group) docs.split(group, direction, group.documents.length > 1 ? (group.activeDocument ?? undefined) : undefined);
  };
  const moveOn = () => {
    const doc = docs.activeDocument;
    const groups = docs.groups;
    if (doc?.group && groups.length > 1) docs.move(doc, groups[(groups.indexOf(doc.group) + 1) % groups.length]);
  };
  const toggleMaximize = () => {
    const group = docs.activeGroup;
    if (docs.maximizedGroup) docs.restoreGroups();
    else if (group) docs.maximizeGroup(group);
  };

  open();
  open();

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open" variant="outline" onclick={open} />
        <Button text="Close active" variant="outline" onclick={() => docs.activeDocument && docs.close(docs.activeDocument)} />
        <Button text="Split right" variant="outline" onclick={() => split('right')} />
        <Button text="Split down" variant="outline" onclick={() => split('down')} />
        <Button text="Move to next group" variant="outline" onclick={moveOn} />
        <Button text={() => (docs.maximizedGroup ? 'Restore groups' : 'Maximize group')} variant="outline" onclick={toggleMaximize} />
        <Button text="Even sizes" variant="outline" onclick={() => docs.evenSizes()} />
        <Button text="Next tab" variant="ghost" onclick={() => docs.activateNext(null, true)} />
        <Button text="Focus group 1" variant="ghost" onclick={() => docs.focusGroup(0)} />
      </Stack>
      {docs}
      <output class="td-state">{() => `${docs.groups.length} group(s), ${docs.documents.length} document(s), active: ${docs.activeDocument?.title ?? 'none'}`}</output>
      <ul class="td-log">
        {log.lines.map((line) => (
          <li key={line.id}>{line.text}</li>
        ))}
      </ul>
    </>
  );
}
```

`UnsavedChanges.tsx`

```tsx
import { reactive } from '@motifx/core';
import { confirm, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, type Customer } from './contents';

const people: Customer[] = [
  { name: 'Grace Hopper', email: 'grace@example.com', city: 'New York' },
  { name: 'Alan Turing', email: 'alan@example.com', city: 'London' },
];

/** Edit a field: the tab shows a dot in place of its close button, and closing it asks first (`e.promise`). */
export default function UnsavedChanges() {
  const docs = new TabDocumentManager({ label: 'Customers' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';

  for (const person of people) {
    const saved = { ...person };
    const customer = reactive({ ...person });
    docs.open(
      new TabDocument({
        id: person.email,
        type: 'customer',
        title: () => customer.name || 'New customer',
        dirty: () => customer.name !== saved.name || customer.email !== saved.email || customer.city !== saved.city,
        content: () => customerForm(customer),
      }),
    );
  }

  docs.onClosing((e) => {
    if (e.document.dirty) e.promise = confirm(`${e.document.title} has unsaved changes. Close it anyway?`, { title: 'Close', tone: 'caution' });
  });

  return <>{docs}</>;
}
```

`SaveRestore.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';
import { notes, ordersGrid } from './contents';

/** Makes a saved document again by its type; its `state` brings what it needs. */
function restore(saved: TabLayoutDocument): TabDocument {
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid((saved.state as { count: number }).count) });
  return new TabDocument({ ...saved, content: () => notes(saved.title) });
}

/** The layout as JSON: change it (split, move, resize, close), save, change it again, restore. */
export default function SaveRestore() {
  const s = reactive({ json: '', saved: null as TabLayout | null });
  const docs = new TabDocumentManager({ label: 'Saved layout' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders', state: { count: 40 } }));
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));
  docs.split(docs.groups[0], 'down', docs.findDocument('todo')!);

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
      </Stack>
      {docs}
      <pre class="td-json" tabindex="0" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">
        {() => s.json}
      </pre>
    </>
  );
}
```
