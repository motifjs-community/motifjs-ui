import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { code, withOrders } from './code';
import CellRanges from './examples/CellRanges';
import CellRangesVirtual from './examples/CellRangesVirtual';
import DragSelectRows from './examples/DragSelectRows';

const OPTIONS = [
  ['rowDragSelection', '`Bind<boolean>`', '`true`', 'With `selection: \'multiple\'`, pressing on a row and dragging selects the rows passed.'],
  ['cellSelection', "`Bind<'none' | 'single' | 'multiple'>`", "`'none'`", 'Rectangles of cells: one at a time, or more with Ctrl/⌘. While it is on, clicks on the cells draw ranges and rows are selected from the check box column.'],
  ['cellDragSelection', '`Bind<boolean>`', '`true`', 'Ranges are drawn by dragging; off, Shift+click and the keys still draw them.'],
  ['cellSelectable (column too)', '`Bind<boolean>`', '`true`', 'The column’s cells can be in a range; the column’s own value wins. A range leaves such a column out and a press there draws none.'],
  ['dragSelectionThreshold', '`Bind<number>`', '`5`', 'Pixels the pointer moves after a press before a drag starts; less is a click (it selects, or starts editing with `startEditAction: \'click\'`).'],
  ['dragSelectionAutoScroll, dragSelectionScrollSpeed, dragSelectionScrollSensitivity', '`Bind<boolean>`, `Bind<number>`, `Bind<number>`', '`true`, `30`, `60`', 'The rows scroll while the pointer is near or past an edge, down and (for ranges) sideways: pixels a frame at the edge, and how near it starts.'],
  ['dragSelectionTouch, dragSelectionLongPress', "`Bind<'scroll' | 'longPress'>`, `Bind<number>`", "`'scroll'`, `500`", 'On a touch screen a drag scrolls, or a press held that many milliseconds starts a drag selection.'],
  ['dragSelectionOnEditableCells', '`Bind<boolean>`', '`true`', 'A drag may start on a cell the user can edit; off, presses there are clicks only.'],
  ['selectAllCellsKeys, clearCellSelectionKeys', '`Bind<string[]>`', "`['Mod+A']`, `['Escape']`", 'Keys that select every cell and clear the ranges (any chord: `Ctrl+Shift+A`…).'],
  ['extendCellsKeys', '`Bind<GridCellExtendKeys>`', "`{ up: ['Shift+ArrowUp'], down, left, right, pageUp, pageDown, home, end` with Shift; `top, bottom, leftmost, rightmost` with `Mod+Shift+Arrow…`; `first: ['Mod+Shift+Home'], last: ['Mod+Shift+End'] }`", 'The keys that move the last range’s far corner, by where it goes: a cell, a screen of rows, the row’s first or last cell, the first or last row, the leftmost or rightmost cell, the very first or last cell. Each is a list of chords; assign a new object to change some.'],
  ['toggleRowSelectionKeys', '`Bind<string[]>`', "`['Shift+Space']`", 'Keys that select or deselect the active row (Space alone still does on the check box column and on cells that cannot be edited).'],
  ['extendRowSelectionKeys', '`Bind<GridRowExtendKeys>`', "`{ up: ['Shift+ArrowUp'], down: ['Shift+ArrowDown'], pageUp: ['Shift+PageUp'], pageDown: ['Shift+PageDown'] }`", 'Multiple selection: keys that move the active row and extend the selection from the anchor (while cells are selected: from the check box column).'],
  ['cellSummary, cellSummaryItems', "`Bind<boolean>`, `Bind<('count' | 'sum' | 'average' | 'min' | 'max')[]>`", "`true`, `['average', 'count', 'sum']`", 'The summary of the selected cells in the bottom bar, while more than one cell is selected.'],
];

