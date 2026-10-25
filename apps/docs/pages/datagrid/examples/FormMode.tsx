import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';
import type { Order } from './order';
import { OrderService } from './order-service';
import { columns, makeOrders, newOrder } from './orders';

const MODES: GridSettings['editMode'][] = ['row', 'cell', 'batch', 'form', 'popup'];

/** The note gets the whole width of the form and a line of help. */
const formColumns: GridColumn<Order>[] = columns.map((c) => (c.field === 'note' ? { ...c, formItem: { colSpan: 'all', helpText: 'Shown to the courier.' } } : c));

/** One grid in every edit mode; in 'form' the row opens as a form with two groups. */
export default function FormMode() {
  const s = reactive({ mode: 'form' as GridSettings['editMode'] });
  const service = new OrderService({ data: makeOrders(40), key: 'id', createKey: (_values, rows) => rows.length + 1 }, 300);
  const orders = new data.DataSource<Order, number>({ adapter: service, loadMode: 'all' });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-form"
        style="block-size: 30rem"
        dataSource={orders}
        columns={formColumns}
        label="Orders in an edit form"
        locale="en"
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}
        newRow={{ create: newOrder }}
        actions={['edit', 'remove']}
        form={{
          colCount: 2,
          items: [
            { group: 'Order', items: [{ field: 'customer' }, { field: 'date' }, { field: 'status' }, { field: 'amount' }] },
            { group: 'Delivery', items: [{ field: 'city' }, { field: 'paid' }, { field: 'note' }] },
          ],
        }}
      />
    </>
  );
}
