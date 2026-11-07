# Chart: Bars

> Charts · @motifx-community/ui 0.1.0-beta.5

Bars compare amounts. They stand on a common baseline, so lengths compare exactly, side by side, stacked, or on their side for long names.

## Grouped and stacked bars

Bars are grouped side by side by default. `stacked` places them on top of each other, as values or as percentages. Use `stack` on a series to assign it to a named stack.

```tsx
/** Twelve months of made-up figures, shared by the examples. */
export const SALES = [
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },
    { month: 'May', online: 7100, stores: 6600, returns: 450 },
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }
];
```

## Horizontal charts

`horizontal` suits long category names and rankings. Rows keep the order in which they are provided.

```tsx
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
```

## Negative values

Bars extend in both directions from zero. A label that does not fit or that would cover another label is omitted, and its value remains available in the tooltip and the table view.

```tsx
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
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `stack` | `string \| boolean` | The chart's `stacked` | Series with the same name stack on each other. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…

## Example files

`Stacked.tsx`

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartStacked } from '@motifx-community/ui';
import { SALES } from './sales';

/** The same bars side by side, stacked, and as shares of a hundred. */
export default function Stacked() {
    const s = reactive({ mode: 'none' });
    const stacked = (): ChartStacked => (s.mode === 'none' ? false : (s.mode as ChartStacked));
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Stacking"
                x-model={() => s.mode}
                items={[
                    { value: 'none', text: 'Side by side' },
                    { value: 'normal', text: 'Stacked' },
                    { value: 'percent', text: 'Percent' }
                ]}
            />
            <Chart
                class="ch-stacked"
                data={SALES.slice(0, 6)}
                xField="month"
                label="Sales by channel"
                stacked={stacked}
                series={[
                    { type: 'bar', yField: 'online', name: 'Online' },
                    { type: 'bar', yField: 'stores', name: 'Stores' }
                ]}
            />
        </Stack>
    );
}
```

`sales.ts`

```tsx
/** Twelve months of made-up figures, shared by the examples. */
export const SALES = [
    { month: 'Jan', online: 4200, stores: 6100, returns: 310 },
    { month: 'Feb', online: 4600, stores: 5800, returns: 280 },
    { month: 'Mar', online: 5900, stores: 6400, returns: 420 },
    { month: 'Apr', online: 6300, stores: 6000, returns: 390 },
    { month: 'May', online: 7100, stores: 6600, returns: 450 },
    { month: 'Jun', online: 7600, stores: 7000, returns: 520 },
    { month: 'Jul', online: 8200, stores: 6800, returns: 610 },
    { month: 'Aug', online: 8000, stores: 6500, returns: 580 },
    { month: 'Sep', online: 8900, stores: 7200, returns: 640 },
    { month: 'Oct', online: 9400, stores: 7600, returns: 700 },
    { month: 'Nov', online: 11200, stores: 8800, returns: 930 },
    { month: 'Dec', online: 12800, stores: 10100, returns: 1100 }
];
```
