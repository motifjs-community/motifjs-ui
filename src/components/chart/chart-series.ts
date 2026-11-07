import type { ChartFormat } from '../../parts/chart/chart-text';
import type { ChartField } from './chart-field';
import type { ChartLabels } from './chart-labels';
import type { ChartSeriesType } from './chart-series-type';

/** A set of values on the chart. Every field is optional except `yField`. */
export interface ChartSeries<T = any> {
    /** How it draws. Default: `'line'`. */
    type?: ChartSeriesType;
    /** The name in the legend, the tooltip and the table. Default: `yField` when it is a name. */
    name?: string;
    /** The field that holds the value. On a heat map, the row; on a range or a candle, leave it out. */
    yField?: ChartField<T>;
    /** The field of the position along the axis, for a series with its own. Default: the chart's `xField`. */
    xField?: ChartField<T>;
    /** The field that holds the size of a bubble. */
    sizeField?: ChartField<T>;
    /** The ends of a range (`rangeArea`, `rangeBar`), and the lowest and highest price of a candle. */
    lowField?: ChartField<T>;
    highField?: ChartField<T>;
    /** The first and last price of a candle (`candlestick`, `ohlc`). */
    openField?: ChartField<T>;
    closeField?: ChartField<T>;
    /** The value a heat map shows as a color. */
    valueField?: ChartField<T>;
    /** A row of a waterfall that shows the total so far instead of a change. */
    totalField?: ChartField<T>;
    /** The hole of a donut, as a share of its radius. Default: from the design language. */
    innerRadius?: number;
    /** Where the first slice of a pie or a donut starts, in degrees from the top, clockwise. Default: `0`. */
    startAngle?: number;
    /** Rows of its own. Default: the chart's rows. */
    data?: readonly T[];
    /** A color of your own. Default: the color of its place in `series`, which it keeps when others are hidden. */
    color?: string;
    /** Series of the same name stack on each other; `true` joins the chart's one stack. Default: the chart's `stacked`. */
    stack?: string | boolean;
    /** Draws the series. A series the reader hid in the legend stays hidden until shown there. Default: `true`. */
    visible?: boolean;
    /** Lists the series in the legend. Default: `true`. */
    legend?: boolean;
    /** Lists the series in the tooltip. Default: `true`. */
    tooltip?: boolean;
    /** Curves the line, never past the values it joins. Default: `false`. */
    smooth?: boolean;
    /** Draws corners: the value changes at the start, the middle or the end of the step. */
    step?: 'start' | 'middle' | 'end';
    /** Marks each value of a line. Default: `false`. */
    markers?: boolean;
    /** Which values carry a label. Default: `'none'`. */
    labels?: ChartLabels;
    /** What an empty value does to a line: it breaks it, the line joins past it, or it counts as zero. Default: `'break'`. */
    gaps?: 'break' | 'connect' | 'zero';
    /** How the values read in the tooltip, the labels and the table. Default: the value axis's `format`. */
    format?: ChartFormat;
}
