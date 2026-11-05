import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { TagBox } from './TagBox';
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

function type(c: { inputElement: HTMLInputElement }, text: string) {
  c.inputElement.value = text;
  c.inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

const options = (c: { element: HTMLElement }) => Array.from(c.element.querySelectorAll<HTMLElement>('[role="option"]'));
const texts = (c: { element: HTMLElement }) => options(c).map((o) => o.textContent);
const option = (c: { element: HTMLElement }, text: string) => options(c).find((o) => o.textContent === text)!;
const active = (c: { element: HTMLElement }) => c.element.querySelector('[role="option"][data-active]')?.textContent;
const checked = (c: { element: HTMLElement }) => options(c).filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.textContent);
const tags = (c: { element: HTMLElement }) => Array.from(c.element.querySelectorAll<HTMLElement>('[role="listitem"]'));
const tagTexts = (c: { element: HTMLElement }) => tags(c).map((t) => t.querySelector('.mx-tag-box__tag-text')?.textContent ?? t.textContent);

const SKILLS = ['CSS', 'HTML', 'JavaScript', 'Python', 'Rust', 'TypeScript'];

interface Row {
  id: number;
  name: string;
}
const ROWS: Row[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Row ${String(i + 1).padStart(4, '0')}` }));

describe('TagBox', () => {
  it('searches while typing, toggles items with Enter and keeps the list open', async () => {
    const s = reactive({ skills: ['CSS'] as string[] });
    let c!: TagBox<string, string>;
    page(<TagBox ref={(x: TagBox<string, string>) => (c = x)} label="&Skills" items={SKILLS} x-model={() => s.skills} />);
    await settle();
    const input = c.inputElement;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(c.element.querySelector('.mx-tag-box__tags')!.getAttribute('role')).toBe('list');
    expect(tagTexts(c)).toEqual(['CSS']);
    expect(tags(c)[0].querySelector('button')!.getAttribute('aria-label')).toBe('Remove CSS');

    input.focus();
    type(c, 'script');
    expect(c.opened).toBe(true);
    expect(c.element.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true');
    expect(texts(c)).toEqual(['JavaScript', 'TypeScript']);
    expect(active(c)).toBe('JavaScript');
    expect(input.getAttribute('aria-activedescendant')).toBe(option(c, 'JavaScript').id);
    const before = s.skills;
    press(input, 'Enter');
    expect(s.skills).toEqual(['CSS', 'JavaScript']);
    expect(before).toEqual(['CSS']);
    expect(input.value).toBe('');
    expect(c.opened).toBe(true);
    expect(texts(c)).toEqual(SKILLS);
    expect(checked(c)).toEqual(['CSS', 'JavaScript']);

    option(c, 'CSS').click();
    expect(s.skills).toEqual(['JavaScript']);
    expect(tagTexts(c)).toEqual(['JavaScript']);

    s.skills = ['Rust', 'HTML'];
    await settle();
    expect(tagTexts(c)).toEqual(['Rust', 'HTML']);
    expect(checked(c)).toEqual(['HTML', 'Rust']);
  });

  it('reads functions over plain data again on reState, and writes a value set from code to x-model', async () => {
    const plain = { value: ['Ankara'] as string[] };
    const s = reactive({ cities: [] as string[] });
    let b!: TagBox<string, string>;
    let m!: TagBox<string, string>;
    const host = page(
      <TagBox ref={(x: TagBox<string, string>) => (b = x)} items={['Ankara', 'Bursa', 'İzmir']} value={() => plain.value} />,
      <TagBox ref={(x: TagBox<string, string>) => (m = x)} items={['Ankara', 'Bursa', 'İzmir']} x-model={() => s.cities} />,
    );
    await settle();
    const tags = (t: TagBox<string, string>) => Array.from(t.element.querySelectorAll('.mx-tag-box__tag-text')).map((e) => e.textContent);
    expect(tags(b)).toEqual(['Ankara']);
    plain.value = ['Ankara', 'Bursa'];
    await settle();
    expect(tags(b)).toEqual(['Ankara']);
    host.reState();
    await settle();
    expect(tags(b)).toEqual(['Ankara', 'Bursa']);
    m.value = ['İzmir'];
    expect([...s.cities]).toEqual(['İzmir']);
  });

  it('removes tags with Backspace, their buttons and the keys on a focused tag', async () => {
    const c = new TagBox<string, string>({ items: SKILLS, value: ['CSS', 'HTML', 'Rust', 'Python'] });
    page(c);
    await settle();
    const input = c.inputElement;
    input.focus();
    press(input, 'Backspace');
    expect(c.value).toEqual(['CSS', 'HTML', 'Rust']);
    tags(c)[1].querySelector('button')!.click();
    expect(c.value).toEqual(['CSS', 'Rust']);
    expect(document.activeElement).toBe(input);

    press(input, 'ArrowLeft');
    expect(document.activeElement).toBe(tags(c)[1]);
    press(tags(c)[1], 'ArrowLeft');
    expect(document.activeElement).toBe(tags(c)[0]);
    press(tags(c)[0], 'ArrowRight');
    expect(document.activeElement).toBe(tags(c)[1]);
    press(tags(c)[1], 'Delete');
    expect(c.value).toEqual(['CSS']);
    expect(document.activeElement).toBe(tags(c)[0]);
    press(tags(c)[0], 'ArrowRight');
    expect(document.activeElement).toBe(input);
  });

  it('shows the rest as "+N", limits the choice and hides the chosen items', async () => {
    const c = new TagBox<string, string>({ items: SKILLS, value: ['CSS', 'HTML', 'Rust', 'Python'], maxTags: 2, maxSelected: 4, hideSelected: true });
    page(c);
    await settle();
    expect(tagTexts(c)).toEqual(['CSS', 'HTML', '+2']);
    expect(tags(c)[2].title).toBe('Rust, Python');
    c.open();
    expect(texts(c)).toEqual(['JavaScript', 'TypeScript']);
    expect(option(c, 'JavaScript').getAttribute('aria-disabled')).toBe('true');
    option(c, 'JavaScript').click();
    expect(c.value.length).toBe(4);
    c.maxSelected = 0;
    option(c, 'JavaScript').click();
    expect(c.value).toEqual(['CSS', 'HTML', 'Rust', 'Python', 'JavaScript']);
    expect(texts(c)).toEqual(['TypeScript']);
    expect(tagTexts(c)).toEqual(['CSS', 'HTML', '+3']);
    c.maxTags = 0;
    expect(tagTexts(c).length).toBe(5);
  });

  it('adds typed text as a tag with acceptCustomValue', async () => {
    const s = reactive({ tags: [] as string[] });
    let c!: TagBox<string, string>;
    page(
      <TagBox
        ref={(x: TagBox<string, string>) => (c = x)}
        items={SKILLS}
        acceptCustomValue
        customValue={(text: string) => (text.length > 1 ? text.toUpperCase() : null)}
        x-model={() => s.tags}
      />,
    );
    await settle();
    c.inputElement.focus();
    type(c, 'go');
    press(c.inputElement, 'Enter');
    expect(s.tags).toEqual(['GO']);
    type(c, 'x');
    press(c.inputElement, 'Enter');
    expect(s.tags).toEqual(['GO']);
    type(c, 'rust');
    press(c.inputElement, 'Enter');
    expect(s.tags).toEqual(['GO', 'Rust']);
    type(c, 'Ty');
    press(c.inputElement, 'ArrowDown');
    expect(active(c)).toBe('TypeScript');
    press(c.inputElement, 'Enter');
    expect(s.tags).toEqual(['GO', 'Rust', 'TypeScript']);
  });

  it('has a "Select all" row and closes on a choice with closeOnSelect', async () => {
    const c = new TagBox<string, string>({ items: SKILLS, selectAll: true, closeOnSelect: true });
    page(c);
    await settle();
    c.inputElement.focus();
    press(c.inputElement, 'ArrowDown');
    expect(c.opened).toBe(true);
    expect(active(c)).toBe('Select all');
    press(c.inputElement, 'Enter');
    await settle();
    expect(c.value).toEqual(SKILLS);
    expect(c.opened).toBe(false);
    c.open();
    expect(option(c, 'Select all').getAttribute('aria-selected')).toBe('true');
    option(c, 'CSS').click();
    c.open();
    expect(option(c, 'Select all').hasAttribute('data-mixed')).toBe(true);
    option(c, 'Select all').click();
    await settle();
    expect(c.value.length).toBe(6);
  });

  it('works with a data source in blocks and finds the tags of values not loaded', async () => {
    const source = new data.DataSource<Row, number>({
      adapter: new data.ArrayAdapter({ data: ROWS, key: 'id' }),
      loadMode: 'blocks',
      pageSize: 50,
      searchFields: ['name'],
    });
    let c!: TagBox<Row, number>;
    page(<TagBox ref={(x: TagBox<Row, number>) => (c = x)} dataSource={source} textField="name" valueField="id" searchDelay={0} value={[4321]} />);
    await settle(30);
    expect(tagTexts(c)).toEqual(['Row 4321']);
    expect(c.selectedItems.map((r) => r.name)).toEqual(['Row 4321']);
    c.inputElement.focus();
    type(c, '0012');
    await settle(30);
    expect(c.listItems.count).toBe(1);
    expect(texts(c)).toEqual(['Row 0012']);
    press(c.inputElement, 'Enter');
    expect(c.value).toEqual([4321, 12]);
    expect(tagTexts(c)).toEqual(['Row 4321', 'Row 0012']);
    c.open();
    await settle(30);
    expect(options(c).length).toBeLessThan(100);
  });

  it('is complete from code, follows uiLocale and checks required', async () => {
    const c = new TagBox<string, string>({ label: 'Skills', placeholder: 'Pick some', clearButton: true });
    page(c);
    await settle();
    expect(c.inputElement.placeholder).toBe('Pick some');
    c.items = SKILLS;
    c.value = ['CSS', 'HTML'];
    expect(c.inputElement.hasAttribute('placeholder')).toBe(false);
    await uiLocale.use('tr');
    await settle();
    expect(tags(c)[0].querySelector('button')!.getAttribute('aria-label')).toBe('CSS öğesini kaldır');
    c.element.querySelector<HTMLButtonElement>('.mx-tag-box__clear')!.click();
    expect(c.value).toEqual([]);
    c.required = true;
    expect(await c.validate()).toBe(false);
    expect(c.inputElement.getAttribute('aria-invalid')).toBe('true');
    c.readOnly = true;
    expect(c.open()).toBe(false);
    c.readOnly = false;
    c.showDropDownButton = false;
    expect(c.element.querySelector('.mx-tag-box__arrow')).toBeNull();
    c.inputElement.focus();
    press(c.inputElement, 'ArrowDown');
    expect(c.opened).toBe(true);
    press(c.inputElement, 'Escape');
    expect(c.opened).toBe(false);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('gives back the very items, and shows a change in place after refresh()', async () => {
      const skills = make([{ name: 'CSS' }, { name: 'HTML' }]);
      const form = reactive({ picked: [] as { name: string }[] });
      const changed = vi.fn();
      let c!: TagBox<{ name: string }, { name: string }>;
      page(<TagBox ref={(x: TagBox<{ name: string }, { name: string }>) => (c = x)} items={skills} textField="name" x-model={() => form.picked} onValueChanged={changed} />);
      await settle();
      changed.mockClear();
      c.open();
      option(c, 'HTML').click();
      await settle();
      expect(c.value[0]).toBe(skills[1]);
      expect(c.selectedItems[0]).toBe(skills[1]);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(tagTexts(c)).toEqual(['HTML']);

      skills[1].name = 'HTML5';
      skills.push({ name: 'Rust' });
      await settle();
      expect(tagTexts(c)).toEqual(['HTML']);
      c.refresh();
      await settle();
      expect(tagTexts(c)).toEqual(['HTML5']);
      expect(texts(c)).toEqual(['CSS', 'HTML5', 'Rust']);
      expect(checked(c)).toEqual(['HTML5']);
      option(c, 'HTML5').click();
      await settle();
      expect(c.value).toEqual([]);
      expect(tagTexts(c)).toEqual([]);
    });
  });
});
