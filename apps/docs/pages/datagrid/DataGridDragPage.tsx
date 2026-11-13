import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code } from './code';
import RowDragBetween from './examples/RowDragBetween';
import RowReorder from './examples/RowReorder';
import RowReorderServer from './examples/RowReorderServer';

const withTasks = (name: string) => code(name, 'tasks.ts', 'task.ts');

const OPTIONS = [
  ['allowReordering', '`Bind<boolean>`', '`false`', 'Allows rows to move within the grid.'],
  ['allowDropInsideItem', '`Bind<boolean>`', '`false`', 'Allows a row to be dropped onto another (the middle half of a row), reported as `dropInsideItem` in the events. This is useful for trees and details.'],
  ['dropFeedbackMode', "`Bind<'indicate' | 'push'>`", "`'indicate'`", "How the drop position appears: a line between the rows, or the rows moving aside to make room (not with `allowDropInsideItem`)."],
  ['showDragIcons', '`Bind<boolean>`', '`true`', 'A column of drag icons pinned to the start. When disabled, the whole row is draggable (a click still selects and edits).'],
  ['handle', '`Bind<string>`', "`''`", 'A CSS selector for the part of a row used for dragging, instead of the icon or the whole row.'],
  ['group, data', '`Bind<string>`, `Bind<unknown>`', '—', 'Grids in the same group accept each other\'s rows. `data` is passed to the events as `fromData` and `toData`.'],
  ['dragDirection', "`Bind<'both' | 'vertical' | 'horizontal'>`", "`'both'`", 'Where the copy of the row can go.'],
  ['boundary, container', '`Bind<string | ComponentBase>`', 'None, and the grid', 'The component the dragged row stays inside, and the component that displays its copy, or a selector of each.'],
  ['cursorOffset', '`Bind<{ x, y } | string>`', 'Where the row was grabbed', 'The offset of the copy from the pointer.'],
  ['dragTemplate', '`({ itemData, itemPart }) => ComponentBase | string`', 'A copy of the row', 'Custom content under the pointer: a component or text.'],
  ['autoScroll, scrollSpeed, scrollSensitivity', '`Bind<boolean>`, `Bind<number>`, `Bind<number>`', '`true`, `30`, `60`', 'The rows scroll while the pointer is near their top or bottom edge: the speed in pixels per frame at the edge, and the distance at which it starts.'],
  ['keyboard, moveUpKeys, moveDownKeys', '`Bind<boolean>`, `Bind<string[]>`', "`true`, `['Ctrl+Shift+ArrowUp']`, `['Ctrl+Shift+ArrowDown']`", 'Moves the active row one position up or down with these keys (any combination, such as `Mod+Alt+Up`), with the same events as a drop. The move is announced.'],
  ['columnWidth', '`Bind<number>`', '`36`', 'The width of the drag icon column, in pixels.'],
  ['settings.dragThreshold, settings.dragGhost', '`Bind<number>`, `Bind<boolean>`', '`5`, `true`', 'The distance the pointer moves before a drag starts, and whether a copy follows it. These are the same as for headers.'],
];

const EVENTS = [
  ['onDragStart', 'Occurs before a row is dragged, by pointer or keys. Set `cancel` to keep it in place.'],
  ['onDragMove', 'Occurs when the row moves under the pointer. Set `cancel` to refuse a drop there.'],
  ['onDragChange', 'Occurs when the drop position changes (another index, another grid, or onto a row). Set `cancel` to refuse a drop there.'],
  ['onDragEnd', 'Occurs before the row is dropped (`toIndex` is -1 when it is not over a grid that accepts it). Set `cancel` to drop nothing.'],
  ['onReorder', 'Occurs on a drop elsewhere in this grid, where you move the row in the data. With `promise`, the grid waits for it while keeping the marks visible.'],
  ['onRemove / onAdd', 'Occurs on a drop on another grid of the group: `onRemove` on the source grid and `onAdd` on the target grid.'],
];

const ARGS = [
  ['component, fromComponent, toComponent', 'The grid raising the event, the grid the row comes from, and the grid under the pointer (the same while reordering, or `null` when over none).'],
  ['itemData, itemKey, itemPart', 'The dragged row, its key and its part.'],
  ['fromIndex, toIndex', 'The grid\'s row indexes (as counted by `focusedRowIndex` and `getVisibleRows()`, also across pages): the current position, and the position after the drop.'],
  ['toItemData', 'The row at `toIndex` before the drop, which is where to insert the row. It is `undefined` at the end of the other grid or on a group row.'],
  ['dropInsideItem, fromData, toData, event', 'Whether it was dropped onto the row at `toIndex`, the grids\' `rowDragging.data`, and the pointer or key event.'],
  ['cancel / promise', 'The four drag events can be canceled, and the three drop events accept a promise.'],
];

