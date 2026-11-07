import { Chart } from '@motifx-community/ui';

const STEPS = [
    { step: 'Visited the shop', people: 12000 },
    { step: 'Viewed a product', people: 7400 },
    { step: 'Added to the cart', people: 2900 },
    { step: 'Started to pay', people: 1650 },
    { step: 'Paid', people: 1180 }
];

/** Stages in order, each with what is left of the first one. */
export default function Funnel() {
    return <Chart class="ch-funnel" title="From visit to order" data={STEPS} xField="step" legend={false} series={[{ type: 'funnel', yField: 'people', name: 'People' }]} />;
}
