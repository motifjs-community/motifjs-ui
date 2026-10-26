import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, DataGrid, RadioGroup, Stack, Switch } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import type { Order } from './order';
import { filterColumns, makeOrders } from './orders';

/** The filter panel and its builder, on 100,000 orders of a server or 200 in memory, the filter row and header filters kept in step. */
export default function FilterPanel() {
  const orders = new data.DataSource<Order, number>({ adapter: new SlowAdapter<Order, number>({ data: makeOrders(100_000), key: 'id' }, 200), loadMode: 'blocks', pageSize: 100 });
  const rows = makeOrders(200);
  const s = reactive({ where: 'server', sync: true, filter: null as data.FilterExpression | null });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <RadioGroup
          label="Rows"
          orientation="horizontal"
          items={[
            { value: 'server', text: '100,000 on a server' },
            { value: 'memory', text: '200 in memory' },
          ]}
          x-model={() => s.where}
        />
        <Switch label="filterSyncEnabled" x-model={() => s.sync} />
        <Button text="Open the builder" variant="outline" onclick={() => grid?.openFilterBuilder()} />
        <Button
          text="Paid, over 900"
          variant="ghost"
          onclick={() => (s.filter = data.and(data.where('paid', '=', true), data.where('amount', '>', 900)))}
        />
      </Stack>
      <DataGrid
        class="dg-server-filters"
        style="block-size: 30rem"
        dataSource={() => (s.where === 'server' ? orders : null)}
        rows={rows}
        rowKey="id"
        columns={filterColumns}
        label="Orders with a filter panel"
        locale="en"
        settings={{ filterPanel: true, filterSyncEnabled: () => s.sync }}
        filterValue={() => s.filter}
        filterBuilder={{ maxGroupLevel: 2 }}
        filterBuilderPopup={{ title: 'Filter the orders' }}
        onFilterChanged={(e) => (s.filter = e.filterValue)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
      <output class="dg-server-filter">{() => `${(grid?.total ?? 0).toLocaleString('en')} orders · ${JSON.stringify(grid?.filter ?? null)}`}</output>
      <output class="dg-filter-value">{() => `filterValue: ${JSON.stringify(s.filter)}`}</output>
    </>
  );
}
