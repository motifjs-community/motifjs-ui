import { circlesPath, polar } from '../../parts/chart/chart-paths';
import { formatNumber, textWidth } from '../../parts/chart/chart-text';
import { niceTicks } from '../../parts/chart/nice-ticks';
import { svgPart, svgPut, TextPool } from '../../parts/chart/svg-parts';
import type { ModelPoint, ModelSlot } from './chart-model';
import { markOf } from './ChartPlot';
import { pointText, positionText } from './plot-text';
import type { PlotInput, PlotView, Rect } from './plot-view';

const TURN = Math.PI * 2;

/** Values around a center: a spoke for each category, rings for the values, and a shape for each series. */
export class RadarPlot implements PlotView {
    svg: SVGSVGElement;
    grid: SVGPathElement;
    axis: SVGPathElement;
    marks: SVGGElement;
    ticks: TextPool;
    names: TextPool;
    cross: SVGPathElement;
    activeDots: SVGPathElement;
    input: PlotInput | null = null;
    box: Rect = { left: 0, top: 0, width: 0, height: 0 };
    order: ModelSlot[] = [];
    cx = 0;
    cy = 0;
    radius = 0;
    min = 0;
    max = 1;

    constructor(host: Element) {
        const svg = svgPart(host, 'svg', 'mx-chart__svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        this.svg = svg;
        this.grid = svgPart(svg, 'path', 'mx-chart__grid');
        this.axis = svgPart(svg, 'path', 'mx-chart__axis');
        this.marks = svgPart(svg, 'g', 'mx-chart__marks');
        this.ticks = new TextPool(svgPart(svg, 'g', 'mx-chart__ticks'));
        this.names = new TextPool(svgPart(svg, 'g', 'mx-chart__ticks'));
        this.cross = svgPart(svg, 'path', 'mx-chart__crosshair');
        this.activeDots = svgPart(svg, 'path', 'mx-chart__active-dot');
    }

    xText(key: unknown): string {
        return positionText(this.input!, key);
    }

    valueText(point: ModelPoint): string {
        return pointText(this.input!, point);
    }

    markOfPoint(point: ModelPoint): string {
        return markOf(this.input!.model.series[point.series]);
    }

    angleOf(index: number): number {
        return (index / Math.max(1, this.input!.model.categories.length)) * TURN;
    }

    at(index: number, value: number): [number, number] {
        const share = (value - this.min) / (this.max - this.min || 1);
        return polar(this.cx, this.cy, Math.max(0, share) * this.radius, this.angleOf(index)) as [number, number];
    }

    draw(input: PlotInput): void {
        this.input = input;
        const { width, height, look, model, yAxis, locale } = input;
        svgPut(this.svg, 'viewBox', `0 0 ${width} ${height}`);
        svgPut(this.svg, 'width', width);
        svgPut(this.svg, 'height', height);
        this.box = { left: 0, top: 0, width, height };
        const measure = (text: string) => textWidth(text, look.font, this.svg.ownerDocument);
        const names = model.categories.map(key => this.xText(key));
        const wide = Math.max(0, ...names.map(measure));
        this.cx = width / 2;
        this.cy = height / 2;
        this.radius = Math.max(1, Math.min(width / 2 - wide - look.tickPad * 2, height / 2 - look.line - look.tickPad));
        const low = model.any ? Math.min(0, model.yMin) : 0;
        const high = model.any ? model.yMax : 1;
        const values = niceTicks(yAxis.min instanceof Date ? low : (yAxis.min ?? low), yAxis.max instanceof Date ? high : (yAxis.max ?? high), yAxis.tickCount ?? 4);
        this.min = values[0];
        this.max = values[values.length - 1];
        const count = model.categories.length;

        // Rings at the round values, and a spoke for each category.
        let grid = '';
        for (const value of values.slice(1)) {
            for (let i = 0; i < count; i++) {
                const [x, y] = this.at(i, value);
                grid += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            if (count) grid += 'Z';
        }
        svgPut(this.grid, 'd', grid);
        let spokes = '';
        for (let i = 0; i < count; i++) {
            const [x, y] = this.at(i, this.max);
            spokes += `M${this.cx.toFixed(1)} ${this.cy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        svgPut(this.axis, 'd', spokes);
        // The outer ring's value would sit on the name of the first spoke: the rings below it say enough.
        if (yAxis.labels !== false) for (const value of values.slice(1, -1)) this.ticks.add(formatNumber(value, yAxis.format, locale), this.cx + look.tickPad / 2, this.at(0, value)[1] - look.tickPad / 2, 'start');
        this.ticks.done();
        names.forEach((name, i) => {
            const [x, y] = polar(this.cx, this.cy, this.radius + look.tickPad, this.angleOf(i));
            const side = Math.sin(this.angleOf(i));
            const anchor = Math.abs(side) < 0.2 ? 'middle' : side > 0 ? 'start' : 'end';
            const below = Math.cos(this.angleOf(i)) < -0.2;
            this.names.add(name, x, y + (below ? look.line * 0.8 : Math.abs(side) < 0.2 ? -look.tickPad / 2 : look.line * 0.34), anchor);
        });
        this.names.done();

        this.marks.replaceChildren();
        for (const s of model.series) {
            if (!s.shown) continue;
            const group = svgPart(this.marks, 'g', 'mx-chart__series');
            group.setAttribute('data-type', 'radar');
            group.style.setProperty('--_mark', markOf(s));
            let shape = '';
            const dots: { x: number; y: number; r: number }[] = [];
            s.points.forEach((p, i) => {
                const [x, y] = this.at(p.x, p.y ?? this.min);
                p.px = x;
                p.py = y;
                shape += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
                if (s.source.markers) dots.push({ x, y, r: look.markerSize / 2 });
            });
            if (shape) shape += 'Z';
            svgPut(svgPart(group, 'path', 'mx-chart__area'), 'd', shape);
            svgPut(svgPart(group, 'path', 'mx-chart__line'), 'd', shape);
            svgPut(svgPart(group, 'path', 'mx-chart__dots'), 'd', circlesPath(dots));
        }
        for (const slot of model.slots) slot.at = slot.x;
        this.order = [...model.slots].sort((a, b) => a.x - b.x);
        this.showActive(null, null, false);
    }

    find(x: number, y: number): { slot: ModelSlot; point: ModelPoint | null } | null {
        const count = this.input?.model.categories.length ?? 0;
        if (!count || Math.hypot(x - this.cx, y - this.cy) > this.radius + (this.input?.look.hitSize ?? 0)) return null;
        let angle = Math.atan2(x - this.cx, this.cy - y);
        if (angle < 0) angle += TURN;
        const index = Math.round(angle / (TURN / count)) % count;
        const slot = this.order.find(s => s.x === index);
        if (!slot) return null;
        let point: ModelPoint | null = null;
        let best = Infinity;
        for (const p of slot.points) {
            const distance = Math.hypot(p.px - x, p.py - y);
            if (distance < best) {
                best = distance;
                point = p;
            }
        }
        return { slot, point };
    }

    showActive(slot: ModelSlot | null, point: ModelPoint | null, crosshair: boolean): void {
        if (!slot || !this.input) {
            svgPut(this.cross, 'd', null);
            svgPut(this.activeDots, 'd', null);
            return;
        }
        const [x, y] = this.at(slot.x, this.max);
        svgPut(this.cross, 'd', crosshair ? `M${this.cx.toFixed(1)} ${this.cy.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}` : null);
        const p = point ?? slot.points[0];
        this.activeDots.style.setProperty('--_mark', this.markOfPoint(p));
        svgPut(this.activeDots, 'd', circlesPath([{ x: p.px, y: p.py, r: this.input.look.markerSize / 2 + 1 }]));
    }
}
