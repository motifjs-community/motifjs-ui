import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { TextBox } from '../textbox/TextBox';
import { GroupBox } from './GroupBox';
import type { GroupBoxToggledEventArgs } from './group-box-toggled-event-args';

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

describe('GroupBox', () => {
  it('is a fieldset named by its legend, in JSX and programmatically', async () => {
    let box!: GroupBox;
    page(
      <GroupBox ref={(b: GroupBox) => (box = b)} title="&Address" gap="xs" padding={12}>
        <TextBox label="Street" />
        <TextBox label="City" />
      </GroupBox>,
    );
    await tick();
    const el = box.element;
    expect(el.tagName).toBe('FIELDSET');
    expect(el.className).toContain('mx-group-box');
    expect(el.dataset.variant).toBe('outline');
    const legend = el.firstElementChild as HTMLLegendElement;
    expect(legend.tagName).toBe('LEGEND');
    expect(legend.textContent).toBe('Address');
    expect(legend.querySelector('.mx-access-key')?.textContent).toBe('A');
    expect(el.getAttribute('aria-keyshortcuts')).toBe('Alt+A');
    expect(el.querySelectorAll('input').length).toBe(2);
    expect(el.style.getPropertyValue('--_gap')).toBe('var(--mx-layout-space-xs)');
    expect(el.style.paddingInlineStart).toBe('12px');
    expect(box.title).toBe('&Address');

    const coded = new GroupBox({ title: 'Delivery', variant: 'plain' });
    coded.controls.add(new TextBox({ label: 'Note' }));
    page(coded);
    await tick();
    expect(coded.legendPart.element.textContent).toBe('Delivery');
    expect(coded.element.dataset.variant).toBe('plain');
    coded.title = 'Shipping';
    expect(coded.legendPart.element.textContent).toBe('Shipping');
    expect(coded.element.lastElementChild?.querySelector('label')?.textContent).toContain('Note');
  });

  it('disables everything inside, natively', async () => {
    const s = reactive({ on: true });
    let box!: GroupBox;
    page(
      <GroupBox ref={(b: GroupBox) => (box = b)} title="Card" enabled={() => s.on}>
        <TextBox label="Number" />
      </GroupBox>,
    );
    await tick();
    const input = box.element.querySelector('input')!;
    s.on = false;
    await tick();
    expect(box.element.disabled).toBe(true);
    expect(input.disabled).toBe(true);
    expect(box.element.hasAttribute('data-disabled')).toBe(true);
    s.on = true;
    await tick();
    expect(box.element.disabled).toBe(false);
    expect(input.disabled).toBe(false);
  });

  it('the access key focuses the first control inside, opening a collapsed box', async () => {
    let box!: GroupBox;
    page(
      <GroupBox ref={(b: GroupBox) => (box = b)} title="&Payment" collapsible collapsed>
        <TextBox label="Card" />
      </GroupBox>,
    );
    await tick();
    expect(box.element.hasAttribute('data-collapsed')).toBe(true);
    expect(box.onAccessKey()).toBe(true);
    expect(box.collapsed).toBe(false);
    expect(document.activeElement).toBe(box.element.querySelector('input'));
  });

  it('collapses with its title button and reports it', async () => {
    const s = reactive({ open: true, collapsible: true });
    const seen: GroupBoxToggledEventArgs[] = [];
    let box!: GroupBox;
    page(
      <GroupBox ref={(b: GroupBox) => (box = b)} title="More" collapsible={() => s.collapsible} collapsed={() => !s.open} onToggled={(e: GroupBoxToggledEventArgs) => seen.push(e)}>
        <TextBox label="Inside" />
      </GroupBox>,
    );
    await tick();
    const toggle = box.element.querySelector<HTMLButtonElement>('.mx-group-box__toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent).toBe('More');
    box.element.querySelector('input')!.focus();
    toggle.click();
    expect(box.collapsed).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(seen.at(-1)).toMatchObject({ collapsed: true, byUser: true });

    s.open = false;
    await tick();
    s.open = true;
    await tick();
    expect(box.collapsed).toBe(false);
    expect(seen.at(-1)).toMatchObject({ collapsed: false, byUser: false });

    s.collapsible = false;
    await tick();
    expect(box.element.querySelector('.mx-group-box__toggle')).toBe(null);
    expect(box.legendPart.element.textContent).toBe('More');
    box.collapsed = true;
    expect(box.element.hasAttribute('data-collapsed')).toBe(false);
  });
});
