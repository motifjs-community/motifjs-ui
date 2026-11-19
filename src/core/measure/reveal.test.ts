import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { reveal, whenMeasured } from './index';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

/** A strip 400 wide over 825 of content, scrolled to its end, whose scrolls are noted. */
function strip() {
  const scroller = new Component<HTMLDivElement>('div');
  hosts.push(mountHost(scroller));
  const el = scroller.element;
  const sizes = { clientWidth: 400, scrollWidth: 825, clientHeight: 40, scrollHeight: 400, scrollLeft: 425, scrollTop: 0 };
  for (const [name, value] of Object.entries(sizes)) Object.defineProperty(el, name, { configurable: true, value });
  const scrolls: ScrollToOptions[] = [];
  Object.defineProperty(el, 'scrollTo', { configurable: true, value: (to: ScrollToOptions) => scrolls.push(to) });
  return { scroller, scrolls };
}

async function round(scroller: Component) {
  await whenMeasured(scroller);
  for (let i = 0; i < 3; i++) await tick();
}

describe('reveal', () => {
  it('lets a reveal asked for later along the same axis take the place of one not run yet', async () => {
    const { scroller, scrolls } = strip();
    // The first tab is chosen, then the last before the round: the last is in view, so nothing scrolls.
    reveal(scroller, { start: 0, size: 74 }, { axis: 'x' });
    reveal(scroller, { start: 737, size: 88 }, { axis: 'x' });
    await round(scroller);
    expect(scrolls).toEqual([]);
    // Alone, the first one scrolls back to the start.
    reveal(scroller, { start: 0, size: 74 }, { axis: 'x' });
    await round(scroller);
    expect(scrolls).toEqual([{ behavior: 'instant', left: 0 }]);
  });

  it('keeps reveals along different axes, and one taken back does not take back the one after it', async () => {
    const { scroller, scrolls } = strip();
    reveal(scroller, { start: 0, size: 74 }, { axis: 'x' });
    reveal(scroller, { top: 200, height: 40 }, { axis: 'y' });
    await round(scroller);
    expect(scrolls).toEqual([{ behavior: 'instant', left: 0 }, { behavior: 'instant', top: 200 }]);
    const first = reveal(scroller, { start: 0, size: 74 }, { axis: 'x' });
    first();
    first();
    await round(scroller);
    expect(scrolls.length).toBe(2);
  });
});
