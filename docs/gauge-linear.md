# Gauge: Linear

> Gauges · @motifx-community/ui 0.1.0-beta.7

A linear gauge shows its value on a straight bar, across or upright. Bars fit in narrow places, line up in lists, and compare well side by side.

## Across

`type: 'linear'` draws a bar across the width it is given. The label and the value sit above it; the ends of the scale sit under its ends, or ticks with `scale`.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** A bar across with the ends of its scale under its ends, and one with ticks. The label and the value sit above. */
export default function Across() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Gauge class="ga-linear" type="linear" value={72} label="Storage" format={{ style: 'unit', unit: 'gigabyte' }} max={128} />
            <Gauge type="linear" value={4.3} max={5} scale="ticks" tickInterval={1} minorTicks={3} label="Rating" format={{ maximumFractionDigits: 1 }} />
        </Stack>
    );
}
```

## Upright

`orientation: 'vertical'` stands the bar upright, and `size` sets its length. The label sits above and the value under it.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** Upright gauges: `size` sets their length. The label sits above and the value under them. */
export default function Upright() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-upright" type="linear" orientation="vertical" size={160} value={72} label="Tank" scale="ticks" />
            <Gauge type="linear" orientation="vertical" size={220} value={35} max={50} label="Fuel (l)" scale="ticks" tickInterval={10} minorTicks={1} />
            <Gauge type="linear" orientation="vertical" size={120} value={0.8} max={1} label="Load" format={{ style: 'percent' }} />
        </Stack>
    );
}
```

## In a list

Bars one under another read as a list. Here a range marks the last tenth of each drive, and its tone shows when a drive is almost full.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

const DRIVES = [
    { name: 'System', used: 212, size: 256 },
    { name: 'Projects', used: 640, size: 1000 },
    { name: 'Backup', used: 1880, size: 2000 }
];

/** Bars in a list, one for each drive. A drive more than 90 percent full takes the danger tone. */
export default function Drives() {
    return (
        <Stack class="ga-drives" gap="md" style="inline-size: 100%">
            {DRIVES.map(d => (
                <Gauge type="linear" value={d.used} max={d.size} label={d.name} format={{ style: 'unit', unit: 'gigabyte' }}
                    ranges={[{ from: d.size * 0.9, to: d.size, tone: 'danger', label: 'almost full' }]} />
            ))}
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `Bind<'arc' \| 'circle' \| 'linear'>` | `'arc'` | How it draws. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | Which way a straight gauge runs. |
| `size` | `Bind<number \| null>` | From the design language | The width of an arc's whole circle, or the length of an upright gauge, in pixels. |
| `label` | `Bind<string>` | `''` | What it measures, shown under the value and read as its name. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
