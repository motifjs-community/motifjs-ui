# Chart: Scatter and bubble

> Charts · @motifx-community/ui 0.1.0-beta.5

Scatter and bubble charts place each row by two numbers, to show how they relate.

## Scatter and bubble charts

`scatter` and `bubble` plot two numeric values. `sizeField` adds a third value to a bubble, represented by its area. The pointer selects the nearest point.

```tsx
import { Chart } from '@motifx-community/ui';

const CARS = [
    { power: 66, weight: 980, price: 16 },
    { power: 90, weight: 1120, price: 21 },
    { power: 110, weight: 1240, price: 27 },
    { power: 130, weight: 1320, price: 31 },
    { power: 150, weight: 1450, price: 38 },
    { power: 170, weight: 1510, price: 44 },
    { power: 190, weight: 1600, price: 52 },
    { power: 230, weight: 1680, price: 71 },
    { power: 260, weight: 1760, price: 86 },
    { power: 300, weight: 1850, price: 112 }
];

/** Two numbers per dot, and a third as its size. The size counts by area. */
export default function Scatter() {
    return (
        <Chart
            class="ch-scatter"
            title="Power, weight and price"
            data={CARS}
            xField="power"
            xAxis={{ title: 'Power (hp)' }}
            yAxis={{ title: 'Weight (kg)', min: 800 }}
            series={[{ type: 'bubble', yField: 'weight', sizeField: 'price', name: 'Cars' }]}
        />
    );
}
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `sizeField` | `string \| (row) => unknown` |  | The size of a bubble. |
| `markers` | `boolean` | `false` | Marks each value on a line. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
