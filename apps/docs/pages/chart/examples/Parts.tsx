import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';

const TRAFFIC = [
    { source: 'Search', visits: 4820 },
    { source: 'Direct', visits: 2610 },
    { source: 'Social', visits: 1480 },
    { source: 'Email', visits: 920 },
    { source: 'Referral', visits: 540 }
];

/** One whole and its parts. Hide a part in the legend: the others share the whole again, and keep their colors. */
export default function Parts() {
    const s = reactive({ type: 'donut' as ChartSeriesType });
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Shape"
                x-model={() => s.type}
                items={[
                    { value: 'donut', text: 'Donut' },
                    { value: 'pie', text: 'Pie' }
                ]}
            />
            <Chart class="ch-parts" title="Visits by source" data={TRAFFIC} xField="source" series={() => [{ type: s.type, yField: 'visits', name: 'Visits' }]} />
        </Stack>
    );
}
