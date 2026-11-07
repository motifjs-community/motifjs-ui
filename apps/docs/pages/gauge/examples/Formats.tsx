import { Gauge, Stack } from '@motifx-community/ui';

const degrees = (v: number) => `${v}°`;

/** Values as a percentage, as money, and through a function of your own. */
export default function Formats() {
    return (
        <Stack orientation="horizontal" gap="lg" wrap align="end">
            <Gauge angle={180} value={45} scale="ticks" tickInterval={25} format={{ style: 'unit', unit: 'percent' }} label="Battery" />
            <Gauge angle={180} value={7400} max={10000} scale="ticks" tickInterval={2500} format={{ style: 'currency', currency: 'EUR', notation: 'compact' }} label="Budget" />
            <Gauge class="ga-degrees" angle={180} value={20} min={-45} max={45} scale="ticks" tickInterval={45} format={degrees} label="Angle" />
        </Stack>
    );
}
