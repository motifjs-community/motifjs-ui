# DataGrid: Row drag and drop

> DataGrid · @motifx-community/ui 0.1.0-beta.6

## Reorder rows

With `rowDragging: { allowReordering: true }`, a column of drag icons appears at the start. Drag a row by its icon, and a copy of the row follows the pointer while a line shows the drop position. With `dropFeedbackMode: 'push'`, the rows move aside to make room instead. Near the top or bottom edge, the rows scroll. On drop, `onReorder` reports the new position. The grid does not move the data itself, so the handler must do it. In this example, the rows are in memory, so the handler removes the row and inserts it at the position of `toItemData` (the row at `toIndex`). Ctrl+Shift+Up and Down move the active row the same way.

```tsx
/** A task of the drag and drop examples. */
export interface Task {
  id: number;
  title: string;
  owner: string;
  priority: string;
  /** Its place in the list, as a server keeps it. */
  order: number;
}
```

## Reorder rows on a server

On a server, the order is a field the rows are sorted by. The handler asks the server to move the row to the position of `toItemData`, and gives the promise to the grid (`e.promise`). The line stays until the response arrives, and then `refresh()` loads the rows in their new order. This example has 10,000 rows, and the virtual list loads blocks as it scrolls.

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

## Drag rows between grids

Grids with the same `group` accept each other's rows. When a row is dropped on the other grid, `onRemove` occurs on the source grid and `onAdd` on the target grid, with `toIndex` and `toItemData` giving the position. Both grids in this example also push rows aside and support reordering.

```tsx
/** A task of the drag and drop examples. */
export interface Task {
  id: number;
  title: string;
  owner: string;
  priority: string;
  /** Its place in the list, as a server keeps it. */
  order: number;
}
```

## Options

| rowDragging | Type | Default | Description |
| --- | --- | --- | --- |
| `allowReordering` | `Bind<boolean>` | `false` | Allows rows to move within the grid. |
| `allowDropInsideItem` | `Bind<boolean>` | `false` | Allows a row to be dropped onto another (the middle half of a row), reported as `dropInsideItem` in the events. This is useful for trees and details. |
| `dropFeedbackMode` | `Bind<'indicate' \| 'push'>` | `'indicate'` | How the drop position appears: a line between the rows, or the rows moving aside to make room (not with `allowDropInsideItem`). |
| `showDragIcons` | `Bind<boolean>` | `true` | A column of drag icons pinned to the start. When disabled, the whole row is draggable (a click still selects and edits). |
| `handle` | `Bind<string>` | `''` | A CSS selector for the part of a row used for dragging, instead of the icon or the whole row. |
| `group, data` | `Bind<string>`, `Bind<unknown>` | — | Grids in the same group accept each other's rows. `data` is passed to the events as `fromData` and `toData`. |
| `dragDirection` | `Bind<'both' \| 'vertical' \| 'horizontal'>` | `'both'` | Where the copy of the row can go. |
| `boundary, container` | `Bind<string \| HTMLElement>` | None, and the grid | The element the dragged row stays inside, and the element that displays its copy. |
| `cursorOffset` | `Bind<{ x, y } \| string>` | Where the row was grabbed | The offset of the copy from the pointer. |
| `dragTemplate` | `({ itemData, itemElement }) => unknown` | A copy of the row | Custom content under the pointer: a component, an element or text. |
| `autoScroll, scrollSpeed, scrollSensitivity` | `Bind<boolean>`, `Bind<number>`, `Bind<number>` | `true`, `30`, `60` | The rows scroll while the pointer is near their top or bottom edge: the speed in pixels per frame at the edge, and the distance at which it starts. |
| `keyboard, moveUpKeys, moveDownKeys` | `Bind<boolean>`, `Bind<string[]>` | `true`, `['Ctrl+Shift+ArrowUp']`, `['Ctrl+Shift+ArrowDown']` | Moves the active row one position up or down with these keys (any combination, such as `Mod+Alt+Up`), with the same events as a drop. The move is announced. |
| `columnWidth` | `Bind<number>` | `36` | The width of the drag icon column, in pixels. |
| `settings.dragThreshold, settings.dragGhost` | `Bind<number>`, `Bind<boolean>` | `5`, `true` | The distance the pointer moves before a drag starts, and whether a copy follows it. These are the same as for headers. |

| Topic | Dragging behavior |
| --- | --- |
| `The data` | The grid does not move anything itself. `onReorder` and `onAdd` / `onRemove` move the row in your array or notify the server. The grid reads your rows as they are, plain or reactive, so after the move, call `e.component.refresh()` (for both in-memory rows and a server). |
| `Sorted, filtered, grouped` | Rows can be dragged in their displayed order, and the indexes are the displayed ones. A manually ordered list usually disables `sortable`. While grouped, the keys move a row within its group, and only data rows can be dragged (not group rows, new rows or rows still loading). |
| `Virtual and paged` | The rows under the pointer are the pooled rows currently rendered, and near the edges, the rows scroll and new ones receive the marks. In paged mode, a row moves within its page, and the indexes count across pages. |
| `Screen readers` | The drag icon cell is named “Drag to move the row”, with the keys in `aria-keyshortcuts`. Drops and key moves are announced politely. |

## Events and methods

| rowDragging handler | When |
| --- | --- |
| `onDragStart` | Occurs before a row is dragged, by pointer or keys. Set `cancel` to keep it in place. |
| `onDragMove` | Occurs when the row moves under the pointer. Set `cancel` to refuse a drop there. |
| `onDragChange` | Occurs when the drop position changes (another index, another grid, or onto a row). Set `cancel` to refuse a drop there. |
| `onDragEnd` | Occurs before the row is dropped (`toIndex` is -1 when it is not over a grid that accepts it). Set `cancel` to drop nothing. |
| `onReorder` | Occurs on a drop elsewhere in this grid, where you move the row in the data. With `promise`, the grid waits for it while keeping the marks visible. |
| `onRemove / onAdd` | Occurs on a drop on another grid of the group: `onRemove` on the source grid and `onAdd` on the target grid. |

