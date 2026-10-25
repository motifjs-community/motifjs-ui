import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Ctrl+C and Ctrl+V as tab-separated text, and the same from code. */
export default function Clipboard() {
  const s = reactive({ raw: false, headers: false, newRows: false, copied: '' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Values, not the shown text" x-model={() => s.raw} />
        <CheckBox label="Column titles" x-model={() => s.headers} />
        <CheckBox label="New rows from extra lines" x-model={() => s.newRows} />
      </Stack>
      <DataGrid
        class="dg-clipboard"
        style="block-size: 28rem"
        rows={makeOrders(20)}
        rowKey="id"
        columns={columns}
        label="Orders to copy"
        locale="en"
        saveMode="batch"
        settings={{
          editable: true,
          addRows: true,
          selection: 'multiple',
          copyValues: () => (s.raw ? 'raw' : 'shown'),
          copyHeaders: () => s.headers,
          pasteNewRows: () => s.newRows,
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Copy from code" variant="outline" onclick={() => (s.copied = grid?.copy() ?? '')} />
        <Button text="Paste two lines at the active cell" variant="outline" onclick={() => grid?.paste('Ada Lovelace\tİzmir\nGrace Hopper\tAnkara')} />
        <output class="dg-copied">{() => (s.copied ? `Copied: ${s.copied.replace(/\t/g, ' → ').replace(/\r?\n/g, ' ¶ ')}` : '')}</output>
      </Stack>
    </>
  );
}
