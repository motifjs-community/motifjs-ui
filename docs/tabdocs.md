# TabDocumentManager

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.6

A document manager that arranges content the way code editors arrange files: documents in tabs, tabs in groups, and groups split side by side or one above the other. A document's content can be any component, such as a form, a grid or plain text, and it is moved rather than recreated when its tab goes to another group. Every user action is also a method, with a cancelable event before it and a notification after it, and the whole layout can be saved to JSON and restored. Preview and pinned tabs, sizes and copies are covered in [Tabs](tabdocs-tabs.md), and context menus, lists and keyboard shortcuts in [Menus and keys](tabdocs-menus.md).

## Import

```tsx
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';
```

## Documents, groups and splits

Create a manager, give it a size, and call `open` to add documents. `split` opens a new group beside an existing one. To resize groups, drag the line between them, or focus it and use the arrow keys. Double-click the line to make the sizes equal, or double-click a tab to give its group all the available space. The buttons at the end of each tab strip split and maximize the group.

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

/** `count` sample orders, the same every time. */
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

Every behavior is a prop that accepts a value or a tracked function, and a document's own `closable` and `contentLifetime` take precedence over the manager's. In this example, Alpha cannot be closed and Gamma has unsaved changes.

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

## Programmatic use, and the events

Every user action is also a method (`open`, `close`, `activate`, `split`, `move`, `closeGroup`, `focusGroup`, `maximizeGroup`, `restoreGroups`, `evenSizes`, `resizeGroup`). Each one raises a cancelable `on…ing` event first and an `on…ed` event afterward, and `byUser` indicates which of the two started it.

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

## Unsaved changes

`dirty` tracks a function of the form's data, and the tab shows a dot in place of its close button. `onClosing` sets `e.promise` to prompt the user, and the document closes when the promise resolves to `true`.

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

## Saving and restoring the layout

`saveLayout()` writes plain JSON containing the tree of splits with each child's share, the groups with their documents (`id`, `type`, `title`, `state`, `pinned`, `preview`), the active and recently used tabs, and the active and maximized groups. `loadLayout(json, factory)` rebuilds it, and the factory creates each document by its `type`.

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

/** `count` sample orders, the same every time. */
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

`contentLifetime` determines when a document's content is created and how long it lives. Whatever the setting, moving a tab or splitting a group never recreates the content, because the same component moves with it.

