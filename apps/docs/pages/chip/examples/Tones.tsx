import { Chip, Stack, type ChipTone, type ChipVariant } from '@motifx-community/ui';

const TONES: ChipTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const VARIANTS: ChipVariant[] = ['filled', 'outline'];

/** Every tone in each appearance. */
export default function Tones() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Chip key={tone} text={tone} tone={tone} variant={variant} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
