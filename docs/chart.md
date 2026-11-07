# Chart

> Display · @motifx-community/ui 0.1.0-beta.5

Displays lines, areas, bars, scatter points and bubbles on a shared value axis. The chart has no dependencies, takes its appearance from the design language, and makes every value available through the keyboard and a table view.

## Import

```tsx
import { Chart } from '@motifx-community/ui';
```

## Binding rows

`data` holds the rows, `xField` sets the position of each row along the axis, and each item of `series` selects a field and how it is drawn. A chart with one series shows no legend, because its title identifies the series.

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

## Lines

A line is the default series type. `smooth` curves the line without adding a peak that is not in the data, and `labels` shows selected values on the chart. Point to a position to read every series at that position.

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

## Areas

`stacked` adds the areas together, so that the top line shows the total.

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

## Scatter and bubble charts

`scatter` and `bubble` plot two numeric values. `sizeField` adds a third value to a bubble, represented by its area. The pointer selects the nearest point.

```tsx
import { Chart } from '@motifx-community/ui';

const CARS = [
    { power: 66, weight: 980, price: 16 },
    { power: 90, weight: 1120, price: 21 },
    { power: 110, weight: 1240, price: 27 },
    { power: 130, weight: 1320, price: 31 },
    { power: 150, weight: 1450, price: 38 },
    { power: 170, weight: 1510, price: 44 },
    { power: 190, weight: 1600, price: 52 },
    { power: 230, weight: 1680, price: 71 },
    { power: 260, weight: 1760, price: 86 },
    { power: 300, weight: 1850, price: 112 }
];

/** Two numbers per dot, and a third as its size. The size counts by area. */
export default function Scatter() {
    return (
        <Chart
            class="ch-scatter"
            title="Power, weight and price"
            data={CARS}
            xField="power"
            xAxis={{ title: 'Power (hp)' }}
            yAxis={{ title: 'Weight (kg)', min: 800 }}
            series={[{ type: 'bubble', yField: 'weight', sizeField: 'price', name: 'Cars' }]}
        />
    );
}
```

## Pie and donut

`pie` and `donut` split one whole into its parts. Shares are written inside the slices that have room for them, the legend names every part, and a donut shows the total in its middle. For close values, bars compare more exactly.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';

const TRAFFIC = [
    { source: 'Search', visits: 4820 },
    { source: 'Direct', visits: 2610 },
    { source: 'Social', visits: 1480 },
    { source: 'Email', visits: 920 },
    { source: 'Referral', visits: 540 }
];

/** One whole and its parts. Hide a part in the legend: the others share the whole again, and keep their colors. */
export default function Parts() {
    const s = reactive({ type: 'donut' as ChartSeriesType });
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Shape"
                x-model={() => s.type}
                items={[
                    { value: 'donut', text: 'Donut' },
                    { value: 'pie', text: 'Pie' }
                ]}
            />
            <Chart class="ch-parts" title="Visits by source" data={TRAFFIC} xField="source" series={() => [{ type: s.type, yField: 'visits', name: 'Visits' }]} />
        </Stack>
    );
}
```

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

## Radar

`radar` places a spoke for each category around a center and draws a shape for each series.

```tsx
import { Chart } from '@motifx-community/ui';

const SCORES = [
    { skill: 'Speed', a: 82, b: 64 },
    { skill: 'Battery', a: 58, b: 88 },
    { skill: 'Camera', a: 90, b: 72 },
    { skill: 'Screen', a: 76, b: 80 },
    { skill: 'Sound', a: 64, b: 70 },
    { skill: 'Price', a: 48, b: 84 }
];

/** Several measures around a center, one shape for each series. */
export default function Radar() {
    return (
        <Chart
            class="ch-radar"
            title="Two phones compared"
            data={SCORES}
            xField="skill"
            series={[
                { type: 'radar', yField: 'a', name: 'Phone A', markers: true },
                { type: 'radar', yField: 'b', name: 'Phone B', markers: true }
            ]}
        />
    );
}
```

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

## Ranges

`rangeArea` and `rangeBar` draw from `lowField` to `highField`, and other series share the axis.

```tsx
import { Chart } from '@motifx-community/ui';

