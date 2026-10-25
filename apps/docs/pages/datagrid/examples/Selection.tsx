import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridAction, type GridSelection } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const MODES = ['none', 'single', 'multiple'] as const;

const describe = (sel: GridSelection | undefined) =>
  !sel ? '' : sel.all ? `all but ${sel.except.length} (${sel.except.slice(0, 5).join(', ')})` : `${sel.keys.length} picked (${sel.keys.slice(0, 5).join(', ')})`;

/** Single and multiple selection; over 100,000 rows on a server "all" is a state, never the rows. */
export default function Selection() {
  const s = reactive({ mode: 'multiple' as 'none' | 'single' | 'multiple', selection: undefined as GridSelection | undefined, note: '' });
  // The server groups, so "all but these keys" goes to it as a filter.
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  let grid: DataGrid<Order> | null = null;
  let server: DataGrid<Order> | null = null;

  const print: GridAction<Order> = { id: 'print', text: 'Print', onclick: (row) => (s.note = `Order ${row.id} sent to the printer`) };
  const mail: GridAction<Order> = { id: 'mail', text: 'Mail the customer', disabled: (row) => !row.paid, onclick: (row) => (s.note = `Mail to ${row.customer}`) };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-selection"
        style="block-size: 28rem"
        rows={makeOrders(40)}
        rowKey="id"
        columns={columns}
        label="Orders to select"
        locale="en"
        settings={{ selection: () => s.mode }}
        onSelectionChanged={(e) => (s.selection = e.selection)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-selection-state">{() => `${(grid?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(s.selection)}`}</output>
      <DataGrid
        class="dg-server-selection"
        style="block-size: 28rem"
        dataSource={orders}
        columns={columns}
        label="100,000 orders to select"
        locale="en"
        settings={{ selection: 'multiple' }}
        actions={[print, mail]}
        ref={(g: DataGrid<Order>) => (server = g)}
      />
      <output class="dg-server-selection-state">{() => `${(server?.selectedCount ?? 0).toLocaleString('en')} selected: ${describe(server?.selection)}`}</output>
      <output>{() => s.note}</output>
    </>
  );
}
