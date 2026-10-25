import { reactive } from '@motifx/core';
import { Button, Grid, Panel, Stack } from '@motifx-community/ui';

const STEPS = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';

/** A gap from the spacing steps, a gap in pixels with a two-value padding, and a gap as a CSS length. */
export default function Spacing() {
  const s = reactive({ gap: 'sm' as string });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Gap">
        {STEPS.map((step) => (
          <Button key={step} text={step} size="sm" variant={() => (s.gap === step ? 'solid' : 'ghost')} aria-pressed={() => s.gap === step} onclick={() => (s.gap = step)} />
        ))}
      </Stack>
      <Stack class="layout-gap-demo" orientation="horizontal" gap={() => s.gap} padding="xs">
        <Panel variant="card" padding="sm">A</Panel>
        <Panel variant="card" padding="sm">B</Panel>
        <Panel variant="card" padding="sm">C</Panel>
      </Stack>
      <Stack orientation="horizontal" gap={12} padding="xs md" style={FRAME}>
        <Panel variant="card" padding="sm">12 pixels apart</Panel>
        <Panel variant="card" padding="sm">padding xs md</Panel>
      </Stack>
      <Grid columns="* *" gap="1.5rem" style="inline-size: 100%">
        <Panel variant="card" padding="sm">1.5rem apart</Panel>
        <Panel variant="card" padding="sm">in a Grid</Panel>
      </Grid>
    </>
  );
}
