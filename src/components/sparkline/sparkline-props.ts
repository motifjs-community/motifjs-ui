import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { ChartFormat } from "../../parts/chart/chart-text";
import type { ChartField } from "../chart/chart-field";
import type { SparklineHighlight } from "./sparkline-highlight";
import type { SparklineType } from "./sparkline-type";

/** Props of `Sparkline`. Each prop is also a settable property, and a function is tracked. */
export interface SparklineProps<T = any> extends ControlProps {
    /** The values: numbers, or rows with `yField`. They are read, never changed. */
    data?: Bind<readonly (number | null)[] | readonly T[] | null>;
    /** The field of a row that holds its value. */
    yField?: Bind<ChartField<T> | null>;
    /** How it draws. The default is `'line'`. */
    type?: Bind<SparklineType>;
    /** The values marked with a dot. The default is the last one, for a line or an area. */
    highlight?: Bind<readonly SparklineHighlight[]>;
    /** A line across at a value, or at the average. */
    reference?: Bind<number | 'average' | null>;
    /** The lowest and highest value of its scale. By default, they come from the values. */
    min?: Bind<number | null>;
    max?: Bind<number | null>;
    /** Curves the line, never past the values it joins. */
    smooth?: Bind<boolean>;
    /** A color of your own. By default, the first chart color of the design language. */
    color?: Bind<string | null>;
    /** What the values are, for the accessible name: "Sales" reads "Sales: 12 values, from 4 to 9…". */
    label?: Bind<string>;
    /** How a value reads. By default, the numbers of the language. */
    format?: Bind<ChartFormat | null>;
    /** The value under the pointer shows above it. The default is `true`. */
    tooltip?: Bind<boolean>;
    /** The height in pixels. By default, it comes from the design language. */
    height?: Bind<number | null>;
}
