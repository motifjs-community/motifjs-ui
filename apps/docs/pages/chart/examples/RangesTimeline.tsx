import { Chart } from '@motifx-community/ui';

const TASKS = [
    { task: 'Research', start: 1, end: 4 },
    { task: 'Design', start: 3, end: 8 },
    { task: 'Build', start: 6, end: 16 },
    { task: 'Test', start: 12, end: 18 },
    { task: 'Launch', start: 18, end: 20 }
];

/** Bars from a start to an end, laid on their side: a plan read week by week, with a line for this week. */
export default function RangesTimeline() {
    return (
        <Chart
            class="ch-range-timeline"
            title="Project plan"
            data={TASKS}
            xField="task"
            horizontal
            legend={false}
            yAxis={{ title: 'Week', min: 0, max: 20 }}
            references={[{ value: 9, label: 'This week' }]}
            series={[{ type: 'rangeBar', lowField: 'start', highField: 'end', name: 'Weeks' }]}
        />
    );
}
