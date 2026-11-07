# Chart: Radar

> Charts · @motifx-community/ui 0.1.0-beta.5

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

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `markers` | `boolean` | `false` | Marks each value on a line. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
