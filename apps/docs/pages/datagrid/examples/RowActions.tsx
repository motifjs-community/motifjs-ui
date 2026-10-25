import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack, type GridAction } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const PLACES = ['start', 'end'] as const;
const WIDTHS = [100, 140, 260];

/** Buttons per row from a function of the row and its state; the rest go into "more". */
export default function RowActions() {
  const s = reactive({ orders: makeOrders(30), at: 'end' as 'start' | 'end', sticky: true, width: 260, note: '' });

  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    onclick: (row) => {
      row.status = 'Approved';
      s.note = `Order ${row.id} approved`;
    },
  };
  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = `Order ${row.id} sent to the printer`) };
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = `Mail to ${row.customer}`) };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Actions column">
        {PLACES.map((at) => (
          <Button key={at} text={at} size="sm" variant={() => (s.at === at ? 'solid' : 'ghost')} aria-pressed={() => s.at === at} onclick={() => (s.at = at)} />
        ))}
        <CheckBox label="Pinned" x-model={() => s.sticky} />
        {WIDTHS.map((w) => (
          <Button key={`w${w}`} text={`${w}px`} size="sm" variant={() => (s.width === w ? 'solid' : 'ghost')} aria-pressed={() => s.width === w} onclick={() => (s.width = w)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-actions"
        style="block-size: 30rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders with actions"
        locale="en"
        saveMode="batch"
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, 'edit', 'remove', print, mail])}
        settings={{ editable: true, actionsPosition: () => s.at, actionsSticky: () => s.sticky, actionsWidth: () => s.width }}
      />
      <output class="dg-action-note">{() => s.note}</output>
    </>
  );
}
