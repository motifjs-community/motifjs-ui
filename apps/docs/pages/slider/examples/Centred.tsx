import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** A value on either side of a middle: the active part runs from the origin to the thumb. */
export default function Centred() {
  const s = reactive({ balance: -30 });
  return (
    <>
      <Slider label="Balance" min={-100} max={100} origin={0} showValue="drag" x-model={() => s.balance} />
      <output class="sl-balance">{() => `balance: ${s.balance}`}</output>
    </>
  );
}
