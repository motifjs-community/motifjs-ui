import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code } from './code';
import RowDragBetween from './examples/RowDragBetween';
import RowReorder from './examples/RowReorder';
import RowReorderServer from './examples/RowReorderServer';

const withTasks = (name: string) => code(name, 'tasks.ts', 'task.ts');

const OPTIONS = [
  ['allowReordering', '`Bind<boolean>`', '`false`', 'Rows move within the grid.'],
  ['allowDropInsideItem', '`Bind<boolean>`', '`false`', 'A row can be dropped onto another (the middle half of a row): `dropInsideItem` in the events, for trees and details.'],
  ['dropFeedbackMode', "`Bind<'indicate' | 'push'>`", "`'indicate'`", "Where a drop would land: a line between the rows, or the rows moving aside to make room for it (not with `allowDropInsideItem`)."],
  ['showDragIcons', '`Bind<boolean>`', '`true`', 'A column of drag icons, pinned to the start, to drag rows by; off, the whole row is dragged (a click still selects and edits).'],
  ['handle', '`Bind<string>`', "`''`", 'A CSS selector of what a row is dragged by, instead of the icon or the whole row.'],
  ['group, data', '`Bind<string>`, `Bind<unknown>`', '—', 'Grids of the same group take each other’s rows; `data` is handed to the events as `fromData` / `toData`.'],
  ['dragDirection', "`Bind<'both' | 'vertical' | 'horizontal'>`", "`'both'`", 'Where the copy of the row may go.'],
  ['boundary, container', '`Bind<string | HTMLElement>`', 'none, the grid', 'The element the dragged row stays inside; the element its copy is shown in.'],
  ['cursorOffset', '`Bind<{ x, y } | string>`', 'where the row was taken', 'Where the copy sits from the pointer.'],
  ['dragTemplate', '`({ itemData, itemElement }) => unknown`', 'a copy of the row', 'Content of your own under the pointer: a component, an element or a text.'],
  ['autoScroll, scrollSpeed, scrollSensitivity', '`Bind<boolean>`, `Bind<number>`, `Bind<number>`', '`true`, `30`, `60`', 'The rows scroll while the pointer is near their top or bottom edge: pixels per frame at the edge, and how near it starts.'],
  ['keyboard, moveUpKeys, moveDownKeys', '`Bind<boolean>`, `Bind<string[]>`', "`true`, `['Ctrl+Shift+ArrowUp']`, `['Ctrl+Shift+ArrowDown']`", 'The active row moves a place up or down with these keys (any chord: `Mod+Alt+Up`…), with the same events as a drop; announced.'],
  ['columnWidth', '`Bind<number>`', '`36`', 'Width of the drag icon column, in pixels.'],
  ['settings.dragThreshold, settings.dragGhost', '`Bind<number>`, `Bind<boolean>`', '`5`, `true`', 'How far the pointer moves before a drag starts, and whether a copy follows it; the same as for headers.'],
];

const EVENTS = [
  ['onDragStart', 'A row is about to be dragged (pointer or keys); `cancel` keeps it in place.'],
  ['onDragMove', 'The row moved under the pointer; `cancel` takes no drop there.'],
  ['onDragChange', 'The place it would land changed (another index, another grid, onto a row); `cancel` takes no drop there.'],
  ['onDragEnd', 'The row is about to be dropped (`toIndex` -1 when it is over no grid that takes it); `cancel` drops nothing.'],
  ['onReorder', 'Dropped elsewhere in this grid: move it in the data. `promise`: the grid waits for it, the marks shown.'],
  ['onRemove / onAdd', 'Dropped on another grid of the group: `onRemove` on the grid it left, `onAdd` on the one it went to.'],
];

const ARGS = [
  ['component, fromComponent, toComponent', 'The grid raising it, the grid the row comes from, the grid under the pointer (the same while reordering, `null` over none).'],
  ['itemData, itemKey, itemElement', 'The row dragged, its key, its element.'],
  ['fromIndex, toIndex', 'The grid’s row indexes (as `focusedRowIndex` and `getVisibleRows()` count them, across pages too): where the row is, and where it would be after the drop.'],
  ['toItemData', 'The row at `toIndex` before the drop — splice the row in where it is; `undefined` at the end of the other grid or on a group row.'],
  ['dropInsideItem, fromData, toData, event', 'Dropped onto the row at `toIndex`; the grids’ `rowDragging.data`; the pointer or key event.'],
  ['cancel / promise', 'The four drag events can be cancelled; the three drop events take a promise.'],
];

