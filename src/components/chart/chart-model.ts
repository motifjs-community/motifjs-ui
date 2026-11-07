import type { ChartAxis } from './chart-axis';
import type { ChartAxisKind } from './chart-axis-kind';
import type { ChartField } from './chart-field';
import type { ChartSeries } from './chart-series';
import type { ChartSeriesType } from './chart-series-type';
import type { ChartStacked } from './chart-stacked';

/** A value of a series, placed: nothing here is the developer's object except `row`. */
export interface ModelPoint {
    series: number;
    index: number;
    key: unknown;
    /** Its position: a category's number, a number, or a moment. */
    x: number;
    /** The value as given; null when there is none. */
    y: number | null;
    /** Where it starts and ends on the value axis, once stacked. */
    from: number;
    to: number;
    /** It is the far end of its stack. */
    outer: boolean;
    size: number | null;
    /** The ends of a range, and the four prices of a candle. */
    low: number | null;
    high: number | null;
    open: number | null;
    close: number | null;
    /** A step of a waterfall goes up or down, or is a total; a candle rises or falls. */
    kind: 'rise' | 'fall' | 'total' | null;
    /** The row of a heat map, and the value its color shows. */
    lane: number;
    heat: number | null;
    /** Its share of the whole, for the parts of one. */
    share: number | null;
    /** A part the reader hid in the legend. */
    off: boolean;
    row: unknown;
    /** Its place on the page, once drawn. */
    px: number;
    py: number;
}

/** A series, read. */
export interface ModelSeries {
    source: ChartSeries;
    index: number;
    name: string;
    type: ChartSeriesType;
    /** Which of the eight colors, kept when others are hidden. */
    slot: number;
    /** It came round the colors once at least: a dash tells it from the first. */
    wrapped: boolean;
    shown: boolean;
    /** What it stacks with; null alone. */
    stack: string | null;
    points: ModelPoint[];
}

/** The points at a position. */
export interface ModelSlot {
    x: number;
    key: unknown;
    points: ModelPoint[];
    at: number;
}

/** Which way a chart draws: on two axes, as the parts of a whole, or around a center. */
export type ChartFamily = 'cartesian' | 'parts' | 'radar';

/** What a chart draws. */
export interface ChartModel {
    family: ChartFamily;
    kind: Exclude<ChartAxisKind, 'auto'>;
    categories: unknown[];
    /** The rows of a heat map, top to bottom. */
    lanes: unknown[];
    series: ModelSeries[];
    slots: ModelSlot[];
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    heatMin: number;
    heatMax: number;
    /** The whole the parts make, without the ones hidden. */
    total: number;
    /** There is at least one value to draw. */
    any: boolean;
    percent: boolean;
    hasBars: boolean;
    sizeMax: number;
    sizeMin: number;
}

/** What a model is made from. */
export interface ModelInput {
    rows: readonly unknown[];
    series: readonly ChartSeries[];
    xField: ChartField<any> | null;
    xAxis: ChartAxis;
    yAxis: ChartAxis;
    stacked: ChartStacked;
    /** Series the reader hid, by their place. */
    hidden: ReadonlySet<number>;
    /** Parts of a pie, donut or funnel the reader hid, by their row. */
    hiddenParts?: ReadonlySet<number>;
}

const COLORS = 8;

/** Types that draw a bar in a band, whatever the positions are. */
const BANDED: ReadonlySet<ChartSeriesType> = new Set(['bar', 'rangeBar', 'candlestick', 'ohlc', 'waterfall', 'heatmap']);
/** Types whose start counts in the range of values, not only their end. */
const FROM_TOO: ReadonlySet<ChartSeriesType> = new Set(['bar', 'area', 'rangeBar', 'rangeArea', 'candlestick', 'ohlc', 'waterfall']);

/** The family a type belongs to. */
export function familyOf(type: ChartSeriesType): ChartFamily {
    if (type === 'pie' || type === 'donut' || type === 'funnel') return 'parts';
    return type === 'radar' ? 'radar' : 'cartesian';
}

function read(row: unknown, field: ChartField<any> | null | undefined): unknown {
    if (field === null || field === undefined) return undefined;
    return typeof field === 'function' ? field(row) : (row as Record<string, unknown>)[field];
}

function numberOf(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const number = value instanceof Date ? value.getTime() : Number(value);
    return Number.isFinite(number) ? number : null;
}

