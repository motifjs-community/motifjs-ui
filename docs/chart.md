# Chart

> Charts · @motifx-community/ui 0.1.0-beta.11

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

## Kinds of charts

A series says how it draws with `type`, and a chart draws the family of its first series. Each kind has its own page.

| Page | Types | Shows |
| --- | --- | --- |
| `[Lines and areas](chart-lines.md)` | `line`, `area` | Change along an axis, over time or across categories. |
| `[Bars](chart-bars.md)` | `bar` | Amounts compared on a common baseline, side by side or stacked. |
| `[Scatter and bubble](chart-scatter.md)` | `scatter`, `bubble` | How two numbers relate, with a third as the size. |
| `[Pie and donut](chart-pie.md)` | `pie`, `donut` | The parts of one whole, at a glance. |
| `[Funnel](chart-funnel.md)` | `funnel` | A quantity through stages in order. |
| `[Radar](chart-radar.md)` | `radar` | Several measures at once, around a center. |
| `[Heat map](chart-heatmap.md)` | `heatmap` | A value for each pair of two categories, as a color. |
| `[Ranges](chart-ranges.md)` | `rangeArea`, `rangeBar` | A low and a high value for each position. |
| `[Candles](chart-candles.md)` | `candlestick`, `ohlc` | Four prices for each position. |
| `[Waterfall](chart-waterfall.md)` | `waterfall` | A start becoming an end through changes. |

| Page | For |
| --- | --- |
| `[Zoom and large data](chart-zoom.md)` | Hundreds of thousands of values, zoomed in by a drag, the wheel or the keys. |
| `[Live data](chart-live.md)` | Reactive values and a moving window over the latest ones. |
| `[References and selection](chart-references.md)` | Targets, limits and periods, and values chosen by a click. |
| `[Sparkline](sparkline.md)` | A chart the size of a word, in text and in tables. |
| `[Gauge](gauge.md)` | A value against its scale, on an arc or a bar, with ticks, markers and marks. |
| `[BarGauge](bar-gauge.md)` | Several values against one scale, as bars bent round one middle. |

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
| `zoom` | `Bind<boolean>` | `false` | Lets the reader zoom in on positions: a drag, Ctrl and the wheel, + and -. |
| `references` | `Bind<ChartReference[]>` | `[]` | Lines and bands across the plot: `axis`, `value` or `from` and `to`, and `label`. |
| `pointSelection` | `Bind<'none' \| 'single' \| 'multiple'>` | `'none'` | Whether a click or Enter chooses values. |
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
| `span` | `number` |  | Shows only the latest stretch of positions: a time in milliseconds, a number, or a count of categories. |
| `visible` | `boolean` | `true` | Shows the axis. |

### Properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `refresh()` | `void` | Redraws the chart from the current rows and series, after an in-place change. |
| `setSeriesVisible(index, visible)` | `void` | Hides or shows a series, by its index in `series`. |
| `isSeriesVisible(index)` | `boolean` | Indicates whether a series is drawn. |
| `zoomTo(from, to)` | `void` | Shows the positions from one to another, given as in the rows. |
| `resetZoom()` | `void` | Shows every position again. |
| `selectedPoints` | `ChartPoint[]` | The values chosen now. |
| `clearSelection()` | `void` | Chooses nothing. |
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
| `onZoomChanged` | `{ from, to, source }` | Occurs when the positions in view change; both are null when all of them are in view again. |
| `onSelectionChanged` | `{ points, source }` | Occurs when values are chosen or let go. |
| `onDataError` | `{ error, source }` | Occurs when the data source fails to load. The chart also displays a message. |

### Keyboard

| Key | Action |
| --- | --- |
| `Arrow keys` | Move between positions along the axis, and between the series at a position across it. |
| `Home, End` | Move to the first or the last position. |
| `Enter, Space` | Raise `onPointClick` for the current value. |
| `+, -, 0` | With `zoom`: zoom in and out around the value, and show all of it again. |
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
