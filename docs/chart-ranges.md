# Chart: Ranges

> Charts · @motifx-community/ui 0.1.0-beta.11

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

## Forecast with a range

Each series can take rows of its own with `data`. Here the actual values, the forecast and its likely range share one category axis, and the band widens as the forecast goes further.

```tsx
import { Chart } from '@motifx-community/ui';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SOLD = [420, 446, 470, 462, 498, 530, 548];

// The months give the axis; the series bring their own values.
const AXIS: Record<string, string | number>[] = MONTHS.map(month => ({ month }));
const ACTUAL = SOLD.map((units, i) => ({ month: MONTHS[i], units }));
// The forecast starts at the last real month and widens as it goes further.
const FORECAST = MONTHS.slice(SOLD.length - 1).map((month, i) => {
    const units = SOLD[SOLD.length - 1] + i * 22;
    return { month, units, low: units - i * 16, high: units + i * 16 };
});

/** Each series with rows of its own: what was sold, the forecast, and the band it may fall in. */
export default function RangesForecast() {
    return (
        <Chart
            class="ch-range-forecast"
            title="Units sold, and the forecast"
            data={AXIS}
            xField="month"
            series={[
                { type: 'rangeArea', data: FORECAST, lowField: 'low', highField: 'high', name: 'Likely range' },
                { data: FORECAST, yField: 'units', name: 'Forecast', markers: true },
                { data: ACTUAL, yField: 'units', name: 'Sold', markers: true }
            ]}
        />
    );
}
```

## Timeline

`rangeBar` with `horizontal` lays out start and end values on their side, as in a project plan. A reference line marks the current week.

```tsx
import { Chart } from '@motifx-community/ui';

const TASKS = [
    { task: 'Research', start: 1, end: 4 },
    { task: 'Design', start: 3, end: 8 },
    { task: 'Build', start: 6, end: 16 },
    { task: 'Test', start: 12, end: 18 },
    { task: 'Launch', start: 18, end: 20 }
];

/** Bars from a start to an end, laid on their side: a plan read week by week, with a line for this week. */
export default function RangesTimeline() {
    return (
        <Chart
            class="ch-range-timeline"
            title="Project plan"
            data={TASKS}
            xField="task"
            horizontal
            legend={false}
            yAxis={{ title: 'Week', min: 0, max: 20 }}
            references={[{ value: 9, label: 'This week' }]}
            series={[{ type: 'rangeBar', lowField: 'start', highField: 'end', name: 'Weeks' }]}
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
