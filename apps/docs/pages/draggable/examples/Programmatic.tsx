import { reactive } from '@motifx/core';
import { Button, Draggable, Panel, Stack } from '@motifx-community/ui';

/** The position is written to x-model after every drag or key press and can be set back: moved, saved and restored programmatically. */
export default function Programmatic() {
    const s = reactive({ at: { x: 0, y: 0 } as { x: number; y: number } | null, kept: null as { x: number; y: number } | null });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <div style="position: relative; block-size: 160px">
                <Draggable class="dg-coded" boundary="parent" step={20} x-model={() => s.at} style="position: absolute; left: 0; top: 0">
                    <Panel padding="sm" variant="outline" style="inline-size: 140px">
                        Moved by the model
                    </Panel>
                </Draggable>
            </div>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Right by 40" variant="outline" onclick={() => (s.at = { x: (s.at?.x ?? 0) + 40, y: s.at?.y ?? 0 })} />
                <Button text="Keep this place" variant="outline" onclick={() => (s.kept = s.at ? { ...s.at } : null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.at = s.kept ? { ...s.kept } : null)} />
                <Button text="Back to the start" variant="outline" onclick={() => (s.at = { x: 0, y: 0 })} />
                <output class="dg-coded-told">{() => `at: ${JSON.stringify(s.at)}`}</output>
            </Stack>
        </Stack>
    );
}
