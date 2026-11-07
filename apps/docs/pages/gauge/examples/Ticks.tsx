import { Gauge, Stack } from '@motifx-community/ui';

/** Ticks every 100 with three small ones between, and ticks at an even step chosen for the size. */
export default function Ticks() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-minor" value={750} max={1000} scale="ticks" tickInterval={100} minorTicks={3} label="Fan speed (rpm)" />
            <Gauge value={63} scale="ticks" label="Even step" />
            <Gauge type="linear" orientation="vertical" size={180} value={63} scale="ticks" minorTicks={1} label="Upright" />
        </Stack>
    );
}
