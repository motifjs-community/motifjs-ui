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
