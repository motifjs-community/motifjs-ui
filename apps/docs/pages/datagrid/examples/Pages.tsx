import { DataGrid } from '@motifx-community/ui';
import { columns, makeOrders } from './orders';
import { pagedLoads, pagedOrders } from './paged-orders';

/** A server that loads by page makes a paged grid; rows in memory page with `mode="paged"`. */
export default function Pages() {
  return (
    <>
      <DataGrid class="dg-paged" style="block-size: 34rem" dataSource={pagedOrders} columns={columns} label="Orders by page" locale="en" />
      <output class="dg-paged-loads">{() => `${pagedLoads.count} loads`}</output>
      <DataGrid style="block-size: 34rem" rows={makeOrders(100)} rowKey="id" mode="paged" pageSize={20} columns={columns} label="Orders in memory by page" locale="en" />
    </>
  );
}
