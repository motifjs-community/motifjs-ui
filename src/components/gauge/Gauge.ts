import type { Bind, Component, IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { functionValue } from "../../core/function-value";
import { part, removePart } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { boxOf, lengthOf, measure, onLayout, probeLengths, rectOf, styleOf, textWidths } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { css, mark, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import type { Place } from "../../parts/chart/chart-paths";
import { DrawnTexts, formatNumber, type ChartFormat } from "../../parts/chart/chart-text";
import { niceTicks } from "../../parts/chart/nice-ticks";
import { svgComponent, TextPool } from "../../parts/chart/svg-parts";
import { ValueMotion } from "../../parts/chart/value-motion";
import type { GaugeMark } from "./gauge-mark";
import type { GaugeMarker } from "./gauge-marker";
import type { GaugeNeedleShape } from "./gauge-needle-shape";
import type { GaugeOrientation } from "./gauge-orientation";
import type { GaugeProps } from "./gauge-props";
import type { GaugeRange } from "./gauge-range";
import type { GaugeScale } from "./gauge-scale";
import { GaugeShape } from "./gauge-shape";
import type { GaugeType } from "./gauge-type";

const OWN = [
    'value', 'min', 'max', 'type', 'orientation', 'angle', 'rotation', 'ranges', 'scale', 'ticks', 'tickInterval', 'minorTicks', 'fill',
    'baseValue', 'marker', 'needleShape', 'marks', 'markShape', 'label', 'format', 'showValue', 'tooltip', 'size'
] as const;
const FUNCTIONS: readonly string[] = ['format'];
const DEGREE = Math.PI / 180;
const SERIES = 8;
/** Sizes for where nothing is laid out, as in a test without a browser. */
const UNMEASURED = { size: 160, length: 200, thickness: 12, band: 4, tick: 6, marker: 12, spacing: 4, width: 240 };
const LENGTHS = ['--_gauge-size', '--_gauge-length', '--_gauge-thickness', '--_gauge-range-width', '--_gauge-tick-length', '--_gauge-marker-size', '--_gauge-spacing'];
const FONT = ['font', 'font-size', 'font-family', 'line-height'] as const;

interface Look {
    size: number;
    length: number;
    thickness: number;
    band: number;
    tick: number;
    marker: number;
    spacing: number;
}

/** What one draw worked out, kept for the moving value and the pointer. */
interface Drawn {
    min: number;
    max: number;
    look: Look;
    straight: boolean;
    bandOut: number;
    markFrom: number;
    lineHeight: number;
    widthOf: (text: string) => number;
    box: { x: number; y: number; width: number; height: number };
}

/** What a draw reads of the page before it writes. */
interface Measured {
    look: Look;
    font: Record<(typeof FONT)[number], string>;
    width: number;
    valueHeight: number;
}

/** The parts of a mark of the scale: its shape, and the text of a callout. */
interface MarkParts {
    group: Component<SVGGElement>;
    path: Component<SVGPathElement>;
    label: Component<SVGTextElement>;
}

/**
 * A value against its scale: an arc, a circle or a straight bar, across or upright. The scale shows its ends or ticks
 * with their values; ranges give stretches of it a meaning, and the fill takes the tone of the range its value is in. The
 * value shows as a fill from a base value, as a needle, a triangle, a circle, a rhombus, a line or a callout, and marks
 * show other values on the scale, such as targets. It is a meter for assistive technology, with the value, its range
 * and the marks read out; a change of value moves over the design language's motion.
 *
 * @example
 * <Gauge value={() => this.cpu} label="CPU" format={{ style: 'unit', unit: 'percent' }}
 *        ranges={[{ from: 0, to: 70, tone: 'good' }, { from: 70, to: 90, tone: 'warning' }, { from: 90, to: 100, tone: 'danger' }]} />
 */
export class Gauge extends Control<HTMLDivElement, GaugeProps> {
    svg: Component<SVGSVGElement>;
    track: Component<SVGPathElement>;
    bands: Component<SVGGElement>;
    bandPaths: Component<SVGPathElement>[] = [];
    fillPath: Component<SVGPathElement>;
    minorPath: Component<SVGPathElement>;
    tickPath: Component<SVGPathElement>;
    tickLabels: Component<SVGGElement>;
    /** The texts of the scale, measured in its font and numbers. */
    texts: DrawnTexts;
    labelPool: TextPool;
    markGroup: Component<SVGGElement>;
    markParts: MarkParts[] = [];
    markerPath: Component<SVGPathElement>;
    calloutGroup: Component<SVGGElement>;
    calloutPath: Component<SVGPathElement>;
    calloutText: Component<SVGTextElement>;
    needlePath: Component<SVGPathElement>;
    needleTip: Component<SVGPathElement>;
    valueText: Component<HTMLDivElement>;
    labelText: Component<HTMLDivElement>;
    tip: Component<HTMLSpanElement>;
    shape = new GaugeShape();
    motion: ValueMotion;
    drawn: Drawn | null = null;
    placed = false;
    stopRoom: (() => void) | null = null;

    readDraw = (): Measured => ({
        look: this.lengths(),
        font: styleOf(this.tickLabels, FONT),
        width: boxOf(this).clientWidth,
        valueHeight: rectOf(this.valueText).height
    });
    drawMeasured = (measured: Measured) => this.draw(measured);

    constructor(props?: IBaseProp<GaugeProps>) {
        super('div', props);
        const own = (this.props ?? {}) as GaugeProps;
        this.class.add('mx-gauge');
        this.attr.add({ role: 'meter' });
        const svg = svgComponent(this, 'svg', 'mx-gauge__svg');
        svg.attr.add({ 'aria-hidden': 'true', focusable: 'false' });
        this.svg = svg;
        this.track = svgComponent(svg, 'path', 'mx-gauge__track');
        this.bands = svgComponent(svg, 'g', 'mx-gauge__bands');
        this.fillPath = svgComponent(svg, 'path', 'mx-gauge__fill');
        this.minorPath = svgComponent(svg, 'path', 'mx-gauge__minor');
        this.tickPath = svgComponent(svg, 'path', 'mx-gauge__ticks');
        this.tickLabels = svgComponent(svg, 'g', 'mx-gauge__scale');
        this.labelPool = new TextPool(this.tickLabels);
        // Texts are measured in the font and numbers of the scale; one that comes out another size draws again.
        this.texts = new DrawnTexts(this, () => this.again(), 'mx-gauge__probe');
        this.markGroup = svgComponent(svg, 'g', 'mx-gauge__marks');
        this.markerPath = svgComponent(svg, 'path', 'mx-gauge__marker');
        this.calloutGroup = svgComponent(svg, 'g', 'mx-gauge__callout');
        this.calloutPath = svgComponent(this.calloutGroup, 'path');
        this.calloutText = svgComponent(this.calloutGroup, 'text');
        this.calloutText.attr.add({ 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        this.needlePath = svgComponent(svg, 'path', 'mx-gauge__needle');
        this.needleTip = svgComponent(svg, 'path', 'mx-gauge__needle-tip');
        const hidden = <E extends HTMLElement>(tag: string, className: string) => {
            const made = part<E>(this, tag, className);
            made.attr.add({ 'aria-hidden': 'true' });
            return made;
        };
        this.valueText = hidden<HTMLDivElement>('div', 'mx-gauge__value');
        this.labelText = hidden<HTMLDivElement>('div', 'mx-gauge__label');
        this.tip = hidden<HTMLSpanElement>('span', 'mx-gauge__tip');
        shown(this.tip, false);
        this.motion = new ValueMotion(this, values => this.drawValue(values[0] ?? null));
        probeLengths(this, LENGTHS);

        // A function that takes a value is the value itself, not a live one.
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, FUNCTIONS.includes(name) ? functionValue(own[name]) : own[name]);
        for (const name of OWN) {
            if (name === 'value') this.observeProperty(name, () => this.moveTo());
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.again());
        onLayout(this, 'size', () => this.again());
        onLayout(this, 'look', () => this.again());
        this.motif.on('pointermove', (_, e) => this.pointAt(e));
        this.motif.on('pointerleave', () => shown(this.tip, false));
        this.motion.set([null]);
        this.motif.setDisposable(() => {
            this.motion.stop();
            this.stopRoom?.();
        });
    }

    // In the page now: it has a size to draw at.
    override onMounted(): void {
        if (this.placed) return;
        this.placed = true;
        this.motion.set([this.value]);
        this.again();
    }

    // Properties (see GaugeProps).

    get value(): number | null {
        return this.numberOf('value');
    }
    set value(value: Bind<number | null>) {
        this.assignProperty('value', value);
    }
    get min(): number {
        return this.getProperty<number | undefined>('min') ?? 0;
    }
    set min(value: Bind<number>) {
        this.assignProperty('min', value);
    }
    get max(): number {
        return this.getProperty<number | undefined>('max') ?? 100;
    }
    set max(value: Bind<number>) {
        this.assignProperty('max', value);
    }
    get type(): GaugeType {
        return this.getProperty<GaugeType | undefined>('type') ?? 'arc';
    }
    set type(value: Bind<GaugeType>) {
        this.assignProperty('type', value);
    }
    get orientation(): GaugeOrientation {
        return this.getProperty<GaugeOrientation | undefined>('orientation') ?? 'horizontal';
    }
    set orientation(value: Bind<GaugeOrientation>) {
        this.assignProperty('orientation', value);
    }
    get angle(): number {
        return Math.min(360, Math.max(30, this.getProperty<number | undefined>('angle') ?? 240));
    }
    set angle(value: Bind<number>) {
        this.assignProperty('angle', value);
    }
    get rotation(): number {
        return this.getProperty<number | undefined>('rotation') ?? 0;
    }
    set rotation(value: Bind<number>) {
        this.assignProperty('rotation', value);
    }
    get ranges(): readonly GaugeRange[] {
        return this.getProperty<readonly GaugeRange[] | undefined>('ranges') ?? [];
    }
    set ranges(value: Bind<readonly GaugeRange[]>) {
        this.assignProperty('ranges', value);
    }
    get scale(): GaugeScale {
        return this.getProperty<GaugeScale | undefined>('scale') ?? 'ends';
    }
    set scale(value: Bind<GaugeScale>) {
        this.assignProperty('scale', value);
    }
    get ticks(): readonly number[] | null {
        return this.getProperty<readonly number[] | null | undefined>('ticks') ?? null;
    }
    set ticks(value: Bind<readonly number[] | null>) {
        this.assignProperty('ticks', value);
    }
    get tickInterval(): number | null {
        return this.numberOf('tickInterval');
    }
    set tickInterval(value: Bind<number | null>) {
        this.assignProperty('tickInterval', value);
    }
    get minorTicks(): number {
        return Math.max(0, Math.floor(this.getProperty<number | undefined>('minorTicks') ?? 0));
    }
    set minorTicks(value: Bind<number>) {
        this.assignProperty('minorTicks', value);
    }
    get fill(): boolean {
        return this.getProperty<boolean | undefined>('fill') ?? true;
    }
    set fill(value: Bind<boolean>) {
        this.assignProperty('fill', value);
    }
    get baseValue(): number | null {
        return this.numberOf('baseValue');
    }
    set baseValue(value: Bind<number | null>) {
        this.assignProperty('baseValue', value);
    }
    get marker(): GaugeMarker | null {
        return this.getProperty<GaugeMarker | null | undefined>('marker') ?? null;
    }
    set marker(value: Bind<GaugeMarker | null>) {
        this.assignProperty('marker', value);
    }
    get needleShape(): GaugeNeedleShape {
        return this.getProperty<GaugeNeedleShape | undefined>('needleShape') ?? 'tapered';
    }
    set needleShape(value: Bind<GaugeNeedleShape>) {
        this.assignProperty('needleShape', value);
    }
    get marks(): readonly GaugeMark[] {
        return this.getProperty<readonly GaugeMark[] | undefined>('marks') ?? [];
    }
    set marks(value: Bind<readonly GaugeMark[]>) {
        this.assignProperty('marks', value);
    }
    get markShape(): GaugeMarker {
        return this.getProperty<GaugeMarker | undefined>('markShape') ?? 'triangle';
    }
    set markShape(value: Bind<GaugeMarker>) {
        this.assignProperty('markShape', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get format(): ChartFormat | null {
        return this.getProperty<ChartFormat | null | undefined>('format') ?? null;
    }
    set format(value: Bind<ChartFormat | null>) {
        this.assignProperty('format', functionValue(value));
    }
    get showValue(): boolean {
        return this.getProperty<boolean | undefined>('showValue') ?? true;
    }
    set showValue(value: Bind<boolean>) {
        this.assignProperty('showValue', value);
    }
    get tooltip(): boolean {
        return this.getProperty<boolean | undefined>('tooltip') ?? true;
    }
    set tooltip(value: Bind<boolean>) {
        this.assignProperty('tooltip', value);
    }
    get size(): number | null {
        return this.numberOf('size');
    }
    set size(value: Bind<number | null>) {
        this.assignProperty('size', value);
    }

    numberOf(name: string): number | null {
        const value = this.getProperty<number | null | undefined>(name);
        return value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
    }

    /** The range a value is in, or none. */
    rangeOf(value: number | null): GaugeRange | null {
        if (value === null) return null;
        return givenList(this.ranges).find(r => value >= Math.min(r.from, r.to) && value <= Math.max(r.from, r.to)) ?? null;
    }

    /** The color of a range: its own, its tone's, or the next chart color for a range with neither. */
    toneOf(range: GaugeRange | null): string {
        if (!range) return 'var(--_gauge-fill)';
        if (range.color) return range.color;
        if (range.tone === 'neutral') return 'var(--_gauge-fill)';
        if (range.tone) return `var(--_gauge-${range.tone})`;
        const plain = givenList(this.ranges).filter(r => !r.color && !r.tone);
        return `var(--_gauge-series-${(plain.indexOf(range) % SERIES) + 1})`;
    }

    number(value: number): string {
        return formatNumber(value, this.format ?? undefined, uiLocale.locale);
    }

    /**
     * Writes what the drawing is measured with now, and draws with the next reads of the window. A straight gauge first
     * measures the room its value keeps.
     */
    again(): void {
        if (!this.placed || this.isDisposed) return;
        this.drawText();
        this.stopRoom?.();
        this.stopRoom = null;
        if (this.type !== 'linear') {
            css(this, '--_value-room', '');
            measure(this, this.readDraw, this.drawMeasured);
            return;
        }
        // A straight gauge lays its value out beside or under the bar: it keeps the room of the widest value of the
        // scale, so the gauge keeps its size while the value changes.
        this.stopRoom = textWidths(this, this.roomValues(), widths => {
            css(this, '--_value-room', `${Math.ceil(Math.max(0, ...widths))}px`);
            measure(this, this.readDraw, this.drawMeasured);
        }, 'mx-gauge__value-probe');
    }

    moveTo(): void {
        if (!this.placed) return;
        this.motion.move([this.value]);
        this.again();
    }

    lengths(): Look {
        return {
            size: this.size ?? lengthOf(this, '--_gauge-size', UNMEASURED.size),
            length: this.size ?? lengthOf(this, '--_gauge-length', UNMEASURED.length),
            thickness: lengthOf(this, '--_gauge-thickness', UNMEASURED.thickness),
            band: lengthOf(this, '--_gauge-range-width', UNMEASURED.band),
            tick: lengthOf(this, '--_gauge-tick-length', UNMEASURED.tick),
            marker: lengthOf(this, '--_gauge-marker-size', UNMEASURED.marker),
            spacing: lengthOf(this, '--_gauge-spacing', UNMEASURED.spacing)
        };
    }

    /** The values of the ticks, and of the small ones between them. */
    tickValues(min: number, max: number, length: number): { majors: number[]; minors: number[] } {
        const scale = this.scale;
        const low = Math.min(min, max);
        const high = Math.max(min, max);
        if (scale === 'none') return { majors: [], minors: [] };
        // A whole circle's two ends are the same place.
        if (scale === 'ends') return { majors: this.type === 'circle' ? [] : [min, max], minors: [] };
        let majors: number[];
        const given = this.ticks;
        const interval = this.tickInterval;
        if (given) majors = givenList(given).filter(v => v >= low && v <= high);
        else if (interval && interval > 0 && (high - low) / interval <= 200) {
            majors = [];
            for (let i = 0, v = low; v <= high + interval * 1e-9; v = low + ++i * interval) majors.push(Number(v.toFixed(10)));
        } else majors = niceTicks(low, high, Math.max(2, Math.round(length / 48)), true);
        majors.sort((a, b) => a - b);
        const minors: number[] = [];
        const count = this.minorTicks;
        for (let i = 0; count && i < majors.length - 1; i++) {
            const step = (majors[i + 1] - majors[i]) / (count + 1);
            for (let j = 1; j <= count; j++) minors.push(majors[i] + step * j);
        }
        return { majors, minors };
    }

    /** The type, the name, the value and the label: what the drawing is laid out and measured with. */
    drawText(): void {
        const type = this.type;
        const straight = type === 'linear';
        const marker = this.markerKind();
        const value = this.value;
        put(this, 'data-type', type);
        put(this, 'data-orientation', straight ? this.orientation : null);
        mark(this, 'data-needle', marker === 'needle');
        this.drawName(value);
        text(this.valueText, value === null ? '' : this.number(value));
        text(this.labelText, this.label);
        shown(this.valueText, this.showValue && value !== null && marker !== 'text');
        shown(this.labelText, !!this.label);
    }

    draw(measured: Measured): void {
        const type = this.type;
        const straight = type === 'linear';
        const vertical = straight && this.orientation === 'vertical';
        const marker = this.markerKind();
        const min = this.min;
        const max = this.max === min ? min + 1 : this.max;
        const value = this.value;

        const look = measured.look;
        const style = measured.font;
        const font = style.font || `${style['font-size'] || '12px'} ${style['font-family'] || 'sans-serif'}`;
        const fontSize = parseFloat(style['font-size']) || 12;
        const texts = this.texts;
        const lineHeight = Math.max(parseFloat(style['line-height']) || 0, texts.height('0', fontSize * 1.35));
        const widthOf = (t: string) => texts.width(t, font);
        // The value on its way to a new one is drawn with the widths known: it asks for none.
        const movingWidth = (t: string) => texts.peek(t, font);
        const share = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
        const ranges = givenList(this.ranges);
        const marks = givenList(this.marks);
        const scale = this.scale;
        const half = look.thickness / 2;
        const gap = look.spacing;

        // Out from the middle line of the track: the ranges, then the marks and a pointing marker.
        const bandIn = half + (ranges.length ? Math.max(2, look.band / 2) : 0);
        const bandOut = ranges.length ? bandIn + look.band : half;
        const dot = Math.max(half + 2, look.marker / 2);
        const callout = (t: string) => ({ width: widthOf(t) + gap * 2, height: lineHeight + gap });
        const shapes = [...marks.map(m => this.shapeOf(m)), marker];
        const calloutTexts = [...marks.filter(m => this.shapeOf(m) === 'text').map(m => this.number(m.value)), ...(marker === 'text' && value !== null ? [this.number(value)] : [])];
        const widest = Math.max(0, ...calloutTexts.map(t => callout(t).width));
        const calloutReach = (n: Place) => look.marker / 2 + Math.abs(n[0]) * widest + Math.abs(n[1]) * (lineHeight + gap);
        const markRoom = (n: Place) => Math.max(shapes.includes('triangle') ? look.marker : 0, calloutTexts.length ? calloutReach(n) : 0);
        const dotted = shapes.some(s => s === 'circle' || s === 'rhombus');
        const lined = shapes.includes('line');
        const near = Math.max(half, dotted ? dot : 0, lined ? half + 2 : 0);

        const { majors, minors } = this.tickValues(min, max, straight ? (vertical ? look.length : measured.width || UNMEASURED.width) : look.size * 1.6);
        const labels = majors.map(v => ({ v, text: this.number(v), width: widthOf(this.number(v)), height: lineHeight }));
        if (type === 'circle' && labels.length > 1 && share(labels.at(-1)!.v) - share(labels[0].v) >= 1) labels.pop();
        const ticked = scale === 'ticks';
        const reach = (n: Place, l: { width: number; height: number }) => Math.abs(n[0]) * l.width + Math.abs(n[1]) * l.height;
        const shape = this.shape;
        let box: Drawn['box'];

        if (!straight) {
            const sweep = (type === 'circle' ? 360 : this.angle) * DEGREE;
            shape.kind = 'arc';
            shape.sweep = sweep;
            shape.start = this.rotation * DEGREE - sweep / 2;
            shape.cx = shape.cy = look.size / 2;
            shape.mid = 1;
            const markOut = bandOut + (shapes.includes('triangle') ? look.marker : 0);
            const outward = Math.max(markOut, near);
            const tickIn = outward + gap;
            const tickOut = tickIn + (ticked ? look.tick : 0);
            const labelIn = (ticked ? tickOut : outward) + gap;
            // The size is the arc's own: the ranges sit in it, the marks, ticks and their values around it.
            shape.mid = Math.max(half + 4, look.size / 2 - bandOut);
            // The drawing's box: the ends of the arc, the round sides it passes, the middle, and the labels.
            const points: Place[] = [[shape.cx, shape.cy]];
            for (const s of [0, 1]) points.push(shape.point(shape.spot(s), -half), shape.point(shape.spot(s), outward));
            for (let k = -8; k <= 8; k++) {
                const a = k * (Math.PI / 2);
                const s = (a - shape.start) / sweep;
                if (s > 0 && s < 1) points.push(shape.point(shape.spot(s), outward));
            }
            // The value is written over the middle: the drawing leaves room for it.
            if (marker !== 'needle' && this.showValue && value !== null) {
                const room = (measured.valueHeight || lineHeight * 2) / 2;
                points.push([shape.cx, shape.cy + room]);
            }
            if (marker === 'needle') {
                const hub = look.thickness * 0.6;
                points.push([shape.cx - hub, shape.cy - hub], [shape.cx + hub, shape.cy + hub]);
            }
            // Every value of the scale takes the room of the widest, on one circle: gauges with the same scale then have their
            // middle at the same place in their box, whichever way they are turned, and line up.
            const room = { width: Math.max(0, ...labels.map(l => l.width)), height: lineHeight };
            const placed = labels.map((l, i) => {
                const spot = shape.spot(share(l.v));
                let at: Place;
                if (ticked) at = shape.point(spot, labelIn + reach(spot.n, room) / 2);
                else {
                    // The two ends sit past the ends of the arc, going on the way it runs.
                    const way: Place = i === 0 ? [-spot.t[0], -spot.t[1]] : spot.t;
                    const along = gap + reach(way, room) / 2;
                    at = [spot.c[0] + way[0] * along, spot.c[1] + way[1] * along];
                }
                points.push([at[0] - room.width / 2, at[1] - room.height / 2], [at[0] + room.width / 2, at[1] + room.height / 2]);
                return { ...l, at, anchor: 'middle' as const };
            });
            const xs = points.map(p => p[0]);
            const ys = points.map(p => p[1]);
            box = { x: Math.floor(Math.min(...xs)), y: Math.floor(Math.min(...ys)), width: 0, height: 0 };
            box.width = Math.ceil(Math.max(...xs)) - box.x + 1;
            box.height = Math.ceil(Math.max(...ys)) - box.y + 1;
            this.drawTicks(majors, minors, share, tickIn, look.tick, 1, ticked);
            this.drawLabels(placed);
            css(this, '--_center-x', `${(shape.cx - box.x).toFixed(1)}px`);
            css(this, '--_center-y', `${(shape.cy - box.y).toFixed(1)}px`);
            this.drawn = { min, max, look, straight, bandOut, markFrom: bandOut, lineHeight, widthOf: movingWidth, box };
        } else {
            const n: Place = vertical ? [1, 0] : [0, -1];
            const outward = Math.max(bandOut + markRoom(n), near);
            const tickIn = near + gap;
            const tickOut = tickIn + (ticked ? look.tick : 0);
            const labelIn = (ticked ? tickOut : near) + gap;
            const labelReach = labels.length ? Math.max(...labels.map(l => reach(n, l))) : 0;
            const inward = labels.length ? labelIn + labelReach : ticked ? tickOut : near;
            // Room at the two ends for what sits on them: a marker, or half a label.
            const ends = scale === 'ends' && !vertical;
            const endLabel = labels.length && !ends ? Math.max(...labels.map(l => (vertical ? l.height : l.width) / 2)) : 0;
            const endShape = Math.max(dotted ? dot : 0, shapes.includes('triangle') ? look.marker * 0.6 : 0, calloutTexts.length ? (vertical ? lineHeight : widest) / 2 + gap : 0);
            const inset = Math.max(endLabel, endShape);
            const length = vertical ? look.length : measured.width || UNMEASURED.width;
            const across = Math.ceil(outward + inward);
            shape.kind = vertical ? 'vertical' : 'horizontal';
            if (vertical) {
                shape.from = length - inset;
                shape.to = inset;
                shape.across = inward;
                box = { x: 0, y: 0, width: across, height: length };
            } else {
                shape.from = inset;
                shape.to = length - inset;
                shape.across = outward;
                box = { x: 0, y: 0, width: length, height: across };
            }
            const placed = labels.map(l => {
                const spot = shape.spot(share(l.v));
                const at = shape.point(spot, -(labelIn + reach(n, l) / 2));
                if (ends) {
                    const first = share(l.v) < 0.5;
                    return { ...l, at: [first ? shape.from : shape.to, at[1]] as Place, anchor: first ? ('start' as const) : ('end' as const) };
                }
                return { ...l, at, anchor: 'middle' as const };
            });
            this.drawTicks(majors, minors, share, tickIn, look.tick, -1, ticked);
            this.drawLabels(placed);
            this.drawn = { min, max, look, straight, bandOut, markFrom: bandOut, lineHeight, widthOf: movingWidth, box };
        }

        put(this.svg, 'viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        put(this.svg, 'width', String(box.width));
        put(this.svg, 'height', String(box.height));
        css(this, '--_drawn-width', straight && !vertical ? '' : `${box.width}px`);
        put(this.track, 'd', shape.strip(0, 1, -half, half, straight) || null);
        for (const extra of this.bandPaths.splice(ranges.length)) removePart(extra);
        ranges.forEach((r, i) => {
            const path = (this.bandPaths[i] ??= svgComponent(this.bands, 'path', 'mx-gauge__band'));
            css(path, '--_band', this.toneOf(r));
            put(path, 'd', shape.strip(share(r.from), share(r.to), bandIn, bandOut) || null);
        });
        this.drawMarks(marks, share);
        this.drawValue(this.motion.shown[0] ?? value);
        texts.ask();
    }

    /** The values the gauge keeps room for: the ends of the scale, or a value past them. */
    roomValues(): string[] {
        const min = this.min;
        const max = this.max === min ? min + 1 : this.max;
        const value = this.value;
        const values = [min, max];
        if (value !== null && (value < Math.min(min, max) || value > Math.max(min, max))) values.push(value);
        return values.map(v => this.number(v));
    }

    markerKind(): GaugeMarker | null {
        const marker = this.marker;
        return marker === 'needle' && this.type === 'linear' ? 'triangle' : marker;
    }

    shapeOf(m: GaugeMark): GaugeMarker {
        const shape = m.shape ?? this.markShape;
        return shape === 'needle' && this.type === 'linear' ? 'triangle' : shape;
    }

    drawTicks(majors: number[], minors: number[], share: (v: number) => number, from: number, length: number, side: 1 | -1, on: boolean): void {
        const segment = (v: number, to: number) => {
            const spot = this.shape.spot(share(v));
            const [x1, y1] = this.shape.point(spot, from * side);
            const [x2, y2] = this.shape.point(spot, (from + to) * side);
            return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
        };
        put(this.tickPath, 'd', on && majors.length ? majors.map(v => segment(v, length)).join('') : null);
        put(this.minorPath, 'd', on && minors.length ? minors.map(v => segment(v, length / 2)).join('') : null);
    }

    drawLabels(labels: readonly { text: string; at: Place; anchor: 'start' | 'middle' | 'end' }[]): void {
        for (const l of labels) put(this.labelPool.add(l.text, l.at[0], l.at[1], l.anchor), 'dominant-baseline', 'central');
        this.labelPool.done();
    }

    drawMarks(marks: readonly GaugeMark[], share: (v: number) => number): void {
        const drawn = this.drawn!;
        for (const extra of this.markParts.splice(marks.length)) removePart(extra.group);
        marks.forEach((m, i) => {
            const parts = (this.markParts[i] ??= this.makeMark());
            const kind = this.shapeOf(m);
            put(parts.group, 'data-shape', kind);
            const drawnShape = this.shapePath(kind, share(m.value), drawn, this.number(m.value));
            put(parts.path, 'd', drawnShape.d || null);
            text(parts.label, drawnShape.text);
            put(parts.label, 'x', drawnShape.at ? drawnShape.at[0].toFixed(1) : null);
            put(parts.label, 'y', drawnShape.at ? drawnShape.at[1].toFixed(1) : null);
        });
    }

    makeMark(): MarkParts {
        const group = svgComponent(this.markGroup, 'g', 'mx-gauge__mark');
        const path = svgComponent(group, 'path');
        const label = svgComponent(group, 'text');
        label.attr.add({ 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        return { group, path, label };
    }

    /** The path of a marker or a mark, and its text for a callout. */
    shapePath(kind: GaugeMarker, at: number, drawn: Drawn, value: string): { d: string; text: string; at: Place | null } {
        const shape = this.shape;
        const { thickness, marker } = drawn.look;
        const half = thickness / 2;
        switch (kind) {
            case 'triangle':
                return { d: shape.triangle(at, drawn.markFrom, marker), text: '', at: null };
            case 'circle':
                return { d: shape.dot(at, Math.max(half + 2, marker / 2)), text: '', at: null };
            case 'rhombus':
                return { d: shape.rhombus(at, Math.max(half + 2, marker / 2) * 1.2), text: '', at: null };
            case 'line':
                return { d: shape.line(at, half + 2, Math.max(2, thickness / 4)), text: '', at: null };
            case 'text': {
                const gap = drawn.look.spacing;
                // On an arc a callout sits inside, so it does not push the scale away from the track.
                const inward = !drawn.straight;
                const box = shape.callout(at, inward ? half : drawn.markFrom, drawn.widthOf(value) + gap * 2, drawn.lineHeight + gap, marker / 2, gap, inward);
                return { d: box.d, text: value, at: box.text };
            }
            case 'needle': {
                const length = shape.mid;
                return { d: shape.needle(at, -thickness * 0.4, length, thickness * 0.5, thickness * 0.5), text: '', at: null };
            }
        }
    }

    /** The parts that follow the moving value: the fill, its tone and the marker. */
    drawValue(shownValue: number | null): void {
        const drawn = this.drawn;
        if (!drawn) return;
        const { min, max, look, straight } = drawn;
        const share = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
        const half = look.thickness / 2;
        const shape = this.shape;
        const base = this.baseValue ?? min;
        put(this.fillPath, 'd', this.fill && shownValue !== null ? shape.strip(share(base), share(shownValue), -half, half, straight) || null : null);
        // The color goes with the fill, so it changes where the fill crosses into a range.
        css(this, '--_tone', this.toneOf(this.rangeOf(shownValue)));

        const marker = this.markerKind();
        const at = shownValue === null ? null : share(shownValue);
        let markerD: string | null = null;
        let needleD: string | null = null;
        let tipD: string | null = null;
        let callout: { d: string; text: string; at: Place | null } | null = null;
        if (at !== null && marker === 'needle') {
            const t = look.thickness;
            const length = shape.mid;
            const hub = this.hubPath(t * 0.6);
            const needleShape = this.needleShape;
            if (needleShape === 'tapered') needleD = shape.needle(at, -t * 0.8, length, t, 1) + hub;
            else if (needleShape === 'straight') needleD = shape.needle(at, -t * 0.8, length, t * 0.35, t * 0.35) + hub;
            else {
                needleD = shape.needle(at, -t * 0.8, length * 0.6, t * 0.35, t * 0.35) + hub;
                tipD = shape.needle(at, length * 0.6, length, t * 0.35, t * 0.35);
            }
        } else if (at !== null && marker === 'text') callout = this.shapePath('text', at, drawn, this.number(this.value ?? shownValue!));
        else if (at !== null && marker) markerD = this.shapePath(marker, at, drawn, '').d;
        put(this.markerPath, 'd', markerD);
        put(this.needlePath, 'd', needleD);
        put(this.needleTip, 'd', tipD);
        put(this.calloutPath, 'd', callout?.d ?? null);
        text(this.calloutText, callout?.text ?? '');
        put(this.calloutText, 'x', callout?.at ? callout.at[0].toFixed(1) : null);
        put(this.calloutText, 'y', callout?.at ? callout.at[1].toFixed(1) : null);
    }

    hubPath(radius: number): string {
        const { cx, cy } = this.shape;
        const r = radius.toFixed(1);
        return `M${(cx - radius).toFixed(1)} ${cy.toFixed(1)}a${r} ${r} 0 1 0 ${(radius * 2).toFixed(1)} 0a${r} ${r} 0 1 0 ${(-radius * 2).toFixed(1)} 0Z`;
    }

    drawName(value: number | null): void {
        put(this, 'aria-label', this.label || uiLocale.strings.gaugeName);
        put(this, 'aria-valuemin', String(Math.min(this.min, this.max)));
        put(this, 'aria-valuemax', String(Math.max(this.min, this.max)));
        put(this, 'aria-valuenow', value === null ? null : String(value));
        if (value === null) {
            put(this, 'aria-valuetext', null);
            return;
        }
        const range = this.rangeOf(value);
        const parts = [range?.label ? uiLocale.text('gaugeValueIn', { value: this.number(value), range: range.label }) : this.number(value)];
        for (const m of givenList(this.marks)) parts.push(this.markText(m));
        put(this, 'aria-valuetext', parts.join('; '));
    }

    markText(m: GaugeMark): string {
        return m.label ? uiLocale.text('gaugeMark', { label: m.label, value: this.number(m.value) }) : uiLocale.text('gaugeMarkAt', { value: this.number(m.value) });
    }

    /** The value or the mark nearest the pointer shows in the tooltip. */
    pointAt(e: PointerEvent): void {
        const drawn = this.drawn;
        const value = this.value;
        if (!this.tooltip || !drawn) return;
        const rect = rectOf(this.svg);
        const host = rectOf(this);
        if (!rect.width || !rect.height) return;
        const scale = drawn.box.width / rect.width;
        const x = drawn.box.x + (e.clientX - rect.left) * scale;
        const y = drawn.box.y + (e.clientY - rect.top) * scale;
        const share = (v: number) => Math.max(0, Math.min(1, (v - drawn.min) / (drawn.max - drawn.min)));
        const candidates = [
            ...(value === null ? [] : [{ at: share(this.motion.shown[0] ?? value), text: this.valueTip(value) }]),
            ...givenList(this.marks).map(m => ({ at: share(m.value), text: this.markText(m) }))
        ];
        let best: { at: number; text: string } | null = null;
        let nearest = Math.max(16, drawn.look.thickness * 1.5);
        for (const c of candidates) {
            const [cx, cy] = this.shape.spot(c.at).c;
            const d = Math.hypot(cx - x, cy - y);
            if (d < nearest) {
                nearest = d;
                best = c;
            }
        }
        if (!best) {
            shown(this.tip, false);
            return;
        }
        const [px, py] = this.shape.spot(best.at).c;
        text(this.tip, best.text);
        shown(this.tip, true);
        css(this.tip, 'left', `${(rect.left - host.left + (px - drawn.box.x) / scale).toFixed(1)}px`);
        css(this.tip, 'top', `${(rect.top - host.top + (py - drawn.box.y) / scale).toFixed(1)}px`);
    }

    valueTip(value: number): string {
        const range = this.rangeOf(value);
        return range?.label ? uiLocale.text('gaugeValueIn', { value: this.number(value), range: range.label }) : this.number(value);
    }
}
