import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['8', '10', '12', '14', '16', '18', '20'];
const LOAD = DAYS.flatMap((day, d) => HOURS.map((hour, h) => ({ day, hour, orders: Math.round(20 + 60 * Math.sin(((h + 1) / 8) * Math.PI) * (d < 5 ? 1 : 0.55) + d * 3) })));

/** A value for each pair, as a color in seven steps. The legend gives each step its values. */
export default function Heatmap() {
    return <Chart class="ch-heat" title="Orders by day and hour" data={LOAD} xField="hour" series={[{ type: 'heatmap', yField: 'day', valueField: 'orders', name: 'Orders', labels: 'all' }]} />;
}