const RULES = [
  ['Sorting, filtering, searching, grouping', 'The rows between the corners would be other rows: the ranges go (without asking `onCellSelectionChanging`). Opening or closing a group does the same.'],
  ['Paging', 'A range belongs to the page it was drawn on: another page takes it away. Shift+PageUp / PageDown extend within the page.'],
  ['Rows added, loaded again, edited', 'Corners keep their row by key (a new row by its id): a range follows its rows when new rows open above them, the data reloads or a value changes. A row that was loading when the corner was set is the row at that place once it comes.'],
  ['Columns', 'A range keeps its columns by field: moved, they stay selected where they go; hidden (by the user or the width), they are left out until they show again. Pinned columns, band headers and virtual columns work as any; a column with `cellSelectable: false` breaks the frame.'],
  ['Virtual and infinite rows', 'Ranges and runs are drawn on the pooled rows only, cell by cell, and never draw a cell’s text again. Rows that load while the rows scroll under a drag are taken in as they come; copying needs every row of the ranges loaded (else: use Export).'],
  ['Group rows, details', 'Group rows, group footers, details and adaptive details are never selected. Dragging over a group row selects the rows shown on each side of it; the rows of a closed group stay as they are.'],
  ['Selected rows and ranges', 'Both can be on: over a selected row a range is drawn whole, with its own text color, so the text keeps its contrast.'],
];

const CLASHES = [
  ['Row drag and drop', 'The drag icon (or `handle`) moves the row; without icons the whole row moves it and rows are not selected by dragging.'],
  ['Editors and clicks', 'The threshold separates a click from a drag: a click selects, opens a cell with `startEditAction: \'click\'`, a double click edits. The click after a drag is swallowed.'],
  ['Headers, filter row, group panel, totals', 'Presses there are theirs: sort, resize, move, filter, group.'],
  ['Buttons, links, fields, toggles', 'Presses on the action buttons, the master-detail and “…” toggles, links, buttons and fields inside cells are theirs.'],
  ['Text', 'While a drag selects, the browser selects no text. Alt+drag is left to the browser, to select text in the cells.'],
];

const API = [
  ['cellRanges', '`GridCellRange[]`, read/write, reactive', '`{ from, to, fields }`: the cell the range started on, its far corner (`{ field, key, rowIndex }`) and its columns. Assign by key or grid index; `[]` clears.'],
  ['selectCells(from, to?, add?)', '`boolean`', 'A range from cell to cell (one cell without `to`), alone or after the others (`add`, with `\'multiple\'`); whether it shows.'],
  ['clearCellSelection()', '`void`', 'No range.'],
  ['getSelectedCellValues()', '`GridCellValue<T>[]`', 'The selected cells of the loaded rows, each once, row by row: `{ rowIndex, key, field, value, row }` (unsaved edits included).'],
  ['cellSelectionSummary', '`GridCellSummary`, reactive', '`{ cells, count, numbers, sum, average, min, max }`, as a spreadsheet’s status bar.'],
  ['onCellSelectionChanging', '`{ ranges, previous, byDrag, cancel }`', 'Before every change, by the user or code; `cancel` keeps the ranges (while drawing: the last step).'],
  ['onCellSelectionChanged', '`{ ranges, byDrag }`', 'After every change: once per cell the pointer reaches while drawing.'],
  ['onSelectionChanging / onSelectionChanged', '`{ …, byDrag }`', 'The row selection’s events, once per row a drag reaches; `byDrag` tells it apart.'],
  ['onCopying', '`{ text, html, rows, ranges, cancel }`', 'Before a copy; `ranges` are the ranges copied.'],
];

const KEYS = [
  ['Shift+Arrows, Shift+Home / End, Shift+PageUp / PageDown (`extendCellsKeys`)', 'Extend the last range from its far corner (no range: from the active cell); focus moves with the corner. Ctrl+Shift (⌘+Shift) with the arrows and Home / End go to the edge.'],
  ['Ctrl+A (`selectAllCellsKeys`)', 'Every cell of the rows the user can reach.'],
  ['Escape (`clearCellSelectionKeys`)', 'Clears the ranges; while drawing, gives the drag up (rows: the selection before it comes back).'],
  ['Arrows, Home, End, PageUp / PageDown', 'Move the active cell and clear the ranges, as in a spreadsheet.'],
  ['Ctrl+C / Ctrl+V / Delete', 'Copy the ranges; paste into them (one value fills them all, a block starts at the first cell); empty their cells the user can edit, saved as the save mode says.'],
  ['Shift+Space (`toggleRowSelectionKeys`), Shift+Up / Down and PageUp / PageDown (`extendRowSelectionKeys`)', 'Select rows, as before; while cells are selected, from the check box column.'],
];

