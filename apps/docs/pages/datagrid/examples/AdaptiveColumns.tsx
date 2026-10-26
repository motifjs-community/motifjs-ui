import { createSignal, reactive } from '@motifx/core';
import { Button, DataGrid, Panel, SplitContainer, Stack, type GridColumn, type SplitPosition } from '@motifx-community/ui';
import type { Order } from './order';
import { makeOrders } from './orders';

const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The columns hide in this order as the grid gets narrower: the note first, the customer never. */
const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 60, editable: false },
  { field: 'customer', title: 'Customer', width: 140 },
  { field: 'city', title: 'City', width: 100, hidingPriority: 3 },
  { field: 'date', title: 'Date', type: 'date', width: 110, hidingPriority: 2, editable: false },
  { field: 'status', title: 'Status', width: 100, hidingPriority: 4 },
  { field: 'note', title: 'Note', width: 180, hidingPriority: 0 },
  { field: 'amount', title: 'Amount', type: 'number', width: 100, hidingPriority: 1, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
];

/** Adaptive columns: drag the splitter (or use the buttons) to make the grid narrower; the "…" opens a row's hidden values. */
export default function AdaptiveColumns() {
  const s = reactive({ width: '70%' as SplitPosition });
  const grid = createSignal<DataGrid<Order> | null>(null);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Narrow" variant="outline" onclick={() => (s.width = 420)} />
        <Button text="Medium" variant="outline" onclick={() => (s.width = 640)} />
        <Button text="Wide" variant="outline" onclick={() => (s.width = '100%')} />
        <Button text="Open row 3" variant="ghost" onclick={() => grid.value?.expandAdaptiveDetailRow(3)} />
        <output class="dg-adaptive-hidden">{() => `hidden: ${grid.value?.adaptiveHiddenColumns.join(', ') || 'none'}`}</output>
      </Stack>
      <SplitContainer class="dg-adaptive-split" x-model={() => s.width} firstMinSize={240} secondMinSize={0} collapsible={false} style="block-size: 30rem; inline-size: 100%">
        <DataGrid
          class="dg-adaptive"
          style="block-size: 100%"
          rows={makeOrders(300)}
          rowKey="id"
          columns={columns}
          label="Orders that adapt to their width"
          locale="en"
          settings={{ editable: true }}
          saveMode="batch"
          ref={(g: DataGrid<Order>) => (grid.value = g)}
        />
        <Panel text="Room" padding="sm">
          <p>The space the grid gives up.</p>
        </Panel>
      </SplitContainer>
    </>
  );
}
