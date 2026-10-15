import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { GroupBox } from './GroupBox';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

async function settle() {
  for (let i = 0; i < 4; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

describe('GroupBox', () => {
  it('is a fieldset whose legend is the caption, with the content inside the frame', async () => {
    const g = new GroupBox({ text: 'Shipping', childs: [<input name="street" />] });
    hosts.push(mountHost(g));
    await settle();
    expect(g.element.tagName).toBe('FIELDSET');
    const legend = g.element.querySelector('legend')!;
    expect(legend.textContent).toBe('Shipping');
    expect(g.element.firstElementChild).toBe(legend);
    expect(g.element.querySelector('[name=street]')!.parentElement).toBe(g.element);
  });

  it('controls added in code go inside the frame, after the caption', async () => {
    const g = new GroupBox({ text: 'Options' });
    hosts.push(mountHost(g));
    await settle();
    const reset = new Button({ text: 'Reset' });
    g.controls.add(reset);
    await settle();
    expect(reset.element.parentElement).toBe(g.element);
    expect(g.element.firstElementChild!.tagName).toBe('LEGEND');
  });

  it('hides an empty caption and updates it from code', async () => {
    const g = new GroupBox();
    hosts.push(mountHost(g));
    await settle();
    const legend = g.element.querySelector('legend')!;
    expect(legend.hidden).toBe(true);
    g.text = 'Now';
    expect(legend.hidden).toBe(false);
    expect(legend.textContent).toBe('Now');
  });

  it('has an access key that focuses its first control', async () => {
    const g = new GroupBox({ text: '&Address', childs: [<input name="street" />] });
    hosts.push(mountHost(g));
    await settle();
    expect(g.element.getAttribute('aria-keyshortcuts')).toBe('Alt+A');
    expect(g.element.querySelector('.mx-access-key')!.textContent).toBe('A');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(g.element.querySelector('[name=street]'));
  });

  it('tells the caption how much start padding to step back over', () => {
    const g = new GroupBox({ text: 'x', padding: 'sm xl' });
    expect(g.element.style.padding).toBe('var(--mx-space-3) var(--mx-space-8)');
    expect(g.element.style.getPropertyValue('--_mx-pad-left')).toBe('var(--mx-space-8)');
    expect(g.element.style.getPropertyValue('--_mx-pad-right')).toBe('var(--mx-space-8)');
  });

  it('docks its children like a Panel, leaving the caption alone', async () => {
    const top = new Button({ text: 'top', dock: 'top' });
    const g = new GroupBox({ text: 'Dock', childs: [top] });
    hosts.push(mountHost(g));
    await settle();
    expect(g.element.hasAttribute('data-mx-docking')).toBe(true);
    expect(top.element.style.gridRow).toBe('1 / 2');
    expect(g.element.querySelector('legend')!.style.gridRow).toBe('');
  });
});