const WEATHER = [
    { month: 'Jan', low: 2, high: 9, mean: 5 },
    { month: 'Feb', low: 3, high: 11, mean: 7 },
    { month: 'Mar', low: 5, high: 14, mean: 9 },
    { month: 'Apr', low: 8, high: 18, mean: 13 },
    { month: 'May', low: 12, high: 23, mean: 17 },
    { month: 'Jun', low: 16, high: 28, mean: 22 },
    { month: 'Jul', low: 19, high: 31, mean: 25 },
    { month: 'Aug', low: 19, high: 31, mean: 25 },
    { month: 'Sep', low: 15, high: 26, mean: 21 },
    { month: 'Oct', low: 11, high: 21, mean: 16 },
    { month: 'Nov', low: 7, high: 15, mean: 11 },
    { month: 'Dec', low: 4, high: 11, mean: 7 }
];

/** A band from the lowest to the highest value, with a line through it. */
export default function Ranges() {
    return (
        <Chart
            class="ch-range"
            title="Temperature over the year"
            data={WEATHER}
            xField="month"
            yAxis={{ format: { style: 'unit', unit: 'celsius' } }}
            series={[
                { type: 'rangeArea', lowField: 'low', highField: 'high', name: 'Range' },
                { yField: 'mean', name: 'Mean', smooth: true }
            ]}
        />
    );
}
```

## Candles

`candlestick` and `ohlc` show four prices for each position: `openField`, `highField`, `lowField` and `closeField`. Rising and falling take the design language's colors for good and bad, and a rising candle is hollow as well.

```tsx
import { reactive } from '@motifx/core';
import { ButtonGroup, Chart, Stack, type ChartSeriesType } from '@motifx-community/ui';

const PRICES = Array.from({ length: 24 }, (_, i) => {
    const open = 100 + Math.round(Math.sin(i / 3) * 12 + i * 0.8);
    const close = open + Math.round(Math.cos(i * 1.7) * 6);
    return { day: new Date(2026, 9, i + 1), open, close, high: Math.max(open, close) + 2 + (i % 3), low: Math.min(open, close) - 2 - (i % 4) };
});

/** Four prices a day. A rising candle is hollow and a falling one filled, so they read apart without their colors. */
export default function Candles() {
    const s = reactive({ type: 'candlestick' as ChartSeriesType });
    return (
        <Stack class="docs-wide" gap="md">
            <ButtonGroup
                label="Shape"
                x-model={() => s.type}
                items={[
                    { value: 'candlestick', text: 'Candles' },
                    { value: 'ohlc', text: 'OHLC bars' }
                ]}
            />
            <Chart
                class="ch-candles"
                title="Share price in October"
                data={PRICES}
                xField="day"
                xAxis={{ format: { day: 'numeric' } }}
                series={() => [{ type: s.type, openField: 'open', highField: 'high', lowField: 'low', closeField: 'close', name: 'Price' }]}
            />
        </Stack>
    );
}
```

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

## Reactive data

A function prop follows reactive data. For plain data, call `reState()`, or `refresh()` after an in-place change.

```tsx
import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';

