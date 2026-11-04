import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { ButtonGroup } from './ButtonGroup';

const hosts: Component[] = [];

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
  for (let i = 0; i < 4; i++) await tick();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGroup = ButtonGroup<any>;
const faces = (g: AnyGroup) => g.buttons.map((b) => (b.element.matches('.mx-button__face') ? b.element : b.element.querySelector<HTMLElement>('.mx-button__face')!));
const press = (g: AnyGroup, i: number) => faces(g)[i].click();
const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

describe('ButtonGroup', () => {
  it('chooses one, the same from JSX and from code; the chosen one stays chosen unless allowEmpty', async () => {
    let jsx!: ButtonGroup<unknown>;
    const seen: unknown[] = [];
    page(<ButtonGroup ref={(g: ButtonGroup<unknown>) => (jsx = g)} label="Align" items={['Left', 'Center', 'Right']} value="Left" onValueChanged={(e) => seen.push(e.value)} />);
    const coded = new ButtonGroup({ items: ['A', 'B'], allowEmpty: true });
    page(coded);
    await settle();
    expect(jsx.element.getAttribute('role')).toBe('group');
    expect(jsx.element.getAttribute('aria-label')).toBe('Align');
    expect(jsx.element.hasAttribute('data-attached')).toBe(true);
    expect(jsx.buttons.map((b) => b.text)).toEqual(['Left', 'Center', 'Right']);
    expect(faces(jsx).map((f) => f.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    press(jsx, 2);
    expect(jsx.value).toBe('Right');
    expect(faces(jsx).map((f) => f.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    press(jsx, 2);
    expect(jsx.value).toBe('Right');
    expect(faces(jsx)[2].getAttribute('aria-pressed')).toBe('true');
    expect(seen).toEqual(['Right']);
    press(coded, 0);
    press(coded, 0);
    expect(coded.value).toBe(null);
  });

  it('turns several on and off, giving a new array each time', async () => {
    const given = ['b'];
    const group = new ButtonGroup({ selection: 'multiple', items: [{ value: 'b', text: 'Bold' }, { value: 'i', text: 'Italic' }], value: given });
    page(group);
    await settle();
    press(group, 1);
    expect(group.value).toEqual(['b', 'i']);
    expect(given).toEqual(['b']);
    press(group, 0);
    expect(group.value).toEqual(['i']);
    expect(faces(group).map((f) => f.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
  });

  it('reads items of your own shape, and follows them as functions', async () => {
    const s = reactive({ label: 'Day' });
    const group = new ButtonGroup<unknown>({ items: [{ id: 1, name: () => s.label }, { id: 2, name: 'Week' }], itemText: 'name', itemValue: 'id', value: 2 });
    page(group);
    await settle();
    expect(group.buttons.map((b) => b.text)).toEqual(['Day', 'Week']);
    expect(group.isSelected(2)).toBe(true);
    s.label = 'Today';
    await settle();
    expect(group.buttons[0].text).toBe('Today');
  });

  it('only acts without selection, and is one Tab stop the arrow keys move in', async () => {
    const clicked: unknown[] = [];
    const group = new ButtonGroup({ selection: 'none', items: ['Cut', 'Copy', { value: 'Paste', enabled: false }, 'Delete'], onItemClick: (e) => clicked.push(e.value) });
    page(group);
    await settle();
    expect(group.buttons[2].text).toBe('Paste');
    press(group, 1);
    expect(clicked).toEqual(['Copy']);
    expect(faces(group)[1].hasAttribute('aria-pressed')).toBe(false);
    expect(group.buttons.map((b) => b.tabStop)).toEqual([true, false, false, false]);
    // Tab comes back to the button focused last.
    faces(group)[1].focus();
    expect(group.buttons.map((b) => b.tabStop)).toEqual([false, true, false, false]);
    key(faces(group)[1], 'ArrowRight');
    expect(document.activeElement).toBe(faces(group)[3]);
    key(faces(group)[3], 'Home');
    expect(document.activeElement).toBe(faces(group)[0]);
    expect(group.buttons[0].tabStop).toBe(true);
  });
});
