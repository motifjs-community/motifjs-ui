# Chart: Pie and donut

> Charts · @motifx-community/ui 0.1.0-beta.5

A pie or a donut splits one whole into its parts, for a share seen at a glance.

## Pie and donut

`pie` and `donut` split one whole into its parts. Shares are written inside the slices that have room for them, the legend names every part, and a donut shows the total in its middle. For close values, bars compare more exactly.

```tsx
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
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `innerRadius` | `number` | From the design language | The hole of a donut, as a share of its radius. |
| `startAngle` | `number` | `0` | Where the first slice starts, in degrees from the top, clockwise. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
