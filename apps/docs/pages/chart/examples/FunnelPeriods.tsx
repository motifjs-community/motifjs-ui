import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack } from '@motifx-community/ui';

const PERIODS = {
    march: [
        { step: 'Opened the email', people: 5200 },
        { step: 'Clicked the link', people: 1900 },
        { step: 'Signed up', people: 640 },
        { step: 'Bought', people: 180 }
    ],
    april: [
        { step: 'Opened the email', people: 6100 },
        { step: 'Clicked the link', people: 2600 },
        { step: 'Signed up', people: 1020 },
        { step: 'Bought', people: 310 }
    ]
};

/** The same stages for another period: new rows, and the stages move to their new sizes. */
export default function FunnelPeriods() {
    const s = reactive({ period: 'march' as keyof typeof PERIODS });
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Period"
                x-model={() => s.period}
                items={[
                    { value: 'march', text: 'March' },
                    { value: 'april', text: 'April' }
                ]}
            />
            <Chart
                class="ch-funnel-periods"
                title="Spring campaign"
                data={() => PERIODS[s.period]}
                xField="step"
                legend={false}
                series={[{ type: 'funnel', yField: 'people', name: 'People', labels: 'all' }]}
            />
        </Stack>
    );
}
