import type { Chart } from './Chart';
import type { ChartPoint } from './chart-point';

/** Data of `Chart.onPointClick` and `Chart.onPointFocused`. */
export interface ChartPointEventArgs<T = any> {
    point: ChartPoint<T>;
    /** What the reader did, when the reader did it. */
    originalEvent: Event | null;
    source: Chart<T>;
}
