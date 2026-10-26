import { DataGrid } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** 2,000 orders in memory, grouped by city: the group rows and the rows show 100 places at a time. */
export default function InfiniteGroups() {
  return (
    <DataGrid
      class="dg-infinite-groups"
      style="block-size: 28rem"
      mode="infinite"
      pageSize={100}
      rows={makeOrders(2_000)}
      rowKey="id"
      columns={columns.map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c))}
      label="Orders by city, part by part"
      locale="en"
      settings={{ groupPanel: true, selection: 'multiple' }}
      summary={{ groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }] }}
      masterDetail={{ enabled: true, template: (ctx) => <p class="dg-infinite-detail">{() => `${(ctx.row as Order).customer} · ${(ctx.row as Order).note || 'no note'}`}</p> }}
    />
  );
}
