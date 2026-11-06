import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { code, withOrders } from './code';
import CellRanges from './examples/CellRanges';
import CellRangesVirtual from './examples/CellRangesVirtual';
import DragSelectRows from './examples/DragSelectRows';

const OPTIONS = [
  ['rowDragSelection', '`Bind<boolean>`', '`true`', 'With `selection: \'multiple\'`, pressing on a row and dragging selects the rows passed.'],
  ['cellSelection', "`Bind<'none' | 'single' | 'multiple'>`", "`'none'`", 'Allows rectangles of cells: one at a time, or more with Ctrl or ⌘. While enabled, clicking cells draws ranges, and rows are selected from the check box column.'],
  ['cellDragSelection', '`Bind<boolean>`', '`true`', 'Allows ranges to be drawn by dragging. When disabled, Shift+click and the keys still draw them.'],
  ['cellSelectable (column too)', '`Bind<boolean>`', '`true`', 'Whether the column\'s cells can be in a range. The column\'s own value takes precedence. A range excludes such a column, and pressing there draws nothing.'],
  ['dragSelectionThreshold', '`Bind<number>`', '`5`', 'The distance in pixels the pointer moves after a press before a drag starts. A shorter movement is a click, which selects, or starts editing with `startEditAction: \'click\'`.'],
  ['dragSelectionAutoScroll, dragSelectionScrollSpeed, dragSelectionScrollSensitivity', '`Bind<boolean>`, `Bind<number>`, `Bind<number>`', '`true`, `30`, `60`', 'The rows scroll while the pointer is near or past an edge, vertically and (for ranges) horizontally: the speed in pixels per frame at the edge, and the distance at which it starts.'],
  ['dragSelectionTouch, dragSelectionLongPress', "`Bind<'scroll' | 'longPress'>`, `Bind<number>`", "`'scroll'`, `500`", 'On a touch screen, a drag scrolls, and a press held for this many milliseconds starts a drag selection.'],
  ['dragSelectionOnEditableCells', '`Bind<boolean>`', '`true`', 'Allows a drag to start on a cell the user can edit. When disabled, presses there are only clicks.'],
  ['selectAllCellsKeys, clearCellSelectionKeys', '`Bind<string[]>`', "`['Mod+A']`, `['Escape']`", 'The keys that select every cell and clear the ranges (any combination, such as `Ctrl+Shift+A`).'],
  ['extendCellsKeys', '`Bind<GridCellExtendKeys>`', "`{ up: ['Shift+ArrowUp'], down, left, right, pageUp, pageDown, home, end` with Shift; `top, bottom, leftmost, rightmost` with `Mod+Shift+Arrow…`; `first: ['Mod+Shift+Home'], last: ['Mod+Shift+End'] }`", 'The keys that move the far corner of the last range, by destination: a cell, a screen of rows, the first or last cell of the row, the first or last row, the leftmost or rightmost cell, or the very first or last cell. Each is a list of key combinations. Assign a new object to change some of them.'],
  ['toggleRowSelectionKeys', '`Bind<string[]>`', "`['Shift+Space']`", 'The keys that select or deselect the active row. Space alone still does so on the check box column and on cells that cannot be edited.'],
  ['extendRowSelectionKeys', '`Bind<GridRowExtendKeys>`', "`{ up: ['Shift+ArrowUp'], down: ['Shift+ArrowDown'], pageUp: ['Shift+PageUp'], pageDown: ['Shift+PageDown'] }`", 'For multiple selection, the keys that move the active row and extend the selection from the anchor (while cells are selected, from the check box column).'],
  ['cellSummary, cellSummaryItems', "`Bind<boolean>`, `Bind<('count' | 'sum' | 'average' | 'min' | 'max')[]>`", "`true`, `['average', 'count', 'sum']`", 'The summary of selected cells in the bottom bar, shown while more than one cell is selected.'],
];

