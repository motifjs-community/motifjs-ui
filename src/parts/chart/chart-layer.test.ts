import { describe, expect, it } from 'vitest';
import { areaPath, barPath, circlesPath, linePath, smoothPath, stepPath } from './chart-paths';
import { bandScale, linearScale, logScale } from './chart-scale';
import { logTicks, niceStep, niceTicks } from './nice-ticks';
import { thinOut } from './thin-out';
import { timeTicks } from './time-ticks';

describe('nice ticks', () => {
    it('takes round steps', () => {
        expect(niceStep(100, 5)).toBe(20);
        expect(niceStep(7, 5)).toBe(2);
        expect(niceStep(12, 5)).toBe(2.5);
        expect(niceStep(0.3, 3)).toBeCloseTo(0.1, 10);
    });

    it('reaches past the values, or stays inside them', () => {
        expect(niceTicks(3, 97, 5)).toEqual([0, 20, 40, 60, 80, 100]);
        expect(niceTicks(3, 97, 5, true)).toEqual([20, 40, 60, 80]);
    });

    it('leaves nothing of the rounding of decimals', () => {
        expect(niceTicks(0, 0.3, 3)).toEqual([0, 0.1, 0.2, 0.3]);
    });

    it('gives a single value room', () => {
        const ticks = niceTicks(50, 50, 4);
        expect(ticks[0]).toBeLessThan(50);
        expect(ticks.at(-1)).toBeGreaterThan(50);
        expect(niceTicks(0, 0, 4).length).toBeGreaterThan(1);
    });

    it('handles values below zero', () => {
        expect(niceTicks(-30, 30, 6)).toEqual([-30, -20, -10, 0, 10, 20, 30]);
    });

    it('steps a log axis by powers of ten', () => {
        expect(logTicks(3, 4000)).toEqual([1, 10, 100, 1000, 10000]);
    });
});

describe('time ticks', () => {
    it('falls on the first of a month', () => {
        const { ticks } = timeTicks(new Date(2026, 0, 15).getTime(), new Date(2026, 11, 15).getTime(), 6);
        for (const tick of ticks) expect(new Date(tick).getDate()).toBe(1);
        expect(ticks.length).toBeGreaterThan(2);
    });

    it('falls on whole hours', () => {
        const { ticks } = timeTicks(new Date(2026, 3, 1, 8, 20).getTime(), new Date(2026, 3, 1, 18, 40).getTime(), 5);
        for (const tick of ticks) expect(new Date(tick).getMinutes()).toBe(0);
    });

    it('steps by years over a long span, and keeps every tick inside', () => {
        const min = new Date(2000, 5, 1).getTime();
        const max = new Date(2026, 5, 1).getTime();
        const { ticks, format } = timeTicks(min, max, 6);
        expect(format.year).toBe('numeric');
        expect(ticks[0]).toBeGreaterThanOrEqual(min);
        expect(ticks.at(-1)).toBeLessThanOrEqual(max);
    });
});

describe('scales', () => {
    it('maps both ways, also upside down', () => {
        const scale = linearScale(0, 100, 200, 0);
        expect(scale.at(0)).toBe(200);
        expect(scale.at(100)).toBe(0);
        expect(scale.valueAt(50)).toBe(75);
    });

    it('puts powers of ten at equal distances, and what has no place at the start', () => {
        const scale = logScale(1, 1000, 0, 300);
        expect(scale.at(10)).toBeCloseTo(100, 8);
        expect(scale.at(100)).toBeCloseTo(200, 8);
        expect(scale.at(0)).toBe(0);
    });

    it('lands on the middle of a band', () => {
        const scale = bandScale(4, 0, 400);
        expect(scale.size).toBe(100);
        expect(scale.at(1)).toBe(150);
        expect(scale.valueAt(399)).toBe(3);
    });
});

describe('paths', () => {
    it('draws a line', () => {
        expect(linePath([[0, 0], [10.04, 5]])).toBe('M0 0L10 5');
    });

    it('holds a value along a step', () => {
        expect(stepPath([[0, 0], [10, 5]], 'start')).toBe('M0 0L10 0L10 5');
        expect(stepPath([[0, 0], [10, 5]], 'end')).toBe('M0 0L0 5L10 5');
        expect(stepPath([[0, 0], [10, 5]], 'middle')).toBe('M0 0L5 0L5 5L10 5');
    });

    it('never swings past the values of a smooth line', () => {
        const d = smoothPath([[0, 0], [10, 10], [20, 10], [30, 0]]);
        const numbers = d.match(/-?[\d.]+/g)!.map(Number);
        const ys = numbers.filter((_, i) => i % 2 === 1);
        expect(Math.max(...ys)).toBeLessThanOrEqual(10);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    });

    it('closes an area', () => {
        expect(areaPath('M0 0L10 0', 'M10 5L0 5')).toBe('M0 0L10 0L10 5L0 5Z');
        expect(areaPath('', 'M10 5')).toBe('');
    });

    it('rounds only the end of a bar, and keeps a short bar whole', () => {
        const d = barPath(0, 0, 20, 100, 4, 'top');
        expect(d.match(/a4 4/g)).toHaveLength(2);
        expect(barPath(0, 0, 20, 2, 4, 'top')).toContain('a2 2');
        expect(barPath(0, 0, 20, 10, 4, null)).toBe('M0 0h20v10h-20z');
        expect(barPath(0, 0, 0, 10, 4, 'top')).toBe('');
    });

    it('closes a bar on the point it started, whichever way it ends', () => {
        for (const end of ['top', 'bottom', 'left', 'right'] as const) {
            const d = barPath(10, 20, 30, 40, 5, end);
            const moves = [...d.matchAll(/([vh])(-?[\d.]+)|a5 5 0 0 1 (-?[\d.]+) (-?[\d.]+)/g)];
            let x = 0;
            let y = 0;
            for (const m of moves) {
                if (m[1] === 'h') x += Number(m[2]);
                else if (m[1] === 'v') y += Number(m[2]);
                else {
                    x += Number(m[3]);
                    y += Number(m[4]);
                }
            }
            // `z` closes the side the path leaves open: only one of the two directions may remain.
            expect(Math.min(Math.abs(x), Math.abs(y)), end).toBe(0);
        }
    });

    it('draws circles as one path', () => {
        const d = circlesPath([{ x: 10, y: 10, r: 4 }, { x: 20, y: 10, r: 4 }]);
        expect(d.match(/M/g)).toHaveLength(2);
    });
});

