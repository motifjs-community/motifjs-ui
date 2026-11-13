import { Component, reactive, type ComponentBase } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { ListBox } from './ListBox';
import { dataKinds } from '../../../tests/data-kinds';

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

async function settle(rounds = 8) {
  for (let i = 0; i < rounds; i++) await tick();
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

function click(el: Element, init: MouseEventInit = {}) {
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, ...init }));
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
}

const listOf = (c: { element: HTMLElement }) => c.element.querySelector<HTMLElement>('[role="listbox"]')!;
const options = (c: { element: HTMLElement }) => Array.from(c.element.querySelectorAll<HTMLElement>('[role="option"]'));
const texts = (c: { element: HTMLElement }) => options(c).map((o) => o.textContent);
const option = (c: { element: HTMLElement }, text: string) => options(c).find((o) => o.textContent === text)!;
const active = (c: { element: HTMLElement }) => c.element.querySelector('[role="option"][data-active]')?.textContent;
const selected = (c: { element: HTMLElement }) => options(c).filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.textContent);

const CITIES = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir'];

interface Fruit {
  id: number;
  name: string;
  kind: string;
  ripe?: boolean;
}
const FRUITS: Fruit[] = [
  { id: 1, name: 'Apple', kind: 'Tree' },
  { id: 2, name: 'Cherry', kind: 'Tree' },
  { id: 3, name: 'Pear', kind: 'Tree', ripe: false },
  { id: 4, name: 'Melon', kind: 'Vine' },
  { id: 5, name: 'Grape', kind: 'Vine' },
];