const TOKENS = [
  ['datagrid.range-fill, range-fill-opacity', 'The fill of the cells of a range, laid over the row’s own look at that opacity; whole over a selected row.'],
  ['datagrid.cell (`range-selected`, `range-anchor`)', 'The text of a range over a selected row, and of the anchor cell.'],
  ['datagrid.range-border-color, range-border-width', 'The frame around a range.'],
  ['datagrid.range-anchor-fill', 'The cell the last range started on (the language’s surface).'],
  ['datagrid.row-run-border-color, row-run-border-width', 'The frame around the rows a drag selects, while it runs.'],
];

export default function DataGridDragSelectPage() {
  return (
    <>
      <Section anchor="rows" title="Rows">
        <p>
          <Rich text="With `selection: 'multiple'`, press on a row and drag over others: the rows between are selected as the pointer goes, with a frame around them while the drag runs. A plain drag replaces the selection, Ctrl (⌘ on Apple) adds the rows to it, Shift goes from the anchor. Over the check boxes the rows passed take the state the first one takes. Near the top or bottom edge the rows scroll, here over 300 rows; grouped, the group rows are passed over. `onSelectionChanged` comes once per row reached, with `e.byDrag`." />
        </p>
        <Example files={withOrders('DragSelectRows.tsx')} stack>
          <DragSelectRows />
        </Example>
      </Section>

      <Section anchor="cells" title="Cell ranges">
        <p>
          <Rich text="`cellSelection` draws rectangles of cells as in a spreadsheet: press on a cell and drag, Ctrl/⌘ starts another range (`'multiple'`), Shift+click extends the last one from its anchor, a plain click starts over; Shift and the arrows do the same from the keyboard. Ctrl+C copies the ranges as tab-separated text, Ctrl+V pastes into them (one value fills them all), Delete empties them through the normal edit path, and the bar sums the numbers up. The Note column opts out until it is let in." />
        </p>
        <Example files={withOrders('CellRanges.tsx')} stack>
          <CellRanges />
        </Example>
      </Section>

      <Section anchor="big" title="Over 100,000 rows">
        <p>
          <Rich text="Ranges are marks on the cells drawn now: the pooled rows and, with virtual columns, the columns in view. Drawing one over 100,000 rows × 60 columns keeps the frame rate, and a change of a range writes only the marks that changed, never a cell's text. The buttons set ranges by key from code." />
        </p>
        <Example files={code('CellRangesVirtual.tsx')} stack>
          <CellRangesVirtual />
        </Example>
      </Section>

      <Section anchor="drag-select-options" title="Options">
        <ApiTable head={['settings', 'Type', 'Default', 'What it does']} rows={OPTIONS} />
        <ApiTable head={['What changes', 'What happens to the ranges']} rows={RULES} />
        <ApiTable head={['Next to', 'How they share the pointer']} rows={CLASHES} />
      </Section>

      <Section anchor="drag-select-api" title="Events and methods">
        <ApiTable head={['Member', 'Gets or returns', 'What it does']} rows={API} />
      </Section>

      <Section anchor="drag-select-keyboard" title="Keyboard and screen readers">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
        <p>
          <Rich text="With `cellSelection` on, the grid is `aria-multiselectable` and every selectable cell carries `aria-selected`. What a drag or a key selected is said politely: “4 rows selected”, “3 × 5 cells selected”, “12 cells selected in 2 ranges” (`gridRowsSelected`, `gridCellsSelected`, `gridCellRangesSelected`, in English and Turkish)." />
        </p>
      </Section>

      <Section anchor="drag-select-tokens" title="Tokens">
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>
    </>
  );
}
