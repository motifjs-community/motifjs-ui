import { reactive } from '@motifx/core';
import { Button, CheckBox, DataGrid, Stack, type GridAction, type GridActionLocation } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const LOCATIONS: GridActionLocation[] = ['row', 'toolbar', 'bottom'];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The actions of the selected rows in the toolbar or the bottom bar; several rows share the ones they all have. */
export default function BarActions() {
  const s = reactive({ orders: makeOrders(40), location: 'toolbar' as GridActionLocation, menu: false, note: '' });
  let grid: DataGrid<Order> | null = null;
  // The grid reads the rows as they are, so after a change in place it redraws them and re-reads their actions.
  const changed = (rows: readonly Order[]) => {
    grid?.repaintRows(rows.map((row) => row.id));
    grid?.refreshActions();
  };

  const approve: GridAction<Order> = {
    id: 'approve',
    text: 'Approve',
    tone: 'accent',
    visible: (row) => row.status === 'Draft',
    // Once for every selected row: one request to the server.
    onclickMany: async (rows) => {
      await wait(300);
      for (const row of rows) row.status = 'Approved';
      changed(rows);
      s.note = `${rows.length} orders approved`;
    },
    onclick: (row) => {
      row.status = 'Approved';
      changed([row]);
      s.note = `Order ${row.id} approved`;
    },
  };
  // Row by row: the grid shows the progress and a Stop button.
  const print: GridAction<Order> = {
    id: 'print',
    text: 'Print',
    onclick: async (row) => {
      await wait(400);
      s.note = `Order ${row.id} printed`;
    },
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Where the actions show">
        {LOCATIONS.map((at) => (
          <Button key={at} text={at} size="sm" variant={() => (s.location === at ? 'solid' : 'ghost')} aria-pressed={() => s.location === at} onclick={() => (s.location = at)} />
        ))}
        <CheckBox label="Menu only" x-model={() => s.menu} />
      </Stack>
      <DataGrid
        class="dg-bar-actions"
        style="block-size: 28rem"
        rows={() => s.orders}
        rowKey="id"
        columns={columns}
        label="Orders to approve"
        locale="en"
        saveMode="batch"
        actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [approve, print, 'remove'])}
        settings={{ selection: 'multiple', actionsLocation: () => s.location, actionsDisplay: () => (s.menu ? 'menu' : 'auto') }}
        onActionRan={(e) => {
          if (e.canceled) s.note = `${e.action.id}: stopped after ${e.done} rows`;
        }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-bar-note">{() => s.note}</output>
    </>
  );
}
