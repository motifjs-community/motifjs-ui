# Chart: Waterfall

> Charts · @motifx-community/ui 0.1.0-beta.7

A waterfall shows how a starting value becomes an end value through changes up and down.

## Waterfall

`waterfall` adds each change to the last one, and a row with `totalField` set shows the total so far. A thin line carries the total from one step to the next.

```tsx
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
```

## On its side

`horizontal` gives long step names room to read in full. Labels follow the series `format`, here compact currency.

```tsx
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
```

## Subtotals

A row with `totalField` set shows the running total at that point, so a waterfall can close each period. `labels: 'extremes'` labels only the highest and lowest bars.

```tsx
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
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `totalField` | `string \| (row) => unknown` |  | A row of a waterfall that shows the total so far. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
