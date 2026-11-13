import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
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
function room(): Component<HTMLDivElement> {
  const box = new Component<HTMLDivElement>('div');
  box.element.getBoundingClientRect = () => new DOMRect(0, 0, 400, 600);
  page(box);
  return box;
}

function sized(drawer: Drawer, width = 300) {
  drawer.panelPart.element.getBoundingClientRect = () => new DOMRect(0, 0, width, 600);
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

const shift = (d: Drawer) => d.panelPart.element.style.getPropertyValue('--_shift-x');

describe('Drawer', () => {
  it('leaves an iframe out of the focus on open, so that Escape still closes it', async () => {
    const state = reactive({ open: false });
    let drawer!: Drawer;
    page(
      <Drawer ref={(d: Drawer) => (drawer = d)} title="Help" container={room()} x-model={() => state.open}>
        <iframe srcdoc="<p>Help</p>" />
      </Drawer>,
    );
    await settle();
    state.open = true;
    await settle();
    expect(document.activeElement).toBe(drawer.panelPart.element);
    drawer.panelPart.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(state.open).toBe(false);
  });

  it('slides in from the start over its container, modal, and closes with Escape and the scrim', async () => {
    // What it makes inert are the container's components.
    const box = room();
    const beforePart = new Component<HTMLButtonElement>('button');
    box.controls.add(beforePart);
    const before = beforePart.element;
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
    expect(drawer.panelPart.element.getAttribute('aria-modal')).toBe('true');
    expect(before.hasAttribute('inert')).toBe(true);
    expect(drawer.focusWithin).toBe(true);
    drawer.panelPart.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(state.open).toBe(false);
    expect(document.activeElement).toBe(before);
    drawer.open();
    drawer.element.querySelector<HTMLElement>('.mx-drawer__scrim')!.click();
    expect(drawer.isOpen).toBe(false);
    expect(reasons).toEqual(['escape', 'scrim']);
  });

  it('x-model follows it opened programmatically, so the model can close it', async () => {
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
    expect(drawer.panelPart.element.style.getPropertyValue('--_size')).toBe('18rem');
    drawer.size = 280;
    expect(drawer.panelPart.element.style.getPropertyValue('--_size')).toBe('280px');
    expect(drawer.panelPart.element.getAttribute('aria-label')).toBe('Side panel');
    await uiLocale.use('tr');
    drawer.side = 'top';
    expect(drawer.panelPart.element.getAttribute('aria-label')).toBe('Yan panel');
  });

  it('pushes its target aside in push mode, and is not modal there unless asked', async () => {
    // What it makes inert are the container's components.
    const box = room();
    const contentPart = new Component<HTMLElement>('main');
    box.controls.add(contentPart);
    const content = contentPart.element;
    const drawer = sized(new Drawer({ container: box, mode: 'push', pushTarget: contentPart }));
    page(drawer);
    await settle();
    expect(drawer.modal).toBe(false);
    drawer.open();
    // It pushes by the panel's size, read in the next measuring round.
    await whenMeasured(drawer);
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
    const area = box.element;
    // Away from the edge: nothing.
    touch(area, 'touchstart', 60, 300, 1000);
    expect(touch(area, 'touchmove', 120, 300).defaultPrevented).toBe(false);
    touch(area, 'touchend', 120, 300);
    expect(drawer.isOpen).toBe(false);
    // From the edge, slowly to 100: it follows, then goes back (less than half).
    touch(area, 'touchstart', 10, 300, 2000);
    expect(touch(area, 'touchmove', 30, 302, 2100).defaultPrevented).toBe(true);
    expect(drawer.isOpen).toBe(true);
    // The panel opened for the finger follows it once it is measured.
    await whenMeasured(drawer);
    touch(area, 'touchmove', 110, 302, 2300);
    expect(shift(drawer)).toBe('-200px');
    touch(area, 'touchend', 110, 302, 2600);
    expect(drawer.isOpen).toBe(false);
    // Far enough: it stays open.
    touch(area, 'touchstart', 10, 300, 3000);
    touch(area, 'touchmove', 40, 300, 3100);
    touch(area, 'touchmove', 220, 300, 3400);
    touch(area, 'touchend', 220, 300, 3700);
    // Let go before the panel was measured: it ends once it is.
    await whenMeasured(drawer);
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
    const panel = drawer.panelPart.element;
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
    touch(box.element, 'touchstart', 5, 300, 1000);
    expect(touch(box.element, 'touchmove', 40, 300, 1100).defaultPrevented).toBe(false);
    expect(drawer.isOpen).toBe(false);
    expect(drawer.element.hasAttribute('data-dragging')).toBe(false);
  });
});
