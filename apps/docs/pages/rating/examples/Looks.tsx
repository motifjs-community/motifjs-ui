import { Rating, Stack, type ControlSize, type RatingTone } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];
const TONES: RatingTone[] = ['accent', 'neutral'];

/** Halves, each size and tone, and a score only shown (`readOnly`). */
export default function Looks() {
  return (
    <Stack gap="lg">
      <Rating label="By halves" step={0.5} value={3.5} />
      {SIZES.map((size) => (
        <Rating key={size} label={`Size ${size}`} size={size} value={4} />
      ))}
      {TONES.map((tone) => (
        <Rating key={tone} label={`Tone ${tone}`} tone={tone} value={2} />
      ))}
      <Rating label="Shown only" readOnly step={0.5} value={4.5} />
      <Rating label="Disabled" disabled value={3} />
    </Stack>
  );
}
