import { Chart } from '@motifx-community/ui';

const DAY = 24 * 60 * 60 * 1000;
const START = new Date(2026, 0, 1).getTime();
const VISITS = Array.from({ length: 180 }, (_, i) => ({
    day: new Date(START + i * DAY),
    visits: Math.round(900 + i * 6 + Math.sin(i / 6) * 180 + (i % 7 === 0 ? -160 : 0))
}));

/** Dates place themselves on round days and months. */
export default function TimeAxis() {
    return <Chart class="ch-time" title="Daily visits" data={VISITS} xField="day" series={[{ type: 'area', yField: 'visits', name: 'Visits' }]} />;
}
