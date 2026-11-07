import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** A click, or Enter with the keyboard, chooses months; a second click lets one go. */
export default function Selection() {
    const s = reactive({ chosen: 'Nothing chosen' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-select"
                label="Online sales"
                data={SALES.slice(0, 6)}
                xField="month"
                pointSelection="multiple"
                series={[{ type: 'bar', yField: 'online', name: 'Online' }]}
                onSelectionChanged={(e) => (s.chosen = e.points.length ? e.points.map((p) => p.xText).join(', ') : 'Nothing chosen')}
            />
            <output class="ch-select-told">{() => s.chosen}</output>
        </Stack>
    );
}
