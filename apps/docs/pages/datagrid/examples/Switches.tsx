import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Features switched by functions in `settings`, by `grid.settings` and by one column's own settings. */
export default function Switches() {
  const s = reactive({ striped: true, resizable: true, nextColumn: false, movable: true, pinnable: true, menu: true, tooltips: true, rowCount: true });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Striped" x-model={() => s.striped} />
        <CheckBox label="Resizing" x-model={() => s.resizable} />
        <CheckBox label="Resize against the next column" x-model={() => s.nextColumn} />
        <CheckBox label="Moving" x-model={() => s.movable} />
        <CheckBox label="Pinning" x-model={() => s.pinnable} />
        <CheckBox label="Column menu" x-model={() => s.menu} />
        <CheckBox label="Menu button always" onValueChanged={(e) => grid && (grid.settings.headerButtons = e.value ? 'always' : 'hover')} />
        <CheckBox label="Tooltips" x-model={() => s.tooltips} />
        <CheckBox label="Row count" x-model={() => s.rowCount} />
        <CheckBox label="Customer column can resize" value={true} onValueChanged={(e) => grid && (grid.columnSettings('customer').resizable = e.value ? undefined : false)} />
      </Stack>
      <DataGrid
        class="dg-settings"
        style="block-size: 28rem"
        rows={makeOrders(25)}
        rowKey="id"
        label="Switches"
        locale="en"
        columns={[{ ...columns[0], movable: false, menu: false }, ...columns.slice(1)]}
        settings={{
          striped: () => s.striped,
          resizable: () => s.resizable,
          resizeMode: () => (s.nextColumn ? 'nextColumn' : 'widget'),
          movable: () => s.movable,
          pinnable: () => s.pinnable,
          menu: () => s.menu,
          tooltips: () => s.tooltips,
          rowCount: () => s.rowCount,
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
    </>
  );
}
