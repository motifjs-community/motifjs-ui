import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { ChartFormat } from "../../parts/chart/chart-text";
import type { ChartField } from "../chart/chart-field";

/** Props of `BarGauge`. Each prop is also a settable property, and a function is tracked. */
export interface BarGaugeProps<T = any> extends ControlProps {
    /** The values: numbers, or rows with `valueField`. They are read and never changed. */
    data?: Bind<readonly (T | number)[]>;
    /** The field of a row that holds its value. */
    valueField?: Bind<ChartField<T> | null>;
    /** The field of a row that holds its name, shown in the legend and the tooltip and read with its value. */
    nameField?: Bind<ChartField<T> | null>;
    /** The field of a row that holds a color of its own. */
    colorField?: Bind<ChartField<T> | null>;
    /** The ends of the scale. The defaults are `0` and `100`. */
    min?: Bind<number>;
    max?: Bind<number>;
    /** Where the bars start, so they grow both ways from a value inside the scale. By default, the start of the scale. */
    baseValue?: Bind<number | null>;
    /** How far the bars go round, in degrees. The default is `270`. */
    angle?: Bind<number>;
    /** How far the middle of the bars is turned from the top, clockwise, in degrees. The default is `0`. */
    rotation?: Bind<number>;
    /** Colors of your own, in the order of the values, instead of the chart colors. */
    colors?: Bind<readonly string[] | null>;
    /** What the values are, read as its name. */
    label?: Bind<string>;
    /** How the values read. By default, the numbers of the language. */
    format?: Bind<ChartFormat | null>;
    /** Writes each value at the end of its bar. The default is `true`. */
    showLabels?: Bind<boolean>;
    /** Shows a legend of the names under the bars. The default is `false`. */
    legend?: Bind<boolean>;
    /** Shows the value under the pointer. The default is `true`. */
    tooltip?: Bind<boolean>;
    /** The width of the bars' whole circle in pixels. By default, it comes from the design language. */
    size?: Bind<number | null>;
}
