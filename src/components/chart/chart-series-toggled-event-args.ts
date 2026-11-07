import type { Chart } from './Chart';
import type { ChartSeries } from './chart-series';

/** Data of `Chart.onSeriesToggled`. */
export interface ChartSeriesToggledEventArgs<T = any> {
    series: ChartSeries<T>;
    visible: boolean;
    /** The row of the part of a pie, a donut or a funnel that was hidden or shown. */
    part?: number;
    source: Chart<T>;
}
