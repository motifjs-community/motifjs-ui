/** A place in an SVG. */
export type Place = readonly [number, number];

const n = (value: number) => Math.round(value * 10) / 10;

/** A line through the places. */
export function linePath(places: readonly Place[]): string {
    return places.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])} ${n(p[1])}`).join('');
}

/** Corners instead of a slope: the value holds until the next one, changes halfway to it, or changes on arriving. */
export function stepPath(places: readonly Place[], mode: 'start' | 'middle' | 'end', sideways = false): string {
    const out: Place[] = [];
    const flat = (along: number, across: number): Place => (sideways ? [across, along] : [along, across]);
    places.forEach((p, i) => {
        const [along, across] = sideways ? [p[1], p[0]] : p;
        if (i) {
            const before = places[i - 1];
            const [lastAlong, lastAcross] = sideways ? [before[1], before[0]] : before;
            if (mode === 'start') out.push(flat(along, lastAcross));
            else if (mode === 'end') out.push(flat(lastAlong, across));
            else {
                const middle = (along + lastAlong) / 2;
                out.push(flat(middle, lastAcross), flat(middle, across));
            }
        }
        out.push(p);
    });
    return linePath(out);
}

/**
 * A smooth line that never overshoots the values it joins (monotone cubic): a curve must not show a peak the data
 * does not have. `sideways` runs it down the page, for a horizontal chart.
 */
export function smoothPath(places: readonly Place[], sideways = false): string {
    if (places.length < 3) return linePath(places);
    const pts = sideways ? places.map(p => [p[1], p[0]] as const) : places;
    const count = pts.length;
    const slopes: number[] = [];
    for (let i = 0; i < count - 1; i++) {
        const run = pts[i + 1][0] - pts[i][0];
        slopes.push(run ? (pts[i + 1][1] - pts[i][1]) / run : 0);
    }
    const tangents = [slopes[0]];
    for (let i = 1; i < count - 1; i++) tangents.push(slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2);
    tangents.push(slopes[count - 2]);
    for (let i = 0; i < count - 1; i++) {
        if (slopes[i] === 0) {
            tangents[i] = 0;
            tangents[i + 1] = 0;
            continue;
        }
        const a = tangents[i] / slopes[i];
        const b = tangents[i + 1] / slopes[i];
        const size = a * a + b * b;
        if (size > 9) {
            const scale = 3 / Math.sqrt(size);
            tangents[i] = scale * a * slopes[i];
            tangents[i + 1] = scale * b * slopes[i];
        }
    }
    const put = (a: number, b: number) => (sideways ? `${n(b)} ${n(a)}` : `${n(a)} ${n(b)}`);
    let d = `M${put(pts[0][0], pts[0][1])}`;
    for (let i = 0; i < count - 1; i++) {
        const third = (pts[i + 1][0] - pts[i][0]) / 3;
        d += `C${put(pts[i][0] + third, pts[i][1] + tangents[i] * third)} ${put(pts[i + 1][0] - third, pts[i + 1][1] - tangents[i + 1] * third)} ${put(pts[i + 1][0], pts[i + 1][1])}`;
    }
    return d;
}

/** An area between an upper path and the lower one, given as the path that walks back along it. */
export function areaPath(upper: string, lowerBack: string): string {
    return upper && lowerBack ? `${upper}L${lowerBack.slice(1)}Z` : '';
}

/**
 * A bar: its end rounded on the `end` side, square where it stands on the baseline. The corner never takes more than
 * half its width or its whole height, so a short bar keeps its shape.
 */
export function barPath(left: number, top: number, width: number, height: number, radius: number, end: 'top' | 'bottom' | 'left' | 'right' | null): string {
    const x = n(left);
    const y = n(top);
    const w = n(width);
    const h = n(height);
    if (w <= 0 || h <= 0) return '';
    const upright = end === 'top' || end === 'bottom';
    const r = end ? n(Math.min(radius, (upright ? w : h) / 2, upright ? h : w)) : 0;
    if (!r) return `M${x} ${y}h${w}v${h}h${-w}z`;
    const arc = (dx: number, dy: number) => `a${r} ${r} 0 0 1 ${dx} ${dy}`;
    if (end === 'top') return `M${x} ${n(y + h)}v${n(r - h)}${arc(r, -r)}h${n(w - 2 * r)}${arc(r, r)}v${n(h - r)}z`;
    if (end === 'bottom') return `M${n(x + w)} ${y}v${n(h - r)}${arc(-r, r)}h${n(2 * r - w)}${arc(-r, -r)}v${n(r - h)}z`;
    if (end === 'right') return `M${x} ${y}h${n(w - r)}${arc(r, r)}v${n(h - 2 * r)}${arc(-r, r)}h${n(r - w)}z`;
    return `M${n(x + w)} ${n(y + h)}h${n(r - w)}${arc(-r, -r)}v${n(2 * r - h)}${arc(r, -r)}h${n(w - r)}z`;
}

/** Circles as one path: thousands stay one element. */
export function circlesPath(circles: readonly { x: number; y: number; r: number }[]): string {
    return circles
        .map(({ x, y, r }) => {
            const size = n(r);
            return `M${n(x - r)} ${n(y)}a${size} ${size} 0 1 0 ${n(2 * r)} 0a${size} ${size} 0 1 0 ${n(-2 * r)} 0`;
        })
        .join('');
}
