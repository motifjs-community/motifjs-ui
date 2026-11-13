import type { Bind, Component, IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { functionValue } from "../../core/function-value";
import { part, removePart } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { isInPage, lengthOf, measure, onLayout, probeLengths, rectOf, styleOf, textWidths } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { css, kept, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { arcPath, polar, type Place } from "../../parts/chart/chart-paths";
import { DrawnTexts, formatNumber, type ChartFormat } from "../../parts/chart/chart-text";
import { svgComponent } from "../../parts/chart/svg-parts";
import { ValueMotion } from "../../parts/chart/value-motion";
import type { ChartField } from "../chart/chart-field";
import { TextParts } from "../chart/text-parts";
import type { BarGaugeProps } from "./bar-gauge-props";

const OWN = ['data', 'valueField', 'nameField', 'colorField', 'min', 'max', 'baseValue', 'angle', 'rotation', 'colors', 'label', 'format', 'showLabels', 'legend', 'tooltip', 'size'] as const;
const FUNCTIONS: readonly string[] = ['valueField', 'nameField', 'colorField', 'format'];
const LENGTHS = ['--_bar-gauge-size', '--_bar-gauge-thickness', '--_bar-gauge-gap', '--_bar-gauge-indent', '--_bar-gauge-spacing'];
const FONT = ['font', 'font-size', 'font-family', 'line-height'] as const;
const DEGREE = Math.PI / 180;
const SERIES = 8;
/** Sizes for where nothing is laid out, as in a test without a browser. */
const UNMEASURED = { size: 200, thickness: 12, gap: 4, indent: 12, spacing: 4 };

interface Bar {
    value: number | null;
    name: string;
    color: string;
}

interface Look {
    size: number;
    thickness: number;
    gap: number;
    indent: number;
    spacing: number;
}

/** What a draw reads before it writes: the lengths and the font of the values. */
interface LookRead {
    look: Look;
    font: Record<(typeof FONT)[number], string>;
}

interface Ring {
    inner: number;
    outer: number;
}

interface LegendEntry {
    item: Component<HTMLLIElement>;
    swatch: Component<HTMLSpanElement>;
    label: Component<HTMLSpanElement>;
}

/**
 * Several values side by side as bars bent round one middle, each against the same scale: a bar starts at the base
 * value and goes round as far as its value. Each value is written at the end of its bar, a legend names the bars, and
 * the pointer shows the bar under it. The values are read as one name for assistive technology, and a change moves over
 * the design language's motion.
 *
 * @example
 * <BarGauge data={() => this.sales} valueField="share" nameField="region" label="Sales by region" legend />
 */
export class BarGauge<T = any> extends Control<HTMLDivElement, BarGaugeProps<T>> {
    svg: Component<SVGSVGElement>;
    tracks: Component<SVGGElement>;
    fills: Component<SVGGElement>;
    connectors: Component<SVGPathElement>;
    labels: Component<SVGGElement>;
    /** The values at the ends of the bars, measured in their font and numbers. */
    texts: DrawnTexts;
    legendList: Component<HTMLUListElement>;
    tip: Component<HTMLSpanElement>;
    // What is drawn for the values, kept between draws.
    trackPaths: Component<SVGPathElement>[] = [];
    barPaths: Component<SVGPathElement>[] = [];
    labelTexts: TextParts;
    legendEntries: LegendEntry[] = [];
    motion: ValueMotion;
    bars: Bar[] = [];
    rings: Ring[] = [];
    cx = 0;
    cy = 0;
    start = 0;
    sweep = 0;
    reach = 0;
    box = { x: 0, y: 0, width: 0, height: 0 };
    look: Look = UNMEASURED;
    font: LookRead['font'] = { font: '', 'font-size': '', 'font-family': '', 'line-height': '' };
    widthOf: (text: string) => number = t => t.length * 7;
    lineHeight = 16;
    /** Drawn once with what was read: new values move from there on. */
    drawn = false;

    readonly readLook = (): LookRead => ({
        look: {
            size: this.size ?? lengthOf(this, '--_bar-gauge-size', UNMEASURED.size),
            thickness: lengthOf(this, '--_bar-gauge-thickness', UNMEASURED.thickness),
            gap: lengthOf(this, '--_bar-gauge-gap', UNMEASURED.gap),
            indent: lengthOf(this, '--_bar-gauge-indent', UNMEASURED.indent),
            spacing: lengthOf(this, '--_bar-gauge-spacing', UNMEASURED.spacing)
        },
        font: styleOf(this.labels, FONT)
    });

    readonly drawLook = (read: LookRead): void => {
        this.look = read.look;
        this.font = read.font;
        if (!this.drawn) {
            this.drawn = true;
            this.bars = this.read();
            this.motion.set(this.bars.map(b => b.value));
        }
        this.draw();
    };

    constructor(props?: IBaseProp<BarGaugeProps<T>>) {
        super('div', props);
        const own = (this.props ?? {}) as BarGaugeProps<T>;
        this.class.add('mx-bar-gauge');
        this.attr.add({ role: 'img' });
        const svg = svgComponent(this, 'svg', 'mx-bar-gauge__svg');
        svg.attr.add({ 'aria-hidden': 'true', focusable: 'false' });
        this.svg = svg;
        this.tracks = svgComponent(svg, 'g', 'mx-bar-gauge__tracks');
        this.fills = svgComponent(svg, 'g', 'mx-bar-gauge__bars');
        this.connectors = svgComponent(svg, 'path', 'mx-bar-gauge__connectors');
        this.labels = svgComponent(svg, 'g', 'mx-bar-gauge__labels');
        this.labelTexts = new TextParts(this.labels);
        // Texts are measured in the font and numbers of the values; one that comes out another size draws again.
        this.texts = new DrawnTexts(this, () => this.again(), 'mx-bar-gauge__probe');
        this.legendList = part<HTMLUListElement>(this, 'ul', 'mx-bar-gauge__legend');
        this.legendList.attr.add({ 'aria-hidden': 'true' });
        this.tip = part<HTMLSpanElement>(this, 'span', 'mx-bar-gauge__tip');
        this.tip.attr.add({ 'aria-hidden': 'true' });
        kept(this.tip, false);
        this.motion = new ValueMotion(this, values => this.drawValues(values));
        probeLengths(this, LENGTHS);

        // A function that takes a value is the value itself, not a live one.
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, FUNCTIONS.includes(name) ? functionValue(own[name]) : own[name]);
        for (const name of OWN) {
            if (name === 'data' || name === 'valueField' || name === 'baseValue') this.observeProperty(name, () => this.moveTo());
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.moveTo());
        // In the page with a size to draw at, and again at each new size or look (fonts that finish loading too).
        onLayout(this, 'size', () => this.again());
        onLayout(this, 'look', () => this.again());
        this.motif.on('pointermove', (_, e) => this.pointAt(e));
        this.motif.on('pointerleave', () => kept(this.tip, false));
        this.motif.setDisposable(() => this.motion.stop());
    }

    override onMounted(): void {
        this.again();
    }

    // Properties (see BarGaugeProps).

    get data(): readonly (T | number)[] {
        return this.getProperty<readonly (T | number)[] | undefined>('data') ?? [];
    }
    set data(value: Bind<readonly (T | number)[]>) {
        this.assignProperty('data', value);
    }
    get valueField(): ChartField<T> | null {
        return this.getProperty<ChartField<T> | null | undefined>('valueField') ?? null;
    }
    set valueField(value: Bind<ChartField<T> | null>) {
        this.assignProperty('valueField', functionValue(value));
    }
    get nameField(): ChartField<T> | null {
        return this.getProperty<ChartField<T> | null | undefined>('nameField') ?? null;
    }
    set nameField(value: Bind<ChartField<T> | null>) {
        this.assignProperty('nameField', functionValue(value));
    }
    get colorField(): ChartField<T> | null {
        return this.getProperty<ChartField<T> | null | undefined>('colorField') ?? null;
    }
    set colorField(value: Bind<ChartField<T> | null>) {
        this.assignProperty('colorField', functionValue(value));
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
    get baseValue(): number | null {
        const value = this.getProperty<number | null | undefined>('baseValue');
        return value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
    }
    set baseValue(value: Bind<number | null>) {
        this.assignProperty('baseValue', value);
    }
    get angle(): number {
        return Math.min(360, Math.max(30, this.getProperty<number | undefined>('angle') ?? 270));
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
    get colors(): readonly string[] | null {
        return this.getProperty<readonly string[] | null | undefined>('colors') ?? null;
    }
    set colors(value: Bind<readonly string[] | null>) {
        this.assignProperty('colors', value);
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
    get showLabels(): boolean {
        return this.getProperty<boolean | undefined>('showLabels') ?? true;
    }
    set showLabels(value: Bind<boolean>) {
        this.assignProperty('showLabels', value);
    }
    get legend(): boolean {
        return this.getProperty<boolean | undefined>('legend') ?? false;
    }
    set legend(value: Bind<boolean>) {
        this.assignProperty('legend', value);
    }
    get tooltip(): boolean {
        return this.getProperty<boolean | undefined>('tooltip') ?? true;
    }
    set tooltip(value: Bind<boolean>) {
        this.assignProperty('tooltip', value);
    }
    get size(): number | null {
        const value = this.getProperty<number | null | undefined>('size');
        return value === null || value === undefined || !Number.isFinite(Number(value)) ? null : Number(value);
    }
    set size(value: Bind<number | null>) {
        this.assignProperty('size', value);
    }

    /** Draws again after the developer changed the given rows in place. */
    refresh(): void {
        this.moveTo();
    }

    /** The bars, read from numbers or from rows; anything else is an empty value. */
    read(): Bar[] {
        const field = (row: unknown, f: ChartField<T> | null) => (f === null ? undefined : typeof f === 'function' ? f(row as T) : (row as Record<string, unknown>)?.[f]);
        const valueField = this.valueField;
        const nameField = this.nameField;
        const colorField = this.colorField;
        const colors = givenList(this.colors);
        return givenList(this.data).map((row, i) => {
            const raw = typeof row === 'number' || valueField === null ? row : field(row, valueField);
            const number = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
            const own = field(row, colorField);
            return {
                value: Number.isFinite(number) ? number : null,
                name: String(field(row, nameField) ?? ''),
                color: typeof own === 'string' && own ? own : colors[i] ?? `var(--_bar-gauge-series-${(i % SERIES) + 1})`
            };
        });
    }

    number(value: number): string {
        return formatNumber(value, this.format ?? undefined, uiLocale.locale);
    }

    again(): void {
        if (isInPage(this)) measure(this, this.readLook, this.drawLook);
    }

    /** New values: a bar that is new grows from the base value. */
    moveTo(): void {
        if (!this.drawn) {
            this.again();
            return;
        }
        this.bars = this.read();
        const base = this.baseValue ?? this.min;
        const shown = this.motion.shown.slice(0, this.bars.length);
        while (shown.length < this.bars.length) shown.push(base);
        this.motion.shown = shown;
        // The rings of the new bars first, then the move.
        this.draw();
        this.motion.move(this.bars.map(b => b.value));
    }

    /** Draws with the lengths and the font read last; `again` reads them anew. */
    draw(): void {
        const bars = this.bars;
        this.drawName();
        const look = this.look;
        const style = this.font;
        const font = style.font || `${style['font-size'] || '12px'} ${style['font-family'] || 'sans-serif'}`;
        const fontSize = parseFloat(style['font-size']) || 12;
        const texts = this.texts;
        this.lineHeight = Math.max(parseFloat(style['line-height']) || fontSize * 1.35, texts.height('0', 0));
        this.widthOf = t => texts.width(t, font);

        // The bars from the outside in; thinner when many would not leave a middle.
        const outer = look.size / 2;
        const count = bars.length;
        let thickness = look.thickness;
        if (count && count * thickness + (count - 1) * look.gap > outer * 0.75) thickness = Math.max(2, (outer * 0.75 - (count - 1) * look.gap) / count);
        this.rings = bars.map((_, i) => ({ outer: outer - i * (thickness + look.gap), inner: outer - i * (thickness + look.gap) - thickness }));
        this.sweep = this.angle * DEGREE;
        this.start = this.rotation * DEGREE - this.sweep / 2;
        this.cx = this.cy = outer;

        // Room for the values around the bars, the same while they move.
        const labelsOn = this.showLabels && count > 0;
        const widest = labelsOn ? Math.max(0, ...bars.map(b => (b.value === null ? 0 : this.widthOf(this.number(b.value))))) : 0;
        this.reach = labelsOn ? outer + look.indent + look.spacing + Math.max(widest, this.lineHeight) : outer;
        const points: Place[] = [[this.cx, this.cy]];
        for (const a of [this.start, this.start + this.sweep]) points.push(polar(this.cx, this.cy, this.reach, a));
        for (let k = -8; k <= 8; k++) {
            const a = k * (Math.PI / 2);
            if (a > this.start && a < this.start + this.sweep) points.push(polar(this.cx, this.cy, this.reach, a));
        }
        const xs = points.map(p => p[0]);
        const ys = points.map(p => p[1]);
        const box = { x: Math.floor(Math.min(...xs)), y: Math.floor(Math.min(...ys)), width: 0, height: 0 };
        box.width = Math.ceil(Math.max(...xs)) - box.x + 1;
        box.height = Math.ceil(Math.max(...ys)) - box.y + 1;
        this.box = box;
        put(this.svg, 'viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        put(this.svg, 'width', String(box.width));
        put(this.svg, 'height', String(box.height));
        css(this, '--_drawn-width', `${box.width}px`);

        while (this.trackPaths.length < count) this.trackPaths.push(svgComponent(this.tracks, 'path', 'mx-bar-gauge__track'));
        for (const extra of this.trackPaths.splice(count)) removePart(extra);
        this.rings.forEach((ring, i) => put(this.trackPaths[i], 'd', arcPath(this.cx, this.cy, ring.inner, ring.outer, this.start, this.start + this.sweep) || null));
        this.drawLegend();
        this.drawValues(this.motion.shown);
        texts.ask();
    }

    /** The parts that follow the moving values: the bars and the values at their ends. */
    drawValues(values: readonly (number | null)[]): void {
        const bars = this.bars;
        const min = this.min;
        const max = this.max === min ? min + 1 : this.max;
        const share = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
        const base = share(this.baseValue ?? min);
        const at = (v: number) => this.start + share(v) * this.sweep;
        while (this.barPaths.length < bars.length) this.barPaths.push(svgComponent(this.fills, 'path', 'mx-bar-gauge__bar'));
        for (const extra of this.barPaths.splice(bars.length)) removePart(extra);
        bars.forEach((bar, i) => {
            const path = this.barPaths[i];
            css(path, '--_bar', bar.color);
            const v = values[i] ?? null;
            const ring = this.rings[i];
            const from = this.start + base * this.sweep;
            put(path, 'd', v === null || !ring ? null : arcPath(this.cx, this.cy, ring.inner, ring.outer, Math.min(from, at(v)), Math.max(from, at(v))) || null);
        });

        const look = this.look;
        let connectors = '';
        if (this.showLabels) {
            const outer = this.rings[0]?.outer ?? 0;
            const placed: { x: number; y: number; w: number; h: number }[] = [];
            const order = bars.map((_, i) => i).filter(i => values[i] !== null).sort((a, b) => at(values[a]!) - at(values[b]!));
            for (const i of order) {
                if (!this.rings[i]) continue;
                const v = values[i]!;
                const a = at(v);
                const label = this.number(bars[i].value ?? v);
                const w = this.widthOf(label);
                const h = this.lineHeight;
                const n: Place = [Math.sin(a), -Math.cos(a)];
                const reach = Math.abs(n[0]) * w + Math.abs(n[1]) * h;
                // A value that would sit on another one moves further out, along its own line.
                let out = outer + look.indent;
                let x = 0;
                let y = 0;
                for (let tries = 0; tries < 40; tries++) {
                    [x, y] = polar(this.cx, this.cy, out + look.spacing + reach / 2, a);
                    const clash = placed.some(p => Math.abs(p.x - x) < (p.w + w) / 2 + 2 && Math.abs(p.y - y) < (p.h + h) / 2);
                    if (!clash) break;
                    out += h / 2;
                }
                placed.push({ x, y, w, h });
                const [x1, y1] = polar(this.cx, this.cy, this.rings[i].outer + 1, a);
                const [x2, y2] = polar(this.cx, this.cy, out, a);
                connectors += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
                put(this.labelTexts.add(label, x, y, 'middle'), 'dominant-baseline', 'central');
            }
        }
        this.labelTexts.done();
        put(this.connectors, 'd', connectors || null);
    }

    drawLegend(): void {
        const bars = this.legend ? this.bars : [];
        kept(this.legendList, bars.length > 0);
        while (this.legendEntries.length < bars.length) this.legendEntries.push(this.makeEntry());
        for (const extra of this.legendEntries.splice(bars.length)) removePart(extra.item);
        bars.forEach((bar, i) => {
            const { item, swatch, label } = this.legendEntries[i];
            css(swatch, '--_bar', bar.color);
            // The entry keeps the room of its widest value, so values that change do not move the entries.
            const ends = [this.min, this.max].map(v => this.barText({ ...bar, value: v }));
            textWidths(item, ends, widths => {
                const widest = Math.max(0, ...widths);
                css(label, 'min-inline-size', widest ? `${Math.ceil(widest)}px` : '');
            });
            text(label, this.barText(bar));
        });
    }

    makeEntry(): LegendEntry {
        const item = part<HTMLLIElement>(this.legendList, 'li', 'mx-bar-gauge__entry');
        const swatch = part<HTMLSpanElement>(item, 'span', 'mx-bar-gauge__swatch');
        const label = part<HTMLSpanElement>(item, 'span', '');
        return { item, swatch, label };
    }

    barText(bar: Bar): string {
        const value = bar.value === null ? '' : this.number(bar.value);
        return bar.name ? uiLocale.text('barGaugeBar', { name: bar.name, value }) : value;
    }

    drawName(): void {
        const name = this.label || uiLocale.strings.barGaugeName;
        const values = this.bars.filter(b => b.value !== null).map(b => this.barText(b));
        put(this, 'aria-label', values.length ? uiLocale.text('barGaugeSummary', { name, values: values.join(', ') }) : name);
    }

    /** The bar under the pointer shows in the tooltip. */
    pointAt(e: PointerEvent): void {
        if (!this.tooltip || !this.rings.length) return;
        const rect = rectOf(this.svg);
        const host = rectOf(this);
        if (!rect.width) return;
        const scale = this.box.width / rect.width;
        const x = this.box.x + (e.clientX - rect.left) * scale - this.cx;
        const y = this.box.y + (e.clientY - rect.top) * scale - this.cy;
        const r = Math.hypot(x, y);
        const gap = this.look.gap / 2;
        const index = this.rings.findIndex(ring => r >= ring.inner - gap && r <= ring.outer + gap);
        let a = Math.atan2(x, -y);
        while (a < this.start) a += Math.PI * 2;
        const bar = this.bars[index];
        if (!bar || bar.value === null || a > this.start + this.sweep) {
            kept(this.tip, false);
            return;
        }
        text(this.tip, this.barText(bar));
        kept(this.tip, true);
        css(this.tip, 'left', `${(e.clientX - host.left).toFixed(1)}px`);
        css(this.tip, 'top', `${(e.clientY - host.top).toFixed(1)}px`);
    }
}
