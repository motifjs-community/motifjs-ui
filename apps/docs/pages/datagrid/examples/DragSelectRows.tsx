import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack, type GridSelectionChangedEventArgs } from '@motifx-community/ui';
import { columns, makeOrders } from './orders';

/** Rows selected by dragging over them: live, with Ctrl to add, Shift from the anchor, over the check boxes too. */
export default function DragSelectRows() {
  const s = reactive({ drag: true, scroll: true, grouped: false, last: '' });
  const told = (e: GridSelectionChangedEventArgs) => (s.last = `${e.selection.keys.length} keys${e.byDrag ? ', by dragging' : ''}`);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Select rows by dragging" x-model={() => s.drag} />
        <CheckBox label="Scroll near the edges" x-model={() => s.scroll} />
        <CheckBox label="Group by city" x-model={() => s.grouped} />
      </Stack>
      <DataGrid
        class="dg-drag-rows"
        style="block-size: 28rem"
        rows={makeOrders(300)}
        rowKey="id"
        columns={columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: () => (s.grouped ? 0 : undefined) } : c))}
        label="Orders to select by dragging"
        locale="en"
        settings={{ selection: 'multiple', rowDragSelection: () => s.drag, dragSelectionAutoScroll: () => s.scroll }}
        onSelectionChanged={told}
      />
      <output class="dg-drag-rows-state">{() => s.last}</output>
    </>
  );
}
