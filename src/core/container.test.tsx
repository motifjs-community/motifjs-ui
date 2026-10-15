import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { Button } from '../components/button/Button';
import { FocusContainer, tabOrder } from './container';
import { Control } from './control';

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

async function settle() {
  for (let i = 0; i < 3; i++) await tick();
}

class Box extends FocusContainer<HTMLDivElement> {}
class Panel extends Control<HTMLDivElement> {}

const tab = (shift = false) => {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
};

describe('Control: disabled alias and tabIndex', () => {
  it('takes disabled as the inverse of enabled, as prop and property', async () => {
    const state = { busy: true };
    const a = new Button({ text: 'A', disabled: true });
    const b = new Button({ text: 'B', disabled: () => state.busy });
    page(a, b);
    await settle();
    expect(a.element.disabled).toBe(true);
    expect(a.enabled).toBe(false);
    expect(b.disabled).toBe(true);
    a.disabled = false;
    expect(a.element.disabled).toBe(false);
    expect(a.enabled).toBe(true);
  });

  it('lets enabled win when both are given', () => {
    const b = new Button({ text: 'B', enabled: true, disabled: true });
    expect(b.enabled).toBe(true);
  });

  it('writes a non-default tabIndex where containers look for it', () => {
    const b = new Button({ text: 'B', tabIndex: 3 });
    expect(b.element.getAttribute('data-mx-tabindex')).toBe('3');
    b.tabIndex = 0;
    expect(b.element.hasAttribute('data-mx-tabindex')).toBe(false);
  });
});

describe('FocusContainer', () => {
  it('tracks the active control and treats a nested container as one control', async () => {
    const save = new Button({ text: 'Save' });
    const inner = new Button({ text: 'Inner' });
    const nested = new Box({ childs: [inner] });
    const box = new Box({ childs: [save, nested, <input name="plain" />] });
    page(box);
    await settle();

    save.element.focus();
    expect(box.activeControl).toBe(save);
    inner.element.focus();
    expect(box.activeControl).toBe(nested);
    expect(nested.activeControl).toBe(inner);

    box.activeControl = save; // assigning focuses
    expect(document.activeElement).toBe(save.element);
  });

  it('restoreFocus puts focus back where it was', async () => {
    const box = new Box({ childs: [new Button({ text: 'One' }), <input name="two" />] });
    const outside = new Button({ text: 'Outside' });
    page(box, outside);
    await settle();
    const two = box.element.querySelector<HTMLInputElement>('[name=two]')!;
    two.focus();
    outside.element.focus();
    expect(box.restoreFocus()).toBe(true);
    expect(document.activeElement).toBe(two);
  });

  it('restoreFocus falls back to the first control in Tab order', async () => {
    const box = new Box({ childs: [new Button({ text: 'Second', tabIndex: 2 }), new Button({ text: 'First', tabIndex: 1 })] });
    page(box);
    await settle();
    expect(box.restoreFocus()).toBe(true);
    expect(document.activeElement!.textContent).toBe('First');
  });

  it('orders Tab by tabIndex per level of the control tree, ties in document order', async () => {
    const group = new Panel({
      tabIndex: 1,
      childs: [new Button({ text: 'g-b', tabIndex: 2 }), new Button({ text: 'g-a', tabIndex: 1 })],
    });
    const box = new Box({
      childs: [new Button({ text: 'last', tabIndex: 5 }), group, <input name="plain" />, new Button({ text: 'zero' })],
    });
    page(box);
    await settle();
    const names = tabOrder(box.element).map((el) => el.textContent || el.getAttribute('name'));
    expect(names).toEqual(['plain', 'zero', 'g-a', 'g-b', 'last']);
  });

  it('runs Tab in that order and leaves the container after the last one', async () => {
    const a = new Button({ text: 'a', tabIndex: 2 });
    const b = new Button({ text: 'b', tabIndex: 1 });
    const box = new Box({ childs: [a, b] });
    const after = new Button({ text: 'after' });
    page(box, after);
    await settle();

    b.element.focus();
    expect(tab()).toBe(true);
    expect(document.activeElement).toBe(a.element);
    expect(tab()).toBe(true);
    expect(document.activeElement).toBe(after.element);
    a.element.focus();
    expect(tab(true)).toBe(true);
    expect(document.activeElement).toBe(b.element);
  });

  it('leaves Tab to the browser while no control sets a tabIndex', async () => {
    const box = new Box({ childs: [new Button({ text: 'a' }), new Button({ text: 'b' })] });
    page(box);
    await settle();
    (box.element.firstElementChild as HTMLElement).focus();
    expect(tab()).toBe(false);
  });

  it('visits one radio button per group', async () => {
    const box = new Box({
      childs: [
        <input type="radio" name="size" value="s" />,
        <input type="radio" name="size" value="m" checked />,
        <input type="radio" name="size" value="l" />,
        <input type="radio" name="color" value="red" />,
        <input type="radio" name="color" value="blue" />,
      ],
    });
    page(box);
    await settle();
    expect(tabOrder(box.element).map((el) => (el as HTMLInputElement).value)).toEqual(['m', 'red']);
  });
});