const API = [
  ['rowDragging', 'read/write, live', '`grid.rowDragging.allowReordering = true`, and handlers too. `onOptionChanged` reports `rowDragging.allowReordering`.'],
  ['moveRow(fromIndex, toIndex)', '`Promise<boolean>`', 'Moves a row as a drop there would: `onDragStart`, `onDragChange` and `onDragEnd` (any of which can cancel), then `onReorder`. Returns whether the event was raised.'],
];

const KEYS = [
  ['Ctrl+Shift+Up / Ctrl+Shift+Down on a row (`moveUpKeys`, `moveDownKeys`)', 'Moves the active row one position up or down (`allowReordering`). The row stays active, and the move is announced (“Row moved to position 3 of 20”).'],
  ['Escape while dragging', 'Cancels the drag, and nothing is dropped.'],
];

const RULES = [
  ['The data', 'The grid does not move anything itself. `onReorder` and `onAdd` / `onRemove` move the row in your array or notify the server. The grid reads your rows as they are, plain or reactive, so after the move, call `e.component.refresh()` (for both in-memory rows and a server).'],
  ['Sorted, filtered, grouped', 'Rows can be dragged in their displayed order, and the indexes are the displayed ones. A manually ordered list usually disables `sortable`. While grouped, the keys move a row within its group, and only data rows can be dragged (not group rows, new rows or rows still loading).'],
  ['Virtual and paged', 'The rows under the pointer are the pooled rows currently rendered, and near the edges, the rows scroll and new ones receive the marks. In paged mode, a row moves within its page, and the indexes count across pages.'],
  ['Screen readers', 'The drag icon cell is named “Drag to move the row”, with the keys in `aria-keyshortcuts`. Drops and key moves are announced politely.'],
];

export default function DataGridDragPage() {
  return (
    <>
      <Section anchor="reorder" title="Reorder rows">
        <p>
          <Rich text="With `rowDragging: { allowReordering: true }`, a column of drag icons appears at the start. Drag a row by its icon, and a copy of the row follows the pointer while a line shows the drop position. With `dropFeedbackMode: 'push'`, the rows move aside to make room instead. Near the top or bottom edge, the rows scroll. On drop, `onReorder` reports the new position. The grid does not move the data itself, so the handler must do it. In this example, the rows are in memory, so the handler removes the row and inserts it at the position of `toItemData` (the row at `toIndex`). Ctrl+Shift+Up and Down move the active row the same way." />
        </p>
        <Example files={withTasks('RowReorder.tsx')} stack>
          <RowReorder />
        </Example>
      </Section>

      <Section anchor="server" title="Reorder rows on a server">
        <p>
          <Rich text="On a server, the order is a field the rows are sorted by. The handler asks the server to move the row to the position of `toItemData`, and gives the promise to the grid (`e.promise`). The line stays until the response arrives, and then `refresh()` loads the rows in their new order. This example has 10,000 rows, and the virtual list loads blocks as it scrolls." />
        </p>
        <Example files={[...withTasks('RowReorderServer.tsx'), slowAdapterFile]} stack>
          <RowReorderServer />
        </Example>
      </Section>

      <Section anchor="between" title="Drag rows between grids">
        <p>
          <Rich text="Grids with the same `group` accept each other's rows. When a row is dropped on the other grid, `onRemove` occurs on the source grid and `onAdd` on the target grid, with `toIndex` and `toItemData` giving the position. Both grids in this example also push rows aside and support reordering." />
        </p>
        <Example files={withTasks('RowDragBetween.tsx')} stack>
          <RowDragBetween />
        </Example>
      </Section>

      <Section anchor="drag-options" title="Options">
        <ApiTable head={['rowDragging', 'Type', 'Default', 'Description']} rows={OPTIONS} />
        <ApiTable head={['Topic', 'Dragging behavior']} rows={RULES} />
      </Section>

      <Section anchor="drag-events" title="Events and methods">
        <ApiTable head={['rowDragging handler', 'When']} rows={EVENTS} />
        <ApiTable head={['Event field', 'Value']} rows={ARGS} />
        <ApiTable head={['Member', 'Parameters or return value', 'Description']} rows={API} />
      </Section>

      <Section anchor="drag-keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>
    </>
  );
}
