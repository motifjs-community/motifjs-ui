import { Chart } from '@motifx-community/ui';

const BUDGET = [
    { item: 'Start', change: 1200 },
    { item: 'Sales', change: 860 },
    { item: 'Services', change: 340 },
    { item: 'Salaries', change: -690 },
    { item: 'Rent', change: -240 },
    { item: 'Half year', total: true },
    { item: 'Taxes', change: -310 },
    { item: 'End', total: true }
];

/** Each step adds or takes away, and a total row shows where it stands. */
export default function Waterfall() {
    return <Chart class="ch-waterfall" title="Cash over the year" data={BUDGET} xField="item" series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Cash', labels: 'all' }]} />;
}