| Event field | Value |
| --- | --- |
| `component, fromComponent, toComponent` | The grid raising the event, the grid the row comes from, and the grid under the pointer (the same while reordering, or `null` when over none). |
| `itemData, itemKey, itemElement` | The dragged row, its key and its element. |
| `fromIndex, toIndex` | The grid's row indexes (as counted by `focusedRowIndex` and `getVisibleRows()`, also across pages): the current position, and the position after the drop. |
| `toItemData` | The row at `toIndex` before the drop, which is where to insert the row. It is `undefined` at the end of the other grid or on a group row. |
| `dropInsideItem, fromData, toData, event` | Whether it was dropped onto the row at `toIndex`, the grids' `rowDragging.data`, and the pointer or key event. |
| `cancel / promise` | The four drag events can be canceled, and the three drop events accept a promise. |

| Member | Parameters or return value | Description |
| --- | --- | --- |
| `rowDragging` | read/write, live | `grid.rowDragging.allowReordering = true`, and handlers too. `onOptionChanged` reports `rowDragging.allowReordering`. |
| `moveRow(fromIndex, toIndex)` | `Promise<boolean>` | Moves a row as a drop there would: `onDragStart`, `onDragChange` and `onDragEnd` (any of which can cancel), then `onReorder`. Returns whether the event was raised. |

## Keyboard

| Key | Description |
| --- | --- |
| `Ctrl+Shift+Up / Ctrl+Shift+Down on a row (`moveUpKeys`, `moveDownKeys`)` | Moves the active row one position up or down (`allowReordering`). The row stays active, and the move is announced (“Row moved to position 3 of 20”). |
| `Escape while dragging` | Cancels the drag, and nothing is dropped. |

## Feedback

Loading issues…

## Example files

`RowReorder.tsx`

```tsx
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
            e.component.refresh();
          },
        }}
      />
    </>
  );
}
```

`tasks.ts`

```tsx
import type { GridColumn } from '@motifx-community/ui';
import type { Task } from './task';

const TITLES = ['Write the release notes', 'Fix the login page', 'Review the pull request', 'Plan the sprint', 'Update the docs', 'Call the customer', 'Test on mobile', 'Clean up the backlog'];
const OWNERS = ['Ada', 'Grace', 'Alan', 'Cahit', 'Katherine', 'Edsger'];
const PRIORITIES = ['Low', 'Normal', 'High'];

/** `n` sample tasks from id `from`, in order. */
export function makeTasks(n: number, from = 1): Task[] {
  return Array.from({ length: n }, (_, i) => ({
    id: from + i,
    title: `${TITLES[(from + i) % TITLES.length]} #${from + i}`,
    owner: OWNERS[(from + i) % OWNERS.length],
    priority: PRIORITIES[(from + i) % PRIORITIES.length],
    order: i,
  }));
}

export const taskColumns: GridColumn<Task>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  { field: 'title', title: 'Task', width: 240, flex: 1 },
  { field: 'owner', title: 'Owner', width: 110 },
  { field: 'priority', title: 'Priority', width: 100 },
];
```

`task.ts`

```tsx
/** A task of the drag and drop examples. */
export interface Task {
  id: number;
  title: string;
  owner: string;
  priority: string;
  /** Its place in the list, as a server keeps it. */
  order: number;
}
```

`RowReorderServer.tsx`

```tsx
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
```

`slow-adapter.ts`

```tsx
import { data } from '@motifx-community/data';

/** Rows in memory that answer a little later, the way a server does; for the examples. */
export class SlowAdapter<T extends object, K> extends data.ArrayAdapter<T, K> {
  constructor(
    options: data.ArrayAdapterOptions<T>,
    private readonly delayMs = 300,
  ) {
    super(options);
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<T>> {
    await new Promise((done) => setTimeout(done, this.delayMs));
    return super.load(options);
  }
}
```

`RowDragBetween.tsx`

```tsx
import { reactive } from '@motifx/core';
import { DataGrid, Stack } from '@motifx-community/ui';
import type { GridRowDropEventArgs } from '@motifx-community/ui';
import type { Task } from './task';
import { makeTasks, taskColumns } from './tasks';

/** Two grids in one `group`: a row dropped on the other grid raises `onRemove` here and `onAdd` there. */
export default function RowDragBetween() {
  const s = reactive({ todo: makeTasks(12), done: makeTasks(4, 101) });
  const columns = taskColumns.filter((c) => c.field !== 'priority');
  const grid = (list: 'todo' | 'done', label: string) => {
    const rows = () => s[list];
    const add = (e: GridRowDropEventArgs<Task>) => {
      const at = e.toItemData ? rows().indexOf(e.toItemData) : rows().length;
      rows().splice(at, 0, e.itemData);
      e.component.refresh();
    };
    // The grids read the arrays as they are: each loads its own again after the change.
    const remove = (e: GridRowDropEventArgs<Task>) => {
      rows().splice(rows().indexOf(e.itemData), 1);
      e.component.refresh();
    };
    const reorder = (e: GridRowDropEventArgs<Task>) => {
      const from = rows().indexOf(e.itemData);
      const to = rows().indexOf(e.toItemData as Task);
      rows().splice(from, 1);
      rows().splice(to, 0, e.itemData);
      e.component.refresh();
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
```
