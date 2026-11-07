import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

const degrees = (v: number) => `${v}°`;

/** A deviation from the target: the fill grows from 0 to either side. */
export default function Deviation() {
    const s = reactive({ angle: 20 });
    return (
        <Stack gap="md">
            <Stack orientation="horizontal" gap="lg" wrap align="end">
                <Gauge class="ga-base" angle={90} min={-45} max={45} baseValue={0} value={() => s.angle} scale="ticks" tickInterval={45} format={degrees}
                    label="Deviation" size={240} />
                <Gauge class="ga-base-bar" type="linear" orientation="vertical" size={180} min={-45} max={45} baseValue={0} value={() => s.angle}
                    scale="ticks" tickInterval={15} format={degrees} label="Deviation" />
            </Stack>
            <Slider label="Deviation" x-model={() => s.angle} min={-45} max={45} />
        </Stack>
    );
}
