import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { backButtonHolders, backButtonSettled } from '../../core/back-button';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { TextBox } from '../textbox/TextBox';
import { BottomSheet } from './BottomSheet';

let hosts: Component[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  uiLocale.strings = enStrings;
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  // A sheet closed here takes its history entry back: the next test starts once that has come.
  await until(() => backButtonSettled(window));
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

/** A container 800 pixels high (jsdom lays nothing out). */
function room(height = 800): HTMLDivElement {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
  document.body.append(el);
  return el;
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

function press(key: string, target = document.activeElement as HTMLElement) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

/** A pointer drag on `el`, one move per point, with the clock at `t` + 16 ms a step. */
function drag(el: Element, from: number, points: number[], stepMs = 16) {
  let t = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => t);
  const fire = (type: string, y: number) => el.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, clientY: y, button: 0 }), { pointerId: 1 }));
  fire('pointerdown', from);
  for (const y of points) {
    t += stepMs;
    fire('pointermove', y);
  }
  t += stepMs;
  fire('pointerup', points[points.length - 1] ?? from);
}

/** Waits for a condition, up to 3 s: jsdom's history.back() can take its time when the machine is busy. */
async function until(ok: () => boolean) {
  for (let i = 0; i < 300 && !ok(); i++) await new Promise((r) => setTimeout(r, 10));
}

function touch(el: Element, type: string, x: number, y: number) {
  const point = { identifier: 7, clientX: x, clientY: y, target: el };
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { touches: type === 'touchend' ? [] : [point], changedTouches: [point] });
  el.dispatchEvent(e);
  return e;
}

const size = (s: BottomSheet) => s.panelElement.style.getPropertyValue('--_size');
const handle = (s: BottomSheet) => s.element.querySelector<HTMLElement>('.mx-bottom-sheet__handle')!;

