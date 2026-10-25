import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** Three vertical sliders, as in an equalizer: up is more. */
export default function Vertical() {
  const s = reactive({ bass: 4, mid: 0, treble: -2 });
  return (
    <>
      <Slider label="Bass" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.bass} />
      <Slider label="Mid" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.mid} />
      <Slider label="Treble" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.treble} />
    </>
  );
}
