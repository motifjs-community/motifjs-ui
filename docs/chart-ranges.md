# Chart: Ranges

> Charts · @motifx-community/ui 0.1.0-beta.5

Ranges show a low and a high value for each position, as a band or as floating bars.

## Ranges

`rangeArea` and `rangeBar` draw from `lowField` to `highField`, and other series share the axis.

```tsx
import { Chart } from '@motifx-community/ui';

const WEATHER = [
    { month: 'Jan', low: 2, high: 9, mean: 5 },
    { month: 'Feb', low: 3, high: 11, mean: 7 },
    { month: 'Mar', low: 5, high: 14, mean: 9 },
    { month: 'Apr', low: 8, high: 18, mean: 13 },
    { month: 'May', low: 12, high: 23, mean: 17 },
    { month: 'Jun', low: 16, high: 28, mean: 22 },
    { month: 'Jul', low: 19, high: 31, mean: 25 },
    { month: 'Aug', low: 19, high: 31, mean: 25 },
    { month: 'Sep', low: 15, high: 26, mean: 21 },
    { month: 'Oct', low: 11, high: 21, mean: 16 },
    { month: 'Nov', low: 7, high: 15, mean: 11 },
    { month: 'Dec', low: 4, high: 11, mean: 7 }
];

/** A band from the lowest to the highest value, with a line through it. */
export default function Ranges() {
    return (
        <Chart
            class="ch-range"
            title="Temperature over the year"
            data={WEATHER}
            xField="month"
            yAxis={{ format: { style: 'unit', unit: 'celsius' } }}
            series={[
                { type: 'rangeArea', lowField: 'low', highField: 'high', name: 'Range' },
                { yField: 'mean', name: 'Mean', smooth: true }
            ]}
        />
    );
}
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `lowField, highField` | `string \| (row) => unknown` |  | The ends of a range, and the lowest and highest price of a candle. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