// Numbers along the bottom of a line are often years or codes: only what plots two numbers treats them as a scale.
function kindOf(axis: ChartAxis, keys: readonly unknown[], types: ReadonlySet<ChartSeriesType>): ChartModel['kind'] {
    if (axis.kind && axis.kind !== 'auto') return axis.kind;
    if ([...types].some(t => BANDED.has(t) || familyOf(t) !== 'cartesian') || !keys.length) return 'category';
    if (keys.every(key => key instanceof Date)) return 'time';
    if ((types.has('scatter') || types.has('bubble')) && keys.every(key => typeof key === 'number')) return 'linear';
    return 'category';
}

function placer(): { list: unknown[]; at: (key: unknown) => number } {
    const list: unknown[] = [];
    const places = new Map<unknown, number>();
    return {
        list,
        at: key => {
            const name = key instanceof Date ? key.getTime() : key;
            let place = places.get(name);
            if (place === undefined) {
                place = list.length;
                places.set(name, place);
                list.push(key);
            }
            return place;
        }
    };
}

/** Reads the series into a model of its own: the rows are read and left as they are. */
export function buildModel(input: ModelInput): ChartModel {
    const { rows, xField, xAxis, stacked, hidden } = input;
    const hiddenParts = input.hiddenParts ?? new Set<number>();
    const shape = input.series.map((source, index) => {
        const own = source.data ?? rows;
        const shown = source.visible !== false && !hidden.has(index);
        const field = source.xField ?? xField;
        const keys = own.map((row, i) => (field === null || field === undefined ? i + 1 : read(row, field)));
        return { source, index, own, shown, keys };
    });

    const live = shape.filter(s => s.shown);
    const family = familyOf(live[0]?.source.type ?? 'line');
    // A chart draws one family: what does not belong to it is left out, and a whole has one series.
    const belongs = (type: ChartSeriesType) => familyOf(type) === family;
    let partsTaken = false;
    for (const s of shape) {
        if (!s.shown) continue;
        const type = s.source.type ?? 'line';
        if (!belongs(type) || (family === 'parts' && partsTaken)) s.shown = false;
        if (family === 'parts' && s.shown) partsTaken = true;
    }
    const drawn = shape.filter(s => s.shown);
    const types = new Set(drawn.map(s => s.source.type ?? 'line'));
    const kind = kindOf(xAxis, drawn.flatMap(s => s.keys), types);

    const columns = placer();
    const lanes = placer();
    const positionOf = (key: unknown, i: number): number => (kind === 'category' ? columns.at(key) : (numberOf(key) ?? i));

    const series: ModelSeries[] = shape.map(s => {
        const { source, index, own, keys } = s;
        const type = source.type ?? 'line';
        const stackable = type === 'bar' || type === 'area';
        const wanted = source.stack ?? (stacked ? true : false);
        const stack = stackable && wanted ? `${type}:${wanted === true ? '' : wanted}` : null;
        let running = 0;
        const points: ModelPoint[] = own.map((row, i) => {
            const point: ModelPoint = { series: index, index: i, key: keys[i], x: -1, y: null, from: 0, to: 0, outer: true, size: numberOf(read(row, source.sizeField)), low: null, high: null, open: null, close: null, kind: null, lane: 0, heat: null, share: null, off: false, row, px: 0, py: 0 };
            if (s.shown || kind !== 'category') point.x = family === 'parts' ? i : positionOf(keys[i], i);
            if (type === 'rangeArea' || type === 'rangeBar') {
                point.low = numberOf(read(row, source.lowField));
                point.high = numberOf(read(row, source.highField));
                if (point.low !== null && point.high !== null) {
                    point.y = point.high;
                    point.from = Math.min(point.low, point.high);
                    point.to = Math.max(point.low, point.high);
                }
            } else if (type === 'candlestick' || type === 'ohlc') {
                point.open = numberOf(read(row, source.openField));
                point.high = numberOf(read(row, source.highField));
                point.low = numberOf(read(row, source.lowField));
                point.close = numberOf(read(row, source.closeField));
                if (point.open !== null && point.close !== null && point.high !== null && point.low !== null) {
                    point.y = point.close;
                    point.from = Math.min(point.low, point.open, point.close);
                    point.to = Math.max(point.high, point.open, point.close);
                    point.kind = point.close >= point.open ? 'rise' : 'fall';
                }
            } else if (type === 'heatmap') {
                const lane = read(row, source.yField);
                point.heat = numberOf(read(row, source.valueField));
                if (lane !== null && lane !== undefined && point.heat !== null && s.shown) {
                    point.lane = lanes.at(lane);
                    point.y = point.lane;
                    point.from = point.to = point.lane;
                }
            } else if (type === 'waterfall') {
                const y = numberOf(read(row, source.yField));
                const total = !!read(row, source.totalField);
                if (total) {
                    point.y = running;
                    point.from = 0;
                    point.to = running;
                    point.kind = 'total';
                } else if (y !== null) {
                    point.y = y;
                    point.from = running;
                    running += y;
                    point.to = running;
                    point.kind = y >= 0 ? 'rise' : 'fall';
                }
            } else {
                let y = numberOf(read(row, source.yField));
                if (y === null && source.gaps === 'zero') y = 0;
                point.y = y;
                point.to = y ?? 0;
                if (family === 'parts') point.off = hiddenParts.has(i);
            }
            return point;
        });
        // A copy in order, for a scale: the rows stay in the order they were given.
        if (kind !== 'category' && family === 'cartesian') points.sort((a, b) => a.x - b.x);
        const name = source.name ?? (typeof source.yField === 'string' ? source.yField : `${index + 1}`);
        return { source, index, name, type, slot: index % COLORS, wrapped: index >= COLORS, shown: s.shown, stack, points };
    });

    const percent = stacked === 'percent' && family === 'cartesian';
    stackValues(series, percent);

    let total = 0;
    if (family === 'parts') {
        const whole = series.find(s => s.shown);
        for (const p of whole?.points ?? []) if (!p.off && p.y !== null && p.y > 0) total += p.y;
        for (const p of whole?.points ?? []) p.share = !p.off && p.y !== null && p.y > 0 && total ? p.y / total : null;
    }

    const slotsBy = new Map<number, ModelSlot>();
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let heatMin = Infinity;
    let heatMax = -Infinity;
    let sizeMin = Infinity;
    let sizeMax = -Infinity;
    let any = false;
    const log = input.yAxis.kind === 'log';
    const take = (v: number) => {
        if (log && v <= 0) return;
        yMin = Math.min(yMin, v);
        yMax = Math.max(yMax, v);
    };
    for (const s of series) {
        if (!s.shown) continue;
        for (const p of s.points) {
            xMin = Math.min(xMin, p.x);
            xMax = Math.max(xMax, p.x);
            if (p.y === null || p.off || (family === 'parts' && p.y <= 0)) continue;
            any = true;
            let slot = slotsBy.get(p.x);
            if (!slot) slotsBy.set(p.x, (slot = { x: p.x, key: p.key, points: [], at: 0 }));
            slot.points.push(p);
            if (s.type === 'heatmap') {
                heatMin = Math.min(heatMin, p.heat as number);
                heatMax = Math.max(heatMax, p.heat as number);
                continue;
            }
            take(p.to);
            if (FROM_TOO.has(s.type)) take(p.from);
            if (p.size !== null) {
                sizeMin = Math.min(sizeMin, p.size);
                sizeMax = Math.max(sizeMax, p.size);
            }
        }
    }
    for (const slot of slotsBy.values()) slot.points.sort((a, b) => a.series - b.series || a.lane - b.lane);
    const slots = [...slotsBy.values()].sort((a, b) => a.x - b.x);
    const hasBars = [...types].some(t => BANDED.has(t));
    return { family, kind, categories: columns.list, lanes: lanes.list, series, slots, xMin, xMax, yMin, yMax, heatMin, heatMax, total, any, percent, hasBars, sizeMin, sizeMax };
}

