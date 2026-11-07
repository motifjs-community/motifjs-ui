import { Gauge, Stack } from '@motifx-community/ui';

/** A scale from 100 down to 0: what is left, counted down. */
export default function Reversed() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-down" value={30} min={100} max={0} scale="ticks" tickInterval={20} label="Remaining" />
            <Gauge type="linear" orientation="vertical" size={180} value={30} min={100} max={0} scale="ticks" tickInterval={25} label="Depth (m)" />
        </Stack>
    );
}
