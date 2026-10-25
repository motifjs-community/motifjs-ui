import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** Widths, order, sort and filters kept under `layoutKey`; a grid made again gets them back. */
export default function KeepLayout() {
  const s = reactive({ keep: true, shown: true });
  let grid: DataGrid<Order> | null = null;

  const makeAgain = () => {
    s.shown = false;
    setTimeout(() => (s.shown = true), 0);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Keep the layout" x-model={() => s.keep} />
        <Button text="Make the grid again" variant="outline" onclick={makeAgain} />
        <Button text="Reset the layout" variant="ghost" onclick={() => grid?.resetLayout()} />
      </Stack>
      {s.shown && (
        <DataGrid
          class="dg-layout"
          style="block-size: 18rem"
          rows={makeOrders(40)}
          rowKey="id"
          columns={filterColumns}
          label="Orders that keep their layout"
          locale="en"
          layoutKey="docs-orders"
          settings={{ saveLayout: () => s.keep }}
          ref={(g: DataGrid<Order>) => (grid = g)}
        />
      )}
    </>
  );
}
