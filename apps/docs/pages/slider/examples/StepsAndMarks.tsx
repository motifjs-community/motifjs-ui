import { reactive } from '@motifx/core';
import { Slider } from '@motifx-community/ui';

/** Steps, a mark at every step or in equal parts, and formatted labels under them. */
export default function StepsAndMarks() {
  const s = reactive({ zoom: 100, rating: 6 });
  return (
    <>
      <Slider label="Zoom" min={25} max={200} step={25} ticks tickLabels format={{ style: 'unit', unit: 'percent' }} x-model={() => s.zoom} />
      <Slider label="Rating" max={10} ticks={5} tickLabels x-model={() => s.rating} />
      <Slider label="Opacity" max={1} step={0} value={0.5} tickLabels showValue="drag" format={{ style: 'percent' }} />
    </>
  );
}
