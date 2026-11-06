# TabDocumentManager: Tabs

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.3

What a tab does in a code editor: preview tabs that the next preview replaces, pinned tabs that stay at the start, tabs that shrink, wrap or scroll, counts and colours, and the same document open in two groups.

## Preview tabs

`open(doc, { preview: true })` opens a tab in italics that the next preview in the group replaces, so looking through files leaves one tab. A double click on the tab, unsaved changes, `keep(doc)`, the menu's Keep open or a move makes it stay.

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

## Pinned tabs

`pin(doc)` moves a tab to the end of the pinned ones at the start of the strip; it cannot be moved past the others, and close all leaves it (`keepPinned`). `pinnedTabSize` shrinks pinned tabs to their icon or a short width, `pinnedTabsOnSeparateRow` gives them a row of their own.

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

## Tab sizes and overflow

`tabSize` picks how wide tabs are; when they still do not fit the strip scrolls (wheel, scroll buttons, the active tab always in sight) or, with `wrapTabs`, goes on to more rows.

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

## Badges, tones and descriptions

`badge` is a count, a short text or a dot; `tone` colours the title and the badge. The description shows only when two open documents share a title, as `showDescription` says.

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

## One document in two groups

With `allowDuplicate` a document opens in another group as a copy with content of its own (from `clone`, a `content` function or the `factory`), sharing the title, the unsaved changes and the state. Splitting copies the active document; `splitCopies: false` moves it instead.

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
docs.onClosing((e) => {
  // Ask only when the last copy closes.
  if (e.document.dirty && e.lastCopy) e.promise = confirm('Close without saving?');
});
```

## Accessibility

| Topic | How |
| --- | --- |
| `Preview and pinned tabs` | A tab says “preview” or “pinned” after its title. The pin mark is for the pointer; the menu (Shift+F10) and Ctrl+K Shift+Enter pin and unpin from the keyboard, Ctrl+K Enter keeps a preview. |
| `Compact pinned tabs` | Show their icon or first letter; the title and description stay in the tab for screen readers. |
| `Scroll buttons` | For the pointer only: the arrow keys reach every tab and scroll it into sight. |
| `Badges and tones` | A badge's text is part of the tab's name; a dot and a tone are colour only, so say what they mean in the title, the tooltip or the badge text. |
| `Announcements` | Pinned, unpinned and kept open are said politely, like opened and closed. |

## API

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `previewTabs` | `Bind<boolean>` | `true` | Documents opened with `preview` take the place of the group's preview tab. `false`: every document opens to stay. |
| `pinnedTabSize` | `Bind<'normal' \| 'compact' \| 'shrink'>` | `'normal'` | Pinned tabs like the others, only their icon (or first letter; the title stays for screen readers), or shrunk to `tabMinWidth`. |
| `pinnedTabsOnSeparateRow` | `Bind<boolean>` | `false` | Pinned tabs in a row of their own, above the others. |
| `closeButtonOnPinned` | `Bind<boolean>` | `false` | Pinned tabs show a close button next to their pin mark. |
| `keepPinned` | `Bind<boolean>` | `true` | Close all, close others, close to the right or left and close saved leave pinned tabs open. |
| `tabSize` | `Bind<'fit' \| 'shrink' \| 'fixed'>` | `'fit'` | As wide as their text; shrinking down to `tabMinWidth` before the strip scrolls; all `tabFixedWidth` wide, shrinking down to `tabMinWidth`. |
| `tabMinWidth, tabMaxWidth, tabFixedWidth` | `Bind<number>` | `80`, `0`, `160` | In pixels. `tabMaxWidth` caps `fit` and `shrink` tabs; 0 leaves only the title's own limit. |
| `wrapTabs` | `Bind<boolean>` | `false` | Tabs that do not fit go on to more rows instead of scrolling. |
| `scrollButtons` | `Bind<boolean>` | `true` | Buttons at the ends of a strip that does not fit (the mouse wheel scrolls it sideways either way). |
| `showDescription` | `Bind<'always' \| 'duplicates' \| 'never'>` | `'duplicates'` | A tab shows its document's description always, only when another open document has the same title, or never. |
| `allowDuplicate` | `Bind<boolean>` | `false` | The same document may be open in several groups; a document's own `allowDuplicate` wins. |
| `splitCopies` | `Bind<boolean>` | `true` | Splitting with a document that may be open twice opens a copy in the new group; otherwise the document moves there. |

### TabDocument

| Field | Type | Description |
| --- | --- | --- |
| `preview` | `Bind<boolean>` | A preview tab, in italics: the next preview opened in its group takes its place. It stays after a double click, an edit (`dirty`), `keep`, the menu, or a move. |
| `pinned` | `Bind<boolean>` | Pinned tabs come first, in the order they were pinned, and keep a pin mark that unpins them. Set through `pin` / `unpin` to be asked and told. |
| `badge` | `Bind<string \| number \| boolean \| null>` | A count or short text after the title; `true` shows a dot. |
| `tone` | `Bind<'warning' \| 'danger' \| 'success' \| 'accent' \| null>` | Colours the title and the badge. |
| `description` | `Bind<string>` | Shown as `showDescription` says, and in the lists of documents. |
| `allowDuplicate` | `Bind<boolean \| undefined>` | This document's own setting; `undefined` follows the manager. |
| `clone` | `(copy) => ComponentBase \| null` | Makes the content of a copy in another group. Without it a `content` function is called again, or the manager's `factory` makes it; a component given as it is cannot be copied. |
| `original` | read-only | For a copy, the document it was copied from; `null` for the document itself. A copy has the same `id` and `type` and shares every field but `pinned`, `preview` and `contentLifetime`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `open(doc, { preview?, pinned?, … })` | `TabDocument \| null` | Opens as a preview (replacing the group's preview tab) or pinned. A document open in another group is copied there when it may be open twice. |
| `keep(doc)` | `boolean` | A preview tab stays. |
| `pin(doc), unpin(doc)` | `boolean` | Pins to the end of the pinned tabs; unpins to the first place after them. |
| `closeOthers(doc), closeToRight(doc), closeToLeft(doc), closeSaved(group?)` | `Promise<boolean>` | Close several documents, each one asking through `onClosing`; pinned tabs stay while `keepPinned` is on. |
| `closeAll(group?, pinned?)` | `Promise<boolean>` | Pinned tabs stay while `keepPinned` is on, unless `pinned` is `true`. |
| `split(group, direction, doc?)` | `TabGroup \| null` | Copies `doc` into the new group when it may be open twice and `splitCopies` is on; moves it otherwise. |

### Events

| Event | What it carries |
| --- | --- |
| `onKeeping(e), onKept(e)` | `{ document, group, byUser }`; `keeping` is cancelable. |
| `onPinning(e), onPinned(e), onUnpinning(e), onUnpinned(e)` | `{ document, group, byUser }`; the `…ing` ones are cancelable. |
| `onClosing(e)` | Also `lastCopy`: no other copy of the document stays open, so ask about unsaved changes only then. A preview replaced by the next one closes through it too: when it cancels (or sets a promise) the old preview stays, kept. |
| `onSplitting(e), onSplit(e)` | Also `copy`: whether the document is copied (`splitting`), the copy made (`split`). |

The rest of the API is on the [overview](tabdocs.md#api); the menus, the lists and the keys on [Menus and keys](tabdocs-menus.md).

## Example files

`Preview.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, ListBox, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Choosing a file opens it as a preview (in italics): the next one chosen takes its place. A double
 * click on the tab, an edit, "Keep open" or moving it makes it stay.
 */
