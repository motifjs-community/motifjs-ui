import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** The filter row and the header filter, on rows in memory and on 100,000 rows of a server. */
export default function Filters() {
  // The server groups, so the header filter gets its values and counts from it.
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  let grid: DataGrid<Order> | null = null;
  let server: DataGrid<Order> | null = null;

  const setFilters = () => {
    if (grid) grid.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } };
  };

  return (
    <>
      <DataGrid
        class="dg-filters"
        style="block-size: 30rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={filterColumns}
        label="Orders to filter"
        locale="en"
        settings={{ striped: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Ankara and İzmir, 100 to 500" variant="outline" onclick={setFilters} />
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />
        <output class="dg-filter-count">{() => `${grid?.total ?? 0} of 200 orders`}</output>
      </Stack>
      <DataGrid
        class="dg-server-filters"
        style="block-size: 30rem"
        dataSource={orders}
        columns={filterColumns}
        label="100,000 orders to filter"
        locale="en"
        ref={(g: DataGrid<Order>) => (server = g)}
      />
      <output class="dg-server-filter">{() => `${(server?.total ?? 0).toLocaleString('en')} orders · ${JSON.stringify(server?.filter ?? null)}`}</output>
    </>
  );
}
