import { reactive } from '@motifx/core';
import { Button, DataGrid, FormLayout, Stack, Tab, Tabs, type DetailContext, type FormItem, type GridColumn } from '@motifx-community/ui';
import { makeCustomerOrders } from './customer-orders';
import { makeCustomers, type Customer } from './customers';

const customers = makeCustomers(60);
const orders = makeCustomerOrders(customers);
const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

/** What the details show of a customer: its fields and what its orders come to. */
interface Profile extends Customer {
  orders: number;
  total: string;
  since: string;
}

const profiles: Profile[] = customers.map((c) => {
  const own = orders.filter((o) => o.customerId === c.id);
  return { ...c, orders: own.length, total: money.format(own.reduce((sum, o) => sum + o.amount, 0)), since: own[0]?.date ?? '' };
});

const columns: GridColumn<Profile>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'name', title: 'Customer', width: 220, flex: 1 },
  { field: 'city', title: 'City', width: 140 },
  { field: 'orders', title: 'Orders', type: 'number', width: 100 },
];

const items: FormItem[] = [
  { field: 'name', label: 'Name' },
  { field: 'city', label: 'City' },
  { field: 'since', label: 'First order' },
  { field: 'total', label: 'Orders total' },
];

/** A customer's details: tabs, the first a read-only form; the other tab is made when first shown, and the row grows with it. */
function CustomerTabs(props: { ctx: DetailContext<Profile> }) {
  const profile = reactive({ ...props.ctx.row });
  return (
    <Tabs label={`About ${profile.name}`} size="sm">
      <Tab title="Profile">
        <FormLayout data={profile} items={items} columns={2} readOnly />
      </Tab>
      <Tab title="Orders">
        <ul class="dg-detail-list">
          {orders
            .filter((o) => o.customerId === profile.id)
            .map((o) => (
              <li key={String(o.id)}>{`${o.date} · ${o.item} × ${o.quantity} · ${money.format(o.amount)}`}</li>
            ))}
        </ul>
        <Button text="Close" size="sm" variant="outline" onclick={() => props.ctx.collapse()} />
      </Tab>
    </Tabs>
  );
}

/** Customers with tabs in their details; those without orders have none. The buttons open and close every row. */
export default function DetailTabs() {
  const s = reactive({ log: '' });
  let grid: DataGrid<Profile> | null = null;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Details">
        <Button text="Open all" size="sm" variant="outline" onclick={() => grid?.expandAllRows()} />
        <Button text="Close all" size="sm" variant="outline" onclick={() => grid?.collapseAllRows()} />
        <output class="dg-detail-log">{() => s.log}</output>
      </Stack>
      <DataGrid
        class="dg-detail-tabs"
        style="block-size: 30rem"
        ref={(g: DataGrid<Profile>) => (grid = g)}
        rows={profiles}
        rowKey="id"
        columns={columns}
        label="Customers with their details"
        locale="en"
        settings={{ selection: 'single' }}
        masterDetail={{ enabled: true, canExpand: (row: Profile) => row.orders > 0, template: (ctx) => <CustomerTabs ctx={ctx} /> }}
        onRowExpanded={(e) => e.kind === 'detail' && (s.log = `Opened ${(e.row as Profile).name}`)}
        onRowCollapsed={(e) => e.kind === 'detail' && (s.log = `Closed ${(e.row as Profile).name}`)}
      />
    </>
  );
}
