# DataGrid: Selecting by dragging

> DataGrid · @motifx-community/ui 0.1.0-beta.2

## Rows

With `selection: 'multiple'`, press on a row and drag over others: the rows between are selected as the pointer goes, with a frame around them while the drag runs. A plain drag replaces the selection, Ctrl (⌘ on Apple) adds the rows to it, Shift goes from the anchor. Over the check boxes the rows passed take the state the first one takes. Near the top or bottom edge the rows scroll, here over 300 rows; grouped, the group rows are passed over. `onSelectionChanged` comes once per row reached, with `e.byDrag`.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

## Cell ranges

`cellSelection` draws rectangles of cells as in a spreadsheet: press on a cell and drag, Ctrl/⌘ starts another range (`'multiple'`), Shift+click extends the last one from its anchor, a plain click starts over; Shift and the arrows do the same from the keyboard. Ctrl+C copies the ranges as tab-separated text, Ctrl+V pastes into them (one value fills them all), Delete empties them through the normal edit path, and the bar sums the numbers up. The Note column opts out until it is let in.

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

## Over 100,000 rows

Ranges are marks on the cells drawn now: the pooled rows and, with virtual columns, the columns in view. Drawing one over 100,000 rows × 60 columns keeps the frame rate, and a change of a range writes only the marks that changed, never a cell's text. The buttons set ranges by key from code.

```tsx
import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack, type GridColumnItem } from '@motifx-community/ui';

type Reading = { id: number };

const SENSORS = 60;

const columns: GridColumnItem<Reading>[] = [
  { field: 'id', title: 'Hour', type: 'number', width: 90, sticky: 'start' },
  ...Array.from({ length: SENSORS }, (_, n) => ({ field: `s${n}`, title: `S${n + 1}`, type: 'number' as const, width: 90, value: (r: Reading) => ((r.id * (n + 7)) % 1000) / 10 })),
];

const rows: Reading[] = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1 }));

/** 100,000 rows × 60 virtual columns: a range is drawn over pooled rows, only the drawn cells carry its marks. */
export default function CellRangesVirtual() {
  const s = reactive({ told: '' });
  let grid: DataGrid<Reading> | null = null;
  const show = () => {
    const sum = grid?.cellSelectionSummary;
    s.told = sum ? `${sum.cells.toLocaleString('en')} cells, sum ${sum.sum.toLocaleString('en')}` : '';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Hours 10–20, S1–S5" size="sm" variant="outline" onclick={() => grid?.selectCells({ key: 10, field: 's0' }, { key: 20, field: 's4' }) && show()} />
        <Button text="Add hour 50, S10–S12" size="sm" variant="outline" onclick={() => grid?.selectCells({ key: 50, field: 's9' }, { key: 50, field: 's11' }, true) && show()} />
        <Button text="Clear" size="sm" variant="ghost" onclick={() => grid?.clearCellSelection()} />
      </Stack>
      <DataGrid
        class="dg-range-virtual"
        style="block-size: 30rem"
        rows={rows}
        rowKey="id"
        columns={columns}
        label="Sensor readings as a sheet"
        locale="en"
        settings={{ cellSelection: 'multiple', columnRenderingMode: 'virtual' }}
        onCellSelectionChanged={show}
        ref={(g: DataGrid<Reading>) => (grid = g)}
      />
      <output class="dg-range-virtual-state">{() => s.told}</output>
    </>
  );
}
```

## Options

