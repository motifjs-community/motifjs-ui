import { Spinner, type ControlSize, type ProgressTone } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const TONES: ProgressTone[] = ['neutral', 'success', 'caution', 'danger'];

/** Spinners in every size, with a label beside or under them, in a container of their own, and in the tones. */
export default function Spinners() {
  return (
    <>
      {SIZES.map((size) => (
        <Spinner key={size} size={size} />
      ))}
      <Spinner label="Loading orders" />
      <Spinner label="Saving" labelPosition="bottom" size="lg" />
      <Spinner label="Syncing" labelPosition="bottom" size="lg" contained />
      {TONES.map((tone) => (
        <Spinner key={tone} tone={tone} size="sm" label={tone} />
      ))}
    </>
  );
}
