import type { ChartLegendPosition } from './chart-legend-position';

/** The legend. A chart of one series has none: its title names it. */
export interface ChartLegendOptions {
    /** Default: `true` with two series or more. */
    visible?: boolean;
    /** Default: `'bottom'`. */
    position?: ChartLegendPosition;
    /** A click hides or shows a series. Default: `true`. */
    toggle?: boolean;
}
