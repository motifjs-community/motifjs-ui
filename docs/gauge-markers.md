# Gauge: Markers

> Gauges · @motifx-community/ui 0.1.0-beta.11

A marker points at the value: a needle from the middle of an arc, a shape on or beside the track, or a callout that writes the value.

## Needles

`marker: 'needle'` draws a needle from the middle, and `needleShape` sets how: narrowing to its tip, straight, or straight with its tip in the color of the value's range.

```tsx
import { Gauge, Stack, type GaugeNeedleShape } from '@motifx-community/ui';

const NEEDLES: { shape: GaugeNeedleShape; value: number; label: string }[] = [
    { shape: 'tapered', value: 75, label: 'Tapered' },
    { shape: 'straight', value: 62, label: 'Straight' },
    { shape: 'two-tone', value: 80, label: 'Two-tone' }
];

/** The three needles, on a half arc without a fill. A two-tone needle's tip takes the color of the value's range. */
export default function Needles() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            {NEEDLES.map(n => (
                <Gauge class="ga-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker="needle" needleShape={n.shape} value={n.value} label={n.label}
                    ranges={[{ from: 80, to: 100, tone: 'danger' }]} />
            ))}
        </Stack>
    );
}
```

## Shapes on the track

A triangle points at the value from outside the track; a circle, a rhombus and a line sit on it. Turn `fill` off to show the value with the marker alone.

```tsx
import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';

const SHAPES: { marker: GaugeMarker; value: number; label: string }[] = [
    { marker: 'triangle', value: 85, label: 'Triangle' },
    { marker: 'circle', value: 65, label: 'Circle' },
    { marker: 'rhombus', value: 80, label: 'Rhombus' },
    { marker: 'line', value: 75, label: 'Line' }
];

/** A triangle outside the track, and a circle, a rhombus and a line on it. */
export default function TrackShapes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            {SHAPES.map(s => (
                <Gauge class="ga-track-marker" angle={180} fill={false} scale="ticks" tickInterval={50} marker={s.marker} value={s.value} label={s.label} />
            ))}
        </Stack>
    );
}
```

## Callout

`marker: 'text'` writes the value in a callout that points at it: inside an arc, beside a bar. The value in the middle is then left out.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** The value written in a callout that points at it: inside an arc, beside a bar. */
export default function Callout() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-callout" angle={180} fill={false} scale="ticks" tickInterval={50} marker="text" value={70} label="Arc" />
            <Gauge type="linear" fill={false} scale="ticks" tickInterval={25} marker="text" value={70} label="Bar" style="flex: 1 1 16rem" />
        </Stack>
    );
}
```

## On a bar

Every marker works on a straight gauge too; a needle is drawn there as a triangle.

```tsx
import { Gauge, Stack, type GaugeMarker } from '@motifx-community/ui';

const BARS: { marker: GaugeMarker; value: number; label: string }[] = [
    { marker: 'triangle', value: 85, label: 'Triangle' },
    { marker: 'circle', value: 65, label: 'Circle' },
    { marker: 'rhombus', value: 80, label: 'Rhombus' },
    { marker: 'line', value: 75, label: 'Line' },
    { marker: 'text', value: 70, label: 'Callout' }
];

/** Each marker on a bar across. On a straight gauge a needle is drawn as a triangle. */
export default function BarMarkers() {
    return (
        <Stack gap="md" style="inline-size: 100%">
            {BARS.map(b => (
                <Gauge class="ga-bar-marker" type="linear" fill={false} scale="ticks" tickInterval={25} marker={b.marker} value={b.value} label={b.label} />
            ))}
        </Stack>
    );
}
```

## Marker and fill together

A marker over the fill keeps the value easy to find on a long scale.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** A fill with a needle over it, and a fill with a triangle that keeps the value easy to find. */
export default function FillAndMarker() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={128} max={240} marker="needle" scale="ticks" tickInterval={40} label="km/h" />
            <Gauge value={62} marker="triangle" scale="ticks" tickInterval={25} label="Progress" format={{ style: 'unit', unit: 'percent' }} />
            <Gauge type="linear" orientation="vertical" size={180} value={62} marker="triangle" scale="ticks" tickInterval={25} label="Level" />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `marker` | `Bind<'needle' \| 'triangle' \| 'circle' \| 'rhombus' \| 'line' \| 'text' \| null>` | `null` | A shape that points at the value. On a straight gauge a needle is a triangle. |
| `needleShape` | `Bind<'tapered' \| 'straight' \| 'two-tone'>` | `'tapered'` | How a needle is drawn. |
| `fill` | `Bind<boolean>` | `true` | Fills the track from `baseValue` to the value. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
