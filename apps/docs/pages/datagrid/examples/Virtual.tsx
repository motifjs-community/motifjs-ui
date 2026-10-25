import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders from a server, loaded by blocks only where the list looks. */
export default function Virtual() {
  const s = reactive({ loads: 0 });
  // Stands in for a server: new data.ODataAdapter({ url: '/odata/Orders', key: 'OrderID' }) goes in its place.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading(() => s.loads++);
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid class="dg-virtual" style="block-size: 22rem" dataSource={orders} columns={columns} label="100,000 orders" locale="en" ref={(g: DataGrid<Order>) => (grid = g)} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Go to the end" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />
        <Button text="Back to the top" variant="outline" onclick={() => grid?.scrollToIndex(0)} />
        <Button text="Fit the columns" variant="outline" onclick={() => grid?.autoSizeColumns()} />
        <output class="dg-loads">{() => `${s.loads} loads for ${grid?.total ?? 0} rows`}</output>
      </Stack>
    </>
  );
}
