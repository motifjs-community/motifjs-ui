import { reactive } from '@motifx/core';
import { CheckBox } from '@motifx-community/ui';

/** Unchecked, checked and indeterminate, and a box the user takes through all three. */
export default function States() {
  const s = reactive({ mixed: null as boolean | null, three: false as boolean | null });
  return (
    <>
      <CheckBox label="Unchecked" value={false} />
      <CheckBox label="Checked" value={true} />
      <CheckBox label="Indeterminate" x-model={() => s.mixed} />
      <CheckBox label="Three st&ates" threeState x-model={() => s.three} />
      <output class="cb-three">{() => `value: ${String(s.three)}`}</output>
    </>
  );
}
