# Chart: Lines and areas

> Charts · @motifx-community/ui 0.1.0-beta.7

Lines and areas show how values change along an axis: over time, or from one category to the next.

## Lines

A line is the default series type. `smooth` curves the line without adding a peak that is not in the data, and `labels` shows selected values on the chart. Point to a position to read every series at that position.

```tsx
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** Two series, the second one smoothed and with its last value labeled. */
export default function Lines() {
    return (
        <Chart
            class="ch-lines"
            title="Sales by channel"
            data={SALES}
            xField="month"
            series={[
                { yField: 'online', name: 'Online', labels: 'last' },
                { yField: 'stores', name: 'Stores', smooth: true, labels: 'last' }
            ]}
        />
    );
}
```

## Areas

`stacked` adds the areas together, so that the top line shows the total.

```tsx
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** Areas stacked on each other: the top line is the total. */
export default function Areas() {
    return (
        <Chart
            class="ch-areas"
            title="Total sales"
            data={SALES}
            xField="month"
            stacked="normal"
            series={[
                { type: 'area', yField: 'stores', name: 'Stores' },
                { type: 'area', yField: 'online', name: 'Online' }
            ]}
        />
    );
}
```

## Dates

Date values produce a time axis, with marks on round days and months in the language of the page. Long series are reduced to what the width can display, and their peaks are preserved.

```tsx
import { Chart } from '@motifx-community/ui';

const DAY = 24 * 60 * 60 * 1000;
const START = new Date(2026, 0, 1).getTime();
const VISITS = Array.from({ length: 180 }, (_, i) => ({
    day: new Date(START + i * DAY),
    visits: Math.round(900 + i * 6 + Math.sin(i / 6) * 180 + (i % 7 === 0 ? -160 : 0))
}));

/** Dates place themselves on round days and months. */
export default function TimeAxis() {
    return <Chart class="ch-time" title="Daily visits" data={VISITS} xField="day" series={[{ type: 'area', yField: 'visits', name: 'Visits' }]} />;
}
```

## Missing values

A missing value breaks the line, because nothing was measured at that position. `gaps` connects across it or treats it as zero, and `step` draws a stepped line.

```tsx
import { Chart } from '@motifx-community/ui';

const READINGS = [
    { hour: '08:00', room: 19 },
    { hour: '09:00', room: 20 },
    { hour: '10:00', room: null },
    { hour: '11:00', room: 22 },
    { hour: '12:00', room: 23 },
    { hour: '13:00', room: null },
    { hour: '14:00', room: 24 },
    { hour: '15:00', room: null },
    { hour: '16:00', room: 22 }
];

/** An empty value breaks a line, as nothing was measured. `gaps` can join past it instead. */
export default function Gaps() {
    return (
        <Chart
            class="ch-gaps"
            title="Room temperature"
            data={READINGS}
            xField="hour"
            series={[
                { yField: 'room', name: 'Broken', markers: true },
                { yField: (row: { room: number | null }) => (row.room === null ? null : row.room + 4), name: 'Joined', gaps: 'connect', step: 'middle' }
            ]}
        />
    );
}
```

## API reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `smooth` | `boolean` | `false` | Curves the line without passing the values it connects. |
| `step` | `'start' \| 'middle' \| 'end'` |  | Draws a stepped line, and sets where the value changes. |
| `markers` | `boolean` | `false` | Marks each value on a line. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |
| `gaps` | `'break' \| 'connect' \| 'zero'` | `'break'` | How a line treats a missing value. |

Every other prop, member and event is on the [Overview](chart.md#api).

## Feedback

Loading issues…
