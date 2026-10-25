import { Stack, TextBox, type FieldVariant } from '@motifx-community/ui';

const VARIANTS: FieldVariant[] = ['outline', 'filled', 'underline'];

/** Every variant in the three sizes. */
export default function VariantsAndSizes() {
  return (
    <>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          <TextBox label={`${variant} sm`} variant={variant} size="sm" placeholder="Small" />
          <TextBox label={`${variant} md`} variant={variant} placeholder="Medium" />
          <TextBox label={`${variant} lg`} variant={variant} size="lg" placeholder="Large" />
        </Stack>
      ))}
    </>
  );
}
