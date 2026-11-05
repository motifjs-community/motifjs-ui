import { reactive } from '@motifx/core';
import { Panel, Resizable, Stack } from '@motifx-community/ui';

/** A box resized from any side or corner, never under 160 × 80 or over 480 × 240; the grip in the corner takes the keys. */
export default function Basic() {
    const s = reactive({ told: '' });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Resizable class="rs-box" width={280} height={140} minWidth={160} minHeight={80} maxWidth={480} maxHeight={240} onResized={e => (s.told = `${e.width} × ${e.height}, from the ${e.edge}`)}>
                <Panel padding="md" variant="outline" text="A note" style="block-size: 100%">
                    <p class="rs-note">Drag a side or a corner, or focus the grip and use the arrow keys.</p>
                </Panel>
            </Resizable>
            <output class="rs-box-told">{() => s.told}</output>
        </Stack>
    );
}
