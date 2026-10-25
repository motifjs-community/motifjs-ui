import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 100,000 orders on a server that computes the totals itself and gives the group summaries with the groups. */
export default function SummariesServer() {
  const s = reactive({ asked: 0 });
  // An adapter with the `summary` capability is asked for the values (`remoteSummary: 'auto'`); one
  // without it gets every matching row loaded once and the values worked out in the browser.
  const server = new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 300);
  server.onLoading((e) => {
    if (e.options.summary || e.options.groupSummary) s.asked++;
  });
  const orders = new data.DataSource<Order, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });
  const byStatus = columns.map((c) => (c.field === 'status' ? { ...c, groupIndex: 0, autoExpandGroup: false } : { ...c, filterRow: c.field === 'city' || c.field === 'amount', width: c.field === 'amount' ? 170 : c.width }));
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <DataGrid
        class="dg-summaries-server"
        style="block-size: 22rem"
        dataSource={orders}
        columns={byStatus}
        label="100,000 orders with server totals"
        locale="en"
        settings={{ groupPanel: true }}
        summary={{
          totalItems: [
            { column: 'id', summaryType: 'count', showInColumn: 'customer' },
            { name: 'total', column: 'amount', summaryType: 'sum' },
            { column: 'amount', summaryType: 'max' },
          ],
          groupItems: [
            { column: 'amount', summaryType: 'sum' },
            { column: 'amount', summaryType: 'avg', showInGroupFooter: true, valueFormat: { maximumFractionDigits: 2 } },
            { column: 'id', summaryType: 'count', showInColumn: 'customer', showInGroupFooter: true },
          ],
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <output class="dg-summaries-server-state">{() => `${s.asked} summary requests · totals ${grid?.summaryStatus ?? 'loading'}`}</output>
      </Stack>
    </>
  );
}
