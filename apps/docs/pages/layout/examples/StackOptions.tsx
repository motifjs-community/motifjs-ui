import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TextBox, type LayoutAlign, type StackJustify } from '@motifx-community/ui';

const ALIGNS: LayoutAlign[] = ['start', 'center', 'end', 'stretch', 'baseline'];
const JUSTIFIES: StackJustify[] = ['start', 'center', 'end', 'space-between', 'space-evenly'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';

/** A Stack's orientation, align, justify, wrap and reverse, and a child that grows. */
export default function StackOptions() {
  const s = reactive({
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    align: 'center' as LayoutAlign,
    justify: 'start' as StackJustify,
    wrap: false,
    reverse: false,
  });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Orientation">
        {(['horizontal', 'vertical'] as const).map((o) => (
          <Button key={o} text={o} size="sm" variant={() => (s.orientation === o ? 'solid' : 'ghost')} aria-pressed={() => s.orientation === o} onclick={() => (s.orientation = o)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Align">
        {ALIGNS.map((a) => (
          <Button key={a} text={a} size="sm" variant={() => (s.align === a ? 'solid' : 'ghost')} aria-pressed={() => s.align === a} onclick={() => (s.align = a)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Justify">
        {JUSTIFIES.map((j) => (
          <Button key={j} text={j} size="sm" variant={() => (s.justify === j ? 'solid' : 'ghost')} aria-pressed={() => s.justify === j} onclick={() => (s.justify = j)} />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="wrap" size="sm" toggle x-model={() => s.wrap} variant="outline" />
        <Button text="reverse" size="sm" toggle x-model={() => s.reverse} variant="outline" />
      </Stack>
      <Stack
        class="layout-stack-demo"
        orientation={() => s.orientation}
        align={() => s.align}
        justify={() => s.justify}
        wrap={() => s.wrap}
        reverse={() => s.reverse}
        gap="sm"
        padding="sm"
        style={`inline-size: 100%; min-block-size: 10rem; ${FRAME}`}
      >
        <Panel variant="card" padding="sm">One</Panel>
        <Panel variant="card" padding="md">Two, taller</Panel>
        <Panel variant="card" padding="sm">Three</Panel>
        <TextBox label="Grows" labelMode="hidden" placeholder="I grow" grow />
      </Stack>
    </>
  );
}
