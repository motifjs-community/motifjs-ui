import { Breadcrumb, Stack } from '@motifx-community/ui';

const PATH = ['Workspace', 'Projects', 'Kit', 'Components', 'Navigation', 'Breadcrumb', 'Examples', 'Overflow'];

/** Steps that do not fit go into the menu after the first; drag the box's corner to see it. `maxItems` caps the count. */
export default function Overflow() {
  return (
    <Stack gap="lg">
      <div style="resize: horizontal; overflow: hidden; inline-size: 22rem; min-inline-size: 10rem; max-inline-size: 100%; padding-block: 0.25rem">
        <Breadcrumb label="Path that fits" items={PATH} />
      </div>
      <Breadcrumb label="Path of three" items={PATH} maxItems={3} />
    </Stack>
  );
}
