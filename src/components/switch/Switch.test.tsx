import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { Switch } from './Switch';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

const texts = (s: Switch) => s.element.querySelector('.mx-switch__text')!;

describe('Switch', () => {
  it('is a native checkbox with role="switch", the same from JSX and from code', async () => {
    let jsx!: Switch;
    page(<Switch ref={(s: Switch) => (jsx = s)} label="&Wi-Fi" helpText="Joins known networks" />);
    const coded = new Switch({ label: 'Bluetooth' });
    page(coded);
    await settle();

    const input = jsx.inputElement;
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(jsx.element.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-keyshortcuts')).toBe('Alt+W');
    expect(jsx.element.querySelector('.mx-switch__thumb')!.getAttribute('aria-hidden')).toBe('true');
    expect({ ...jsx.element.dataset }).toMatchObject({ size: 'md', state: 'unchecked', labelPosition: 'end', stateText: 'none' });

    coded.value = true;
    coded.size = 'sm';
    expect(coded.inputElement.checked).toBe(true);
    expect(coded.element.dataset.state).toBe('checked');
    expect(coded.element.dataset.size).toBe('sm');
  });

  it('binds the value two-way and reports who changed it', async () => {
    const s = reactive({ on: false });
    const seen: ValueChangedEventArgs<boolean>[] = [];
    let sw!: Switch;
    page(<Switch ref={(x: Switch) => (sw = x)} x-model={() => s.on} />);
    await settle();
    sw.onValueChanged((e) => seen.push(e));
    sw.inputElement.click();
    expect(s.on).toBe(true);
    s.on = false;
    await settle();
    expect(sw.inputElement.checked).toBe(false);
    expect(seen.map((e) => [e.value, e.byUser])).toEqual([
      [true, true],
      [false, false],
    ]);
  });

  it('flips with Enter as well as with Space, not when read-only', async () => {
    const s = reactive({ on: false, ro: false });
    let sw!: Switch;
    page(<Switch ref={(x: Switch) => (sw = x)} readOnly={() => s.ro} x-model={() => s.on} />);
    await settle();
    expect(press(sw.inputElement, 'Enter')).toBe(true);
    expect(s.on).toBe(true);
    s.ro = true;
    await settle();
    press(sw.inputElement, 'Enter');
    sw.inputElement.click();
    expect(s.on).toBe(true);
    expect(sw.inputElement.getAttribute('aria-readonly')).toBe('true');
  });

  it('shows its on / off text inside the track, beside it or not at all', async () => {
    const s = reactive({ where: 'inside' as 'inside' | 'beside' | 'none', on: 'On' });
    let sw!: Switch;
    page(<Switch ref={(x: Switch) => (sw = x)} onText={() => s.on} offText="Off" showStateText={() => s.where} />);
    await settle();
    expect(texts(sw).textContent).toBe('OnOff');
    expect(texts(sw).getAttribute('aria-hidden')).toBe('true');
    expect(sw.element.dataset.stateText).toBe('inside');
    s.where = 'beside';
    s.on = 'Yes';
    await settle();
    expect(sw.element.dataset.stateText).toBe('beside');
    expect(sw.element.querySelector('.mx-switch__on')!.textContent).toBe('Yes');
    s.where = 'none';
    await settle();
    expect(sw.element.dataset.stateText).toBe('none');
  });

  it('must be on when required', async () => {
    let sw!: Switch;
    page(<Switch ref={(x: Switch) => (sw = x)} label="Terms" required />);
    await settle();
    expect(await sw.validate()).toBe(false);
    expect(sw.element.querySelector('.mx-field__message')!.textContent).toBe('This field is required.');
    sw.inputElement.click();
    await settle();
    expect(sw.isValid).toBe(true);
  });

  it('flips from its access key, and is disabled with enabled={false}', async () => {
    const s = reactive({ on: false, enabled: true });
    let sw!: Switch;
    page(<Switch ref={(x: Switch) => (sw = x)} label="&Sync" enabled={() => s.enabled} x-model={() => s.on} />);
    await settle();
    press(document.body, 's', { altKey: true, code: 'KeyS' });
    expect(s.on).toBe(true);
    expect(document.activeElement).toBe(sw.inputElement);
    s.enabled = false;
    await settle();
    expect(sw.inputElement.disabled).toBe(true);
    press(document.body, 's', { altKey: true, code: 'KeyS' });
    expect(s.on).toBe(true);
  });
});
