# Gauge: Marks

> Gauges · @motifx-community/ui 0.1.0-beta.8

Marks show other values on the scale besides the gauge's own, such as a target, a limit, or the lowest and highest expected.

## Targets and limits

`marks` takes values with a `label`. Each label is read with the gauge's value, and shows when the pointer is over its mark.

```tsx
import { Gauge } from '@motifx-community/ui';

const EXPECTED = [
    { value: 40, label: 'Lowest expected' },
    { value: 90, label: 'Highest expected' }
];

const SOLD = [
    { from: 0, to: 30, tone: 'danger' as const },
    { from: 30, to: 70, tone: 'warning' as const },
    { from: 70, to: 100, tone: 'good' as const }
];

/** The lowest and highest expected values marked on the scale. Point at a mark to see its name. */
export default function Targets() {
    return <Gauge class="ga-marks" value={85} scale="ticks" tickInterval={10} marks={EXPECTED} ranges={SOLD} label="Tickets sold (%)" size={200} />;
}
```

## Shapes of marks

`markShape` sets the shape of every mark, and a mark's own `shape` wins over it. A callout writes the mark's value.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** Marks as lines for every mark, and a mark with a callout of its own beside a needle. */
export default function MarkShapes() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge value={62} markShape="line" marks={[{ value: 30, label: 'Low' }, { value: 80, label: 'High' }]} scale="ticks" tickInterval={25} label="Lines" />
            <Gauge class="ga-mark-text" value={2200} max={3000} scale="ticks" tickInterval={500} marker="needle" fill={false}
                marks={[{ value: 2700, label: 'Recommended', shape: 'text' }]} label="Oven (°C)" />
            <Gauge value={55} marks={[{ value: 20, shape: 'circle' }, { value: 45, shape: 'rhombus' }, { value: 90 }]} scale="ticks" tickInterval={25} label="Mixed" />
        </Stack>
    );
}
```

## Marks that change

A function as `marks` is followed: the marks move when the values they read change.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, NumberBox, Stack } from '@motifx-community/ui';

/** Marks that follow the data: change the target and the limit, and the marks move. */
export default function MovingMarks() {
    const s = reactive({ value: 34, target: 23, limit: 38 });
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <Gauge class="ga-moving-marks" value={() => s.value} min={10} max={40} scale="ticks" tickInterval={5} label="Voltage (kV)"
                marks={() => [{ value: s.target, label: 'Target' }, { value: s.limit, label: 'Limit', shape: 'line' }]} />
            <Stack gap="sm">
                <NumberBox label="Value" x-model={() => s.value} min={10} max={40} />
                <NumberBox label="Target" x-model={() => s.target} min={10} max={40} />
                <NumberBox label="Limit" x-model={() => s.limit} min={10} max={40} />
            </Stack>
        </Stack>
    );
}
```

## On a bar

Marks work the same on a straight gauge.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** Marks on bars: the lowest and highest expected, and a price between its low and high of the day. */
export default function BarMarks() {
    return (
        <Stack gap="md" style="inline-size: 100%">
            <Gauge class="ga-bar-marks" type="linear" value={17} max={30} scale="ticks" tickInterval={5} marks={[{ value: 5, label: 'Lowest' }, { value: 25, label: 'Highest' }]}
                label="Issues closed" />
            <Gauge type="linear" value={28} min={10} max={50} scale="ticks" tickInterval={10} fill={false} marker="circle" markShape="line"
                marks={[{ value: 18, label: 'Low' }, { value: 43, label: 'High' }]} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} label="Price" />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `marks` | `Bind<GaugeMark[]>` | `[]` | Other values marked on the scale: `value`, a `label`, and a `shape` of their own. |
| `markShape` | `Bind<GaugeMarker>` | `'triangle'` | The shape of the marks, unless a mark has its own. |
| `tooltip` | `Bind<boolean>` | `true` | Shows the value or the mark under the pointer. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
