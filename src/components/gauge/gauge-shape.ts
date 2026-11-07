import { arcPath, roundRectPath, type Place } from "../../parts/chart/chart-paths";

/** Where a share of the scale sits on the track: the middle of the track, the way out from it and the way along it. */
export interface GaugeSpot {
    c: Place;
    n: Place;
    t: Place;
}

/**
 * The geometry of a gauge's track, an arc or a straight bar, so every part is drawn the same way on both: a part is
 * placed by its share of the scale and its distance from the middle line of the track, outward toward the ranges.
 */
export class GaugeShape {
    kind: 'arc' | 'horizontal' | 'vertical' = 'arc';
    cx = 0;
    cy = 0;
    mid = 0;
    start = 0;
    sweep = 0;
    /** A straight track runs from `from` to `to` along it, with its middle line at `across`. */
    from = 0;
    to = 0;
    across = 0;

    spot(share: number): GaugeSpot {
        if (this.kind === 'arc') {
            const a = this.start + share * this.sweep;
            const s = Math.sin(a);
            const c = Math.cos(a);
            return { c: [this.cx + this.mid * s, this.cy - this.mid * c], n: [s, -c], t: [c, s] };
        }
        const along = this.from + share * (this.to - this.from);
        if (this.kind === 'horizontal') return { c: [along, this.across], n: [0, -1], t: [1, 0] };
        return { c: [this.across, along], n: [1, 0], t: [0, -1] };
    }

    /** A point `out` from the middle line and `side` along the track. */
    point(spot: GaugeSpot, out: number, side = 0): Place {
        return [spot.c[0] + spot.n[0] * out + spot.t[0] * side, spot.c[1] + spot.n[1] * out + spot.t[1] * side];
    }

    /** A band between two shares, from `inner` to `outer` away from the middle line. */
    strip(a: number, b: number, inner: number, outer: number, round = false): string {
        const low = Math.min(a, b);
        const high = Math.max(a, b);
        if (this.kind === 'arc') {
            return arcPath(this.cx, this.cy, Math.max(0, this.mid + inner), this.mid + outer, this.start + low * this.sweep, this.start + high * this.sweep);
        }
        const p = this.from + low * (this.to - this.from);
        const q = this.from + high * (this.to - this.from);
        const radius = round ? (outer - inner) / 2 : 0;
        if (this.kind === 'horizontal') return roundRectPath(Math.min(p, q), this.across - outer, Math.abs(q - p), outer - inner, radius);
        return roundRectPath(this.across + inner, Math.min(p, q), outer - inner, Math.abs(q - p), radius);
    }

    polygon(points: readonly Place[]): string {
        return points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z';
    }

    /** A triangle whose tip is `tip` from the middle line, pointing at the track. */
    triangle(share: number, tip: number, size: number): string {
        const spot = this.spot(share);
        return this.polygon([this.point(spot, tip), this.point(spot, tip + size, size * 0.6), this.point(spot, tip + size, -size * 0.6)]);
    }

    /** A circle on the middle line. */
    dot(share: number, radius: number): string {
        const [x, y] = this.spot(share).c;
        const r = radius.toFixed(1);
        return `M${(x - radius).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${(radius * 2).toFixed(1)} 0a${r} ${r} 0 1 0 ${(-radius * 2).toFixed(1)} 0Z`;
    }

    rhombus(share: number, radius: number): string {
        const spot = this.spot(share);
        return this.polygon([this.point(spot, radius), this.point(spot, 0, radius), this.point(spot, -radius), this.point(spot, 0, -radius)]);
    }

    /** A line across the track, `reach` out on both sides of the middle line. */
    line(share: number, reach: number, width: number): string {
        const spot = this.spot(share);
        const w = width / 2;
        return this.polygon([this.point(spot, reach, w), this.point(spot, reach, -w), this.point(spot, -reach, -w), this.point(spot, -reach, w)]);
    }

    /** A needle from the middle of an arc to `length`, `width` wide at its base and `tip` wide at its end. */
    needle(share: number, from: number, length: number, width: number, tip: number): string {
        const spot = this.spot(share);
        const at = (r: number, side: number): Place => [this.cx + spot.n[0] * r + spot.t[0] * side, this.cy + spot.n[1] * r + spot.t[1] * side];
        return this.polygon([at(from, width / 2), at(length, tip / 2), at(length, -tip / 2), at(from, -width / 2)]);
    }

    /** A box `width` by `height` with a pointer, `from` out of the middle line, or in from it; and where its text goes. */
    callout(share: number, from: number, width: number, height: number, pointer: number, radius: number, inward = false): { d: string; text: Place } {
        const spot = this.spot(share);
        if (inward) spot.n = [-spot.n[0], -spot.n[1]];
        const reach = Math.abs(spot.n[0]) * width + Math.abs(spot.n[1]) * height;
        const [x, y] = this.point(spot, from + pointer + reach / 2);
        const box = roundRectPath(x - width / 2, y - height / 2, width, height, radius);
        const arrow = this.polygon([this.point(spot, from), this.point(spot, from + pointer + 1, pointer * 0.8), this.point(spot, from + pointer + 1, -pointer * 0.8)]);
        return { d: box + arrow, text: [x, y] };
    }
}
