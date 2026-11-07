import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Areas from './examples/Areas';
import Basic from './examples/Basic';
import Export from './examples/Export';
import Gaps from './examples/Gaps';
import Horizontal from './examples/Horizontal';
import Lines from './examples/Lines';
import Live from './examples/Live';
import Negative from './examples/Negative';
import Programmatic from './examples/Programmatic';
import Scatter from './examples/Scatter';
import Source from './examples/Source';
import States from './examples/States';
import Stacked from './examples/Stacked';
import TimeAxis from './examples/TimeAxis';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['data', '`Bind<T[] | null>`', '`null`', 'The rows. The chart reads them and never changes them. After an in-place change, call `refresh()`.'],
    ['dataSource', '`Bind<DataSource | null>`', '`null`', 'Rows from a data source of the data layer. The chart follows its changes and its loading state.'],
    ['xField', '`Bind<string | (row) => unknown>`', '`null`', 'The field of a row that holds its position along the axis.'],
    ['series', '`Bind<ChartSeries[]>`', '`[]`', 'The series to draw. See the Series table.'],
    ['horizontal', '`Bind<boolean>`', '`false`', 'Draws the chart horizontally, with categories down the page and values across it.'],
    ['stacked', "`Bind<false | 'normal' | 'percent'>`", '`false`', 'Stacks bars and areas, as values or as percentages.'],
    ['title', '`Bind<string>`', "`''`", 'The title above the chart.'],
    ['subtitle', '`Bind<string>`', "`''`", 'A line under the title.'],
    ['label', '`Bind<string>`', 'The title', 'The accessible name.'],
    ['xAxis', '`Bind<ChartAxis>`', '`{}`', 'The position axis. See the Axes table.'],
    ['yAxis', '`Bind<ChartAxis>`', '`{}`', 'The value axis. See the Axes table.'],
    ['legend', '`Bind<boolean | ChartLegendOptions>`', 'On with two series or more', 'The legend, its `position`, and whether a click hides a series (`toggle`).'],
    ['tooltip', '`Bind<boolean | ChartTooltipOptions>`', 'On', 'The tooltip, whether it lists every series (`shared`), and custom content (`format`).'],
    ['crosshair', '`Bind<boolean>`', '`true`', 'A line that follows the pointer on line and area series.'],
    ['height', '`Bind<number | null>`', 'From the design language', 'The height in pixels, including the title and the legend.'],
    ['animation', '`Bind<boolean>`', '`true`', 'Animates the marks when they first appear.'],
    ['tableButton', '`Bind<boolean>`', '`true`', 'Shows a button that switches between the chart and its table view.'],
    ['mode', "`Bind<'chart' | 'table'>`", "`'chart'`", 'Shows the chart or its table view. Supports `x-model`.'],
    ['emptyText', '`Bind<string>`', 'A kit string', 'The text shown when there is nothing to draw.'],
    ['loading', '`Bind<boolean>`', '`false`', 'Keeps the current chart at reduced opacity while new values load.'],
];

const SERIES = [
    ['yField', '`string | (row) => unknown`', 'Required', 'The field that holds the value.'],
    ['type', "`'line' | 'area' | 'bar' | 'scatter' | 'bubble'`", "`'line'`", 'How the series is drawn.'],
    ['name', '`string`', '`yField`', 'The name in the legend, the tooltip and the table view.'],
    ['xField', '`string | (row) => unknown`', 'The chart\'s', 'The position, for a series with its own values.'],
    ['sizeField', '`string | (row) => unknown`', '', 'The size of a bubble.'],
    ['data', '`T[]`', 'The chart\'s rows', 'The rows of this series.'],
    ['color', '`string`', 'The color of its position in `series`', 'A custom color.'],
    ['stack', '`string | boolean`', 'The chart\'s `stacked`', 'Series with the same name stack on each other.'],
    ['visible', '`boolean`', '`true`', 'Draws the series.'],
    ['legend', '`boolean`', '`true`', 'Lists the series in the legend.'],
    ['tooltip', '`boolean`', '`true`', 'Lists the series in the tooltip.'],
    ['smooth', '`boolean`', '`false`', 'Curves the line without passing the values it connects.'],
    ['step', "`'start' | 'middle' | 'end'`", '', 'Draws a stepped line, and sets where the value changes.'],
    ['markers', '`boolean`', '`false`', 'Marks each value on a line.'],
    ['labels', "`'none' | 'last' | 'extremes' | 'all'`", "`'none'`", 'The values that show a label. A label that does not fit is omitted.'],
    ['gaps', "`'break' | 'connect' | 'zero'`", "`'break'`", 'How a line treats a missing value.'],
    ['format', '`ChartFormat`', 'The value axis\'s', 'How values are displayed: a function, or options of the browser\'s number format.'],
];

