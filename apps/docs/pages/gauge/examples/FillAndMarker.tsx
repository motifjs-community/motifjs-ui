import { Gauge, Stack } from '@motifx-community/ui';

/** A fill with a needle over it, and a fill with a triangle that keeps the value easy to find. */
export default function FillAndMarker() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={128} max={240} marker="needle" scale="ticks" tickInterval={40} label="km/h" />
            <Gauge value={62} marker="triangle" scale="ticks" tickInterval={25} label="Progress" format={{ style: 'unit', unit: 'percent' }} />
            <Gauge type="linear" orientation="vertical" size={180} value={62} marker="triangle" scale="ticks" tickInterval={25} label="Level" />
        </Stack>
    );
}
