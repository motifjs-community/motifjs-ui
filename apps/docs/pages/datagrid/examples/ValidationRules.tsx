import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack, type GridColumn, type GridSettings } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders, newOrder } from './orders';

const MODES: GridSettings['editMode'][] = ['row', 'form', 'popup'];

/** A pretend server: half a second to answer whether a customer may order. */
function customerAllowed(name: string): Promise<{ isValid: boolean; message?: string }> {
  return new Promise((done) => setTimeout(() => done(/test/i.test(name) ? { isValid: false, message: 'The server does not take test customers.' } : { isValid: true }), 500));
}

/** the standard rule set on the columns, checked as values are written and before a row is saved. */
const ruleColumns: GridColumn<Order>[] = columns.map((c) => {
  if (c.field === 'customer') {
    return {
      ...c,
      required: false,
      validationRules: [
        { type: 'required' },
        { type: 'stringLength', min: 3, max: 40 },
        { type: 'async', validationCallback: ({ value }) => customerAllowed(String(value)) },
      ],
    };
  }
  if (c.field === 'amount') return { ...c, validate: undefined, validationRules: [{ type: 'range', min: 1, max: 5000, message: 'An order is between 1 and 5,000.' }] };
  if (c.field === 'note') return { ...c, validationRules: [{ type: 'stringLength', max: 60 }, { type: 'pattern', pattern: /^[^<>]*$/, message: 'No angle brackets.' }] };
  return c;
});

/** Rules on the cells, a check of the whole row, and the messages in the cells, the form or the window. */
export default function ValidationRules() {
  const s = reactive({ mode: 'row' as GridSettings['editMode'] });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Edit mode">
        {MODES.map((mode) => (
          <Button key={mode} text={mode} size="sm" variant={() => (s.mode === mode ? 'solid' : 'ghost')} aria-pressed={() => s.mode === mode} onclick={() => (s.mode = mode)} />
        ))}
      </Stack>
      <DataGrid
        class="dg-rules"
        style="block-size: 28rem"
        rows={makeOrders(20)}
        rowKey="id"
        columns={ruleColumns}
        label="Orders with rules"
        locale="en"
        settings={{ editable: true, addRows: true, editMode: () => s.mode }}
        newRow={{ create: newOrder }}
        onRowValidating={(e) => {
          if (e.row.status === 'Cancelled' && e.row.paid) e.errors.paid = 'A cancelled order is not paid.';
        }}
      />
    </>
  );
}
