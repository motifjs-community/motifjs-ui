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
