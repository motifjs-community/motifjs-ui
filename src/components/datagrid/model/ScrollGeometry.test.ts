import { describe, expect, it } from 'vitest';
import { ExtraHeights } from './ExtraHeights';
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

  it('makes room for one taller row (the edit form) and moves the rows after it', () => {
    const geo = new ScrollGeometry(100, 32, 640, ScrollGeometry.MAX_HEIGHT, { at: 10, extra: 300 });
    expect(geo.contentHeight).toBe(100 * 32 + 300);
    expect(geo.offsetOf(10)).toBe(320);
    expect(geo.offsetOf(11)).toBe(320 + 32 + 300);
    expect(geo.heightOf(10)).toBe(332);
    expect(geo.indexAt(500)).toBe(10);
    expect(geo.indexAt(320 + 332 + 40)).toBe(12);
    expect(geo.visibleRange(400)).toEqual({ first: 10, end: 24 });
    // A form taller than the view shows from its top.
    const tall = new ScrollGeometry(100, 32, 200, ScrollGeometry.MAX_HEIGHT, { at: 10, extra: 400 });
    expect(tall.revealRow(0, 10)).toBe(320);
    expect(tall.revealRow(0, 12)).toBe(13 * 32 + 400 - 200);
  });

  it('makes room for open details under rows, measured or at the estimate, and reveals the row itself', () => {
    const details = new ExtraHeights([2, 5, 40]);
    details.estimate = 100;
    details.set(1, 250);
    const geo = new ScrollGeometry(100, 32, 320, ScrollGeometry.MAX_HEIGHT, null, details);
    expect(geo.contentHeight).toBe(100 * 32 + 100 + 250 + 100);
    expect(geo.offsetOf(2)).toBe(64);
    expect(geo.offsetOf(3)).toBe(96 + 100);
    expect(geo.offsetOf(6)).toBe(6 * 32 + 350);
    expect(geo.rowHeightOf(5)).toBe(32);
    expect(geo.heightOf(5)).toBe(282);
    // An offset inside a detail belongs to its row.
    expect(geo.indexAt(64 + 32 + 50)).toBe(2);
    expect(geo.indexAt(geo.offsetOf(5) + 200)).toBe(5);
    expect(geo.indexAt(geo.offsetOf(6))).toBe(6);
    expect(geo.visibleRange(geo.offsetOf(5) + 40)).toEqual({ first: 5, end: 9 });
    // The row comes into view, not its whole detail.
    expect(geo.revealRow(0, 9)).toBe(geo.offsetOf(9) + 32 - 320);
    expect(geo.revealRow(0, 5)).toBe(0);
    expect(geo.revealRow(geo.offsetOf(40), 5)).toBe(geo.offsetOf(5));
    // A new measurement moves the rows after it only.
    details.set(0, 10);
    expect(geo.offsetOf(2)).toBe(64);
    expect(geo.offsetOf(3)).toBe(96 + 10);
    expect(geo.contentHeight).toBe(100 * 32 + 10 + 250 + 100);
  });

  it('sums many open rows quickly and keeps the average of the measured ones', () => {
    const at = Array.from({ length: 50_000 }, (_, i) => i * 2);
    const details = new ExtraHeights(at);
    details.estimate = 80;
    expect(details.average).toBeNull();
    details.set(10, 100);
    details.set(20, 140);
    expect(details.average).toBe(120);
    expect(details.before(21)).toBe(10 * 80 + 100);
    expect(details.before(100_000)).toBe(49_998 * 80 + 240);
    expect(details.slotOf(40)).toBe(20);
    expect(details.slotOf(41)).toBe(-1);
    details.set(10, undefined);
    expect(details.before(21)).toBe(11 * 80);
  });
});
