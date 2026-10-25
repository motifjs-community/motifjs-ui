import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

/** Rows in memory given with `rows`, rows added from code, and a grid created with `new`. */
export default function FromCode() {
  const s = reactive({ orders: makeOrders(40) });
  let grid: DataGrid<Order> | null = null;
  let host: Stack | null = null;

  const pushOrder = () => s.orders.push({ ...makeOrders(1)[0], id: s.orders.length + 1, customer: 'Pushed' });

  const addGrid = () => {
    if (!host) return;
    host.controls.clear();
    const made = new DataGrid<Order>({ rows: makeOrders(8), rowKey: 'id', columns: columns.slice(0, 4), settings: { striped: true }, label: 'Created with new' });
    made.element.style.blockSize = '14rem';
    host.controls.add(made);
    made.sort = [{ field: 'customer', dir: 'asc' }];
  };

  return (
    <>
      <DataGrid
        class="dg-local"
        style="block-size: 20rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders"
        locale="en"
        settings={{ editable: true, addRows: true, striped: true }}
        newRow={{ create: newOrder }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a row from code" variant="outline" onclick={() => void grid?.addRow({ customer: 'Ada Lovelace' })} />
        <Button text="Push an order into the array" variant="outline" onclick={pushOrder} />
        <Button text="Add a grid from code" variant="outline" onclick={addGrid} />
        <output class="dg-local-count">{() => `${s.orders.length} orders in the array`}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
