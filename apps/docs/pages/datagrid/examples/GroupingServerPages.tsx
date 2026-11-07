import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders grouped on the server with a pager: each page asks only for its own rows. */
export default function GroupingServerPages() {
  const s = reactive({ loads: 0 });
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading(() => s.loads++);
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'page', pageSize: 20 });
  const grouped = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0 } : c));
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid
        class="dg-grouping-pages"
        style="block-size: 32rem"
        dataSource={orders}
        columns={grouped}
        label="100,000 orders by status, page by page"
        locale="en"
        settings={{ groupPanel: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <output class="dg-grouping-pages-loads">{() => `${s.loads} loads for ${grid?.total ?? 0} rows`}</output>
      </Stack>
    </>
  );
}
