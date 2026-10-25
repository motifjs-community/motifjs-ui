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

describe('Panel', () => {
  it('is a plain container from JSX and from code', async () => {
    let panel!: Panel;
    page(
      <Panel ref={(p: Panel) => (panel = p)} padding="md" variant="card">
        <Button text="Inside" />
      </Panel>,
    );
    await tick();
    const el = panel.element;
    expect(el.className).toContain('mx-panel');
    expect(el.dataset.variant).toBe('card');
    expect(el.style.paddingBlockStart).toBe('var(--mx-layout-space-md)');
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(el.getAttribute('role')).toBe(null);

    const coded = new Panel({ text: 'Messages' });
    coded.controls.add(new Button({ text: 'Later' }));
    page(coded);
    await tick();
    expect(coded.element.getAttribute('role')).toBe('region');
    expect(coded.element.getAttribute('aria-label')).toBe('Messages');
    expect(coded.element.querySelector('button')?.textContent).toBe('Later');
    coded.text = '';
    expect(coded.element.getAttribute('role')).toBe(null);
  });

  it('scrolls and is then a Tab stop, unless tabStop is off', async () => {
    const s = reactive({ scroll: true as boolean | 'vertical' });
    const panel = new Panel({ scrollable: () => s.scroll });
    page(panel);
    await tick();
    expect(panel.element.dataset.scroll).toBe('both');
    expect(panel.element.tabIndex).toBe(0);
    s.scroll = 'vertical';
    await tick();
    expect(panel.element.dataset.scroll).toBe('vertical');
    panel.tabStop = false;
    expect(panel.element.getAttribute('tabindex')).toBe('-1');
    panel.tabStop = true;
    expect(panel.element.getAttribute('tabindex')).toBe('0');
    s.scroll = false;
    await tick();
    expect(panel.element.hasAttribute('data-scroll')).toBe(false);
    expect(panel.element.hasAttribute('tabindex')).toBe(false);
  });

  it('disables and hides everything inside', async () => {
    const panel = new Panel({ scrollable: true });
    const button = new Button({ text: 'Go' });
    panel.controls.add(button);
    page(panel);
    await tick();
    panel.enabled = false;
    expect((button.element as HTMLButtonElement).disabled).toBe(true);
    expect(panel.element.getAttribute('tabindex')).toBe('-1');
    expect(button.isEnabled).toBe(false);
    panel.enabled = true;
    expect((button.element as HTMLButtonElement).disabled).toBe(false);
    expect(panel.element.getAttribute('tabindex')).toBe('0');
  });
});