describe('thinning out', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i === 500 ? 1000 : Math.sin(i / 20) }));

    it('keeps the wanted number, the ends and the order', () => {
        const kept = thinOut(items, 100, p => p.x, p => p.y);
        expect(kept).toHaveLength(100);
        expect(kept[0]).toBe(items[0]);
        expect(kept.at(-1)).toBe(items.at(-1));
        expect(kept.every((p, i) => !i || kept[i - 1].x < p.x)).toBe(true);
    });

    it('keeps a peak', () => {
        expect(thinOut(items, 50, p => p.x, p => p.y).some(p => p.y === 1000)).toBe(true);
    });

    it('leaves a short series alone', () => {
        expect(thinOut(items, 2000, p => p.x, p => p.y)).toHaveLength(1000);
    });
});

describe('round shapes', () => {
    it('rounds every corner of a range bar, never more than half its side', async () => {
        const { roundRectPath } = await import('./chart-paths');
        expect(roundRectPath(0, 0, 20, 100, 4).match(/a4 4/g)).toHaveLength(4);
        expect(roundRectPath(0, 0, 6, 100, 4)).toContain('a3 3');
        expect(roundRectPath(0, 0, 0, 10, 4)).toBe('');
    });

    it('places angles from the top, clockwise', async () => {
        const { polar } = await import('./chart-paths');
        const [x, y] = polar(0, 0, 10, Math.PI / 2);
        expect(x).toBeCloseTo(10, 8);
        expect(y).toBeCloseTo(0, 8);
        expect(polar(0, 0, 10, 0)[1]).toBeCloseTo(-10, 8);
    });

    it('draws a slice, a ring piece and a whole circle', async () => {
        const { arcPath } = await import('./chart-paths');
        expect(arcPath(50, 50, 0, 40, 0, Math.PI / 2)).toMatch(/^M50 10A40 40 0 0 1 90 50L50 50Z$/);
        expect(arcPath(50, 50, 20, 40, 0, Math.PI).match(/A/g)).toHaveLength(4);
        expect(arcPath(50, 50, 0, 40, 0, Math.PI * 2).match(/A/g)).toHaveLength(4);
        expect(arcPath(50, 50, 0, 40, 1, 1)).toBe('');
    });

    it('never asks for an arc its radius cannot reach, so a ring keeps its thickness at every value', async () => {
        const { arcPath } = await import('./chart-paths');
        // Around half a turn the ends of one arc would be almost a diameter apart, and their rounding could push them past it.
        for (let sweep = 2.9; sweep <= 3.4; sweep += 0.0007) {
            const d = arcPath(117.3, 98.6, 99.1, 109.1, -2.356, -2.356 + sweep);
            let at = d.match(/^M([\d.-]+) ([\d.-]+)/)!.slice(1).map(Number);
            for (const part of d.matchAll(/([AL])([\d.-]+) ([\d.-]+)(?: 0 0 [01] ([\d.-]+) ([\d.-]+))?/g)) {
                const end = part[1] === 'A' ? [Number(part[4]), Number(part[5])] : [Number(part[2]), Number(part[3])];
                if (part[1] === 'A') expect(Math.hypot(end[0] - at[0], end[1] - at[1])).toBeLessThan(Number(part[2]) * 2 * 0.75);
                at = end;
            }
        }
    });
});

describe('motion', () => {
    it('reads a duration in seconds or in milliseconds', async () => {
        const { motionOf } = await import('./chart-text');
        const { mountHost } = await import('../../../tests/helpers');
        const host = mountHost();
        host.element.style.setProperty('--a', '.167s');
        host.element.style.setProperty('--b', '83ms');
        expect(motionOf(host, '--a')).toBeCloseTo(167, 6);
        expect(motionOf(host, '--b')).toBe(83);
        expect(motionOf(host, '--none')).toBe(0);
        void host.dispose();
    });
});
