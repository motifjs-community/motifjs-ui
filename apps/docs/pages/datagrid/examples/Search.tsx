import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, CheckBox, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { makeCustomers, type Customer } from './customers';
import { columns, makeOrders } from './orders';

type Sale = { id: number; customerId: number; amount: number };

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The search panel over rows in memory, and over a server whose customer names live on another service. */
export default function Search() {
  const s = reactive({ text: 'ankara', caseSensitive: false });

  // The sales and the customers are two services: the search asks the customers' service for the
  // names, then the sales' server only for keys.
  const customers = new data.DataSource<Customer, number>({ adapter: new SlowAdapter<Customer, number>({ data: makeCustomers(600), key: 'id' }, 300) });
  const salesServer = new SlowAdapter<Sale, number>({ data: Array.from({ length: 50_000 }, (_, i) => ({ id: i + 1, customerId: ((i * 37) % 600) + 1, amount: ((i * 7919) % 100_000) / 100 })), key: 'id' }, 250);
  const sales = new data.DataSource<Sale, number>({ adapter: salesServer, loadMode: 'blocks', pageSize: 100 });
  const saleColumns: GridColumn<Sale>[] = [
    { field: 'id', title: 'No', type: 'number', width: 90 },
    { field: 'customerId', title: 'Customer', flex: 1, width: 220, lookup: { dataSource: customers, valueField: 'id', textField: 'name' } },
    { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
  ];
  let server: DataGrid<Sale> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Search for “approved”" variant="outline" onclick={() => (s.text = 'approved')} />
        <CheckBox label="Mark only the same case" x-model={() => s.caseSensitive} />
      </Stack>
      <DataGrid
        class="dg-search"
        style="block-size: 20rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={columns}
        label="Orders to search"
        locale="en"
        searchText={() => s.text}
        onSearchTextChanged={(e) => (s.text = e.text)}
        settings={{ searchPanel: true, searchPanelWidth: 220, highlightCaseSensitive: () => s.caseSensitive }}
      />
      <output class="dg-search-text">{() => `Searching for “${s.text}”`}</output>
      <DataGrid
        class="dg-server-search"
        style="block-size: 20rem"
        dataSource={sales}
        columns={saleColumns}
        label="50,000 sales to search"
        locale="en"
        settings={{ searchPanel: true, searchPlaceholder: 'A customer, an amount…' }}
        ref={(g: DataGrid<Sale>) => (server = g)}
      />
      <output class="dg-server-search-filter">{() => `${(server?.total ?? 0).toLocaleString('en')} sales · ${JSON.stringify(server?.filter ?? null)}`}</output>
    </>
  );
}
