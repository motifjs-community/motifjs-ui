import { reactive } from '@motifx/core';
import { ColorPicker, Stack } from '@motifx-community/ui';

const PALETTE = ['#ffffff', '#ced4da', '#495057', '#000000', '#e03131', '#f08c00', '#2b8a3e', '#1971c2', '#862e9c', '#3b5bdb80'];

/** The standalone picker in the page, with opacity (`alpha`) and preset colors. */
export default function Picker() {
  const s = reactive({ color: '#1971c2cc' as string | null });

  return (
    <Stack gap="lg">
      <ColorPicker alpha palette={PALETTE} x-model={() => s.color} />
      <span>{() => `Value: ${s.color}`}</span>
    </Stack>
  );
}
