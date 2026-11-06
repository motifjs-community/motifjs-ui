import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders grouped on the server: the groups arrive with their counts, and rows load only in the visible area. */
export default function GroupingServer() {
  const s = reactive({ loads: 0 });
  // An adapter that groups (here rows in memory acting as a server) answers `group` itself; one
  // that cannot (OData, REST) gets every matching row grouped in the browser instead.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading(() => s.loads++);
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  const grouped = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c));
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid
        class="dg-grouping-server"
        style="block-size: 32rem"
        dataSource={orders}
        columns={grouped}
        label="100,000 orders by status"
        locale="en"
        settings={{ groupPanel: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open “Shipped”" variant="outline" onclick={() => grid?.expandGroup(['Shipped'])} />
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <output class="dg-grouping-loads">{() => `${s.loads} loads for ${grid?.total ?? 0} rows`}</output>
      </Stack>
    </>
  );
}
