import type { Bind, IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { functionValue } from "../../core/function-value";
import { css, put, shown, text } from "../../core/draw-parts";
import { givenList } from "../../core/given-field";
import { onLookChanged } from "../../core/look-watch";
import { onLanguage } from "../../core/on-language";
import { onReState } from "../../core/on-re-state";
import { ResizeWatch } from "../../core/resize-watch";
import { uiLocale } from "../../core/ui-locale";
import { areaPath, barPath, circlesPath, linePath, smoothPath, type Place } from "../../parts/chart/chart-paths";
import { linearScale } from "../../parts/chart/chart-scale";
import { formatNumber, surfaceBehind, type ChartFormat } from "../../parts/chart/chart-text";
import { svgPart, svgPut } from "../../parts/chart/svg-parts";
import { thinOut } from "../../parts/chart/thin-out";
import { TokenLengths } from "../../parts/chart/token-lengths";
import type { ChartField } from "../chart/chart-field";
import type { SparklineHighlight } from "./sparkline-highlight";
import type { SparklineProps } from "./sparkline-props";
import type { SparklineType } from "./sparkline-type";

const OWN = ['data', 'yField', 'type', 'highlight', 'reference', 'min', 'max', 'smooth', 'color', 'label', 'format', 'tooltip', 'height'] as const;
const FUNCTIONS: readonly string[] = ['yField', 'format'];

/** Sizes for where nothing is laid out, as in a test without a browser. */
const UNMEASURED = { width: 96, height: 24, line: 1.5, marker: 6, gap: 1, radius: 1 };

interface Look {
    line: number;
    marker: number;
    gap: number;
    radius: number;
}

/**
 * A chart the size of a word, for a trend beside a number, in a sentence or in a row of a table. The last value is marked
 * by default; the accessible name says how many values there are, the first and the last, the lowest and the highest.
 *
 * @example
 * <Sparkline data={() => this.week} label="Visits" highlight={['last', 'max']} />
 * <Sparkline data={[3, -1, 2, -2, 4]} type="winloss" />
 */
export class Sparkline<T = any> extends Control<HTMLSpanElement, SparklineProps<T>> {
    svg: SVGSVGElement;
    area: SVGPathElement;
    referenceLine: SVGPathElement;
    marks: SVGPathElement;
    rise: SVGPathElement;
    fall: SVGPathElement;
    dots: SVGPathElement;
    active: SVGPathElement;
    tip: HTMLSpanElement;
    values: (number | null)[] = [];
    places: { x: number; y: number }[] = [];
    look: Look | null = null;
    tokens: TokenLengths;
    placed = false;
    queued = false;
    watch: ResizeWatch | null = null;
    stopLook: (() => void) | null = null;

    constructor(props?: IBaseProp<SparklineProps<T>>) {
        super('span', props);
        const own = (this.props ?? {}) as SparklineProps<T>;
        const el = this.element;
        el.classList.add('mx-sparkline');
        el.setAttribute('role', 'img');
        const svg = svgPart(el, 'svg', 'mx-sparkline__svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        this.svg = svg;
        this.referenceLine = svgPart(svg, 'path', 'mx-sparkline__reference');
        this.area = svgPart(svg, 'path', 'mx-sparkline__area');
        this.marks = svgPart(svg, 'path', 'mx-sparkline__line');
        this.rise = svgPart(svg, 'path', 'mx-sparkline__rise');
        this.fall = svgPart(svg, 'path', 'mx-sparkline__fall');
        this.dots = svgPart(svg, 'path', 'mx-sparkline__dot');
        this.active = svgPart(svg, 'path', 'mx-sparkline__active');
        this.tip = el.ownerDocument.createElement('span');
        this.tip.className = 'mx-sparkline__tip';
        this.tip.setAttribute('aria-hidden', 'true');
        el.append(this.tip);
        shown(this.tip, false);

        // A function that takes a value is the value itself, not a live one.
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, FUNCTIONS.includes(name) ? functionValue(own[name]) : own[name]);
        for (const name of OWN) {
            if (name === 'height') this.observeProperty<number | null>(name, height => css(el, '--_height', height ? `${height}px` : ''));
            else if (name === 'color') this.observeProperty<string | null>(name, color => css(el, '--_mark', color ?? ''));
            else this.observeProperty(name, () => this.again());
        }
        onLanguage(this, () => this.again());
        onReState(this, () => this.again());
        el.addEventListener('pointermove', e => this.pointed(e));
        el.addEventListener('pointerleave', () => this.leave());
        this.tokens = new TokenLengths(el, ['--_sparkline-line-width', '--_sparkline-marker-size', '--_sparkline-bar-gap', '--_sparkline-bar-radius'], () => this.again());
        this.motif.setDisposable(() => {
            this.tokens.dispose();
            this.watch?.disconnect();
            this.stopLook?.();
        });
    }

    // In the page now: it has a width to draw in.
    override onMounted(): void {
        if (this.placed) return;
        this.placed = true;
        this.watch = new ResizeWatch(() => this.again());
        this.watch.observe(this.element);
        this.stopLook = onLookChanged(() => this.again());
        this.draw();
    }

    // Properties (see SparklineProps).

    get data(): readonly unknown[] | null {
        return this.getProperty<readonly unknown[] | null | undefined>('data') ?? null;
    }
    set data(value: Bind<readonly (number | null)[] | readonly T[] | null>) {
        this.assignProperty('data', value);
    }
    get yField(): ChartField<T> | null {
        return this.getProperty<ChartField<T> | null | undefined>('yField') ?? null;
    }
    set yField(value: Bind<ChartField<T> | null>) {
        this.assignProperty('yField', functionValue(value));
    }
    get type(): SparklineType {
        return this.getProperty<SparklineType | undefined>('type') ?? 'line';
    }
    set type(value: Bind<SparklineType>) {
        this.assignProperty('type', value);
    }
    get highlight(): readonly SparklineHighlight[] {
        const given = this.getProperty<readonly SparklineHighlight[] | undefined>('highlight');
        return given ?? (this.type === 'line' || this.type === 'area' ? ['last'] : []);
    }
    set highlight(value: Bind<readonly SparklineHighlight[]>) {
        this.assignProperty('highlight', value);
    }
    get reference(): number | 'average' | null {
        return this.getProperty<number | 'average' | null | undefined>('reference') ?? null;
    }
    set reference(value: Bind<number | 'average' | null>) {
        this.assignProperty('reference', value);
    }
    get min(): number | null {
        return this.getProperty<number | null | undefined>('min') ?? null;
    }
    set min(value: Bind<number | null>) {
        this.assignProperty('min', value);
    }
    get max(): number | null {
        return this.getProperty<number | null | undefined>('max') ?? null;
    }
    set max(value: Bind<number | null>) {
        this.assignProperty('max', value);
    }
    get smooth(): boolean {
        return this.getProperty<boolean | undefined>('smooth') ?? false;
    }
    set smooth(value: Bind<boolean>) {
        this.assignProperty('smooth', value);
    }
    get color(): string | null {
        return this.getProperty<string | null | undefined>('color') ?? null;
    }
    set color(value: Bind<string | null>) {
        this.assignProperty('color', value);
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
    get tooltip(): boolean {
        return this.getProperty<boolean | undefined>('tooltip') ?? true;
    }
    set tooltip(value: Bind<boolean>) {
        this.assignProperty('tooltip', value);
    }
    get height(): number | null {
        return this.getProperty<number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<number | null>) {
        this.assignProperty('height', value);
    }

    /** Draws again from the values as they are now, after they changed in place. */
    refresh(): void {
        this.again();
    }

    again(): void {
        if (this.queued || !this.placed) return;
        this.queued = true;
        queueMicrotask(() => {
            this.queued = false;
            if (!this.isDisposed) this.draw();
        });
    }

    /** The values, read from numbers or from rows; anything else is an empty value. */
    read(): (number | null)[] {
        const field = this.yField;
        return givenList(this.data).map(item => {
            const raw = field === null ? item : typeof field === 'function' ? field(item as T) : (item as Record<string, unknown>)?.[field];
            const number = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
            return Number.isFinite(number) ? number : null;
        });
    }

    readLook(): Look {
        const t = this.tokens;
        return {
            line: t.get('--_sparkline-line-width', UNMEASURED.line),
            marker: t.get('--_sparkline-marker-size', UNMEASURED.marker),
            gap: t.get('--_sparkline-bar-gap', UNMEASURED.gap),
            radius: t.get('--_sparkline-bar-radius', UNMEASURED.radius)
        };
    }

    valueText(value: number): string {
        return formatNumber(value, this.format ?? undefined, uiLocale.locale);
    }

    draw(): void {
        const el = this.element;
        const values = this.read();
        this.values = values;
        const known = values.filter((v): v is number => v !== null);
        this.drawName(known);
        const measured = typeof ResizeObserver !== 'undefined';
        const width = el.clientWidth || (measured ? 0 : UNMEASURED.width);
        const height = el.clientHeight || (measured ? 0 : UNMEASURED.height);
        if (!width || !height) return;
        this.look = this.readLook();
        const look = this.look;
        css(el, '--_surface', surfaceBehind(el));
        svgPut(this.svg, 'viewBox', `0 0 ${width} ${height}`);
        svgPut(this.svg, 'width', width);
        svgPut(this.svg, 'height', height);
        const clear = () => {
            for (const path of [this.area, this.marks, this.rise, this.fall, this.dots, this.referenceLine, this.active]) svgPut(path, 'd', null);
            this.places = [];
        };
        if (!known.length) return clear();

        const type = this.type;
        put(el, 'data-type', type);
        const pad = type === 'line' || type === 'area' ? look.marker / 2 + look.line : look.line;
        const reference = this.reference === 'average' ? known.reduce((a, b) => a + b, 0) / known.length : this.reference;
        let low = this.min ?? Math.min(...known, ...(reference === null ? [] : [reference]));
        let high = this.max ?? Math.max(...known, ...(reference === null ? [] : [reference]));
        if (type === 'bar' || type === 'winloss') {
            low = Math.min(low, 0);
            high = Math.max(high, 0);
        }
        if (low === high) {
            low -= 1;
            high += 1;
        }
        const y = type === 'winloss' ? linearScale(-1, 1, height - look.line, look.line) : linearScale(low, high, height - pad, pad);
        const count = values.length;
        this.places = [];

        if (type === 'bar' || type === 'winloss') {
            const step = width / count;
            const thick = Math.max(1, step - look.gap);
            let rise = '';
            let fall = '';
            let bars = '';
            const zero = y.at(0);
            values.forEach((v, i) => {
                const x = i * step + (step - thick) / 2;
                this.places.push({ x: x + thick / 2, y: v === null ? zero : y.at(type === 'winloss' ? Math.sign(v) : v) });
                if (v === null || v === 0) return;
                const tip = y.at(type === 'winloss' ? Math.sign(v) : v);
                const shape = barPath(x, Math.min(zero, tip), thick, Math.abs(zero - tip), look.radius, v > 0 ? 'top' : 'bottom');
                if (type === 'winloss') {
                    if (v > 0) rise += shape;
                    else fall += shape;
                } else bars += shape;
            });
            svgPut(this.marks, 'd', null);
            svgPut(this.area, 'd', bars || null);
            svgPut(this.rise, 'd', rise || null);
            svgPut(this.fall, 'd', fall || null);
        } else {
            const x = linearScale(0, Math.max(1, count - 1), pad, width - pad);
            let line = '';
            let area = '';
            let run: { x: number; y: number }[] = [];
            const flush = () => {
                if (!run.length) return;
                const kept = run.length > width * 2 ? thinOut(run, Math.ceil(width * 2), p => p.x, p => p.y) : run;
                const places = kept.map(p => [p.x, p.y] as Place);
                const upper = this.smooth ? smoothPath(places) : linePath(places);
                line += upper;
                if (type === 'area' && places.length > 1) area += areaPath(upper, linePath([...places].reverse().map(p => [p[0], height] as Place)));
                run = [];
            };
            values.forEach((v, i) => {
                const place = { x: x.at(i), y: v === null ? NaN : y.at(v) };
                this.places.push(place);
                if (v === null) flush();
                else run.push(place);
            });
            flush();
            svgPut(this.marks, 'd', line || null);
            svgPut(this.area, 'd', area || null);
            svgPut(this.rise, 'd', null);
            svgPut(this.fall, 'd', null);
        }

        // The values asked for get a dot, the latest one first among them.
        const dots: { x: number; y: number; r: number }[] = [];
        const index = (wanted: SparklineHighlight): number => {
            if (wanted === 'first') return values.findIndex(v => v !== null);
            if (wanted === 'last') return values.length - 1 - [...values].reverse().findIndex(v => v !== null);
            const target = wanted === 'min' ? Math.min(...known) : Math.max(...known);
            return values.indexOf(target);
        };
        for (const wanted of new Set(this.highlight)) {
            const i = index(wanted);
            if (i >= 0 && this.places[i] && Number.isFinite(this.places[i].y)) dots.push({ x: this.places[i].x, y: this.places[i].y, r: look.marker / 2 });
        }
        svgPut(this.dots, 'd', dots.length ? circlesPath(dots) : null);
        if (reference !== null && type !== 'winloss') {
            const at = Math.round(y.at(reference)) + 0.5;
            svgPut(this.referenceLine, 'd', `M0 ${at}H${width}`);
        } else svgPut(this.referenceLine, 'd', null);
        svgPut(this.active, 'd', null);
    }

    drawName(known: number[]): void {
        const name = this.label || uiLocale.strings.sparklineName;
        if (!known.length) {
            this.element.setAttribute('aria-label', name);
            return;
        }
        this.element.setAttribute('aria-label', uiLocale.text('sparklineSummary', {
            name,
            count: known.length,
            first: this.valueText(known[0]),
            last: this.valueText(known[known.length - 1]),
            min: this.valueText(Math.min(...known)),
            max: this.valueText(Math.max(...known))
        }));
    }

    pointed(e: PointerEvent): void {
        if (!this.tooltip || !this.places.length) return;
        const box = this.svg.getBoundingClientRect();
        const x = e.clientX - box.left;
        let best = -1;
        let distance = Infinity;
        this.places.forEach((p, i) => {
            if (this.values[i] === null) return;
            const d = Math.abs(p.x - x);
            if (d < distance) {
                distance = d;
                best = i;
            }
        });
        if (best < 0) return this.leave();
        const p = this.places[best];
        svgPut(this.active, 'd', circlesPath([{ x: p.x, y: p.y, r: (this.look?.marker ?? UNMEASURED.marker) / 2 }]));
        text(this.tip, this.valueText(this.values[best] as number));
        shown(this.tip, true);
        css(this.tip, 'left', `${Math.round(p.x)}px`);
    }

    leave(): void {
        svgPut(this.active, 'd', null);
        shown(this.tip, false);
    }
}
