/** An item of a chart's legend: a series, a part of a whole, or a color of a heat map. */
export interface LegendEntry {
    /** `series:2`, `part:4` or `heat:1`. */
    id: string;
    name: string;
    /** The color of its key. */
    mark: string;
    /** The shape of its key follows the mark: a line, a dot, or a block. */
    type: string;
    shown: boolean;
    /** A click hides or shows what it names. */
    pressable: boolean;
}
