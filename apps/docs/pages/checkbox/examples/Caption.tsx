import { reactive } from '@motifx/core';
import { Button, CheckBox, Stack, type LabelPosition } from '@motifx-community/ui';

const POSITIONS: LabelPosition[] = ['end', 'start'];

/** The caption after or before the box, stretched to the far end, or kept for screen readers only. */
export default function Caption() {
  const s = reactive({ position: 'end' as LabelPosition });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Caption position">
        {POSITIONS.map((position) => (
          <Button
            key={position}
            text={position}
            size="sm"
            variant={() => (s.position === position ? 'solid' : 'ghost')}
            aria-pressed={() => s.position === position}
            onclick={() => (s.position = position)}
          />
        ))}
      </Stack>
      <CheckBox label="Show hidden files" labelPosition={() => s.position} />
      <div style="inline-size: 20rem">
        <CheckBox label="Wrap long lines" labelPosition={() => s.position} stretch value={true} />
      </div>
      <CheckBox label="Select row 3" labelMode="hidden" />
    </>
  );
}
