import { reactive } from '@motifx/core';
import { Gauge, NumberBox, Stack } from '@motifx-community/ui';

/** Marks that follow the data: change the target and the limit, and the marks move. */
export default function MovingMarks() {
    const s = reactive({ value: 34, target: 23, limit: 38 });
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <Gauge class="ga-moving-marks" value={() => s.value} min={10} max={40} scale="ticks" tickInterval={5} label="Voltage (kV)"
                marks={() => [{ value: s.target, label: 'Target' }, { value: s.limit, label: 'Limit', shape: 'line' }]} />
            <Stack gap="sm">
                <NumberBox label="Value" x-model={() => s.value} min={10} max={40} />
                <NumberBox label="Target" x-model={() => s.target} min={10} max={40} />
                <NumberBox label="Limit" x-model={() => s.limit} min={10} max={40} />
            </Stack>
        </Stack>
    );
}
