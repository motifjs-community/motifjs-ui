# Chart: Waterfall

> Charts · @motifx-community/ui 0.1.0-beta.5

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

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `totalField` | `string \| (row) => unknown` |  | A row of a waterfall that shows the total so far. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
