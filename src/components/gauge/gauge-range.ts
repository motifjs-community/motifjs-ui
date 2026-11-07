/** A stretch of a gauge's scale, with what a value there means. */
export interface GaugeRange {
    from: number;
    to: number;
    /** The meaning, in the design language's colors: the fill takes it while the value is in this range. */
    tone?: 'neutral' | 'good' | 'warning' | 'danger';
    /** A color of your own instead of a tone. A range with neither takes the next chart color. */
    color?: string;
    /** A name for the range, read with the value. */
    label?: string;
}
