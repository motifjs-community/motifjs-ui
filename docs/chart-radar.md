# Chart: Radar

> Charts · @motifx-community/ui 0.1.0-beta.10

A radar compares several measures at once, for one or more items.

## Radar

`radar` places a spoke for each category around a center and draws a shape for each series.

```tsx
import { Chart } from '@motifx-community/ui';

const SCORES = [
    { skill: 'Speed', a: 82, b: 64 },
    { skill: 'Battery', a: 58, b: 88 },
    { skill: 'Camera', a: 90, b: 72 },
    { skill: 'Screen', a: 76, b: 80 },
    { skill: 'Sound', a: 64, b: 70 },
    { skill: 'Price', a: 48, b: 84 }
];

/** Several measures around a center, one shape for each series. */
export default function Radar() {
    return (
        <Chart
            class="ch-radar"
            title="Two phones compared"
            data={SCORES}
            xField="skill"
            series={[
                { type: 'radar', yField: 'a', name: 'Phone A', markers: true },
                { type: 'radar', yField: 'b', name: 'Phone B', markers: true }
            ]}
        />
    );
}
```

## Fixed scale and a target

Set `min` and `max` on the value axis so that shapes compare against the same scale. A target series gives a reference shape; the reader can hide series in the legend.

```tsx
import { Chart } from '@motifx-community/ui';

const REVIEW = [
    { skill: 'Delivery', target: 80, team: 86, last: 72 },
    { skill: 'Quality', target: 85, team: 78, last: 74 },
    { skill: 'Teamwork', target: 75, team: 88, last: 80 },
    { skill: 'Planning', target: 70, team: 62, last: 55 },
    { skill: 'Learning', target: 60, team: 74, last: 66 }
];

/** A fixed scale from 0 to 100, so shapes compare fairly; hide a series in the legend to compare two. */
export default function RadarTarget() {
    return (
        <Chart
            class="ch-radar-target"
            title="Team review"
            data={REVIEW}
            xField="skill"
            yAxis={{ min: 0, max: 100, tickCount: 5 }}
            series={[
                { type: 'radar', yField: 'target', name: 'Target' },
                { type: 'radar', yField: 'team', name: 'This year', markers: true },
                { type: 'radar', yField: 'last', name: 'Last year', markers: true }
            ]}
        />
    );
}
```

## A year around the circle

A radar suits data that repeats in a cycle, such as the months of a year, because the last position joins the first.

```tsx
import { Chart } from '@motifx-community/ui';

const RAIN = [
    { month: 'Jan', north: 92, south: 110 },
    { month: 'Feb', north: 74, south: 96 },
    { month: 'Mar', north: 68, south: 72 },
    { month: 'Apr', north: 52, south: 48 },
    { month: 'May', north: 46, south: 30 },
    { month: 'Jun', north: 38, south: 12 },
    { month: 'Jul', north: 30, south: 4 },
    { month: 'Aug', north: 34, south: 6 },
    { month: 'Sep', north: 48, south: 22 },
    { month: 'Oct', north: 70, south: 58 },
    { month: 'Nov', north: 84, south: 92 },
    { month: 'Dec', north: 98, south: 118 }
];

/** Twelve months around the circle: a year that comes back to where it started. */
export default function RadarYear() {
    return (
        <Chart
            class="ch-radar-year"
            title="Rain over the year"
            data={RAIN}
            xField="month"
            yAxis={{ format: { style: 'unit', unit: 'millimeter' } }}
            series={[
                { type: 'radar', yField: 'north', name: 'North coast' },
                { type: 'radar', yField: 'south', name: 'South coast' }
            ]}
        />
    );
}
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `markers` | `boolean` | `false` | Marks each value on a line. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
