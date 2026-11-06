import { reactive } from '@motifx/core';
import { Button, LoadPanel, Panel, Stack } from '@motifx-community/ui';

/** Without the shade, the panel or the indicator. A click on the shade can hide it. */
export default function Options() {
    const s = reactive({ clear: false, bare: false, words: false });
    let clear!: Panel;
    let bare!: Panel;
    let words!: Panel;
    const flash = (key: 'clear' | 'bare' | 'words') => {
        s[key] = true;
        setTimeout(() => (s[key] = false), 2500);
    };
    return (
        <Stack orientation="horizontal" wrap align="center" style="inline-size: 100%">
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (clear = c)}>
                <Button text="No shade" variant="outline" onclick={() => flash('clear')} />
            </Panel>
            <LoadPanel target={() => clear} shade={false} x-model={() => s.clear} closeOnOutside />
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (bare = c)}>
                <Button text="No pane" variant="outline" onclick={() => flash('bare')} />
            </Panel>
            <LoadPanel target={() => bare} showPane={false} x-model={() => s.bare} />
            <Panel variant="outline" padding="md" style="min-inline-size: 16rem; min-block-size: 9rem" ref={(c: Panel) => (words = c)}>
                <Button text="Words only" variant="outline" onclick={() => flash('words')} />
            </Panel>
            <LoadPanel target={() => words} showIndicator={false} message="Please wait" x-model={() => s.words} />
        </Stack>
    );
}
