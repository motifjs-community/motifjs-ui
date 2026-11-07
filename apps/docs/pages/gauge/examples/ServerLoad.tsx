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
