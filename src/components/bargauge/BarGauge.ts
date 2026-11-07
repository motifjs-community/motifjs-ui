import type { Bind, IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { functionValue } from "../../core/function-value";
import { css, shown, text } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { onLookChanged } from "../../core/look-watch";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { ResizeWatch } from "../../core/resize-watch";
import { onFontsLoaded } from "../../core/fonts-loaded";
import { uiLocale } from "../../core/ui-locale";
import { arcPath, polar, type Place } from "../../parts/chart/chart-paths";
import { formatNumber, textWidth, type ChartFormat } from "../../parts/chart/chart-text";
import { svgPart, svgPut, TextPool } from "../../parts/chart/svg-parts";
import { ValueMotion } from "../../parts/chart/value-motion";
import type { ChartField } from "../chart/chart-field";
import type { BarGaugeProps } from "./bar-gauge-props";

const OWN = ['data', 'valueField', 'nameField', 'colorField', 'min', 'max', 'baseValue', 'angle', 'rotation', 'colors', 'label', 'format', 'showLabels', 'legend', 'tooltip', 'size'] as const;
const FUNCTIONS: readonly string[] = ['valueField', 'nameField', 'colorField', 'format'];
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

interface Ring {
    inner: number;
    outer: number;
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
    svg: SVGSVGElement;
    tracks: SVGGElement;
    fills: SVGGElement;
    connectors: SVGPathElement;
    labels: SVGGElement;
    labelPool: TextPool;
    probe: SVGTextElement;
    legendList: HTMLUListElement;
    tip: HTMLSpanElement;
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
    measure: (text: string) => number = t => t.length * 7;
    lineHeight = 16;
    placed = false;
    queued = false;
    watch: ResizeWatch | null = null;
    stopLook: (() => void) | null = null;
    stopFonts: (() => void) | null = null;

    constructor(props?: IBaseProp<BarGaugeProps<T>>) {
        super('div', props);
        const own = (this.props ?? {}) as BarGaugeProps<T>;
        const el = this.element;
        el.classList.add('mx-bar-gauge');
        el.setAttribute('role', 'img');
        const doc = el.ownerDocument;
        const svg = svgPart(el, 'svg', 'mx-bar-gauge__svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        this.svg = svg;
        this.tracks = svgPart(svg, 'g', 'mx-bar-gauge__tracks');
        this.fills = svgPart(svg, 'g', 'mx-bar-gauge__bars');
        this.connectors = svgPart(svg, 'path', 'mx-bar-gauge__connectors');
        this.labels = svgPart(svg, 'g', 'mx-bar-gauge__labels');
        this.labelPool = new TextPool(this.labels);
        // Texts are measured as they are drawn, with the same font and numbers.
        this.probe = svgPart(svgPart(svg, 'g', 'mx-bar-gauge__probe'), 'text');
        this.legendList = doc.createElement('ul');
        this.legendList.className = 'mx-bar-gauge__legend';
        this.legendList.setAttribute('aria-hidden', 'true');
        el.append(this.legendList);
        this.tip = doc.createElement('span');
        this.tip.className = 'mx-bar-gauge__tip';
        this.tip.setAttribute('aria-hidden', 'true');
        el.append(this.tip);
        shown(this.tip, false);
        this.motion = new ValueMotion(el, values => this.drawValues(values));

        // A function that takes a value is the value itself, not a live one.
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, FUNCTIONS.includes(name) ? functionValue(own[name]) : own[name]);
        for (const name of OWN) {
            if (name === 'data' || name === 'valueField' || name === 'baseValue') this.observeProperty(name, () => this.moveTo());
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.moveTo());
        el.addEventListener('pointermove', e => this.pointAt(e));
        el.addEventListener('pointerleave', () => shown(this.tip, false));
        this.motif.setDisposable(() => {
            this.motion.stop();
            this.watch?.disconnect();
            this.stopLook?.();
            this.stopFonts?.();
        });
    }

    // In the page now: it has a size to draw at.
    override onMounted(): void {
        if (this.placed) return;
        this.placed = true;
        this.watch = new ResizeWatch(() => this.again());
        this.watch.observe(this.element);
        this.stopLook = onLookChanged(() => this.again());
        this.stopFonts = onFontsLoaded(this.element, () => this.again());
        this.bars = this.read();
        this.motion.set(this.bars.map(b => b.value));
        this.draw();
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
        if (this.queued || !this.placed) return;
        this.queued = true;
        queueMicrotask(() => {
            this.queued = false;
            if (!this.isDisposed) this.draw();
        });
    }

    /** New values: a bar that is new grows from the base value. */
    moveTo(): void {
        if (!this.placed) return;
        this.bars = this.read();
        const base = this.baseValue ?? this.min;
        const shown = this.motion.shown.slice(0, this.bars.length);
        while (shown.length < this.bars.length) shown.push(base);
        this.motion.shown = shown;
        // The rings of the new bars first, then the move.
        this.draw();
        this.motion.move(this.bars.map(b => b.value));
    }

    lengths(): Look {
        const view = this.element.ownerDocument.defaultView;
        const probe = this.element.ownerDocument.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;block-size:0;';
        this.element.append(probe);
        const length = (token: string, fallback: number) => {
            probe.style.inlineSize = `var(${token})`;
            const size = parseFloat(view?.getComputedStyle(probe).inlineSize ?? '');
            return Number.isFinite(size) ? size : fallback;
        };
        const look = {
            size: this.size ?? length('--_bar-gauge-size', UNMEASURED.size),
            thickness: length('--_bar-gauge-thickness', UNMEASURED.thickness),
            gap: length('--_bar-gauge-gap', UNMEASURED.gap),
            indent: length('--_bar-gauge-indent', UNMEASURED.indent),
            spacing: length('--_bar-gauge-spacing', UNMEASURED.spacing)
        };
        probe.remove();
        return look;
    }

    draw(): void {
        const el = this.element;
        const bars = this.bars;
        this.drawName();
        const look = (this.look = this.lengths());
        const style = el.ownerDocument.defaultView?.getComputedStyle(this.labels);
        const font = style?.font || `${style?.fontSize || '12px'} ${style?.fontFamily || 'sans-serif'}`;
        const fontSize = parseFloat(style?.fontSize ?? '') || 12;
        const textBox = (t: string) => {
            this.probe.textContent = t;
            const width = typeof this.probe.getComputedTextLength === 'function' ? this.probe.getComputedTextLength() : 0;
            return width ? { width, height: this.probe.getBBox().height } : { width: textWidth(t, font, el.ownerDocument), height: 0 };
        };
        this.lineHeight = Math.max(parseFloat(style?.lineHeight ?? '') || fontSize * 1.35, textBox('0').height);
        const widths = new Map<string, number>();
        this.measure = t => widths.get(t) ?? widths.set(t, textBox(t).width).get(t)!;

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
        const widest = labelsOn ? Math.max(0, ...bars.map(b => (b.value === null ? 0 : this.measure(this.number(b.value))))) : 0;
        this.probe.textContent = '';
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
        svgPut(this.svg, 'viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
        svgPut(this.svg, 'width', box.width);
        svgPut(this.svg, 'height', box.height);
        css(el, '--_drawn-width', `${box.width}px`);

        while (this.tracks.children.length > count) this.tracks.lastElementChild!.remove();
        this.rings.forEach((ring, i) => {
            const path = (this.tracks.children[i] as SVGPathElement | undefined) ?? svgPart(this.tracks, 'path', 'mx-bar-gauge__track');
            svgPut(path, 'd', arcPath(this.cx, this.cy, ring.inner, ring.outer, this.start, this.start + this.sweep) || null);
        });
        this.drawLegend();
        this.drawValues(this.motion.shown);
    }

    /** The parts that follow the moving values: the bars and the values at their ends. */
    drawValues(values: readonly (number | null)[]): void {
        const bars = this.bars;
        const min = this.min;
        const max = this.max === min ? min + 1 : this.max;
        const share = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
        const base = share(this.baseValue ?? min);
        const at = (v: number) => this.start + share(v) * this.sweep;
        while (this.fills.children.length > bars.length) this.fills.lastElementChild!.remove();
        bars.forEach((bar, i) => {
            const path = (this.fills.children[i] as SVGPathElement | undefined) ?? svgPart(this.fills, 'path', 'mx-bar-gauge__bar');
            path.style.setProperty('--_bar', bar.color);
            const v = values[i] ?? null;
            const ring = this.rings[i];
            const from = this.start + base * this.sweep;
            svgPut(path, 'd', v === null || !ring ? null : arcPath(this.cx, this.cy, ring.inner, ring.outer, Math.min(from, at(v)), Math.max(from, at(v))) || null);
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
                const w = this.measure(label);
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
                this.labelPool.add(label, x, y, 'middle').setAttribute('dominant-baseline', 'central');
            }
        }
        this.labelPool.done();
        svgPut(this.connectors, 'd', connectors || null);
    }

    drawLegend(): void {
        const list = this.legendList;
        const bars = this.legend ? this.bars : [];
        shown(list, bars.length > 0);
        while (list.children.length > bars.length) list.lastElementChild!.remove();
        bars.forEach((bar, i) => {
            let item = list.children[i] as HTMLLIElement | undefined;
            if (!item) {
                item = list.ownerDocument.createElement('li');
                item.className = 'mx-bar-gauge__entry';
                const swatch = list.ownerDocument.createElement('span');
                swatch.className = 'mx-bar-gauge__swatch';
                item.append(swatch, list.ownerDocument.createElement('span'));
                list.append(item);
            }
            (item.children[0] as HTMLElement).style.setProperty('--_bar', bar.color);
            text(item.children[1] as HTMLElement, this.barText(bar));
        });
    }

    barText(bar: Bar): string {
        const value = bar.value === null ? '' : this.number(bar.value);
        return bar.name ? uiLocale.text('barGaugeBar', { name: bar.name, value }) : value;
    }

    drawName(): void {
        const name = this.label || uiLocale.strings.barGaugeName;
        const values = this.bars.filter(b => b.value !== null).map(b => this.barText(b));
        this.element.setAttribute('aria-label', values.length ? uiLocale.text('barGaugeSummary', { name, values: values.join(', ') }) : name);
    }

    /** The bar under the pointer shows in the tooltip. */
    pointAt(e: PointerEvent): void {
        if (!this.tooltip || !this.rings.length) return;
        const rect = this.svg.getBoundingClientRect();
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
            shown(this.tip, false);
            return;
        }
        const host = this.element.getBoundingClientRect();
        text(this.tip, this.barText(bar));
        shown(this.tip, true);
        css(this.tip, 'left', `${(e.clientX - host.left).toFixed(1)}px`);
        css(this.tip, 'top', `${(e.clientY - host.top).toFixed(1)}px`);
    }
}