/** A function prop follows reactive data. */
export default function Live() {
    const s = reactive({ points: [12, 18, 15, 21, 19].map((value, i) => ({ step: i + 1, value })) });
    const add = () => {
        const last = s.points[s.points.length - 1];
        s.points = [...s.points, { step: last.step + 1, value: Math.max(2, last.value + Math.round(Math.random() * 12 - 6)) }];
    };
    return (
        <Stack class="docs-wide" gap="md">
            <Chart class="ch-live" label="A growing series" data={() => s.points} xField="step" series={[{ yField: 'value', name: 'Value', markers: true }]} />
            <Button text="Add a value" variant="outline" onclick={add} />
        </Stack>
    );
}
```

## Data sources

`dataSource` reads rows from any adapter of the data layer. While rows load, the current chart stays in place at reduced opacity.

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

## Empty and loading states

A chart without values displays a message, which `emptyText` sets. `loading` keeps the current chart in place at reduced opacity, so that the layout does not shift while new values arrive.

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

## Creating an image

`toDataURL()` and `toSVG()` return an image that includes the title and the legend. A browser cannot use the page's fonts inside an image, so a system font replaces them.

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

## Programmatic use

`new Chart(props)` creates the chart without JSX. Each prop is also a property.

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

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Bind<T[] \| null>` | `null` | The rows. The chart reads them and never changes them. After an in-place change, call `refresh()`. |
| `dataSource` | `Bind<DataSource \| null>` | `null` | Rows from a data source of the data layer. The chart follows its changes and its loading state. |
| `xField` | `Bind<string \| (row) => unknown>` | `null` | The field of a row that holds its position along the axis. |
| `series` | `Bind<ChartSeries[]>` | `[]` | The series to draw. See the Series table. |
| `horizontal` | `Bind<boolean>` | `false` | Draws the chart horizontally, with categories down the page and values across it. |
| `stacked` | `Bind<false \| 'normal' \| 'percent'>` | `false` | Stacks bars and areas, as values or as percentages. |
| `title` | `Bind<string>` | `''` | The title above the chart. |
| `subtitle` | `Bind<string>` | `''` | A line under the title. |
| `label` | `Bind<string>` | The title | The accessible name. |
| `xAxis` | `Bind<ChartAxis>` | `{}` | The position axis. See the Axes table. |
| `yAxis` | `Bind<ChartAxis>` | `{}` | The value axis. See the Axes table. |
| `legend` | `Bind<boolean \| ChartLegendOptions>` | On with two series or more | The legend, its `position`, and whether a click hides a series (`toggle`). |
| `tooltip` | `Bind<boolean \| ChartTooltipOptions>` | On | The tooltip, whether it lists every series (`shared`), and custom content (`format`). |
| `crosshair` | `Bind<boolean>` | `true` | A line that follows the pointer on line and area series. |
| `height` | `Bind<number \| null>` | From the design language | The height in pixels, including the title and the legend. |
| `animation` | `Bind<boolean>` | `true` | Animates the marks when they first appear. |
| `tableButton` | `Bind<boolean>` | `true` | Shows a button that switches between the chart and its table view. |
| `mode` | `Bind<'chart' \| 'table'>` | `'chart'` | Shows the chart or its table view. Supports `x-model`. |
| `emptyText` | `Bind<string>` | A kit string | The text shown when there is nothing to draw. |
| `loading` | `Bind<boolean>` | `false` | Keeps the current chart at reduced opacity while new values load. |

### Series

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `yField` | `string \| (row) => unknown` | Required | The field that holds the value. |
| `type` | `ChartSeriesType` | `'line'` | How the series is drawn: `line`, `area`, `bar`, `scatter`, `bubble`, `rangeArea`, `rangeBar`, `candlestick`, `ohlc`, `waterfall`, `heatmap`, `pie`, `donut`, `funnel` or `radar`. A chart draws the family of its first series. |
| `name` | `string` | `yField` | The name in the legend, the tooltip and the table view. |
| `xField` | `string \| (row) => unknown` | The chart's | The position, for a series with its own values. |
| `sizeField` | `string \| (row) => unknown` |  | The size of a bubble. |
| `lowField, highField` | `string \| (row) => unknown` |  | The ends of a range, and the lowest and highest price of a candle. |
| `openField, closeField` | `string \| (row) => unknown` |  | The first and the last price of a candle. |
| `valueField` | `string \| (row) => unknown` |  | The value a heat map shows as a color. |
| `totalField` | `string \| (row) => unknown` |  | A row of a waterfall that shows the total so far. |
| `innerRadius` | `number` | From the design language | The hole of a donut, as a share of its radius. |
| `startAngle` | `number` | `0` | Where the first slice starts, in degrees from the top, clockwise. |
| `data` | `T[]` | The chart's rows | The rows of this series. |
| `color` | `string` | The color of its position in `series` | A custom color. |
| `stack` | `string \| boolean` | The chart's `stacked` | Series with the same name stack on each other. |
| `visible` | `boolean` | `true` | Draws the series. |
| `legend` | `boolean` | `true` | Lists the series in the legend. |
| `tooltip` | `boolean` | `true` | Lists the series in the tooltip. |
| `smooth` | `boolean` | `false` | Curves the line without passing the values it connects. |
| `step` | `'start' \| 'middle' \| 'end'` |  | Draws a stepped line, and sets where the value changes. |
| `markers` | `boolean` | `false` | Marks each value on a line. |
| `labels` | `'none' \| 'last' \| 'extremes' \| 'all'` | `'none'` | The values that show a label. A label that does not fit is omitted. |
| `gaps` | `'break' \| 'connect' \| 'zero'` | `'break'` | How a line treats a missing value. |
| `format` | `ChartFormat` | The value axis's | How values are displayed: a function, or options of the browser's number format. |

