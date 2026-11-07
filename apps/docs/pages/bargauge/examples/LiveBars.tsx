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
