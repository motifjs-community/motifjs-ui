import { reactive } from '@motifx/core';
import { ColorBox, Stack } from '@motifx-community/ui';

/** Applied with buttons: the value changes on OK, Cancel leaves it; with opacity it keeps `#rrggbbaa`. */
export default function Buttons() {
  const s = reactive({ overlay: '#00000080' as string | null });

  return (
    <Stack gap="lg" style="inline-size: 18rem; max-inline-size: 100%">
      <ColorBox label="Overlay" alpha apply="useButtons" x-model={() => s.overlay} />
      <span>{() => `Value: ${s.overlay ?? 'none'}`}</span>
    </Stack>
  );
}
