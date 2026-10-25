import { ProgressBar, type ProgressTone } from '@motifx-community/ui';

const TONES: ProgressTone[] = ['accent', 'neutral', 'success', 'caution', 'danger'];

/** A bar in every tone. */
export default function Tones() {
  return (
    <>
      {TONES.map((tone, i) => (
        <ProgressBar key={tone} label={tone} value={20 + i * 18} tone={tone} showValue />
      ))}
    </>
  );
}