| settings | Type | Default | What it does |
| --- | --- | --- | --- |
| `rowDragSelection` | `Bind<boolean>` | `true` | With `selection: 'multiple'`, pressing on a row and dragging selects the rows passed. |
| `cellSelection` | `Bind<'none' \| 'single' \| 'multiple'>` | `'none'` | Rectangles of cells: one at a time, or more with Ctrl/⌘. While it is on, clicks on the cells draw ranges and rows are selected from the check box column. |
| `cellDragSelection` | `Bind<boolean>` | `true` | Ranges are drawn by dragging; off, Shift+click and the keys still draw them. |
| `cellSelectable (column too)` | `Bind<boolean>` | `true` | The column’s cells can be in a range; the column’s own value wins. A range leaves such a column out and a press there draws none. |
| `dragSelectionThreshold` | `Bind<number>` | `5` | Pixels the pointer moves after a press before a drag starts; less is a click (it selects, or starts editing with `startEditAction: 'click'`). |
| `dragSelectionAutoScroll, dragSelectionScrollSpeed, dragSelectionScrollSensitivity` | `Bind<boolean>`, `Bind<number>`, `Bind<number>` | `true`, `30`, `60` | The rows scroll while the pointer is near or past an edge, down and (for ranges) sideways: pixels a frame at the edge, and how near it starts. |
| `dragSelectionTouch, dragSelectionLongPress` | `Bind<'scroll' \| 'longPress'>`, `Bind<number>` | `'scroll'`, `500` | On a touch screen a drag scrolls, or a press held that many milliseconds starts a drag selection. |
| `dragSelectionOnEditableCells` | `Bind<boolean>` | `true` | A drag may start on a cell the user can edit; off, presses there are clicks only. |
| `selectAllCellsKeys, clearCellSelectionKeys` | `Bind<string[]>` | `['Mod+A']`, `['Escape']` | Keys that select every cell and clear the ranges (any chord: `Ctrl+Shift+A`…). |
| `extendCellsKeys` | `Bind<GridCellExtendKeys>` | `{ up: ['Shift+ArrowUp'], down, left, right, pageUp, pageDown, home, end` with Shift; `top, bottom, leftmost, rightmost` with `Mod+Shift+Arrow…`; `first: ['Mod+Shift+Home'], last: ['Mod+Shift+End'] }` | The keys that move the last range’s far corner, by where it goes: a cell, a screen of rows, the row’s first or last cell, the first or last row, the leftmost or rightmost cell, the very first or last cell. Each is a list of chords; assign a new object to change some. |
| `toggleRowSelectionKeys` | `Bind<string[]>` | `['Shift+Space']` | Keys that select or deselect the active row (Space alone still does on the check box column and on cells that cannot be edited). |
| `extendRowSelectionKeys` | `Bind<GridRowExtendKeys>` | `{ up: ['Shift+ArrowUp'], down: ['Shift+ArrowDown'], pageUp: ['Shift+PageUp'], pageDown: ['Shift+PageDown'] }` | Multiple selection: keys that move the active row and extend the selection from the anchor (while cells are selected: from the check box column). |
| `cellSummary, cellSummaryItems` | `Bind<boolean>`, `Bind<('count' \| 'sum' \| 'average' \| 'min' \| 'max')[]>` | `true`, `['average', 'count', 'sum']` | The summary of the selected cells in the bottom bar, while more than one cell is selected. |

| What changes | What happens to the ranges |
| --- | --- |
| `Sorting, filtering, searching, grouping` | The rows between the corners would be other rows: the ranges go (without asking `onCellSelectionChanging`). Opening or closing a group does the same. |
| `Paging` | A range belongs to the page it was drawn on: another page takes it away. Shift+PageUp / PageDown extend within the page. |
| `Rows added, loaded again, edited` | Corners keep their row by key (a new row by its id): a range follows its rows when new rows open above them, the data reloads or a value changes. A row that was loading when the corner was set is the row at that place once it comes. |
| `Columns` | A range keeps its columns by field: moved, they stay selected where they go; hidden (by the user or the width), they are left out until they show again. Pinned columns, band headers and virtual columns work as any; a column with `cellSelectable: false` breaks the frame. |
| `Virtual and infinite rows` | Ranges and runs are drawn on the pooled rows only, cell by cell, and never draw a cell’s text again. Rows that load while the rows scroll under a drag are taken in as they come; copying needs every row of the ranges loaded (else: use Export). |
| `Group rows, details` | Group rows, group footers, details and adaptive details are never selected. Dragging over a group row selects the rows shown on each side of it; the rows of a closed group stay as they are. |
| `Selected rows and ranges` | Both can be on: over a selected row a range is drawn whole, with its own text color, so the text keeps its contrast. |

