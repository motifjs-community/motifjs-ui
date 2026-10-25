import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, type RadioGroupOrientation } from '@motifx-community/ui';

const ORIENTATIONS: RadioGroupOrientation[] = ['vertical', 'horizontal'];
const COLUMNS = [0, 2, 4];
const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'violet'];

/** Options one under the other or side by side, and in columns. */
export default function Layout() {
  const s = reactive({ orientation: 'vertical' as RadioGroupOrientation, columns: 0, color: 'teal' as string | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Layout">
        {ORIENTATIONS.map((o) => (
          <Button
            key={o}
            text={o}
            size="sm"
            variant={() => (s.orientation === o ? 'solid' : 'ghost')}
            aria-pressed={() => s.orientation === o}
            onclick={() => (s.orientation = o)}
          />
        ))}
        {COLUMNS.map((n) => (
          <Button
            key={`c${n}`}
            text={n ? `${n} columns` : 'no grid'}
            size="sm"
            variant={() => (s.columns === n ? 'solid' : 'ghost')}
            aria-pressed={() => s.columns === n}
            onclick={() => (s.columns = n)}
          />
        ))}
      </Stack>
      <RadioGroup label="&Color" class="rg-colors" items={COLORS} orientation={() => s.orientation} columns={() => s.columns} x-model={() => s.color} />
    </>
  );
}
