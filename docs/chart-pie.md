# Chart: Pie and donut

> Charts · @motifx-community/ui 0.1.0-beta.6

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

## Labels and starting angle

`labels: 'all'` writes a value on every part that has room for it, in the series' `format`. `startAngle` turns the first part to another position, and `innerRadius` sets the width of the ring.

```tsx
import { Chart } from '@motifx-community/ui';

const DISK = [
    { kind: 'Photos', size: 182 },
    { kind: 'Videos', size: 124 },
    { kind: 'Apps', size: 64 },
    { kind: 'Documents', size: 22 },
    { kind: 'System', size: 38 }
];

/** A thin ring that starts at the right, with every share written on its part. */
export default function PieLabels() {
    return (
        <Chart
            class="ch-pie-labels"
            title="Disk use"
            subtitle="430 GB of 512 GB"
            data={DISK}
            xField="kind"
            series={[{ type: 'donut', yField: 'size', name: 'Size', innerRadius: 0.72, startAngle: 90, labels: 'all', format: { style: 'unit', unit: 'gigabyte' } }]}
        />
    );
}
```

## Choosing a part

`pointSelection` lets the reader choose a part with a click or with Enter. `onSelectionChanged` gives the chosen point, with its `share` of the whole.

```tsx
import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const SPENDING = [
    { item: 'Rent', amount: 1200 },
    { item: 'Food', amount: 540 },
    { item: 'Transport', amount: 210 },
    { item: 'Bills', amount: 180 },
    { item: 'Leisure', amount: 260 }
];

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** A click, or Enter, chooses a part; the page tells what it is and how much of the whole it takes. */
export default function PieChoose() {
    const s = reactive({ told: 'Choose a part of the pie.' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-pie-choose"
                title="Spending in March"
                data={SPENDING}
                xField="item"
                pointSelection="single"
                series={[{ type: 'pie', yField: 'amount', name: 'Amount', format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 } }]}
                onSelectionChanged={e => {
                    const p = e.points[0];
                    s.told = p ? `${p.xText}: ${money.format(p.y)}, ${Math.round((p.share ?? 0) * 100)}% of the month` : 'Choose a part of the pie.';
                }}
            />
            <output class="ch-pie-told">{() => s.told}</output>
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
