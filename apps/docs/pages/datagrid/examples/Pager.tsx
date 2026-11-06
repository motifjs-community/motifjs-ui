import { reactive } from '@motifx/core';
import { Button, DataGrid, Stack } from '@motifx-community/ui';
import type { Order } from './order';
import { columns, makeOrders } from './orders';

/** The page sizes, the information text, and the full, compact and adaptive pager layouts. */
export default function Pager() {
  const s = reactive({ look: 'adaptive' as 'adaptive' | 'compact' | 'full', told: '' });
  let grid: DataGrid<Order> | null = null;

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Full" variant={() => (s.look === 'full' ? 'solid' : 'outline')} onclick={() => (s.look = 'full')} />
        <Button text="Compact" variant={() => (s.look === 'compact' ? 'solid' : 'outline')} onclick={() => (s.look = 'compact')} />
        <Button text="Adaptive" variant={() => (s.look === 'adaptive' ? 'solid' : 'outline')} onclick={() => (s.look = 'adaptive')} />
        <Button text="50 rows a page" variant="ghost" onclick={() => grid?.pageSize(50)} />
        <output class="dg-pager-state">{() => s.told}</output>
      </Stack>
      <DataGrid
        class="dg-pager"
        style="block-size: 30rem"
        rows={makeOrders(1000)}
        rowKey="id"
        mode="paged"
        pageSize={20}
        columns={columns}
        label="Orders in pages of a size you choose"
        locale="en"
        settings={{
          pageSizeSelector: true,
          allowedPageSizes: [10, 20, 50, 'all'],
          pagerDisplayMode: () => s.look,
        }}
        onPageSizeChanged={(e) => (s.told = `${e.pageSize || 'All'} rows a page (was ${e.previous || 'all'})`)}
        ref={(g: DataGrid<Order>) => (grid = g)}
      />
    </>
  );
}
