import { reactive } from '@motifx/core';
import { Stack, Timeline } from '@motifx-community/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Releases along a line of dates: a press on a date, or the arrow keys, shows that release under the line; the buttons scroll the track. */
export default function Horizontal() {
    const s = reactive({ shown: 'r3' as string | number | null });
    const releases = MONTHS.map((month, i) => ({
        key: `r${i + 1}`,
        date: new Date(2026, i, 15),
        title: `Release ${i + 1}`,
        description: `What ${month} brought: ${i % 3 === 0 ? 'new components' : i % 3 === 1 ? 'fixes and speed' : 'the docs and the languages'}.`,
        tone: i % 3 === 0 ? ('accent' as const) : ('default' as const),
        glyph: i % 3 === 0 ? 'star' : ''
    }));
    return (
        <Stack gap="sm" style="inline-size: 100%">
            <Timeline class="tl-releases" label="Releases" orientation="horizontal" dateFormat={{ month: 'short', year: 'numeric' }} items={releases} x-model={() => s.shown} />
            <output class="tl-releases-told">{() => `shown: ${s.shown}`}</output>
        </Stack>
    );
}
