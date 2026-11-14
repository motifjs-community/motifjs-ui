# Gauge: Dashboards

> Gauges · @motifx-community/ui 0.1.0-beta.11

Gauges of different kinds put together, all following the same values. Each gauge keeps its own scale, so readers compare values by their meaning, not by size alone.

## Upright gauges side by side

Three upright gauges, each showing its value its own way, follow the city chosen: a fill from 0, a rhombus, and a circle among ranges.

```tsx
import { reactive } from '@motifx/core';
import { DropDown, Gauge, Stack } from '@motifx-community/ui';

const CITIES = [
    { name: 'Ankara', temperature: 14, humidity: 48, pressure: 1016 },
    { name: 'Lisbon', temperature: 21, humidity: 67, pressure: 1021 },
    { name: 'Oslo', temperature: -6, humidity: 81, pressure: 994 },
    { name: 'Cairo', temperature: 33, humidity: 22, pressure: 1009 }
];

const PRESSURE = [
    { from: 900, to: 1000, label: 'low' },
    { from: 1000, to: 1020, label: 'normal' },
    { from: 1020, to: 1100, label: 'high' }
];

/** Three upright gauges, each showing its value its own way: a fill from 0, a rhombus, a circle among ranges. */
export default function Weather() {
    const s = reactive({ city: 'Ankara' as string | null });
    const city = () => CITIES.find(c => c.name === s.city) ?? CITIES[0];
    return (
        <Stack gap="lg" align="center">
            <Stack orientation="horizontal" gap="xl" wrap justify="center">
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={-40} max={40} baseValue={0} scale="ticks" tickInterval={20}
                    value={() => city().temperature} label="Temperature (°C)" />
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} scale="ticks" tickInterval={10} fill={false} marker="rhombus"
                    value={() => city().humidity} label="Humidity (%)" />
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]}
                    fill={false} marker="circle" value={() => city().pressure} label="Pressure (hPa)" ranges={PRESSURE} />
            </Stack>
            <DropDown label="City" items={CITIES} textField="name" valueField="name" x-model={() => s.city} />
        </Stack>
    );
}
```

## A dashboard

A speedometer with a needle, four quarter gauges around it, and a fuel bar, all driven by one slider.

```tsx
import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

/** Gauges put together: a speedometer, four quarter gauges around it and a fuel bar, all driven by one slider. */
export default function Dashboard() {
    const s = reactive({ speed: 80 });
    const quarter = (rotation: number, label: string, value: () => number) => (
        <Gauge class="ga-dash-quarter" angle={90} rotation={rotation} size={130} value={value} label={label} showValue={false} scale="ticks" tickInterval={50} />
    );
    return (
        <Stack gap="lg" align="center">
            <Stack orientation="horizontal" gap="md" align="center" wrap justify="center">
                <Stack gap="md">
                    {quarter(-45, 'Oil', () => s.speed / 2)}
                    {quarter(-135, 'Water', () => 100 - s.speed / 2)}
                </Stack>
                <Gauge class="ga-speed" value={() => s.speed} max={200} size={220} angle={270} scale="ticks" tickInterval={20} minorTicks={1}
                    marker="needle" label="km/h" ranges={[{ from: 160, to: 200, tone: 'danger' }]} />
                <Stack gap="md">
                    {quarter(45, 'Load', () => s.speed / 2)}
                    {quarter(135, 'Charge', () => 100 - s.speed / 2)}
                </Stack>
            </Stack>
            <Gauge class="ga-fuel" type="linear" value={() => 50 - s.speed * 0.2} max={50} scale="ticks" tickInterval={25} minorTicks={1}
                format={{ maximumFractionDigits: 0 }} label="Fuel (l)" />
            <Slider label="Speed" x-model={() => s.speed} min={0} max={200} />
        </Stack>
    );
}
```

## Live values

New values every second. Each change moves over the motion of the design language, and values that come quicker than it are drawn at once.

```tsx
import { reactive } from '@motifx/core';
import { Button, Gauge, Stack } from '@motifx-community/ui';

const LOAD = [
    { from: 0, to: 70, tone: 'good' as const, label: 'normal' },
    { from: 70, to: 90, tone: 'warning' as const, label: 'high' },
    { from: 90, to: 100, tone: 'danger' as const, label: 'critical' }
];

const walk = (v: number, step: number) => Math.max(2, Math.min(98, v + Math.round(Math.random() * step * 2 - step)));

/** New values every second. Each change moves over the motion of the design language. */
export default function ServerLoad() {
    const s = reactive({ running: true, cpu: 46, memory: 62, disk: 31 });
    const timer = setInterval(() => {
        if (!s.running) return;
        s.cpu = walk(s.cpu, 12);
        s.memory = walk(s.memory, 4);
        s.disk = walk(s.disk, 8);
    }, 1000);
    return (
        <Stack gap="md" align="start" onDisposing={() => clearInterval(timer)}>
            <Stack orientation="horizontal" gap="lg" wrap align="end">
                <Gauge class="ga-live" value={() => s.cpu} ranges={LOAD} label="Processor" format={{ style: 'unit', unit: 'percent' }} />
                <Gauge value={() => s.memory} ranges={LOAD} marker="needle" fill={false} scale="ticks" tickInterval={25} label="Memory" format={{ style: 'unit', unit: 'percent' }} />
                <Gauge type="linear" orientation="vertical" size={160} value={() => s.disk} ranges={LOAD} scale="ticks" tickInterval={25} label="Disk" />
            </Stack>
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />
        </Stack>
    );
}
```

## Props on this page

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<number \| null>` | `null` | The value. |
| `marker` | `Bind<'needle' \| 'triangle' \| 'circle' \| 'rhombus' \| 'line' \| 'text' \| null>` | `null` | A shape that points at the value. On a straight gauge a needle is a triangle. |
| `ranges` | `Bind<GaugeRange[]>` | `[]` | Stretches of the scale: `from`, `to`, `tone` or `color`, and a `label` read with the value. A range with neither a tone nor a color takes the next chart color. |

Every other prop, and the types of ranges and marks, are on the [Overview](gauge.md#api).

## Feedback

Loading issues…
