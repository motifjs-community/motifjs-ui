import { Badge, Stack, type BadgeTone, type BadgeVariant } from '@motifx-community/ui';

const TONES: BadgeTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const VARIANTS: BadgeVariant[] = ['solid', 'subtle', 'outline'];

/** Every tone in each appearance. */
export default function Tones() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Badge key={tone} text={tone} tone={tone} variant={variant} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
