# Chart: Heat map

> Charts · @motifx-community/ui 0.1.0-beta.7

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

## Calendar

Any two categories make the grid, here weeks and weekdays. The series `format` controls how cell labels and tooltips read; compact numbers fit small cells.

```tsx
import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Five weeks of steps walked, more at the weekend.
const STEPS = Array.from({ length: 5 }, (_, w) => `Week ${w + 1}`).flatMap((week, w) =>
    DAYS.map((day, d) => ({ week, day, steps: Math.round(5200 + (d >= 5 ? 4200 : 0) + Math.sin(w * 2 + d) * 1800 + w * 350) }))
);

/** A calendar of weeks and days: each cell's label reads in the series' own format, short enough to fit. */
export default function HeatmapCalendar() {
    return (
        <Chart
            class="ch-heat-calendar"
            title="Steps walked"
            data={STEPS}
            xField="day"
            series={[{ type: 'heatmap', yField: 'week', valueField: 'steps', name: 'Steps', labels: 'all', format: { notation: 'compact', maximumFractionDigits: 1 } }]}
        />
    );
}
```

## Many cells

In a dense grid, leave `labels` off. The color steps show the pattern, and the tooltip and the table view show each value.

```tsx
import { Chart } from '@motifx-community/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

// How long the server takes to answer, slower in working hours.
const TIMES = DAYS.flatMap((day, d) =>
    HOURS.map((hour, h) => ({ day, hour, ms: Math.round(90 + (d < 5 ? 1 : 0.4) * 160 * Math.max(0, Math.sin(((h - 6) / 14) * Math.PI)) + ((h * 7 + d * 3) % 11) * 4) }))
);

/** Many cells and no labels: the colors carry the pattern, the tooltip and the table carry the values. */
export default function HeatmapHours() {
    return (
        <Chart
            class="ch-heat-hours"
            title="Response time by hour"
            data={TIMES}
            xField="hour"
            xAxis={{ title: 'Hour of the day' }}
            series={[{ type: 'heatmap', yField: 'day', valueField: 'ms', name: 'Response time', format: { style: 'unit', unit: 'millisecond', maximumFractionDigits: 0 } }]}
        />
    );
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
