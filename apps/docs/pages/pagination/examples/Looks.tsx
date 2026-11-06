import { Pagination, Stack } from '@motifx-community/ui';

/** The compact layout, adaptive in a narrow box (drag its corner), more neighbors, and page buttons only. */
export default function Looks() {
  return (
    <Stack gap="lg">
      <Pagination label="Compact" mode="compact" total={500} pageSizes={[20, 50]} pageSize={20} page={4} />
      <div style="resize: horizontal; overflow: hidden; inline-size: 26rem; min-inline-size: 22rem; max-inline-size: 100%">
        <Pagination label="Adaptive" total={500} pageSizes={[20, 50]} pageSize={20} page={4} showInfo={false} />
      </div>
      <Pagination label="Two each side" mode="full" neighbors={2} total={1000} page={10} showInfo={false} />
      <Pagination label="Pages only" mode="full" pageCount={7} page={2} showInfo={false} showNavigation={false} />
    </Stack>
  );
}
