import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack } from '@motifx-community/ui';

/** A group of plain values bound with x-model, and a group created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ size: 'M' as string | null, result: '' });
  let host: Stack | null = null;

  const addFromCode = () => {
    const wrap = new RadioGroup<string>({ label: 'Gift wrap', orientation: 'horizontal', items: ['None', 'Paper', 'Box'], value: 'None' });
    wrap.onValueChanged((e) => (s.result = `Gift wrap: ${e.value}`));
    host?.controls.add(wrap);
    wrap.focus();
  };

  return (
    <>
      <RadioGroup label="&Size" items={['S', 'M', 'L', 'XL']} x-model={() => s.size} helpText={() => `Chosen: ${s.size ?? 'nothing'}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a group from code" variant="outline" onclick={addFromCode} />
        <output class="rg-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