| Lifetime | Result |
| --- | --- |
| `keep (default)` | Created when the document opens, and kept with its state until the document closes. |
| `lazy` | Created the first time it is shown, and then kept. |
| `dispose` | Created when shown and disposed when hidden. It is created again from `content` (or the manager's `factory`) the next time, with the document's `state`. A component provided directly cannot be recreated, so it is kept. |

## Keyboard

The keys work while focus is inside the manager. Each one is a list of key combinations in `keys`, so any of them can be changed or disabled. A browser tab reserves Ctrl+W, Ctrl+Tab, Ctrl+Page Up/Down and often Ctrl+1…9, so the default keys are ones a browser lets through. The key in brackets also works where the browser allows it, and an installed app uses the desktop preset (`keyPreset`). The recently used list, back and forward, reopening and the remaining keys are covered in [Menus and keys](tabdocs-menus.md#keyboard).

| Key | Description |
| --- | --- |
| `Alt + Page Down / Page Up (Ctrl + Page Down / Up)` | Moves to the next or previous tab of the active group, wrapping around at the ends (`nextTab`, `previousTab`). |
| `Ctrl + Alt + W (Ctrl + W)` | Closes the active document (`closeTab`). |
| `Ctrl + Alt + 1 … 9 (Ctrl + 1 … 9)` | Sets focus on group 1 to 9 (`focusGroup`, written as `Ctrl+Alt+{n}`). |
| `Ctrl + \` | Splits the active group to the right. The active document moves to the new group if it is not the only one, otherwise a copy opens there (`splitRight`). |
| `Right / Left, Home / End (on a tab)` | Moves to the next, previous, first or last tab, which also activates it unless `activation` is manual (`stripNext`, `stripPrevious`, `stripFirst`, `stripLast`). |
| `Enter, Space (on a tab)` | Activates the tab. |
| `Delete (on a tab)` | Closes the tab (`closeFocusedTab`). |
| `Arrows, Home / End (on a splitter)` | Makes the group before the splitter smaller or larger by `resizeStep`, or as small or as large as possible (`resizeSmaller`, `resizeLarger`, `resizeMin`, `resizeMax`). |
| `Tab` | Moves from the tab strip (one Tab stop, on the active tab) to the group buttons, the content, the splitter and the next group. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Groups` | Each group is a `group` named “Group 1”, “Group 2” and so on. With `label`, the manager is a `region`. |
| `Tabs` | One `tablist` per group (“Documents in group 1”) of `tab` elements, each controlling its `tabpanel`. A roving `tabindex` keeps one Tab stop per strip. A tab announces “unsaved changes” while its document is dirty, and `aria-keyshortcuts` names the key that closes it. |
| `Splitters` | `separator` elements with `aria-orientation`, `aria-valuenow` (the share of the group before it, from 0 to 100) and `aria-controls`. |
| `Announcements` | A polite live region announces what was opened, closed, moved, split, maximized or restored (`announce`). |
| `Focus` | A group remembers where focus was inside it, and closing the focused tab moves focus to the tab that takes its place. |

## Localization

All text comes from `uiLocale.strings` (`tabDocs…`: group and strip names, “No open documents”, “unsaved changes”, buttons and announcements), in English and Turkish. `texts` overrides some for one manager.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-tabdocs` | The root. It has `data-maximized` while a group is maximized and `data-resizing` while a splitter is being dragged, plus `data-tab-size`, `data-pinned-size`, `data-pinned-row`, `data-wrap` and `data-scroll-buttons` from the props. |
| `.mx-tabdocs__split` | A split, with `data-orientation`. |
| `.mx-tabdocs__sash` | A splitter (`role="separator"`). |
| `.mx-tabdocs__group` | A group, with `data-active`, `data-empty`, `data-maximized` and `data-locked`. |
| `.mx-tabdocs__bar, __strip, __tabs, __pinned, __row, __scroll, __actions` | The strip row, the tab list with its scroll buttons, the `tablist` with its pinned row and the row of other tabs, and the kit Toolbar with the group buttons. |
| `.mx-tabdocs__tab` | A tab, with `aria-selected`, `data-dirty`, `data-close` (`always`, `active`), `data-pinned`, `data-preview`, `data-tone` and `data-icon`. |
| `.mx-tabdocs__icon, __letter, __title, __description, __badge, __pin, __close, __dirty` | The parts of a tab. A badge displayed as a dot has `data-dot`. |
| `.mx-tabdocs__popup, __list-title, __list-note, __list-dirty` | The "…" and recently used lists. |
| `.mx-tabdocs__panels, __panel, __empty` | The content area, a document's `tabpanel`, and the text of an empty group. |

### Component tokens

| Token | Description |
| --- | --- |
| `tabdocs.manager, group, bar, pinned, panel, empty` | Units: the area behind the groups, a group, its strip and the line under it, the pinned tabs row, a panel, and the text of an empty group. |
| `tabdocs.tab, indicator, title, letter, pin, description, icon, badge, close, dirty` | Units: a tab (`hover`, `selected`, `before-selected`, `focus`, `dragging`, `title` …, whose end side is the line between tabs), the bar on it (`selected`, and `active` in the active group), and its parts in each tone. |
| `tabdocs.scroll, scroll-icon, scrollbar, thumb, count, sash, sash-line` | Units: the scroll buttons, the thin scrollbar, the count on "…", and a splitter and its line (`across`, `active`). |
| `tabdocs.tabs-height, tab-inset, tab-spacing, title-max, title-min, icon-room, close-room, pin-room, sash-thickness` | Sizes used by the layout (a shrinking tab keeps its icon, its close button and a few letters). |
| `tabdocs.indicator-inset, indicator-inset-start, indicator-inset-end` | The position of the bar on a tab. |
| `tabdocs.focus-width, focus-offset, touch-*` | The focus ring's space at the ends of a small toolbar, and the sizes for touch. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `Bind<string>` | `''` | Names the manager, making it a `region` landmark. This is the same property as `text`. |
| `closeButton` | `Bind<'always' \| 'active' \| 'never'>` | `'always'` | Which tabs show a close button: every tab, the active tab and the tab under the pointer, or none. A document with `closable: false` shows none. |
| `contentLifetime` | `Bind<'keep' \| 'lazy' \| 'dispose'>` | `'keep'` | When content is created and how long it lives (see below). A document's own value takes precedence. |
| `closeEmptyGroups` | `Bind<boolean>` | `true` | Closes a group when it has no documents left. The last group never closes. |
| `openPosition` | `Bind<'afterActive' \| 'end' \| 'start'>` | `'afterActive'` | Where `open` places a tab when no `index` is given. |
| `afterClose` | `Bind<'recent' \| 'left' \| 'right'>` | `'recent'` | Which tab becomes active when the active tab closes: the most recently used tab, or a neighbor. |
| `activation` | `Bind<'auto' \| 'manual'>` | `'auto'` | With `auto`, the arrow keys activate the tab they reach. With `manual`, Enter or Space activates it. |
| `minGroupWidth, minGroupHeight` | `Bind<number>` | `160`, `100` | The minimum size of a group, in pixels. A splitter stops there. |
| `resizeStep` | `Bind<number>` | `10` | How far a splitter key moves a splitter, in pixels. |
| `groupActions` | `Bind<boolean>` | `true` | The split, maximize and "…" buttons at the end of each strip. |
| `maximizeOnDoubleClick` | `Bind<boolean>` | `true` | Double-clicking a tab maximizes its group or restores the groups. On a preview tab, it keeps the tab open instead. |
| `keyPreset` | `Bind<'auto' \| 'browser' \| 'desktop'>` | `'auto'` | The default keys: keys a browser tab lets through, or those of a desktop editor. `auto` uses the desktop keys in an installed app. |
| `keys` | `Bind<Partial<TabDocumentKeys>>` | see Keyboard | Changes specific keys, and the others keep the preset's values. An empty list disables a key. |
| `factory` | `Bind<(doc) => ComponentBase \| null>` | `null` | Creates the content of a document that does not provide its own, usually by its `type`. |
| `texts` | `Bind<Partial<UiStrings>>` | `{}` | Strings for this manager only, which override `uiLocale.strings`. |
| `announce` | `Bind<boolean>` | `true` | Announces opened, closed, moved, split and maximized states to screen readers. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stays the same for the life of the document, and is generated when omitted. `findDocument(id)` finds a document by it. |
| `type` | `string` | The key used to restore a layout. The `loadLayout` factory and the manager's `factory` read it. |
| `title, description` | `Bind<string>` | The tab's text. The description follows it in a lighter style, and distinguishes documents with the same title. |
| `icon, badge` | `Bind<IconSource \| null>`, `Bind<string \| number \| null>` | An icon before the title, and a short text or count after it. |
| `tooltip` | `Bind<string>` | Shown when the pointer rests on the tab or the tab has focus. By default, it is the title and the description. |
| `dirty` | `Bind<boolean>` | Marks unsaved changes. A dot replaces the close button, which returns under the pointer, and screen readers announce “unsaved changes”. |
| `closable` | `Bind<boolean>` | The default is `true`. With `false`, there is no close button and the user cannot close the document, although code still can. |
| `pinned, preview` | `Bind<boolean>` | A pinned tab stays at the start, and a preview tab is replaced by the next preview. Both are saved with the layout. See [Tabs](tabdocs-tabs.md). |
| `badge, tone, actions, clone, allowDuplicate` |  | A count or a dot, a color, toolbar buttons while active, and the content of a copy. See [Tabs](tabdocs-tabs.md) and [Menus and keys](tabdocs-menus.md). |
| `contentLifetime` | `Bind<ContentLifetime \| undefined>` | This document's own lifetime. `undefined` uses the manager's setting. |
| `content` | `ComponentBase \| (doc) => ComponentBase` | The content: a component, or a function that creates it (and creates it again after `dispose`). |
| `state` | `Bind<unknown>` | Application data for the document, saved with the layout. |
| `manager, group, isOpen, isActive, contentComponent` | read-only, reactive | Where it is open, and the content created for it. |
| `activate(focus?), close()` | `boolean`, `Promise<boolean>` | The same as the manager's methods. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `groups` | read-only, reactive | The groups in layout order: left to right, top to bottom. |
| `documents` | read-only, reactive | Every open document, group by group. |
| `activeGroup, activeDocument` | read-only, reactive | The group that has or last had focus, and its active document. |
| `maximizedGroup` | read-only, reactive | The maximized group, or `null` when none is maximized. |
| `recentDocuments, closedDocuments, canGoBack, canGoForward` | read-only, reactive | The most recently used documents, those `reopenClosed` can open, and the history. See [Menus and keys](tabdocs-menus.md). |
| `TabDocumentManager.browserKeys, TabDocumentManager.desktopKeys` | static | The two key presets. |

### TabGroup

| Member | Access | Description |
| --- | --- | --- |
| `documents, activeDocument, recentDocuments` | read-only, reactive | In strip order, the active document, and the most recently used first. |
| `index, isActive, isMaximized, isEmpty` | read-only, reactive | Its position in `groups`, starting from 0, and its state. |
| `locked` | read/write, reactive | A locked group does not receive documents opened without naming the group. `lock()` and `unlock()` raise their events and are announced. |
| `previewDocument` | read-only, reactive | The document of the group's preview tab, if it has one. |
| `open(doc, options?), activate(doc), closeAll(), close(), split(direction, doc?), maximize(), lock(), unlock(), focus()` |  | The manager's methods for this group. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(doc, { group?, index?, active?, focus? })` | `TabDocument \| null` | Opens a `TabDocument`, or one created from options, in a group (the active group by default). An already open document is activated. Returns `null` when `onOpening` cancels. |
| `close(doc)` | `Promise<boolean>` | Closes the document as the close button does. Returns `false` when `onClosing` keeps it open. |
| `closeAll(group?)` | `Promise<boolean>` | Closes the documents of a group, or of all groups. Returns `false` when some remain open. |
| `activate(doc, focus?)` | `boolean` | Makes it the active tab of its group, and that group the active group. `focus` moves focus into the content. |
| `activateNext(group?, focus?), activatePrevious(group?, focus?)` | `boolean` | Moves to the next or previous tab, wrapping around at the ends (Ctrl + Page Down/Up). |
| `move(doc, group, index?)` | `boolean` | Moves it to another position in its group, or to another group. The content moves with it unchanged. |
| `split(group, direction, doc?)` | `TabGroup \| null` | Adds a new group on the `'left'`, `'right'`, `'up'` or `'down'` side, and `doc` moves into it. With a `group` of `null`, the new group runs along that edge of the whole layout. |
| `closeGroup(group)` | `Promise<boolean>` | Closes the group's documents, and then the group. The last group stays, empty. |
| `focusGroup(group \| index)` | `boolean` | Makes it active and sets focus on what last had focus in it. |
| `maximizeGroup(group), restoreGroups()` | `boolean` | Gives one group all the space. The other groups stay hidden, unchanged. |
| `evenSizes()` | `boolean` | Makes every group of every split the same size. |
| `resizeGroup(group, size)` | `boolean` | Sets a group's size along its split, in pixels or as a share (`'30%'`). The next group gives up or takes the difference. |
| `findDocument(id), contentOf(doc)` | `TabDocument \| null`, `ComponentBase \| null` |  |
| `saveLayout()` | `TabLayout` | The layout as plain JSON (see below). |
| `loadLayout(layout, factory?)` | `boolean` | Replaces the current layout with a saved one, closing the current documents without prompting. `factory(saved)` returns the document, its options or its content. |

### Events

| Event | Contents |
| --- | --- |
| `onOpening(e), onOpened(e)` | `{ document, group, index, active, byUser }`. `opening` is cancelable and can change `group` and `index`. |
| `onClosing(e), onClosed(e)` | `{ document, group, index, byUser }`. `closing` is cancelable, or can set `e.promise` (`Promise<boolean>`) to prompt first. |
| `onDocumentActivating(e), onDocumentActivated(e)` | `{ document, previous, group, byUser }`. `activating` (a tab is being selected) is cancelable, and `activated` also runs when another group becomes active. |
| `onMoving(e), onMoved(e)` | `{ document, from, fromIndex, to, toIndex, byUser }`. `moving` is cancelable. |
| `onSplitting(e), onSplit(e)` | `{ group, direction, document, byUser }`, plus `newGroup` afterward. `splitting` is cancelable. `group` is `null` when the new group runs along an edge of the whole layout. |
| `onLayoutChanging(e), onLayoutChanged(e)` | `{ change, group, byUser }`, where `change` is `'split'`, `'closeGroup'`, `'resize'`, `'evenSizes'`, `'maximize'`, `'restore'`, `'move'` (a whole group moved or merged) or `'load'`. `changing` is cancelable (a split uses `onSplitting`). |

## Feedback

Loading issues…

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

/** `count` sample orders, the same every time. */
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

/** Every behavior is a prop tracked at runtime, bound here to the switches above the manager. */
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

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager, type SplitDirection } from '@motifx-community/ui';
import { notes } from './contents';

/** Everything the user does is a method too; the events report each change, by the user or by code. */
export default function Programmatic() {
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0, opened: 0 });
  const write = (text: string) => {
    log.lines.unshift({ id: log.next++, text });
    if (log.lines.length > 6) log.lines.pop();
  };

  const docs = new TabDocumentManager({ label: 'Driven programmatically' });
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

/** Edit a field: the tab shows a dot in place of its close button, and closing it prompts first (`e.promise`). */
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

/** Recreates a saved document by its type, with its `state` providing what it needs. */
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
