import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** A server that cannot count, and fails on purpose while `failing` is on. */
class OrderServer extends SlowAdapter<Order, number> {
  failing = false;

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<Order>> {
    const result = await super.load(options);
    if (this.failing && (options.skip ?? 0) > 0) throw new Error('The server did not answer.');
    return result;
  }
}

/** 1,030 orders from a slow server without a count, loaded 50 at a time as the list nears its end. */
export default function InfiniteScroll() {
  const s = reactive({ loads: 0, parts: 0, preload: false, failing: false });
  // Stands in for a server: new data.RestAdapter({ url: '/api/orders', key: 'id' }) goes in its place.
  const server = new OrderServer({ data: makeOrders(1_030), key: 'id', capabilities: { count: false } }, 600);
  server.onLoading(() => s.loads++);
  // `count: false`: no part asks for a total; a part shorter than 50 rows is the last one.
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 50, count: false });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Load a part ahead" x-model={() => s.preload} />
        <CheckBox label="The next part fails" x-model={() => s.failing} onValueChanged={(e) => (server.failing = !!e.value)} />
        <Button text="Load more" variant="outline" onclick={() => grid?.loadMore()} />
        <Button text="To the last row" variant="outline" onclick={() => grid?.scrollToIndex(grid.total - 1, 'end')} />
        <output class="dg-infinite-state">{() => `${s.loads} loads, ${s.parts} parts came${grid?.endReached ? ', every row is here' : ''}`}</output>
      </Stack>
      <DataGrid
        class="dg-infinite"
        style="block-size: 30rem"
        mode="infinite"
        dataSource={orders}
        columns={columns}
        label="Orders, part by part"
        locale="en"
        settings={{ preloadEnabled: () => s.preload, selection: 'multiple', filterRow: true }}
        onMoreRowsLoaded={() => s.parts++}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
    </>
  );
}
