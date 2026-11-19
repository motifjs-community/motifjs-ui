import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, settled } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { followPointer } from './follow-pointer';

const hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  delete (window as { ResizeObserver?: unknown }).ResizeObserver;
});

const pointer = (el: EventTarget, type: string, x: number, y: number) =>
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, isPrimary: true }));

/** A part that follows the pointer pressed on it; what it is told is noted in order. */
function handle(frame?: () => { x: number; y: number }) {
  const on = new Component<HTMLDivElement>('div');
  hosts.push(mountHost(on));
  const told: string[] = [];
  on.motif.on('pointerdown', (_, e) => followPointer(on, e, (dx, dy) => told.push(`${dx},${dy}`), (end) => told.push(end.type), frame));
  return { on, el: on.element, told };
}

describe('followPointer', () => {
  it('without a frame tells the pointer’s way on the screen at once, and the event that ends it', () => {
    const { el, told } = handle();
    pointer(el, 'pointerdown', 10, 10);
    pointer(el, 'pointermove', 30, 15);
    expect(told).toEqual(['20,5']);
    pointer(el, 'pointercancel', 30, 15);
    pointer(el, 'pointermove', 50, 15);
    expect(told).toEqual(['20,5', 'pointercancel']);
  });

  it('with a frame counts the way in it: a scroll keeps what is dragged under the pointer, at rest too; the last move lands before the end', async () => {
    // A window that lays pages out.
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: class { observe() {} unobserve() {} disconnect() {} } });
    let top = 200;
    const { on, el, told } = handle(() => ({ x: 100, y: top }));
    pointer(el, 'pointerdown', 10, 10);
    // The scroll watch starts once core tells the part is in the page, a timer turn later; it tells once then, moving nothing.
    await settled();
    expect(told).toEqual([]);
    pointer(el, 'pointermove', 30, 10);
    // Moved in the next measuring round.
    expect(told).toEqual([]);
    measureNow(on);
    expect(told).toEqual(['20,0']);
    // The page scrolls 60 down: the frame goes 60 up and the pointer, at rest, is 60 further into it.
    top = 140;
    document.dispatchEvent(new Event('scroll'));
    measureNow(on);
    expect(told).toEqual(['20,0', '20,60']);
    // A scroll that moves nothing around it tells nothing.
    document.dispatchEvent(new Event('scroll'));
    measureNow(on);
    expect(told).toEqual(['20,0', '20,60']);
    pointer(el, 'pointermove', 30, 20);
    pointer(el, 'pointerup', 30, 20);
    expect(told).toEqual(['20,0', '20,60', '20,70', 'pointerup']);
    // Over: a scroll moves nothing any more.
    top = 100;
    document.dispatchEvent(new Event('scroll'));
    measureNow(on);
    expect(told).toHaveLength(4);
  });
});
