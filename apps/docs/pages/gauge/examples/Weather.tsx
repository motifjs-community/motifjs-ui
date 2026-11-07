import { reactive } from '@motifx/core';
import { DropDown, Gauge, Stack } from '@motifx-community/ui';

const CITIES = [
    { name: 'Ankara', temperature: 14, humidity: 48, pressure: 1016 },
    { name: 'Lisbon', temperature: 21, humidity: 67, pressure: 1021 },
    { name: 'Oslo', temperature: -6, humidity: 81, pressure: 994 },
    { name: 'Cairo', temperature: 33, humidity: 22, pressure: 1009 }
];

const PRESSURE = [
    { from: 900, to: 1000, label: 'low' },
    { from: 1000, to: 1020, label: 'normal' },
    { from: 1020, to: 1100, label: 'high' }
];

/** Three upright gauges, each showing its value its own way: a fill from 0, a rhombus, a circle among ranges. */
export default function Weather() {
    const s = reactive({ city: 'Ankara' as string | null });
    const city = () => CITIES.find(c => c.name === s.city) ?? CITIES[0];
    return (
        <Stack gap="lg" align="center">
            <Stack orientation="horizontal" gap="xl" wrap justify="center">
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={-40} max={40} baseValue={0} scale="ticks" tickInterval={20}
                    value={() => city().temperature} label="Temperature (°C)" />
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} scale="ticks" tickInterval={10} fill={false} marker="rhombus"
                    value={() => city().humidity} label="Humidity (%)" />
                <Gauge class="ga-weather" type="linear" orientation="vertical" size={220} min={900} max={1100} scale="ticks" ticks={[900, 1000, 1020, 1100]}
                    fill={false} marker="circle" value={() => city().pressure} label="Pressure (hPa)" ranges={PRESSURE} />
            </Stack>
            <DropDown label="City" items={CITIES} textField="name" valueField="name" x-model={() => s.city} />
        </Stack>
    );
}
