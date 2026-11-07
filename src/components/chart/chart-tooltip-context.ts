import type { ChartPoint } from './chart-point';

/** What a tooltip gets to show. */
export interface ChartTooltipContext<T = any> {
    /** The position along the axis, as it reads. */
    title: string;
    /** The values there. */
    points: readonly ChartPoint<T>[];
    /** The value under the pointer, if any. */
    point: ChartPoint<T> | null;
}
