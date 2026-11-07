import { reactive } from '@motifx/core';
import { Gauge, Slider, Stack } from '@motifx-community/ui';

/** Gauges put together: a speedometer, four quarter gauges around it and a fuel bar, all driven by one slider. */
export default function Dashboard() {
    const s = reactive({ speed: 80 });
    const quarter = (rotation: number, label: string, value: () => number) => (
        <Gauge class="ga-dash-quarter" angle={90} rotation={rotation} size={130} value={value} label={label} showValue={false} scale="ticks" tickInterval={50} />
    );
    return (
        <Stack gap="lg" align="center">
            <Stack orientation="horizontal" gap="md" align="center" wrap justify="center">
                <Stack gap="md">
                    {quarter(-45, 'Oil', () => s.speed / 2)}
                    {quarter(-135, 'Water', () => 100 - s.speed / 2)}
                </Stack>
                <Gauge class="ga-speed" value={() => s.speed} max={200} size={220} angle={270} scale="ticks" tickInterval={20} minorTicks={1}
                    marker="needle" label="km/h" ranges={[{ from: 160, to: 200, tone: 'danger' }]} />
                <Stack gap="md">
                    {quarter(45, 'Load', () => s.speed / 2)}
                    {quarter(135, 'Charge', () => 100 - s.speed / 2)}
                </Stack>
            </Stack>
            <Gauge class="ga-fuel" type="linear" value={() => 50 - s.speed * 0.2} max={50} scale="ticks" tickInterval={25} minorTicks={1}
                format={{ maximumFractionDigits: 0 }} label="Fuel (l)" />
            <Slider label="Speed" x-model={() => s.speed} min={0} max={200} />
        </Stack>
    );
}
