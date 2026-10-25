import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Autocomplete } from './Autocomplete';
import { ComboBox } from './ComboBox';

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

async function settle(rounds = 8) {
  for (let i = 0; i < rounds; i++) await tick();
}

function type(c: { inputElement: HTMLInputElement }, text: string) {
  c.inputElement.value = text;
  c.inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

const options = (c: { element: HTMLElement }) => Array.from(c.element.querySelectorAll<HTMLElement>('[role="option"]')).map((o) => o.textContent);
const active = (c: { element: HTMLElement }) => c.element.querySelector('[role="option"][data-active]')?.textContent;

const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir'];

interface Customer {
  id: number;
  name: string;
}
const CUSTOMERS: Customer[] = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, name: `Customer ${String(i + 1).padStart(3, '0')}` }));

describe('ComboBox', () => {
  it('filters the list while typing and takes the highlighted item with Enter', async () => {
    const s = reactive({ city: null as string | null });
    let c!: ComboBox<string, string>;
    page(<ComboBox ref={(x: ComboBox<string, string>) => (c = x)} label="&City" items={CITIES} x-model={() => s.city} />);
    await settle();
    const input = c.inputElement;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    input.focus();
    type(c, 'an');
    expect(c.opened).toBe(true);
    expect(options(c)).toEqual(['Ankara', 'Antalya', 'İstanbul']);
    expect(active(c)).toBe('Ankara');
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    press(input, 'ArrowDown');
    expect(active(c)).toBe('Antalya');
    press(input, 'Enter');
    expect(s.city).toBe('Antalya');
    expect(input.value).toBe('Antalya');
    expect(c.opened).toBe(false);

    s.city = 'Bursa';
    await settle();
    expect(input.value).toBe('Bursa');
  });

  it('shows the text of an object value given before its items', async () => {
    const products = [
      { id: 1, name: 'Coffee' },
      { id: 2, name: 'Tea' },
    ];
    const s = reactive({ product: 2 as number | null });
    let c!: ComboBox<(typeof products)[number], number>;
    page(<ComboBox ref={(x: ComboBox<(typeof products)[number], number>) => (c = x)} value={() => s.product} items={products} textField="name" valueField="id" />);
    await settle();
    expect(c.inputElement.value).toBe('Tea');
  });

  it('goes back to the chosen item when the text matches none, or keeps it as a custom value', async () => {
    let strict!: ComboBox<string, string>;
    const free = new ComboBox<string, string>({ items: CITIES, acceptCustomValue: true });
    page(<ComboBox ref={(x: ComboBox<string, string>) => (strict = x)} items={CITIES} value="İzmir" />, free);
    await settle();
    strict.inputElement.focus();
    type(strict, 'Nowhere');
    free.inputElement.focus();
    expect(strict.value).toBe('İzmir');
    expect(strict.inputElement.value).toBe('İzmir');

    type(free, 'bursa');
    press(free.inputElement, 'Escape');
    strict.inputElement.focus();
    expect(free.value).toBe('Bursa');
    free.inputElement.focus();
    type(free, 'Mersin');
    strict.inputElement.focus();
    expect(free.value).toBe('Mersin');
  });

  it('opens the whole list from the arrow or Alt+Down, and Escape closes it', async () => {
    let c!: ComboBox<string, string>;
    page(<ComboBox ref={(x: ComboBox<string, string>) => (c = x)} items={CITIES} value="Bursa" clearButton />);
    await settle();
    c.element.querySelector<HTMLButtonElement>('.mx-combo-box__arrow')!.click();
    expect(options(c).length).toBe(5);
    expect(active(c)).toBe('Bursa');
    expect(press(c.inputElement, 'Escape')).toBe(true);
    expect(c.opened).toBe(false);
    press(c.inputElement, 'ArrowDown', { altKey: true });
    expect(c.opened).toBe(true);
    press(c.inputElement, 'Escape');
    expect(press(c.inputElement, 'Escape')).toBe(true);
    expect(c.value).toBeNull();
    expect(c.inputElement.value).toBe('');
  });

  it('searches a data source on the server side and finds the value on no loaded page', async () => {
    const source = new data.DataSource<Customer, number>({
      adapter: new data.ArrayAdapter({ data: CUSTOMERS, key: 'id' }),
      loadMode: 'blocks',
      pageSize: 50,
      searchFields: ['name'],
    });
    let c!: ComboBox<Customer, number>;
    page(<ComboBox ref={(x: ComboBox<Customer, number>) => (c = x)} dataSource={source} textField="name" valueField="id" searchDelay={0} value={250} />);
    await settle(20);
    expect(c.inputElement.value).toBe('Customer 250');

    c.inputElement.focus();
    type(c, '12');
    await settle(20);
    expect(c.listItems.count).toBe(13);
    expect(options(c).slice(0, 3)).toEqual(['Customer 012', 'Customer 112', 'Customer 120']);
    press(c.inputElement, 'ArrowDown');
    press(c.inputElement, 'Enter');
    expect(c.value).toBe(112);
  });

  it('suggests text with Autocomplete, the value being the text', async () => {
    const s = reactive({ q: '' });
    let a!: Autocomplete<string>;
    page(<Autocomplete ref={(x: Autocomplete<string>) => (a = x)} items={CITIES} x-model={() => s.q} />);
    await settle();
    expect(a.element.querySelector('.mx-combo-box__arrow')).toBeNull();
    a.inputElement.focus();
    type(a, 'iz');
    expect(options(a)).toEqual(['İzmir']);
    press(a.inputElement, 'Enter');
    expect(s.q).toBe('İzmir');
    type(a, 'anything');
    press(a.inputElement, 'Enter');
    expect(s.q).toBe('anything');
  });
});
