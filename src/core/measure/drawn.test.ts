import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { measureAfterDrawn } from './drawn';
import { knownScrollOf, noteScroll, rememberScrolls } from './scroll-memory';
import type { View } from './view';

// What waits for the next frame of a window: measures asked for it run in one run there, reads before writes, and a
// scroll event is read there too, at once only when its place is asked before.

const frame = () => new Promise((done) => setTimeout(done, 260));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('measureAfterDrawn', () => {
  it('runs the measures of a window in one run once it has drawn, every read before any write', async () => {
    const a = mount(new Component('div'));
    const b = mount(new Component('div'));
    const log: string[] = [];
    measureAfterDrawn(a, () => log.push('read a'), () => log.push('write a'));
    measureAfterDrawn(b, () => log.push('read b'), () => log.push('write b'));
    expect(log).toEqual([]);
    await frame();
    expect(log).toEqual(['read a', 'read b', 'write a', 'write b']);
    a.dispose();
    b.dispose();
  });

  it('takes one back alone, all of them with nothing left waiting, and skips an owner disposed by then', async () => {
    const a = mount(new Component('div'));
    const b = mount(new Component('div'));
    const c = mount(new Component('div'));
    const log: string[] = [];
    const stopA = measureAfterDrawn(a, () => log.push('read a'), () => log.push('write a'));
    measureAfterDrawn(b, () => log.push('read b'), () => log.push('write b'));
    measureAfterDrawn(c, () => log.push('read c'), () => log.push('write c'));
    stopA();
    c.dispose();
    await frame();
    expect(log).toEqual(['read b', 'write b']);
    const stopB = measureAfterDrawn(b, () => log.push('again'), () => log.push('again'));
    stopB();
    await frame();
    expect(log).toEqual(['read b', 'write b']);
    // A new one after all were taken back waits for a frame of its own.
    measureAfterDrawn(b, () => log.push('read b'), () => log.push('write b'));
    await frame();
    expect(log).toEqual(['read b', 'write b', 'read b', 'write b']);
    a.dispose();
    b.dispose();
  });
});

describe('the scroll memory', () => {
  function scrolled() {
    const box = mount(new Component<HTMLDivElement>('div'));
    const el = box.element;
    let reads = 0;
    let top = 0;
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      get: () => (reads++, top),
      set: (to: number) => (top = to),
    });
    Object.defineProperty(el, 'scrollLeft', { configurable: true, get: () => 0 });
    const scroll = (to: number) => {
      top = to;
      el.dispatchEvent(new Event('scroll'));
    };
    return { box, scroll, reads: () => reads };
  }

  it('reads a scrolled element once the frame is drawn, not in its scroll event', async () => {
    rememberScrolls(window as unknown as View);
    const { box, scroll, reads } = scrolled();
    scroll(40);
    scroll(60);
    expect(reads()).toBe(0);
    await frame();
    expect(reads()).toBe(1);
    expect(knownScrollOf(box)).toEqual({ start: 0, top: 60 });
    expect(reads()).toBe(1);
    box.dispose();
  });

  it('reads at once a place asked before the frame, and nothing for a whole place noted', async () => {
    rememberScrolls(window as unknown as View);
    const { box, scroll, reads } = scrolled();
    scroll(30);
    expect(knownScrollOf(box)).toEqual({ start: 0, top: 30 });
    expect(reads()).toBe(1);
    scroll(50);
    noteScroll(box.element, { start: 0, top: 80 });
    expect(knownScrollOf(box)).toEqual({ start: 0, top: 80 });
    await frame();
    expect(reads()).toBe(1);
    // A move by an amount starts from where it is now.
    scroll(10);
    noteScroll(box.element, { top: 5 }, true);
    expect(knownScrollOf(box)).toEqual({ start: 0, top: 15 });
    box.dispose();
  });
});
