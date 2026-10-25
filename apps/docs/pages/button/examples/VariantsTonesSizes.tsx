import { reactive } from '@motifx/core';
import { Button, Stack, type ButtonSize, type ButtonTone, type ButtonVariant } from '@motifx-community/ui';

const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'ghost'];
const TONES: ButtonTone[] = ['standard', 'accent', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

/** Every tone in every variant, in the size picked above them. */
export default function VariantsTonesSizes() {
  const s = reactive({ size: 'md' as ButtonSize });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
        {SIZES.map((size) => (
          <Button
            key={size}
            text={size}
            size="sm"
            variant={() => (s.size === size ? 'solid' : 'ghost')}
            aria-pressed={() => s.size === size}
            onclick={() => (s.size = size)}
          />
        ))}
      </Stack>
      {TONES.map((tone) => (
        <Stack key={tone} orientation="horizontal" wrap align="center">
          {VARIANTS.map((variant) => (
            <Button key={variant} text={`${tone} ${variant}`} tone={tone} variant={variant} size={() => s.size} />
          ))}
        </Stack>
      ))}
    </>
  );
}
