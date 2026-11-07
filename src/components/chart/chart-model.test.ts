import { describe, expect, it } from 'vitest';
import type { ChartSeries } from './chart-series';
import { buildModel, type ModelInput } from './chart-model';

const rows = [
    { month: 'Jan', a: 10, b: 30 },
    { month: 'Feb', a: 20, b: 10 },
    { month: 'Mar', a: 5, b: 15 }
];

const input = (series: ChartSeries[], extra: Partial<ModelInput> = {}): ModelInput => ({ rows, series, xField: 'month', xAxis: {}, yAxis: {}, stacked: false, hidden: new Set(), ...extra });

describe('chart model', () => {
    it('leaves the rows as they are, in the order given', () => {
        const given = [{ day: new Date(2026, 1, 1), v: 2 }, { day: new Date(2026, 0, 1), v: 1 }];
        const copy = JSON.stringify(given);
        const model = buildModel(input([{ yField: 'v' }], { rows: given, xField: 'day' }));
        expect(JSON.stringify(given)).toBe(copy);
        expect(model.kind).toBe('time');
        expect(model.series[0].points.map(p => p.y)).toEqual([1, 2]);
    });

    it('keeps categories in the order of the rows', () => {
        const model = buildModel(input([{ yField: 'a' }]));
        expect(model.kind).toBe('category');
        expect(model.categories).toEqual(['Jan', 'Feb', 'Mar']);
    });

    it('takes the order of the categories from the chart rows when series bring rows of their own', () => {
        const later = [{ month: 'Mar', v: 3 }, { month: 'Apr', v: 4 }];
        const earlier = [{ month: 'Jan', v: 1 }, { month: 'Feb', v: 2 }, { month: 'Mar', v: 3 }];
        const axis = ['Jan', 'Feb', 'Mar', 'Apr'].map(month => ({ month }));
        const model = buildModel(input([{ data: later, yField: 'v' }, { data: earlier, yField: 'v' }], { rows: axis }));
        expect(model.categories).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);
        expect(model.series[0].points.map(p => p.x)).toEqual([2, 3]);
        expect(model.series[1].points.map(p => p.x)).toEqual([0, 1, 2]);
        const alone = buildModel(input([{ data: later, yField: 'v' }, { data: earlier, yField: 'v' }], { rows: [] }));
        expect(alone.categories).toEqual(['Mar', 'Apr', 'Jan', 'Feb']);
    });

    it('reads a function as a field', () => {
        const model = buildModel(input([{ yField: row => row.a + row.b }]));
        expect(model.series[0].points[0].y).toBe(40);
    });

    it('treats numbers along a line as names, and along dots as a scale', () => {
        const years = [{ year: 2024, v: 1 }, { year: 2025, v: 2 }];
        expect(buildModel(input([{ yField: 'v' }], { rows: years, xField: 'year' })).kind).toBe('category');
        expect(buildModel(input([{ type: 'scatter', yField: 'v' }], { rows: years, xField: 'year' })).kind).toBe('linear');
        expect(buildModel(input([{ yField: 'v' }], { rows: years, xField: 'year', xAxis: { kind: 'linear' } })).kind).toBe('linear');
    });

    it('stacks values, each from where the last one ended', () => {
        const model = buildModel(input([{ type: 'bar', yField: 'a' }, { type: 'bar', yField: 'b' }], { stacked: 'normal' }));
        const [first, second] = model.series;
        expect(first.points[0].from).toBe(0);
        expect(first.points[0].to).toBe(10);
        expect(second.points[0].from).toBe(10);
        expect(second.points[0].to).toBe(40);
        expect(model.yMax).toBe(40);
        expect(first.points[0].outer).toBe(false);
        expect(second.points[0].outer).toBe(true);
    });

    it('stacks what is below zero apart from what is above it', () => {
        const given = [{ k: 'a', x: 10, y: -5, z: 3 }];
        const model = buildModel(input([{ type: 'bar', yField: 'x' }, { type: 'bar', yField: 'y' }, { type: 'bar', yField: 'z' }], { rows: given, xField: 'k', stacked: 'normal' }));
        const [x, y, z] = model.series.map(s => s.points[0]);
        expect([y.from, y.to]).toEqual([0, -5]);
        expect([z.from, z.to]).toEqual([10, 13]);
        expect(y.outer).toBe(true);
        expect(x.outer).toBe(false);
        expect(z.outer).toBe(true);
    });

    it('turns a stack into shares of a hundred', () => {
        const model = buildModel(input([{ type: 'bar', yField: 'a' }, { type: 'bar', yField: 'b' }], { stacked: 'percent' }));
        expect(model.series[1].points[0].to).toBeCloseTo(100, 8);
        expect(model.series[0].points[0].to).toBeCloseTo(25, 8);
        expect(model.percent).toBe(true);
    });

    it('stacks by name, and a series alone keeps to itself', () => {
        const model = buildModel(input([{ type: 'bar', yField: 'a', stack: 'one' }, { type: 'bar', yField: 'b', stack: 'one' }, { type: 'bar', yField: 'a' }]));
        expect(model.series[1].points[0].from).toBe(10);
        expect(model.series[2].stack).toBeNull();
        expect(model.series[2].points[0].from).toBe(0);
    });

    it('keeps a color with its series when another one is hidden', () => {
        const model = buildModel(input([{ yField: 'a' }, { yField: 'b' }, { yField: 'a' }], { hidden: new Set([0]) }));
        expect(model.series[0].shown).toBe(false);
        expect(model.series[1].slot).toBe(1);
        expect(model.series[2].slot).toBe(2);
    });

    it('leaves a hidden series out of the range and the stack', () => {
        const model = buildModel(input([{ type: 'bar', yField: 'a' }, { type: 'bar', yField: 'b' }], { stacked: 'normal', hidden: new Set([1]) }));
        expect(model.yMax).toBe(20);
    });

    it('comes round the eight colors with a sign that tells them apart', () => {
        const model = buildModel(input(Array.from({ length: 10 }, () => ({ yField: 'a' }))));
        expect(model.series[8].slot).toBe(0);
        expect(model.series[8].wrapped).toBe(true);
        expect(model.series[7].wrapped).toBe(false);
    });

    it('reads what is not a number as empty, and zero as a value', () => {
        const given = [{ k: 'a', v: null }, { k: 'b', v: 'x' }, { k: 'c', v: 0 }, { k: 'd', v: '7' }, { k: 'e', v: Infinity }];
        const model = buildModel(input([{ yField: 'v' }], { rows: given, xField: 'k' }));
        expect(model.series[0].points.map(p => p.y)).toEqual([null, null, 0, 7, null]);
        expect(model.any).toBe(true);
        expect(model.slots).toHaveLength(2);
    });

    it('counts an empty value as zero when asked', () => {
        const given = [{ k: 'a', v: null }];
        const model = buildModel(input([{ yField: 'v', gaps: 'zero' }], { rows: given, xField: 'k' }));
        expect(model.series[0].points[0].y).toBe(0);
    });

    it('has nothing to draw without rows or series', () => {
        expect(buildModel(input([], { rows: [] })).any).toBe(false);
        expect(buildModel(input([{ yField: 'a' }], { rows: [] })).any).toBe(false);
    });

    it('takes rows of a series of its own', () => {
        const own = [{ month: 'Apr', a: 1 }];
        const model = buildModel(input([{ yField: 'a' }, { yField: 'a', data: own }]));
        expect(model.categories).toEqual(['Jan', 'Feb', 'Mar', 'Apr']);
    });

    it('leaves zero and below out of the range of a log axis', () => {
        const given = [{ k: 'a', v: 0 }, { k: 'b', v: 100 }, { k: 'c', v: 5 }];
        const model = buildModel(input([{ yField: 'v' }], { rows: given, xField: 'k', yAxis: { kind: 'log' } }));
        expect(model.yMin).toBe(5);
    });
});
