import type { GaugeMarker } from "./gauge-marker";

/** A value marked on a gauge's scale besides its own, such as a target or a limit. */
export interface GaugeMark {
    value: number;
    /** What it is, read with the gauge's value and shown in the tooltip. */
    label?: string;
    /** Its shape. By default, the gauge's `markShape`. */
    shape?: GaugeMarker;
}
