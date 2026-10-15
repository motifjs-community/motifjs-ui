import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { Panel } from './Panel';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

/** Reactive flushes, then the dock host's microtask, then MutationObserver callbacks. */
async function settle() {
  for (let i = 0; i < 4; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
  for (let i = 0; i < 2; i++) await tick();
}

const area = (el: Element) => [(el as HTMLElement).style.gridRow, (el as HTMLElement).style.gridColumn];

describe('Panel', () => {
  it('takes padding as a token step, pixels or any CSS, in JSX and from code', async () => {
    const state = reactive({ pad: 'md' as string | number });
    const a = new Panel({ padding: () => state.pad });
    const b = new Panel({ padding: 'xs lg' });
    page(a, b);
    await settle();
    expect(a.element.style.padding).toBe('var(--mx-space-4)');
    expect(b.element.style.padding).toBe('var(--mx-space-2) var(--mx-space-6)');
    state.pad = 12;
    await tick();
    expect(a.element.style.padding).toBe('12px');
    a.padding = 'var(--my-pad)';
    expect(a.element.style.padding).toBe('var(--my-pad)');
  });

  it('scrolls its own content with scrollable, reachable by keyboard', () => {
    const p = new Panel({ scrollable: true });
    expect(p.element.hasAttribute('data-scrollable')).toBe(true);
    expect(p.element.getAttribute('tabindex')).toBe('0');
    p.scrollable = false;
    expect(p.element.hasAttribute('data-scrollable')).toBe(false);
    expect(p.element.hasAttribute('tabindex')).toBe(false);
    const quiet = new Panel({ scrollable: true, tabStop: false });
    expect(quiet.element.getAttribute('tabindex')).toBe('-1');
  });

  it('docks children to the edges in document order, fill takes the rest', async () => {
    const top = new Button({ text: 'top', dock: 'top' });
    const left = new Button({ text: 'left', dock: 'start' });
    const bottom = new Button({ text: 'bottom', dock: 'bottom' });
    const right = new Button({ text: 'right', dock: 'end' });
    const fill = new Button({ text: 'fill', dock: 'fill' });
    const p = new Panel({ childs: [top, left, bottom, right, fill] });
    page(p);
    await settle();

    expect(p.element.hasAttribute('data-mx-docking')).toBe(true);
    // 1 top + 1 bottom around the middle; 1 left + 1 right around the middle.
    expect(p.element.style.gridTemplateRows).toBe('auto minmax(0, 1fr) auto');
    expect(p.element.style.gridTemplateColumns).toBe('auto minmax(0, 1fr) auto');
    expect(area(top.element)).toEqual(['1 / 2', '1 / 4']); // full width
    expect(area(left.element)).toEqual(['2 / 4', '1 / 2']); // below top, down to the bottom edge
    expect(area(bottom.element)).toEqual(['3 / 4', '2 / 4']); // right of left
    expect(area(right.element)).toEqual(['2 / 3', '3 / 4']);
    expect(area(fill.element)).toEqual(['2 / 3', '2 / 3']);
  });

  it('follows dock changes and children added later, and clears when nothing docks', async () => {
    const a = new Button({ text: 'a' });
    const p = new Panel({ childs: [a] });
    page(p);
    await settle();
    expect(p.element.hasAttribute('data-mx-docking')).toBe(false);

    a.dock = 'top';
    await settle();
    expect(area(a.element)).toEqual(['1 / 2', '1 / 2']);

    const late = new Button({ text: 'late', dock: 'bottom' });
    p.controls.add(late);
    await settle();
    expect(p.element.style.gridTemplateRows).toBe('auto minmax(0, 1fr) auto');
    expect(area(late.element)).toEqual(['3 / 4', '1 / 2']);

    a.dock = 'none';
    late.dock = 'none';
    await settle();
    expect(p.element.hasAttribute('data-mx-docking')).toBe(false);
    expect(area(a.element)).toEqual(['', '']);
  });

  it('puts flow children in the remaining area and leaves floating ones positioned', async () => {
    const top = new Button({ text: 'top', dock: 'top' });
    const flow = new Button({ text: 'flow' });
    const float = new Button({ text: 'float', dock: 'float', right: 8, bottom: '1rem' });
    const p = new Panel({ childs: [top, flow, float] });
    page(p);
    await settle();
    expect(area(flow.element)).toEqual(['2 / 3', '1 / 2']);
    expect(area(float.element)).toEqual(['', '']);
    expect(float.element.getAttribute('data-dock')).toBe('float');
    expect(float.element.style.right).toBe('8px');
    expect(float.element.style.bottom).toBe('1rem');
  });

  it('docks plain elements by data-dock too', async () => {
    const p = new Panel({ childs: [<header data-dock="top">h</header>, <main data-dock="fill">m</main>] });
    page(p);
    await settle();
    const [header, main] = [p.element.querySelector('header')!, p.element.querySelector('main')!];
    expect(area(header)).toEqual(['1 / 2', '1 / 2']);
    expect(area(main)).toEqual(['2 / 3', '1 / 2']);
  });

  it('every control takes width and height', () => {
    const b = new Button({ text: 'b', width: 120, height: '2rem' });
    expect(b.element.style.width).toBe('120px');
    expect(b.element.style.height).toBe('2rem');
    b.width = undefined;
    expect(b.element.style.width).toBe('');
  });
});