const RULES = [
  ['Sorting, filtering, searching, grouping', 'The rows between the corners would change, so the ranges are cleared (without raising `onCellSelectionChanging`). Expanding or collapsing a group does the same.'],
  ['Paging', 'A range belongs to the page it was drawn on, so changing the page clears it. Shift+PageUp and PageDown extend within the page.'],
  ['Rows added, loaded again, edited', 'Corners keep their row by key (a new row by its ID), so a range follows its rows when new rows open above them, the data reloads or a value changes. A row that was loading when the corner was set is the row at that position once it arrives.'],
  ['Columns', 'A range keeps its columns by field. When moved, they stay selected in their new position. When hidden, by the user or by width, they are excluded until they appear again. Pinned columns, band headers and virtual columns work as usual, and a column with `cellSelectable: false` breaks the frame.'],
  ['Virtual and infinite rows', 'Ranges are drawn only on the pooled rows, cell by cell, and never redraw a cell\'s text. Rows that load while the rows scroll under a drag are included as they arrive. Copying requires every row of the ranges to be loaded (otherwise, use Export).'],
  ['Group rows, details', 'Group rows, group footers, details and adaptive details are never selected. Dragging over a group row selects the visible rows on each side of it, and the rows of a collapsed group stay unchanged.'],
  ['Selected rows and ranges', 'Both can be enabled. Over a selected row, a range is drawn in full with its own text color, so the text keeps its contrast.'],
];

const CLASHES = [
  ['Row drag and drop', 'The drag icon (or `handle`) moves the row. Without icons, the whole row moves it, and rows are not selected by dragging.'],
  ['Editors and clicks', 'The threshold separates a click from a drag. A click selects, opens a cell with `startEditAction: \'click\'`, and a double-click edits. The click after a drag is ignored.'],
  ['Headers, filter row, group panel, totals', 'Presses there belong to them: sort, resize, move, filter and group.'],
  ['Buttons, links, fields, toggles', 'Presses on action buttons, master-detail and “…” toggles, links, buttons and fields inside cells belong to them.'],
  ['Text', 'While a drag selects, the browser does not select text. Alt+drag is left to the browser, for selecting text in cells.'],
];

const API = [
  ['cellRanges', '`GridCellRange[]`, read/write, reactive', '`{ from, to, fields }`: the cell the range started on, its far corner (`{ field, key, rowIndex }`) and its columns. Assign by key or grid index, and `[]` clears.'],
  ['selectCells(from, to?, add?)', '`boolean`', 'Selects a range from cell to cell (one cell without `to`), alone or after the others (`add`, with `\'multiple\'`). Returns whether it is displayed.'],
  ['clearCellSelection()', '`void`', 'Clears all ranges.'],
  ['getSelectedCellValues()', '`GridCellValue<T>[]`', 'The selected cells of the loaded rows, each once, row by row: `{ rowIndex, key, field, value, row }`, including unsaved edits.'],
  ['cellSelectionSummary', '`GridCellSummary`, reactive', '`{ cells, count, numbers, sum, average, min, max }`, as in a spreadsheet status bar.'],
  ['onCellSelectionChanging', '`{ ranges, previous, byDrag, cancel }`', 'Occurs before every change, by the user or code. Set `cancel` to keep the ranges (while drawing, the last step).'],
  ['onCellSelectionChanged', '`{ ranges, byDrag }`', 'Occurs after every change: once per cell the pointer reaches while drawing.'],
  ['onSelectionChanging / onSelectionChanged', '`{ …, byDrag }`', 'The row selection events, raised once per row a drag reaches. `byDrag` identifies them.'],
  ['onCopying', '`{ text, html, rows, ranges, cancel }`', 'Occurs before a copy. `ranges` holds the ranges being copied.'],
];

const KEYS = [
  ['Shift+Arrows, Shift+Home / End, Shift+PageUp / PageDown (`extendCellsKeys`)', 'Extends the last range from its far corner (with no range, from the active cell), and focus moves with the corner. Ctrl+Shift (⌘+Shift) with the arrow keys, Home and End moves to the edge.'],
  ['Ctrl+A (`selectAllCellsKeys`)', 'Selects every cell of the rows the user can reach.'],
  ['Escape (`clearCellSelectionKeys`)', 'Clears the ranges. While drawing, it cancels the drag, and for rows, restores the previous selection.'],
  ['Arrows, Home, End, PageUp / PageDown', 'Moves the active cell and clears the ranges, as in a spreadsheet.'],
  ['Ctrl+C / Ctrl+V / Delete', 'Copies the ranges, pastes into them (one value fills them all, and a block starts at the first cell), or clears their editable cells, saved according to the save mode.'],
  ['Shift+Space (`toggleRowSelectionKeys`), Shift+Up / Down and PageUp / PageDown (`extendRowSelectionKeys`)', 'Selects rows as usual. While cells are selected, this works from the check box column.'],
];

