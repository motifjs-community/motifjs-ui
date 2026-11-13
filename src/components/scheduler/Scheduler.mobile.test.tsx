import { afterEach, describe, expect, it, vi } from 'vitest';
import { Component } from '@motifx/core';
import { mount, mountHost } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
import { windowStack } from '../../core/window-stack';
import { Scheduler } from './Scheduler';
import { SchedulerTouch } from './view/SchedulerTouch';
import type { TouchHost } from './view/touch-host';

interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const settle = async () => {
  await tick();
  await new Promise((r) => setTimeout(r, 0));
  await tick();
};
const made: Scheduler<Meeting>[] = [];

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Meeting>({
    currentDate: at(28, 0),
    firstDayOfWeek: 1,
    locale: 'en-GB',
    views: ['day', 'week', 'month', 'agenda'],
    appointments: [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 9, 30) }],
    ...props,
  });
  made.push(scheduler);
  return mount(scheduler);
}

/** A `(pointer: coarse)` media query that answers `coarse`, telling its listeners when `set` changes it. */
function screen(coarse: boolean) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes('coarse') && coarse;
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }),
  });
  return {
    set(on: boolean) {
      coarse = on;
      for (const fn of listeners) fn();
    },
  };
}

/** The scheduler's element measures `width` pixels (its size watch reads the border box first). */
function wide(width: number) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('mx-scheduler') ? width : 0;
  });
}

const shown = (s: Scheduler<Meeting>, selector: string) => !!s.element.querySelector(selector);

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('Scheduler: presentation', () => {
  it('as on a phone shows the agenda and the compact bar; back as on a desktop, the view it had', async () => {
    const s = make({ presentation: 'phone' });
    await settle();
    expect(s.currentPresentation).toBe('phone');
    expect(s.element.dataset.presentation).toBe('phone');
    expect(s.currentView).toBe('agenda');
    expect(shown(s, '.mx-scheduler__view-menu')).toBe(true);
    expect(shown(s, '.mx-scheduler__view-button')).toBe(false);
    expect(shown(s, '.mx-scheduler__step')).toBe(false);
    expect(shown(s, '.mx-scheduler__today-icon')).toBe(true);
    expect(s.element.querySelector('.mx-scheduler__title')!.textContent).toBe('October');
    s.presentation = 'desktop';
    await settle();
    expect(s.currentView).toBe('week');
    expect(shown(s, '.mx-scheduler__view-button')).toBe(true);
    expect(shown(s, '.mx-scheduler__view-menu')).toBe(false);
  });

  it('keeps the view the user chose as on a phone; a phone without an agenda shows a day', async () => {
    const s = make({ presentation: 'phone' });
    await settle();
    s.showView('month');
    s.presentation = 'desktop';
    await settle();
    expect(s.currentView).toBe('month');
    const t = make({ presentation: 'phone', views: ['week', 'day'] });
    await settle();
    expect(t.currentView).toBe('day');
  });

  it("goes by its own width and the screen's pointer, and asks first", async () => {
    const pointer = screen(false);
    wide(820);
    const said: string[] = [];
    const s = make({ onPresentationChanged: (e: { from: string; to: string; width: number }) => said.push(`${e.from}>${e.to}@${e.width}`) });
    await settle();
    // Its width is read with the window's next frame.
    await whenMeasured(s);
    // Narrow with a mouse: a desktop.
    expect(s.currentPresentation).toBe('desktop');
    pointer.set(true);
    await settle();
    expect(s.currentPresentation).toBe('tablet');
    expect(s.currentView).toBe('week');
    s.tabletView = 'month';
    s.phoneWidth = 900;
    await settle();
    expect(s.currentPresentation).toBe('phone');
    expect(said).toEqual(['desktop>tablet@820', 'tablet>phone@820']);
    s.onPresentationChanging((e) => (e.cancel = true));
    s.phoneWidth = 560;
    await settle();
    expect(s.currentPresentation).toBe('phone');
  });

  it('opens the tooltip in an action sheet and the form in a bottom sheet, as on a phone', async () => {
    const s = make({ presentation: 'phone', currentView: 'day', phoneView: null });
    await settle();
    expect(s.currentView).toBe('day');
    s.showTooltip(s.appointments[0], s);
    await settle();
    const sheet = s.element.querySelector<HTMLElement>('.mx-scheduler__tooltip-sheet');
    expect(sheet?.classList.contains('mx-action-sheet')).toBe(true);
    expect(sheet!.querySelector('.mx-action-sheet__message')!.textContent).toContain('09:00');
    expect([...sheet!.querySelectorAll('.mx-menu__label')].map((l) => l.textContent)).toEqual(['Edit', 'Delete']);
    s.hideTooltip();
    let form: unknown = null;
    s.onFormOpening((e) => (form = e.form));
    void s.showAppointmentForm(s.appointments[0]);
    await settle();
    expect((form as HTMLElement | null) && (form as { element: HTMLElement }).element.classList.contains('mx-bottom-sheet')).toBe(true);
    expect((form as { element: HTMLElement }).element.classList.contains('mx-scheduler__form-sheet')).toBe(true);
  });
});

