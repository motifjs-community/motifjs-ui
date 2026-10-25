import { reactive } from '@motifx/core';
import { NumberBox } from '@motifx-community/ui';

/** A value brought inside its bounds, and one left as typed for the range check to report. */
export default function MinMaxClamp() {
  const s = reactive({ score: 50 as number | null, age: null as number | null });
  return (
    <>
      <NumberBox label="Score" min={0} max={100} locale="en" x-model={() => s.score} helpText="Try 250." />
      <NumberBox label="Age" min={18} max={120} clamp={false} locale="en" x-model={() => s.age} helpText="Try 12." />
    </>
  );
}
