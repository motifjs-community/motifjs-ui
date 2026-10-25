import { reactive } from '@motifx/core';
import { Button, Stack, Tooltip, type PopupPlacement } from '@motifx-community/ui';

const PLACEMENTS: PopupPlacement[] = ['top', 'bottom', 'start', 'end', 'top-start', 'bottom-end'];

/** The side the tooltip opens on, picked from the buttons. */
export default function Placement() {
  const s = reactive({ placement: 'top' as PopupPlacement });
  let target: Button | null = null;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">
        {PLACEMENTS.map((placement) => (
          <Button
            key={placement}
            text={placement}
            size="sm"
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}
            aria-pressed={() => s.placement === placement}
            onclick={() => (s.placement = placement)}
          />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        <Button ref={(b: Button) => (target = b)} text="Hover or focus me" variant="outline" />
        <Tooltip target={() => target} text={() => `Opens at ${s.placement}`} placement={() => s.placement} />
      </Stack>
    </>
  );
}
