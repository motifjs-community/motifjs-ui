import { reactive } from '@motifx/core';
import { ColorBox, Stack } from '@motifx-community/ui';

const PALETTE = ['#3b5bdb', '#1971c2', '#0c8599', '#2b8a3e', '#f08c00', '#e8590c', '#e03131', '#c2255c', '#862e9c', '#495057'];

/** A colour field bound with `x-model`: type a hex, or open the picker (Alt+Down); one made with `new` programmatically. */
export default function Programmatic() {
  const s = reactive({ accent: '#3b5bdb' as string | null });
  const coded = new ColorBox({ label: 'Made in code', value: '#2b8a3e', clearButton: true });

  return (
    <Stack gap="lg" style="inline-size: 18rem; max-inline-size: 100%">
      <ColorBox label="&Accent" palette={PALETTE} x-model={() => s.accent} helpText={() => `Value: ${s.accent ?? 'none'}`} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
