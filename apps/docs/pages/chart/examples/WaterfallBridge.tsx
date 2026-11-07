import { Chart } from '@motifx-community/ui';

const BRIDGE = [
    { step: 'Profit last year', change: 4.2 },
    { step: 'Higher prices', change: 1.1 },
    { step: 'More units sold', change: 0.8 },
    { step: 'Material costs', change: -1.4 },
    { step: 'New staff', change: -0.6 },
    { step: 'Exchange rates', change: -0.3 },
    { step: 'Profit this year', total: true }
];

/** On its side, so long step names read in full. */
export default function WaterfallBridge() {
    return (
        <Chart
            class="ch-waterfall-bridge"
            title="From last year's profit to this year's"
            subtitle="In millions of euros"
            data={BRIDGE}
            xField="step"
            horizontal
            legend={false}
            series={[{ type: 'waterfall', yField: 'change', totalField: 'total', name: 'Profit', labels: 'all', format: { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 } }]}
        />
    );
}