| Next to | How they share the pointer |
| --- | --- |
| `Row drag and drop` | The drag icon (or `handle`) moves the row; without icons the whole row moves it and rows are not selected by dragging. |
| `Editors and clicks` | The threshold separates a click from a drag: a click selects, opens a cell with `startEditAction: 'click'`, a double click edits. The click after a drag is swallowed. |
| `Headers, filter row, group panel, totals` | Presses there are theirs: sort, resize, move, filter, group. |
| `Buttons, links, fields, toggles` | Presses on the action buttons, the master-detail and “…” toggles, links, buttons and fields inside cells are theirs. |
| `Text` | While a drag selects, the browser selects no text. Alt+drag is left to the browser, to select text in the cells. |

## Events and methods

| Member | Gets or returns | What it does |
| --- | --- | --- |
| `cellRanges` | `GridCellRange[]`, read/write, reactive | `{ from, to, fields }`: the cell the range started on, its far corner (`{ field, key, rowIndex }`) and its columns. Assign by key or grid index; `[]` clears. |
| `selectCells(from, to?, add?)` | `boolean` | A range from cell to cell (one cell without `to`), alone or after the others (`add`, with `'multiple'`); whether it shows. |
| `clearCellSelection()` | `void` | No range. |
| `getSelectedCellValues()` | `GridCellValue<T>[]` | The selected cells of the loaded rows, each once, row by row: `{ rowIndex, key, field, value, row }` (unsaved edits included). |
| `cellSelectionSummary` | `GridCellSummary`, reactive | `{ cells, count, numbers, sum, average, min, max }`, as a spreadsheet’s status bar. |
| `onCellSelectionChanging` | `{ ranges, previous, byDrag, cancel }` | Before every change, by the user or code; `cancel` keeps the ranges (while drawing: the last step). |
| `onCellSelectionChanged` | `{ ranges, byDrag }` | After every change: once per cell the pointer reaches while drawing. |
| `onSelectionChanging / onSelectionChanged` | `{ …, byDrag }` | The row selection’s events, once per row a drag reaches; `byDrag` tells it apart. |
| `onCopying` | `{ text, html, rows, ranges, cancel }` | Before a copy; `ranges` are the ranges copied. |

## Keyboard and screen readers

| Key | What it does |
| --- | --- |
| `Shift+Arrows, Shift+Home / End, Shift+PageUp / PageDown (`extendCellsKeys`)` | Extend the last range from its far corner (no range: from the active cell); focus moves with the corner. Ctrl+Shift (⌘+Shift) with the arrows and Home / End go to the edge. |
| `Ctrl+A (`selectAllCellsKeys`)` | Every cell of the rows the user can reach. |
| `Escape (`clearCellSelectionKeys`)` | Clears the ranges; while drawing, gives the drag up (rows: the selection before it comes back). |
| `Arrows, Home, End, PageUp / PageDown` | Move the active cell and clear the ranges, as in a spreadsheet. |
| `Ctrl+C / Ctrl+V / Delete` | Copy the ranges; paste into them (one value fills them all, a block starts at the first cell); empty their cells the user can edit, saved as the save mode says. |
| `Shift+Space (`toggleRowSelectionKeys`), Shift+Up / Down and PageUp / PageDown (`extendRowSelectionKeys`)` | Select rows, as before; while cells are selected, from the check box column. |

With `cellSelection` on, the grid is `aria-multiselectable` and every selectable cell carries `aria-selected`. What a drag or a key selected is said politely: “4 rows selected”, “3 × 5 cells selected”, “12 cells selected in 2 ranges” (`gridRowsSelected`, `gridCellsSelected`, `gridCellRangesSelected`, in English and Turkish).

## Tokens

| Token | What it sets |
| --- | --- |
| `datagrid.range-fill, range-fill-opacity` | The fill of the cells of a range, laid over the row’s own look at that opacity; whole over a selected row. |
| `datagrid.cell (`range-selected`, `range-anchor`)` | The text of a range over a selected row, and of the anchor cell. |
| `datagrid.range-border-color, range-border-width` | The frame around a range. |
| `datagrid.range-anchor-fill` | The cell the last range started on (the language’s surface). |
| `datagrid.row-run-border-color, row-run-border-width` | The frame around the rows a drag selects, while it runs. |

## Example files

`DragSelectRows.tsx`

```tsx
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
```

`orders.ts`

