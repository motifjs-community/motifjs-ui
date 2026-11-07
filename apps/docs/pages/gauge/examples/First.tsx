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
