import { Gauge, Stack } from '@motifx-community/ui';

/** The value in the middle with a unit, a gauge that shows only its fill, and a needle that moves the value under the arc. */
export default function ValueLabel() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge value={21.5} label="Room" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />
            <Gauge value={21.5} max={40} label="Room" showValue={false} />
            <Gauge class="ga-needle-value" value={21.5} max={40} label="Room" marker="needle" format={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }} />
        </Stack>
    );
}