```tsx
import type { GridColumn } from '@motifx-community/ui';
import type { Order } from './order';

const CUSTOMERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Cahit Arf', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'İlhan Koman', 'Margaret Hamilton'];
const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];
const STATUSES = ['Draft', 'Approved', 'Shipped', 'Delivered', 'Cancelled'];
const NOTES = ['', 'Leave at the door', 'Call before delivery', 'Gift wrap, please, with a card that says happy birthday', '', 'Fragile'];

/** `n` made-up orders, the same ones every time. */
export function makeOrders(n: number): Order[] {
  const day = Date.UTC(2026, 0, 1);
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
    city: CITIES[(i * 3) % CITIES.length],
    date: new Date(day + ((i * 37) % 300) * 86_400_000).toISOString().slice(0, 10),
    status: STATUSES[i % STATUSES.length],
    paid: i % 3 === 0,
    amount: ((i * 7919) % 100_000) / 100,
    note: NOTES[i % NOTES.length],
  }));
}

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The order columns: the number pinned to the start, the amount to the end. */
export const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80, sticky: 'start', editable: false },
  { field: 'customer', title: 'Customer', width: 180, flex: 1, required: true },
  { field: 'city', title: 'City', type: 'list', width: 120, options: CITIES },
  { field: 'date', title: 'Date', type: 'date', width: 130, editable: false, creatable: true },
  { field: 'status', title: 'Status', type: 'list', width: 120, options: STATUSES, required: true },
  { field: 'paid', title: 'Paid', type: 'boolean', width: 80 },
  { field: 'note', title: 'Note', width: 200 },
  {
    field: 'amount',
    title: 'Amount',
    type: 'number',
    width: 120,
    sticky: 'end',
    required: true,
    validate: (v) => (typeof v === 'number' && v < 0 ? 'The amount cannot be negative.' : null),
    format: (v) => (typeof v === 'number' ? money.format(v) : ''),
  },
];

/** The same columns with a filter cell and a header filter on most of them. */
export const filterColumns: GridColumn<Order>[] = columns.map((c) => ({ ...c, filterRow: c.field !== 'note', headerFilter: c.field !== 'note' && c.field !== 'id' }));

const today = () => new Date().toISOString().slice(0, 10);

/** What a new order starts with. */
export const newOrder = () => ({ date: today(), status: 'Draft', paid: false });
```

`order.ts`

```tsx
/** An order, as the examples' made-up server keeps it. */
export interface Order {
  id: number;
  customer: string;
  city: string;
  date: string;
  status: string;
  paid: boolean;
  amount: number;
  note: string;
}
```

`CellRanges.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack, type GridCellSelectionChangedEventArgs } from '@motifx-community/ui';
import { columns, makeOrders } from './orders';

const MODES = ['none', 'single', 'multiple'] as const;

/** Ranges of cells as in a spreadsheet: drawn, extended, copied, filled and emptied; the bar sums them up. */
export default function CellRanges() {
  const s = reactive({ mode: 'multiple' as (typeof MODES)[number], drag: true, summary: true, touch: false, note: false, last: '' });
  const told = (e: GridCellSelectionChangedEventArgs) =>
    (s.last = e.ranges.map((r) => `${r.from.key ?? r.from.rowIndex}.${r.from.field} → ${r.to.key ?? r.to.rowIndex}.${r.to.field}`).join(', ') + (e.byDrag ? ' (drawing)' : ''));

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Cell selection">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
        <CheckBox label="Draw by dragging" x-model={() => s.drag} />
        <CheckBox label="Summary in the bar" x-model={() => s.summary} />
        <CheckBox label="Long press on touch" x-model={() => s.touch} />
        <CheckBox label="Note can be selected" x-model={() => s.note} />
      </Stack>
      <DataGrid
        class="dg-cell-ranges"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={columns.map((c) => (c.field === 'note' ? { ...c, cellSelectable: () => s.note } : c))}
        label="Orders as a sheet"
        locale="en"
        settings={{
          editable: true,
          cellSelection: () => s.mode,
          cellDragSelection: () => s.drag,
          cellSummary: () => s.summary,
          dragSelectionTouch: () => (s.touch ? 'longPress' : 'scroll'),
        }}
        onCellSelectionChanged={told}
      />
      <output class="dg-cell-ranges-state">{() => s.last}</output>
    </>
  );
}
```
