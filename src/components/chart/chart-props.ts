import type { Bind, Event as MotifEvent } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { ChartAxis } from './chart-axis';
import type { ChartDataErrorEventArgs } from './chart-data-error-event-args';
import type { ChartField } from './chart-field';
import type { ChartLegendOptions } from './chart-legend-options';
import type { ChartPointEventArgs } from './chart-point-event-args';
import type { ChartSeries } from './chart-series';
import type { ChartSeriesToggledEventArgs } from './chart-series-toggled-event-args';
import type { ChartStacked } from './chart-stacked';
import type { ChartTooltipOptions } from './chart-tooltip-options';
import type { ChartMode } from './chart-mode';
import type { ChartModeChangedEventArgs } from './chart-mode-changed-event-args';

type On<E> = Parameters<MotifEvent<E>>[0];

/** Props of a chart. */
export interface ChartProps<T = any> extends ControlProps {
    /** The rows. They are read, never changed. After changing them in place, call `refresh()`. */
    data?: Bind<readonly T[] | null>;
    /** Rows from a data source of the data layer. */
    dataSource?: Bind<data.DataSource<T, any> | null>;
    /** The field of a row that holds its position along the axis. */
    xField?: Bind<ChartField<T> | null>;
    /** What to draw. */
    series?: Bind<readonly ChartSeries<T>[]>;
    /** Lays the chart on its side: categories down the page, values across. Default: `false`. */
    horizontal?: Bind<boolean>;
    /** Stacks the bars and areas, as they are or as shares of a hundred. Default: `false`. */
    stacked?: Bind<ChartStacked>;
    /** The title above the chart. */
    title?: Bind<string>;
    /** A line under the title. */
    subtitle?: Bind<string>;
    /** The accessible name. Default: the title. */
    label?: Bind<string>;
    /** The axis of positions: along the bottom, or down the side when `horizontal`. */
    xAxis?: Bind<ChartAxis>;
    /** The axis of values. */
    yAxis?: Bind<ChartAxis>;
    /** Default: on with two series or more. */
    legend?: Bind<boolean | ChartLegendOptions>;
    /** Default: on. */
    tooltip?: Bind<boolean | ChartTooltipOptions<T>>;
    /** A line that follows the pointer on lines and areas. Default: `true`. */
    crosshair?: Bind<boolean>;
    /** The height in pixels. Default: from the design language. */
    height?: Bind<number | null>;
    /** Draws the marks in as they first appear. Default: `true`. */
    animation?: Bind<boolean>;
    /** A button that switches between the chart and its table. Default: `true`. */
    tableButton?: Bind<boolean>;
    /** Shows the chart or its table. Follows `x-model`. Default: `'chart'`. */
    mode?: Bind<ChartMode>;
    /** The text when there is nothing to draw. Default: a kit string. */
    emptyText?: Bind<string>;
    /** Holds what is drawn, dimmed, while new values load. */
    loading?: Bind<boolean>;
    onPointClick?: On<ChartPointEventArgs<T>>;
    onPointFocused?: On<ChartPointEventArgs<T>>;
    onSeriesToggled?: On<ChartSeriesToggledEventArgs<T>>;
    onModeChanged?: On<ChartModeChangedEventArgs<T>>;
    onDataError?: On<ChartDataErrorEventArgs<T>>;
}