/** A touch event at the given fingers (jsdom has no `Touch`). */
function touch(type: string, target: Element, points: { x: number; y: number; id?: number }[]) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  const list = points.map((p, i) => ({ identifier: p.id ?? i, clientX: p.x, clientY: p.y, target }));
  Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : list });
  Object.defineProperty(e, 'changedTouches', { value: list });
  target.dispatchEvent(e);
  return e;
}

function gestures(overrides: Partial<TouchHost> = {}) {
  const scrollerPart = new Component<HTMLDivElement>('div');
  const contentPart = new Component<HTMLDivElement>('div');
  const rootPart = mountHost(contentPart);
  contentPart.controls.add(scrollerPart);
  const root = rootPart.element;
  const content = contentPart.element;
  const scroller = scrollerPart.element;
  root.className = 'mx-scheduler';
  content.className = 'mx-scheduler__content';
  Object.defineProperty(content, 'clientWidth', { value: 400 });
  const log: string[] = [];
  let zoom = 1;
  const host: TouchHost = {
    root: () => rootPart,
    content: () => contentPart,
    scroller: () => scrollerPart,
    kind: () => 'time',
    dragging: () => false,
    swipeNavigation: () => true,
    pinchZoom: () => true,
    rtl: () => false,
    zoom: () => zoom,
    zoomChanging: () => true,
    setZoom: (z) => (zoom = z),
    zoomChanged: (from, to) => log.push(`zoomed ${from}>${to}`),
    swiping: (x, next, ready) => log.push(x === null ? 'swipe over' : `swipe ${x} ${next ? 'next' : 'previous'}${ready ? ' ready' : ''}`),
    step: (by) => log.push(`step ${by}`),
    ...overrides,
  };
  const touchy = new SchedulerTouch(host);
  const stop = touchy.attach();
  return { root, content, scroller, log, touchy, stop, zoom: () => zoom };
}

