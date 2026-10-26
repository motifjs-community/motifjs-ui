import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** The filter row and the header filter, on rows in memory. */
export default function Filters() {
  let grid: DataGrid<Order> | null = null;

  const setFilters = () => {
    if (grid) grid.filters = { city: { values: ['Ankara', 'İzmir'] }, amount: { op: 'between', value: 100, value2: 500 } };
  };

  return (
    <>
      <DataGrid
        class="dg-filters"
        style="block-size: 30rem"
        rows={makeOrders(200)}
        rowKey="id"
        columns={filterColumns}
        label="Orders to filter"
        locale="en"
        settings={{ striped: true }}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Ankara and İzmir, 100 to 500" variant="outline" onclick={setFilters} />
        <Button text="Clear the filters" variant="ghost" onclick={() => grid?.clearFilters()} />
        <output class="dg-filter-count">{() => `${grid?.total ?? 0} of 200 orders`}</output>
      </Stack>
    </>
  );
}
