import { nextId } from '../../core/next-id';
import { areaPath, barPath, circlesPath, linePath, roundRectPath, smoothPath, stepPath, type Place } from '../../parts/chart/chart-paths';
import { bandScale, linearScale, logScale, type ChartScale } from '../../parts/chart/chart-scale';
import { formatNumber, textWidth } from '../../parts/chart/chart-text';
import { logTicks, niceTicks } from '../../parts/chart/nice-ticks';
import { svgPart, svgPut, TextPool } from '../../parts/chart/svg-parts';
import { thinOut } from '../../parts/chart/thin-out';
import { timeTicks } from '../../parts/chart/time-ticks';
import type { ChartModel, ModelPoint, ModelSeries, ModelSlot } from './chart-model';
import type { ChartSeriesType } from './chart-series-type';
import { laneText, pointText, positionText } from './plot-text';
import type { HeatClass, PlotInput, PlotView, Rect } from './plot-view';

export type { PlotInput } from './plot-view';

interface SeriesPart {
    group: SVGGElement;
    area: SVGPathElement;
    bars: SVGPathElement;
    rise: SVGPathElement;
    fall: SVGPathElement;
    cells: SVGGElement;
    line: SVGPathElement;
    dots: SVGPathElement;
}

interface Tick {
    value: number;
    text: string;
}

const COMPACT_FROM = 10000;
/** What of a band the bars may fill: the rest is air between the bands. */
const BAND_FILL = 0.7;

const asNumber = (value: number | Date | undefined) => (value instanceof Date ? value.getTime() : value);

/** Types drawn as a bar in a band; they share the band with each other. */
const BANDED: ReadonlySet<ChartSeriesType> = new Set(['bar', 'rangeBar', 'candlestick', 'ohlc', 'waterfall']);
/** How many colors a heat map uses: past about seven, neighbors stop reading apart. */
const HEAT_STEPS = 7;

const heatOn = (model: ChartModel) => model.series.some(s => s.shown && s.type === 'heatmap');

/** The SVG of a chart: grid, marks, axes and what shows the value under the pointer. It reads a model and writes paths. */
export class ChartPlot implements PlotView {
    svg: SVGSVGElement;
    clip: SVGRectElement;
    grid: SVGPathElement;
    marks: SVGGElement;
    axis: SVGPathElement;
    xLabels: TextPool;
    yLabels: TextPool;
    titles: TextPool;
    dataLabels: TextPool;
    cross: SVGPathElement;
    activeBar: SVGPathElement;
    activeDots: SVGGElement;
    parts: SeriesPart[] = [];
    input: PlotInput | null = null;
    box: Rect = { left: 0, top: 0, width: 0, height: 0 };
    bars = new Map<ModelPoint, Rect>();
    order: ModelSlot[] = [];
    xFormat: Intl.DateTimeFormatOptions | undefined;
    /** The colors of a heat map, low to high, for its legend. */
    heatClasses: HeatClass[] = [];

