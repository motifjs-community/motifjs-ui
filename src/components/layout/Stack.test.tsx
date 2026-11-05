import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { Stack } from './Stack';
import { spaceValue } from './space-value';

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

describe('spaceValue', () => {
  it('maps steps to tokens, numbers to pixels and keeps CSS lengths', () => {
    expect(spaceValue('md')).toBe('var(--mx-layout-space-md)');
    expect(spaceValue(12)).toBe('12px');
    expect(spaceValue('1.5rem')).toBe('1.5rem');
    expect(spaceValue('xs 8 2rem')).toBe('var(--mx-layout-space-xs) 8px 2rem');
    expect(spaceValue(undefined)).toBe('');
  });
});

describe('Stack', () => {
  it('lays out its JSX children and the ones added programmatically', async () => {
    let stack!: Stack;
    page(
      <Stack ref={(s: Stack) => (stack = s)} orientation="horizontal" gap="sm" align="center" justify="end" class="extra">
        <Button text="One" />
        <Button text="Two" grow />
      </Stack>,
    );
    await tick();
    const el = stack.element;
    expect(el.className).toContain('mx-stack');
    expect(el.className).toContain('extra');
    expect({ ...el.dataset }).toMatchObject({ orientation: 'horizontal', align: 'center', justify: 'end' });
    expect(el.style.getPropertyValue('--_gap')).toBe('var(--mx-layout-space-sm)');
    const [one, two] = Array.from(el.children) as HTMLElement[];
    expect(one.textContent).toBe('One');
    expect(one.style.flexGrow).toBe('');
    expect(two.style.flexGrow).toBe('1');

    const three = new Button({ text: 'Three', grow: 2 });
    stack.controls.add(three);
    await tick();
    expect(el.lastElementChild).toBe(three.element);
    expect(three.element.style.flexGrow).toBe('2');
    expect(stack.growOf(three)).toBe(2);
    stack.setGrow(three, false);
    expect(three.element.style.flexGrow).toBe('');
  });

  it('is complete programmatically and follows getter props', async () => {
    const s = reactive({ vertical: false, gap: 4 as number | string, grow: true });
    const stack = new Stack({ orientation: () => (s.vertical ? 'vertical' : 'horizontal'), gap: () => s.gap, wrap: true, reverse: true, inline: true, padding: 'xs md' });
    const child = new Button({ text: 'A', grow: () => s.grow });
    stack.controls.add(child);
    page(stack);
    await tick();
    const el = stack.element;
    expect(el.dataset.orientation).toBe('horizontal');
    expect(el.hasAttribute('data-wrap') && el.hasAttribute('data-reverse') && el.hasAttribute('data-inline')).toBe(true);
    expect(el.style.getPropertyValue('--_gap')).toBe('4px');
    expect(el.style.paddingBlockStart).toBe('var(--mx-layout-space-xs)');
    expect(el.style.paddingInlineEnd).toBe('var(--mx-layout-space-md)');
    expect(el.style.paddingInlineStart).toBe('var(--mx-layout-space-md)');
    expect(child.element.style.flexGrow).toBe('1');

    s.vertical = true;
    s.gap = '2rem';
    s.grow = false;
    await tick();
    expect(el.dataset.orientation).toBe('vertical');
    expect(stack.orientation).toBe('vertical');
    expect(el.style.getPropertyValue('--_gap')).toBe('2rem');
    expect(child.element.style.flexGrow).toBe('');

    stack.gap = undefined;
    stack.wrap = false;
    stack.padding = undefined;
    expect(el.style.getPropertyValue('--_gap')).toBe('');
    expect(el.hasAttribute('data-wrap')).toBe(false);
    expect(el.style.paddingBlockStart).toBe('');
  });

  it('undoes a child setting when the child moves away', async () => {
    const a = new Stack();
    const b = new Stack();
    const child = new Button({ text: 'A', grow: true });
    a.controls.add(child);
    page(a, b);
    await tick();
    expect(child.element.style.flexGrow).toBe('1');
    await a.controls.detach(child);
    expect(child.element.style.flexGrow).toBe('');
  });

  it('takes children added in its ref, before it has read their settings', async () => {
    const child = new Button({ text: 'A', grow: true });
    page(<Stack ref={(c: Stack) => c.controls.add(child)} />);
    await tick();
    expect(child.element.style.flexGrow).toBe('1');
  });

  it('cascades enabled and visible to what is inside', async () => {
    const s = reactive({ on: true });
    let stack!: Stack;
    page(
      <Stack ref={(x: Stack) => (stack = x)} enabled={() => s.on}>
        <Button text="Inside" />
      </Stack>,
    );
    await tick();
    const button = stack.element.querySelector('button')!;
    s.on = false;
    await tick();
    expect(button.disabled).toBe(true);
    s.on = true;
    await tick();
    expect(button.disabled).toBe(false);
  });
});
