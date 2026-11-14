# Gauge: Base value

> Gauges · @motifx-community/ui 0.1.0-beta.10

The fill starts at the start of the scale, or at a base value inside it. A scale with values on both sides of a target then fills from the target, either way.

## Either way from a target

`baseValue` sets where the fill starts. A deviation fills from 0 to the left or to the right, on an arc and on a bar.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

const degrees = (v: number) => `${v}°`;

/** A deviation from the target: the fill grows from 0 to either side. */
export default function Deviation() {
    const s = reactive({ angle: 20 });
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" gap="lg" wrap align="end">
                <Gauge class="ga-base" angle={90} min={-45} max={45} baseValue={0} value={() => s.angle} scale="ticks" tickInterval={45} format={degrees}
                    label="Deviation" size={240} />
                <Gauge class="ga-base-bar" type="linear" orientation="vertical" size={180} min={-45} max={45} baseValue={0} value={() => s.angle}
                    scale="ticks" tickInterval={15} format={degrees} label="Deviation" />
            </Stack>
            <Slider label="Deviation" x-model={() => s.angle} min={-45} max={45} />
        </Stack>
    );
}
```

## Losses and profits

Bars in a list, each filling from 0: a loss to the left in the danger tone, a profit to the right in the good tone.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

const MONTHS = [
    { name: 'January', change: 12 },
    { name: 'February', change: -7 },
    { name: 'March', change: 4 },
    { name: 'April', change: -15 }
];

const RESULT = [
    { from: -20, to: 0, tone: 'danger' as const, label: 'loss' },
    { from: 0, to: 20, tone: 'good' as const, label: 'profit' }
];

/** Changes against last year, one bar each: a loss fills to the left of 0, a profit to the right. */
export default function Balance() {
    return (
        <Stack class="ga-balance" gap="md" style="inline-size: 100%">
            {MONTHS.map(m => (
                <Gauge type="linear" value={m.change} min={-20} max={20} baseValue={0} label={m.name} ranges={RESULT} scale="ticks" tickInterval={10}
                    format={{ style: 'unit', unit: 'percent', signDisplay: 'exceptZero' }} />
            ))}
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `baseValue` | `Bind<number \| null>` | The start of the scale | Where the fill starts. |
| `fill` | `Bind<boolean>` | `true` | Fills the track from `baseValue` to the value. |
| `ranges` | `Bind<GaugeRange[]>` | `[]` | Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
