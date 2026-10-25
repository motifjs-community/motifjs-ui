import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, filterColumns, makeOrders } from './orders';
import { pagedOrders } from './paged-orders';

/** The bar's "Export" button, rows as objects, and 100,000 rows of a server saved in parts. */
export default function Export() {
  const s = reactive({ exported: '', progress: '' });
  let grid: DataGrid<Order> | null = null;

  const firstTwo = async () => {
    const rows = (await grid?.exportRows({ values: 'raw' })) ?? [];
    s.exported = JSON.stringify(rows.slice(0, 2));
  };

  // A grid made with `new` exports without being shown; this one reads the orders of the paged grid.
  const exportServer = async () => {
    const server = new DataGrid<Order>({ dataSource: pagedOrders, columns, label: 'Orders by page', locale: 'en' });
    s.progress = 'starting…';
    try {
      await server.exportCsv({ pageSize: 10_000, fileName: 'orders', onProgress: (n, total) => (s.progress = `${n.toLocaleString('en')} of ${total.toLocaleString('en')}`) });
      s.progress += ' — saved';
    } catch {
      s.progress = 'failed';
    } finally {
      server.dispose();
    }
  };

  return (
    <>
      <DataGrid
        class="dg-export"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={filterColumns}
        label="Orders to export"
        locale="en"
        settings={{ exportButton: true, filterRow: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="The first two rows as objects" variant="outline" onclick={firstTwo} />
        <Button text="Export the 100,000 orders by page" variant="outline" onclick={() => void exportServer()} />
      </Stack>
      <output class="dg-exported">{() => s.exported}</output>
      <output class="dg-export-progress">{() => (s.progress ? `Server export: ${s.progress}` : '')}</output>
    </>
  );
}
