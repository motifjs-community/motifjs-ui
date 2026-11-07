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
