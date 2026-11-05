import { reactive } from '@motifx/core';
import { Button, Panel, Resizable, Stack } from '@motifx-community/ui';

/** The size goes out to x-model after every resize and comes back: set, kept and restored programmatically. */
export default function Programmatic() {
    const s = reactive({ size: { width: 240, height: 120 } as { width: number; height: number } | null, kept: null as { width: number; height: number } | null });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Resizable class="rs-coded" minWidth={120} minHeight={60} x-model={() => s.size}>
                <Panel padding="md" variant="outline" style="block-size: 100%">
                    <p class="rs-note">Sized by the model.</p>
                </Panel>
            </Resizable>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Wider" variant="outline" onclick={() => (s.size = { width: (s.size?.width ?? 240) + 40, height: s.size?.height ?? 120 })} />
                <Button text="Keep this size" variant="outline" onclick={() => (s.kept = s.size ? { ...s.size } : null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.size = s.kept ? { ...s.kept } : null)} />
                <output class="rs-coded-told">{() => `size: ${JSON.stringify(s.size)}`}</output>
            </Stack>
        </Stack>
    );
}