describe('Scheduler: a finger', () => {
  it('a swipe sideways moves on, past a quarter of the view or as a flick; a little one goes back', () => {
    const g = gestures();
    touch('touchstart', g.scroller, [{ x: 300, y: 100 }]);
    touch('touchmove', g.scroller, [{ x: 280, y: 102 }]);
    const move = touch('touchmove', g.scroller, [{ x: 180, y: 104 }]);
    expect(move.defaultPrevented).toBe(true);
    touch('touchend', g.scroller, [{ x: 180, y: 104 }]);
    expect(g.log).toEqual(['swipe -10 next', 'swipe -60 next ready', 'swipe over', 'step 1']);
    expect(g.touchy.justSwiped).toBe(true);
    g.log.length = 0;
    touch('touchstart', g.scroller, [{ x: 100, y: 100 }]);
    touch('touchmove', g.scroller, [{ x: 130, y: 100 }]);
    // Held still a moment before letting go: no flick.
    vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 500);
    touch('touchend', g.scroller, [{ x: 130, y: 100 }]);
    expect(g.log).toEqual(['swipe 15 previous', 'swipe over']);
    g.stop();
  });

  it('a swipe up or down scrolls, and a view that can still scroll sideways scrolls first', () => {
    const g = gestures();
    touch('touchstart', g.scroller, [{ x: 200, y: 300 }]);
    const down = touch('touchmove', g.scroller, [{ x: 205, y: 200 }]);
    touch('touchend', g.scroller, [{ x: 205, y: 100 }]);
    expect(down.defaultPrevented).toBe(false);
    Object.defineProperty(g.scroller, 'scrollWidth', { value: 900 });
    Object.defineProperty(g.scroller, 'clientWidth', { value: 400 });
    touch('touchstart', g.scroller, [{ x: 300, y: 100 }]);
    const side = touch('touchmove', g.scroller, [{ x: 150, y: 100 }]);
    touch('touchend', g.scroller, [{ x: 150, y: 100 }]);
    expect(side.defaultPrevented).toBe(false);
    expect(g.log).toEqual([]);
    g.stop();
  });

  it('right to left, a finger moving right brings the next days', () => {
    const g = gestures({ rtl: () => true });
    touch('touchstart', g.scroller, [{ x: 100, y: 100 }]);
    touch('touchmove', g.scroller, [{ x: 250, y: 100 }]);
    touch('touchend', g.scroller, [{ x: 250, y: 100 }]);
    expect(g.log.slice(-1)).toEqual(['step 1']);
    g.stop();
  });

  it('two fingers zoom the hours, asking first; refused, the page zooms', () => {
    const g = gestures();
    touch('touchstart', g.scroller, [
      { x: 100, y: 100, id: 1 },
      { x: 100, y: 200, id: 2 },
    ]);
    const move = touch('touchmove', g.scroller, [
      { x: 100, y: 50, id: 1 },
      { x: 100, y: 250, id: 2 },
    ]);
    expect(move.defaultPrevented).toBe(true);
    expect(g.zoom()).toBe(2);
    touch('touchend', g.scroller, [{ x: 100, y: 50, id: 1 }]);
    expect(g.log).toEqual(['zoomed 1>2']);
    g.stop();
    const refused = gestures({ zoomChanging: () => false });
    touch('touchstart', refused.scroller, [
      { x: 0, y: 100, id: 1 },
      { x: 0, y: 200, id: 2 },
    ]);
    const kept = touch('touchmove', refused.scroller, [
      { x: 0, y: 0, id: 1 },
      { x: 0, y: 300, id: 2 },
    ]);
    expect(kept.defaultPrevented).toBe(false);
    expect(refused.zoom()).toBe(1);
    refused.stop();
  });

  it('a drag keeps the page still; a finger marks the scheduler and a mouse unmarks it; a long press opens no menu', () => {
    let dragging = false;
    const g = gestures({ dragging: () => dragging });
    const down = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(down, 'pointerType', { value: 'touch' });
    g.scroller.dispatchEvent(down);
    expect(g.root.hasAttribute('data-touch')).toBe(true);
    const menu = new Event('contextmenu', { bubbles: true, cancelable: true });
    g.scroller.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
    dragging = true;
    touch('touchstart', g.scroller, [{ x: 10, y: 10 }]);
    expect(touch('touchmove', g.scroller, [{ x: 10, y: 80 }]).defaultPrevented).toBe(true);
    const move = new Event('pointermove', { bubbles: true });
    Object.defineProperty(move, 'pointerType', { value: 'mouse' });
    g.scroller.dispatchEvent(move);
    expect(g.root.hasAttribute('data-touch')).toBe(false);
    g.stop();
  });

  it('the zoom is a setting kept between 0.5 and 4, written on the scheduler', async () => {
    const s = make({ timeZoom: 2 });
    await settle();
    expect(s.element.style.getPropertyValue('--_zoom')).toBe('2');
    s.timeZoom = 9;
    await settle();
    expect(s.timeZoom).toBe(4);
    s.timeZoom = 1;
    await settle();
    expect(s.element.style.getPropertyValue('--_zoom')).toBe('');
  });
});
