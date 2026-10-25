import { reactive } from '@motifx/core';
import { Button, ProgressBar, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The three thicknesses, and a bar with its label beside it and the value in its own words. */
export default function Sizes() {
  const s = reactive({ files: 3 });
  return (
    <>
      {SIZES.map((size) => (
        <ProgressBar key={size} label={`Size ${size}`} size={size} value={60} />
      ))}
      <ProgressBar label="Files" labelPosition="side" max={12} value={() => s.files} showValue valueText={(v) => `${v} of 12`} stretch />
      <Button text="One more file" size="sm" variant="outline" onclick={() => (s.files = s.files >= 12 ? 0 : s.files + 1)} />
    </>
  );
}
