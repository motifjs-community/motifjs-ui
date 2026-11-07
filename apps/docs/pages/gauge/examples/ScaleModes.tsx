import { Gauge, Stack } from '@motifx-community/ui';

/** The two ends, ticks with their values, and no scale at all. */
export default function ScaleModes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={58} scale="ends" label="Ends" />
            <Gauge value={58} scale="ticks" tickInterval={25} label="Ticks" />
            <Gauge value={58} scale="none" label="None" />
        </Stack>
    );
}
