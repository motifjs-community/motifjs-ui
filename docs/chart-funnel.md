# Chart: Funnel

> Charts · @motifx-community/ui 0.1.0-beta.10

A funnel follows a quantity through stages in order, and shows how much of it is left at each one.

## Funnel

`funnel` shows stages in the order of the rows, each with the share of the first stage that is left. The stages take one hue, darker towards the first, as they are in order.

```tsx
import { Chart } from '@motifx-community/ui';

const STEPS = [
    { step: 'Visited the shop', people: 12000 },
    { step: 'Viewed a product', people: 7400 },
    { step: 'Added to the cart', people: 2900 },
    { step: 'Started to pay', people: 1650 },
    { step: 'Paid', people: 1180 }
];

/** Stages in order, each with what is left of the first one. */
export default function Funnel() {
    return <Chart class="ch-funnel" title="From visit to order" data={STEPS} xField="step" legend={false} series={[{ type: 'funnel', yField: 'people', name: 'People' }]} />;
}
```

## Values and clicks

`labels: 'all'` writes the value on every stage. `onPointClick` gives the stage that was clicked, for a detail of your own such as the conversion from the first stage.

```tsx
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
```

## Another period

New rows redraw the funnel, and the stages animate to their new sizes. Use this to compare periods or segments with the same stages.

```tsx
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
```

## Feedback

Loading issues…