interface Row {
  id: number;
  name: string;
}
const ROWS: Row[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Row ${String(i + 1).padStart(4, '0')}` }));

describe('ListBox', () => {
  it('is one focusable listbox that chooses with the keys and follows x-model', async () => {
    const s = reactive({ city: 'Bursa' as string | null });
    let c!: ListBox<string, string>;
    page(<ListBox ref={(x: ListBox<string, string>) => (c = x)} label="&City" items={CITIES} x-model={() => s.city} />);
    await settle();
    const list = listOf(c);
    expect(list.tabIndex).toBe(0);
    expect(list.getAttribute('aria-labelledby')).toBe(c.element.querySelector('label')!.id);
    expect(list.hasAttribute('aria-multiselectable')).toBe(false);
    expect(texts(c)).toEqual(CITIES);
    expect(selected(c)).toEqual(['Bursa']);

    list.focus();
    expect(active(c)).toBe('Bursa');
    expect(list.getAttribute('aria-activedescendant')).toBe(option(c, 'Bursa').id);
    press(list, 'ArrowDown');
    expect(s.city).toBe('İstanbul');
    press(list, 'Home');
    expect(s.city).toBe('Ankara');
    press(list, 'End');
    expect(s.city).toBe('İzmir');
    press(list, 'b');
    expect(s.city).toBe('Bursa');

    s.city = 'Antalya';
    await settle();
    expect(selected(c)).toEqual(['Antalya']);
  });

  it('reads functions over plain data again on reState, and writes a value set programmatically to x-model', async () => {
    const plain = { items: ['Red', 'Green'], value: 'Red' };
    const given = plain.items;
    const s = reactive({ color: null as string | null });
    let l!: ListBox<string, string>;
    let m!: ListBox<string, string>;
    const host = page(
      <ListBox ref={(x: ListBox<string, string>) => (l = x)} items={() => plain.items} value={() => plain.value} />,
      <ListBox ref={(x: ListBox<string, string>) => (m = x)} items={['Red', 'Green', 'Blue']} x-model={() => s.color} />,
    );
    await settle();
    plain.items = ['Red', 'Green', 'Blue'];
    plain.value = 'Blue';
    await settle();
    expect(texts(l)).toEqual(['Red', 'Green']);
    host.reState();
    await settle();
    expect(texts(l)).toEqual(['Red', 'Green', 'Blue']);
    expect(option(l, 'Blue').getAttribute('aria-selected')).toBe('true');
    expect(given).toEqual(['Red', 'Green']);
    m.value = 'Green';
    expect(s.color).toBe('Green');
  });

  it('chooses with Space only when selection does not follow focus', async () => {
    const c = new ListBox<string, string>({ items: CITIES, selectionFollowsFocus: false });
    page(c);
    await settle();
    const list = listOf(c);
    list.focus();
    press(list, 'ArrowDown');
    expect(c.value).toBeNull();
    press(list, ' ');
    expect(c.value).toBe('Antalya');
    click(option(c, 'İzmir'));
    expect(c.value).toBe('İzmir');
    expect(document.activeElement).toBe(list);
  });

  it('chooses several in multiple mode: Space, Shift + arrows, Ctrl + A, clicks', async () => {
    const s = reactive({ picked: [] as number[] });
    let c!: ListBox<Fruit, number>;
    page(
      <ListBox
        ref={(x: ListBox<Fruit, number>) => (c = x)}
        items={FRUITS}
        textField="name"
        valueField="id"
        enabledField={(f: Fruit) => f.ripe !== false}
        selectionMode="multiple"
        x-model={() => s.picked}
      />,
    );
    await settle();
    const list = listOf(c);
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(c.element.hasAttribute('data-check-boxes')).toBe(true);
    expect(option(c, 'Pear').getAttribute('aria-disabled')).toBe('true');
    list.focus();
    expect(active(c)).toBe('Apple');
    press(list, ' ');
    expect(s.picked).toEqual([1]);
    const first = s.picked;
    press(list, 'ArrowDown', { shiftKey: true });
    expect(s.picked).toEqual([1, 2]);
    expect(first).toEqual([1]);
    press(list, 'ArrowDown');
    expect(active(c)).toBe('Melon');
    press(list, ' ');
    press(list, ' ');
    expect(s.picked).toEqual([1, 2]);

    press(list, 'a', { ctrlKey: true });
    expect(s.picked).toEqual([1, 2, 4, 5]);
    press(list, 'a', { ctrlKey: true });
    expect(s.picked).toEqual([]);

    click(option(c, 'Cherry'));
    click(option(c, 'Grape'));
    expect(s.picked).toEqual([2, 5]);
    click(option(c, 'Grape'));
    expect(s.picked).toEqual([2]);
    click(option(c, 'Melon'), { shiftKey: true });
    expect(s.picked).toEqual([2, 4, 5]);
  });

  it('replaces the choice on a plain click without check boxes; Ctrl + click adds', async () => {
    const c = new ListBox<string, string>({ items: CITIES, selectionMode: 'multiple', showCheckBoxes: false });
    page(c);
    await settle();
    expect(c.element.hasAttribute('data-check-boxes')).toBe(false);
    click(option(c, 'Bursa'));
    click(option(c, 'Ankara'));
    expect(c.value).toEqual(['Ankara']);
    click(option(c, 'İzmir'), { ctrlKey: true });
    expect(c.value).toEqual(['Ankara', 'İzmir']);
  });

  it('has a tri-state "Select all" row', async () => {
    const c = new ListBox<string, string>({ items: CITIES, selectionMode: 'multiple', selectAll: true, value: ['Bursa'] });
    page(c);
    await settle();
    const all = option(c, 'Select all');
    expect(all.hasAttribute('data-select-all')).toBe(true);
    expect(all.hasAttribute('data-mixed')).toBe(true);
    expect(all.getAttribute('aria-selected')).toBe('false');
    click(all);
    expect(c.value).toEqual(['Bursa', 'Ankara', 'Antalya', 'İstanbul', 'İzmir']);
    expect(option(c, 'Select all').getAttribute('aria-selected')).toBe('true');
    expect(option(c, 'Select all').hasAttribute('data-mixed')).toBe(false);
    click(option(c, 'Select all'));
    expect(c.value).toEqual([]);

    await uiLocale.use('tr');
    await settle();
    expect(texts(c)[0]).toBe('Tümünü seç');
    c.selectAll = false;
    await settle();
    expect(texts(c)).toEqual(CITIES);
  });

  it('groups items in memory and searches them', async () => {
    const c = new ListBox<Fruit, number>({ items: FRUITS, textField: 'name', valueField: 'id', groupField: 'kind', searchEnabled: true });
    page(c);
    await settle();
    expect(Array.from(c.element.querySelectorAll('.mx-list__header')).map((h) => h.textContent)).toEqual(['Tree', 'Vine']);
    expect(c.element.querySelectorAll('[role="group"]').length).toBe(2);
    const search = c.searchBox!;
    expect(search.element.nextElementSibling).toBe(listOf(c));
    expect(search.inputPart.element.getAttribute('aria-label') ?? search.element.querySelector('label')?.textContent).toBeTruthy();
    search.inputPart.element.value = 'pe';
    search.inputPart.element.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await settle();
    expect(texts(c)).toEqual(['Pear', 'Grape']);
    search.inputPart.element.focus();
    press(search.inputPart.element, 'ArrowDown');
    expect(document.activeElement).toBe(listOf(c));
    expect(active(c)).toBe('Pear');
    c.searchEnabled = false;
    await settle();
    expect(c.searchBox).toBeNull();
    expect(texts(c)).toEqual(['Apple', 'Cherry', 'Pear', 'Melon', 'Grape']);
  });

  it('draws only the rows in view from a data source in blocks and searches it', async () => {
    const source = new data.DataSource<Row, number>({
      adapter: new data.ArrayAdapter({ data: ROWS, key: 'id' }),
      loadMode: 'blocks',
      pageSize: 50,
      searchFields: ['name'],
    });
    let c!: ListBox<Row, number>;
    page(
      <ListBox
        ref={(x: ListBox<Row, number>) => (c = x)}
        dataSource={source}
        textField="name"
        valueField="id"
        selectionMode="multiple"
        selectAll
        searchEnabled
        searchDelay={0}
        value={[4000]}
      />,
    );
    await settle(30);
    expect(c.listItems.count).toBe(5000);
    expect(options(c).length).toBeLessThan(100);
    expect(texts(c)[0]).toBe('Select all');
    expect(option(c, 'Select all').hasAttribute('data-mixed')).toBe(true);
    await settle(30);
    expect(c.selectedItems.map((r) => r.name)).toEqual([]);
    await settle(30);
    expect(c.selectedItems.map((r) => r.name)).toEqual(['Row 4000']);

    const search = c.searchBox!;
    search.inputPart.element.value = '499';
    search.inputPart.element.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await settle(30);
    expect(c.listItems.count).toBe(15);
    await c.selectAllItems();
    expect((c.value as number[]).length).toBe(16);
    expect(option(c, 'Select all').getAttribute('aria-selected')).toBe('true');
  });

  it('is complete programmatically: properties, height, required, empty text', async () => {
    const c = new ListBox<string, string>({ label: 'Pick' });
    page(c);
    await settle();
    expect(listOf(c).querySelector('.mx-list__empty')?.textContent).toBe('No items');
    c.noItemsText = 'Nothing here';
    await settle();
    expect(listOf(c).querySelector('.mx-list__empty')?.textContent).toBe('Nothing here');
    c.items = CITIES;
    await settle();
    expect(texts(c)).toEqual(CITIES);
    c.height = 3;
    expect(listOf(c).style.blockSize).toContain('3');
    c.height = '10rem';
    expect(listOf(c).style.blockSize).toBe('10rem');
    c.required = true;
    expect(await c.validate()).toBe(false);
    expect(listOf(c).getAttribute('aria-invalid')).toBe('true');
    c.value = 'İzmir';
    expect(await c.validate()).toBe(true);
    c.readOnly = true;
    listOf(c).focus();
    press(listOf(c), 'ArrowDown');
    expect(c.value).toBe('İzmir');
    c.readOnly = false;
    c.enabled = false;
    expect(listOf(c).getAttribute('aria-disabled')).toBe('true');
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const people = make([{ name: 'Ada' }, { name: 'Linus' }, { name: 'Grace' }]);
      const form = reactive({ picked: [] as { name: string }[] });
      const changed = vi.fn();
      let c!: ListBox<{ name: string }, { name: string }>;
      page(
        <ListBox
          ref={(x: ListBox<{ name: string }, { name: string }>) => (c = x)}
          items={people}
          textField="name"
          selectionMode="multiple"
          x-model={() => form.picked}
          onValueChanged={changed}
        />,
      );
      await settle();
      changed.mockClear();
      click(option(c, 'Linus'));
      await settle();
      expect((c.value as unknown[])[0]).toBe(people[1]);
      expect(c.selectedItems[0]).toBe(people[1]);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][0].value[0]).toBe(people[1]);
      expect(selected(c)).toEqual(['Linus']);

      people[0].name = 'Ada L.';
      people.push({ name: 'Ken' });
      people.splice(2, 1);
      await settle();
      expect(texts(c)).toEqual(['Ada', 'Linus', 'Grace']);
      c.refresh();
      await settle();
      expect(texts(c)).toEqual(['Ada L.', 'Linus', 'Ken']);
      expect(selected(c)).toEqual(['Linus']);
      expect(c.selectedItem).toBe(people[1]);
    });

    it('keeps the rows and their texts when the items are given again, and draws a template once per row', async () => {
      const ada = { name: 'Ada' };
      const linus = { name: 'Linus' };
      const drawn = vi.fn((item: { name: string }, host: ComponentBase) => host.setText(item.name));
      let plain!: ListBox<{ name: string }>;
      let templated!: ListBox<{ name: string }>;
      page(
        <div>
          <ListBox ref={(x: ListBox<{ name: string }>) => (plain = x)} items={[ada, linus]} textField="name" />
          <ListBox ref={(x: ListBox<{ name: string }>) => (templated = x)} items={[ada, linus]} itemTemplate={drawn} />
        </div>,
      );
      await settle();
      const row = option(plain, 'Ada');
      const text = row.querySelector('.mx-list__text');
      expect(drawn).toHaveBeenCalledTimes(2);
      ada.name = 'Ada L.';
      plain.items = [ada, linus, { name: 'Ken' }];
      templated.items = [ada, linus, { name: 'Ken' }];
      await settle();
      expect(option(plain, 'Ada L.')).toBe(row);
      expect(row.querySelector('.mx-list__text')).toBe(text);
      expect(texts(plain)).toEqual(['Ada L.', 'Linus', 'Ken']);
      // Only the new row is drawn.
      expect(drawn).toHaveBeenCalledTimes(3);
    });
  });
});
