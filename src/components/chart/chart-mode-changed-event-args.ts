import type { Chart } from './Chart';
import type { ChartMode } from './chart-mode';

/** Data of `Chart.onModeChanged`. */
export interface ChartModeChangedEventArgs<T = any> {
    mode: ChartMode;
    source: Chart<T>;
}
