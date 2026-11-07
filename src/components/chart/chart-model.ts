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

/** What a chart draws. */
export interface ChartModel {
    kind: Exclude<ChartAxisKind, 'auto'>;
    categories: unknown[];
    series: ModelSeries[];
    slots: ModelSlot[];
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
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
}

const COLORS = 8;

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
    if (types.has('bar') || !keys.length) return 'category';
    if (keys.every(key => key instanceof Date)) return 'time';
    if ((types.has('scatter') || types.has('bubble')) && keys.every(key => typeof key === 'number')) return 'linear';
    return 'category';
}

/** Reads the series into a model of its own: the rows are read and left as they are. */
export function buildModel(input: ModelInput): ChartModel {
    const { rows, xField, xAxis, stacked, hidden } = input;
    const shape = input.series.map((source, index) => {
        const own = source.data ?? rows;
        const yField = source.yField;
        const shown = source.visible !== false && !hidden.has(index);
        const field = source.xField ?? xField;
        const keys = own.map((row, i) => (field === null || field === undefined ? i + 1 : read(row, field)));
        return { source, index, own, yField, shown, keys };
    });

    const live = shape.filter(s => s.shown);
    const types = new Set(live.map(s => s.source.type ?? 'line'));
    const allKeys = live.flatMap(s => s.keys);
    const kind = kindOf(xAxis, allKeys, types);

    const categories: unknown[] = [];
    const places = new Map<unknown, number>();
    const positionOf = (key: unknown, i: number): number => {
        if (kind === 'category') {
            const name = key instanceof Date ? key.getTime() : key;
            let place = places.get(name);
            if (place === undefined) {
                place = categories.length;
                places.set(name, place);
                categories.push(key);
            }
            return place;
        }
        return numberOf(key) ?? i;
    };

    const series: ModelSeries[] = shape.map(s => {
        const { source, index, own, keys } = s;
        const type = source.type ?? 'line';
        const stackable = type === 'bar' || type === 'area';
        const wanted = source.stack ?? (stacked ? true : false);
        const stack = stackable && wanted ? `${type}:${wanted === true ? '' : wanted}` : null;
        const points: ModelPoint[] = own.map((row, i) => {
            let y = numberOf(read(row, source.yField));
            if (y === null && source.gaps === 'zero') y = 0;
            return { series: index, index: i, key: keys[i], x: s.shown || kind !== 'category' ? positionOf(keys[i], i) : -1, y, from: 0, to: y ?? 0, outer: true, size: numberOf(read(row, source.sizeField)), row, px: 0, py: 0 };
        });
        // A copy in order, for a scale: the rows stay in the order they were given.
        if (kind !== 'category') points.sort((a, b) => a.x - b.x);
        const name = source.name ?? (typeof source.yField === 'string' ? source.yField : `${index + 1}`);
        return { source, index, name, type, slot: index % COLORS, wrapped: index >= COLORS, shown: s.shown, stack, points };
    });

    const percent = stacked === 'percent';
    stackValues(series, percent);

    const slotsBy = new Map<number, ModelSlot>();
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let sizeMin = Infinity;
    let sizeMax = -Infinity;
    let any = false;
    const log = input.yAxis.kind === 'log';
    for (const s of series) {
        if (!s.shown) continue;
        for (const p of s.points) {
            xMin = Math.min(xMin, p.x);
            xMax = Math.max(xMax, p.x);
            if (p.y === null) continue;
            any = true;
            let slot = slotsBy.get(p.x);
            if (!slot) slotsBy.set(p.x, (slot = { x: p.x, key: p.key, points: [], at: 0 }));
            slot.points.push(p);
            if (!log || p.to > 0) {
                yMin = Math.min(yMin, p.to);
                yMax = Math.max(yMax, p.to);
            }
            if (s.type === 'bar' || s.type === 'area') {
                if (!log || p.from > 0) {
                    yMin = Math.min(yMin, p.from);
                    yMax = Math.max(yMax, p.from);
                }
            }
            if (p.size !== null) {
                sizeMin = Math.min(sizeMin, p.size);
                sizeMax = Math.max(sizeMax, p.size);
            }
        }
    }
    const slots = [...slotsBy.values()].sort((a, b) => a.x - b.x);
    return { kind, categories, series, slots, xMin, xMax, yMin, yMax, any, percent, hasBars: types.has('bar'), sizeMin, sizeMax };
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
