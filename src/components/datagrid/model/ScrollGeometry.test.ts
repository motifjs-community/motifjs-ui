import { describe, expect, it } from 'vitest';
import { ScrollGeometry } from './ScrollGeometry';

const g = (total: number, rowHeight = 32, viewport = 640) => new ScrollGeometry(total, rowHeight, viewport);

describe('ScrollGeometry', () => {
  it('maps 1:1 below the height limit', () => {
    const geo = g(1000);
    expect(geo.scaled).toBe(false);
    expect(geo.spacerHeight).toBe(32_000);
    expect(geo.virtualFromScroll(3200)).toBe(3200);
    expect(geo.scrollFromVirtual(3200)).toBe(3200);
    expect(geo.rowTop(100, 3200, 3200)).toBe(3200);
  });

  it('caps the spacer and maps proportionally above the limit', () => {
    const geo = g(10_000_000); // 320 million pixels of rows
    expect(geo.scaled).toBe(true);
    expect(geo.spacerHeight).toBe(ScrollGeometry.MAX_HEIGHT);
    const end = ScrollGeometry.MAX_HEIGHT - geo.viewport;
    expect(geo.virtualFromScroll(end)).toBe(geo.maxVirtualTop);
    expect(geo.virtualFromScroll(0)).toBe(0);
    expect(geo.virtualFromScroll(end / 2)).toBeCloseTo(geo.maxVirtualTop / 2, 3);
  });

  it('round-trips between native and virtual offsets', () => {
    const geo = g(50_000_000);
    for (const v of [0, 123_456, 777_777_777, geo.maxVirtualTop]) {
      expect(geo.virtualFromScroll(geo.scrollFromVirtual(v))).toBeCloseTo(v, 0);
    }
  });

  it('places rows relative to the scroll position when scaled', () => {
    const geo = g(10_000_000);
    const virtualTop = 160_000_000; // row 5,000,000 at the top
    const scrollTop = geo.scrollFromVirtual(virtualTop);
    expect(geo.rowTop(5_000_000, scrollTop, virtualTop)).toBeCloseTo(scrollTop, 6);
    expect(geo.rowTop(5_000_001, scrollTop, virtualTop) - geo.rowTop(5_000_000, scrollTop, virtualTop)).toBe(32);
  });

  it('finds the visible range at both ends', () => {
    expect(g(1000).visibleRange(0)).toEqual({ first: 0, end: 20 });
    expect(g(1000).visibleRange(g(1000).maxVirtualTop)).toEqual({ first: 980, end: 1000 });
    expect(g(0).visibleRange(0)).toEqual({ first: 0, end: 0 });
  });

  it('reveals a row with the least movement', () => {
    const geo = g(1000);
    expect(geo.revealRow(0, 5)).toBe(0);
    expect(geo.revealRow(0, 25)).toBe(26 * 32 - 640);
    expect(geo.revealRow(3200, 10)).toBe(320);
    expect(geo.revealRow(0, 999, 'start')).toBe(geo.maxVirtualTop);
  });
});
