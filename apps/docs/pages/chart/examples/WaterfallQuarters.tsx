import { Chart } from '@motifx-community/ui';

const FLOW = [
    { month: 'Opening', change: 50 },
    { month: 'Jan', change: 12 },
    { month: 'Feb', change: -8 },
    { month: 'Mar', change: 15 },
    { month: 'Q1', total: true },
    { month: 'Apr', change: -21 },
    { month: 'May', change: 9 },
    { month: 'Jun', change: 18 },
    { month: 'Q2', total: true }
];

/** Totals between the steps show where the account stands at the end of each quarter; only the highest and lowest bars carry labels. */
export default function WaterfallQuarters() {
    return (
        <Chart
            class="ch-waterfall-quarters"
            title="Account balance, first half"
            subtitle="In thousands of euros"
            data={FLOW}
            xField="month"
            legend={false}
            series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Balance', labels: 'extremes' }]}
        />
    );
}
