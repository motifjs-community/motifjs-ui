import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

/** Columns added, removed and changed at runtime, while the layout, sort and filters stay in sync. */
export default function RuntimeColumns() {
  const s = reactive({ paid: false, city: true, fields: '' });
  let grid: DataGrid<Order> | null = null;
  const show = () => (s.fields = grid ? `${grid.columnCount()} columns, shown: ${grid.getVisibleColumns().map((c) => c.field).join(', ')}` : '');

  const togglePaid = () => {
    if (!grid) return;
    if (s.paid) grid.deleteColumn('paid');
    else grid.addColumn({ field: 'paid', title: 'Paid', type: 'boolean', width: 80, headerFilter: true }, 2);
    s.paid = !s.paid;
  };
  const toggleCity = () => {
    if (!grid) return;
    if (s.city) grid.deleteColumn('city');
    else grid.addColumn(filterColumns.find((c) => c.field === 'city')!, 2);
    s.city = !s.city;
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (s.paid ? 'Take “Paid” out' : 'Add “Paid” after Customer')} variant="outline" onclick={togglePaid} />
        <Button text={() => (s.city ? 'Take “City” out' : 'Put “City” back')} variant="outline" onclick={toggleCity} />
        <Button text="Amount in euros" variant="outline" onclick={() => grid?.columnOption('amount', { title: 'Amount (€)', format: (v: unknown) => (typeof v === 'number' ? euros.format(v) : '') })} />
        <Button text="Hide or show “Note”" variant="ghost" onclick={() => grid?.columnOption('note', 'visible', !grid.columnOption('note', 'visible'))} />
      </Stack>
      <DataGrid
        class="dg-runtime-columns"
        style="block-size: 28rem"
        rows={makeOrders(60)}
        rowKey="id"
        columns={filterColumns.filter((c) => c.field !== 'paid')}
        label="Orders with columns that change"
        locale="en"
        onOptionChanged={() => show()}
        onContentReady={() => show()}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-runtime-fields">{() => s.fields}</output>
    </>
  );
}
