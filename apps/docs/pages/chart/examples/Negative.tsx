import { Chart } from '@motifx-community/ui';

const QUARTERS = [
    { quarter: 'Q1 2025', profit: 120 },
    { quarter: 'Q2 2025', profit: -45 },
    { quarter: 'Q3 2025', profit: 80 },
    { quarter: 'Q4 2025', profit: -110 },
    { quarter: 'Q1 2026', profit: 160 }
];

/** Bars grow both ways from zero, each rounded at its far end. */
export default function Negative() {
    return <Chart class="ch-negative" title="Quarterly result" data={QUARTERS} xField="quarter" series={[{ type: 'bar', yField: 'profit', name: 'Result', labels: 'all' }]} />;
}