const AXIS = [
    ['kind', "`'auto' | 'category' | 'linear' | 'log' | 'time'`", "`'auto'`", 'How the axis places its values.'],
    ['title', '`string`', '', 'A title along the axis.'],
    ['min, max', '`number | Date`', 'From the values', 'The first and the last value.'],
    ['format', '`ChartFormat`', 'The language of the page', 'How values are displayed: a function, or options of the browser\'s formats.'],
    ['tickCount', '`number`', 'As many as fit', 'The approximate number of values it marks.'],
    ['labelAngle', '`number`', '`0`', 'Rotates the labels by this many degrees, for long labels.'],
    ['reversed', '`boolean`', '`false`', 'Reverses the direction of the axis.'],
    ['labels', '`boolean`', '`true`', 'Shows the labels.'],
    ['grid', '`boolean`', 'On the value axis', 'Draws grid lines.'],
    ['line', '`boolean`', 'On the category axis', 'Draws the line of the axis.'],
    ['visible', '`boolean`', '`true`', 'Shows the axis.'],
];

const MEMBERS = [
    ['refresh()', '`void`', 'Redraws the chart from the current rows and series, after an in-place change.'],
    ['setSeriesVisible(index, visible)', '`void`', 'Hides or shows a series, by its index in `series`.'],
    ['isSeriesVisible(index)', '`boolean`', 'Indicates whether a series is drawn.'],
    ['toSVG(options?)', '`string`', 'Returns the chart as an SVG document, with its title and legend.'],
    ['toDataURL(type?, options?)', '`Promise<string>`', 'Returns the chart as a data URL, a PNG by default.'],
];

const OPTIONS = [
    ['scale', '`number`', '`2`', 'The pixel scale of a PNG.'],
    ['background', '`string`', 'The color behind the chart', 'The background.'],
];

const EVENTS = [
    ['onPointClick', '`{ point, originalEvent, source }`', 'Occurs when a value is clicked, or chosen with Enter or Space.'],
    ['onPointFocused', '`{ point, originalEvent, source }`', 'Occurs when the pointer or the keyboard reaches a value.'],
    ['onSeriesToggled', '`{ series, visible, source }`', 'Occurs when a series is hidden or shown in the legend.'],
    ['onModeChanged', '`{ mode, source }`', 'Occurs when the chart or its table view appears.'],
    ['onDataError', '`{ error, source }`', 'Occurs when the data source fails to load. The chart also displays a message.'],
];

const KEYS = [
    ['Arrow keys', 'Move between positions along the axis, and between the series at a position across it.'],
    ['Home, End', 'Move to the first or the last position.'],
    ['Enter, Space', 'Raise `onPointClick` for the current value.'],
    ['Escape', 'Hides the current value.'],
];

const A11Y = [
    ['Values', 'Every value is available without a pointer. The arrow keys move through the chart, and a screen reader announces each value.'],
    ['Table', 'The button in the title row shows the same values in a table. Keep it unless the values also appear on the page.'],
    ['Color', 'Neighboring series stay distinct for color-blind readers, which each build verifies. The legend and its keys also identify the series, so color is never the only cue.'],
    ['Motion', 'The marks appear immediately when the reader prefers reduced motion.'],
    ['Name', 'Provide a `title` or a `label` to name the chart.'],
];

const HOOKS = [
    ['.mx-chart', 'The chart. `data-mode` and `data-legend` describe what it shows, and `data-loading` indicates that it is loading.'],
    ['.mx-chart__head, .mx-chart__title, .mx-chart__subtitle', 'The title row.'],
    ['.mx-chart__plot, .mx-chart__svg', 'The plot.'],
    ['.mx-chart__series', 'A series, with `data-type`. `--_mark` holds its color.'],
    ['.mx-chart__legend, .mx-chart__legend-item', 'The legend. `data-off` marks a hidden series.'],
    ['.mx-chart__tooltip', 'The tooltip.'],
    ['.mx-chart__table', 'The table view.'],
];

const TOKENS = [
    ['chart.height', 'The height, including the title and the legend.'],
    ['chart.series-1 … series-8', 'The colors of the series, from `color.chart.*` of the design system.'],
    ['chart.bar-width, .bar-radius, .bar-gap', 'The maximum bar width, its end corners, and the gap between bars.'],
    ['chart.line-width, .marker-size, .marker-ring', 'Lines and markers, and the ring that separates a marker from what it crosses.'],
    ['chart.area-opacity, .bubble-opacity', 'The fill strength of areas and bubbles.'],
    ['chart.title, .subtitle, .ticks, .grid, .axis', 'Units of the title row and the axes.'],
    ['chart.tooltip, .tooltip-row, .tooltip-value', 'Units of the tooltip.'],
    ['chart.legend-item, .legend-key', 'Units of the legend.'],
];

