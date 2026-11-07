import type { ChartFormat } from '../../parts/chart/chart-text';
import type { ChartAxisKind } from './chart-axis-kind';

/** An axis of the chart. */
export interface ChartAxis {
    /** Default: `'auto'`. */
    kind?: ChartAxisKind;
    /** A title along the axis. */
    title?: string;
    /** The first value. Default: taken from the values. */
    min?: number | Date;
    /** The last value. Default: taken from the values. */
    max?: number | Date;
    /** How the values read. Default: the numbers and dates of the language. */
    format?: ChartFormat;
    /** About how many values it marks. Default: as many as fit. */
    tickCount?: number;
    /** Turns the labels by this many degrees, for long ones. Default: `0`. */
    labelAngle?: number;
    /** Runs the other way. Default: `false`. */
    reversed?: boolean;
    /** Shows the labels. Default: `true`. */
    labels?: boolean;
    /** Draws grid lines. Default: `true` on the value axis, and on a number axis along the bottom. */
    grid?: boolean;
    /** Draws the line of the axis. Default: `true` on the category axis. */
    line?: boolean;
    /** Shows the axis: labels, line and title. Default: `true`. */
    visible?: boolean;
}
