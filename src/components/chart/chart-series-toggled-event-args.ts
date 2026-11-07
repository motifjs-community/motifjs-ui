import type { Chart } from './Chart';
import type { ChartSeries } from './chart-series';

/** Data of `Chart.onSeriesToggled`. */
export interface ChartSeriesToggledEventArgs<T = any> {
    series: ChartSeries<T>;
    visible: boolean;
    source: Chart<T>;
}
