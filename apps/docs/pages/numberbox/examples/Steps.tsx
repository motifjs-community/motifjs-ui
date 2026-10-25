import { reactive } from '@motifx/core';
import { NumberBox } from '@motifx-community/ui';

const show = (value: number | null) => (value === null ? 'null' : String(value));

/** A step of 0.1 without float noise, and the mouse wheel stepping while the field has focus. */
export default function Steps() {
  const s = reactive({ rate: 0.1 as number | null });
  return (
    <>
      <NumberBox label="Rate" step={0.1} min={0} max={5} wheel locale="en" x-model={() => s.rate} />
      <output class="nb-rate">{() => `value: ${show(s.rate)}`}</output>
    </>
  );
}