const TOKENS = [
  ['datagrid.range-fill, range-fill-opacity', 'The fill of the cells of a range, over the row\'s own appearance at that opacity, and in full over a selected row.'],
  ['datagrid.cell (`range-selected`, `range-anchor`)', 'The text of a range over a selected row, and of the anchor cell.'],
  ['datagrid.range-border-color, range-border-width', 'The frame around a range.'],
  ['datagrid.range-anchor-fill', 'The cell the last range started on (the design language\'s surface).'],
  ['datagrid.row-run-border-color, row-run-border-width', 'The frame around the rows a drag selects, shown during the drag.'],
];

export default function DataGridDragSelectPage() {
  return (
    <>
      <Section anchor="rows" title="Rows">
        <p>
          <Rich text="With `selection: 'multiple'`, press on a row and drag over others to select the rows in between, with a frame around them during the drag. A plain drag replaces the selection, Ctrl (⌘ on Apple platforms) adds to it, and Shift extends from the anchor. Over the check boxes, all rows passed take the state of the first one. Near the top or bottom edge, the rows scroll (300 rows in this example), and when grouped, group rows are skipped. `onSelectionChanged` occurs once per row reached, with `e.byDrag`." />
        </p>
        <Example files={withOrders('DragSelectRows.tsx')} stack>
          <DragSelectRows />
        </Example>
      </Section>

      <Section anchor="cells" title="Cell ranges">
        <p>
          <Rich text="`cellSelection` draws rectangles of cells as in a spreadsheet. Press on a cell and drag. Ctrl or ⌘ starts another range (`'multiple'`), Shift+click extends the last one from its anchor, and a plain click starts over. Shift and the arrow keys do the same from the keyboard. Ctrl+C copies the ranges as tab-separated text, Ctrl+V pastes into them (one value fills them all), Delete clears them through the normal edit path, and the status bar sums the numbers. The Note column is excluded until you include it." />
        </p>
        <Example files={withOrders('CellRanges.tsx')} stack>
          <CellRanges />
        </Example>
      </Section>

      <Section anchor="big" title="Over 100,000 rows">
        <p>
          <Rich text="Ranges are marks on the currently rendered cells: the pooled rows and, with virtual columns, the visible columns. Drawing a range over 100,000 rows × 60 columns keeps the frame rate, and a range change writes only the marks that changed, never a cell's text. The buttons set ranges by key programmatically." />
        </p>
        <Example files={code('CellRangesVirtual.tsx')} stack>
          <CellRangesVirtual />
        </Example>
      </Section>

      <Section anchor="drag-select-options" title="Options">
        <ApiTable head={['settings', 'Type', 'Default', 'Description']} rows={OPTIONS} />
        <ApiTable head={['Change', 'Effect on ranges']} rows={RULES} />
        <ApiTable head={['Feature', 'How it shares the pointer']} rows={CLASHES} />
      </Section>

      <Section anchor="drag-select-api" title="Events and methods">
        <ApiTable head={['Member', 'Parameters or return value', 'Description']} rows={API} />
      </Section>

      <Section anchor="drag-select-keyboard" title="Keyboard and screen readers">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
        <p>
          <Rich text="With `cellSelection` on, the grid is `aria-multiselectable` and every selectable cell has `aria-selected`. A selection by drag or key is announced politely: “4 rows selected”, “3 × 5 cells selected”, “12 cells selected in 2 ranges” (`gridRowsSelected`, `gridCellsSelected`, `gridCellRangesSelected`, in English and Turkish)." />
        </p>
      </Section>

      <Section anchor="drag-select-tokens" title="Tokens">
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>
    </>
  );
}
