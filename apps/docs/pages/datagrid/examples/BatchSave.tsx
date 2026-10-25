import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

/** Every change kept until "Save changes", over a server that loads by page; the page's own buttons. */
export default function BatchSave() {
  const s = reactive({ note: '' });
  const service = new OrderService({ data: makeOrders(200), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 250);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'page', pageSize: 15 });
  let grid: DataGrid<Order> | null = null;

  const save = async () => {
    const result = await grid?.saveChanges();
    if (result) s.note = `${result.saved} saved, ${result.failed} failed`;
  };

  return (
    <>
      <DataGrid
        class="dg-batch"
        style="block-size: 24rem"
        dataSource={orders}
        columns={columns}
        label="Orders saved together"
        locale="en"
        saveMode="batch"
        settings={{ editable: true, addRows: true, saveButtons: false, actionsWidth: 100 }}
        newRow={{ create: newOrder }}
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : ['remove'])}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Save changes" tone="accent" enabled={() => !!grid?.hasChanges} onclick={save} />
        <Button text="Discard" variant="outline" enabled={() => !!grid?.hasChanges} onclick={() => grid?.discardChanges()} />
        <output class="dg-batch-note">{() => `${grid?.changes.count ?? 0} unsaved${s.note ? ` · ${s.note}` : ''}`}</output>
      </Stack>
    </>
  );
}
