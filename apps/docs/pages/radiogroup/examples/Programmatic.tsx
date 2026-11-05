import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

/** A group of plain values bound with x-model, and a group created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ size: 'M' as string | null, result: '' });
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const wrap = new RadioGroup<string>({ label: 'Gift wrap', orientation: 'horizontal', items: ['None', 'Paper', 'Box'], value: 'None' });
    wrap.onValueChanged((e) => (s.result = `Gift wrap: ${e.value}`));
    host?.controls.add(wrap);
    wrap.focus();
  };

  return (
    <>
      <RadioGroup label="&Size" items={['S', 'M', 'L', 'XL']} x-model={() => s.size} helpText={() => `Chosen: ${s.size ?? 'nothing'}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a group programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="rg-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