export default function Preview() {
  const s = reactive({ previewTabs: true, kept: [] as string[] });
  // Narrow beside its log, it still shows as on a desktop (see the Tablet and phone page).
  const docs = new TabDocumentManager({ label: 'Files in preview', previewTabs: () => s.previewTabs, presentation: 'desktop' });
  docs.element.style.cssText = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';
  docs.onKept((e) => s.kept.unshift(e.document.title));

  const show = (path: string | null) => {
    if (path) docs.open(docs.findDocument(path) ?? fileDocument(path), { preview: true });
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Preview tabs" x-model={() => s.previewTabs} />
        <Button text="Keep open" variant="outline" enabled={() => !!docs.activeDocument?.preview} onclick={() => docs.keep(docs.activeDocument!)} />
        <output class="td-state">{() => `preview: ${docs.activeGroup?.previewDocument?.title ?? 'none'}; kept: ${s.kept.join(', ') || 'none'}`}</output>
      </Stack>
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">
        <ListBox
          label="Files"
          items={FILES}
          textField="path"
          valueField="path"
          height="28rem"
          style="inline-size: 14rem; flex: none"
          onValueChanged={(e) => show(e.value as string | null)}
        />
        {docs}
      </div>
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

`Pinning.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, Switch, TabDocumentManager, type PinnedTabSize } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** Pinned tabs stay first, in the order they were pinned. Their pin mark unpins them; the menu and Ctrl+K Shift+Enter do too. */
export default function Pinning() {
  const s = reactive({ size: 'normal' as PinnedTabSize, separateRow: false, closeButton: false, keepPinned: true });
  const docs = new TabDocumentManager({
    label: 'Files with pinned tabs',
    pinnedTabSize: () => s.size,
    pinnedTabsOnSeparateRow: () => s.separateRow,
    closeButtonOnPinned: () => s.closeButton,
    keepPinned: () => s.keepPinned,
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES) docs.open(fileDocument(file.path), { index: 99, pinned: file.path === 'README.md' || file.path === 'package.json' });

  const toggle = () => {
    const doc = docs.activeDocument;
    if (doc) (doc.pinned ? docs.unpin(doc) : docs.pin(doc));
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Pinned tab size"
          orientation="horizontal"
          items={[
            { value: 'normal', text: 'Normal' },
            { value: 'compact', text: 'Compact' },
            { value: 'shrink', text: 'Shrink' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.size}
        />
        <Switch label="Row of their own" x-model={() => s.separateRow} />
        <Switch label="Close button" x-model={() => s.closeButton} />
        <Switch label="Close all keeps them" x-model={() => s.keepPinned} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (docs.activeDocument?.pinned ? 'Unpin active' : 'Pin active')} variant="outline" onclick={toggle} />
        <Button text="Close all" variant="outline" onclick={() => docs.closeAll()} />
        <Button text="Open the files again" variant="ghost" onclick={() => FILES.forEach((f) => docs.findDocument(f.path) || docs.open(fileDocument(f.path), { index: 99 }))} />
      </Stack>
      {docs}
    </>
  );
}
```

`Sizing.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabSize } from '@motifx-community/ui';
import { notes } from './contents';

/** More tabs than fit: they scroll (wheel or buttons), shrink, take one width, or go on to more rows. */
export default function Sizing() {
  const s = reactive({ size: 'fit' as TabSize, wrap: false, buttons: true });
  const docs = new TabDocumentManager({
    label: 'Tab sizes',
    tabSize: () => s.size,
    wrapTabs: () => s.wrap,
    scrollButtons: () => s.buttons,
    tabMinWidth: 72,
    tabFixedWidth: 140,
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const names = ['Overview', 'Customers', 'Orders', 'Invoices', 'Payments', 'Shipping', 'Returns', 'Products', 'Stock', 'Suppliers', 'Reports', 'Settings'];
  for (const name of names) docs.open({ id: name, title: name, content: () => notes(name) }, { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Tab size"
          orientation="horizontal"
          items={[
            { value: 'fit', text: 'Fit' },
            { value: 'shrink', text: 'Shrink' },
            { value: 'fixed', text: 'Fixed' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.size}
        />
        <Switch label="More rows" x-model={() => s.wrap} />
        <Switch label="Scroll buttons" x-model={() => s.buttons} />
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

`Look.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabShowDescription } from '@motifx-community/ui';
import { notes } from './contents';
import { fileDocument } from './files';

/** A count or a dot over the tab, a colour by what the document needs, and a description only where two titles are the same. */
export default function Look() {
  const s = reactive({ unread: 3, errors: 1, description: 'duplicates' as TabShowDescription });
  const docs = new TabDocumentManager({ label: 'Badges and tones', showDescription: () => s.description });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'inbox', title: 'Inbox', badge: () => s.unread || null, tone: () => (s.unread ? 'accent' : null), content: () => notes('Inbox') }));
  docs.open(new TabDocument({ id: 'build', title: 'Build', badge: () => s.errors || null, tone: () => (s.errors ? 'danger' : 'success'), content: () => notes('Build') }), { index: 99 });
  docs.open(new TabDocument({ id: 'quota', title: 'Quota', badge: true, tone: 'warning', content: () => notes('Quota') }), { index: 99 });
  docs.open(fileDocument('src/index.ts'), { index: 99 });
  docs.open(fileDocument('src/orders/index.ts'), { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="New mail" variant="outline" onclick={() => s.unread++} />
        <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />
        <Button text={() => (s.errors ? 'Fix the build' : 'Break the build')} variant="outline" onclick={() => (s.errors = s.errors ? 0 : 2)} />
        <RadioGroup
          label="Description"
          orientation="horizontal"
          items={[
            { value: 'duplicates', text: 'Same titles' },
            { value: 'always', text: 'Always' },
            { value: 'never', text: 'Never' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.description}
        />
      </Stack>
      {docs}
    </>
  );
}
```

`Duplicates.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm } from './contents';

/**
 * One customer open in two groups: each copy has a form of its own over the same data, and both
 * tabs follow the title and the unsaved changes. Splitting copies the document; turned off, it moves.
 */
export default function Duplicates() {
  const s = reactive({ allow: true });
  const saved = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  const ada = reactive({ ...saved });
  const docs = new TabDocumentManager({ label: 'Two copies', allowDuplicate: () => s.allow });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const doc = docs.open(
    new TabDocument({
      id: 'ada',
      type: 'customer',
      title: () => ada.name || 'New customer',
      dirty: () => ada.name !== saved.name || ada.email !== saved.email || ada.city !== saved.city,
      content: () => customerForm(ada),
    }),
  )!;
  docs.split(docs.groups[0], 'right', doc);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Allow two copies" x-model={() => s.allow} />
        <Button text="Split the active group" variant="outline" onclick={() => docs.activeGroup && docs.split(docs.activeGroup, 'down', docs.activeDocument ?? undefined)} />
        <Button text="Save" variant="outline" enabled={() => doc.dirty} onclick={() => Object.assign(saved, { ...ada })} />
        <output class="td-state">{() => `${docs.documents.length} tab(s) for ${new Set(docs.documents.map((d) => d.id)).size} document(s)`}</output>
      </Stack>
      {docs}
    </>
  );
}
```
