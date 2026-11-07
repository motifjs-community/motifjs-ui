/** A line or a band across the plot, for a target, a limit or a period. */
export interface ChartReference {
    /** The axis it marks a value of: `'y'` across the values, `'x'` at a position. Default: `'y'`. */
    axis?: 'x' | 'y';
    /** A line at this value or position. */
    value?: unknown;
    /** A band from one value or position to another. */
    from?: unknown;
    to?: unknown;
    /** A short text at its end. */
    label?: string;
}
