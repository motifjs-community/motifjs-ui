import { Gauge, Stack } from '@motifx-community/ui';

/** Upright gauges: `size` sets their length. The label sits above and the value under them. */
export default function Upright() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-upright" type="linear" orientation="vertical" size={160} value={72} label="Tank" scale="ticks" />
            <Gauge type="linear" orientation="vertical" size={220} value={35} max={50} label="Fuel (l)" scale="ticks" tickInterval={10} minorTicks={1} />
            <Gauge type="linear" orientation="vertical" size={120} value={0.8} max={1} label="Load" format={{ style: 'percent' }} />
        </Stack>
    );
}
