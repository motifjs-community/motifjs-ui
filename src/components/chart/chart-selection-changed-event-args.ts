import type { Chart } from './Chart';
import type { ChartPoint } from './chart-point';

/** Data of `Chart.onSelectionChanged`. */
export interface ChartSelectionChangedEventArgs<T = any> {
    /** The values chosen now. */
    points: ChartPoint<T>[];
    source: Chart<T>;
}
