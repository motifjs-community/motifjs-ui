import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import { columns, makeOrders, newOrder } from './orders';

const POSITIONS = ['bottom', 'top'] as const;

/** New rows open at the bottom or at the top; Tab on the last cell opens the next one. */
export default function NewRows() {
  const s = reactive({ position: 'bottom' as 'top' | 'bottom' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="New rows">
        {POSITIONS.map((position) => (
          <Button key={position} text={position} size="sm" variant={() => (s.position === position ? 'solid' : 'ghost')} aria-pressed={() => s.position === position} onclick={() => (s.position = position)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-new"
        style="block-size: 28rem"
        rows={makeOrders(12)}
        rowKey="id"
        columns={columns}
        label="New rows"
        locale="en"
        settings={{ editable: true, addRows: true }}
        newRow={{ position: () => s.position, create: newOrder }}
      />
    </>
  );
}
