# Chart: Scatter and bubble

> Charts · @motifx-community/ui 0.1.0-beta.6

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

## Groups and reference lines

Each group is a series with rows of its own. References on both axes mark a mean on the horizontal axis and a threshold on the vertical one.

```tsx
import { Chart } from '@motifx-community/ui';

// Hours studied and the exam score of two classes.
const CLASS_A = [2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 10, 11].map((hours, i) => ({ hours, score: Math.min(98, Math.round(42 + hours * 4.6 + ((i * 7) % 9) - 4)) }));
const CLASS_B = [1, 2, 3, 3, 4, 5, 6, 7, 7, 8, 9, 12].map((hours, i) => ({ hours, score: Math.min(98, Math.round(36 + hours * 5.1 + ((i * 5) % 11) - 5)) }));

const mean = (rows: { hours: number; score: number }[], key: 'hours' | 'score') => Math.round((rows.reduce((sum, r) => sum + r[key], 0) / rows.length) * 10) / 10;
const ALL = [...CLASS_A, ...CLASS_B];

/** Two groups of dots, each with rows of its own, and lines at the means of both axes. */
export default function ScatterGroups() {
    return (
        <Chart
            class="ch-scatter-groups"
            title="Study time and exam score"
            xField="hours"
            xAxis={{ title: 'Hours studied', min: 0 }}
            yAxis={{ title: 'Score', min: 30, max: 100 }}
            references={[
                { axis: 'x', value: mean(ALL, 'hours'), label: 'Mean hours' },
                { value: 70, label: 'Pass' }
            ]}
            series={[
                { type: 'scatter', data: CLASS_A, yField: 'score', name: 'Class A' },
                { type: 'scatter', data: CLASS_B, yField: 'score', name: 'Class B' }
            ]}
        />
    );
}
```

## Choosing points

`pointSelection: 'multiple'` lets the reader choose several dots with clicks, or with the arrow keys and Enter. `onSelectionChanged` gives the chosen rows, and `tooltip.format` writes a tooltip of your own.

```tsx
import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const CITIES = [
    { city: 'Lisbon', rent: 1350, salary: 1600 },
    { city: 'Madrid', rent: 1250, salary: 2100 },
    { city: 'Milan', rent: 1500, salary: 2300 },
    { city: 'Vienna', rent: 1100, salary: 2900 },
    { city: 'Prague', rent: 950, salary: 1900 },
    { city: 'Warsaw', rent: 900, salary: 1700 },
    { city: 'Berlin', rent: 1400, salary: 3300 },
    { city: 'Athens', rent: 700, salary: 1200 },
    { city: 'Dublin', rent: 2100, salary: 3500 },
    { city: 'Helsinki', rent: 1150, salary: 3100 }
];

/** Click dots, or move to them with the arrow keys and press Enter, to choose several; the page compares them. */
export default function ScatterChoose() {
    const s = reactive({ told: 'Choose cities on the chart.' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-scatter-choose"
                title="Rent and salary"
                subtitle="Monthly, in euros"
                data={CITIES}
                xField="rent"
                pointSelection="multiple"
                xAxis={{ title: 'Rent of a flat' }}
                yAxis={{ title: 'Salary after tax' }}
                tooltip={{ format: c => (c.point ? `${c.point.row.city}: rent ${c.point.xText}, salary ${c.point.yText}` : c.title) }}
                series={[{ type: 'scatter', yField: 'salary', name: 'Cities' }]}
                onSelectionChanged={e =>
                    (s.told = e.points.length
                        ? e.points.map(p => `${p.row.city}: ${Math.round((p.row.rent / p.row.salary) * 100)}% of the salary`).join(' · ')
                        : 'Choose cities on the chart.')
                }
            />
            <output class="ch-scatter-told">{() => s.told}</output>
        </Stack>
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
