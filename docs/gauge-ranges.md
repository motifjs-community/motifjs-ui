# Gauge: Ranges

> Gauges · @motifx-community/ui 0.1.0-beta.8

Ranges give stretches of the scale a meaning, such as normal, high and critical. They show as a band beside the track, and the fill takes the color of the range its value is in.

## Tones

`tone` takes a meaning in the colors of the design language: `good`, `warning`, `danger` or `neutral`. The fill changes color where it crosses into a range.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

/** The fill takes the tone of the range its value is in; the ranges show as a band outside the track. */
export default function Ranges() {
    const s = reactive({ cpu: 64 });
    return (
        <Stack gap="md">
            <Gauge
                class="ga-ranges"
                value={() => s.cpu}
                label="CPU"
                format={{ style: 'unit', unit: 'percent' }}
                ranges={[
                    { from: 0, to: 70, tone: 'good', label: 'normal' },
                    { from: 70, to: 90, tone: 'warning', label: 'high' },
                    { from: 90, to: 100, tone: 'danger', label: 'critical' }
                ]}
            />
            <Slider label="CPU" x-model={() => s.cpu} min={0} max={100} />
        </Stack>
    );
}
```

## Colors of your own

`color` takes any color instead of a tone.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

const BANDS = [
    { from: 0, to: 18.5, color: '#4f8fd8', label: 'under' },
    { from: 18.5, to: 25, color: '#3c9a5f', label: 'normal' },
    { from: 25, to: 30, color: '#d9a400', label: 'over' },
    { from: 30, to: 40, color: '#c8463b', label: 'high' }
];

/** Ranges in colors of your own. A color is never the only sign: the range's name is read with the value. */
export default function OwnColors() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-own" value={23.4} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" />
            <Gauge type="linear" value={27.1} min={10} max={40} ranges={BANDS} scale="ticks" ticks={[10, 18.5, 25, 30, 40]} label="Body mass index" style="flex: 1 1 16rem" />
        </Stack>
    );
}
```

## Chart colors

A range with neither a tone nor a color takes the next chart color, so ranges without a meaning of good or bad still read apart.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

const PRESSURE = [
    { from: 900, to: 1000, label: 'low' },
    { from: 1000, to: 1020, label: 'normal' },
    { from: 1020, to: 1100, label: 'high' }
];

/** Ranges with neither a tone nor a color take the chart colors in order. */
export default function ChartColors() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-chart-colors" value={1016} min={900} max={1100} ranges={PRESSURE} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
            <Gauge type="linear" orientation="vertical" size={200} value={1016} min={900} max={1100} ranges={PRESSURE} fill={false} marker="circle"
                scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
        </Stack>
    );
}
```

## Read with the value

A range's `label` is read with the value by assistive technology, so the meaning does not rest on color alone.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

const RANGES = [
    { from: 0, to: 60, tone: 'good' as const, label: 'quiet' },
    { from: 60, to: 85, tone: 'warning' as const, label: 'loud' },
    { from: 85, to: 120, tone: 'danger' as const, label: 'harmful' }
];

const decibels = (v: number) => `${v} dB`;

/** What assistive technology reads: the value with the name of its range, shown here under the gauge. */
export default function ReadRange() {
    const s = reactive({ level: 52, read: '' });
    // Shows the text the gauge gives assistive technology each time it changes.
    const follow = (gauge: Gauge) => {
        const show = () => (s.read = gauge.element.getAttribute('aria-valuetext') ?? '');
        new MutationObserver(show).observe(gauge.element, { attributes: true, attributeFilter: ['aria-valuetext'] });
        show();
    };
    return (
        <Stack gap="md" align="start">
            <Gauge ref={follow} class="ga-read" value={() => s.level} max={120} ranges={RANGES}
                format={decibels} label="Noise" />
            <output class="ga-read-out">{() => `Read as: ${s.read}`}</output>
            <Slider label="Noise" x-model={() => s.level} min={0} max={120} />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ranges` | `Bind<GaugeRange[]>` | `[]` | Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