const API = [
  ['rowDragging', 'read/write, live', '`grid.rowDragging.allowReordering = true`, handlers too; `onOptionChanged` tells `rowDragging.allowReordering`.'],
  ['moveRow(fromIndex, toIndex)', '`Promise<boolean>`', 'Moves a row as a drop there would: `onDragStart`, `onDragChange`, `onDragEnd` (any can cancel), then `onReorder`; whether it was raised.'],
];

const KEYS = [
  ['Ctrl+Shift+Up / Ctrl+Shift+Down on a row (`moveUpKeys`, `moveDownKeys`)', 'Moves the active row a place up or down (`allowReordering`); the row stays the active one, and the move is announced (“Row moved to position 3 of 20”).'],
  ['Escape while dragging', 'Cancels the drag; nothing is dropped.'],
];

const RULES = [
  ['The data', 'The grid moves nothing itself (as in the standard grid): `onReorder` and `onAdd` / `onRemove` move the row in your array or tell the server. Rows in memory given as a reactive array follow a `splice`; a server reloads with `refresh()`.'],
  ['Sorted, filtered, grouped', 'Rows can be dragged as they are shown; the indexes are the shown ones. A list the user orders by hand usually turns `sortable` off; while grouped the keys move a row within its group, and only data rows are dragged (not group rows, new rows or rows still loading).'],
  ['Virtual and paged', 'The rows under the pointer are the pooled rows drawn now; near the edges the rows scroll and the new ones take the marks. Paged, a row moves within its page; the indexes count across pages.'],
  ['Screen readers', 'The drag icon cell is named “Drag to move the row” with the keys in `aria-keyshortcuts`; drops and key moves are announced politely.'],
];

export default function DataGridDragPage() {
  return (
    <>
      <Section anchor="reorder" title="Reorder rows">
        <p>
          <Rich text="With `rowDragging: { allowReordering: true }` a column of drag icons comes at the start: take a row by its icon and drag it, a copy of the row follows the pointer and a line shows where it would land — or, with `dropFeedbackMode: 'push'`, the rows move aside to make room for it. Near the top or bottom edge the rows scroll. Drop it and `onReorder` tells where it went:, the grid does not move the data itself, the handler does. Here the rows are in memory: take the row out and splice it in where `toItemData` (the row at `toIndex`) is. Ctrl+Shift+Up and Down move the active row the same way." />
        </p>
        <Example files={withTasks('RowReorder.tsx')} stack>
          <RowReorder />
        </Example>
      </Section>

      <Section anchor="server" title="Reorder rows on a server">
        <p>
          <Rich text="On a server the order is a field the rows are sorted by. The handler asks the server to move the row to the place of `toItemData` and gives the grid the promise (`e.promise`): the line stays until the answer comes, then `refresh()` loads the rows in their new order. 10,000 rows, the virtual list loading blocks as it scrolls." />
        </p>
        <Example files={[...withTasks('RowReorderServer.tsx'), slowAdapterFile]} stack>
          <RowReorderServer />
        </Example>
      </Section>

      <Section anchor="between" title="Drag rows between grids">
        <p>
          <Rich text="Grids with the same `group` take each other's rows: drop a row on the other grid and `onRemove` comes on the grid it left, `onAdd` on the one it went to (pair), with `toIndex` and `toItemData` saying where. Both grids here push their rows aside and reorder too." />
        </p>
        <Example files={withTasks('RowDragBetween.tsx')} stack>
          <RowDragBetween />
        </Example>
      </Section>

      <Section anchor="drag-options" title="Options">
        <ApiTable head={['rowDragging', 'Type', 'Default', 'What it does']} rows={OPTIONS} />
        <ApiTable head={['Topic', 'How dragging does it']} rows={RULES} />
      </Section>

      <Section anchor="drag-events" title="Events and methods">
        <ApiTable head={['rowDragging handler', 'When']} rows={EVENTS} />
        <ApiTable head={['Field of the event', 'What it holds']} rows={ARGS} />
        <ApiTable head={['Member', 'Gets or returns', 'What it does']} rows={API} />
      </Section>

      <Section anchor="drag-keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>
    </>
  );
}
