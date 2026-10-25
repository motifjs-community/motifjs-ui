import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';

/** An invoice as its service sends it: the customer comes along with it (OData `$expand=customer`). */
type Invoice = { id: number; customerId: number; customer: { name: string }; total: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The name read from the row itself: the customers' service is asked only to edit. */
export default function TextFrom() {
  const s = reactive({ requests: 0 });
  const people = makeCustomers(600);
  const invoices: Invoice[] = Array.from({ length: 5_000 }, (_, i) => {
    const customer = people[(i * 53) % people.length];
    return { id: i + 1, customerId: customer.id, customer: { name: customer.name }, total: ((i * 4337) % 50_000) / 10 };
  });
  // Stand in for two services: new data.ODataAdapter({ url: '/odata/Invoices', key: 'id' }) with expand: ['customer'], and the customers'.
  const invoiceSource = new data.DataSource<Invoice, number>({ adapter: new SlowAdapter<Invoice, number>({ data: invoices, key: 'id' }, 250), loadMode: 'blocks', pageSize: 100 });
  const customerService = new SlowAdapter<Customer, number>({ data: people, key: 'id' }, 400);
  customerService.onLoading(() => s.requests++);
  const columns: GridColumn<Invoice>[] = [
    { field: 'id', title: 'Invoice', type: 'number', width: 100, editable: false },
    {
      field: 'customerId',
      title: 'Customer',
      width: 220,
      flex: 1,
      textFrom: 'customer.name',
      sortField: 'customer.name',
      lookup: { dataSource: new data.DataSource<Customer, number>({ adapter: customerService }), valueField: 'id', textField: 'name' },
    },
    { field: 'total', title: 'Total', type: 'number', width: 120, editable: false, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];

  return (
    <>
      <DataGrid class="dg-text-from" style="block-size: 18rem" dataSource={invoiceSource} columns={columns} label="Invoices" locale="en" saveMode="batch" settings={{ editable: true }} />
      <output class="dg-text-from-requests">{() => `${s.requests} requests to the customers service`}</output>
    </>
  );
}