### Axes

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | `'auto' \| 'category' \| 'linear' \| 'log' \| 'time'` | `'auto'` | How the axis places its values. |
| `title` | `string` |  | A title along the axis. |
| `min, max` | `number \| Date` | From the values | The first and the last value. |
| `format` | `ChartFormat` | The language of the page | How values are displayed: a function, or options of the browser's formats. |
| `tickCount` | `number` | As many as fit | The approximate number of values it marks. |
| `labelAngle` | `number` | `0` | Rotates the labels by this many degrees, for long labels. |
| `reversed` | `boolean` | `false` | Reverses the direction of the axis. |
| `labels` | `boolean` | `true` | Shows the labels. |
| `grid` | `boolean` | On the value axis | Draws grid lines. |
| `line` | `boolean` | On the category axis | Draws the line of the axis. |
| `visible` | `boolean` | `true` | Shows the axis. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `refresh()` | `void` | Redraws the chart from the current rows and series, after an in-place change. |
| `setSeriesVisible(index, visible)` | `void` | Hides or shows a series, by its index in `series`. |
| `isSeriesVisible(index)` | `boolean` | Indicates whether a series is drawn. |
| `toSVG(options?)` | `string` | Returns the chart as an SVG document, with its title and legend. |
| `toDataURL(type?, options?)` | `Promise<string>` | Returns the chart as a data URL, a PNG by default. |

### Image options

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scale` | `number` | `2` | The pixel scale of a PNG. |
| `background` | `string` | The color behind the chart | The background. |

### Events

| Event | Type | Description |
| --- | --- | --- |
| `onPointClick` | `{ point, originalEvent, source }` | Occurs when a value is clicked, or chosen with Enter or Space. |
| `onPointFocused` | `{ point, originalEvent, source }` | Occurs when the pointer or the keyboard reaches a value. |
| `onSeriesToggled` | `{ series, visible, source }` | Occurs when a series is hidden or shown in the legend. |
| `onModeChanged` | `{ mode, source }` | Occurs when the chart or its table view appears. |
| `onDataError` | `{ error, source }` | Occurs when the data source fails to load. The chart also displays a message. |

### Keyboard

| Key | Action |
| --- | --- |
| `Arrow keys` | Move between positions along the axis, and between the series at a position across it. |
| `Home, End` | Move to the first or the last position. |
| `Enter, Space` | Raise `onPointClick` for the current value. |
| `Escape` | Hides the current value. |

### Accessibility

| Topic | Details |
| --- | --- |
| `Values` | Every value is available without a pointer. The arrow keys move through the chart, and a screen reader announces each value. |
| `Table` | The button in the title row shows the same values in a table. Keep it unless the values also appear on the page. |
| `Color` | Neighboring series stay distinct for color-blind readers, which each build verifies. The legend and its keys also identify the series, so color is never the only cue. |
| `Motion` | The marks appear immediately when the reader prefers reduced motion. |
| `Name` | Provide a `title` or a `label` to name the chart. |

### Styling hooks

| Hook | Description |
| --- | --- |
| `.mx-chart` | The chart. `data-mode` and `data-legend` describe what it shows, and `data-loading` indicates that it is loading. |
| `.mx-chart__head, .mx-chart__title, .mx-chart__subtitle` | The title row. |
| `.mx-chart__plot, .mx-chart__svg` | The plot. |
| `.mx-chart__series` | A series, with `data-type`. `--_mark` holds its color. |
| `.mx-chart__legend, .mx-chart__legend-item` | The legend. `data-off` marks a hidden series. |
| `.mx-chart__tooltip` | The tooltip. |
| `.mx-chart__table` | The table view. |

### Design tokens

| Token | Description |
| --- | --- |
| `chart.height` | The height, including the title and the legend. |
| `chart.series-1 … series-8` | The colors of the series, from `color.chart.*` of the design system. |
| `chart.bar-width, .bar-radius, .bar-gap` | The maximum bar width, its end corners, and the gap between bars. |
| `chart.line-width, .marker-size, .marker-ring` | Lines and markers, and the ring that separates a marker from what it crosses. |
| `chart.area-opacity, .bubble-opacity` | The fill strength of areas and bubbles. |
| `chart.title, .subtitle, .ticks, .grid, .axis` | Units of the title row and the axes. |
| `chart.tooltip, .tooltip-row, .tooltip-value` | Units of the tooltip. |
| `chart.legend-item, .legend-key` | Units of the legend. |

## Feedback

Loading issues…

## Example files

`Basic.tsx`

```tsx
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

