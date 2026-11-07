# BarGauge: Labels and legend

> Gauges · @motifx-community/ui 0.1.0-beta.6

Each value can be written at the end of its bar, named in a legend, and shown with its name under the pointer.

## Values at the ends

A line runs from the end of each bar to its value, outside the bars. A value that would sit on another moves further out along its line.

```tsx
import { BarGauge } from '@motifx-community/ui';

/** Four ratings against the same scale, each written at the end of its bar. */
export default function Basic() {
    return <BarGauge class="bg-basic" data={[47.3, 65.3, 84.6, 71.9]} format={{ style: 'unit', unit: 'percent', maximumFractionDigits: 1 }} label="Ratings" />;
}
```

## Formats

`format` writes the values: options of the browser's number format, in the language of the page, or a function of your own.

```tsx
import { BarGauge, Stack } from '@motifx-community/ui';

const points = (v: number) => `${v} pts`;

/** Values as a percentage with one decimal, and through a function of your own. */
export default function Formats() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge data={[0.473, 0.653, 0.846]} max={1} format={{ style: 'percent', maximumFractionDigits: 1 }} label="Shares" />
            <BarGauge class="bg-points" data={[38, 52, 71]} format={points} label="Scores" />
        </Stack>
    );
}
```

## Legend and tooltip

`legend` lists the names under the bars; `showLabels` can then leave the values at the ends out. The bar under the pointer shows its name and value.

```tsx
import { BarGauge } from '@motifx-community/ui';

const RIDERS = [
    { name: 'Rider 1', speed: 121.4 },
    { name: 'Rider 2', speed: 135.4 },
    { name: 'Rider 3', speed: 115.9 },
    { name: 'Rider 4', speed: 141.1 },
    { name: 'Rider 5', speed: 127.5 }
];

/** Rows read through their fields, named in a legend; the bar under the pointer shows its name and value. */
export default function Legend() {
    return (
        <BarGauge class="bg-legend" data={RIDERS} valueField="speed" nameField="name" max={200} showLabels={false} legend
            format={{ style: 'unit', unit: 'kilometer-per-hour' }} label="Average speed" />
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showLabels` | `Bind<boolean>` | `true` | Writes each value at the end of its bar. |
| `legend` | `Bind<boolean>` | `false` | Shows a legend of the names under the bars. |
| `tooltip` | `Bind<boolean>` | `true` | Shows the value under the pointer. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |
| `nameField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds its name, shown in the legend and the tooltip and read with its value. |

Every other prop and member is on the [Overview](bar-gauge.md#api).

## Feedback

Loading issues…
