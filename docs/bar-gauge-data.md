# BarGauge: Data

> Gauges · @motifx-community/ui 0.1.0-beta.11

A bar gauge reads numbers, or rows through their fields, and follows them as they change.

## Numbers or rows

`data` takes numbers, or rows with `valueField` and `nameField`. A field can be a function that works the value out; the rows stay as they are.

```tsx
import { BarGauge } from '@motifx-community/ui';

interface Team {
    team: string;
    done: number;
    planned: number;
}

const TEAMS: Team[] = [
    { team: 'Design', done: 18, planned: 24 },
    { team: 'Web', done: 31, planned: 36 },
    { team: 'Mobile', done: 12, planned: 30 }
];

/** Rows read through fields: the value is worked out by a function, the share of the work done. */
export default function Rows() {
    return (
        <BarGauge<Team> class="bg-rows" data={TEAMS} valueField={t => Math.round((t.done / t.planned) * 100)} nameField="team" legend
            format={{ style: 'unit', unit: 'percent' }} label="Work done" />
    );
}
```

## Both ways from a base value

`baseValue` sets where the bars start, so values below and above it go either way.

```tsx
import { BarGauge } from '@motifx-community/ui';

const mm = (v: number) => `${v.toFixed(2)} mm`;

/** Deviations from a measure: the bars start at 0 and go either way. */
export default function BothWays() {
    return <BarGauge class="bg-both" data={[-2.13, 1.48, -3.09, 4.52, 3.9]} min={-5} max={5} baseValue={0} format={mm} label="Deviations of the parts" />;
}
```

## A changing number of bars

The bars follow the data: a new bar grows from the base value. `colorField` keeps each row's color, so the others keep theirs when one goes.

```tsx
import { reactive } from '@motifx/core';
import { BarGauge, CheckBox, Stack } from '@motifx-community/ui';

/** As many bars as goods chosen. Each row keeps its own color, so a bar does not change color when another goes. */
export default function Changing() {
    const goods = reactive([
        { name: 'Hammers', count: 41, color: 'var(--mx-color-chart-series-1)', on: true },
        { name: 'Shovels', count: 32, color: 'var(--mx-color-chart-series-2)', on: true },
        { name: 'Ladders', count: 13, color: 'var(--mx-color-chart-series-3)', on: true },
        { name: 'Watering cans', count: 48, color: 'var(--mx-color-chart-series-4)', on: true },
        { name: 'Screwdrivers', count: 24, color: 'var(--mx-color-chart-series-5)', on: true },
        { name: 'Drills', count: 19, color: 'var(--mx-color-chart-series-6)', on: true }
    ]);
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge class="bg-changing" data={() => goods.filter(g => g.on)} valueField="count" nameField="name" colorField="color" max={50}
                label="Goods sold" legend />
            <Stack gap="sm">
                {goods.map(g => (
                    <CheckBox label={g.name} x-model={() => g.on} />
                ))}
            </Stack>
        </Stack>
    );
}
```

## Live values

New values every second. Each change moves over the motion of the design language.

```tsx
import { reactive } from '@motifx/core';
import { BarGauge, Button, Stack } from '@motifx-community/ui';

const walk = (v: number) => Math.max(5, Math.min(95, v + Math.round(Math.random() * 20 - 10)));

/** New values every second for each line of production. Each change moves over the motion of the design language. */
export default function LiveBars() {
    const s = reactive({ running: true, lines: [{ name: 'Line A', load: 64 }, { name: 'Line B', load: 41 }, { name: 'Line C', load: 78 }] });
    const timer = setInterval(() => {
        if (s.running) s.lines = s.lines.map(l => ({ ...l, load: walk(l.load) }));
    }, 1000);
    return (
        <Stack gap="md" align="start" onDisposing={() => clearInterval(timer)}>
            <BarGauge class="bg-live" data={() => s.lines} valueField="load" nameField="name" legend format={{ style: 'unit', unit: 'percent' }} label="Load" />
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Bind<(T \| number)[]>` | `[]` | The values: numbers, or rows with `valueField`. They are read and never changed. |
| `valueField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds its value, or a function that reads it. |
| `nameField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds its name, shown in the legend and the tooltip and read with its value. |
| `colorField` | `Bind<ChartField<T> \| null>` | `null` | The field of a row that holds a color of its own. |
| `baseValue` | `Bind<number \| null>` | The start of the scale | Where the bars start, so they grow both ways from a value inside the scale. |
| `min, max` | `Bind<number>` | `0`, `100` | The ends of the scale. |

Every other prop and member is on the [Overview](bar-gauge.md#api).

## Feedback

Loading issues…
