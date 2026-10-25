import { reactive } from '@motifx/core';
import { Button, NumberBox, Stack, type SpinLayout } from '@motifx-community/ui';

const LAYOUTS: SpinLayout[] = ['stacked', 'inline'];

/** Spin buttons on top of each other, side by side, or none. */
export default function SpinButtons() {
  const s = reactive({ seats: 2 as number | null, layout: 'stacked' as SpinLayout, spin: true });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Spin buttons">
        {LAYOUTS.map((layout) => (
          <Button
            key={layout}
            text={layout}
            size="sm"
            variant={() => (s.spin && s.layout === layout ? 'solid' : 'ghost')}
            aria-pressed={() => s.spin && s.layout === layout}
            onclick={() => {
              s.layout = layout;
              s.spin = true;
            }}
          />
        ))}
        <Button text="none" size="sm" variant={() => (s.spin ? 'ghost' : 'solid')} aria-pressed={() => !s.spin} onclick={() => (s.spin = false)} />
      </Stack>
      <NumberBox label="Seats" min={1} max={9} locale="en" spinLayout={() => s.layout} showSpinButtons={() => s.spin} x-model={() => s.seats} />
    </>
  );
}
