import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

const MODES: data.SaveMode[] = ['wait', 'background', 'batch'];

/** Edits saved according to the save mode, to a server that rejects a note containing "error". */
export default function SaveModes() {
  const s = reactive({ saveMode: 'wait' as data.SaveMode });
  const service = new OrderService({ data: makeOrders(30), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Save mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.saveMode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.saveMode === mode} onclick={() => (s.saveMode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-editing"
        style="block-size: 32rem"
        dataSource={orders}
        columns={columns}
        label="Orders to edit"
        locale="en"
        saveMode={() => s.saveMode}
        settings={{ editable: true, addRows: true, striped: true }}
        newRow={{ create: newOrder }}
        validateRow={(row: Order) => (row.status === 'Cancelled' && row.paid ? { paid: 'A cancelled order is not paid.' } : null)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Delete the active row" variant="outline" onclick={() => void grid?.deleteRow()} />
        <Button text="Undo the deletion" variant="ghost" visible={() => s.saveMode === 'batch'} onclick={() => grid?.activeRow && grid.restoreRow(grid.activeRow)} />
        <output class="dg-changes">{() => `${grid?.changes.count ?? 0} unsaved, ${grid?.errorCount ?? 0} with errors`}</output>
      </Stack>
    </>
  );
}
