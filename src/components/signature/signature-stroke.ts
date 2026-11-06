/** One point of a stroke. `x` and `y` run from `0` to `1` across the pad, so a signature fits a pad of any size. */
export interface SignaturePoint {
    x: number;
    y: number;
    /** How hard the pen pressed, from `0` to `1`. Without a pressure-sensitive pen, this follows the speed. */
    pressure: number;
}

/** One line drawn without lifting the pen. */
export interface SignatureStroke {
    points: readonly SignaturePoint[];
}
