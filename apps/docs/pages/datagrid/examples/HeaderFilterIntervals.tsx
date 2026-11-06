import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, Stack, type GridColumn } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

const COAST = ['Antalya', 'İstanbul', 'İzmir', 'Trabzon'];

/** The order columns with header filters: amounts in ranges, dates in a tree, cities with custom entries, and excluded statuses. */
const intervalColumns: GridColumn<Order>[] = columns.map((c) => {
  switch (c.field) {
    case 'amount':
      // "0 – 250", "250 – 500" …
      return { ...c, headerFilter: true, headerFilterInterval: 250 };
    case 'date':
      // Year → month → day, by the grid's headerFilterDateInterval.
      return { ...c, headerFilter: true };
    case 'city':
      return {
        ...c,
        headerFilter: true,
        headerFilterItems: [
          { text: 'On the coast', value: data.where('city', 'in', COAST) },
          { text: 'Inland', value: data.not(data.where('city', 'in', COAST)) },
          { text: 'Ankara only', value: 'Ankara' },
        ],
      };
    case 'status':
      // Every status except Cancelled, so statuses added later also appear.
      return { ...c, headerFilter: true, filterValues: ['Cancelled'], filterType: 'exclude' };
    default:
      return c;
  }
});

/** The header filter with ranges of amounts, a tree of dates, custom entries and excluded values. */
export default function HeaderFilterIntervals() {
  const s = reactive({ months: false });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => (s.months ? 'Dates down to the day' : 'Dates down to the month')} variant="outline" onclick={() => (s.months = !s.months)} />
        <Button text="Amounts in ranges of 1,000" variant="outline" onclick={() => grid?.columnOption('amount', 'headerFilterInterval', 1000)} />
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />
      </Stack>
      <DataGrid
        class="dg-intervals"
        style="block-size: 30rem"
        rows={makeOrders(300)}
        rowKey="id"
        columns={intervalColumns}
        label="Orders filtered by ranges and dates"
        locale="en"
        settings={{ headerFilterDateInterval: () => (s.months ? 'month' : 'day') }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-intervals-filter">{() => `${grid?.total ?? 0} orders · ${JSON.stringify(grid?.filters ?? {})}`}</output>
    </>
  );
}
