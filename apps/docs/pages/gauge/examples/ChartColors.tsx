import { Gauge, Stack } from '@motifx-community/ui';

const PRESSURE = [
    { from: 900, to: 1000, label: 'low' },
    { from: 1000, to: 1020, label: 'normal' },
    { from: 1020, to: 1100, label: 'high' }
];

/** Ranges with neither a tone nor a color take the chart colors in order. */
export default function ChartColors() {
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="end">
            <Gauge class="ga-chart-colors" value={1016} min={900} max={1100} ranges={PRESSURE} scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
            <Gauge type="linear" orientation="vertical" size={200} value={1016} min={900} max={1100} ranges={PRESSURE} fill={false} marker="circle"
                scale="ticks" ticks={[900, 1000, 1020, 1100]} label="Pressure (hPa)" />
        </Stack>
    );
}