describe('BottomSheet', () => {
  it('opens over its container as a modal dialog named by its title, and closes with Escape giving focus back', async () => {
    const box = room();
    const before = document.createElement('button');
    box.append(before);
    before.focus();
    const log: string[] = [];
    const sheet = new BottomSheet({
      title: 'Filters',
      container: box,
      content: new TextBox({ label: 'Name' }),
      onOpening: () => void log.push('opening'),
      onOpened: () => void log.push('opened'),
      onClosing: (e) => void log.push(`closing ${e.reason}`),
      onClosed: (e) => void log.push(`closed ${e.reason}`),
    });
    page(sheet);
    await settle();
    expect(sheet.element.hidden).toBe(true);
    expect(sheet.open()).toBe(true);
    expect(sheet.isOpen).toBe(true);
    expect(box.contains(sheet.element)).toBe(true);
    expect(sheet.element.hasAttribute('data-contained')).toBe(true);
    const panel = sheet.panelElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(panel.getAttribute('aria-labelledby')!)!.textContent).toBe('Filters');
    // Modal: what is around it is inert, and the first field has focus.
    expect(before.hasAttribute('inert')).toBe(true);
    expect(sheet.element.hasAttribute('data-scrim')).toBe(true);
    expect(document.activeElement?.closest('.mx-text-box')).toBeTruthy();
    expect(windowStack.top()?.modal).toBe(true);
    expect(press('Escape')).toBe(true);
    expect(sheet.isOpen).toBe(false);
    expect(before.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(before);
    expect(sheet.element.hidden).toBe(true);
    expect(log).toEqual(['opening', 'opened', 'closing escape', 'closed escape']);
  });

  it('asks before opening and closing; a refusal keeps it as it was', async () => {
    const box = room();
    const state = reactive({ open: false });
    let sheet!: BottomSheet;
    let refuse = true;
    page(
      <BottomSheet
        ref={(s: BottomSheet) => (sheet = s)}
        label="Tools"
        container={box}
        x-model={() => state.open}
        onOpening={(e) => (e.cancel = refuse)}
        onClosing={(e) => (e.cancel = e.reason === 'scrim')}
      />,
    );
    await settle();
    state.open = true;
    await settle();
    expect(sheet.isOpen).toBe(false);
    expect(state.open).toBe(false);
    refuse = false;
    state.open = true;
    await settle();
    expect(sheet.isOpen).toBe(true);
    expect(sheet.panelElement.getAttribute('aria-label')).toBe('Tools');
    sheet.element.querySelector<HTMLElement>('.mx-bottom-sheet__scrim')!.click();
    expect(sheet.isOpen).toBe(true);
    expect(state.open).toBe(true);
    // The user closing it writes the model.
    press('Escape', sheet.panelElement);
    expect(state.open).toBe(false);
  });

  it('stops at its detents, lowest first, moved by code and by the handle keys', async () => {
    const box = room(800);
    const changes: string[] = [];
    const sheet = new BottomSheet({
      container: box,
      detents: ['full', 200, 'half'],
      onDetentChanged: (e) => void changes.push(`${e.from}>${e.to}${e.byUser ? ' user' : ''}`),
    });
    page(sheet);
    await settle();
    sheet.open();
    // Opens at the first one given.
    expect(sheet.detent).toBe('full');
    expect(size(sheet)).toBe('800px');
    expect(sheet.collapse()).toBe(true);
    expect(sheet.detent).toBe('half');
    expect(size(sheet)).toBe('400px');
    handle(sheet).focus();
    expect(press('ArrowDown')).toBe(true);
    expect(sheet.detent).toBe(200);
    expect(sheet.collapse()).toBe(false);
    press('End');
    expect(sheet.detent).toBe('full');
    expect(handle(sheet).getAttribute('aria-valuetext')).toBe('Full height');
    expect(handle(sheet).getAttribute('aria-valuenow')).toBe('100');
    press('Home');
    expect(handle(sheet).getAttribute('aria-valuetext')).toBe('200px high');
    expect(handle(sheet).getAttribute('aria-valuenow')).toBe('25');
    expect(changes).toEqual(['full>half', 'half>200 user', '200>full user', 'full>200 user']);
  });

  it('lets a listener refuse a height or change it', async () => {
    const box = room(800);
    const sheet = new BottomSheet({ container: box, detents: ['peek', 'half', 'full'] });
    sheet.onDetentChanging((e) => {
      if (e.to === 'full') e.cancel = true;
      if (e.to === 'peek') e.to = 'half';
    });
    page(sheet);
    await settle();
    sheet.snapTo('half');
    expect(sheet.isOpen).toBe(true);
    expect(sheet.snapTo('full')).toBe(false);
    expect(sheet.detent).toBe('half');
    sheet.snapTo('peek');
    expect(sheet.detent).toBe('half');
  });

  it('follows the finger and the mouse by its handle: snaps to the nearest height, a flick goes on, far down closes', async () => {
    const box = room(800);
    const reasons: string[] = [];
    const sheet = new BottomSheet({ container: box, detents: [200, 400, 'full'], detent: 400, onClosed: (e) => void reasons.push(e.reason) });
    page(sheet);
    await settle();
    sheet.open();
    // Slowly up by 150: nearest is 400 + 150 = 550 → 400 (half way is 600).
    drag(handle(sheet), 500, [450, 400, 350], 200);
    expect(sheet.detent).toBe(400);
    // A quick flick up goes to the next one.
    drag(handle(sheet), 500, [490, 470], 16);
    expect(sheet.detent).toBe('full');
    // Slowly down to 250: nearest 200.
    drag(handle(sheet), 100, [300, 500, 650], 200);
    expect(sheet.detent).toBe(200);
    // Dragged past half of the lowest: it closes.
    drag(handle(sheet), 600, [700, 760], 200);
    expect(sheet.isOpen).toBe(false);
    expect(reasons).toEqual(['swipe']);
  });

  it('keeps open when swipeToClose is off, and a tap on the handle goes to the next height', async () => {
    const box = room(800);
    const sheet = new BottomSheet({ container: box, detents: [200, 'full'], swipeToClose: false });
    page(sheet);
    await settle();
    sheet.open();
    drag(handle(sheet), 600, [700, 790], 200);
    expect(sheet.isOpen).toBe(true);
    expect(sheet.detent).toBe(200);
    drag(handle(sheet), 600, []);
    expect(sheet.detent).toBe('full');
    drag(handle(sheet), 600, []);
    expect(sheet.detent).toBe(200);
    sheet.draggable = false;
    drag(handle(sheet), 600, [300], 200);
    expect(sheet.detent).toBe(200);
  });

  it('takes a finger on its content along when the content is at its top, and lets it scroll otherwise', async () => {
    const box = room(800);
    const sheet = new BottomSheet({ container: box, detents: [200, 400], detent: 400, flickSpeed: 100 });
    page(sheet);
    await settle();
    sheet.open();
    const body = sheet.contentElement;
    touch(body, 'touchstart', 50, 300);
    const move = touch(body, 'touchmove', 50, 340);
    expect(move.defaultPrevented).toBe(true);
    touch(body, 'touchmove', 50, 420);
    expect(size(sheet)).toBe('280px');
    touch(body, 'touchend', 50, 420);
    expect(sheet.detent).toBe(200);
    // Sideways: not the sheet's.
    touch(body, 'touchstart', 50, 300);
    expect(touch(body, 'touchmove', 90, 302).defaultPrevented).toBe(false);
    touch(body, 'touchend', 90, 302);
    sheet.dragContent = false;
    touch(body, 'touchstart', 50, 300);
    expect(touch(body, 'touchmove', 50, 260).defaultPrevented).toBe(false);
    touch(body, 'touchend', 50, 260);
    expect(sheet.detent).toBe(200);
  });

  it('closes on the browser back, through one history entry it takes back when closed otherwise', async () => {
    const box = room();
    const reasons: string[] = [];
    const sheet = new BottomSheet({ container: box, onClosed: (e) => void reasons.push(e.reason) });
    page(sheet);
    await settle();
    sheet.open();
    expect(history.state?.mxBack).toBe(1);
    expect(backButtonHolders(window)).toBe(1);
    history.back();
    await until(() => !sheet.isOpen);
    expect(sheet.isOpen).toBe(false);
    expect(reasons).toEqual(['back']);
    expect(backButtonHolders(window)).toBe(0);
    sheet.open();
    expect(history.state?.mxBack).toBeGreaterThan(0);
    sheet.close();
    await until(() => !history.state?.mxBack);
    expect(history.state?.mxBack ?? 0).toBe(0);
    expect(backButtonHolders(window)).toBe(0);
    sheet.closeOnBack = false;
    sheet.open();
    expect(backButtonHolders(window)).toBe(0);
  }, 15_000);

  it('opens over the page as a popover-less layer when there is no container, non-modal when asked', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    const sheet = new BottomSheet({ modal: false, title: 'Notes' });
    sheet.open();
    expect(sheet.element.isConnected).toBe(true);
    expect(sheet.element.hasAttribute('data-contained')).toBe(false);
    expect(sheet.panelElement.hasAttribute('aria-modal')).toBe(false);
    expect(sheet.element.hasAttribute('data-scrim')).toBe(false);
    expect(outside.hasAttribute('inert')).toBe(false);
    // Non-modal: focus stays where it was unless asked.
    expect(sheet.focusWithin).toBe(false);
    sheet.close();
    await sheet.dispose();
  });

  it('is disposed after closing when show() put it in its host', async () => {
    const box = room();
    const host = page();
    const sheet = new BottomSheet({ container: box });
    expect(sheet.show(host)).toBe(true);
    expect(sheet.parent).toBe(host);
    sheet.close();
    await settle();
    expect(sheet.isDisposed).toBe(true);
  });

  it('writes its texts in the page language', async () => {
    const box = room();
    const sheet = new BottomSheet({ container: box, detents: ['half'], showClose: true });
    page(sheet);
    await settle();
    sheet.open();
    expect(handle(sheet).getAttribute('aria-label')).toBe('Sheet height');
    expect(sheet.panelElement.getAttribute('aria-label')).toBe('Sheet');
    uiLocale.strings = trStrings;
    await settle();
    expect(handle(sheet).getAttribute('aria-label')).toBe('Panel yüksekliği');
    expect(handle(sheet).getAttribute('aria-valuetext')).toBe('Yarım yükseklik');
    expect(sheet.element.querySelector('.mx-bottom-sheet__close')!.getAttribute('aria-label')).toBe('Kapat');
    sheet.element.querySelector<HTMLElement>('.mx-bottom-sheet__close button, button.mx-bottom-sheet__close')!.click();
    expect(sheet.isOpen).toBe(false);
  });

  it('closes when its owner goes away, open or not', async () => {
    const box = room();
    const reasons: string[] = [];
    const sheet = new BottomSheet({ container: box, onClosed: (e) => void reasons.push(e.reason) });
    const host = page(sheet);
    await settle();
    sheet.open();
    await host.dispose();
    expect(reasons).toEqual(['owner']);
    expect(box.querySelector('[inert]')).toBe(null);
  });
});
