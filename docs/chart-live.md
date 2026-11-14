# Chart: Live data

> Charts · @motifx-community/ui 0.1.0-beta.11

A chart follows its data: reactive values redraw it, and live data moves along with the latest values.

## Live data

`span` on the position axis shows only the latest stretch: a time in milliseconds, a number, or a count of categories. When the values change, the marks move from where they were, over the design language's motion.

```tsx
import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';

const SECOND = 1000;

/** New values arrive every second, and the chart shows the last 30 seconds. The marks move from where they were. */
export default function Streaming() {
    const now = Date.now();
    const s = reactive({ running: true, points: Array.from({ length: 30 }, (_, i) => ({ time: new Date(now - (30 - i) * SECOND), value: 40 + Math.round(Math.random() * 20) })) });
    const timer = setInterval(() => {
        if (!s.running) return;
        const last = s.points[s.points.length - 1];
        const next = { time: new Date(last.time.getTime() + SECOND), value: Math.max(5, Math.min(95, last.value + Math.round(Math.random() * 14 - 7))) };
        s.points = [...s.points.slice(-120), next];
    }, SECOND);
    return (
        <Stack class="docs-wide" gap="sm" onDisposing={() => clearInterval(timer)}>
            <Chart class="ch-stream" label="Requests a second" data={() => s.points} xField="time" xAxis={{ span: 30 * SECOND }} yAxis={{ min: 0, max: 100 }} series={[{ yField: 'value', name: 'Requests', labels: 'last' }]} />
            <Button text={() => (s.running ? 'Pause' : 'Go on')} variant="outline" onclick={() => (s.running = !s.running)} />
        </Stack>
    );
}
```

## Reactive data

A function prop follows reactive data. For plain data, call `reState()`, or `refresh()` after an in-place change.

```tsx
import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';

/** A function prop follows reactive data. */
export default function Live() {
    const s = reactive({ points: [12, 18, 15, 21, 19].map((value, i) => ({ step: i + 1, value })) });
    const add = () => {
        const last = s.points[s.points.length - 1];
        s.points = [...s.points, { step: last.step + 1, value: Math.max(2, last.value + Math.round(Math.random() * 12 - 6)) }];
    };
    return (
        <Stack class="docs-wide" gap="md">
            <Chart class="ch-live" label="A growing series" data={() => s.points} xField="step" series={[{ yField: 'value', name: 'Value', markers: true }]} />
            <Button text="Add a value" variant="outline" onclick={add} />
        </Stack>
    );
}
```

## Feedback

Loading issues…
