import { reactive } from '@motifx/core';
import { Button, Slider, Stack, type SliderShowValue } from '@motifx-community/ui';

const SHOW: SliderShowValue[] = ['never', 'drag', 'always'];

/** The value bubble shown never, while moved or always, written with a format and read out with valueText. */
export default function ValueBubble() {
  const s = reactive({ show: 'drag' as SliderShowValue, temp: 21 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Show value">
        {SHOW.map((show) => (
          <Button
            key={show}
            text={show}
            size="sm"
            variant={() => (s.show === show ? 'solid' : 'ghost')}
            aria-pressed={() => s.show === show}
            onclick={() => (s.show = show)}
          />
        ))}
      </Stack>
      <Slider
        label="Temperature"
        min={16}
        max={28}
        step={0.5}
        showValue={() => s.show}
        format={{ style: 'unit', unit: 'celsius' }}
        valueText={(v) => `${v} degrees`}
        x-model={() => s.temp}
      />
    </>
  );
}
