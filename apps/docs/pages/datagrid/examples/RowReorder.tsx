import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Task } from './task';
import { makeTasks, taskColumns } from './tasks';

/** Rows in memory reordered by dragging (or Ctrl+Shift+Up / Down): `onReorder` moves the row in the array. */
export default function RowReorder() {
  const s = reactive({ rows: makeTasks(500), push: true, icons: true });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="The rows make room (push)" x-model={() => s.push} />
        <CheckBox label="Drag icons (off: drag the whole row)" x-model={() => s.icons} />
      </Stack>
      <DataGrid
        class="dg-reorder"
        style="block-size: 28rem"
        rows={() => s.rows}
        rowKey="id"
        columns={taskColumns}
        label="Tasks to reorder"
        locale="en"
        settings={{ sortable: false }}
        rowDragging={{
          allowReordering: true,
          dropFeedbackMode: () => (s.push ? 'push' : 'indicate'),
          showDragIcons: () => s.icons,
          onReorder: (e) => {
            // The grid does not move the data: take the row out and put it where the row at `toIndex` is.
            const from = s.rows.indexOf(e.itemData);
            const to = s.rows.indexOf(e.toItemData as Task);
            s.rows.splice(from, 1);
            s.rows.splice(to, 0, e.itemData);
          },
        }}
      />
    </>
  );
}
