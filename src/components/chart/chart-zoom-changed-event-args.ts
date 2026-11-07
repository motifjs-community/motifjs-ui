import type { Chart } from './Chart';

/** Data of `Chart.onZoomChanged`. */
export interface ChartZoomChangedEventArgs<T = any> {
    /** The first and last position in view, as given in the rows; both null when the whole chart is in view again. */
    from: unknown;
    to: unknown;
    source: Chart<T>;
}
