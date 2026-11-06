import { reactive } from '@motifx/core';
import { Button, SplitPane, Splitter, Stack } from '@motifx-community/ui';

/** The sizes are written to x-model as pixels after every move and can be set back: a layout saved and restored. */
export default function Sizes() {
    const s = reactive({ sizes: null as readonly (number | string | null)[] | null, kept: null as readonly number[] | null, moved: 0 });
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Splitter class="sp-sizes" style="block-size: 180px" x-model={() => s.sizes} onResized={() => s.moved++}>
                <SplitPane size={160} minSize={80} padding="md" text="Left">
                    <p class="sp-note">Left</p>
                </SplitPane>
                <SplitPane minSize={80} padding="md" text="Middle">
                    <p class="sp-note">Middle</p>
                </SplitPane>
                <SplitPane size={160} minSize={80} padding="md" text="Right">
                    <p class="sp-note">Right</p>
                </SplitPane>
            </Splitter>
            <Stack orientation="horizontal" wrap align="center">
                <Button text="Keep this layout" variant="outline" onclick={() => (s.kept = (s.sizes as number[] | null)?.slice() ?? null)} />
                <Button text="Restore it" variant="outline" enabled={() => !!s.kept} onclick={() => (s.sizes = s.kept)} />
                <Button text="Start again" variant="outline" onclick={() => (s.sizes = null)} />
                <output class="sp-sizes-told">{() => `sizes: ${JSON.stringify(s.sizes)}, moved ${s.moved} times`}</output>
            </Stack>
        </Stack>
    );
}
