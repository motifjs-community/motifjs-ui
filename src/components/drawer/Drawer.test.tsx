import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { Drawer } from './Drawer';

let hosts: Component[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await uiLocale.use('en');
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

/** A container at 0,0 of 400 x 600, its panel 300 wide (jsdom lays nothing out). */
function room(): HTMLDivElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => new DOMRect(0, 0, 400, 600);
  document.body.append(el);
  return el;
}

function sized(drawer: Drawer, width = 300) {
  drawer.panelElement.getBoundingClientRect = () => new DOMRect(0, 0, width, 600);
  return drawer;
}

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

let clock = 1000;
function touch(el: Element, type: string, x: number, y: number, at?: number) {
  clock = at ?? clock + 16;
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  const point = { identifier: 3, clientX: x, clientY: y, target: el };
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { touches: type === 'touchend' ? [] : [point], changedTouches: [point] });
  el.dispatchEvent(e);
  return e;
}

const shift = (d: Drawer) => d.panelElement.style.getPropertyValue('--_shift-x');

describe('Drawer', () => {
  it('slides in from the start over its container, modal, and closes with Escape and the scrim', async () => {
    const box = room();
    const before = document.createElement('button');
    box.append(before);
    before.focus();
    const state = reactive({ open: false });
    const reasons: string[] = [];
    let drawer!: Drawer;
    page(<Drawer ref={(d: Drawer) => (drawer = d)} title="Navigation" container={box} x-model={() => state.open} onClosed={(e) => void reasons.push(e.reason)} />);
    await settle();
    expect(drawer.element.dataset.side).toBe('start');
    expect(drawer.element.dataset.mode).toBe('over');
    state.open = true;
    await settle();
    expect(drawer.isOpen).toBe(true);
    expect(drawer.modal).toBe(true);
    expect(drawer.panelElement.getAttribute('aria-modal')).toBe('true');
    expect(before.hasAttribute('inert')).toBe(true);
    expect(drawer.focusWithin).toBe(true);
    drawer.panelElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(state.open).toBe(false);
    expect(document.activeElement).toBe(before);
    drawer.open();
    drawer.element.querySelector<HTMLElement>('.mx-drawer__scrim')!.click();
    expect(drawer.isOpen).toBe(false);
    expect(reasons).toEqual(['escape', 'scrim']);
  });

  it('x-model follows it opened from code, so the model can close it', async () => {
    const state = reactive({ open: false });
    let drawer!: Drawer;
    page(<Drawer ref={(d: Drawer) => (drawer = d)} title="Navigation" x-model={() => state.open} />);
    await settle();
    drawer.open();
    expect(state.open).toBe(true);
    state.open = false;
    await settle();
    expect(drawer.isOpen).toBe(false);
  });

  it('names its side for the reading direction: left is the end in a right-to-left page', async () => {
    const drawer = new Drawer({ side: 'left' });
    page(drawer);
    await settle();
    expect(drawer.element.dataset.side).toBe('start');
    document.documentElement.dir = 'rtl';
    drawer.side = 'right';
    expect(drawer.element.dataset.side).toBe('start');
    drawer.side = 'left';
    expect(drawer.element.dataset.side).toBe('end');
    document.documentElement.dir = '';
    drawer.side = 'bottom';
    expect(drawer.element.dataset.side).toBe('bottom');
    drawer.size = '18rem';
    expect(drawer.panelElement.style.getPropertyValue('--_size')).toBe('18rem');
    drawer.size = 280;
    expect(drawer.panelElement.style.getPropertyValue('--_size')).toBe('280px');
    expect(drawer.panelElement.getAttribute('aria-label')).toBe('Side panel');
    await uiLocale.use('tr');
    drawer.side = 'top';
    expect(drawer.panelElement.getAttribute('aria-label')).toBe('Yan panel');
  });

  it('pushes its target aside in push mode, and is not modal there unless asked', async () => {
    const box = room();
    const content = document.createElement('main');
    box.append(content);
    const drawer = sized(new Drawer({ container: box, mode: 'push', pushTarget: content }));
    page(drawer);
    await settle();
    expect(drawer.modal).toBe(false);
    drawer.open();
    expect(content.hasAttribute('data-mx-drawer-push')).toBe(true);
    expect(content.style.getPropertyValue('--_mx-push')).toBe('300px 0px');
    expect(content.hasAttribute('inert')).toBe(false);
    drawer.close();
    await settle();
    expect(content.hasAttribute('data-mx-drawer-push')).toBe(false);
    drawer.modal = true;
    drawer.open();
    expect(content.hasAttribute('inert')).toBe(true);
  });

  it('opens with a finger swiped in from the edge, following it, and goes back when let go early', async () => {
    const box = room();
    const drawer = sized(new Drawer({ container: box, edgeSwipe: true, modal: false }));
    page(drawer);
    await settle();
    // Away from the edge: nothing.
    touch(box, 'touchstart', 60, 300, 1000);
    expect(touch(box, 'touchmove', 120, 300).defaultPrevented).toBe(false);
    touch(box, 'touchend', 120, 300);
    expect(drawer.isOpen).toBe(false);
    // From the edge, slowly to 100: it follows, then goes back (less than half).
    touch(box, 'touchstart', 10, 300, 2000);
    expect(touch(box, 'touchmove', 30, 302, 2100).defaultPrevented).toBe(true);
    expect(drawer.isOpen).toBe(true);
    touch(box, 'touchmove', 110, 302, 2300);
    expect(shift(drawer)).toBe('-200px');
    touch(box, 'touchend', 110, 302, 2600);
    expect(drawer.isOpen).toBe(false);
    // Far enough: it stays open.
    touch(box, 'touchstart', 10, 300, 3000);
    touch(box, 'touchmove', 40, 300, 3100);
    touch(box, 'touchmove', 220, 300, 3400);
    touch(box, 'touchend', 220, 300, 3700);
    expect(drawer.isOpen).toBe(true);
    expect(shift(drawer)).toBe('');
  });

  it('closes with a finger swiped back towards its edge, or a flick', async () => {
    const box = room();
    const reasons: string[] = [];
    const drawer = sized(new Drawer({ container: box, onClosed: (e) => void reasons.push(e.reason) }));
    page(drawer);
    await settle();
    drawer.open();
    const panel = drawer.panelElement;
    // A little way back, slowly: it stays.
    touch(panel, 'touchstart', 250, 300, 1000);
    touch(panel, 'touchmove', 230, 300, 1100);
    touch(panel, 'touchmove', 200, 300, 1400);
    touch(panel, 'touchend', 200, 300, 1700);
    expect(drawer.isOpen).toBe(true);
    // A quick flick: it closes.
    touch(panel, 'touchstart', 250, 300, 2000);
    touch(panel, 'touchmove', 230, 300, 2016);
    touch(panel, 'touchmove', 200, 300, 2032);
    touch(panel, 'touchend', 200, 300, 2040);
    expect(drawer.isOpen).toBe(false);
    expect(reasons).toEqual(['swipe']);
    drawer.swipeToClose = false;
    drawer.open();
    touch(panel, 'touchstart', 250, 300, 3000);
    expect(touch(panel, 'touchmove', 100, 300, 3016).defaultPrevented).toBe(false);
    touch(panel, 'touchend', 100, 300, 3030);
    expect(drawer.isOpen).toBe(true);
  });

  it('lets onOpening refuse a swipe from the edge', async () => {
    const box = room();
    const drawer = sized(new Drawer({ container: box, edgeSwipe: true, onOpening: (e) => (e.cancel = true) }));
    page(drawer);
    await settle();
    touch(box, 'touchstart', 5, 300, 1000);
    expect(touch(box, 'touchmove', 40, 300, 1100).defaultPrevented).toBe(false);
    expect(drawer.isOpen).toBe(false);
    expect(drawer.element.hasAttribute('data-dragging')).toBe(false);
  });
});
