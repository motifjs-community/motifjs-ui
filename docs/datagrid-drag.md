# DataGrid: Row drag and drop

> DataGrid · @motifx-community/ui 0.1.0-beta.3

## Reorder rows

With `rowDragging: { allowReordering: true }` a column of drag icons comes at the start: take a row by its icon and drag it, a copy of the row follows the pointer and a line shows where it would land — or, with `dropFeedbackMode: 'push'`, the rows move aside to make room for it. Near the top or bottom edge the rows scroll. Drop it and `onReorder` tells where it went:, the grid does not move the data itself, the handler does. Here the rows are in memory: take the row out and splice it in where `toItemData` (the row at `toIndex`) is. Ctrl+Shift+Up and Down move the active row the same way.

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

On a server the order is a field the rows are sorted by. The handler asks the server to move the row to the place of `toItemData` and gives the grid the promise (`e.promise`): the line stays until the answer comes, then `refresh()` loads the rows in their new order. 10,000 rows, the virtual list loading blocks as it scrolls.

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

Grids with the same `group` take each other's rows: drop a row on the other grid and `onRemove` comes on the grid it left, `onAdd` on the one it went to (pair), with `toIndex` and `toItemData` saying where. Both grids here push their rows aside and reorder too.

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

| rowDragging | Type | Default | What it does |
| --- | --- | --- | --- |
| `allowReordering` | `Bind<boolean>` | `false` | Rows move within the grid. |
| `allowDropInsideItem` | `Bind<boolean>` | `false` | A row can be dropped onto another (the middle half of a row): `dropInsideItem` in the events, for trees and details. |
| `dropFeedbackMode` | `Bind<'indicate' \| 'push'>` | `'indicate'` | Where a drop would land: a line between the rows, or the rows moving aside to make room for it (not with `allowDropInsideItem`). |
| `showDragIcons` | `Bind<boolean>` | `true` | A column of drag icons, pinned to the start, to drag rows by; off, the whole row is dragged (a click still selects and edits). |
| `handle` | `Bind<string>` | `''` | A CSS selector of what a row is dragged by, instead of the icon or the whole row. |
| `group, data` | `Bind<string>`, `Bind<unknown>` | — | Grids of the same group take each other’s rows; `data` is handed to the events as `fromData` / `toData`. |
| `dragDirection` | `Bind<'both' \| 'vertical' \| 'horizontal'>` | `'both'` | Where the copy of the row may go. |
| `boundary, container` | `Bind<string \| HTMLElement>` | none, the grid | The element the dragged row stays inside; the element its copy is shown in. |
| `cursorOffset` | `Bind<{ x, y } \| string>` | where the row was taken | Where the copy sits from the pointer. |
| `dragTemplate` | `({ itemData, itemElement }) => unknown` | a copy of the row | Content of your own under the pointer: a component, an element or a text. |
| `autoScroll, scrollSpeed, scrollSensitivity` | `Bind<boolean>`, `Bind<number>`, `Bind<number>` | `true`, `30`, `60` | The rows scroll while the pointer is near their top or bottom edge: pixels per frame at the edge, and how near it starts. |
| `keyboard, moveUpKeys, moveDownKeys` | `Bind<boolean>`, `Bind<string[]>` | `true`, `['Ctrl+Shift+ArrowUp']`, `['Ctrl+Shift+ArrowDown']` | The active row moves a place up or down with these keys (any chord: `Mod+Alt+Up`…), with the same events as a drop; announced. |
| `columnWidth` | `Bind<number>` | `36` | Width of the drag icon column, in pixels. |
| `settings.dragThreshold, settings.dragGhost` | `Bind<number>`, `Bind<boolean>` | `5`, `true` | How far the pointer moves before a drag starts, and whether a copy follows it; the same as for headers. |

| Topic | How dragging does it |
| --- | --- |
| `The data` | The grid moves nothing itself (as in the standard grid): `onReorder` and `onAdd` / `onRemove` move the row in your array or tell the server. The grid reads your rows as they are, plain or reactive: after the move call `e.component.refresh()` (rows in memory and a server alike). |
| `Sorted, filtered, grouped` | Rows can be dragged as they are shown; the indexes are the shown ones. A list the user orders by hand usually turns `sortable` off; while grouped the keys move a row within its group, and only data rows are dragged (not group rows, new rows or rows still loading). |
| `Virtual and paged` | The rows under the pointer are the pooled rows drawn now; near the edges the rows scroll and the new ones take the marks. Paged, a row moves within its page; the indexes count across pages. |
| `Screen readers` | The drag icon cell is named “Drag to move the row” with the keys in `aria-keyshortcuts`; drops and key moves are announced politely. |

## Events and methods

| rowDragging handler | When |
| --- | --- |
| `onDragStart` | A row is about to be dragged (pointer or keys); `cancel` keeps it in place. |
| `onDragMove` | The row moved under the pointer; `cancel` takes no drop there. |
| `onDragChange` | The place it would land changed (another index, another grid, onto a row); `cancel` takes no drop there. |
| `onDragEnd` | The row is about to be dropped (`toIndex` -1 when it is over no grid that takes it); `cancel` drops nothing. |
| `onReorder` | Dropped elsewhere in this grid: move it in the data. `promise`: the grid waits for it, the marks shown. |
| `onRemove / onAdd` | Dropped on another grid of the group: `onRemove` on the grid it left, `onAdd` on the one it went to. |

| Field of the event | What it holds |
| --- | --- |
| `component, fromComponent, toComponent` | The grid raising it, the grid the row comes from, the grid under the pointer (the same while reordering, `null` over none). |
| `itemData, itemKey, itemElement` | The row dragged, its key, its element. |
| `fromIndex, toIndex` | The grid’s row indexes (as `focusedRowIndex` and `getVisibleRows()` count them, across pages too): where the row is, and where it would be after the drop. |
| `toItemData` | The row at `toIndex` before the drop — splice the row in where it is; `undefined` at the end of the other grid or on a group row. |
| `dropInsideItem, fromData, toData, event` | Dropped onto the row at `toIndex`; the grids’ `rowDragging.data`; the pointer or key event. |
| `cancel / promise` | The four drag events can be cancelled; the three drop events take a promise. |

| Member | Gets or returns | What it does |
| --- | --- | --- |
| `rowDragging` | read/write, live | `grid.rowDragging.allowReordering = true`, handlers too; `onOptionChanged` tells `rowDragging.allowReordering`. |
| `moveRow(fromIndex, toIndex)` | `Promise<boolean>` | Moves a row as a drop there would: `onDragStart`, `onDragChange`, `onDragEnd` (any can cancel), then `onReorder`; whether it was raised. |

## Keyboard

| Key | What it does |
| --- | --- |
| `Ctrl+Shift+Up / Ctrl+Shift+Down on a row (`moveUpKeys`, `moveDownKeys`)` | Moves the active row a place up or down (`allowReordering`); the row stays the active one, and the move is announced (“Row moved to position 3 of 20”). |
| `Escape while dragging` | Cancels the drag; nothing is dropped. |

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

/** `n` made-up tasks from id `from`, in their order. */
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

/** 10,000 tasks on a server, in the order of their `order` field: a drop tells the server and loads again. */
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
            // The row at `toIndex` gives the place; the grid waits for the promise, the line shown.
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

/** Two grids of one `group`: a row dropped on the other grid leaves this one (`onRemove`) and goes there (`onAdd`). */
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
