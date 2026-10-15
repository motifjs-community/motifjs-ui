import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { trStrings, uiLocale, enStrings } from '../../core/locale';
import { Button } from '../button/Button';
import { SplitContainer, type SplitterMovedEventArgs } from './SplitContainer';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.set(enStrings);
});

async function settle() {
  for (let i = 0; i < 4; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

const splitterOf = (s: SplitContainer) => s.element.querySelector<HTMLElement>('.mx-split__splitter')!;

/** jsdom has no layout: give the container and panel 1 sizes. */
function fakeSizes(s: SplitContainer, total: number, first: () => number) {
  s.element.getBoundingClientRect = () => ({ width: total, height: total }) as DOMRect;
  s.first.element.getBoundingClientRect = () => ({ width: first(), height: first() }) as DOMRect;
  splitterOf(s).getBoundingClientRect = () => ({ width: 4, height: 4 }) as DOMRect;
}

describe('SplitContainer', () => {
  it('puts the first and second children into the two panels around a splitter', async () => {
    const s = new SplitContainer({ childs: [new Button({ text: 'left' }), new Button({ text: 'right' })] });
    hosts.push(mountHost(s));
    await settle();
    const [p1, splitter, p2] = Array.from(s.element.children);
    expect(p1).toBe(s.first.element);
    expect(splitter.classList.contains('mx-split__splitter')).toBe(true);
    expect(p2).toBe(s.second.element);
    expect(s.first.element.textContent).toBe('left');
    expect(s.second.element.textContent).toBe('right');
  });

  it('is filled from code through first / second too', async () => {
    const s = new SplitContainer({ orientation: 'vertical' });
    s.first.controls.add(new Button({ text: 'editor' }));
    hosts.push(mountHost(s));
    await settle();
    s.second.controls.add(new Button({ text: 'output' }));
    await settle();
    expect(s.first.element.textContent).toBe('editor');
    expect(s.second.element.textContent).toBe('output');
    expect(s.element.getAttribute('data-orientation')).toBe('vertical');
    expect(s.element.style.gridTemplateRows).toContain('var(--_mx-splitter-size)');
  });

  it('writes the template from position, min sizes and the fixed panel', async () => {
    const s = new SplitContainer({ position: 240, firstMinSize: 100 });
    hosts.push(mountHost(s));
    await settle();
    expect(s.element.style.gridTemplateColumns).toBe('minmax(100px, 240px) var(--_mx-splitter-size) minmax(25px, 1fr)');
    s.position = '30%';
    expect(s.element.style.gridTemplateColumns).toContain('minmax(100px, 30%)');
  });

  it('collapses either panel and hides the splitter', async () => {
    const s = new SplitContainer();
    hosts.push(mountHost(s));
    await settle();
    s.collapsed = 'first';
    expect(s.first.element.hidden).toBe(true);
    expect(splitterOf(s).hidden).toBe(true);
    expect(s.element.style.gridTemplateColumns).toBe('0px 0px minmax(0, 1fr)');
    s.collapsed = 'none';
    expect(splitterOf(s).hidden).toBe(false);
  });

  it('is an accessible separator, named from the locale', async () => {
    const s = new SplitContainer();
    hosts.push(mountHost(s));
    await settle();
    const sp = splitterOf(s);
    expect(sp.getAttribute('role')).toBe('separator');
    expect(sp.getAttribute('aria-orientation')).toBe('vertical');
    expect(sp.getAttribute('aria-controls')).toBe(s.first.element.id);
    expect(sp.tabIndex).toBe(0);
    expect(sp.getAttribute('aria-label')).toBe('Resize panes');
    uiLocale.set(trStrings);
    await tick();
    expect(sp.getAttribute('aria-label')).toBe('Bölmeleri yeniden boyutlandır');
    s.resizable = false;
    expect(sp.tabIndex).toBe(-1);
    expect(sp.getAttribute('aria-disabled')).toBe('true');
  });

  it('moves with the arrow keys, clamped by the min sizes, and reports it', async () => {
    const moves: SplitterMovedEventArgs[] = [];
    const s = new SplitContainer({ fixedPanel: 'first', position: 200, onSplitterMoved: (e) => moves.push(e) });
    hosts.push(mountHost(s));
    await settle();
    let size = 200;
    fakeSizes(s, 604, () => size);
    const key = (k: string) => splitterOf(s).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

    key('ArrowRight');
    expect(s.position).toBe(210);
    expect(moves.at(-1)!.position).toBe(210);
    expect(splitterOf(s).getAttribute('aria-valuenow')).toBe('35'); // 210 of 600
    size = 210;
    key('Home');
    expect(s.position).toBe(25);
    key('End');
    expect(s.position).toBe(575); // 600 - secondMinSize
  });

  it('keeps the proportion when no panel is fixed', async () => {
    const s = new SplitContainer();
    hosts.push(mountHost(s));
    await settle();
    fakeSizes(s, 404, () => 200);
    splitterOf(s).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(s.position).toBe('51.980%'); // 210 of 404: a track percentage counts the splitter too
  });

  it('drags with the pointer', async () => {
    const s = new SplitContainer({ fixedPanel: 'first', position: 200 });
    hosts.push(mountHost(s));
    await settle();
    fakeSizes(s, 604, () => 200);
    const sp = splitterOf(s);
    sp.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 300, bubbles: true }));
    expect(s.element.hasAttribute('data-dragging')).toBe(true);
    sp.dispatchEvent(new PointerEvent('pointermove', { clientX: 350, bubbles: true }));
    expect(s.position).toBe(250);
    sp.dispatchEvent(new PointerEvent('pointerup', { clientX: 350, bubbles: true }));
    expect(s.element.hasAttribute('data-dragging')).toBe(false);
  });
});
