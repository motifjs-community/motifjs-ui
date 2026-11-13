import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { Autocomplete } from './Autocomplete';
import { ComboBox } from './ComboBox';
import { dataKinds } from '../../../tests/data-kinds';

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

function type(c: { inputPart: { element: HTMLInputElement } }, text: string) {
  c.inputPart.element.value = text;
  c.inputPart.element.dispatchEvent(new InputEvent('input', { bubbles: true }));
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
    const input = c.inputPart.element;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    input.focus();
    type(c, 'an');
    await settle();
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

  it('reads functions over plain data again on reState, and writes a value set programmatically to x-model', async () => {
    const plain = { items: ['Ankara', 'Bursa'], city: 'Ankara' };
    const given = plain.items;
    const s = reactive({ city: null as string | null });
    let c!: ComboBox<string, string>;
    let m!: ComboBox<string, string>;
    const host = page(
      <ComboBox ref={(x: ComboBox<string, string>) => (c = x)} items={() => plain.items} value={() => plain.city} />,
      <ComboBox ref={(x: ComboBox<string, string>) => (m = x)} items={CITIES} x-model={() => s.city} />,
    );
    await settle();
    plain.items = ['Ankara', 'Bursa', 'Bolu'];
    plain.city = 'Bolu';
    await settle();
    expect(c.inputPart.element.value).toBe('Ankara');
    host.reState();
    await settle();
    expect(c.inputPart.element.value).toBe('Bolu');
    c.inputPart.element.focus();
    type(c, 'b');
    await settle();
    expect(options(c)).toEqual(['Bursa', 'Bolu']);
    expect(given).toEqual(['Ankara', 'Bursa']);
    m.value = 'Bursa';
    expect(s.city).toBe('Bursa');
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
    expect(c.inputPart.element.value).toBe('Tea');
  });

  it('goes back to the chosen item when the text matches none, or keeps it as a custom value', async () => {
    let strict!: ComboBox<string, string>;
    const free = new ComboBox<string, string>({ items: CITIES, acceptCustomValue: true });
    page(<ComboBox ref={(x: ComboBox<string, string>) => (strict = x)} items={CITIES} value="İzmir" />, free);
    await settle();
    strict.inputPart.element.focus();
    type(strict, 'Nowhere');
    free.inputPart.element.focus();
    expect(strict.value).toBe('İzmir');
    expect(strict.inputPart.element.value).toBe('İzmir');

    type(free, 'bursa');
    press(free.inputPart.element, 'Escape');
    strict.inputPart.element.focus();
    expect(free.value).toBe('Bursa');
    free.inputPart.element.focus();
    type(free, 'Mersin');
    strict.inputPart.element.focus();
    expect(free.value).toBe('Mersin');
  });

  it('opens the whole list from the arrow or Alt+Down, and Escape closes it', async () => {
    let c!: ComboBox<string, string>;
    page(<ComboBox ref={(x: ComboBox<string, string>) => (c = x)} items={CITIES} value="Bursa" clearButton />);
    await settle();
    c.element.querySelector<HTMLButtonElement>('.mx-combo-box__arrow')!.click();
    await settle();
    expect(options(c).length).toBe(5);
    expect(active(c)).toBe('Bursa');
    expect(press(c.inputPart.element, 'Escape')).toBe(true);
    expect(c.opened).toBe(false);
    press(c.inputPart.element, 'ArrowDown', { altKey: true });
    expect(c.opened).toBe(true);
    press(c.inputPart.element, 'Escape');
    expect(press(c.inputPart.element, 'Escape')).toBe(true);
    expect(c.value).toBeNull();
    expect(c.inputPart.element.value).toBe('');
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
    expect(c.inputPart.element.value).toBe('Customer 250');

    c.inputPart.element.focus();
    type(c, '12');
    await settle(20);
    expect(c.listItems.count).toBe(13);
    expect(options(c).slice(0, 3)).toEqual(['Customer 012', 'Customer 112', 'Customer 120']);
    press(c.inputPart.element, 'ArrowDown');
    press(c.inputPart.element, 'Enter');
    expect(c.value).toBe(112);
  });

  it('suggests text with Autocomplete, the value being the text', async () => {
    const s = reactive({ q: '' });
    let a!: Autocomplete<string>;
    page(<Autocomplete ref={(x: Autocomplete<string>) => (a = x)} items={CITIES} x-model={() => s.q} />);
    await settle();
    expect(a.element.querySelector('.mx-combo-box__arrow')).toBeNull();
    a.inputPart.element.focus();
    type(a, 'iz');
    await settle();
    expect(options(a)).toEqual(['İzmir']);
    press(a.inputPart.element, 'Enter');
    expect(s.q).toBe('İzmir');
    type(a, 'anything');
    press(a.inputPart.element, 'Enter');
    expect(s.q).toBe('anything');
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const cities = make([{ id: 1, name: 'Ankara' }, { id: 2, name: 'Bursa' }]);
      const form = reactive({ city: null as { id: number; name: string } | null });
      const changed = vi.fn();
      let c!: ComboBox<{ id: number; name: string }, { id: number; name: string }>;
      page(
        <ComboBox
          ref={(x: ComboBox<{ id: number; name: string }, { id: number; name: string }>) => (c = x)}
          items={cities}
          textField="name"
          x-model={() => form.city}
          onValueChanged={changed}
        />,
      );
      await settle();
      changed.mockClear();
      c.open();
      await settle();
      c.element.querySelectorAll<HTMLElement>('[role="option"]')[1].click();
      await settle();
      expect(c.value).toBe(cities[1]);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][0].value).toBe(cities[1]);
      expect(c.inputPart.element.value).toBe('Bursa');

      cities[1].name = 'Bursa (TR)';
      cities.push({ id: 3, name: 'Konya' });
      await settle();
      expect(c.inputPart.element.value).toBe('Bursa');
      c.refresh();
      await settle();
      expect(c.inputPart.element.value).toBe('Bursa (TR)');
      c.open();
      await settle();
      expect(options(c)).toEqual(['Ankara', 'Bursa (TR)', 'Konya']);
    });
  });
});
