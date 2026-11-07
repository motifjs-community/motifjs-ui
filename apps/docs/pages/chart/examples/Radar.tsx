import { Chart } from '@motifx-community/ui';

const SCORES = [
    { skill: 'Speed', a: 82, b: 64 },
    { skill: 'Battery', a: 58, b: 88 },
    { skill: 'Camera', a: 90, b: 72 },
    { skill: 'Screen', a: 76, b: 80 },
    { skill: 'Sound', a: 64, b: 70 },
    { skill: 'Price', a: 48, b: 84 }
];

/** Several measures around a center, one shape for each series. */
export default function Radar() {
    return (
        <Chart
            class="ch-radar"
            title="Two phones compared"
            data={SCORES}
            xField="skill"
            series={[
                { type: 'radar', yField: 'a', name: 'Phone A', markers: true },
                { type: 'radar', yField: 'b', name: 'Phone B', markers: true }
            ]}
        />
    );
}
