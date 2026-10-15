import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button, type ButtonVariant } from './Button';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) await host.dispose();
  document.body.innerHTML = '';
});

describe('Button', () => {
  it('renders the class and the default data attributes the CSS binds to', async () => {
    const host = mountHost(<Button>Save</Button>);
    hosts.push(host);
    await tick();
    const el = host.element.querySelector('button')!;
    expect(el.classList.contains('mx-button')).toBe(true);
    expect(el.getAttribute('type')).toBe('button');
    expect(el.getAttribute('data-variant')).toBe('solid');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-tone')).toBe('neutral');
    expect(el.textContent).toBe('Save');
  });

  it('follows reactive variant/enabled props without re-rendering', async () => {
    const state = reactive({ variant: 'outline' as ButtonVariant, busy: false });
    const host = mountHost(
      <Button variant={() => state.variant} tone="danger" enabled={() => !state.busy}>
        Delete
      </Button>,
    );
    hosts.push(host);
    await tick();
    const el = host.element.querySelector('button')!;
    expect(el.getAttribute('data-variant')).toBe('outline');
    expect(el.getAttribute('data-tone')).toBe('danger');
    expect(el.disabled).toBe(false);

    state.variant = 'ghost';
    state.busy = true;
    await tick();
    expect(el.getAttribute('data-variant')).toBe('ghost');
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute('data-disabled')).toBe(true);
  });

  it('can be created in code and added later, like any component', async () => {
    const host = mountHost();
    hosts.push(host);
    let clicks = 0;
    const retry = new Button({ tone: 'accent', text: 'Retry' });
    retry.motif.on('click', () => clicks++);
    host.controls.add(retry);
    await tick();
    const el = host.element.querySelector('button')!;
    expect(el.textContent).toBe('Retry');
    expect(el.getAttribute('data-tone')).toBe('accent');
    el.click();
    expect(clicks).toBe(1);

    // Changed from code afterwards.
    retry.text = 'Retry (2)';
    retry.enabled = false;
    expect(el.textContent).toBe('Retry (2)');
    expect(el.disabled).toBe(true);
    retry.enabled = true;
    expect(el.disabled).toBe(false);
  });

  it('takes text set before it is shown, and children when there is no text', async () => {
    const early = new Button();
    early.text = 'Early';
    const host = mountHost(early, <Button>Child</Button>);
    hosts.push(host);
    await tick();
    const [a, b] = host.element.querySelectorAll('button');
    expect(a.textContent).toBe('Early');
    expect(b.textContent).toBe('Child');
  });
});
