import { Gauge, Stack } from '@motifx-community/ui';

/** A bar across with the ends of its scale under its ends, and one with ticks. The label and the value sit above. */
export default function Across() {
    return (
        <Stack gap="lg" style="inline-size: 100%">
            <Gauge class="ga-linear" type="linear" value={72} label="Storage" format={{ style: 'unit', unit: 'gigabyte' }} max={128} />
            <Gauge type="linear" value={4.3} max={5} scale="ticks" tickInterval={1} minorTicks={3} label="Rating" format={{ maximumFractionDigits: 1 }} />
        </Stack>
    );
}
