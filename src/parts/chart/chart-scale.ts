/** Turns a value of an axis into a position on the page, and back. */
export interface ChartScale {
    at(value: number): number;
    valueAt(position: number): number;
}

/** A straight scale: `min` lands on `from`, `max` on `to`. */
export function linearScale(min: number, max: number, from: number, to: number): ChartScale {
    const span = max - min || 1;
    const ratio = (to - from) / span;
    return {
        at: value => from + (value - min) * ratio,
        valueAt: position => min + (position - from) / ratio
    };
}

/** A scale of powers of ten. Zero and below have no place on it and land on `min`. */
export function logScale(min: number, max: number, from: number, to: number): ChartScale {
    const low = Math.log10(min);
    const straight = linearScale(low, Math.log10(max), from, to);
    return {
        at: value => straight.at(value > 0 ? Math.log10(value) : low),
        valueAt: position => 10 ** straight.valueAt(position)
    };
}

/** `count` equal bands between `from` and `to`: a value is a band's number, and lands on its middle. */
export function bandScale(count: number, from: number, to: number): ChartScale & { size: number } {
    const size = (to - from) / Math.max(1, count);
    return {
        size: Math.abs(size),
        at: index => from + (index + 0.5) * size,
        valueAt: position => Math.floor((position - from) / size)
    };
}
