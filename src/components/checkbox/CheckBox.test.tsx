import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import { CheckBox } from './CheckBox';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

const message = (b: CheckBox) => b.element.querySelector('.mx-field__message')!.textContent;

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

describe('CheckBox', () => {
  it('is a native checkbox with its caption, the same in JSX and programmatically', async () => {
    let jsx!: CheckBox;
    page(<CheckBox ref={(b: CheckBox) => (jsx = b)} label="&Remember me" helpText="On this device" class="extra" />);
    const coded = new CheckBox({ label: 'Newsletter' });
    page(coded);
    await settle();

    const input = jsx.inputElement;
    const label = jsx.element.querySelector('label')!;
    expect(input.type).toBe('checkbox');
    expect(jsx.element.className).toContain('mx-check-box');
    expect(jsx.element.className).toContain('extra');
    expect(label.htmlFor).toBe(input.id);
    expect(label.textContent).toBe('Remember me');
    expect(input.getAttribute('aria-keyshortcuts')).toBe('Alt+R');
    expect(message(jsx)).toBe('On this device');
    expect({ ...jsx.element.dataset }).toMatchObject({ size: 'md', labelPosition: 'end', state: 'unchecked' });
    expect(jsx.value).toBe(false);

    coded.value = true;
    coded.size = 'lg';
    coded.labelPosition = 'start';
    coded.label = 'News';
    expect(coded.inputElement.checked).toBe(true);
    expect({ ...coded.element.dataset }).toMatchObject({ size: 'lg', labelPosition: 'start', state: 'checked' });
    expect(coded.element.querySelector('label')!.textContent).toBe('News');
  });

  it('binds the value two-way with x-model', async () => {
    const s = reactive({ on: true });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="On" x-model={() => s.on} />);
    await settle();
    expect(b.inputElement.checked).toBe(true);

    b.inputElement.click();
    expect(s.on).toBe(false);
    expect(b.value).toBe(false);
    expect(b.element.dataset.state).toBe('unchecked');

    s.on = true;
    await settle();
    expect(b.inputElement.checked).toBe(true);
  });

  it('reads functions over plain data again on reState, and writes a value set programmatically to x-model', async () => {
    const plain = { on: false, label: 'Remember me' };
    const s = reactive({ on: false });
    let b!: CheckBox;
    let m!: CheckBox;
    const host = page(
      <CheckBox ref={(x: CheckBox) => (b = x)} value={() => plain.on} label={() => plain.label} />,
      <CheckBox ref={(x: CheckBox) => (m = x)} x-model={() => s.on} />,
    );
    await settle();
    Object.assign(plain, { on: true, label: 'Keep me signed in' });
    await settle();
    expect(b.inputElement.checked).toBe(false);
    host.reState();
    expect(b.inputElement.checked).toBe(true);
    expect(b.element.textContent).toContain('Keep me signed in');
    b.inputElement.click();
    expect(plain.on).toBe(true);
    m.value = true;
    expect(s.on).toBe(true);
    m.toggle();
    expect(s.on).toBe(false);
  });

  it('shows null as indeterminate and cycles three states on request', async () => {
    const s = reactive({ all: null as boolean | null, three: false });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="All" threeState={() => s.three} x-model={() => s.all} />);
    await settle();
    expect(b.value).toBe(null);
    expect(b.inputElement.indeterminate).toBe(true);
    expect(b.element.dataset.state).toBe('mixed');

    // Two states: indeterminate goes to checked, then back and forth.
    b.inputElement.click();
    expect(s.all).toBe(true);
    expect(b.inputElement.indeterminate).toBe(false);
    b.inputElement.click();
    expect(s.all).toBe(false);

    s.three = true;
    await settle();
    const seen: (boolean | null)[] = [];
    for (let i = 0; i < 3; i++) {
      b.inputElement.click();
      seen.push(s.all);
    }
    expect(seen).toEqual([true, null, false]);
    expect(b.inputElement.checked).toBe(false);
    expect(b.inputElement.indeterminate).toBe(false);
  });

  it('reports changes with null as it is, by the user and by code', async () => {
    const s = reactive({ v: false as boolean | null });
    const seen: ValueChangedEventArgs<boolean | null>[] = [];
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} threeState value={() => s.v} onValueChanged={(e) => seen.push(e)} />);
    await settle();
    s.v = null;
    await settle();
    b.inputElement.click();
    b.inputElement.click();
    expect(seen.map((e) => [e.previousValue, e.value, e.byUser])).toEqual([
      [false, null, false],
      [null, false, true],
      [false, true, true],
    ]);
  });

  it('is read-only: focusable, but a click or Space changes nothing', async () => {
    const s = reactive({ on: false, ro: true });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="Locked" readOnly={() => s.ro} x-model={() => s.on} />);
    await settle();
    expect(b.inputElement.getAttribute('aria-readonly')).toBe('true');
    expect(b.element.hasAttribute('data-readonly')).toBe(true);
    expect(b.focus()).toBe(true);
    b.inputElement.click();
    b.element.querySelector('label')!.click();
    expect(s.on).toBe(false);
    expect(b.inputElement.checked).toBe(false);

    s.ro = false;
    await settle();
    expect(b.inputElement.hasAttribute('aria-readonly')).toBe(false);
    b.inputElement.click();
    expect(s.on).toBe(true);
  });

  it('is disabled with enabled={false}', async () => {
    const s = reactive({ on: true });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="Off" enabled={() => s.on} />);
    await settle();
    s.on = false;
    await settle();
    expect(b.inputElement.disabled).toBe(true);
    expect(b.element.hasAttribute('data-disabled')).toBe(true);
    expect(b.focus()).toBe(false);
  });

  it('toggles from its access key and programmatically', async () => {
    const s = reactive({ on: false });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="&Agree" x-model={() => s.on} />);
    await settle();
    press(document.body, 'a', { altKey: true, code: 'KeyA' });
    expect(document.activeElement).toBe(b.inputElement);
    expect(s.on).toBe(true);
    b.toggle();
    expect(s.on).toBe(false);
  });

  it('must be checked when required, with the message from uiLocale', async () => {
    const group = new ValidationGroup();
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} label="I accept" required validationGroup={group} />);
    await settle();
    expect(b.inputElement.getAttribute('aria-required')).toBe('true');
    expect(b.element.querySelector('.mx-field__required')).not.toBeNull();

    const result = await group.validate();
    expect(result.valid).toBe(false);
    expect(document.activeElement).toBe(b.inputElement);
    expect(message(b)).toBe('This field is required.');
    expect(b.inputElement.getAttribute('aria-invalid')).toBe('true');

    await uiLocale.use('tr');
    await settle();
    expect(message(b)).toBe('Bu alan zorunludur.');

    b.inputElement.click();
    await settle();
    expect(b.isValid).toBe(true);
    expect(message(b)).toBe('');
  });

  it('follows getter props and sends its name with a form', async () => {
    const s = reactive({ name: 'news', size: 'sm' as 'sm' | 'lg', place: 'end' as 'start' | 'end' });
    let b!: CheckBox;
    page(<CheckBox ref={(x: CheckBox) => (b = x)} name={() => s.name} size={() => s.size} labelPosition={() => s.place} />);
    await settle();
    expect(b.inputElement.name).toBe('news');
    s.name = 'letters';
    s.size = 'lg';
    s.place = 'start';
    await settle();
    expect(b.inputElement.name).toBe('letters');
    expect(b.element.dataset.size).toBe('lg');
    expect(b.element.dataset.labelPosition).toBe('start');
  });
});
