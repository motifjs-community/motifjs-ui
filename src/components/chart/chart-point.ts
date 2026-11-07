/** A value of the chart. */
export interface ChartPoint<T = any> {
    /** The name of its series. */
    series: string;
    /** Its place in the `series` you gave. */
    seriesIndex: number;
    /** Its number in the series. */
    index: number;
    /** The position along the axis, as you gave it. */
    x: unknown;
    /** The value, as a number. */
    y: number;
    /** The position, as it reads. */
    xText: string;
    /** The value, as it reads. */
    yText: string;
    /** The size of a bubble. */
    size: number | null;
    /** The row you gave. */
    row: T;
}
