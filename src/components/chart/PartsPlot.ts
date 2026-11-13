import type { Component, ComponentBase } from '@motifx/core';
import { arcPath, polar, roundRectPath } from '../../parts/chart/chart-paths';
import { formatNumber } from '../../parts/chart/chart-text';
import { svgComponent } from '../../parts/chart/svg-parts';
import { removePart } from '../../core/draw-parts';
import { css, put } from '../../core/part-writes';
import type { ModelPoint, ModelSeries, ModelSlot } from './chart-model';
import { pointText, positionText, shareText } from './plot-text';
import type { PlotInput, PlotView, Rect } from './plot-view';
import { TextParts } from './text-parts';

const TURN = Math.PI * 2;
/** The palest stage of a funnel: the stages darken towards the first one, in one hue, as they are in order. */
const FUNNEL_FADE = 45;

/**
 * One whole and its parts: the slices of a pie or a donut, or the stages of a funnel. Each part keeps the color of its
 * row when others are hidden. A share is written on a part only where it fits; the legend names them.
 */
export class PartsPlot implements PlotView {
    svg: SVGSVGElement;
    svgPart: Component<SVGSVGElement>;
    marksPart: Component<SVGGElement>;
    names: TextParts;
    labels: TextParts;
    center: TextParts;
    active: Component<SVGPathElement>;
    input: PlotInput | null = null;
    /** The size of the last drawing. */
    size = { width: 0, height: 0 };
    box: Rect = { left: 0, top: 0, width: 0, height: 0 };
    order: ModelSlot[] = [];
    /** Each part's angles, or its rectangle for a funnel. */
    angles = new Map<ModelPoint, [number, number]>();
    rects = new Map<ModelPoint, Rect>();
    /** The parts drawn, by their row's key, and those the drawing under way has taken. */
    slices = new Map<string, Component<SVGPathElement>>();
    used = new Map<string, Component<SVGPathElement>>();
    cx = 0;
    cy = 0;
    radius = 0;
    hole = 0;

    constructor(host: ComponentBase) {
        const svg = svgComponent(host, 'svg', 'mx-chart__svg');
        svg.attr.add({ 'aria-hidden': 'true', focusable: 'false' });
        this.svg = svg.element;
        this.svgPart = svg;
        this.marksPart = svgComponent(svg, 'g', 'mx-chart__marks');
        this.names = new TextParts(svgComponent(svg, 'g', 'mx-chart__ticks'));
        this.labels = new TextParts(svgComponent(svg, 'g', 'mx-chart__labels'));
        this.center = new TextParts(svgComponent(svg, 'g', 'mx-chart__center'));
        this.active = svgComponent(svg, 'path', 'mx-chart__active-slice');
    }

    get whole(): ModelSeries | undefined {
        return this.input?.model.series.find(s => s.shown);
    }

    xText(key: unknown): string {
        return positionText(this.input!, key);
    }

    valueText(point: ModelPoint): string {
        return pointText(this.input!, point);
    }

    markOfPoint(point: ModelPoint): string {
        const series = this.input!.model.series[point.series];
        if (series.type === 'funnel') {
            const count = Math.max(1, series.points.length - 1);
            const strength = Math.round(100 - (point.index / count) * (100 - FUNNEL_FADE));
            return `color-mix(in oklab, ${series.source.color ?? 'var(--_chart-series-1)'} ${strength}%, var(--_surface))`;
        }
        return `var(--_chart-series-${(point.index % 8) + 1})`;
    }

    draw(input: PlotInput): void {
        this.input = input;
        const { width, height } = input;
        this.size = { width, height };
        put(this.svgPart, 'viewBox', `0 0 ${width} ${height}`);
        put(this.svgPart, 'width', String(width));
        put(this.svgPart, 'height', String(height));
        this.box = { left: 0, top: 0, width, height };
        this.order = [...input.model.slots];
        this.angles.clear();
        this.rects.clear();
        this.used = new Map();
        const whole = this.whole;
        if (whole?.type === 'funnel') this.drawFunnel(whole);
        else if (whole) this.drawPie(whole);
        // A part whose row went is taken out; the others stay, written in place.
        for (const [key, mark] of this.slices) if (!this.used.has(key)) removePart(mark);
        this.slices = this.used;
        this.names.done();
        this.labels.done();
        this.center.done();
        this.showActive(null, null);
    }

    /** The part of a row, by its key: the one it had, else a new one. A key given twice has one part each time. */
    sliceOf(p: ModelPoint): Component<SVGPathElement> {
        const base = `${typeof p.key}:${String(p.key)}`;
        let key = base;
        for (let n = 1; this.used.has(key); n++) key = `${base}#${n}`;
        const slice = this.slices.get(key) ?? svgComponent(this.marksPart, 'path', 'mx-chart__slice');
        this.used.set(key, slice);
        return slice;
    }

