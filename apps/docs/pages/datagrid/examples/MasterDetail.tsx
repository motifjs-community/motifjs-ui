import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import type { CustomerOrder } from './customer-order';
import { makeCustomerOrders, orderColumns } from './customer-orders';
import { makeCustomers, type Customer } from './customers';

const customers = makeCustomers(2000);
const orders = new data.ArrayAdapter<CustomerOrder, number>({ data: makeCustomerOrders(customers), key: 'id' });

const columns: GridColumn<Customer>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'name', title: 'Customer', width: 220, flex: 1 },
  { field: 'city', title: 'City', width: 140 },
];

/** A customer's orders: a grid over a source of its own, filtered by the customer's key, disposed with the details. */
function Orders(props: { customerId: unknown; name: string }) {
  const source = new data.DataSource<CustomerOrder, number>({ adapter: orders, loadMode: 'all', filter: data.where('customerId', '=', props.customerId) });
  return (
    <DataGrid
      class="dg-orders"
      style="block-size: 14rem"
      dataSource={source}
      columns={orderColumns}
      label={`Orders of ${props.name}`}
      locale="en"
      settings={{ rowCount: true }}
      onDisposing={() => source.dispose()}
    />
  );
}

/** Two thousand customers in a virtual list; each opens to a grid of its own orders. */
export default function MasterDetail() {
  return (
    <DataGrid
      class="dg-master"
      style="block-size: 30rem"
      rows={customers}
      rowKey="id"
      columns={columns}
      label="Customers and their orders"
      locale="en"
      masterDetail={{ enabled: true, template: (ctx) => <Orders customerId={ctx.key} name={ctx.row.name} /> }}
    />
  );
}
