# BarGauge: Angles and size

> Gauges · @motifx-community/ui 0.1.0-beta.10

How far the bars go round and which way they face fit a bar gauge to the room it has.

## Circle and halves

`angle` sets how far the bars go round: 270 degrees by default, a whole circle at 360. `rotation` turns them.

```tsx
import { BarGauge, Stack } from '@motifx-community/ui';

const VALUES = [72, 54, 38];

/** A whole circle, a half that opens downward, and a half turned to the right. */
export default function Shapes() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge class="bg-circle" data={VALUES} angle={360} size={160} label="Whole circle" />
            <BarGauge class="bg-half" data={VALUES} angle={180} size={180} label="Half" />
            <BarGauge class="bg-side" data={VALUES} angle={180} rotation={90} size={160} label="Half turned" />
        </Stack>
    );
}
```

## Quarters

A quarter turned to a corner fits the corner of a card.

```tsx
import { BarGauge, Stack } from '@motifx-community/ui';

const VALUES = [72, 54, 38];

/** Quarters turned to each corner, for a gauge in the corner of a card. */
export default function Directions() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge data={VALUES} angle={90} rotation={-45} size={180} label="Upper left" />
            <BarGauge data={VALUES} angle={90} rotation={45} size={180} label="Upper right" />
            <BarGauge data={VALUES} angle={90} rotation={135} size={180} label="Lower right" />
            <BarGauge data={VALUES} angle={90} rotation={-135} size={180} label="Lower left" />
        </Stack>
    );
}
```

## Many bars

`size` sets the width of the whole circle. With many bars they grow thinner, so the middle stays open.

```tsx
import { BarGauge } from '@motifx-community/ui';

const SKILLS = [
    { name: 'Reading', value: 82 },
    { name: 'Writing', value: 64 },
    { name: 'Listening', value: 91 },
    { name: 'Speaking', value: 58 },
    { name: 'Grammar', value: 73 },
    { name: 'Vocabulary', value: 69 },
    { name: 'Spelling', value: 77 },
    { name: 'Pronunciation', value: 61 }
];

/** Eight bars: they grow thinner so the middle stays open. */
export default function Many() {
    return <BarGauge class="bg-many" data={SKILLS} valueField="value" nameField="name" size={260} showLabels={false} legend label="Skills" />;
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `angle` | `Bind<number>` | `270` | How far the bars go round, in degrees. |
| `rotation` | `Bind<number>` | `0` | How far the middle of the bars is turned from the top, clockwise, in degrees. |
| `size` | `Bind<number \| null>` | From the design language | The width of the bars' whole circle in pixels. |
| `colors` | `Bind<string[] \| null>` | The chart colors | Colors of your own, in the order of the values. |

Every other prop and member is on the [Overview](bar-gauge.md#api).

## Feedback

Loading issues…
