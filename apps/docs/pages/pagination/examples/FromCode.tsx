import { reactive } from '@motifx/core';
import { Pagination, Stack } from '@motifx-community/ui';

/** The page bound with `x-model`, the sizes to choose from; one made with `new` from code. */
export default function FromCode() {
  const s = reactive({ page: 3, size: 25 });
  const coded = new Pagination({ label: 'Pages made in code', total: 40, pageSize: 10, mode: 'full', showInfo: false });

  return (
    <Stack gap="lg">
      <Pagination
        label="Orders"
        total={1234}
        pageSizes={[10, 25, 50, 0]}
        pageSize={() => s.size}
        x-model={() => s.page}
        onPageChanged={(e) => e.byUser && (s.size = e.pageSize)}
      />
      <span>{() => `Page ${s.page}, ${s.size || 'all'} per page`}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
