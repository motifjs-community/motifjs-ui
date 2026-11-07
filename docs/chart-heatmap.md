# Chart: Heat map

> Charts · @motifx-community/ui 0.1.0-beta.5

A heat map shows a value for each pair of two categories as a color.

## Heat map

`heatmap` places a cell at each pair of `xField` and `yField`, colored by `valueField` in seven steps of one hue. Values on both sides of zero take two hues that meet in a neutral middle.

```tsx
import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['8', '10', '12', '14', '16', '18', '20'];
const LOAD = DAYS.flatMap((day, d) => HOURS.map((hour, h) => ({ day, hour, orders: Math.round(20 + 60 * Math.sin(((h + 1) / 8) * Math.PI) * (d < 5 ? 1 : 0.55) + d * 3) })));

/** A value for each pair, as a color in seven steps. The legend gives each step its values. */
export default function Heatmap() {
    return <Chart class="ch-heat" title="Orders by day and hour" data={LOAD} xField="hour" series={[{ type: 'heatmap', yField: 'day', valueField: 'orders', name: 'Orders', labels: 'all' }]} />;
}
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `valueField` | `string \| (row) => unknown` |  | The value a heat map shows as a color. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
