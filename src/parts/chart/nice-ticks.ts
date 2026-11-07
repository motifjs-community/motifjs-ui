/** Places of a step, to round away what adding it leaves behind (0.30000000000000004). */
function placesOf(step: number): number {
    return Math.max(0, Math.ceil(-Math.log10(step)) + 1);
}

/** The round step (1, 2, 2.5 or 5 of a power of ten) nearest to splitting `span` into `count` parts. */
export function niceStep(span: number, count: number): number {
    if (span <= 0) return 1;
    const raw = span / Math.max(1, count);
    const power = 10 ** Math.floor(Math.log10(raw));
    const part = raw / power;
    return (part <= 1 ? 1 : part <= 2 ? 2 : part <= 2.5 ? 2.5 : part <= 5 ? 5 : 10) * power;
}

/** Round values from `min` to `max`, reaching past both unless `exact`. A single value gets room around it. */
export function niceTicks(min: number, max: number, count: number, exact = false): number[] {
    if (min === max) {
        const room = Math.abs(min) * 0.1 || 1;
        min -= room;
        max += room;
    }
    const step = niceStep(max - min, count);
    const places = placesOf(step);
    const first = (exact ? Math.ceil(min / step - 1e-9) : Math.floor(min / step + 1e-9)) * step;
    const last = (exact ? Math.floor(max / step + 1e-9) : Math.ceil(max / step - 1e-9)) * step;
    const ticks: number[] = [];
    const steps = Math.round((last - first) / step);
    for (let i = 0; i <= steps; i++) ticks.push(Number((first + i * step).toFixed(places)));
    return ticks;
}

/** Powers of ten from `min` to `max`, for a log axis. */
export function logTicks(min: number, max: number): number[] {
    const from = Math.floor(Math.log10(min) + 1e-9);
    const to = Math.ceil(Math.log10(max) - 1e-9);
    const ticks: number[] = [];
    for (let power = from; power <= to; power++) ticks.push(10 ** power);
    return ticks;
}
