# Gauge: Circular

> Gauges · @motifx-community/ui 0.1.0-beta.10

A circular gauge shows its value on an arc or a whole circle, with the value written in the middle. It reads best for one value whose scale the reader knows, such as a speed or a share.

## Arc and circle

`type` draws an open arc, `'arc'`, or a whole circle, `'circle'`. `angle` sets how far an arc goes round: 240 degrees by default, open at the bottom.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** The default arc of 240 degrees, a wider one of 300, and a whole circle. */
export default function ArcCircle() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-arc" value={72} label="Arc" />
            <Gauge angle={300} value={72} label="Wide arc" />
            <Gauge class="ga-circle" type="circle" value={72} label="Circle" />
        </Stack>
    );
}
```

## Half and quarter

`angle` of 180 draws a half and 90 a quarter; `rotation` turns the arc, here to each corner. A quarter has little room inside, so its value is better left out with `showValue`.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** A half, and a quarter turned to each corner. A quarter has little room inside, so its value is left out. */
export default function HalfQuarter() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-half" angle={180} value={72} label="Half" />
            <Gauge class="ga-quarter" angle={90} rotation={-45} value={80} label="Upper left" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={45} value={75} label="Upper right" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={135} value={70} label="Lower right" showValue={false} scale="ticks" tickInterval={50} />
            <Gauge angle={90} rotation={-135} value={68} label="Lower left" showValue={false} scale="ticks" tickInterval={50} />
        </Stack>
    );
}
```

## Size

`size` sets the width of the arc's whole circle, with its ranges. Ticks, their values and marks go around it, so a scale never makes the arc smaller.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** The same gauge at three sizes. The track keeps the thickness of the design language. */
export default function Sizes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-small" size={120} value={40} label="120 px" />
            <Gauge value={40} label="Design language" />
            <Gauge class="ga-large" size={220} value={40} label="220 px" scale="ticks" tickInterval={10} />
        </Stack>
    );
}
```

## Value and label

The value is written in the middle with `format`, and `label` under it. `showValue` leaves the value out. With a needle, the value moves under the arc to keep the middle clear.

```tsx
import { Gauge, Stack } from '@motifx-community/ui';

/** The value in the middle with a unit, a gauge that shows only its fill, and a needle that moves the value under the arc. */
export default function ValueLabel() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={21.5} label="Room" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />
            <Gauge value={21.5} max={40} label="Room" showValue={false} />
            <Gauge class="ga-needle-value" value={21.5} max={40} label="Room" marker="needle" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `Bind<'arc' \| 'circle' \| 'linear'>` | `'arc'` | How it draws. |
| `angle` | `Bind<number>` | `240` | How far an arc goes round, in degrees. |
| `rotation` | `Bind<number>` | `0` | How far the middle of an arc is turned from the top, clockwise, in degrees. |
| `size` | `Bind<number \| null>` | From the design language | The width of an arc's whole circle, or the length of an upright gauge, in pixels. |
| `showValue` | `Bind<boolean>` | `true` | Shows the value in the middle. |
| `label` | `Bind<string>` | `''` | What it measures, shown under the value and read as its name. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
