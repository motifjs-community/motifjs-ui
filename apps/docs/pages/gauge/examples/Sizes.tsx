import { Gauge, Stack } from '@motifx-community/ui';

/** The same gauge at three sizes. The track keeps the thickness of the design language. */
export default function Sizes() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge class="ga-small" size={120} value={40} label="120 px" />
            <Gauge value={40} label="Design language" />
            <Gauge class="ga-large" size={220} value={40} label="220 px" scale="ticks" tickInterval={10} />
        </Stack>
    );
}
