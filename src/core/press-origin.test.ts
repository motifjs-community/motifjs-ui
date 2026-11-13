import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost } from '../../tests/helpers';
import { onLookChanged } from './look-watch';
import { installPressOrigin, showsPresses } from './press-origin';

const hosts: Component<HTMLDivElement>[] = [];
function part(): HTMLElement {
  const button = new Component<HTMLButtonElement>('button');
  showsPresses(button);
  hosts.push(mountHost(button));
  const el = button.element;
  el.getBoundingClientRect = () => ({ left: 10, top: 20, width: 100, height: 40, right: 110, bottom: 60, x: 10, y: 20, toJSON() {} }) as DOMRect;
  Object.defineProperty(el, 'offsetWidth', { value: 100 });
  Object.defineProperty(el, 'offsetHeight', { value: 40 });
  return el;
}

afterEach(async () => {
  for (const host of hosts.splice(0)) await host.dispose();
});

describe('press origin', () => {
  it('writes where a pointer pressed, and takes the mark away when it is let go', () => {
    installPressOrigin();
    const el = part();
    expect(el.hasAttribute('data-mx-press')).toBe(true);
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 40, clientY: 30 }));
    expect(el.hasAttribute('data-pressed')).toBe(true);
    expect([el.style.getPropertyValue('--_press-x'), el.style.getPropertyValue('--_press-y')]).toEqual(['30px', '10px']);
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(el.hasAttribute('data-pressed')).toBe(false);
  });

  it('a key presses from the middle; a part without the mark is left alone', () => {
    installPressOrigin();
    const el = part();
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    expect([el.style.getPropertyValue('--_press-x'), el.style.getPropertyValue('--_press-y')]).toEqual(['50px', '20px']);
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: ' ' }));
    expect(el.hasAttribute('data-pressed')).toBe(false);
    const plain = document.body.appendChild(document.createElement('div'));
    plain.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    expect(plain.hasAttribute('data-pressed')).toBe(false);
    plain.remove();
  });
});

describe('look changes', () => {
  it('tells once after a design language, a theme or a density changes, anywhere', async () => {
    let told = 0;
    const stop = onLookChanged(() => told++);
    document.documentElement.dataset.designLanguage = 'material';
    const inner = document.body.appendChild(document.createElement('div'));
    inner.dataset.theme = 'dark';
    await new Promise((done) => setTimeout(done, 0));
    expect(told).toBe(1);
    stop();
    document.documentElement.removeAttribute('data-design-language');
    await new Promise((done) => setTimeout(done, 0));
    expect(told).toBe(1);
    inner.remove();
  });

  it('tells when fonts finish loading, where the browser can say so', async () => {
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
    let told = 0;
    const stop = onLookChanged(() => told++);
    fonts.dispatchEvent(new Event('loadingdone'));
    await new Promise((done) => setTimeout(done, 0));
    expect(told).toBe(1);
    stop();
    fonts.dispatchEvent(new Event('loadingdone'));
    await new Promise((done) => setTimeout(done, 0));
    expect(told).toBe(1);
    delete (document as { fonts?: unknown }).fonts;
  });
});
