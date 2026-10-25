import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** A value that follows the thumb, next to one that changes only when the thumb is let go. */
export default function UpdateOn() {
  const s = reactive({ live: 50, committed: 50 });
  return (
    <>
      <Slider label="Live" showValue="drag" x-model={() => s.live} />
      <output class="sl-live">{() => `live: ${s.live}`}</output>
      <Slider label="On release" updateOn="change" showValue="drag" x-model={() => s.committed} />
      <output class="sl-committed">{() => `on release: ${s.committed}`}</output>
    </>
  );
}
