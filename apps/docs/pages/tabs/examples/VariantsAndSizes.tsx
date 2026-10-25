import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, type TabsVariant } from '@motifx-community/ui';

const VARIANTS: TabsVariant[] = ['line', 'pill'];

/** Both variants in the three sizes, stretched or not. */
export default function VariantsAndSizes() {
  const s = reactive({ variant: 'line' as TabsVariant, stretch: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            text={variant}
            size="sm"
            variant={() => (s.variant === variant ? 'solid' : 'ghost')}
            aria-pressed={() => s.variant === variant}
            onclick={() => (s.variant = variant)}
          />
        ))}
        <Button text="Stretch" size="sm" variant="outline" toggle x-model={() => s.stretch} />
      </Stack>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Tabs key={size} label={`Size ${size}`} size={size} variant={() => s.variant} stretch={() => s.stretch}>
          <Tab title="Day">
            <p>{`Size ${size}.`}</p>
          </Tab>
          <Tab title="Week">
            <p>Week.</p>
          </Tab>
          <Tab title="Month">
            <p>Month.</p>
          </Tab>
        </Tabs>
      ))}
    </>
  );
}
