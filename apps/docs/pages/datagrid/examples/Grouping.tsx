import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Orders in memory grouped by city, then by status; the group panel and the switches change it. */
export default function Grouping() {
  const s = reactive({ panel: true, dragging: true, open: true, collapsing: true, rowClick: false, showCity: false });
  let grid: DataGrid<Order> | null = null;
  const grouped = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, showWhenGrouped: () => s.showCity } : c.field === 'status' ? { ...c, groupIndex: 1 } : c));

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Group panel" x-model={() => s.panel} />
        <CheckBox label="Drag to group" x-model={() => s.dragging} />
        <CheckBox label="Groups start open" x-model={() => s.open} />
        <CheckBox label="The user can open and close" x-model={() => s.collapsing} />
        <CheckBox label="A click on the row opens" x-model={() => s.rowClick} />
        <CheckBox label="City stays a column" x-model={() => s.showCity} />
      </Stack>
      <DataGrid
        class="dg-grouping"
        style="block-size: 34rem"
        rows={makeOrders(500)}
        rowKey="id"
        columns={grouped}
        label="Orders by city and status"
        locale="en"
        settings={{
          groupPanel: () => s.panel,
          groupPanelDragging: () => s.dragging,
          autoExpandAll: () => s.open,
          allowCollapsing: () => s.collapsing,
          groupExpandMode: () => (s.rowClick ? 'rowClick' : 'button'),
          selection: 'multiple',
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open all" variant="outline" onclick={() => grid?.expandAll()} />
        <Button text="Close all" variant="outline" onclick={() => grid?.collapseAll()} />
        <Button text="Open only the cities" variant="outline" onclick={() => (grid?.expandAll(0), grid?.collapseAll(1))} />
        <Button text="Ungroup" variant="outline" onclick={() => grid?.clearGrouping()} />
        <output class="dg-grouping-state">{() => `Grouped by ${grid?.group.map((g) => `${g.field} ${g.dir}`).join(', ') || 'nothing'}`}</output>
      </Stack>
    </>
  );
}
