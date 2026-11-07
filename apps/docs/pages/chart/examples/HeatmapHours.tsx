import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

// How long the server takes to answer, slower in working hours.
const TIMES = DAYS.flatMap((day, d) =>
    HOURS.map((hour, h) => ({ day, hour, ms: Math.round(90 + (d < 5 ? 1 : 0.4) * 160 * Math.max(0, Math.sin(((h - 6) / 14) * Math.PI)) + ((h * 7 + d * 3) % 11) * 4) }))
);

/** Many cells and no labels: the colors carry the pattern, the tooltip and the table carry the values. */
export default function HeatmapHours() {
    return (
        <Chart
            class="ch-heat-hours"
            title="Response time by hour"
            data={TIMES}
            xField="hour"
            xAxis={{ title: 'Hour of the day' }}
            series={[{ type: 'heatmap', yField: 'day', valueField: 'ms', name: 'Response time', format: { style: 'unit', unit: 'millisecond', maximumFractionDigits: 0 } }]}
        />
    );
}
