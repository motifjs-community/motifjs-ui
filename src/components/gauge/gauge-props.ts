import type { Bind } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { ChartFormat } from "../../parts/chart/chart-text";
import type { GaugeMark } from "./gauge-mark";
import type { GaugeMarker } from "./gauge-marker";
import type { GaugeNeedleShape } from "./gauge-needle-shape";
import type { GaugeOrientation } from "./gauge-orientation";
import type { GaugeRange } from "./gauge-range";
import type { GaugeScale } from "./gauge-scale";
import type { GaugeType } from "./gauge-type";

/** Props of `Gauge`. Each prop is also a settable property, and a function is tracked. */
export interface GaugeProps extends ControlProps {
    /** The value. */
    value?: Bind<number | null>;
    /** The ends of the scale. The defaults are `0` and `100`; a `min` above `max` runs the scale the other way. */
    min?: Bind<number>;
    max?: Bind<number>;
    /** How it draws. The default is `'arc'`. */
    type?: Bind<GaugeType>;
    /** Which way a straight gauge runs. The default is `'horizontal'`. */
    orientation?: Bind<GaugeOrientation>;
    /** How far an arc goes round, in degrees. The default is `240`. */
    angle?: Bind<number>;
    /** How far the middle of an arc is turned from the top, clockwise, in degrees. The default is `0`. */
    rotation?: Bind<number>;
    /** Stretches of the scale and what they mean. The fill takes the tone of the range its value is in. */
    ranges?: Bind<readonly GaugeRange[]>;
    /** What the scale shows. The default is `'ends'`. */
    scale?: Bind<GaugeScale>;
    /** The values of the ticks. By default, ticks every `tickInterval`. */
    ticks?: Bind<readonly number[] | null>;
    /** How far apart the ticks are. By default, an even step that fits the size. */
    tickInterval?: Bind<number | null>;
    /** How many small ticks go between two ticks. The default is `0`. */
    minorTicks?: Bind<number>;
    /** Fills the track from `baseValue` to the value. The default is `true`. */
    fill?: Bind<boolean>;
    /** Where the fill starts. By default, the start of the scale. */
    baseValue?: Bind<number | null>;
    /** A shape that points at the value. The default is none. */
    marker?: Bind<GaugeMarker | null>;
    /** How a needle is drawn. The default is `'tapered'`. */
    needleShape?: Bind<GaugeNeedleShape>;
    /** Other values marked on the scale, such as targets or limits. */
    marks?: Bind<readonly GaugeMark[]>;
    /** The shape of the marks, unless a mark has its own. The default is `'triangle'`. */
    markShape?: Bind<GaugeMarker>;
    /** What it measures, shown under the value and read as its name. */
    label?: Bind<string>;
    /** How the values read. By default, the numbers of the language. */
    format?: Bind<ChartFormat | null>;
    /** Shows the value in the middle. The default is `true`. */
    showValue?: Bind<boolean>;
    /** Shows the value or the mark under the pointer. The default is `true`. */
    tooltip?: Bind<boolean>;
    /** The width of an arc's whole circle, with its ranges, or the length of an upright gauge, in pixels. By default, it comes from the design language. */
    size?: Bind<number | null>;
}
