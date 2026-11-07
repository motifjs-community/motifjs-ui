import { Gauge, Stack } from '@motifx-community/ui';

/** Ticks only where they mean something: the reserve, half and full; the limits of normal pressure. */
export default function OwnTicks() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-custom" type="linear" orientation="vertical" size={180} value={35} max={50} scale="ticks" ticks={[0, 10, 25, 50]} label="Fuel (l)" />
            <Gauge value={1016} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
        </Stack>
    );
}
