import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

/** The fill takes the tone of the range its value is in; the ranges show as a band outside the track. */
export default function Ranges() {
    const s = reactive({ cpu: 64 });
    return (
        <Stack gap="md">
            <Gauge
                class="ga-ranges"
                value={() => s.cpu}
                label="CPU"
                format={{ style: 'unit', unit: 'percent' }}
                ranges={[
                    { from: 0, to: 70, tone: 'good', label: 'normal' },
                    { from: 70, to: 90, tone: 'warning', label: 'high' },
                    { from: 90, to: 100, tone: 'danger', label: 'critical' }
                ]}
            />
            <Slider label="CPU" x-model={() => s.cpu} min={0} max={100} />
        </Stack>
    );
}
