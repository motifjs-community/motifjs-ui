import { reactive } from '@motifx/core';
import { Chart, Stack } from '@motifx-community/ui';

const CITIES = [
    { city: 'Lisbon', rent: 1350, salary: 1600 },
    { city: 'Madrid', rent: 1250, salary: 2100 },
    { city: 'Milan', rent: 1500, salary: 2300 },
    { city: 'Vienna', rent: 1100, salary: 2900 },
    { city: 'Prague', rent: 950, salary: 1900 },
    { city: 'Warsaw', rent: 900, salary: 1700 },
    { city: 'Berlin', rent: 1400, salary: 3300 },
    { city: 'Athens', rent: 700, salary: 1200 },
    { city: 'Dublin', rent: 2100, salary: 3500 },
    { city: 'Helsinki', rent: 1150, salary: 3100 }
];

/** Click dots, or move to them with the arrow keys and press Enter, to choose several; the page compares them. */
export default function ScatterChoose() {
    const s = reactive({ told: 'Choose cities on the chart.' });
    return (
        <Stack class="docs-wide" gap="sm">
            <Chart
                class="ch-scatter-choose"
                title="Rent and salary"
                subtitle="Monthly, in euros"
                data={CITIES}
                xField="rent"
                pointSelection="multiple"
                xAxis={{ title: 'Rent of a flat' }}
                yAxis={{ title: 'Salary after tax' }}
                tooltip={{ format: c => (c.point ? `${c.point.row.city}: rent ${c.point.xText}, salary ${c.point.yText}` : c.title) }}
                series={[{ type: 'scatter', yField: 'salary', name: 'Cities' }]}
                onSelectionChanged={e =>
                    (s.told = e.points.length
                        ? e.points.map(p => `${p.row.city}: ${Math.round((p.row.rent / p.row.salary) * 100)}% of the salary`).join(' · ')
                        : 'Choose cities on the chart.')
                }
            />
            <output class="ch-scatter-told">{() => s.told}</output>
        </Stack>
    );
}
