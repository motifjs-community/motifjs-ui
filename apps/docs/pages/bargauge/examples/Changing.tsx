import { reactive } from '@motifx/core';
import { BarGauge, CheckBox, Stack } from '@motifx-community/ui';

/** As many bars as goods chosen. Each row keeps its own color, so a bar does not change color when another goes. */
export default function Changing() {
    const goods = reactive([
        { name: 'Hammers', count: 41, color: 'var(--mx-color-chart-series-1)', on: true },
        { name: 'Shovels', count: 32, color: 'var(--mx-color-chart-series-2)', on: true },
        { name: 'Ladders', count: 13, color: 'var(--mx-color-chart-series-3)', on: true },
        { name: 'Watering cans', count: 48, color: 'var(--mx-color-chart-series-4)', on: true },
        { name: 'Screwdrivers', count: 24, color: 'var(--mx-color-chart-series-5)', on: true },
        { name: 'Drills', count: 19, color: 'var(--mx-color-chart-series-6)', on: true }
    ]);
    return (
        <Stack orientation="horizontal" gap="xl" wrap align="center">
            <BarGauge class="bg-changing" data={() => goods.filter(g => g.on)} valueField="count" nameField="name" colorField="color" max={50}
                label="Goods sold" legend />
            <Stack gap="sm">
                {goods.map(g => (
                    <CheckBox label={g.name} x-model={() => g.on} />
                ))}
            </Stack>
        </Stack>
    );
}
