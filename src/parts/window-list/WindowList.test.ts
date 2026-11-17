import { Component, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { ScrollView } from '../../components/scrollview/ScrollView';
import { WindowList } from './WindowList';

interface Item {
  id: number;
}

const settle = async () => {
  for (let i = 0; i < 6; i++) await new Promise((done) => setTimeout(done, 0));
};

const ROW = 100;
const VIEW = 300;
const hosts: Component[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

/**
 * A list of `count` items of 100 px in a 300 px view, laid out by hand: jsdom lays nothing out, so each row's box is its
 * place among the rows on the page (after the spacer above) minus the scroll.
 */
function setup(count: number, settled?: () => void) {
  const items = Array.from({ length: count }, (_, id) => ({ id }));
  const made: number[] = [];
  const scroller = new ScrollView();
  const list = new WindowList<Item>(
    scroller,
    {
      make: (item) => {
        made.push(item.id);
        const row = new Component<HTMLDivElement>('div');
        row.attr.add({ 'data-id': String(item.id) });
        return row;
      },
      estimate: () => ROW,
      settled
    },
    'rows'
  );
  scroller.content.controls.insert(1, list.host);
  hosts.push(mountHost(scroller));
  let top = 0;
  const view = scroller.element;
  Object.defineProperty(view, 'clientHeight', { configurable: true, get: () => VIEW });
  Object.defineProperty(view, 'scrollHeight', { configurable: true, get: () => count * ROW });
  Object.defineProperty(view, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = v) });
  Object.defineProperty(view, 'scrollBy', { configurable: true, value: (o: { top?: number }) => (top += o.top ?? 0) });
  Object.defineProperty(view, 'scrollTo', { configurable: true, value: (o: { top?: number }) => (top = o.top ?? top) });
  const rect = (y: number, h: number) => new DOMRect(0, y, 100, h);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this === view) return rect(0, VIEW);
    if (this === list.host.element) return rect(-top, count * ROW);
    const id = this.getAttribute('data-id');
    return id === null ? rect(0, 0) : rect(Number(id) * ROW - top, ROW);
  });
  const scrollTo = async (y: number) => {
    top = y;
    view.dispatchEvent(new Event('scroll'));
    for (let i = 0; i < 6; i++) await tick();
  };
  const shown = () => list.host.controls.items.filter((c: ComponentBase) => c.element instanceof Element && c.element.hasAttribute('data-id')).map((c) => Number((c.element as Element).getAttribute('data-id')));
  return { items, made, list, scroller, scrollTo, shown };
}

describe('WindowList', () => {
  it('puts on the page only the rows in and near the view, and never makes the others', async () => {
    const { items, made, list, scrollTo, shown } = setup(1000);
    list.set(items);
    await scrollTo(50_000);
    const rows = shown();
    expect(rows.length).toBeLessThan(20);
    expect(rows[0]).toBeLessThanOrEqual(500);
    expect(rows[rows.length - 1]).toBeGreaterThanOrEqual(502);
    // The rows at the top it opened at, and the rows around the view; none in between.
    expect(made.length).toBeLessThan(40);
    expect(made.filter((id) => id > 12 && (id < 485 || id > 515))).toEqual([]);
  });

  it('disposes the rows that go far and makes them again from their items when they come back', async () => {
    const { items, made, list, scrollTo, shown } = setup(1000);
    list.set(items);
    await scrollTo(50_000);
    const part = list.partOf(items[500])!;
    await scrollTo(0);
    expect(shown()[0]).toBe(0);
    expect(shown()).not.toContain(500);
    expect(part.isDisposed).toBe(true);
    expect(list.partOf(items[500])).toBeNull();
    const madeBefore = made.length;
    await scrollTo(50_000);
    const again = list.partOf(items[500]);
    expect(again).not.toBeNull();
    expect(again).not.toBe(part);
    expect(made.slice(madeBefore)).toContain(500);
  });

  it('keeps on the page a row that holds focus', async () => {
    const { items, list, scrollTo, shown } = setup(1000);
    list.set(items);
    await scrollTo(0);
    const row = list.partOf(items[1])!;
    row.attr.add({ tabindex: '-1' });
    (row.element as HTMLElement).focus();
    await scrollTo(50_000);
    expect(shown()).toContain(1);
  });

  it('disposes every part on another list and makes the rows in view from the new items', async () => {
    const { items, list, scrollTo, shown } = setup(100);
    list.set(items);
    await scrollTo(0);
    const first = list.partOf(items[0])!;
    list.set([items[0], ...items.slice(2)]);
    await settle();
    expect(first.isDisposed).toBe(true);
    expect(shown()[0]).toBe(0);
    expect(list.partOf(items[0])).not.toBe(first);
    expect(list.has(items[1])).toBe(false);
  });

  it('removes an item with its part, and estimates again an item that changed with no part', async () => {
    const { items, list, scrollTo } = setup(100);
    list.set(items);
    await scrollTo(0);
    const part = list.partOf(items[1])!;
    list.remove(items[1]);
    await settle();
    expect(part.isDisposed).toBe(true);
    expect(list.has(items[1])).toBe(false);
    expect(list.count).toBe(99);
    expect(list.partOf(items[90])).toBeNull();
    list.refresh(items[90]);
    expect(list.partOf(items[90])).toBeNull();
  });

  it('makes the part on the page again from its item when it changed, in its place', async () => {
    const { items, made, list, scrollTo, shown } = setup(100);
    list.set(items);
    await scrollTo(0);
    const old = list.partOf(items[1])!;
    const before = made.length;
    list.refresh(items[1]);
    await settle();
    expect(old.isDisposed).toBe(true);
    expect(made.slice(before)).toEqual([1]);
    expect(shown().slice(0, 3)).toEqual([0, 1, 2]);
  });

  it('tells its source once the rows are placed and the view has a size', async () => {
    const settled = vi.fn();
    const { items, list, scrollTo } = setup(100, settled);
    list.set(items);
    await scrollTo(0);
    expect(settled).toHaveBeenCalled();
  });

  it('adds items above without making them, and keeps the row on screen where it is', async () => {
    const { items, made, list, scroller, scrollTo } = setup(100);
    list.set(items);
    await scrollTo(5000);
    const hold = vi.spyOn(scroller, 'holdPosition');
    const older = Array.from({ length: 10 }, (_, i) => ({ id: 1000 + i }));
    list.insert(0, older);
    expect(hold).toHaveBeenCalled();
    expect(made.some((id) => id >= 1000)).toBe(false);
    expect(list.items[0]).toBe(older[0]);
    expect(list.count).toBe(110);
  });
});
