# Gauge

> Gauges · @motifx-community/ui 0.1.0-beta.8

Shows a value against its scale, as an arc, a circle or a straight bar. Ranges give stretches of the scale a meaning, markers and marks point at values, and every part takes its look from the design language.

## Import

```tsx
import { Gauge } from '@motifx-community/ui';
```

## A first gauge

`value` is the value and `label` says what it measures; the scale runs from `min` to `max`, 0 to 100 by default. A function as the value is followed, so the gauge moves with the data.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

/** A value against its scale, following a slider. */
export default function First() {
    const s = reactive({ disk: 64 });
    return (
        <Stack gap="md" align="start">
            <Gauge class="ga-first" value={() => s.disk} label="Disk" format={{ style: 'unit', unit: 'percent' }} />
            <Slider label="Disk" x-model={() => s.disk} min={0} max={100} />
        </Stack>
    );
}
```

## Kinds of gauges

`type` sets the shape. Each kind has its own page.

| Page | Set with | Shows |
| --- | --- | --- |
| `[Circular](gauge-circular.md)` | `type: 'arc'` or `'circle'` | An arc, a whole circle, a half or a quarter, with the value in the middle. |
| `[Linear](gauge-linear.md)` | `type: 'linear'` | A straight bar, across or upright, alone or in a list. |
| `[BarGauge](bar-gauge.md)` | `BarGauge` | Several values against one scale, as bars bent round one middle. |

## Parts of a gauge

The parts work the same on every kind.

| Page | Covers |
| --- | --- |
| `[Scales](gauge-scales.md)` | The ends or ticks with their values, small ticks, ticks of your own, a scale that runs down, formats. |
| `[Ranges](gauge-ranges.md)` | Stretches of the scale with a meaning: tones, colors of your own, the chart colors, and their names read with the value. |
| `[Markers](gauge-markers.md)` | Needles, triangles, circles, rhombuses, lines and callouts that point at the value, with or without the fill. |
| `[Marks](gauge-marks.md)` | Targets and limits marked on the scale, with names, shapes, and values that change. |
| `[Base value](gauge-base.md)` | A fill that grows from a value inside the scale, to either side. |
| `[Dashboards](gauge-dashboards.md)` | Gauges put together and driven by the same values, live. |

## Choosing a gauge

A gauge suits one value whose scale the reader knows. For other needs, other components read better.

| To show | Use |
| --- | --- |
| `One value against a known scale, read at a glance` | `Gauge` |
| `A few values side by side against one scale` | [BarGauge](bar-gauge.md) |
| `How far a task has come` | [ProgressBar](progress.md) |
| `How a value changes over time` | [Chart](chart.md) or [Sparkline](sparkline.md) |
| `Many exact values to compare and sort` | [DataGrid](datagrid.md) |

## Changes and motion

A new value moves the fill and the markers over the motion of the design language. Values that come quicker than that, from a drag or a live feed, are drawn at once, so the gauge never trails behind them. The [Dashboards](gauge-dashboards.md) page shows gauges with live values.

## Creating it programmatically

Each prop is also a property: set it later, and the gauge draws again.

```tsx
import { Component } from '@motifx/core';
import { Button, Gauge, Stack } from '@motifx-community/ui';

/** A gauge created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const gauge = new Gauge({ value: 30, label: 'Queue', scale: 'ticks', tickInterval: 25 });
        const add = new Button({ text: 'Add 10', variant: 'outline', onclick: () => (gauge.value = Math.min(100, (gauge.value ?? 0) + 10)) });
        const needle = new Button({ text: 'Needle on or off', variant: 'outline', onclick: () => (gauge.marker = gauge.marker ? null : 'needle') });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });
        buttons.controls.add(add, needle);
        const stack = new Stack({ gap: 'md', align: 'start' });
        stack.controls.add(gauge, buttons);
        this.controls.add(stack);
    }
}
```

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The value. |
| `min, max` | `Bind<number>` | `0`, `100` | The ends of the scale. A `min` above `max` runs the scale the other way. |
| `type` | `Bind<'arc' \| 'circle' \| 'linear'>` | `'arc'` | How it draws. |
| `orientation` | `Bind<'horizontal' \| 'vertical'>` | `'horizontal'` | Which way a straight gauge runs. |
| `angle` | `Bind<number>` | `240` | How far an arc goes round, in degrees. |
| `rotation` | `Bind<number>` | `0` | How far the middle of an arc is turned from the top, clockwise, in degrees. |
| `ranges` | `Bind<GaugeRange[]>` | `[]` | Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color. |
| `scale` | `Bind<'ends' \| 'ticks' \| 'none'>` | `'ends'` | What the scale shows. |
| `ticks` | `Bind<number[] \| null>` | `null` | The values of the ticks. |
| `tickInterval` | `Bind<number \| null>` | An even step | How far apart the ticks are. |
| `minorTicks` | `Bind<number>` | `0` | How many small ticks go between two ticks. |
| `fill` | `Bind<boolean>` | `true` | Fills the track from `baseValue` to the value. |
| `baseValue` | `Bind<number \| null>` | The start of the scale | Where the fill starts. |
| `marker` | `Bind<'needle' \| 'triangle' \| 'circle' \| 'rhombus' \| 'line' \| 'text' \| null>` | `null` | A shape that points at the value. On a straight gauge a needle is a triangle. |
| `needleShape` | `Bind<'tapered' \| 'straight' \| 'two-tone'>` | `'tapered'` | How a needle is drawn. |
| `marks` | `Bind<GaugeMark[]>` | `[]` | Other values marked on the scale: `value`, a `label`, and a `shape` of their own. |
| `markShape` | `Bind<GaugeMarker>` | `'triangle'` | The shape of the marks, unless a mark has its own. |
| `label` | `Bind<string>` | `''` | What it measures, shown under the value and read as its name. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |
| `showValue` | `Bind<boolean>` | `true` | Shows the value in the middle. |
| `tooltip` | `Bind<boolean>` | `true` | Shows the value or the mark under the pointer. |
| `size` | `Bind<number \| null>` | From the design language | The width of an arc's whole circle, or the length of an upright gauge, in pixels. |

### GaugeRange

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `from, to` | `number` | Required | The ends of the range, in either order. |
| `tone` | `'neutral' \| 'good' \| 'warning' \| 'danger'` |  | A meaning in the colors of the design language. The fill takes it while the value is in the range. |
| `color` | `string` |  | A color of your own instead of a tone. |
| `label` | `string` |  | A name for the range, read with the value. |

### GaugeMark

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | Required | The value marked. |
| `label` | `string` |  | What it is, read with the gauge's value and shown in the tooltip. |
| `shape` | `GaugeMarker` | The gauge's `markShape` | Its shape: `needle`, `triangle`, `circle`, `rhombus`, `line` or `text`. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Role` | It is a meter: assistive technology reads its value, its scale, the range the value is in, and the marks with their names. |
| `Color` | A tone is never the only sign: the value is written, and a range's label is read with it. |
| `Motion` | A change of value moves over the motion of the design language, and at once when the reader prefers reduced motion. Values that come quicker than the motion, from a drag or a fast feed, are drawn at once, so the gauge keeps up with them. |

## Feedback

Loading issues…
