import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Five weeks of steps walked, more at the weekend.
const STEPS = Array.from({ length: 5 }, (_, w) => `Week ${w + 1}`).flatMap((week, w) =>
    DAYS.map((day, d) => ({ week, day, steps: Math.round(5200 + (d >= 5 ? 4200 : 0) + Math.sin(w * 2 + d) * 1800 + w * 350) }))
);

/** A calendar of weeks and days: each cell's label reads in the series' own format, short enough to fit. */
export default function HeatmapCalendar() {
    return (
        <Chart
            class="ch-heat-calendar"
            title="Steps walked"
            data={STEPS}
            xField="day"
            series={[{ type: 'heatmap', yField: 'week', valueField: 'steps', name: 'Steps', labels: 'all', format: { notation: 'compact', maximumFractionDigits: 1 } }]}
        />
    );
}
