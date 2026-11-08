# Gauge: Scales

> Gauges · @motifx-community/ui 0.1.0-beta.8

The scale tells the reader how to read the value: its ends, ticks with their values, or nothing at all.

## Ticks

`scale: 'ticks'` draws ticks with their values. `tickInterval` sets the step, or an even step that fits the size is chosen. `minorTicks` puts small ticks between them.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** Ticks every 100 with three small ones between, and ticks at an even step chosen for the size. */
export default function Ticks() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-minor" value={750} max={1000} scale="ticks" tickInterval={100} minorTicks={3} label="Fan speed (rpm)" />
            <Gauge value={63} scale="ticks" label="Even step" />
            <Gauge type="linear" orientation="vertical" size={180} value={63} scale="ticks" minorTicks={1} label="Upright" />
        </Stack>
    );
}
```

## Ticks of your own

`ticks` places ticks only at the values given, where they mean something.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** Ticks only where they mean something: the reserve, half and full; the limits of normal pressure. */
export default function OwnTicks() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-custom" type="linear" orientation="vertical" size={180} value={35} max={50} scale="ticks" ticks={[0, 10, 25, 50]} label="Fuel (l)" />
            <Gauge value={1016} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
        </Stack>
    );
}
```

## A scale that runs down

A `min` above `max` runs the scale the other way, for what is counted down.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** A scale from 100 down to 0: what is left, counted down. */
export default function Reversed() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-down" value={30} min={100} max={0} scale="ticks" tickInterval={20} label="Remaining" />
            <Gauge type="linear" orientation="vertical" size={180} value={30} min={100} max={0} scale="ticks" tickInterval={25} label="Depth (m)" />
        </Stack>
    );
}
```

## Formats

`format` writes the value and the scale: options of the browser's number format, in the language of the page, or a function of your own.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

const degrees = (v: number) => `${v}°`;

/** Values as a percentage, as money, and through a function of your own. */
export default function Formats() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge angle={180} value={45} scale="ticks" tickInterval={25} format={{ style: 'unit', unit: 'percent' }} label="Battery" />
            <Gauge angle={180} value={7400} max={10000} scale="ticks" tickInterval={2500} format={{ style: 'currency', currency: 'EUR', notation: 'compact' }} label="Budget" />
            <Gauge class="ga-degrees" angle={180} value={20} min={-45} max={45} scale="ticks" tickInterval={45} format={degrees} label="Angle" />
        </Stack>
    );
}
```

## Ends, ticks or nothing

`scale` shows the two ends, `'ends'`, ticks, `'ticks'`, or nothing, `'none'`, where the value alone is enough.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** The two ends, ticks with their values, and no scale at all. */
export default function ScaleModes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={58} scale="ends" label="Ends" />
            <Gauge value={58} scale="ticks" tickInterval={25} label="Ticks" />
            <Gauge value={58} scale="none" label="None" />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | `Bind<'ends' \| 'ticks' \| 'none'>` | `'ends'` | What the scale shows. |
| `ticks` | `Bind<number[] \| null>` | `null` | The values of the ticks. |
| `tickInterval` | `Bind<number \| null>` | An even step | How far apart the ticks are. |
| `minorTicks` | `Bind<number>` | `0` | How many small ticks go between two ticks. |
| `min, max` | `Bind<number>` | `0`, `100` | The ends of the scale. A `min` above `max` runs the scale the other way. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
