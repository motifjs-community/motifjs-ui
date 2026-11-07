import { Chart } from '@motifx-community/ui';

const RAIN = [
    { month: 'Jan', north: 92, south: 110 },
    { month: 'Feb', north: 74, south: 96 },
    { month: 'Mar', north: 68, south: 72 },
    { month: 'Apr', north: 52, south: 48 },
    { month: 'May', north: 46, south: 30 },
    { month: 'Jun', north: 38, south: 12 },
    { month: 'Jul', north: 30, south: 4 },
    { month: 'Aug', north: 34, south: 6 },
    { month: 'Sep', north: 48, south: 22 },
    { month: 'Oct', north: 70, south: 58 },
    { month: 'Nov', north: 84, south: 92 },
    { month: 'Dec', north: 98, south: 118 }
];

/** Twelve months around the circle: a year that comes back to where it started. */
export default function RadarYear() {
    return (
        <Chart
            class="ch-radar-year"
            title="Rain over the year"
            data={RAIN}
            xField="month"
            yAxis={{ format: { style: 'unit', unit: 'millimeter' } }}
            series={[
                { type: 'radar', yField: 'north', name: 'North coast' },
                { type: 'radar', yField: 'south', name: 'South coast' }
            ]}
        />
    );
}
