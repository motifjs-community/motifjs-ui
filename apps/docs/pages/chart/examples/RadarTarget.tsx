import { Chart } from '@motifx-community/ui';

const REVIEW = [
    { skill: 'Delivery', target: 80, team: 86, last: 72 },
    { skill: 'Quality', target: 85, team: 78, last: 74 },
    { skill: 'Teamwork', target: 75, team: 88, last: 80 },
    { skill: 'Planning', target: 70, team: 62, last: 55 },
    { skill: 'Learning', target: 60, team: 74, last: 66 }
];

/** A fixed scale from 0 to 100, so shapes compare fairly; hide a series in the legend to compare two. */
export default function RadarTarget() {
    return (
        <Chart
            class="ch-radar-target"
            title="Team review"
            data={REVIEW}
            xField="skill"
            yAxis={{ min: 0, max: 100, tickCount: 5 }}
            series={[
                { type: 'radar', yField: 'target', name: 'Target' },
                { type: 'radar', yField: 'team', name: 'This year', markers: true },
                { type: 'radar', yField: 'last', name: 'Last year', markers: true }
            ]}
        />
    );
}
