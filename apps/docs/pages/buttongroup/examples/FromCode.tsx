import { reactive } from '@motifx/core';
import { ButtonGroup, Stack } from '@motifx-community/ui';

/** One choice bound with `x-model`; a group made with `new` takes the same properties from code. */
export default function FromCode() {
  const s = reactive({ view: 'Week' as unknown });
  const coded = new ButtonGroup({ label: 'Density', items: ['Compact', 'Comfortable'], value: 'Compact' });

  return (
    <Stack gap="lg">
      <ButtonGroup label="View" items={['Day', 'Week', 'Month']} x-model={() => s.view} />
      <span>{() => `View: ${s.view}`}</span>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