    constructor(host: Element) {
        const svg = svgPart(host, 'svg', 'mx-chart__svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        this.svg = svg;
        const defs = svgPart(svg, 'defs');
        const clip = svgPart(defs, 'clipPath');
        const id = nextId('chart');
        clip.id = id;
        this.clip = svgPart(clip, 'rect');
        this.grid = svgPart(svg, 'path', 'mx-chart__grid');
        this.marks = svgPart(svg, 'g', 'mx-chart__marks');
        this.marks.setAttribute('clip-path', `url(#${id})`);
        this.axis = svgPart(svg, 'path', 'mx-chart__axis');
        this.xLabels = new TextPool(svgPart(svg, 'g', 'mx-chart__ticks'));
        this.yLabels = new TextPool(svgPart(svg, 'g', 'mx-chart__ticks'));
        this.titles = new TextPool(svgPart(svg, 'g', 'mx-chart__axis-title'));
        this.dataLabels = new TextPool(svgPart(svg, 'g', 'mx-chart__labels'));
        this.cross = svgPart(svg, 'path', 'mx-chart__crosshair');
        this.activeBar = svgPart(svg, 'path', 'mx-chart__active-bar');
        this.activeDots = svgPart(svg, 'g', 'mx-chart__active-dots');
    }

    /** The group whose style gives the font of the axis labels. */
    get labelGroup(): SVGGElement {
        return this.yLabels.group;
    }

    /** The position of a slot, as it reads. */
    xText(key: unknown, tick = false): string {
        return positionText(this.input!, key, tick ? this.xFormat : undefined);
    }

    /** A value of a series, as it reads. */
    valueText(point: ModelPoint): string {
        return pointText(this.input!, point);
    }

    markOfPoint(point: ModelPoint): string {
        const series = this.input!.model.series[point.series];
        if (series.type === 'heatmap') return this.heatColor(point.heat ?? 0);
        if (point.kind === 'rise') return 'var(--_chart-rise)';
        if (point.kind === 'fall') return 'var(--_chart-fall)';
        return markOf(series);
    }

    draw(input: PlotInput): void {
        this.input = input;
        const { model, xAxis, yAxis, horizontal, rtl, width, height, look } = input;
        const doc = this.svg.ownerDocument;
        svgPut(this.svg, 'viewBox', `0 0 ${width} ${height}`);
        svgPut(this.svg, 'width', width);
        svgPut(this.svg, 'height', height);

        const measure = (text: string) => textWidth(text, look.font, doc);
        const line = look.line;
        const xShown = xAxis.visible !== false;
        const yShown = yAxis.visible !== false;
        const xLabelsOn = xShown && xAxis.labels !== false;
        const yLabelsOn = yShown && yAxis.labels !== false;
        const xTitle = xShown ? (xAxis.title ?? '') : '';
        const yTitle = yShown ? (yAxis.title ?? '') : '';

        // Room for the labels depends on the ticks, and how many ticks fit on the room: an estimate is enough here.
        const valueLength = horizontal ? width * 0.8 : height - line * 3;
        const valueCount = yAxis.tickCount ?? Math.max(2, Math.floor(valueLength / (horizontal ? look.tickGap * 2 : look.tickGap)));
        const value = this.valueRange(valueCount);

        const positions = this.positionTicks(horizontal ? height : width, measure);
        const valueWide = yLabelsOn ? Math.max(0, ...value.ticks.map(t => measure(t.text))) : 0;
        const positionWide = xLabelsOn ? Math.max(0, ...positions.map(t => measure(t.text))) : 0;
        const angle = xAxis.labelAngle ?? 0;
        const turned = angle ? Math.abs(Math.sin((angle * Math.PI) / 180)) * positionWide + line : line;

        const titleRoom = (text: string) => (text ? line + look.tickPad : 0);
        let start: number;
        let end: number;
        let bottom: number;
        if (horizontal) {
            const wide = Math.min(positionWide, width * 0.3);
            start = (xLabelsOn ? wide + look.tickPad : 0) + titleRoom(xTitle);
            bottom = (yLabelsOn ? line + look.tickPad : 0) + titleRoom(yTitle);
            end = yLabelsOn ? measure(value.ticks.at(-1)?.text ?? '') / 2 : 0;
        } else {
            start = (yLabelsOn ? valueWide + look.tickPad : 0) + titleRoom(yTitle);
            bottom = (xLabelsOn ? turned + look.tickPad : 0) + titleRoom(xTitle);
            end = xLabelsOn && model.kind !== 'category' ? measure(positions.at(-1)?.text ?? '') / 2 : 0;
        }
        // The labels of the marks need their room too: the tallest bar often reaches the top of the axis.
        const labeled = model.series.filter(s => s.shown && s.source.labels && s.source.labels !== 'none');
        const labelRoom = labeled.length ? line + look.tickPad : 0;
        if (horizontal && labeled.length) end = Math.max(end, this.widestLabel(labeled, measure) + look.tickPad);
        const top = horizontal ? 0 : Math.max(yLabelsOn ? line / 2 : 0, labelRoom);
        const left = Math.round(rtl ? end : start);
        const right = Math.round(rtl ? start : end);
        const box: Rect = { left, top: Math.ceil(top), width: Math.max(1, width - left - right), height: Math.max(1, height - Math.ceil(top) - Math.ceil(bottom)) };
        this.box = box;
        const room = look.markerSize;
        svgPut(this.clip, 'x', box.left - room);
        svgPut(this.clip, 'y', box.top - room);
        svgPut(this.clip, 'width', box.width + room * 2);
        svgPut(this.clip, 'height', box.height + room * 2);

        const from = horizontal ? (rtl ? box.left + box.width : box.left) : box.top + box.height;
        const to = horizontal ? (rtl ? box.left : box.left + box.width) : box.top;
        const heat = heatOn(model);
        const valueScale = heat
            ? linearScale(value.min, value.max, horizontal ? from : to, horizontal ? to : from)
            : (yAxis.kind === 'log' ? logScale : linearScale)(value.min, value.max, yAxis.reversed ? to : from, yAxis.reversed ? from : to);
        this.heatClasses = heat ? this.classesOf(model) : [];
        const positionScale = this.positionScale(box);
        this.placePoints(positionScale, valueScale);

        this.drawGrid(value, valueScale, positions, positionScale);
        this.drawLabels(value.ticks, valueScale, positions, positionScale, measure, { xLabelsOn, yLabelsOn });
        this.drawTitles(xTitle, yTitle);
        this.drawSeries(positionScale, valueScale, measure);
        this.showActive(null, null, false);
    }

    widestLabel(series: readonly ModelSeries[], measure: (text: string) => number): number {
        let widest = 0;
        for (const s of series) for (const p of s.points) if (p.y !== null) widest = Math.max(widest, measure(this.valueText(p)));
        return widest;
    }

    valueRange(count: number): { min: number; max: number; ticks: Tick[] } {
        const { model, yAxis, locale } = this.input!;
        if (heatOn(model)) return { min: -0.5, max: Math.max(1, model.lanes.length) - 0.5, ticks: model.lanes.map((_, i) => ({ value: i, text: laneText(this.input!, i) })) };
        const low = model.any && Number.isFinite(model.yMin) ? model.yMin : 0;
        const high = model.any && Number.isFinite(model.yMax) ? model.yMax : 1;
        const fixedMin = asNumber(yAxis.min);
        const fixedMax = asNumber(yAxis.max);
        const given = fixedMin !== undefined && fixedMax !== undefined;
        let values: number[];
        let min: number;
        let max: number;
        if (model.percent) {
            values = [0, 25, 50, 75, 100];
            min = 0;
            max = 100;
        } else if (yAxis.kind === 'log') {
            min = fixedMin ?? 10 ** Math.floor(Math.log10(Math.max(low, 1e-12)));
            max = fixedMax ?? 10 ** Math.ceil(Math.log10(Math.max(high, min * 10)));
            values = logTicks(min, max);
        } else {
            values = niceTicks(fixedMin ?? low, fixedMax ?? high, count, given);
            min = fixedMin ?? values[0];
            max = fixedMax ?? values[values.length - 1];
            values = values.filter(v => v >= min && v <= max);
        }
        const biggest = Math.max(Math.abs(min), Math.abs(max));
        const fallback: Intl.NumberFormatOptions | undefined = biggest >= COMPACT_FROM ? { notation: 'compact', maximumFractionDigits: 1 } : undefined;
        const percent = (v: number) => new Intl.NumberFormat(locale, { style: 'percent' }).format(v / 100);
        const ticks = values.map(v => ({ value: v, text: model.percent ? percent(v) : formatNumber(v, yAxis.format, locale, fallback) }));
        return { min, max, ticks };
    }

    positionTicks(length: number, measure: (text: string) => number): Tick[] {
        const { model, xAxis, look } = this.input!;
        if (model.kind === 'category') return model.categories.map((key, i) => ({ value: i, text: this.xText(key, true) }));
        const low = asNumber(xAxis.min) ?? (Number.isFinite(model.xMin) ? model.xMin : 0);
        const high = asNumber(xAxis.max) ?? (Number.isFinite(model.xMax) ? model.xMax : 1);
        const sample = measure(this.xText(high, true));
        const count = xAxis.tickCount ?? Math.max(2, Math.floor(length / (sample + look.tickGap)));
        if (model.kind === 'time') {
            const { ticks, format } = timeTicks(low, high, count);
            this.xFormat = format;
            return ticks.map(value => ({ value, text: this.xText(value, true) }));
        }
        if (model.kind === 'log') return logTicks(Math.max(low, 1e-12), high).map(value => ({ value, text: this.xText(value, true) }));
        return niceTicks(low, high, count).map(value => ({ value, text: this.xText(value, true) }));
    }

    positionScale(box: Rect): ChartScale & { size?: number } {
        const { model, xAxis, horizontal, rtl, look } = this.input!;
        let start = horizontal ? box.top : box.left;
        let end = horizontal ? box.top + box.height : box.left + box.width;
        if ((rtl && !horizontal) !== !!xAxis.reversed) [start, end] = [end, start];
        if (model.kind === 'category') return bandScale(model.categories.length, start, end);
        let low = asNumber(xAxis.min);
        let high = asNumber(xAxis.max);
        if (low === undefined || high === undefined) {
            const ticks = model.kind === 'time' ? null : niceTicks(model.xMin, model.xMax, 5);
            low ??= ticks ? ticks[0] : model.xMin;
            high ??= ticks ? ticks[ticks.length - 1] : model.xMax;
        }
        if (low === high) high = low + 1;
        const pad = model.series.some(s => s.shown && s.type === 'bubble') ? Math.sign(end - start) * look.bubbleMax : 0;
        return (model.kind === 'log' ? logScale : linearScale)(low, high, start + pad, end - pad);
    }

    placePoints(position: ChartScale, value: ChartScale): void {
        const { model, horizontal } = this.input!;
        const bars = this.barLayout(position);
        this.bars.clear();
        for (const s of model.series) {
            if (!s.shown) continue;
            const offset = bars.offset.get(s.index) ?? 0;
            const own = s.type === 'rangeArea' || s.type === 'rangeBar' || s.type === 'candlestick' || s.type === 'ohlc';
            for (const p of s.points) {
                const along = position.at(p.x) + offset;
                const across = value.at(s.type === 'heatmap' ? p.lane : own ? (p.y ?? 0) : p.to);
                p.px = horizontal ? across : along;
                p.py = horizontal ? along : across;
                if (p.y === null) continue;
                if (s.type === 'heatmap') this.bars.set(p, this.cellRect(along, across, position, value));
                else if (BANDED.has(s.type)) this.bars.set(p, this.barRect(along, value.at(p.from), value.at(p.to), bars.thick, p));
            }
        }
        for (const slot of model.slots) slot.at = position.at(slot.x);
        this.order = [...model.slots].sort((a, b) => a.at - b.at);
    }

    barLayout(position: ChartScale & { size?: number }): { thick: number; offset: Map<number, number> } {
        const { model, look } = this.input!;
        const groups: string[] = [];
        const groupOf = new Map<number, number>();
        for (const s of model.series) {
            if (!s.shown || !BANDED.has(s.type)) continue;
            const key = s.stack ?? `alone:${s.index}`;
            if (!groups.includes(key)) groups.push(key);
            groupOf.set(s.index, groups.indexOf(key));
        }
        const count = groups.length;
        const band = position.size ?? 0;
        const gaps = look.barGap * Math.max(0, count - 1);
        const thick = Math.max(1, Math.min(look.barWidth, (band * BAND_FILL - gaps) / Math.max(1, count)));
        const total = thick * count + gaps;
        const offset = new Map<number, number>();
        for (const [series, group] of groupOf) offset.set(series, group * (thick + look.barGap) + thick / 2 - total / 2);
        return { thick, offset };
    }

    // `along` is the middle of the bar. A piece inside a stack leaves a gap at its far end.
    barRect(along: number, base: number, tip: number, thick: number, point: ModelPoint): Rect {
        const { horizontal, look } = this.input!;
        const direction = Math.sign(tip - base);
        const room = point.outer ? 0 : look.barGap;
        const end = Math.abs(tip - base) > room * 2 ? tip - direction * room : tip;
        const low = Math.min(base, end);
        const size = Math.abs(end - base);
        return horizontal ? { left: low, top: along - thick / 2, width: size, height: thick } : { left: along - thick / 2, top: low, width: thick, height: size };
    }

    /** A cell of a heat map: its column's band, its row's band, a gap around it. */
    cellRect(along: number, across: number, position: ChartScale & { size?: number }, value: ChartScale): Rect {
        const { horizontal, look } = this.input!;
        const gap = look.barGap;
        const band = position.size ?? 0;
        const lane = Math.abs(value.at(1) - value.at(0));
        const w = Math.max(1, band - gap);
        const h = Math.max(1, lane - gap);
        return horizontal ? { left: across - h / 2, top: along - w / 2, width: h, height: w } : { left: along - w / 2, top: across - h / 2, width: w, height: h };
    }

    /** Seven classes from low to high; across zero, two hues that meet in a neutral middle. */
    classesOf(model: ChartModel): HeatClass[] {
        const { heatMin: min, heatMax: max } = model;
        if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
        const out: HeatClass[] = [];
        if (min < 0 && max > 0) {
            const reach = Math.max(-min, max);
            const step = (reach * 2) / HEAT_STEPS;
            for (let i = 0; i < HEAT_STEPS; i++) {
                const from = -reach + i * step;
                const middle = from + step / 2;
                const strength = Math.round((Math.abs(middle) / reach) * 100);
                const pole = middle < 0 ? 'negative' : 'positive';
                out.push({ from, to: from + step, color: `color-mix(in oklab, var(--_chart-scale-${pole}) ${strength}%, var(--_chart-scale-middle))` });
            }
            return out;
        }
        const step = (max - min) / HEAT_STEPS || 1;
        for (let i = 0; i < HEAT_STEPS; i++) {
            const strength = Math.round(((i + 0.5) / HEAT_STEPS) * 100);
            out.push({ from: min + i * step, to: min + (i + 1) * step, color: `color-mix(in oklab, var(--_chart-scale-high) ${strength}%, var(--_chart-scale-low))` });
            if (max === min) break;
        }
        return out;
    }

    classIndex(value: number): number {
        const classes = this.heatClasses;
        if (!classes.length) return 0;
        const first = classes[0].from;
        const step = classes[0].to - first || 1;
        return Math.max(0, Math.min(classes.length - 1, Math.floor((value - first) / step)));
    }

    heatColor(value: number): string {
        return this.heatClasses[this.classIndex(value)]?.color ?? 'transparent';
    }

    drawGrid(range: { min: number; max: number; ticks: Tick[] }, value: ChartScale, positions: Tick[], position: ChartScale): void {
        const { model, xAxis, yAxis, horizontal } = this.input!;
        const box = this.box;
        const edge = (v: number) => Math.round(v) + 0.5;
        const across = (at: number) => (horizontal ? `M${edge(at)} ${box.top}v${box.height}` : `M${box.left} ${edge(at)}h${box.width}`);
        const down = (at: number) => (horizontal ? `M${box.left} ${edge(at)}h${box.width}` : `M${edge(at)} ${box.top}v${box.height}`);
        let grid = '';
        if (heatOn(model)) {
            svgPut(this.grid, 'd', null);
            svgPut(this.axis, 'd', null);
            return;
        }
        if (yAxis.grid !== false) for (const t of range.ticks) grid += across(value.at(t.value));
        if (xAxis.grid ?? (model.kind === 'linear' && !model.hasBars)) for (const t of positions) grid += down(position.at(t.value));
        svgPut(this.grid, 'd', grid);

        let axis = '';
        if (xAxis.visible !== false && (xAxis.line ?? true)) {
            // The line stands on zero when zero is in view, or else on the edge.
            const zero = value.at(yAxis.kind === 'log' ? range.min : Math.max(range.min, Math.min(0, range.max)));
            axis += across(zero);
        }
        if (yAxis.visible !== false && yAxis.line) {
            const side = horizontal ? box.top + box.height : this.input!.rtl ? box.left + box.width : box.left;
            axis += horizontal ? `M${box.left} ${edge(side)}h${box.width}` : `M${edge(side)} ${box.top}v${box.height}`;
        }
        svgPut(this.axis, 'd', axis);
    }

    drawLabels(valueTicks: Tick[], value: ChartScale, positions: Tick[], position: ChartScale & { size?: number }, measure: (text: string) => number, on: { xLabelsOn: boolean; yLabelsOn: boolean }): void {
        const { xAxis, horizontal, rtl, look } = this.input!;
        const box = this.box;
        const line = look.line;
        const baseline = line * 0.34;
        const beside = rtl ? box.left + box.width + look.tickPad : box.left - look.tickPad;
        const besideAnchor = rtl ? 'start' : 'end';
        const under = box.top + box.height + look.tickPad + line * 0.8;

        if (on.yLabelsOn) {
            for (const t of valueTicks) {
                if (horizontal) this.yLabels.add(t.text, value.at(t.value), under, 'middle');
                else this.yLabels.add(t.text, beside, value.at(t.value) + baseline, besideAnchor);
            }
        }
        this.yLabels.done();

        if (on.xLabelsOn && positions.length) {
            if (horizontal) {
                const most = Math.max(line, position.size ?? line);
                const every = Math.max(1, Math.ceil(line / most));
                const wide = box.left - look.tickPad;
                positions.forEach((t, i) => {
                    if (i % every) return;
                    this.xLabels.add(fit(t.text, rtl ? this.input!.width - box.left - box.width - look.tickPad : wide, measure), beside, position.at(t.value) + baseline, besideAnchor);
                });
            } else {
                const widest = Math.max(...positions.map(t => measure(t.text)));
                const angle = xAxis.labelAngle ?? 0;
                const needed = angle ? line * 1.2 : widest + look.tickGap / 2;
                const spacing = positions.length > 1 ? Math.abs(position.at(positions[1].value) - position.at(positions[0].value)) : box.width;
                const every = Math.max(1, Math.ceil(needed / Math.max(1, spacing)));
                positions.forEach((t, i) => {
                    if (i % every) return;
                    const x = position.at(t.value);
                    const label = this.xLabels.add(t.text, x, under, angle ? (angle < 0 ? 'end' : 'start') : 'middle');
                    if (angle) label.setAttribute('transform', `rotate(${angle} ${Math.round(x)} ${Math.round(under)})`);
                });
            }
        }
        this.xLabels.done();
    }

    drawTitles(xTitle: string, yTitle: string): void {
        const { horizontal, rtl, width, height, look } = this.input!;
        const box = this.box;
        const middleX = box.left + box.width / 2;
        const middleY = box.top + box.height / 2;
        const bottom = height - look.line * 0.25;
        const side = rtl ? width - look.line * 0.75 : look.line * 0.75;
        const standing = (text: string) => {
            const el = this.titles.add(text, side, middleY, 'middle');
            el.setAttribute('transform', `rotate(${rtl ? 90 : -90} ${Math.round(side)} ${Math.round(middleY)})`);
        };
        if (xTitle) {
            if (horizontal) standing(xTitle);
            else this.titles.add(xTitle, middleX, bottom, 'middle');
        }
        if (yTitle) {
            if (horizontal) this.titles.add(yTitle, middleX, bottom, 'middle');
            else standing(yTitle);
        }
        this.titles.done();
    }

    partOf(s: ModelSeries): SeriesPart {
        let part = this.parts[s.index];
        if (!part) {
            const group = svgPart(this.marks, 'g', 'mx-chart__series');
            part = {
                group,
                area: svgPart(group, 'path', 'mx-chart__area'),
                bars: svgPart(group, 'path', 'mx-chart__bars'),
                rise: svgPart(group, 'path', 'mx-chart__rise'),
                fall: svgPart(group, 'path', 'mx-chart__fall'),
                cells: svgPart(group, 'g', 'mx-chart__cells'),
                line: svgPart(group, 'path', 'mx-chart__line'),
                dots: svgPart(group, 'path', 'mx-chart__dots')
            };
            this.parts[s.index] = part;
        }
        return part;
    }

    drawSeries(position: ChartScale, value: ChartScale, measure: (text: string) => number): void {
        const { model } = this.input!;
        const taken: Rect[] = [];
        for (const part of this.parts.splice(model.series.length)) part.group.remove();
        for (const s of model.series) {
            const part = this.partOf(s);
            svgPut(part.group, 'data-type', s.type);
            part.group.style.setProperty('--_mark', markOf(s));
            part.group.style.display = s.shown ? '' : 'none';
            svgPut(part.line, 'stroke-dasharray', s.wrapped ? '6 4' : null);
            if (!s.shown) continue;
            this.drawSeriesMarks(s, part, value);
            if (s.source.labels && s.source.labels !== 'none') {
                if (s.type === 'heatmap') this.drawCellLabels(s, measure);
                else this.drawDataLabels(s, measure, taken);
            }
        }
        this.dataLabels.done();
    }

    drawSeriesMarks(s: ModelSeries, part: SeriesPart, value: ChartScale): void {
        const { horizontal, look } = this.input!;
        let line = '';
        let area = '';
        let bars = '';
        let rise = '';
        let fall = '';
        const dots: { x: number; y: number; r: number }[] = [];
        const radius = look.markerSize / 2;
        const cells = new Map<number, string>();

        if (s.type === 'heatmap') {
            for (const p of s.points) {
                const rect = this.bars.get(p);
                if (!rect || p.heat === null) continue;
                const index = this.classIndex(p.heat);
                cells.set(index, (cells.get(index) ?? '') + roundRectPath(rect.left, rect.top, rect.width, rect.height, look.cellRadius));
            }
        } else if (s.type === 'rangeBar') {
            for (const p of s.points) {
                const rect = this.bars.get(p);
                if (rect) bars += roundRectPath(rect.left, rect.top, rect.width, rect.height, look.barRadius);
            }
        } else if (s.type === 'waterfall') {
            let last: Rect | null = null;
            let lastEnd = 0;
            for (const p of s.points) {
                const rect = this.bars.get(p);
                if (!rect) continue;
                const shape = barPath(rect.left, rect.top, rect.width, rect.height, look.barRadius, p.kind === 'total' ? this.endOf(p, value) : null);
                if (p.kind === 'rise') rise += shape;
                else if (p.kind === 'fall') fall += shape;
                else bars += shape;
                // A thin line carries the running total from one step to the next.
                if (last) {
                    const at = Math.round(value.at(lastEnd)) + 0.5;
                    line += horizontal ? `M${at} ${last.top + last.height}V${rect.top}` : `M${last.left + last.width} ${at}H${rect.left}`;
                }
                last = rect;
                lastEnd = p.to;
            }
        } else if (s.type === 'candlestick' || s.type === 'ohlc') {
            for (const p of s.points) {
                const rect = this.bars.get(p);
                if (!rect || p.open === null || p.close === null || p.high === null || p.low === null) continue;
                const shape = this.candlePath(p, rect, value, s.type === 'ohlc');
                if (p.kind === 'rise') rise += shape;
                else fall += shape;
            }
        } else if (s.type === 'rangeArea') {
            for (const run of this.runsOf(s)) {
                const upper = this.pathOf(s, run.map(p => [p.px, p.py] as Place), horizontal);
                const lower = [...run].reverse().map(p => (horizontal ? [value.at(p.from), p.py] : [p.px, value.at(p.from)]) as Place);
                const lowerPath = this.pathOf(s, lower, horizontal);
                line += upper + lowerPath;
                area += areaPath(upper, lowerPath);
            }
        } else if (s.type === 'bar') {
            for (const p of s.points) {
                const rect = this.bars.get(p);
                if (!rect || !p.to) continue;
                bars += barPath(rect.left, rect.top, rect.width, rect.height, look.barRadius, p.outer ? this.endOf(p, value) : null);
            }
        } else if (s.type === 'scatter' || s.type === 'bubble') {
            for (const p of s.points) if (p.y !== null) dots.push({ x: p.px, y: p.py, r: s.type === 'bubble' ? this.bubbleRadius(p) : radius });
        } else {
            for (const run of this.runsOf(s)) {
                const places = run.map(p => [p.px, p.py] as Place);
                const upper = this.pathOf(s, places, horizontal);
                line += upper;
                if (run.length === 1) dots.push({ x: run[0].px, y: run[0].py, r: radius });
                if (s.type === 'area' && run.length > 1) {
                    const lower = [...run].reverse().map(p => (horizontal ? [value.at(p.from), p.py] : [p.px, value.at(p.from)]) as Place);
                    area += areaPath(upper, this.pathOf(s, lower, horizontal));
                }
                if (s.source.markers) for (const p of run) dots.push({ x: p.px, y: p.py, r: radius });
            }
        }
        svgPut(part.line, 'd', line);
        svgPut(part.area, 'd', area);
        svgPut(part.bars, 'd', bars);
        svgPut(part.rise, 'd', rise);
        svgPut(part.fall, 'd', fall);
        svgPut(part.dots, 'd', circlesPath(dots));
        this.drawCells(part.cells, cells);
    }

    /** One path for each color of a heat map. */
    drawCells(group: SVGGElement, cells: Map<number, string>): void {
        const used = [...cells.keys()].sort((a, b) => a - b);
        while (group.children.length > used.length) group.lastElementChild!.remove();
        used.forEach((index, i) => {
            const path = (group.children[i] as SVGPathElement | undefined) ?? svgPart(group, 'path', 'mx-chart__cell');
            path.style.setProperty('--_mark', this.heatClasses[index].color);
            svgPut(path, 'd', cells.get(index)!);
        });
    }

    /** A candle: its body from the first price to the last, and its wick from the lowest to the highest. An OHLC bar: ticks for the first and the last. */
    candlePath(p: ModelPoint, rect: Rect, value: ChartScale, ticks: boolean): string {
        const { horizontal } = this.input!;
        const o = value.at(p.open!);
        const c = value.at(p.close!);
        const h = value.at(p.high!);
        const l = value.at(p.low!);
        const n = (v: number) => Math.round(v * 10) / 10;
        if (horizontal) {
            const middle = n(rect.top + rect.height / 2);
            if (ticks) return `M${n(l)} ${middle}H${n(h)}M${n(o)} ${middle}V${n(rect.top)}M${n(c)} ${middle}V${n(rect.top + rect.height)}`;
            return `M${n(l)} ${middle}H${n(Math.min(o, c))}M${n(Math.max(o, c))} ${middle}H${n(h)}` + `M${n(Math.min(o, c))} ${n(rect.top)}H${n(Math.max(o, c))}V${n(rect.top + rect.height)}H${n(Math.min(o, c))}Z`;
        }
        const middle = n(rect.left + rect.width / 2);
        if (ticks) return `M${middle} ${n(h)}V${n(l)}M${middle} ${n(o)}H${n(rect.left)}M${middle} ${n(c)}H${n(rect.left + rect.width)}`;
        const top = Math.min(o, c);
        const bottom = Math.max(o, c, top + 1);
        return `M${middle} ${n(h)}V${n(top)}M${middle} ${n(bottom)}V${n(l)}` + `M${n(rect.left)} ${n(top)}H${n(rect.left + rect.width)}V${n(bottom)}H${n(rect.left)}Z`;
    }

    pathOf(s: ModelSeries, places: readonly Place[], sideways: boolean): string {
        if (s.source.step) return stepPath(places, s.source.step, sideways);
        if (s.source.smooth) return smoothPath(places, sideways);
        return linePath(places);
    }

    /** Stretches of a line between empty values, each thinned to what the width can show. */
    runsOf(s: ModelSeries): ModelPoint[][] {
        const { horizontal } = this.input!;
        const length = horizontal ? this.box.height : this.box.width;
        const runs: ModelPoint[][] = [];
        let run: ModelPoint[] = [];
        for (const p of s.points) {
            if (p.y !== null) run.push(p);
            else if (s.source.gaps !== 'connect' && run.length) {
                runs.push(run);
                run = [];
            }
        }
        if (run.length) runs.push(run);
        const most = Math.ceil(length * 2);
        return runs.map(r => (r.length > most ? thinOut(r, most, p => (horizontal ? p.py : p.px), p => (horizontal ? p.px : p.py)) : r));
    }

    endOf(p: ModelPoint, value: ChartScale): 'top' | 'bottom' | 'left' | 'right' | null {
        const { horizontal } = this.input!;
        const grows = value.at(p.to) - value.at(p.from);
        if (!grows) return null;
        if (horizontal) return grows > 0 ? 'right' : 'left';
        return grows < 0 ? 'top' : 'bottom';
    }

    bubbleRadius(p: ModelPoint): number {
        const { model, look } = this.input!;
        if (p.size === null || !Number.isFinite(model.sizeMax)) return look.bubbleMin;
        // By area: a value twice as large looks twice as large.
        const share = model.sizeMax === model.sizeMin ? 1 : Math.sqrt(Math.max(0, (p.size - model.sizeMin) / (model.sizeMax - model.sizeMin)));
        return look.bubbleMin + share * (look.bubbleMax - look.bubbleMin);
    }

    drawDataLabels(s: ModelSeries, measure: (text: string) => number, taken: Rect[]): void {
        const { look, horizontal, rtl } = this.input!;
        const points = s.points.filter(p => p.y !== null);
        if (!points.length) return;
        let chosen = points;
        if (s.source.labels === 'last') chosen = [points[points.length - 1]];
        else if (s.source.labels === 'extremes') {
            const sorted = [...points].sort((a, b) => (a.y as number) - (b.y as number));
            chosen = sorted[0] === sorted[sorted.length - 1] ? [sorted[0]] : [sorted[0], sorted[sorted.length - 1]];
        }
        const line = look.line;
        const gap = look.tickPad;
        for (const p of chosen) {
            const text = this.valueText(p);
            const wide = measure(text);
            const rect = this.bars.get(p);
            let x = p.px;
            let y = p.py - gap;
            let anchor: 'start' | 'middle' | 'end' = 'middle';
            if (rect && horizontal) {
                const forward = (p.to >= p.from) !== rtl;
                x = forward ? rect.left + rect.width + gap : rect.left - gap;
                y = rect.top + rect.height / 2 + line * 0.34;
                anchor = forward ? 'start' : 'end';
            } else if (rect) {
                x = rect.left + rect.width / 2;
                y = p.to >= p.from ? rect.top - gap : rect.top + rect.height + gap + line * 0.75;
            }
            // At the far edge a label moves inside rather than being cut.
            if (anchor === 'middle' && x + wide / 2 > this.input!.width) {
                x = this.input!.width;
                anchor = 'end';
            } else if (anchor === 'middle' && x - wide / 2 < 0) {
                x = 0;
                anchor = 'start';
            }
            const left = anchor === 'middle' ? x - wide / 2 : anchor === 'end' ? x - wide : x;
            const place = { left, top: y - line * 0.8, width: wide, height: line };
            // A label that does not fit or would cover another is left out: the value stays in the tooltip and the table.
            const fits = left >= 0 && left + wide <= this.input!.width && place.top >= 0 && place.top + line <= this.input!.height;
            if (!fits || taken.some(t => overlaps(t, place))) continue;
            taken.push(place);
            this.dataLabels.add(text, x, y, anchor);
        }
    }

    /** The value in each cell of a heat map, where it fits. */
    drawCellLabels(s: ModelSeries, measure: (text: string) => number): void {
        const { look } = this.input!;
        for (const p of s.points) {
            const rect = this.bars.get(p);
            if (!rect) continue;
            const text = this.valueText(p);
            if (measure(text) + look.tickPad > rect.width || look.line > rect.height) continue;
            this.dataLabels.add(text, rect.left + rect.width / 2, rect.top + rect.height / 2 + look.line * 0.34, 'middle');
        }
    }

    /** The slot and value nearest to a place in the SVG, or null when nothing is near. */
    find(x: number, y: number): { slot: ModelSlot; point: ModelPoint | null } | null {
        const input = this.input;
        if (!input?.model.any) return null;
        const { model, horizontal, look } = input;
        const box = this.box;
        const room = look.hitSize / 2;
        if (x < box.left - room || x > box.left + box.width + room || y < box.top - room || y > box.top + box.height + room) return null;
        const onlyDots = model.series.every(s => !s.shown || s.type === 'scatter' || s.type === 'bubble');
        if (onlyDots) return this.findDot(x, y);
        const slot = this.nearestSlot(horizontal ? y : x);
        if (!slot) return null;
        let point: ModelPoint | null = null;
        let best = Infinity;
        for (const p of slot.points) {
            const rect = this.bars.get(p);
            if (rect) {
                if (x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height) return { slot, point: p };
                continue;
            }
            const distance = horizontal ? Math.abs(p.px - x) : Math.abs(p.py - y);
            if (distance < best) {
                best = distance;
                point = p;
            }
        }
        return { slot, point };
    }

    nearestSlot(at: number): ModelSlot | null {
        const order = this.order;
        if (!order.length) return null;
        let low = 0;
        let high = order.length - 1;
        while (low < high) {
            const middle = (low + high) >> 1;
            if (order[middle].at < at) low = middle + 1;
            else high = middle;
        }
        if (low > 0 && at - order[low - 1].at < order[low].at - at) low--;
        return order[low];
    }

    // The nearest dot only: at a distance a dot is not what the pointer means, so its circle of reach is limited.
    findDot(x: number, y: number): { slot: ModelSlot; point: ModelPoint } | null {
        const { model, look } = this.input!;
        let found: { slot: ModelSlot; point: ModelPoint } | null = null;
        let best = Infinity;
        for (const slot of model.slots) {
            for (const p of slot.points) {
                const series = model.series[p.series];
                const reach = Math.max(look.hitSize / 2, series.type === 'bubble' ? this.bubbleRadius(p) : 0);
                const distance = Math.hypot(p.px - x, p.py - y);
                if (distance <= reach && distance < best) {
                    best = distance;
                    found = { slot, point: p };
                }
            }
        }
        return found;
    }

    /** Shows a position and a value, or nothing. */
    showActive(slot: ModelSlot | null, point: ModelPoint | null, crosshair: boolean): void {
        const input = this.input;
        const box = this.box;
        if (!slot || !input) {
            svgPut(this.cross, 'd', null);
            svgPut(this.activeBar, 'd', null);
            this.activeDots.replaceChildren();
            return;
        }
        const { model, horizontal, look } = input;
        const lines = slot.points.some(p => {
            const type = model.series[p.series].type;
            return type === 'line' || type === 'area' || type === 'rangeArea';
        });
        const at = Math.round(slot.at) + 0.5;
        svgPut(this.cross, 'd', crosshair && lines ? (horizontal ? `M${box.left} ${at}h${box.width}` : `M${at} ${box.top}v${box.height}`) : null);
        const rect = point ? this.bars.get(point) : undefined;
        svgPut(this.activeBar, 'd', rect ? `M${rect.left} ${rect.top}h${rect.width}v${rect.height}h${-rect.width}z` : null);
        const dots = this.activeDots;
        const wanted = slot.points.filter(p => {
            const type = model.series[p.series].type;
            return type === 'line' || type === 'area' || type === 'rangeArea' || p === point;
        }).filter(p => !this.bars.has(p));
        while (dots.children.length > wanted.length) dots.lastElementChild!.remove();
        wanted.forEach((p, i) => {
            const series = model.series[p.series];
            const dot = (dots.children[i] as SVGPathElement | undefined) ?? svgPart(dots, 'path', 'mx-chart__active-dot');
            dot.style.setProperty('--_mark', this.markOfPoint(p));
            const r = series.type === 'bubble' ? this.bubbleRadius(p) : look.markerSize / 2 + (p === point ? 1 : 0);
            svgPut(dot, 'd', circlesPath([{ x: p.px, y: p.py, r }]));
        });
    }
}

/** The color of a series: its own, or the one of its place. */
export function markOf(s: ModelSeries): string {
    return s.source.color ?? `var(--_chart-series-${s.slot + 1})`;
}

function overlaps(a: Rect, b: Rect): boolean {
    return a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;
}

// A label cut with an ellipsis to the room it has: the whole text stays in the tooltip and the table.
function fit(text: string, room: number, measure: (text: string) => number): string {
    if (measure(text) <= room) return text;
    let end = text.length;
    while (end > 1 && measure(`${text.slice(0, end)}…`) > room) end--;
    return `${text.slice(0, end).trimEnd()}…`;
}
