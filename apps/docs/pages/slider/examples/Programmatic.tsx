import { reactive } from '@motifx/core';
import { Button, Slider, Stack } from '@motifx-community/ui';

/** A slider bound to state with x-model, and sliders created with `new` and added programmatically. */
export default function Programmatic() {
  const s = reactive({ volume: 40, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const slider = new Slider({ label: `Slider ${++added}`, showValue: 'drag' });
    slider.value = 50;
    slider.onValueChanged((e) => (s.result = `${slider.label}: ${String(e.value)}`));
    host?.controls.add(slider);
    slider.focus();
  };

  return (
    <>
      <Slider label="&Volume" x-model={() => s.volume} helpText={() => `Volume: ${s.volume}`} />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a slider programmatically" variant="outline" onclick={addProgrammatic} />
        <output class="sl-result">{() => s.result}</output>
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
