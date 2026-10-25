import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A toggle button bound two-way with x-model. */
export default function Toggle() {
  const s = reactive({ bold: false });
  return (
    <>
      <Button text="Bold" toggle x-model={() => s.bold} />
      <span>
        bold: <output class="bold-state">{() => String(s.bold)}</output>
      </span>
    </>
  );
}
