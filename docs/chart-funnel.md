# Chart: Funnel

> Charts · @motifx-community/ui 0.1.0-beta.5

A funnel follows a quantity through stages in order, and shows how much of it is left at each one.

## Funnel

`funnel` shows stages in the order of the rows, each with the share of the first stage that is left. The stages take one hue, darker towards the first, as they are in order.

```tsx
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
```

## Feedback

No open issues for this page.
