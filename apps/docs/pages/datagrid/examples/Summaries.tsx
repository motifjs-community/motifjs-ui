import { reactive } from '@motifx/core';
import { CheckBox, DataGrid, Stack, type GridCustomSummaryInfo, type GridSummary } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** Totals under the rows, group summaries in the group rows and footers, and a custom one: paid orders. */
export default function Summaries() {
  const s = reactive({ grouped: true, footers: true, aligned: true, live: false });
  let grid: DataGrid<Order> | null = null;
  // The amount gets room for its totals.
  const byCity = columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: () => (s.grouped ? 0 : undefined) } : c.field === 'amount' ? { ...c, width: 170 } : c));

  // Counts the paid orders: start, then each row, then the result.
  const calculateCustomSummary = (e: GridCustomSummaryInfo<Order>) => {
    if (e.summaryProcess === 'start') e.totalValue = 0;
    else if (e.summaryProcess === 'calculate' && (e.value as Order).paid) e.totalValue = (e.totalValue as number) + 1;
  };

  const summary: GridSummary<Order> = {
    recalculateWhileEditing: () => s.live,
    totalItems: [
      { column: 'id', summaryType: 'count', showInColumn: 'customer' },
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', displayFormat: '{0} paid' },
      { column: 'date', summaryType: 'max', displayFormat: 'Last: {0}' },
      { name: 'total', column: 'amount', summaryType: 'sum' },
      { column: 'amount', summaryType: 'avg', valueFormat: { maximumFractionDigits: 0 } },
    ],
    groupItems: [
      { column: 'amount', summaryType: 'sum', alignByColumn: () => s.aligned },
      { column: 'amount', summaryType: 'max', showInGroupFooter: true, visible: () => s.footers },
      { name: 'paid', summaryType: 'custom', showInColumn: 'paid', showInGroupFooter: true, displayFormat: '{0} paid', visible: () => s.footers },
    ],
    calculateCustomSummary,
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="Group by city" x-model={() => s.grouped} />
        <CheckBox label="Group footers" x-model={() => s.footers} />
        <CheckBox label="Sum under its column in the group row" x-model={() => s.aligned} />
        <CheckBox label="Follow unsaved edits" x-model={() => s.live} />
      </Stack>
      <DataGrid
        class="dg-summaries"
        style="block-size: 24rem"
        rows={makeOrders(300)}
        rowKey="id"
        columns={byCity}
        label="Orders with totals"
        locale="en"
        saveMode="batch"
        summary={summary}
        settings={{ editable: true, filterRow: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-summaries-total">{() => `The amounts add up to ${Number(grid?.getTotalSummaryValue('total') ?? 0).toLocaleString('en', { maximumFractionDigits: 2 })}`}</output>
    </>
  );
}
