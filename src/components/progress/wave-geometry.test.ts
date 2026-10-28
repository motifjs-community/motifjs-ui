import { describe, expect, it } from 'vitest';
import { easing, linePath, ringPath } from './wave-geometry';

const points = (d: string) =>
  d
    .replace(/Z$/, '')
    .slice(1)
    .split('L')
    .map((p) => p.split(' ').map(Number));

describe('wave geometry', () => {
  it('draws a straight line without a swing, its round ends inside the length', () => {
    expect(linePath(100, 10, 4, { amplitude: 0, length: 40, phase: 0 })).toBe('M2 5H98');
    expect(linePath(0, 10, 4, { amplitude: 3, length: 40, phase: 0 })).toBe('');
    // Shorter than its thickness: a dot.
    expect(linePath(3, 10, 4, { amplitude: 0, length: 40, phase: 0 })).toBe('M2 5H2');
  });

  it('swings evenly to each side of the middle and travels with the phase', () => {
    const at = (phase: number) => points(linePath(162, 10, 4, { amplitude: 3, length: 40, phase }));
    const ys = at(0).map(([, y]) => y);
    expect(Math.max(...ys)).toBeCloseTo(8, 1);
    expect(Math.min(...ys)).toBeCloseTo(2, 1);
    expect(at(0)[0][0]).toBe(2);
    expect(at(0).at(-1)![0]).toBe(160);
    // A quarter wave on, the crest that stood at 30 stands at 40.
    const crest = (pts: number[][]) => pts.filter(([x]) => x > 20 && x < 60).sort((a, b) => a[1] - b[1])[0][0];
    expect(crest(at(0))).toBe(30);
    expect(crest(at(0.25))).toBe(40);
  });

  it('goes round from angle 0, fits whole waves and closes the whole circle', () => {
    const swing = { amplitude: 1.6, length: 15, phase: 0 };
    const whole = ringPath(21.6, 18, 4, 1, swing);
    expect(whole.endsWith('Z')).toBe(true);
    const radii = points(whole).map(([x, y]) => Math.hypot(x - 21.6, y - 21.6));
    expect(Math.max(...radii)).toBeCloseTo(19.6, 1);
    expect(Math.min(...radii)).toBeCloseTo(16.4, 1);
    // The start and the end meet: the wave length is fitted to the circle.
    const [first, last] = [points(whole)[0], points(whole).at(-1)!];
    expect(Math.hypot(first[0] - last[0], first[1] - last[1])).toBeLessThan(1.5);
    // A quarter: from half the line after angle 0 to half the line before a quarter turn.
    const quarter = points(ringPath(21.6, 18, 4, 0.25, { amplitude: 0, length: 15, phase: 0 }));
    expect(Math.atan2(quarter[0][1] - 21.6, quarter[0][0] - 21.6)).toBeCloseTo(2 / 18, 3);
    expect(Math.atan2(quarter.at(-1)![1] - 21.6, quarter.at(-1)![0] - 21.6)).toBeCloseTo(Math.PI / 2 - 2 / 18, 3);
    expect(ringPath(21.6, 18, 4, 0, swing)).toBe('');
  });

  it('reads a cubic-bezier easing', () => {
    const ease = easing('cubic-bezier(0.2, 0, 0, 1)');
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(0.8);
    expect(easing(null)(0.3)).toBe(0.3);
  });
});
