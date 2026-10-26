import { reactive } from '@motifx/core';
import { DataGrid, Stack } from '@motifx-community/ui';
import type { GridRowDropEventArgs } from '@motifx-community/ui';
import type { Task } from './task';
import { makeTasks, taskColumns } from './tasks';

/** Two grids of one `group`: a row dropped on the other grid leaves this one (`onRemove`) and goes there (`onAdd`). */
export default function RowDragBetween() {
  const s = reactive({ todo: makeTasks(12), done: makeTasks(4, 101) });
  const columns = taskColumns.filter((c) => c.field !== 'priority');
  const grid = (list: 'todo' | 'done', label: string) => {
    const rows = () => s[list];
    const add = (e: GridRowDropEventArgs<Task>) => {
      const at = e.toItemData ? rows().indexOf(e.toItemData) : rows().length;
      rows().splice(at, 0, e.itemData);
    };
    const remove = (e: GridRowDropEventArgs<Task>) => rows().splice(rows().indexOf(e.itemData), 1);
    const reorder = (e: GridRowDropEventArgs<Task>) => {
      const from = rows().indexOf(e.itemData);
      const to = rows().indexOf(e.toItemData as Task);
      rows().splice(from, 1);
      rows().splice(to, 0, e.itemData);
    };
    return (
      <DataGrid
        class={`dg-board dg-board-${list}`}
        style="block-size: 28rem; flex: 1 1 18rem"
        rows={rows}
        rowKey="id"
        columns={columns}
        label={label}
        locale="en"
        settings={{ sortable: false }}
        rowDragging={{ group: 'board', allowReordering: true, dropFeedbackMode: 'push', onAdd: add, onRemove: remove, onReorder: reorder }}
      />
    );
  };
  return (
    <Stack orientation="horizontal" wrap align="start">
      {grid('todo', 'To do')}
      {grid('done', 'Done')}
    </Stack>
  );
}
