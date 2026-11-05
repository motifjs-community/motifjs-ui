# TabDocumentManager: A whole workspace

> TabDocumentManager · @motifx-community/ui 0.1.0-beta.2

A whole screen made of the kit's parts: a menu bar, the manager, a DataGrid with everything turned on, forms and a tool docked at the bottom. Each part is the same component it is on its own page; the manager only holds them.

## An order desk

The orders grid filters, groups, searches, sums, edits in batches and runs row actions, also from its context menu. Its tab shows the unsaved mark while edits wait to be saved. Open a customer from a row (its menu or the actions column): the card opens in the group on the right. Drag a tab to a guide, float it, move it into a new window, or use the menus: the grid keeps its filters, its scroll and its unsaved edits wherever it goes.

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

## Example files

`Workspace.tsx`

```tsx
import { reactive, type ComponentBase } from '@motifx/core';
import { DataGrid, MenuBar, TabDocument, TabDocumentManager, type GridAction, type GridColumn, type GridSummary, type MenuItem } from '@motifx-community/ui';
import type { Order } from '../../datagrid/examples/order';
import { columns, makeOrders } from '../../datagrid/examples/orders';
import { customerCard, type Customer } from './contents';

// Narrow, the grid moves columns into the row's details, the lowest number first; the customer always stays.
const PRIORITY: Partial<Record<keyof Order, number>> = { note: 0, paid: 1, date: 2, city: 3, status: 4, id: 5, amount: 6 };
const deskColumns: GridColumn<Order>[] = columns.map((c) => ({
  ...c,
  sticky: undefined,
  hidingPriority: PRIORITY[c.field as keyof Order],
  width: c.field === 'customer' ? 150 : c.field === 'amount' ? 100 : c.width,
}));

const summary: GridSummary<Order> = {
  totalItems: [
    { column: 'id', summaryType: 'count', showInColumn: 'customer' },
    { column: 'amount', summaryType: 'sum' },
  ],
  groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }],
};

/**
 * An order desk: a menu bar over the manager, the orders in a full grid (filters, grouping, search,
 * summaries, batch editing, row actions and their context menu, export), a customer card that opens
 * in a tab from a row, and an activity log docked at the bottom.
 */
export default function Workspace() {
  const s = reactive({ orders: makeOrders(500), selected: 0, log: [] as { id: number; text: string }[], gridReady: 0 });
  let grid: DataGrid<Order> | null = null;
  let logId = 0;
  const write = (text: string) => {
    s.log.unshift({ id: ++logId, text });
    s.log.splice(40);
  };

  const docs = new TabDocumentManager({ label: 'Order desk', dockGuides: true, dockAreaSize: { bottom: 160 } });
  docs.element.style.cssText = 'block-size: 36rem; inline-size: 100%';

  const customers = new Map<string, Customer>();
  const openCustomer = (name: string) => {
    const id = `customer:${name}`;
    const open = docs.findDocument(id);
    if (open) return void docs.activate(open, true);
    let customer = customers.get(name);
    if (!customer) {
      customer = reactive({ name, email: `${name.split(' ')[0].toLowerCase()}@example.com`, city: '' });
      customers.set(name, customer);
    }
    const card = customer;
    const doc = new TabDocument({ id, type: 'customer', title: () => card.name || 'New customer', description: 'Customer', content: () => customerCard(card) });
    // Customers open beside the orders: in the group on the right, or in a new one there.
    const side = docs.groups.find((g) => g !== orders.group && !g.dockArea && !g.window && !g.browserWindow);
    if (side) docs.open(doc, { group: side, focus: true });
    else {
      const opened = docs.open(doc, { group: orders.group ?? undefined, focus: true });
      if (opened && orders.group) docs.split(orders.group, 'right', opened);
    }
  };

  const openOrder: GridAction<Order> = { id: 'customer', text: 'Open the customer', onclick: (row) => openCustomer(row.customer) };
  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    onclickMany: (rows) => {
      for (const row of rows) row.status = 'Approved';
      write(`${rows.length} orders approved`);
    },
    onclick: (row) => {
      row.status = 'Approved';
      write(`order ${row.id} approved`);
    },
  };

  const ordersGrid = (): ComponentBase => (
    <DataGrid
      style="block-size: 100%"
      rows={() => s.orders}
      rowKey="id"
      columns={deskColumns}
      label="Orders"
      locale="en"
      saveMode="batch"
      summary={summary}
      export={{ formats: ['csv'] }}
      actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [openOrder, approve, 'edit', 'remove'])}
      settings={{
        editable: true,
        selection: 'multiple',
        filterRow: true,
        headerFilter: true,
        groupPanel: true,
        searchPanel: true,
        columnChooserButton: true,
        exportButton: true,
        totalSummary: true,
        groupSummary: true,
        rowStatus: true,
        striped: true,
        actionsContextMenu: true,
        // Narrow beside a customer: the actions stay one "…" button, and columns that do not fit go into the row's details.
        actionsDisplay: 'menu',
        actionsWidth: 48,
        columnHidingEnabled: true,
      }}
      onSelectionChanged={(e) => (s.selected = e.selection.all ? s.orders.length - e.selection.except.length : e.selection.keys.length)}
      onSaved={() => write('changes saved')}
      ref={(g: DataGrid<Order>) => {
        grid = g;
        s.gridReady++;
      }}
    />
  );
  // The tab shows the unsaved mark while the grid has edits that are not saved.
  const orders = new TabDocument({
    id: 'orders',
    type: 'orders',
    title: 'Orders',
    pinned: true,
    closable: false,
    badge: () => s.orders.length,
    dirty: () => s.gridReady > 0 && !!grid?.hasChanges,
    content: ordersGrid,
  });
  const activity = new TabDocument({
    id: 'activity',
    type: 'tool',
    title: 'Activity',
    closable: false,
    content: () => (
      <ol style="margin: 0; padding: var(--mx-space-2) var(--mx-space-4); font-size: var(--mx-font-size-caption)" aria-label="Activity">
        {s.log.map((line) => (
          <li key={line.id}>{line.text}</li>
        ))}
      </ol>
    ),
  });

  docs.open(orders);
  // The log waits folded at the bottom edge: a click on its title slides it out.
  docs.dock(activity, 'bottom');
  docs.autoHide(docs.dockArea('bottom')!);
  docs.activate(orders);

  docs.onOpened((e) => write(`opened ${e.document.title}`));
  docs.onClosed((e) => write(`closed ${e.document.title}`));
  docs.onMoved((e) => write(`moved ${e.document.title}`));
  docs.onFloated((e) => write(`${e.document?.title ?? 'a group'} floats`));
  docs.onDocked((e) => write(`${e.document?.title ?? 'a group'} docked${e.side ? ` on the ${e.side}` : ''}`));
  docs.onHidden((e) => write(`${e.document.title} hidden`));

  const active = () => docs.activeDocument;
  const menu: MenuItem[] = [
    {
      text: '&File',
      items: [
        { text: 'New customer', click: () => openCustomer(`Customer ${customers.size + 1}`) },
        { text: 'Reopen closed', enabled: () => docs.documents.length > 0, click: () => docs.reopenClosed() },
        { text: 'Close', shortcut: 'Ctrl+Alt+W', beginGroup: true, enabled: () => !!active()?.closable, click: () => active() && docs.close(active()!) },
        { text: 'Close all', click: () => docs.closeAll() },
      ],
    },
    {
      text: '&Orders',
      items: [
        { text: 'Save changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.saveEditData() },
        { text: 'Undo changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.cancelEditData() },
        { text: 'Group by city', beginGroup: true, click: () => grid?.groupBy('city') },
        { text: 'Clear grouping', click: () => grid?.clearGrouping() },
        { text: 'Clear filters', click: () => grid?.clearFilters() },
        { text: 'Choose columns…', beginGroup: true, click: () => grid?.showColumnChooser() },
        { text: 'Export to CSV', click: () => grid?.exportCsv({ fileName: 'orders' }) },
      ],
    },
    {
      text: '&View',
      items: [
        { text: 'Split right', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'right') },
        { text: 'Split down', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'down') },
        { text: 'Maximize the group', beginGroup: true, click: () => docs.activeGroup && docs.maximizeGroup(docs.activeGroup) },
        { text: 'Restore the groups', click: () => docs.restoreGroups() },
        { text: 'Same sizes', click: () => docs.evenSizes() },
      ],
    },
    {
      text: '&Window',
      items: [
        { text: 'Float the active tab', enabled: () => !!active() && !active()!.window, click: () => active() && docs.float(active()!) },
        { text: 'Move into a new window', enabled: () => !!active() && !active()!.browserWindow, click: () => active() && docs.moveToNewWindow(active()!) },
        { text: 'Dock back', enabled: () => !!active()?.window, click: () => active() && docs.dock(active()!) },
        {
          text: 'Show the activity',
          beginGroup: true,
          // The close button of its area hides it (it cannot close): shown again, it goes back where it was.
          click: () => (activity.isHidden ? docs.show(activity, { focus: true }) : activity.dockArea?.autoHidden ? docs.showAutoHidden(activity) : docs.activate(activity, true)),
        },
      ],
    },
  ];

  return (
    <>
      <MenuBar items={menu} label="Order desk" />
      {docs}
      <output class="td-state">{() => `${s.orders.length} orders · ${s.selected} selected${s.gridReady > 0 && grid?.hasChanges ? ' · unsaved changes' : ''}`}</output>
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
