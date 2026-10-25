import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';

type Sale = { id: number; customerId: number | null; amount: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Sales in memory whose customer comes from another service: only the customers on the screen are asked for, several in one request. */
export default function Lookups() {
  const s = reactive({ requests: 0, keys: 0 });
  // Stands in for another service: new data.RestAdapter({ url: '/api/customers', key: 'id' }) goes in its place.
  const service = new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 400);
  // Counts the requests that turn keys into names; the editor's own list loads are not among them.
  service.onLoading((e) => {
    const asked = e.options.filter as data.FilterCondition | undefined;
    if (asked?.op !== 'in' || !Array.isArray(asked.value)) return;
    s.requests++;
    s.keys = asked.value.length;
  });
  const customers = new data.DataSource<Customer, number>({ adapter: service });
  const sales: Sale[] = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, customerId: i === 4 ? 9999 : ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 }));
  const columns: GridColumn<Sale>[] = [
    { field: 'id', title: 'No', type: 'number', width: 80, editable: false },
    {
      field: 'customerId',
      title: 'Customer',
      width: 220,
      flex: 1,
      required: true,
      filterRow: true,
      headerFilter: true,
      lookup: {
        dataSource: customers,
        valueField: 'id',
        textField: 'name',
        editor: 'lookup',
        editorOptions: { columns: [{ field: 'name', caption: 'Name' }, { field: 'city', caption: 'City', width: '7rem' }] },
      },
    },
    { field: 'amount', title: 'Amount', type: 'number', width: 120, filterRow: true, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];
  let grid: DataGrid<Sale> | null = null;

  return (
    <>
      <DataGrid
        class="dg-lookups"
        style="block-size: 30rem"
        rows={sales}
        rowKey="id"
        columns={columns}
        label="Sales with customers from another service"
        locale="en"
        saveMode="batch"
        settings={{ editable: true, filterDelay: 200 }}
        ref={(g: DataGrid<Sale>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Read the names again" variant="outline" onclick={() => grid?.refreshLookups()} />
        <output class="dg-lookup-requests">{() => `${s.requests} requests for names to the customers service, the last for ${s.keys} customers`}</output>
      </Stack>
    </>
  );
}