    drawPie(series: ModelSeries): void {
        const { width, height, look, locale, model, texts } = this.input!;
        const measure = (text: string) => texts.width(text, look.font);
        this.cx = width / 2;
        this.cy = height / 2;
        this.radius = Math.max(1, Math.min(width, height) / 2 - look.sliceLift);
        const donut = series.type === 'donut';
        this.hole = donut ? this.radius * Math.min(0.9, Math.max(0, series.source.innerRadius ?? look.donutHole)) : 0;
        let at = ((series.source.startAngle ?? 0) * Math.PI) / 180;
        for (const p of series.points) {
            if (p.share === null) continue;
            const sweep = p.share * TURN;
            this.angles.set(p, [at, at + sweep]);
            const slice = this.sliceOf(p);
            css(slice, '--_mark', this.markOfPoint(p));
            put(slice, 'd', arcPath(this.cx, this.cy, this.hole, this.radius, at, at + sweep));
            if (series.source.labels !== 'none') {
                // A share inside its slice, where the slice has room for it.
                const text = shareText(locale, p.share);
                const middle = this.hole ? (this.hole + this.radius) / 2 : this.radius * 0.66;
                const room = sweep * middle;
                const thick = this.radius - this.hole;
                if (measure(text) + look.tickPad < room && look.line < thick) {
                    const [x, y] = polar(this.cx, this.cy, middle, at + sweep / 2);
                    this.labels.add(text, x, y + look.line * 0.34, 'middle');
                }
            }
            at += sweep;
        }
        if (donut && this.hole > look.line * 2) {
            const total = formatNumber(model.total, series.source.format ?? this.input!.yAxis.format, locale);
            this.center.add(total, this.cx, this.cy + look.line * 0.2, 'middle').class.add('mx-chart__center-value');
            this.center.add(series.name, this.cx, this.cy + look.line * 1.3, 'middle').class.add('mx-chart__center-label');
        }
    }

    drawFunnel(series: ModelSeries): void {
        const { width, height, look, locale, texts } = this.input!;
        const measure = (text: string) => texts.width(text, look.font);
        const shown = series.points.filter(p => p.share !== null);
        if (!shown.length) return;
        const names = shown.map(p => this.xText(p.key));
        const nameWide = Math.min(width * 0.35, Math.max(...names.map(measure)) + look.tickPad);
        const left = nameWide + look.tickPad;
        const room = Math.max(1, width - left);
        const gap = look.barGap;
        const step = (height - gap * (shown.length - 1)) / shown.length;
        const most = Math.max(...shown.map(p => p.y as number));
        const first = shown[0].y as number;
        shown.forEach((p, i) => {
            const size = Math.max(1, ((p.y as number) / most) * room);
            const rect = { left: left + (room - size) / 2, top: i * (step + gap), width: size, height: step };
            this.rects.set(p, rect);
            const stage = this.sliceOf(p);
            css(stage, '--_mark', this.markOfPoint(p));
            put(stage, 'd', roundRectPath(rect.left, rect.top, rect.width, rect.height, look.barRadius));
            const middle = rect.top + rect.height / 2 + look.line * 0.34;
            this.names.add(names[i], nameWide, middle, 'end');
            // The value, and what is left of the first stage: inside when it fits, else beside the stage.
            const text = `${this.valueText(p)} · ${shareText(locale, first ? (p.y as number) / first : 0)}`;
            const wide = measure(text);
            if (wide + look.tickPad * 2 < rect.width && look.line < rect.height) this.labels.add(text, rect.left + rect.width / 2, middle, 'middle');
            else if (rect.left + rect.width + look.tickPad + wide <= width) this.labels.add(text, rect.left + rect.width + look.tickPad, middle, 'start');
        });
    }

    find(x: number, y: number): { slot: ModelSlot; point: ModelPoint | null } | null {
        const slotOf = (p: ModelPoint) => this.order.find(slot => slot.points.includes(p));
        for (const [p, rect] of this.rects) {
            if (x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height) {
                const slot = slotOf(p);
                return slot ? { slot, point: p } : null;
            }
        }
        const distance = Math.hypot(x - this.cx, y - this.cy);
        if (!this.angles.size || distance > this.radius + (this.input?.look.sliceLift ?? 0) || distance < this.hole) return null;
        const start = this.angles.values().next().value![0];
        let angle = Math.atan2(x - this.cx, this.cy - y);
        while (angle < start) angle += TURN;
        while (angle >= start + TURN) angle -= TURN;
        for (const [p, [from, to]] of this.angles) {
            if (angle >= from && angle < to) {
                const slot = slotOf(p);
                return slot ? { slot, point: p } : null;
            }
        }
        return null;
    }

    /** The part under the pointer comes forward: a slice moves out of the circle, a stage gets a frame. */
    showActive(slot: ModelSlot | null, point: ModelPoint | null): void {
        const p = point ?? slot?.points[0] ?? null;
        if (!p || !this.input) {
            put(this.active, 'd', null);
            return;
        }
        css(this.active, '--_mark', this.markOfPoint(p));
        const rect = this.rects.get(p);
        if (rect) {
            put(this.active, 'd', roundRectPath(rect.left, rect.top, rect.width, rect.height, this.input.look.barRadius));
            return;
        }
        const angles = this.angles.get(p);
        put(this.active, 'd', angles ? arcPath(this.cx, this.cy, this.hole, this.radius + this.input.look.sliceLift, angles[0], angles[1]) : null);
    }
}