export default function ChartPage() {
    return (
        <>
            <p class="lead">
                <Rich text="Displays lines, areas, bars, scatter points and bubbles on a shared value axis. The chart has no dependencies, takes its appearance from the design language, and makes every value available through the keyboard and a table view." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { Chart } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="basic" title="Binding rows">
                <p>
                    <Rich text="`data` holds the rows, `xField` sets the position of each row along the axis, and each item of `series` selects a field and how it is drawn. A chart with one series shows no legend, because its title identifies the series." />
                </p>
                <Example files={code('Basic.tsx', 'sales.ts')}>
                    <Basic />
                </Example>
            </Section>

            <Section anchor="lines" title="Lines">
                <p>
                    <Rich text="A line is the default series type. `smooth` curves the line without adding a peak that is not in the data, and `labels` shows selected values on the chart. Point to a position to read every series at that position." />
                </p>
                <Example files={code('Lines.tsx', 'sales.ts')}>
                    <Lines />
                </Example>
            </Section>

            <Section anchor="areas" title="Areas">
                <p>
                    <Rich text="`stacked` adds the areas together, so that the top line shows the total." />
                </p>
                <Example files={code('Areas.tsx', 'sales.ts')}>
                    <Areas />
                </Example>
            </Section>

            <Section anchor="stacked" title="Grouped and stacked bars">
                <p>
                    <Rich text="Bars are grouped side by side by default. `stacked` places them on top of each other, as values or as percentages. Use `stack` on a series to assign it to a named stack." />
                </p>
                <Example stack files={code('Stacked.tsx', 'sales.ts')}>
                    <Stacked />
                </Example>
            </Section>

            <Section anchor="horizontal" title="Horizontal charts">
                <p>
                    <Rich text="`horizontal` suits long category names and rankings. Rows keep the order in which they are provided." />
                </p>
                <Example files={code('Horizontal.tsx')}>
                    <Horizontal />
                </Example>
            </Section>

            <Section anchor="negative" title="Negative values">
                <p>
                    <Rich text="Bars extend in both directions from zero. A label that does not fit or that would cover another label is omitted, and its value remains available in the tooltip and the table view." />
                </p>
                <Example files={code('Negative.tsx')}>
                    <Negative />
                </Example>
            </Section>

            <Section anchor="scatter" title="Scatter and bubble charts">
                <p>
                    <Rich text="`scatter` and `bubble` plot two numeric values. `sizeField` adds a third value to a bubble, represented by its area. The pointer selects the nearest point." />
                </p>
                <Example files={code('Scatter.tsx')}>
                    <Scatter />
                </Example>
            </Section>

            <Section anchor="time" title="Dates">
                <p>
                    <Rich text="Date values produce a time axis, with marks on round days and months in the language of the page. Long series are reduced to what the width can display, and their peaks are preserved." />
                </p>
                <Example files={code('TimeAxis.tsx')}>
                    <TimeAxis />
                </Example>
            </Section>

            <Section anchor="gaps" title="Missing values">
                <p>
                    <Rich text="A missing value breaks the line, because nothing was measured at that position. `gaps` connects across it or treats it as zero, and `step` draws a stepped line." />
                </p>
                <Example files={code('Gaps.tsx')}>
                    <Gaps />
                </Example>
            </Section>

            <Section anchor="live" title="Reactive data">
                <p>
                    <Rich text="A function prop follows reactive data. For plain data, call `reState()`, or `refresh()` after an in-place change." />
                </p>
                <Example stack files={code('Live.tsx')}>
                    <Live />
                </Example>
            </Section>

            <Section anchor="source" title="Data sources">
                <p>
                    <Rich text="`dataSource` reads rows from any adapter of the data layer. While rows load, the current chart stays in place at reduced opacity." />
                </p>
                <Example files={code('Source.tsx', 'sales.ts')}>
                    <Source />
                </Example>
            </Section>

            <Section anchor="states" title="Empty and loading states">
                <p>
                    <Rich text="A chart without values displays a message, which `emptyText` sets. `loading` keeps the current chart in place at reduced opacity, so that the layout does not shift while new values arrive." />
                </p>
                <Example stack files={code('States.tsx', 'sales.ts')}>
                    <States />
                </Example>
            </Section>

            <Section anchor="export" title="Creating an image">
                <p>
                    <Rich text="`toDataURL()` and `toSVG()` return an image that includes the title and the legend. A browser cannot use the page's fonts inside an image, so a system font replaces them." />
                </p>
                <Example stack files={code('Export.tsx', 'sales.ts')}>
                    <Export />
                </Example>
            </Section>

            <Section anchor="programmatic" title="Programmatic use">
                <p>
                    <Rich text="`new Chart(props)` creates the chart without JSX. Each prop is also a property." />
                </p>
                <Example stack files={code('Programmatic.tsx', 'sales.ts')}>
                    <Programmatic class="docs-wide" />
                </Example>
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                    <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                    <Rich text="Series" />
                </h3>
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={SERIES} />
                <h3>
                    <Rich text="Axes" />
                </h3>
                <ApiTable head={['Field', 'Type', 'Default', 'Description']} rows={AXIS} />
                <h3>
                    <Rich text="Properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
                <h3>
                    <Rich text="Image options" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={OPTIONS} />
                <h3>
                    <Rich text="Events" />
                </h3>
                <ApiTable head={['Event', 'Type', 'Description']} rows={EVENTS} />
                <h3>
                    <Rich text="Keyboard" />
                </h3>
                <ApiTable head={['Key', 'Action']} rows={KEYS} />
                <h3>
                    <Rich text="Accessibility" />
                </h3>
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
                <h3>
                    <Rich text="Styling hooks" />
                </h3>
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                    <Rich text="Design tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>
        </>
    );
}
