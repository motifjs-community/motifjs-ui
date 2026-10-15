import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { Stack, type StackOrientation } from './Stack';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

describe('Stack', () => {
  it('is vertical by default and follows a bound orientation', async () => {
    const state = reactive({ o: 'vertical' as StackOrientation });
    const s = new Stack({ orientation: () => state.o, childs: [new Button({ text: 'a' })] });
    hosts.push(mountHost(s));
    await tick();
    expect(s.element.classList.contains('mx-stack')).toBe(true);
    expect(s.element.getAttribute('data-orientation')).toBe('vertical');
    state.o = 'horizontal';
    await tick();
    expect(s.element.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('takes gap and padding as token steps or free values', () => {
    const s = new Stack({ gap: 'sm', padding: '0 md' });
    expect(s.element.style.gap).toBe('var(--mx-space-3)');
    expect(s.element.style.padding).toBe('0px var(--mx-space-4)');
    s.gap = 6;
    expect(s.element.style.gap).toBe('6px');
    s.gap = '0.75rem';
    expect(s.element.style.gap).toBe('0.75rem');
  });

  it('writes align, justify and wrap where the CSS binds to them, and can be built in code', async () => {
    const s = new Stack({ orientation: 'horizontal', align: 'end', justify: 'space-between', wrap: true });
    hosts.push(mountHost(s));
    s.controls.add(new Button({ text: 'one' }), new Button({ text: 'two' }));
    await tick();
    expect(s.element.getAttribute('data-align')).toBe('end');
    expect(s.element.getAttribute('data-justify')).toBe('space-between');
    expect(s.element.hasAttribute('data-wrap')).toBe(true);
    expect(s.element.querySelectorAll('button')).toHaveLength(2);
    s.align = undefined;
    s.wrap = false;
    expect(s.element.hasAttribute('data-align')).toBe(false);
    expect(s.element.hasAttribute('data-wrap')).toBe(false);
  });
});
