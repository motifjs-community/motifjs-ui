import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, NumberBox, Stack } from '@motifx-community/ui';
import type { GridColumnItem } from '@motifx-community/ui';

type Reading = { id: number };

const SENSORS = 200;

/** 200 sensors in bands of 20, with each reading calculated from the row, so no row holds 200 values. */
const columns: GridColumnItem<Reading>[] = [
  { field: 'id', title: 'Hour', type: 'number', width: 90, sticky: 'start' },
  ...Array.from({ length: SENSORS / 20 }, (_, b) => ({
    title: `Sensors ${b * 20 + 1}–${b * 20 + 20}`,
    columns: Array.from({ length: 20 }, (_, k) => {
      const n = b * 20 + k;
      return { field: `s${n}`, title: `S${n + 1}`, type: 'number' as const, width: 90, value: (r: Reading) => ((r.id * (n + 7)) % 1000) / 10 };
    }),
  })),
  { field: 'total', title: 'Sum', type: 'number', width: 100, sticky: 'end', value: (r: Reading) => (r.id * 31) % 100_000 },
];

const rows: Reading[] = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1 }));

/** 100,000 rows × 200 columns: only the columns in view (and two on each side) get cells. */
export default function VirtualColumns() {
  const s = reactive({ virtual: true, extra: 2 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Virtual columns" x-model={() => s.virtual} />
        <NumberBox label="Extra columns" labelMode="side" min={0} max={20} x-model={() => s.extra} />
      </Stack>
      <DataGrid
        class="dg-columns"
        style="block-size: 30rem"
        rows={rows}
        rowKey="id"
        columns={columns}
        label="Sensor readings"
        locale="en"
        settings={{ columnRenderingMode: () => (s.virtual ? 'virtual' : 'standard'), extraColumns: () => s.extra ?? 0, filterRow: true }}
      />
    </>
  );
}
