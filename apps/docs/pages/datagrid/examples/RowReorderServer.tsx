import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { DataGrid } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Task } from './task';
import { makeTasks, taskColumns } from './tasks';

const tasks = makeTasks(10_000);
const server = new SlowAdapter<Task, number>({ data: tasks, key: 'id' }, 200);
const source = new data.DataSource<Task, number>({ adapter: server, loadMode: 'blocks', pageSize: 100 });

/** What the server does when a task moves to place `order`: the tasks in between move one place. */
async function moveTask(id: number, order: number) {
  await new Promise((done) => setTimeout(done, 200));
  const task = tasks.find((t) => t.id === id)!;
  const from = task.order;
  for (const t of tasks) {
    if (from < order && t.order > from && t.order <= order) t.order--;
    else if (from > order && t.order >= order && t.order < from) t.order++;
  }
  task.order = order;
}

/** 10,000 tasks on a server, sorted by their `order` field. A drop notifies the server and reloads. */
export default function RowReorderServer() {
  const s = reactive({ saved: '' });
  return (
    <>
      <DataGrid
        class="dg-reorder-server"
        style="block-size: 28rem"
        dataSource={source}
        columns={[...taskColumns, { field: 'order', title: 'Order', type: 'number', width: 90 }]}
        sort={[{ field: 'order', dir: 'asc' }]}
        label="Tasks on a server"
        locale="en"
        settings={{ sortable: false }}
        rowDragging={{
          allowReordering: true,
          onReorder: (e) => {
            // The row at `toIndex` gives the position. The grid waits for the promise while the line stays visible.
            const order = (e.toItemData as Task).order;
            e.promise = moveTask(e.itemData.id, order).then(() => {
              s.saved = `Task ${e.itemData.id} moved to order ${order}`;
              return e.component.refresh();
            });
          },
        }}
      />
      <output class="dg-reorder-saved">{() => s.saved}</output>
    </>
  );
}
