# BarGauge

> Gauges · @motifx-community/ui 0.1.0-beta.8

Shows several values side by side as bars bent round one middle, each against the same scale. It compares a few values at a glance, in little room.

## Import

```tsx
import { BarGauge } from '@motifx-community/ui';
```

## A first bar gauge

`data` takes the values, the first one on the outside. Each value is written at the end of its bar.

```tsx
import { BarGauge } from '@motifx-community/ui';

/** Four ratings against the same scale, each written at the end of its bar. */
export default function Basic() {
    return <BarGauge class="bg-basic" data={[47.3, 65.3, 84.6, 71.9]} format={{ style: 'unit', unit: 'percent', maximumFractionDigits: 1 }} label="Ratings" />;
}
```

## More about bar gauges

Each part has its own page.

| Page | Covers |
| --- | --- |
| `[Labels and legend](bar-gauge-labels.md)` | Values at the ends of the bars, formats, a legend and the tooltip. |
| `[Data](bar-gauge-data.md)` | Numbers or rows, fields and functions, bars both ways, a changing number of bars, live values. |
| `[Angles and size](bar-gauge-angles.md)` | A whole circle, halves and quarters, and many bars in one gauge. |

## Creating it programmatically

Each prop is also a property: set it later, and the gauge draws again. A new bar grows from the base value.

```tsx
import { Component } from '@motifx/core';
import { BarGauge, Button, Stack } from '@motifx-community/ui';

/** A bar gauge created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const gauge = new BarGauge({ data: [42, 67], label: 'Goals' });
        const add = new Button({ text: 'Add a bar', variant: 'outline', onclick: () => (gauge.data = [...gauge.data, Math.round(20 + Math.random() * 70)]) });
        const legend = new Button({ text: 'Legend on or off', variant: 'outline', onclick: () => (gauge.legend = !gauge.legend) });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });
        buttons.controls.add(add, legend);
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
| `data` | `Bind<(T \| number)[]>` | `[]` | The values: numbers, or rows with `valueField`. They are read and never changed. |
| `valueField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds its value, or a function that reads it. |
| `nameField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds its name, shown in the legend and the tooltip and read with its value. |
| `colorField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds a color of its own. |
| `min, max` | `Bind<number>` | `0`, `100` | The ends of the scale. |
| `baseValue` | `Bind<number \| null>` | The start of the scale | Where the bars start, so they grow both ways from a value inside the scale. |
| `angle` | `Bind<number>` | `270` | How far the bars go round, in degrees. |
| `rotation` | `Bind<number>` | `0` | How far the middle of the bars is turned from the top, clockwise, in degrees. |
| `colors` | `Bind<string[] \| null>` | The chart colors | Colors of your own, in the order of the values. |
| `label` | `Bind<string>` | `''` | What the values are, read as its name. |
| `format` | `Bind<ChartFormat \| null>` | The language's numbers | How the values read: options of the browser's number format, or a function of your own. |
| `showLabels` | `Bind<boolean>` | `true` | Writes each value at the end of its bar. |
| `legend` | `Bind<boolean>` | `false` | Shows a legend of the names under the bars. |
| `tooltip` | `Bind<boolean>` | `true` | Shows the value under the pointer. |
| `size` | `Bind<number \| null>` | From the design language | The width of the bars' whole circle in pixels. |

### Members

| Member | Description |
| --- | --- |
| `refresh()` | Draws again after the given rows were changed in place. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Role` | It has the role `img`, and its name gives every value with its name. |
| `Color` | A color is never the only sign: each value is written at the end of its bar, or named in the legend. |
| `Motion` | A change moves over the motion of the design language, and at once when the reader prefers reduced motion. A new bar grows from the base value. |

## Feedback

Loading issues…
