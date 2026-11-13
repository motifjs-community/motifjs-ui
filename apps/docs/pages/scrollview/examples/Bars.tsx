import { reactive, type Component } from '@motifx/core';
import { Button, ScrollView, Stack, type ScrollViewBars } from '@motifx-community/ui';

const LINES = Array.from({ length: 40 }, (_, i) => `Line ${i + 1} of a long text that needs a box of its own to scroll in.`);
const MODES: ScrollViewBars[] = ['onScroll', 'onHover', 'always', 'never'];

/** A scrolling box with configurable scrollbars, moved programmatically to a line and back to the top. */
export default function Bars() {
    const s = reactive({ bars: 'onScroll' as ScrollViewBars, top: 0 });
    let view!: ScrollView;
    const lines: Component<HTMLParagraphElement>[] = [];
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" wrap align="center">
                {MODES.map(mode => (
                    <Button key={mode} text={mode} size="sm" variant={() => (s.bars === mode ? 'solid' : 'outline')} onclick={() => (s.bars = mode)} />
                ))}
                <Button text="Line 20" variant="outline" size="sm" onclick={() => view.scrollToElement(lines[19], true)} />
                <Button text="Top" variant="outline" size="sm" onclick={() => view.scrollTo(0, true)} />
                <output class="sv-top">{() => `scrollTop: ${Math.round(s.top)}`}</output>
            </Stack>
            <ScrollView ref={(v: ScrollView) => (view = v)} label="Long text" class="sv-text" showScrollbar={() => s.bars} style="block-size: 12rem" onScrolled={e => (s.top = e.top)}>
                {LINES.map((line, i) => (
                    <p key={line} ref={(c: Component<HTMLParagraphElement>) => (lines[i] = c)}>{line}</p>
                ))}
            </ScrollView>
        </Stack>
    );
}
