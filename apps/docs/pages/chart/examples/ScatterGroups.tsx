import { Chart } from '@motifx-community/ui';

// Hours studied and the exam score of two classes.
const CLASS_A = [2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 10, 11].map((hours, i) => ({ hours, score: Math.min(98, Math.round(42 + hours * 4.6 + ((i * 7) % 9) - 4)) }));
const CLASS_B = [1, 2, 3, 3, 4, 5, 6, 7, 7, 8, 9, 12].map((hours, i) => ({ hours, score: Math.min(98, Math.round(36 + hours * 5.1 + ((i * 5) % 11) - 5)) }));

const mean = (rows: { hours: number; score: number }[], key: 'hours' | 'score') => Math.round((rows.reduce((sum, r) => sum + r[key], 0) / rows.length) * 10) / 10;
const ALL = [...CLASS_A, ...CLASS_B];

/** Two groups of dots, each with rows of its own, and lines at the means of both axes. */
export default function ScatterGroups() {
    return (
        <Chart
            class="ch-scatter-groups"
            title="Study time and exam score"
            xField="hours"
            xAxis={{ title: 'Hours studied', min: 0 }}
            yAxis={{ title: 'Score', min: 30, max: 100 }}
            references={[
                { axis: 'x', value: mean(ALL, 'hours'), label: 'Mean hours' },
                { value: 70, label: 'Pass' }
            ]}
            series={[
                { type: 'scatter', data: CLASS_A, yField: 'score', name: 'Class A' },
                { type: 'scatter', data: CLASS_B, yField: 'score', name: 'Class B' }
            ]}
        />
    );
}
