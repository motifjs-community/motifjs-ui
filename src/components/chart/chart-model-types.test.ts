import { describe, expect, it } from 'vitest';
import { buildModel, type ModelInput } from './chart-model';
import type { ChartSeries } from './chart-series';

const input = (rows: unknown[], series: ChartSeries[], extra: Partial<ModelInput> = {}): ModelInput => ({ rows, series, xField: 'k', xAxis: {}, yAxis: {}, stacked: false, hidden: new Set(), ...extra });

describe('chart model, the other types', () => {
    it('makes shares of a whole and leaves a hidden part out of it', () => {
        const rows = [{ k: 'a', v: 50 }, { k: 'b', v: 30 }, { k: 'c', v: 20 }];
        const model = buildModel(input(rows, [{ type: 'pie', yField: 'v' }]));
        expect(model.family).toBe('parts');
        expect(model.total).toBe(100);
        expect(model.series[0].points.map(p => p.share)).toEqual([0.5, 0.3, 0.2]);
        const hidden = buildModel(input(rows, [{ type: 'pie', yField: 'v' }], { hiddenParts: new Set([0]) }));
        expect(hidden.total).toBe(50);
        expect(hidden.series[0].points.map(p => p.share)).toEqual([null, 0.6, 0.4]);
        expect(hidden.slots).toHaveLength(2);
    });

    it('takes one series for a whole, and the first family only', () => {
        const rows = [{ k: 'a', v: 1, w: 2 }];
        const model = buildModel(input(rows, [{ type: 'donut', yField: 'v' }, { type: 'pie', yField: 'w' }, { type: 'line', yField: 'w' }]));
        expect(model.series.map(s => s.shown)).toEqual([true, false, false]);
    });

    it('leaves a part of zero or below out of a whole', () => {
        const model = buildModel(input([{ k: 'a', v: 4 }, { k: 'b', v: 0 }, { k: 'c', v: -2 }], [{ type: 'pie', yField: 'v' }]));
        expect(model.total).toBe(4);
        expect(model.slots).toHaveLength(1);
    });

    it('carries a waterfall forward, with totals that show where it stands', () => {
        const rows = [{ k: 'start', v: 100 }, { k: 'in', v: 50 }, { k: 'out', v: -30 }, { k: 'sum', t: true }, { k: 'out2', v: -20 }];
        const model = buildModel(input(rows, [{ type: 'waterfall', yField: 'v', totalField: 't' }]));
        const points = model.series[0].points;
        expect(points.map(p => [p.from, p.to])).toEqual([[0, 100], [100, 150], [150, 120], [0, 120], [120, 100]]);
        expect(points.map(p => p.kind)).toEqual(['rise', 'rise', 'fall', 'total', 'fall']);
        expect(model.yMin).toBe(0);
        expect(model.yMax).toBe(150);
    });

    it('reads a candle from its four prices, and says whether it rose', () => {
        const rows = [{ k: 'a', o: 10, h: 15, l: 8, c: 12 }, { k: 'b', o: 12, h: 13, l: 6, c: 7 }, { k: 'c', o: 1, h: 2, l: null, c: 1 }];
        const model = buildModel(input(rows, [{ type: 'candlestick', openField: 'o', highField: 'h', lowField: 'l', closeField: 'c' }]));
        const [a, b, c] = model.series[0].points;
        expect([a.kind, b.kind]).toEqual(['rise', 'fall']);
        expect([a.from, a.to]).toEqual([8, 15]);
        expect(c.y).toBeNull();
        expect([model.yMin, model.yMax]).toEqual([6, 15]);
    });

    it('spans a range from its low end to its high end, whichever way they are given', () => {
        const model = buildModel(input([{ k: 'a', lo: 30, hi: 10 }], [{ type: 'rangeBar', lowField: 'lo', highField: 'hi' }]));
        expect([model.series[0].points[0].from, model.series[0].points[0].to]).toEqual([10, 30]);
    });

    it('places a heat map on rows and columns, and keeps the range of its values', () => {
        const rows = [{ k: 'x1', r: 'top', v: 3 }, { k: 'x2', r: 'top', v: 9 }, { k: 'x1', r: 'bottom', v: -4 }];
        const model = buildModel(input(rows, [{ type: 'heatmap', yField: 'r', valueField: 'v' }]));
        expect(model.lanes).toEqual(['top', 'bottom']);
        expect(model.categories).toEqual(['x1', 'x2']);
        expect([model.heatMin, model.heatMax]).toEqual([-4, 9]);
        expect(model.slots[0].points.map(p => p.lane)).toEqual([0, 1]);
    });

    it('draws a radar around its categories', () => {
        const model = buildModel(input([{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'c', v: 3 }], [{ type: 'radar', yField: 'v' }]));
        expect(model.family).toBe('radar');
        expect(model.kind).toBe('category');
        expect(model.slots).toHaveLength(3);
    });
});
