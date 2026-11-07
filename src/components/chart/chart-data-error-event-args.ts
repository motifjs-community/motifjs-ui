import type { Chart } from './Chart';

/** Data of `Chart.onDataError`. */
export interface ChartDataErrorEventArgs<T = any> {
    /** What the data source reported. */
    error: unknown;
    source: Chart<T>;
}
