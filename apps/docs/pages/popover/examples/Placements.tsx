import { reactive } from '@motifx/core';
import { Button, CheckBox, Popover, Stack, type PopupPlacement } from '@motifx-community/ui';

const PLACEMENTS: PopupPlacement[] = ['top-start', 'top', 'top-end', 'start', 'end', 'bottom-start', 'bottom', 'bottom-end'];

/** Every placement; the arrow where the language draws one, and a width of its own. */
export default function Placements() {
    const s = reactive({ arrow: true, placement: 'bottom' as PopupPlacement });
    let button!: Button;
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                {PLACEMENTS.map(placement => (
                    <Button key={placement} text={placement} variant={() => (s.placement === placement ? 'solid' : 'outline')} size="sm" onclick={() => (s.placement = placement)} />
                ))}
                <CheckBox label="Arrow" x-model={() => s.arrow} />
            </Stack>
            <div style="display: flex; justify-content: center; padding: 3rem 0">
                <Button ref={(b: Button) => (button = b)} text="Open" />
            </div>
            <Popover target={() => button} placement={() => s.placement} arrow={() => s.arrow} width="16rem" label="Placement">
                <p>{() => `Placed at ${s.placement}; it moves to the other side when there is no room.`}</p>
            </Popover>
        </Stack>
    );
}
