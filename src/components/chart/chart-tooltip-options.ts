import type { ComponentBase } from '@motifx/core';
import type { ChartTooltipContext } from './chart-tooltip-context';

/** The tooltip. */
export interface ChartTooltipOptions<T = any> {
    /** Default: `true`. */
    visible?: boolean;
    /** Lists every series at that position, not only the one under the pointer. Default: `true`; a scatter chart: `false`. */
    shared?: boolean;
    /** Content of your own, as text or as a component. */
    format?: (context: ChartTooltipContext<T>) => string | ComponentBase;
}
