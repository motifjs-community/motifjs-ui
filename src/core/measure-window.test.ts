import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mediaOf, onMedia, viewportOf } from './measure';

// What the measuring layer asks of a component's window: media queries and the part of it in sight.

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
  delete (window as { visualViewport?: unknown }).visualViewport;
});

/** A window `matchMedia` whose `(pointer: coarse)` answer the test sets; `legacy` gives the lists `addListener` alone. */
function stubMedia(legacy = false) {
  const state = { coarse: false, listeners: new Set<() => void>() };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => {
      const list: Record<string, unknown> = {
        media: query,
        get matches() {
          return query.includes('coarse') && state.coarse;
        },
      };
      if (legacy) {
        list.addListener = (fn: () => void) => state.listeners.add(fn);
        list.removeListener = (fn: () => void) => state.listeners.delete(fn);
      } else {
        list.addEventListener = (_: string, fn: () => void) => state.listeners.add(fn);
        list.removeEventListener = (_: string, fn: () => void) => state.listeners.delete(fn);
      }
      return list;
    },
  });
  return state;
}

describe('mediaOf and onMedia', () => {
  it('answer false and tell nothing in a window without matchMedia', () => {
    const c = new Component('div');
    expect(mediaOf(c, '(pointer: coarse)')).toBe(false);
    const stop = onMedia(c, '(pointer: coarse)', () => {
      throw new Error('told');
    });
    expect(typeof stop).toBe('function');
    stop();
  });

  for (const legacy of [false, true]) {
    it(`read the window's answer and tell its changes until stopped (${legacy ? 'addListener' : 'addEventListener'})`, () => {
      const media = stubMedia(legacy);
      const c = new Component('div');
      expect(mediaOf(c, '(pointer: coarse)')).toBe(false);
      const told: boolean[] = [];
      const stop = onMedia(c, '(pointer: coarse)', (matches) => told.push(matches));
      media.coarse = true;
      for (const fn of [...media.listeners]) fn();
      expect([mediaOf(c, '(pointer: coarse)'), told]).toEqual([true, [true]]);
      stop();
      expect(media.listeners.size).toBe(0);
    });
  }
});

describe('viewportOf', () => {
  it('is the whole window where the browser has no visual viewport', () => {
    const c = new Component('div');
    const seen = viewportOf(c);
    expect(seen).toEqual({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, right: window.innerWidth, bottom: window.innerHeight, windowWidth: window.innerWidth, windowHeight: window.innerHeight });
  });

  it('is the visual viewport where there is one: an on-screen keyboard leaves the bottom of the window covered', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: { offsetLeft: 0, offsetTop: 10, width: window.innerWidth, height: window.innerHeight - 310 } });
    const seen = viewportOf(new Component('div'));
    expect([seen.top, seen.bottom, seen.windowHeight - seen.bottom]).toEqual([10, window.innerHeight - 300, 300]);
  });
});