// Each stack adds up by position, what is above zero and what is below it apart, as bars grow both ways from one line.
function stackValues(series: ModelSeries[], percent: boolean): void {
    const groups = new Map<string, ModelSeries[]>();
    for (const s of series) {
        if (!s.shown || !s.stack) continue;
        const group = groups.get(s.stack);
        if (group) group.push(s);
        else groups.set(s.stack, [s]);
    }
    for (const group of groups.values()) {
        const totals = new Map<number, number>();
        if (percent) for (const s of group) for (const p of s.points) if (p.y !== null) totals.set(p.x, (totals.get(p.x) ?? 0) + Math.abs(p.y));
        const above = new Map<number, number>();
        const below = new Map<number, number>();
        const lastAbove = new Map<number, ModelPoint>();
        const lastBelow = new Map<number, ModelPoint>();
        for (const s of group) {
            for (const p of s.points) {
                if (p.y === null) continue;
                const size = percent ? (p.y / (totals.get(p.x) || 1)) * 100 : p.y;
                const sums = size >= 0 ? above : below;
                const last = size >= 0 ? lastAbove : lastBelow;
                const from = sums.get(p.x) ?? 0;
                p.from = from;
                p.to = from + size;
                p.outer = false;
                sums.set(p.x, p.to);
                if (size) last.set(p.x, p);
            }
        }
        for (const p of lastAbove.values()) p.outer = true;
        for (const p of lastBelow.values()) p.outer = true;
    }
}
