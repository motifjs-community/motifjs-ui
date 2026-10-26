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
