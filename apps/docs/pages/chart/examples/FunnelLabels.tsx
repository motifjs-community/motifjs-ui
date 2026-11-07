import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const STEPS = [
    { step: 'Applied', people: 840 },
    { step: 'Screened', people: 410 },
    { step: 'Interviewed', people: 126 },
    { step: 'Offered', people: 34 },
    { step: 'Hired', people: 21 }
];

/** Every stage with its count; a click on a stage tells how many of the first stage got that far. */
export default function FunnelLabels() {
    const s = reactive({ told: 'Click a stage.' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-funnel-labels"
                title="Hiring this year"
                data={STEPS}
                xField="step"
                legend={false}
                series={[{ type: 'funnel', yField: 'people', name: 'People', labels: 'all' }]}
                onPointClick={e => (s.told = `${e.point.xText}: ${e.point.yText} people, ${Math.round((e.point.y / STEPS[0].people) * 1000) / 10}% of those who applied`)}
            />
            <output class="ch-funnel-told">{() => s.told}</output>
        </Stack>
    );
}