/** One series needs no legend: the title names it. */
export default function Basic() {
    return <Chart class="ch-basic" title="Online sales" subtitle="By month, in euros" data={SALES} xField="month" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />;
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

`Lines.tsx`

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

`Areas.tsx`

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

`Source.tsx`

```tsx
import { data } from '@motifx-community/data';
import { Chart } from '@motifx-community/ui';
import { SALES } from './sales';

const source = new data.DataSource({ adapter: new data.ArrayAdapter({ data: SALES, key: 'month' }) });

/** Rows from any adapter of the data layer: the chart follows the source. */
export default function Source() {
    return <Chart class="ch-source" title="From a data source" dataSource={source} xField="month" series={[{ type: 'bar', yField: 'returns', name: 'Returns' }]} />;
}
```

`States.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** No values, and new values on their way. */
export default function States() {
    const s = reactive({ rows: SALES.slice(0, 6), loading: false });
    return (
        <Stack class="docs-wide" gap="md">
            <Chart class="ch-states" label="Sales" data={() => s.rows} loading={() => s.loading} xField="month" emptyText="No sales in this period" series={[{ type: 'bar', yField: 'online', name: 'Online' }]} />
            <Stack orientation="horizontal" gap="sm">
                <Button text="Clear" variant="outline" onclick={() => (s.rows = [])} />
                <Button text="Fill" variant="outline" onclick={() => (s.rows = SALES.slice(0, 6))} />
                <Button text="Load" variant="outline" onclick={() => (s.loading = !s.loading)} />
            </Stack>
        </Stack>
    );
}
```

`Export.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** An image with the title and the legend, to download or to put in a report. */
export default function Export() {
    const s = reactive({ image: '' });
    let chart!: Chart;
    return (
        <Stack class="docs-wide" gap="md">
            <Chart
                ref={(x: Chart) => (chart = x)}
                class="ch-export"
                title="Sales by channel"
                data={SALES}
                xField="month"
                series={[
                    { type: 'bar', yField: 'online', name: 'Online' },
                    { type: 'bar', yField: 'stores', name: 'Stores' }
                ]}
            />
            <Button text="Create the image" variant="outline" onclick={() => chart.toDataURL().then(url => (s.image = url))} />
            {s.image && <img class="ch-image" alt="The chart as an image" src={() => s.image} />}
        </Stack>
    );
}
```

`Programmatic.tsx`

```tsx
import { Component } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** A chart created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const chart = new Chart({ label: 'Sales', data: SALES, xField: 'month', series: [{ type: 'bar', yField: 'online', name: 'Online' }] });
        const next = new Button({ text: 'Show the stores', variant: 'outline', onclick: () => (chart.series = [{ type: 'bar', yField: 'stores', name: 'Stores' }]) });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(chart, next);
        this.controls.add(stack);
    }
}
```
