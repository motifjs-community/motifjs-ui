import { Chart } from '@motifx-community/ui';

const TEAMS = [
    { team: 'Customer support', tickets: 412 },
    { team: 'Platform engineering', tickets: 318 },
    { team: 'Finance and accounting operations', tickets: 205 },
    { team: 'Sales', tickets: 164 },
    { team: 'Design', tickets: 96 }
];

/** On its side, for long names and a ranking. The labels carry the values. */
export default function Horizontal() {
    return <Chart class="ch-horizontal" horizontal title="Open tickets" data={TEAMS} xField="team" yAxis={{ grid: false, labels: false }} series={[{ type: 'bar', yField: 'tickets', name: 'Tickets', labels: 'all' }]} />;
}
