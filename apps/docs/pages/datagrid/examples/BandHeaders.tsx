import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack, type GridColumnItem } from '@motifx-community/ui';
import type { Order } from './order';
import { makeOrders } from './orders';

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Two levels of bands over the order columns. */
const columns: GridColumnItem<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  {
    name: 'order',
    title: 'Order',
    columns: [
      { field: 'customer', title: 'Customer', width: 170 },
      { field: 'date', title: 'Date', type: 'date', width: 120 },
      {
        name: 'delivery',
        title: 'Delivery',
        columns: [
          { field: 'city', title: 'City', width: 120 },
          { field: 'note', title: 'Note', width: 220 },
        ],
      },
    ],
  },
  {
    name: 'payment',
    title: 'Payment',
    align: 'end',
    columns: [
      { field: 'status', title: 'Status', width: 110 },
      { field: 'paid', title: 'Paid', type: 'boolean', width: 70 },
      { field: 'amount', title: 'Amount', type: 'number', width: 110, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
    ],
  },
];

/** Band headers: drag a column inside its band or a band among its neighbours, pin and hide bands from their menus. */
export default function BandHeaders() {
  const s = reactive({ csv: '', layout: '' });
  let grid: DataGrid<Order> | null = null;
  const showLayout = () => (s.layout = grid ? JSON.stringify(grid.layout.bands) : '');

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Pin “Order”" variant="outline" onclick={() => grid?.columnOption('order', 'sticky', grid.columnOption('order', 'sticky') ? null : 'start')} />
        <Button text="Hide or show “Delivery”" variant="outline" onclick={() => grid?.columnOption('delivery', 'visible', !grid.columnOption('delivery', 'visible'))} />
        <Button text="Columns…" variant="outline" onclick={() => grid?.showColumnChooser()} />
        <Button
          text="CSV header"
          variant="ghost"
          onclick={async () => {
            const csv = (await grid?.exportCsv({ download: false, bom: false, separator: ',' })) ?? '';
            s.csv = csv.split('\r\n').slice(0, 3).join('\n');
          }}
        />
      </Stack>
      <DataGrid
        class="dg-bands"
        style="block-size: 28rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={columns}
        label="Orders under band headers"
        locale="en"
        settings={{ columnChooserButton: true }}
        onLayoutChange={() => showLayout()}
        onContentReady={() => showLayout()}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-bands-layout">{() => `bands: ${s.layout}`}</output>
      <pre class="dg-bands-csv" x-display={() => s.csv !== ''}>
        {() => s.csv}
      </pre>
    </>
  );
}
